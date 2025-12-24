import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Create complaint
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { bookingId, type, subject, description, priority } = req.body;

    if (!type || !subject || !description) {
      return res.status(400).json({ message: 'Type, subject, and description are required' });
    }

    const complaint = await prisma.complaint.create({
      data: {
        userId: req.user!.id,
        bookingId,
        type,
        subject,
        description,
        priority: priority || 'MEDIUM',
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    res.status(201).json(complaint);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get user's complaints
router.get('/my-complaints', authenticate, async (req: AuthRequest, res) => {
  try {
    const complaints = await prisma.complaint.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
    });

    res.json(complaints);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get all complaints (Admin/Staff)
router.get('/', authenticate, authorize('ADMIN', 'STAFF'), async (req, res) => {
  try {
    const { status, priority, assignedTo } = req.query;
    const where: any = {};

    if (status) where.status = status as string;
    if (priority) where.priority = priority as string;
    if (assignedTo) where.assignedTo = assignedTo as string;

    const complaints = await prisma.complaint.findMany({
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

    res.json(complaints);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Update complaint (Admin/Staff)
router.patch('/:id', authenticate, authorize('ADMIN', 'STAFF'), async (req: AuthRequest, res) => {
  try {
    const { status, priority, assignedTo, resolution } = req.body;

    const complaint = await prisma.complaint.update({
      where: { id: req.params.id },
      data: {
        status,
        priority,
        assignedTo,
        resolution,
        resolvedAt: resolution ? new Date() : undefined,
      },
    });

    res.json(complaint);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

