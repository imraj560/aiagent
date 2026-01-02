import {classifyAndRetrieve} from "./agenticRetrieval.js"

/*
 Challenge: Introduce structured output classification to the agentic retrieval

 - Go to the agenticRetrieval.js file
 - As per the commented instructions, use the vercel ai sdk `generateObject` interface to construct a schema to classify 'RETRIEVAL' and 'GENERAL' query types.
 - Extract the generated object and relevant type, then assign to the 'decision' property


*/

const query = "How do I access Scrimba discord?"

async function main(query){
  const response = await classifyAndRetrieve(query)

  console.log(`\n\nGenerated answer: ${response.answer}\n\nRetrieval docs: ${response.sources ? JSON.stringify(response.sources, null, 2): null}`);

}

main(query)
