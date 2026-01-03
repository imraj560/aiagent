import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import {webSearchRetrievalAgent} from './webSearchRetrievalAgent.js';
import dotenv from "dotenv";
dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



// Middleware
app.use(express.json()); // Parse JSON bodies
app.use(express.static(path.join(__dirname))); // Serve static files (HTML, CSS, client JS)

app.use(cors());

// API endpoint for asking questions
app.post('/api/ask', async (req, res) => {
  const { question } = req.body;
  console.log(`Server received question: ${question}`)

  if (!question) {
    return res.status(400).json({ error: 'Question is required' });
  }

  try {
    // *** Call the SELECTED RAG function ***
    const responseData = await webSearchRetrievalAgent(question)
    res.json(responseData);
  } catch (error) {
    console.error('API Error:', error);
    // Provide a generic error structure
    res.status(500).json({
      error: 'Failed to process the question.',
      details: error.message,
      answer: 'An error occurred while processing your request.', // Ensure answer field exists
      sources: null,
      // Conditionally add classification/toolUsed if relevant to the mode
      classification: null,
      toolUsed: null
    });
  }
});

// Serve the main HTML file for the root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
