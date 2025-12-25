// Vercel Serverless Function - Catch-all route handler for /api/*
// This file handles all /api/* routes by delegating to Express app

// Try to import from built version first, fallback to source
let app;
try {
  // Try built JavaScript version
  app = require('../server/dist/index').default;
} catch {
  // Fallback to TypeScript source (Vercel will compile it)
  app = require('../server/src/index').default;
}

// Export the Express app - Vercel will handle it as a serverless function
export default app;

