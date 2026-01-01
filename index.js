import { openai } from '@ai-sdk/openai';
import { generateText, tool, stepCountIs } from 'ai';
import { z } from 'zod';

const model = openai('gpt-4o');


/**
 * Exercise: Tool Calling with Vercel AI SDK
 * 
 * Goals:
   1) Implement a single tool ("priceLookup") to get a grocery item's price.
   2) Implement two tools ("priceLookup" + "deliveryEta") and let the model call both.
   3) Use stopWhen(stepCountIs(...)) to let the model auto-loop and summarize tool results.

   Tips:
   - The "execute" function returns JSON that gets fed back to the model.
   - Use small, predictable data so you can verify behavior quickly.
   - Run one exercise at a time by uncommenting a call in main().
 */

// Simple in-memory data (pretend these came from a DB):
const PRICE_TABLE = {
  milk: 1.59,
  bread: 2.49,
  eggs: 3.29,
  apple: 0.89,
  banana: 0.59,
};

async function main() {
  // Uncomment the one you're working on:
  // await singleToolCallExercise();
  // await multipleToolCallsExercise();
  await summarizeWithStopWhenExercise();
}

main().catch(console.error);

// -----------------------------------------------------
// 1) SINGLE TOOL CALL
// -----------------------------------------------------
/*
  Challenge:
  Create a "priceLookup" tool that takes { item: string } and returns
  { item, price } using PRICE_TABLE.

  Steps:
    A) Define the tool with zod input (item: string).
    B) Call generateText with tools: { priceLookup }.
    C) Ask: "How much does milk cost?"
    D) Log result.toolCalls and result.toolResults to see the flow.
*/
async function singleToolCallExercise() {
  // TODO A: Define the tool (use z.object({ item: z.string() })).
  const priceLookup = tool({
    description: 'Return the price in USD for a grocery item.',
    inputSchema: z.object({
      item: z.string()
    }),
    execute: async ({ item }) => ({
      // TODO: read and return price from PRICE_TABLE (fallback to null if not found)
      item,
      price: PRICE_TABLE[item.toLowerCase()] ?? null
     }),
  });

  // TODO B & C: Ask for milk price and pass your tool into generateText
  const result = await generateText({
    model,
    tools: {
      priceLookup
    },
    prompt: 'How much does milk cost?',
  });

  // TODO D: Inspect what the model asked the tool to do and what came back
  console.log('--- Tool Calls ---');
  console.log(result.toolCalls);
  console.log('--- Tool Results ---');
  console.log(result.toolResults);

  console.log('\n--- Final Text ---');
  console.log(result.text);
}

// -----------------------------------------------------
// 2) MULTIPLE TOOL CALLS
// -----------------------------------------------------
/*
  Challenge:
  Add a second tool "deliveryEta" that takes { address: string }
  and returns a pretend ETA in minutes (e.g., between 20–40).

  Steps:
    A) Reuse priceLookup from above (copy it here if helpful).
    B) Add deliveryEta tool.
    C) Ask: "How much do milk and bread cost, and how long to deliver to 221B Baker Street?"
    D) Log toolCalls and toolResults to verify both are used.
*/
async function multipleToolCallsExercise() {
  const priceLookup = tool({
    description: 'Return the price in USD for a grocery item.',
    inputSchema: z.object({ item: z.string() }),
    execute: async ({ item }) => ({
      item,
      price: PRICE_TABLE[item.toLowerCase()] ?? null,
    }),
  });

  // TODO B: Define deliveryEta tool with input: { address: string }
  const deliveryEta = tool({
    description: 'Estimate delivery time in minutes to a given address.',
    inputSchema: z.object({
      address: z.string()
    }),
    execute: async ({address }) => {
      // Pretend calculation:
      const eta = 20 + Math.floor(Math.random() * 21); // 20–40 min
      return { address, etaMinutes: eta };
    },
  });

  // TODO C: Ask a question that likely triggers both tools
  const result = await generateText({
    model,
    tools: { priceLookup, deliveryEta },
    prompt:
      'How much do milk and bread cost, and how long to deliver to 221B Baker Street?',
  });

  // TODO D: Inspect tool calls/results
  console.log('--- Tool Calls ---');
  console.log(result.toolCalls);
  console.log('--- Tool Results ---');
  console.log(result.toolResults);

  console.log('\n--- Final Text ---');
  console.log(result.text);
}

// -----------------------------------------------------
// 3) AUTO-LOOP + SUMMARY WITH stopWhen
// -----------------------------------------------------
/*
  Challenge:
  Let the model call tools, receive results, and THEN summarize them in a second turn
  (without you manually looping). Use stopWhen(stepCountIs(NUM_STEPS)).

  Tools:
    - priceLookup({ item: string }) -> { item, price }
    - deliveryEta({ address: string }) -> { address, etaMinutes }

  Prompt:
    "I want to buy eggs and a banana. Use tools to check prices and tell me the
     total cost, then estimate delivery time to 221B Baker Street."

  Steps:
    A) Define both tools (can reuse).
    B) Call generateText with tools + stopWhen(stepCountIs(3)).
       Turn 1: model plans tool calls
       Turn 2: tools execute; results fed back
       Turn 3: model summarizes with a friendly final answer
    C) Print all intermediate steps and final summary.
*/
async function summarizeWithStopWhenExercise() {
  const NUMBER_OF_STEPS = 3;

  // TODO A: Define tools
  const priceLookup = tool({
    description: 'Return the price in USD for a grocery item.',
    inputSchema: z.object({ item: z.string() }),
    execute: async ({ item }) => ({
      item,
      price: PRICE_TABLE[item.toLowerCase()] ?? null,
    }),
  });

  const deliveryEta = tool({
    description: 'Estimate delivery time in minutes to a given address.',
    inputSchema: z.object({ address: z.string() }),
    execute: async ({ address }) => {
      const eta = 20 + Math.floor(Math.random() * 21);
      return { address, etaMinutes: eta };
    },
  });

  // TODO B: Enable auto-loop summarization
  const result = await generateText({
    model,
    tools: { priceLookup, deliveryEta },
    stopWhen: stepCountIs(NUMBER_OF_STEPS),
    prompt:
      'I want to buy eggs and a banana. Use tools to check prices and tell me the total cost, then estimate delivery time to 221B Baker Street.',
  });

  // TODO C: Inspect all steps & final
  console.log('--- ALL STEPS (auto-loop) ---');
  console.log(
    result.steps.map((s, i) => ({
      step: i + 1,
      type: s.type,
      toolCalls: s.toolCalls,
      toolResults: s.toolResults,
      text: s.text,
    })),
  );

  console.log('\n--- Final Summary ---');
  console.log(result.text);
}
