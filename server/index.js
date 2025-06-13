import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { Queue } from 'bullmq';
import { OpenAIEmbeddings } from '@langchain/openai';
import { QdrantVectorStore } from '@langchain/qdrant';
import dotenv from 'dotenv';
import {OpenAI} from 'openai'

dotenv.config();
const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Initialize dotenv

const app = express();

const upload = multer({ dest: 'uploads/' });

const queue = new Queue('file-upload-queue', {
    connection: {
        host: 'localhost',
        port: '6379'
    }
});


// Get directory path for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));

app.get('/', (req, res) => {
    res.json({ message: 'Hello World' });
});

app.post('/upload', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    try {
        const file = req.file;
        const fileName = file.originalname;
        const filePath = path.join(__dirname, 'uploads', fileName);

        // First move the file to its final location
        await fs.promises.rename(file.path, filePath);

        // Then create the job
        const job = await queue.add('file-upload', {
            fileName: fileName,
            filePath: filePath
        });

        res.json({
            success: true,
            message: 'File uploaded successfully',
            fileName: fileName,
            jobId: job.id
        });
    } catch (error) {
        console.error('Error processing upload:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing file upload.'
        });
    }
});

app.get('/chat', async (req,res)=>{
    const userQuery = req.query.message;
    const embeddings = new OpenAIEmbeddings({
        model: 'text-embedding-3-small',
        apiKey: process.env.OPENAI_API_KEY
    });
    const vectorStore = await QdrantVectorStore.fromExistingCollection(
        embeddings,
        {
            url:process.env.QDRANT_URL,
            collectionName: 'langchainjs-testing'
        }
    );
    const ret = vectorStore.asRetriever({
        k: 2
    });    
    const result = await ret.invoke(userQuery);
    const SYSTEM_PROMPT = `
    You are helfull A1 Assistant who answeres the user query based on the available context from PDF File.
    Context : ${JSON.stringify(result)}`;
    const chatResults = await client.chat.completions.create(
        {
            model: "gpt-4.1-mini",
            messages: [
                {
                    role: "system",
                    content: SYSTEM_PROMPT
                },
                {
                    role: "user",
                    content: userQuery
                }
            ],
            temperature: 0.7,
            max_tokens: 500
        }
    );
    
    // Log the full response for debugging
    console.log('Full chat response:', JSON.stringify(chatResults, null, 2));
    
    return res.json({
        message: chatResults.choices[0].message.content,
        docs: result,
        fullResponse: chatResults  // Include the full response object
    });
})

app.listen(8000, () => {
    console.log('Server is running on port 8000');
});

