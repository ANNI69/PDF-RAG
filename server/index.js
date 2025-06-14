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

// Add user input tracking
const userInputCounts = new Map();

app.use(cors());

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
    const userId = req.query.userId; // Get userId from query params

    // Check if user has exceeded their limit
    if (!userInputCounts.has(userId)) {
        userInputCounts.set(userId, 0);
    }

    const currentCount = userInputCounts.get(userId);
    if (currentCount >= 3) {
        return res.status(429).json({
            success: false,
            message: "You have reached your limit of 3 inputs. Please upgrade your plan to continue.",
            limitReached: true
        });
    }

    // Increment the count
    userInputCounts.set(userId, currentCount + 1);

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

app.get('/download', async (req, res) => {
    const fileName = req.query.file;
    if (!fileName) {
        return res.status(400).json({ success: false, message: 'No file specified.' });
    }

    try {
        const filePath = path.join(__dirname, 'uploads', fileName);
        
        // Check if file exists
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ success: false, message: 'File not found.' });
        }

        // Set headers for file download
        res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
        res.setHeader('Content-Type', 'application/pdf');

        // Stream the file to the response
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);

        // Handle errors during streaming
        fileStream.on('error', (error) => {
            console.error('Error streaming file:', error);
            if (!res.headersSent) {
                res.status(500).json({ success: false, message: 'Error streaming file.' });
            }
        });
    } catch (error) {
        console.error('Error processing download:', error);
        res.status(500).json({ success: false, message: 'Error processing file download.' });
    }
});

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});

