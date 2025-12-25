import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Create maintenance schedule (Admin)
router.post('/', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const { busId, type, description, scheduledDate, cost, notes } = req.body;

    if (!busId || !type || !description || !scheduledDate) {
      return res.status(400).json({ message: 'Bus ID, type, description, and scheduled date are required' });
    }

    const maintenance = await prisma.maintenanceSchedule.create({
      data: {
        busId,
        type,
        description,
        scheduledDate: new Date(scheduledDate),
        cost: cost || 0,
        notes,
      },
      include: {
        bus: {
          select: {
            id: true,
            plateNumber: true,
            model: true,
          },
        },
      } as any,
    });

    // Update bus's next maintenance date
    await prisma.bus.update({
      where: { id: busId },
      data: { nextMaintenance: new Date(scheduledDate) },
    });

    res.status(201).json(maintenance);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get all maintenance schedules
router.get('/', authenticate, authorize('ADMIN', 'STAFF'), async (req, res) => {
  try {
    const { busId, status, type } = req.query;
    const where: any = {};

    if (busId) where.busId = busId as string;
    if (status) where.status = status as string;
    if (type) where.type = type as string;

    const schedules = await prisma.maintenanceSchedule.findMany({
      where,
      include: {
        bus: {
          select: {
            id: true,
            plateNumber: true,
            model: true,
            vehicleType: true,
          },
        },
      } as any,
      orderBy: { scheduledDate: 'asc' },
    });

    res.json(schedules);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Update maintenance schedule
router.put('/:id', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const { type, description, scheduledDate, completedDate, cost, status, notes } = req.body;

    const maintenance = await prisma.maintenanceSchedule.update({
      where: { id: req.params.id },
      data: {
        type,
        description,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : undefined,
        completedDate: completedDate ? new Date(completedDate) : undefined,
        cost,
        status,
        notes,
      },
      include: {
        bus: true,
      } as any,
    });

    // Update bus's last maintenance if completed
    if (status === 'COMPLETED' && completedDate) {
      await prisma.bus.update({
        where: { id: maintenance.busId },
        data: { lastMaintenance: new Date(completedDate) },
      });
    }

    res.json(maintenance);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

