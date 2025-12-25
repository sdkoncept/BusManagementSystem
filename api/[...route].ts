// Vercel Serverless Function - Catch-all route handler for /api/*
// This file handles all /api/* routes by delegating to Express app
// Vercel automatically routes /api/* to this catch-all handler

// Import the Express app from server (built JavaScript)
// Try built version first, fallback to source for Vercel auto-compilation
let app;
try {
  // Try to import from built dist folder
  app = require('../server/dist/index').default;
} catch (e) {
  // Fallback to source TypeScript (Vercel will compile it)
  app = require('../server/src/index').default;
}

// Export the Express app directly - Vercel will handle it correctly
export default app;

