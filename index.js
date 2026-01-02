import {retrieveSimilarDocs} from "./retrieveSimilarDocs.js"
import {getRagPrompt, combineDocuments} from "./utils.js"
import {aiModel} from "./constants.js"
import { generateText } from 'ai';
import {ingestDocuments} from "./upsertDocuments.js"
import {classifyAndRetrieve} from "./agenticRetrieval.js"

const query = "How do i access the scrimba discord?"

async function main(query){

  /* split text into chunks, embed and store into vector db */
  //await ingestDocuments()

  /* retrieve docs that contain content relevant to the query */
  //await basicRetrieval(query)

  /*classify user prompt to decide whether to initiate retrieval */
  const response = await classifyAndRetrieve(query)

  // console.log(`\n\nGenerated answer: ${response.answer}\n\nRetrieval docs: ${response.sources ? JSON.stringify(response.sources, null, 2): null}`);

}

main(query)


async function basicRetrieval(query){
  // retrieve docs that contain content relevant to the query
  const docs = await retrieveSimilarDocs(query);
  console.log(docs);

  const contextString = combineDocuments(docs);


  //create a prompt including context docs to send to the model
  const finalPrompt = getRagPrompt(contextString, query);

  //send prompt to model to generate response

  const {text} = await generateText({
    model: aiModel,
    prompt: finalPrompt
  })

  console.log(text);
}