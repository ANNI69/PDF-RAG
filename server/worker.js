import { Worker } from 'bullmq';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
dotenv.config();

import { ChatOpenAI } from "@langchain/openai";
import { OpenAIEmbeddings } from "@langchain/openai";
// import { ChatGPTPluginRetriever } from "langchain/retrievers/remote";
import { OpenAIModerationChain } from "langchain/chains";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { json } from 'stream/consumers';
import { CharacterTextSplitter } from "@langchain/textsplitters";
import { QdrantVectorStore } from "@langchain/qdrant";
import { QdrantClient } from "@qdrant/js-client-rest";




const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const worker = new Worker('file-upload-queue', async (job) => {
    console.log('Processing job:', job.id);
    console.log('Job data:', job.data);

    try {
        const { fileName, filePath } = job.data;
        
        // Load and process the PDF
        const loader = new PDFLoader(filePath);
        const docs = await loader.load();

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
        await vectorStore.addDocuments(docs);
        console.log('All Docs Are added to vector store')
        // Split the text into chunks
        const textSplitter = new CharacterTextSplitter({
            chunkSize: 300,
            chunkOverlap: 0,
        });
        
        const texts = await textSplitter.splitDocuments(docs);
        console.log('Split texts:', texts);

        // Return the processed file information
        return {
            status: 'completed',
            fileName: fileName,
            processedAt: new Date().toISOString(),
            chunks: texts.length
        };
    } catch (error) {
        console.error('Error processing file:', error);
        throw error;
    }
}, {
    connection: {
        host: 'localhost',
        port: '6379'
    }
});

worker.on('completed', (job, result) => {
    console.log(`Job ${job.id} completed with result:`, result);
});

worker.on('failed', (job, error) => {
    console.error(`Job ${job.id} failed with error:`, error);
});

