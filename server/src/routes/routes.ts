import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Get all routes
router.get('/', async (req, res) => {
  try {
    const { isActive } = req.query;
    const where: any = {};
    
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    // Try to include schedule, but make it optional in case table doesn't exist
    let routes;
    try {
      routes = await prisma.route.findMany({
        where,
        include: {
          routeStations: {
            include: {
              station: true,
            },
            orderBy: { order: 'asc' },
          },
          schedule: true,
        },
        orderBy: { name: 'asc' },
      });
    } catch (error: any) {
      // If schedule table doesn't exist, fetch without it
      if (error.message?.includes('route_schedules') || error.message?.includes('does not exist')) {
        routes = await prisma.route.findMany({
          where,
          include: {
            routeStations: {
              include: {
                station: true,
              },
              orderBy: { order: 'asc' },
            },
          },
          orderBy: { name: 'asc' },
        });
      } else {
        throw error;
      }
    }
    res.json(routes);
  } catch (error: any) {
    if (error.message?.includes('route_schedules') || error.message?.includes('does not exist')) {
      res.status(500).json({ 
        message: 'Route schedules table not found. Please run the migration: server/prisma/migration_add_route_schedule.sql in Supabase SQL Editor',
        error: error.message 
      });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
});

// Get route by ID
router.get('/:id', async (req, res) => {
  try {
    const route = await prisma.route.findUnique({
      where: { id: req.params.id },
      include: {
        routeStations: {
          include: {
            station: true,
          },
          orderBy: { order: 'asc' },
        },
        trips: {
          where: {
            status: { in: ['SCHEDULED', 'IN_PROGRESS'] },
          },
          include: {
            bus: true,
            origin: true,
            destination: true,
          },
        },
      },
    });

    if (!route) {
      return res.status(404).json({ message: 'Route not found' });
    }

    res.json(route);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Create route (Admin/Staff only)
router.post('/', authenticate, authorize('ADMIN', 'STAFF'), async (req, res) => {
  try {
    const { name, code, description, distance, duration, isActive, stations } = req.body;

    // Check if code already exists
    const existing = await prisma.route.findUnique({ where: { code } });
    if (existing) {
      return res.status(400).json({ message: 'Route code already exists' });
    }

    const route = await prisma.route.create({
      data: {
        name,
        code,
        description,
        distance,
        duration,
        isActive: isActive !== undefined ? isActive : true,
        routeStations: stations
          ? {
              create: stations.map((station: any, index: number) => ({
                stationId: station.stationId,
                order: station.order || index + 1,
                distance: station.distance,
              })),
            }
          : undefined,
      },
      include: {
        routeStations: {
          include: {
            station: true,
          },
        },
      },
    });

    res.status(201).json(route);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Update route (Admin/Staff only)
router.put('/:id', authenticate, authorize('ADMIN', 'STAFF'), async (req, res) => {
  try {
    const { name, code, description, distance, duration, isActive, stations } = req.body;

    const existing = await prisma.route.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ message: 'Route not found' });
    }

    // Check if code is being changed and if new code exists
    if (code && code !== existing.code) {
      const codeExists = await prisma.route.findUnique({ where: { code } });
      if (codeExists) {
        return res.status(400).json({ message: 'Route code already exists' });
      }
    }

    // Update route
    const route = await prisma.route.update({
      where: { id: req.params.id },
      data: {
        name,
        code,
        description,
        distance,
        duration,
        isActive,
      },
    });

    // Update stations if provided
    if (stations) {
      // Delete existing route stations
      await prisma.routeStation.deleteMany({ where: { routeId: req.params.id } });

      // Create new route stations
      await prisma.routeStation.createMany({
        data: stations.map((station: any, index: number) => ({
          routeId: req.params.id,
          stationId: station.stationId,
          order: station.order || index + 1,
          distance: station.distance,
        })),
      });
    }

    const updatedRoute = await prisma.route.findUnique({
      where: { id: req.params.id },
      include: {
        routeStations: {
          include: {
            station: true,
          },
          orderBy: { order: 'asc' },
        },
      },
    });

    res.json(updatedRoute);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Delete route (Admin only)
router.delete('/:id', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const route = await prisma.route.findUnique({ where: { id: req.params.id } });
    if (!route) {
      return res.status(404).json({ message: 'Route not found' });
    }

    await prisma.route.delete({ where: { id: req.params.id } });
    res.json({ message: 'Route deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Route Schedule Management

// Get or create route schedule
router.get('/:id/schedule', authenticate, authorize('ADMIN', 'STAFF'), async (req, res) => {
  try {
    const route = await prisma.route.findUnique({ where: { id: req.params.id } });
    if (!route) {
      return res.status(404).json({ message: 'Route not found' });
    }

    let schedule = await prisma.routeSchedule.findUnique({
      where: { routeId: req.params.id },
    });

    // Create default schedule if it doesn't exist
    if (!schedule) {
      schedule = await prisma.routeSchedule.create({
        data: {
          routeId: req.params.id,
          startTime: '07:00',
          endTime: '16:00',
          interval: 60,
          price: 0,
        },
      });
    }

    res.json(schedule);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Create or update route schedule
router.post('/:id/schedule', authenticate, authorize('ADMIN', 'STAFF'), async (req, res) => {
  try {
    const { startTime, endTime, interval, price, isActive } = req.body;

    const route = await prisma.route.findUnique({ where: { id: req.params.id } });
    if (!route) {
      return res.status(404).json({ message: 'Route not found' });
    }

    const schedule = await prisma.routeSchedule.upsert({
      where: { routeId: req.params.id },
      update: {
        startTime: startTime || '07:00',
        endTime: endTime || '16:00',
        interval: interval || 60,
        price: price || 0,
        isActive: isActive !== undefined ? isActive : true,
      },
      create: {
        routeId: req.params.id,
        startTime: startTime || '07:00',
        endTime: endTime || '16:00',
        interval: interval || 60,
        price: price || 0,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    res.json(schedule);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;






