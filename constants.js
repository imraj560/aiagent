import {openai} from "./config.js"


export const SIMILARITY_MATCH_COUNT = 3
export const ANSWERING_MODEL = "gpt-4o"
export const EMBEDDING_MODEL_NAME = 'text-embedding-3-small'; 
export const CLASSIFICATION_MODEL = 'gpt-4o';
export const aiModel = openai(ANSWERING_MODEL)
export const KNOWLEDGE_BASE_DESCRIPTION =
  'Scrimba, an online platform for learning to code';
