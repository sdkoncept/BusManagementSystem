// Vercel Serverless Function - Catch-all route handler for /api/*
// This file handles all /api/* routes by delegating to Express app
// Vercel automatically routes /api/* requests to this handler

import serverless from 'serverless-http';
import app from '../server/dist/index';

// Wrap Express app with serverless-http for Vercel
const handler = serverless(app);

// Export the handler for Vercel
export default handler;
