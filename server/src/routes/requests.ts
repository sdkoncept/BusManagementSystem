import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Get all requests (Admin/Staff)
router.get('/', authenticate, authorize('ADMIN', 'STAFF'), async (req, res) => {
  try {
    const { type, status } = req.query;
    const where: any = {};

    if (type) {
      where.type = type as string;
    }

    if (status) {
      where.status = status as string;
    }

    const requests = await prisma.request.findMany({
      where,
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
      orderBy: { createdAt: 'desc' },
    });

    res.json(requests);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get user's own requests
router.get('/my-requests', authenticate, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { type, status } = req.query;
    const where: any = { userId };

    if (type) {
      where.type = type as string;
    }

    if (status) {
      where.status = status as string;
    }

    const requests = await prisma.request.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    res.json(requests);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Create fuel request (Driver)
router.post('/fuel', authenticate, async (req, res) => {
  try {
    const { tripId, amount, description, location } = req.body;
    const userId = req.user!.id;

    const request = await prisma.request.create({
      data: {
        type: 'FUEL',
        userId,
        tripId,
        title: 'Fuel Request',
        description: description || 'Requesting fuel approval',
        amount,
        location,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    res.status(201).json(request);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Create help request (Driver)
router.post('/help', authenticate, async (req, res) => {
  try {
    const { tripId, description, location } = req.body;
    const userId = req.user!.id;

    const request = await prisma.request.create({
      data: {
        type: 'HELP',
        userId,
        tripId,
        title: 'Help Request',
        description: description || 'Driver needs assistance',
        location,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
      },
    });

    res.status(201).json(request);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Respond to request (Admin/Staff)
router.patch('/:id/respond', authenticate, authorize('ADMIN', 'STAFF'), async (req, res) => {
  try {
    const { status, response } = req.body;
    const userId = req.user!.id;

    if (!['APPROVED', 'REJECTED', 'FULFILLED'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const request = await prisma.request.update({
      where: { id: req.params.id },
      data: {
        status: status as any,
        respondedBy: userId,
        response,
        respondedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
      },
    });

    res.json(request);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get request by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const request = await prisma.request.findUnique({
      where: { id: req.params.id },
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
    });

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Check if user has permission to view this request
    if (request.userId !== req.user!.id && req.user!.role !== 'ADMIN' && req.user!.role !== 'STAFF') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(request);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

