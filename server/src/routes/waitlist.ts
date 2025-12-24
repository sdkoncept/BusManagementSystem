import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Join waitlist for a trip
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { tripId, seatCount } = req.body;

    if (!tripId || !seatCount || seatCount < 1) {
      return res.status(400).json({ message: 'Trip ID and seat count are required' });
    }

    const waitlist = await prisma.waitlistEntry.create({
      data: {
        userId: req.user!.id,
        tripId,
        seatCount,
      },
      include: {
        trip: {
          include: {
            origin: true,
            destination: true,
          },
        },
      },
    });

    res.status(201).json(waitlist);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'You are already on the waitlist for this trip' });
    }
    res.status(500).json({ message: error.message });
  }
});

// Get user's waitlist entries
router.get('/my-waitlist', authenticate, async (req: AuthRequest, res) => {
  try {
    const entries = await prisma.waitlistEntry.findMany({
      where: { userId: req.user!.id },
      include: {
        trip: {
          include: {
            origin: true,
            destination: true,
            bus: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(entries);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get waitlist for a trip (Admin/Staff)
router.get('/trip/:tripId', authenticate, authorize('ADMIN', 'STAFF'), async (req, res) => {
  try {
    const entries = await prisma.waitlistEntry.findMany({
      where: { tripId: req.params.tripId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    res.json(entries);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Remove from waitlist
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const entry = await prisma.waitlistEntry.findUnique({
      where: { id: req.params.id },
    });

    if (!entry) {
      return res.status(404).json({ message: 'Waitlist entry not found' });
    }

    if (entry.userId !== req.user!.id && req.user!.role !== 'ADMIN' && req.user!.role !== 'STAFF') {
      return res.status(403).json({ message: 'Access denied' });
    }

    await prisma.waitlistEntry.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Removed from waitlist' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

