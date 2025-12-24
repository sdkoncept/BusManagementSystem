import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Send message (Admin/Staff to Driver or broadcast)
router.post('/', authenticate, authorize('ADMIN', 'STAFF'), async (req: AuthRequest, res) => {
  try {
    const { receiverId, driverId, type, subject, content } = req.body;

    if (!content) {
      return res.status(400).json({ message: 'Message content is required' });
    }

    const message = await prisma.message.create({
      data: {
        senderId: req.user!.id,
        receiverId,
        driverId,
        type: type || 'MESSAGE',
        subject,
        content,
      },
    });

    res.status(201).json(message);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get driver's messages
router.get('/driver/my-messages', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { driver: true },
    });

    if (!user || !user.driver) {
      return res.status(403).json({ message: 'User is not linked to a driver account' });
    }

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { driverId: user.driver.id },
          { receiverId: userId },
          { receiverId: null, type: 'ANNOUNCEMENT' }, // Broadcast announcements
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    res.json(messages);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Mark message as read
router.patch('/:id/read', authenticate, async (req: AuthRequest, res) => {
  try {
    const message = await prisma.message.update({
      where: { id: req.params.id },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    res.json(message);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get all messages (Admin)
router.get('/', authenticate, authorize('ADMIN', 'STAFF'), async (req, res) => {
  try {
    const { driverId, type } = req.query;
    const where: any = {};

    if (driverId) where.driverId = driverId as string;
    if (type) where.type = type as string;

    const messages = await prisma.message.findMany({
      where,
      include: {
        driver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    res.json(messages);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

