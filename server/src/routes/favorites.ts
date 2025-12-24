import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Get user's favorite routes
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const favorites = await prisma.favoriteRoute.findMany({
      where: { userId: req.user!.id },
      include: {
        route: {
          include: {
            routeStations: {
              include: { station: true },
              orderBy: { order: 'asc' },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(favorites);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Add route to favorites
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { routeId } = req.body;

    if (!routeId) {
      return res.status(400).json({ message: 'Route ID is required' });
    }

    const favorite = await prisma.favoriteRoute.create({
      data: {
        userId: req.user!.id,
        routeId,
      },
      include: {
        route: true,
      },
    });

    res.status(201).json(favorite);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'Route is already in favorites' });
    }
    res.status(500).json({ message: error.message });
  }
});

// Remove route from favorites
router.delete('/:routeId', authenticate, async (req: AuthRequest, res) => {
  try {
    await prisma.favoriteRoute.delete({
      where: {
        userId_routeId: {
          userId: req.user!.id,
          routeId: req.params.routeId,
        },
      },
    });

    res.json({ message: 'Route removed from favorites' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

