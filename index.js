import {webSearchRetrievalAgent} from "./webSearchRetrievalAgent.js"

const retrievalQuery = "How do I access the scrimba discord?"
const webSearchQuery = "What is the latest openai large language model?"

/**
 * CHALLENGE:
 * 
 * In the webSearchRetrievalAgent.js file:
 * 
 * 1. Implement the missing tools logic. Add the tools.
 * 2. Complete the empty generateText function logic
 */
async function main(query){
  const response = await webSearchRetrievalAgent(query)

  console.log(`\n\nGenerated answer: ${response.answer}\n\nRetrieval docs: ${response.sources ? JSON.stringify(response.sources, null, 2): null}`);

}

main(retrievalQuery)


