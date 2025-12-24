import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Get user's loyalty points and tier
router.get('/points', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        loyaltyPoints: true,
        vipTier: true,
        referralCode: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get loyalty transaction history
router.get('/transactions', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const transactions = await prisma.loyaltyTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    res.json(transactions);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Generate referral code (if not exists)
router.post('/referral/generate', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.referralCode) {
      return res.json({ referralCode: user.referralCode });
    }

    // Generate unique referral code
    const referralCode = `EAGLE${userId.slice(0, 8).toUpperCase()}`;
    
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { referralCode },
    });

    res.json({ referralCode: updated.referralCode });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Apply referral code
router.post('/referral/apply', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const { referralCode } = req.body;

    if (!referralCode) {
      return res.status(400).json({ message: 'Referral code is required' });
    }

    const referrer = await prisma.user.findUnique({
      where: { referralCode },
    });

    if (!referrer) {
      return res.status(404).json({ message: 'Invalid referral code' });
    }

    if (referrer.id === userId) {
      return res.status(400).json({ message: 'Cannot use your own referral code' });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user?.referredBy) {
      return res.status(400).json({ message: 'You have already used a referral code' });
    }

    // Update user with referrer
    await prisma.user.update({
      where: { id: userId },
      data: { referredBy: referrer.id },
    });

    // Award points to both users
    await Promise.all([
      prisma.user.update({
        where: { id: referrer.id },
        data: { loyaltyPoints: { increment: 100 } },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { loyaltyPoints: { increment: 50 } },
      }),
      prisma.loyaltyTransaction.create({
        data: {
          userId: referrer.id,
          type: 'REFERRAL_BONUS',
          points: 100,
          description: 'Referral bonus',
        },
      }),
      prisma.loyaltyTransaction.create({
        data: {
          userId,
          type: 'EARNED',
          points: 50,
          description: 'Sign-up bonus via referral',
        },
      }),
    ]);

    res.json({ message: 'Referral code applied successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Redeem points (convert to discount code or cash)
router.post('/redeem', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const { points, type } = req.body; // type: DISCOUNT_CODE, CASH

    if (!points || points <= 0) {
      return res.status(400).json({ message: 'Invalid points amount' });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.loyaltyPoints < points) {
      return res.status(400).json({ message: 'Insufficient points' });
    }

    // Deduct points
    await prisma.user.update({
      where: { id: userId },
      data: { loyaltyPoints: { decrement: points } },
    });

    // Record transaction
    await prisma.loyaltyTransaction.create({
      data: {
        userId,
        type: 'REDEEMED',
        points: -points,
        description: `Redeemed ${points} points for ${type}`,
      },
    });

    res.json({ message: 'Points redeemed successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

