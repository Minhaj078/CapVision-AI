import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRouter from './routes/api';
import errorHandler from './middlewares/errorHandler';
import { testGeminiConnection } from './services/gemini';
// Load environment variables
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3001;
// Enable Cross-Origin Resource Sharing (CORS)
app.use(cors({
    origin: '*', // Permit requests from any client origin for local development
}));
// Body parser middleware for parsing JSON payloads
app.use(express.json());
// Register API Routes
app.use('/api', apiRouter);
// Base health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'CapVision AI Server is online',
        timestamp: new Date()
    });
});
// Centralized error-handling middleware (MUST be registered last)
app.use(errorHandler);
app.listen(PORT, async () => {
    console.log(`===============================================`);
    console.log(`   AI Investment Research Agent Server         `);
    console.log(`   Running at: http://localhost:${PORT}        `);
    console.log(`===============================================`);
    // Verify API connection on boot
    console.log('[Startup] Verifying Gemini API credentials...');
    const connected = await testGeminiConnection();
    if (connected) {
        console.log('[Startup] Gemini API authentication succeeded!');
    }
    else {
        console.warn('[Startup] Warning: Gemini API connection failed. Verify GEMINI_API_KEY in server/.env.');
    }
});
