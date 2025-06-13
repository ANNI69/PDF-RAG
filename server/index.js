import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { Queue } from 'bullmq';

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

app.listen(8000, () => {
    console.log('Server is running on port 8000');
});

