# Deploy to Vercel + Supabase
## Frontend & Backend on Vercel, Database on Supabase

This guide will help you deploy everything to Vercel using Supabase only for the database.

---

## Architecture Overview

- **Frontend**: Vercel (React/Vite app)
- **Backend**: Vercel Serverless Functions (Node.js/Express)
- **Database**: Supabase PostgreSQL (already configured)

---

## Part 1: Prepare Vercel Configuration

### Step 1: Create Vercel Configuration File

Create `vercel.json` in the **root** of your project:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server/src/index.ts",
      "use": "@vercel/node"
    },
    {
      "src": "client/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "server/src/index.ts"
    },
    {
      "src": "/(.*)",
      "dest": "client/$1"
    }
  ],
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Step 2: Update Serverless Function Entry Point

Since Vercel uses serverless functions, we need to adapt the Express app. Create `server/api/index.ts`:

```typescript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Import routes
import authRoutes from '../routes/auth';
import routeRoutes from '../routes/routes';
import stationRoutes from '../routes/stations';
import tripRoutes from '../routes/trips';
import bookingRoutes from '../routes/bookings';
import busRoutes from '../routes/buses';
import driverRoutes from '../routes/drivers';
import settingsRoutes from '../routes/settings';
import inventoryRoutes from '../routes/inventory';
import requestRoutes from '../routes/requests';
import loyaltyRoutes from '../routes/loyalty';
import reviewRoutes from '../routes/reviews';
import favoriteRoutes from '../routes/favorites';
import waitlistRoutes from '../routes/waitlist';
import earningsRoutes from '../routes/earnings';
import incidentRoutes from '../routes/incidents';
import messageRoutes from '../routes/messages';
import complaintRoutes from '../routes/complaints';
import expenseRoutes from '../routes/expenses';
import maintenanceRoutes from '../routes/maintenance';
import supplierRoutes from '../routes/suppliers';
import analyticsRoutes from '../routes/analytics';
import customerRoutes from '../routes/customers';

dotenv.config();

const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Eagle Line API is running' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/stations', stationRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/buses', busRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/loyalty', loyaltyRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/waitlist', waitlistRoutes);
app.use('/api/earnings', earningsRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/customers', customerRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Export for Vercel serverless
export default app;
```

Actually, let me check the current structure first and create a better solution.

