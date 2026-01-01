import { openai } from '@ai-sdk/openai';
import { generateText, tool, stepCountIs  } from 'ai';
import { z } from 'zod';


/**
 * Tools are actions that an LLM can invoke. The results of these actions can be reported back to the LLM to be considered in the next response.

 */

const model = openai('gpt-4o')

async function main(){

  // await basicWeatherToolCall()

   // await multipleToolCalls()

   await generateResponseFromToolCalls()
}

main()

async function basicWeatherToolCall(){
  const result = await generateText({
    model,
    tools: {
      weather: tool({
        description: 'Get the weather in a location',
        inputSchema: z.object({
          location: z.string().describe('The location to get the weather for'),
        }),
        /**
         * This is an optional async function called with the inputs the model generates from the tool call.
         */
        execute: async ({ location }) => ({
          location,
          temperature: 50 + Math.floor(Math.random() * 21) - 10, //random number
        }),
      }),
    },
    prompt: 'What is the weather in New York?',
});

   //input params passed into the execute function
  for (const toolCall of result.toolCalls) {
    console.log(toolCall)
   }

  // generated output from the function call
  for (const toolResults of result.toolResults) {
    console.log(toolResults)
   }

  //  console.log(`Full results object: ${JSON.stringify(result, null, 2)}`)
}


async function multipleToolCalls(){
  const result = await generateText({
    model,
    tools: {
      weather: tool({
        description: 'Get the weather in a location',
        inputSchema: z.object({
          location: z.string().describe('The location to get the weather for'),
        }),
        /**
         * This is an optional async function called with the inputs the model generates from the tool call.
         */
        execute: async ({ location }) => ({
          location,
          temperature: 50 + Math.floor(Math.random() * 21) - 10, //random number
        }),
      }),
      cityAttractions: tool({
        description: 'Get the tourist attractions',
        inputSchema: z.object({ city: z.string() }).describe('attractions in the city'),
        execute: async ({ city }) => ({
          city,
          attractions: ['Statue of Liberty', 'Central Park', 'Met Museum'],
        }),
      }),
    },
    prompt: 'What is the weather in New York and what are the best attractions to visit?',
   });

   //input params passed into the execute function
  for (const toolCall of result.toolCalls) {
    console.log(toolCall)
   }

  // generated output from the function call
  for (const toolResults of result.toolResults) {
    console.log(toolResults)
   }

  //  console.log(`Full results object: ${JSON.stringify(result, null, 2)}`)

}

/**
 * By default tool calls only return results returned by the execute function. In order to instruct the model to summarize the tool results, use the `stopWhen` property to tell the model to auto-loop. After tools run, send their results back into the model for another turn so it can use them and produce text. `stepCountIs(n)` puts a hard ceiling on how many model turns you trigger.
 */
async function generateResponseFromToolCalls(){
  const NUMBER_OF_STEPS = 3
  const weather = tool({
    description: 'Get the weather in a location',
    inputSchema: z.object({ location: z.string() }),
    execute: async ({ location }) => ({ location, temperature: 72 }),
  });

  const cityAttractions = tool({
    description: 'Get attractions for a city',
    inputSchema: z.object({ city: z.string() }),
    execute: async ({ city }) => ({ city, attractions: ['Central Park', 'Met Museum'] }),
  });

  const result = await generateText({
    model,
    tools: { weather, cityAttractions },
    stopWhen: stepCountIs(NUMBER_OF_STEPS), //  1) tools; 2) model summarizes
    prompt: 'What is the weather in New York and what are the best attractions to visit?',
   });


   // extract all tool calls from the steps:
   const allToolCalls = result.steps.flatMap(step => step.toolCalls);

   console.log(allToolCalls)

   console.log("\n\n")

  // generated output from the function call
  for (const toolResults of result.toolResults) {
    console.log(`Tool results: ${toolResults}`)
   }

  console.log(`Generated results: ${result.text}`)
}