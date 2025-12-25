// Vercel Serverless Function - Catch-all route handler for /api/*
// This file handles all /api/* routes by delegating to Express app
// Vercel automatically routes /api/* requests to this handler

// Import from built server code (compiled during build step)
// If dist doesn't exist, Vercel will compile TypeScript on the fly
let app;
try {
  // Try to import from built JavaScript first
  app = require('../server/dist/index').default;
} catch {
  // Fallback to TypeScript source (Vercel will compile it)
  app = require('../server/src/index').default;
}

// Export the Express app - Vercel will handle it as a serverless function
export default app;

