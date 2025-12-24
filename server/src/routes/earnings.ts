import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Get driver's earnings
router.get('/driver/my-earnings', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { driver: true },
    });

    if (!user || !user.driver) {
      return res.status(403).json({ message: 'User is not linked to a driver account' });
    }

    const { period } = req.query; // 'week', 'month', 'year', 'all'

    let startDate: Date | undefined;
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    switch (period) {
      case 'week':
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'year':
        startDate = new Date();
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      case 'all':
      default:
        startDate = undefined;
        break;
    }

    if (startDate) {
      startDate.setHours(0, 0, 0, 0);
    }

    const earnings = await prisma.driverEarning.findMany({
      where: {
        driverId: user.driver.id,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        trip: {
          select: {
            id: true,
            origin: { select: { name: true } },
            destination: { select: { name: true } },
            departureTime: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalEarnings = earnings.reduce((sum, e) => sum + e.amount, 0);
    const driver = await prisma.driver.findUnique({
      where: { id: user.driver.id },
      select: {
        totalEarnings: true,
        totalTrips: true,
        onTimeRate: true,
        rating: true,
      },
    });

    res.json({
      periodEarnings: totalEarnings,
      totalEarnings: driver?.totalEarnings || 0,
      totalTrips: driver?.totalTrips || 0,
      onTimeRate: driver?.onTimeRate || 0,
      rating: driver?.rating || 0,
      earnings,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get all driver earnings (Admin)
router.get('/drivers', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const { driverId, period } = req.query;
    const where: any = {};

    if (driverId) {
      where.driverId = driverId as string;
    }

    if (period) {
      let startDate: Date;
      const endDate = new Date();
      endDate.setHours(23, 59, 59, 999);

      switch (period) {
        case 'week':
          startDate = new Date();
          startDate.setDate(startDate.getDate() - 7);
          break;
        case 'month':
          startDate = new Date();
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case 'year':
          startDate = new Date();
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
        default:
          startDate = new Date(0);
      }

      startDate.setHours(0, 0, 0, 0);
      where.createdAt = { gte: startDate, lte: endDate };
    }

    const earnings = await prisma.driverEarning.findMany({
      where,
      include: {
        driver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
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
      orderBy: { createdAt: 'desc' },
    });

    res.json(earnings);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Create earnings record (Admin - for bonuses, gratuity, etc.)
router.post('/', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const { driverId, amount, type, description, period, tripId } = req.body;

    if (!driverId || !amount || !type) {
      return res.status(400).json({ message: 'Driver ID, amount, and type are required' });
    }

    const earning = await prisma.driverEarning.create({
      data: {
        driverId,
        tripId,
        amount,
        type,
        description,
        period,
      },
    });

    // Update driver's total earnings
    await prisma.driver.update({
      where: { id: driverId },
      data: { totalEarnings: { increment: amount } },
    });

    res.status(201).json(earning);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

