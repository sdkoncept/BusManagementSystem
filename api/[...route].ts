// Vercel Serverless Function - Catch-all route handler for /api/*
// This file handles all /api/* routes by delegating to Express app

import app from '../server/src/index';

// Export the Express app - Vercel will handle it as a serverless function
// The catch-all route pattern [...] ensures all /api/* routes go here
export default app;

