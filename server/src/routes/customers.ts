import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Get customer profile
router.get('/profile/:userId', authenticate, authorize('ADMIN', 'STAFF'), async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.userId },
      include: {
        bookings: {
          include: {
            trip: {
              include: {
                route: true,
                origin: true,
                destination: true,
              },
            },
          },
          orderBy: { bookingDate: 'desc' },
        },
        customerProfile: true,
        loyaltyTransactions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    const totalSpent = user.bookings
      .filter((b) => b.status === 'CONFIRMED' || b.status === 'COMPLETED')
      .reduce((sum, b) => sum + b.totalAmount, 0);

    res.json({
      ...user,
      totalSpent,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Search customers
router.get('/search', authenticate, authorize('ADMIN', 'STAFF'), async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || (query as string).length < 2) {
      return res.status(400).json({ message: 'Search query must be at least 2 characters' });
    }

    const searchTerm = `%${query}%`;

    // Search by name, email, or phone
    const users = await prisma.user.findMany({
      where: {
        role: 'RIDER',
        OR: [
          { firstName: { contains: query as string, mode: 'insensitive' } },
          { lastName: { contains: query as string, mode: 'insensitive' } },
          { email: { contains: query as string, mode: 'insensitive' } },
          { phone: { contains: query as string, mode: 'insensitive' } },
        ],
      },
      include: {
        _count: {
          select: {
            bookings: true,
          },
        },
        customerProfile: true,
      },
      take: 20,
    });

    res.json(users);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get all customers with stats
router.get('/', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const { segment, vipTier } = req.query;
    const where: any = { role: 'RIDER' };

    if (vipTier) {
      where.vipTier = vipTier as string;
    }

    const users = await prisma.user.findMany({
      where,
      include: {
        bookings: {
          where: {
            status: { in: ['CONFIRMED', 'COMPLETED'] },
          },
        },
        customerProfile: true,
      },
    });

    const customers = users.map((user) => {
      const totalSpent = user.bookings.reduce((sum, b) => sum + b.totalAmount, 0);
      return {
        ...user,
        totalSpent,
        totalBookings: user.bookings.length,
      };
    });

    // Apply segmentation
    let filtered = customers;
    if (segment === 'active') {
      filtered = customers.filter((c) => c.bookings.length > 0);
    } else if (segment === 'inactive') {
      filtered = customers.filter((c) => c.bookings.length === 0);
    } else if (segment === 'vip') {
      filtered = customers.filter((c) => c.vipTier === 'GOLD' || c.vipTier === 'PLATINUM');
    }

    res.json(filtered);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Update customer profile
router.put('/profile/:userId', authenticate, authorize('ADMIN', 'STAFF'), async (req, res) => {
  try {
    const { preferredSeat, specialNeeds, marketingOptIn } = req.body;

    const profile = await prisma.customerProfile.upsert({
      where: { userId: req.params.userId },
      update: {
        preferredSeat,
        specialNeeds: specialNeeds ? (typeof specialNeeds === 'string' ? specialNeeds : JSON.stringify(specialNeeds)) : undefined,
        marketingOptIn,
      },
      create: {
        userId: req.params.userId,
        preferredSeat,
        specialNeeds: specialNeeds ? (typeof specialNeeds === 'string' ? specialNeeds : JSON.stringify(specialNeeds)) : undefined,
        marketingOptIn: marketingOptIn !== undefined ? marketingOptIn : true,
      },
    });

    res.json(profile);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Update customer VIP tier
router.patch('/:userId/vip-tier', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const { vipTier } = req.body;

    if (!['BRONZE', 'SILVER', 'GOLD', 'PLATINUM'].includes(vipTier)) {
      return res.status(400).json({ message: 'Invalid VIP tier' });
    }

    const user = await prisma.user.update({
      where: { id: req.params.userId },
      data: { vipTier },
    });

    res.json(user);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

