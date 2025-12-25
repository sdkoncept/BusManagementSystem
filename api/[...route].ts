// Vercel Serverless Function - Catch-all route handler for /api/*
// This file handles all /api/* routes by delegating to Express app
// Vercel automatically routes /api/* requests to this handler

import app from '../server/src/index';

// Export the Express app - Vercel will handle it as a serverless function
export default app;

