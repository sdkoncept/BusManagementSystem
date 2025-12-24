// Vercel Serverless Function - Express API Handler
// This is the entry point for all /api/* routes

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Import routes
import authRoutes from '../server/src/routes/auth';
import routeRoutes from '../server/src/routes/routes';
import stationRoutes from '../server/src/routes/stations';
import tripRoutes from '../server/src/routes/trips';
import bookingRoutes from '../server/src/routes/bookings';
import busRoutes from '../server/src/routes/buses';
import driverRoutes from '../server/src/routes/drivers';
import settingsRoutes from '../server/src/routes/settings';
import inventoryRoutes from '../server/src/routes/inventory';
import requestRoutes from '../server/src/routes/requests';
import loyaltyRoutes from '../server/src/routes/loyalty';
import reviewRoutes from '../server/src/routes/reviews';
import favoriteRoutes from '../server/src/routes/favorites';
import waitlistRoutes from '../server/src/routes/waitlist';
import earningsRoutes from '../server/src/routes/earnings';
import incidentRoutes from '../server/src/routes/incidents';
import messageRoutes from '../server/src/routes/messages';
import complaintRoutes from '../server/src/routes/complaints';
import expenseRoutes from '../server/src/routes/expenses';
import maintenanceRoutes from '../server/src/routes/maintenance';
import supplierRoutes from '../server/src/routes/suppliers';
import analyticsRoutes from '../server/src/routes/analytics';
import customerRoutes from '../server/src/routes/customers';

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
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Eagle Line API is running' });
});

// Routes
app.use('/auth', authRoutes);
app.use('/routes', routeRoutes);
app.use('/stations', stationRoutes);
app.use('/trips', tripRoutes);
app.use('/bookings', bookingRoutes);
app.use('/buses', busRoutes);
app.use('/drivers', driverRoutes);
app.use('/settings', settingsRoutes);
app.use('/inventory', inventoryRoutes);
app.use('/requests', requestRoutes);
app.use('/loyalty', loyaltyRoutes);
app.use('/reviews', reviewRoutes);
app.use('/favorites', favoriteRoutes);
app.use('/waitlist', waitlistRoutes);
app.use('/earnings', earningsRoutes);
app.use('/incidents', incidentRoutes);
app.use('/messages', messageRoutes);
app.use('/complaints', complaintRoutes);
app.use('/expenses', expenseRoutes);
app.use('/maintenance', maintenanceRoutes);
app.use('/suppliers', supplierRoutes);
app.use('/analytics', analyticsRoutes);
app.use('/customers', customerRoutes);

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

// Export for Vercel
export default app;

