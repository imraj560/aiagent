import { embed, generateText, generateObject } from 'ai';
import {aiModel} from "./constants.js";
import { z } from 'zod';


import {
  KNOWLEDGE_BASE_DESCRIPTION,
  SIMILARITY_MATCH_COUNT,
  EMBEDDING_MODEL_NAME,
  ANSWERING_MODEL,
  CLASSIFICATION_MODEL,
} from './constants.js';
import {
  getClassificationPrompt,
  getGeneralPrompt,
  getFallbackPrompt,
  getRagPrompt,
} from './prompts.js';
import {combineDocuments} from "./utils.js"
import {openai, supabase} from "./config.js"


export async function classifyAndRetrieve(question) {
  console.log(`[Normal] Received question: ${question}`);

  try {
    // 1. Classify Question Type
    console.log('[Normal] Classifying question...');
    const classificationPrompt = getClassificationPrompt(
      question,
      KNOWLEDGE_BASE_DESCRIPTION
    );


    const {object: classification} = await generateObject({
      model: aiModel,
      schemaName: 'retrieval_classification',
      schemaDescription: 'Classify the query',
      /**
       * 1. Construct the schema using enum type for 'RETRIEVAL' and 'GENERAL'
       * 2. Add a property for the prompt sent to the model
       * 
       */
      schema: z.object({
        reasoning: z.string().describe('brief reasoning for the classification choice'),
        type: z.enum(['RETRIEVAL', 'GENERAL']).describe('Is the question general or does it require knowledge base retrieval?')
      }),
      prompt: classificationPrompt,
    });


    const decision = classification.type.trim().toUpperCase()
    console.log(`classificationInfo: ${JSON.stringify(classification,null,2)}`);
    console.log(`classification type: ${classification.type.trim().toUpperCase()}`)

    // 2. Handle Based on Classification
    if (decision === 'GENERAL') {
      console.log('[Normal] Answering as a general question...');
      const generalPrompt = getGeneralPrompt(question);
      const { text: generalAnswer } = await generateText({
        model: openai(ANSWERING_MODEL),
        prompt: generalPrompt,
      });
      console.log('[Normal] Generated general answer.');
      return { answer: generalAnswer, sources: null };
    } else if (decision === 'RETRIEVAL') {
      console.log('[Normal] Performing retrieval...');
      const { embedding } = await embed({
        model: openai.textEmbeddingModel(EMBEDDING_MODEL_NAME),
        value: question,
      });
      console.log('[Normal] Generated question embedding.');

      const { data: documents, error: matchError } = await supabase.rpc(
        'match_documents',
        {
          query_embedding: embedding,
          match_count: SIMILARITY_MATCH_COUNT,
        }
      );

      if (matchError) {
        console.error('[Normal] Error matching documents:', matchError);
        throw new Error(`Failed to retrieve documents: ${matchError.message}`);
      }

      if (!documents || documents.length === 0) {
        console.log('[Normal] No relevant documents found.');
        const fallbackPrompt = getFallbackPrompt(
          question,
          KNOWLEDGE_BASE_DESCRIPTION
        );
        const { text: fallbackAnswer } = await generateText({
          model: openai(ANSWERING_MODEL),
          prompt: fallbackPrompt,
        });
        return { answer: fallbackAnswer, sources: null };
      }

      console.log(`[Normal] Retrieved ${documents.length} document chunks.`);
      const retrievedSources = documents;
      const contextString = combineDocuments(retrievedSources);

      const ragPrompt = getRagPrompt(
        contextString,
        question,
        KNOWLEDGE_BASE_DESCRIPTION
      );

      console.log('[Normal] Generating RAG answer...');
      const { text: ragAnswer } = await generateText({
        model: openai(ANSWERING_MODEL),
        prompt: ragPrompt,
      });
      console.log('[Normal] Generated RAG answer.');
      const typedSources = retrievedSources.map((source) => ({
        ...source,
        type: 'knowledgeBase',
      }));
      return { answer: ragAnswer, sources: typedSources };
    } else {
      console.warn(
        `[Normal] Unexpected classification result: ${classification}. Defaulting to general answer.`
      );
      const generalPrompt = getGeneralPrompt(question);
      const { text: generalAnswer } = await generateText({
        model: openai(ANSWERING_MODEL),
        prompt: generalPrompt,
      });
      return { answer: generalAnswer, sources: null };
    }
  } catch (error) {
    console.error('[Normal] Error in RAG process:', error);
    const errorAnswer =
      'I encountered an error while processing your request. Please try again later.';
    return { answer: errorAnswer, sources: null };
  }
}
