import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Report incident (Driver)
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { driver: true },
    });

    if (!user || !user.driver) {
      return res.status(403).json({ message: 'Only drivers can report incidents' });
    }

    const { tripId, type, severity, description, location, latitude, longitude } = req.body;

    if (!type || !description) {
      return res.status(400).json({ message: 'Type and description are required' });
    }

    const incident = await prisma.incident.create({
      data: {
        tripId,
        driverId: user.driver.id,
        type,
        severity: severity || 'LOW',
        description,
        location,
        latitude,
        longitude,
      },
      include: {
        trip: {
          select: {
            id: true,
            origin: { select: { name: true } },
            destination: { select: { name: true } },
          },
        },
        driver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phoneNumber: true,
          },
        },
      },
    });

    res.status(201).json(incident);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get driver's incidents
router.get('/my-incidents', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { driver: true },
    });

    if (!user || !user.driver) {
      return res.status(403).json({ message: 'User is not linked to a driver account' });
    }

    const incidents = await prisma.incident.findMany({
      where: { driverId: user.driver.id },
      include: {
        trip: {
          select: {
            id: true,
            origin: { select: { name: true } },
            destination: { select: { name: true } },
          },
        },
      },
      orderBy: { reportedAt: 'desc' },
    });

    res.json(incidents);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get all incidents (Admin/Staff)
router.get('/', authenticate, authorize('ADMIN', 'STAFF'), async (req, res) => {
  try {
    const { status, severity, driverId } = req.query;
    const where: any = {};

    if (severity) where.severity = severity;
    if (driverId) where.driverId = driverId as string;
    if (status === 'resolved') {
      where.resolvedAt = { not: null };
    } else if (status === 'pending') {
      where.resolvedAt = null;
    }

    const incidents = await prisma.incident.findMany({
      where,
      include: {
        driver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phoneNumber: true,
          },
        },
        trip: {
          select: {
            id: true,
            origin: { select: { name: true } },
            destination: { select: { name: true } },
          },
        },
      },
      orderBy: { reportedAt: 'desc' },
    });

    res.json(incidents);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Resolve incident (Admin/Staff)
router.patch('/:id/resolve', authenticate, authorize('ADMIN', 'STAFF'), async (req: AuthRequest, res) => {
  try {
    const { resolution } = req.body;

    const incident = await prisma.incident.update({
      where: { id: req.params.id },
      data: {
        resolvedAt: new Date(),
        resolvedBy: req.user!.id,
        resolution,
      },
    });

    res.json(incident);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

