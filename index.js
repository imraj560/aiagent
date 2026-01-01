import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';

const model = openai('gpt-4o');


/* Exercise: Structured Output + Classification with generateObject + Zod
--------------------------------------------------------------------
Your goals:
 1) Build a Zod schema for a simple sandwich order (basic structured output).
2) Build a Zod schema for classifying a short message (classification).

You’ll use `generateObject` to force the model to return strict JSON
that matches your schemas. 
*/


async function main() {
  // TODO: Uncomment the one you're working on:
  // await basicStructuredOutputExercise();
  await classificationStructuredOutputExercise();
}

main();

// -----------------------------------------------------
// 1) BASIC STRUCTURED OUTPUT (Sandwich Order)
// -----------------------------------------------------
/*
  Challenge:
  Create a schema that captures a basic sandwich order based on a plain-English prompt.

  Required fields:
    - size: one of "small" | "medium" | "large"  (use z.enum)
    - bread: string
    - toasted: boolean
    - toppings: array of strings (at least one)  (use z.array(z.string()).min(1))
    - notes: optional string

  Steps:
    A) Define a Zod schema named sandwichSchema (z.object({...})).
    B) Use generateObject with:
       - schemaName: "sandwich_order" (no spaces)
       - schemaDescription: "A simple sandwich order."
       - schema: sandwichSchema
       - prompt: describe the order below
    C) Log the JSON to the console.

  Tip:
    Add .describe() on fields to gently steer the model (e.g., z.string().describe('...')).
*/
async function basicStructuredOutputExercise() {
  // TODO A: Define the schema
  const sandwichSchema = z.object({
    // size: ...
    size: z.enum(['small', 'medium', 'large']).describe('Overall size of the sandwhich.'),
    // bread: ...
    bread: z.string().describe('Type of bread e.g. wheat, white...'),
    // toasted: ...
    toasted: z.boolean().describe('Whether the sandwhich will be toasted'),
    // toppings: ...
    toppings: z.array(z.string()).min(1).describe("One or more toppings like tomato, lettuce, pickles."),
    // notes: ...
    notes: z.string().optional().describe('Optional free-text notes like "cut in half')
  });

  // TODO B: Generate structured output for this order
  const prompt = `
Make a sandwich order with these details:
- small turkey sandwich on sourdough
- toppings: lettuce, tomato, pickles
- toasted: yes
- note: "cut in half"
  `.trim();

  const result = await generateObject({
    model,
    schemaName: 'sandwich_order', // no spaces
    schemaDescription: 'A simple sandwich order.',
    schema: sandwichSchema,
    prompt,
  });

  // TODO C: Print JSON
  console.log(JSON.stringify(result.object, null, 2));
}

// -----------------------------------------------------
// 2) CLASSIFICATION (Message Category)
// -----------------------------------------------------
/*
  Challenge:
  Classify a short user message into one of three categories:
    - "compliment"
    - "complaint"
    - "question"

  Required fields:
    - reasoning: string (brief explanation for the choice)
    - label: enum("compliment", "complaint", "question")

  Steps:
    A) Define a Zod schema named messageClassSchema.
    B) Use generateObject with:
       - schemaName: "message_classification"
       - schemaDescription: "Classify a user message."
       - schema: messageClassSchema
       - prompt: include the user message (provided below)
    C) Log the JSON to the console.

  Try with these messages (change the text to test yourself!):
    1) "Your app keeps crashing on startup. Please fix this ASAP!!!"
    2) "Love the new update—super smooth and fast!"
    3) "How do I export my data to a CSV?"
*/
async function classificationStructuredOutputExercise() {
  // TODO A: Define the schema
  const messageClassSchema = z.object({
    // reasoning: ...
    reasoning: z.string().describe('Brief explanation for why this label fits.'),
    // label: ...
    label: z.enum(['compliment', 'complaint', 'question']).describe('high-level category of the message')
  });

  // TODO B: Pick one message to classify:
  const message = 'Your app keeps crashing on startup. Please fix this ASAP!!!';

  const result = await generateObject({
    model,
    schemaName: 'message_classification',
    schemaDescription: 'Classify a user message.',
    schema: messageClassSchema,
    prompt:
      'Classify the user message below:\n\n' +
      `Message: "${message}"`,
  });

  // TODO C: Print JSON
  console.log(JSON.stringify(result.object, null, 2));
}

