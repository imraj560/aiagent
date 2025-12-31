import {openai} from "./config.js"
import { generateText } from 'ai';
import { embed } from 'ai';


const EMBEDDING_MODEL_NAME = 'text-embedding-3-small'; 
const aiModel = openai("gpt-4o")

/*
  Challenge: Generate text and embeddings using the vercel ai sdk
    1. Use the `generateText` interface in generateResponse function to prompt the `aiModel` to create a recipe for your faviourite meal, then return the generated text.
    2. Call `generateResponse` function in the main function.
    3. Pass the textToEmbed into the generateEmbeddings function as a parameter.
    4. Use the `embed` interface to generate embeddings of the textToEmbed and log the embeddings
 */

async function main(){

  const textToEmbed = await generateResponse()

  await generateEmbeddings(textToEmbed)

}

main()


async function generateResponse(){
  /**
   *  Use the `generateText` interface in generateResponse function to prompt the `aiModel` to create a recipe for your faviourite meal.
   * 
   * return the generated text from the function
   */
  const {text} = await generateText({
    model: aiModel,
    prompt: 'Create a recipe for making a pepperoni pizza'
  })

  console.log(`Generated text: ${text}\n\n`)

  return text
}

async function generateEmbeddings(textToEmbed){
  /**
   * Use the `embed` interface to generate embeddings of the textToEmbed and log the embeddings
   */
  const {embedding} = await embed({
    model: openai.textEmbeddingModel(EMBEDDING_MODEL_NAME),
    value: textToEmbed,
  });

  console.log(`Embedding generated: ${embedding}`)
}