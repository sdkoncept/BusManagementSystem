// Vercel Serverless Function - Catch-all route handler for /api/*
// This file handles all /api/* routes by delegating to Express app
// Vercel automatically routes /api/* requests to this handler

import serverless from 'serverless-http';

// Import Express app from source - Vercel will compile it
// The server is built during buildCommand, so dist exists at runtime
// Use require() to handle CommonJS module from compiled dist
const appModule = require('../server/dist/index');
const app = appModule.default || appModule;

// Wrap Express app with serverless-http for Vercel
const handler = serverless(app);

// Export the handler for Vercel
export default handler;
