// Vercel Serverless Function - Catch-all route handler for /api/*
// This file handles all /api/* routes by delegating to Express app
// Vercel automatically routes /api/* requests to this handler

import serverless from 'serverless-http';

// Import Express app - use require for CommonJS compatibility
// Try dist first (production), fallback to source (development)
let app: any;
try {
  // @ts-ignore - require() for CommonJS
  const appModule = require('../server/dist/index');
  app = appModule.default || appModule;
  console.log('Loaded app from dist');
} catch (error) {
  console.error('Failed to load from dist, trying source:', error);
  try {
    // @ts-ignore - require() for CommonJS
    const appModule = require('../server/src/index');
    app = appModule.default || appModule;
    console.log('Loaded app from source');
  } catch (sourceError) {
    console.error('Failed to load app from source:', sourceError);
    throw new Error('Failed to load Express app');
  }
}

// Wrap Express app with serverless-http for Vercel
const handler = serverless(app);

// Export the handler for Vercel
export default handler;
