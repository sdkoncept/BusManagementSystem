// Vercel Serverless Function Entry Point
// This exports the Express app for Vercel serverless functions

import app from '../server/src/index';

// Vercel will use this as the serverless function handler
export default app;

