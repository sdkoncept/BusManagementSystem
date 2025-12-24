// Vercel Serverless Function - Catch-all route handler for /api/*
// This file handles all /api/* routes by delegating to Express app

// Import the Express app (Vercel will compile TypeScript automatically)
import app from '../server/src/index';

export default app;

