// Vercel Serverless Function - Catch-all route handler for /api/*
// This file handles all /api/* routes by delegating to Express app
// Vercel automatically routes /api/* to this catch-all handler

// Import the Express app from server
// Vercel will compile TypeScript automatically
import app from '../server/src/index';

// Export the Express app directly - Vercel will handle it correctly
export default app;

