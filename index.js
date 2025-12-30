import { openai } from "./config.js";

/**Now lets create some example content to embede */
const content = ["We will convert this text into an embedding using OpenAI Embedding API."];

async function main(){

    const embedding = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: content,
    });

    console.log(embedding.data)
}

main();