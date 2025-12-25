import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Create or update trip review
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const { tripId, rating, comment, driverRating } = req.body;

    if (!tripId || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Trip ID and rating (1-5) are required' });
    }

    // Check if user has completed this trip
    const booking = await prisma.booking.findFirst({
      where: {
        userId,
        tripId,
        status: { in: ['CONFIRMED', 'COMPLETED'] },
      },
    });

    if (!booking) {
      return res.status(403).json({ message: 'You can only review trips you have booked' });
    }

    const review = await prisma.tripReview.upsert({
      where: {
        userId_tripId: {
          userId,
          tripId,
        },
      },
      update: {
        rating,
        comment,
        driverRating,
      },
      create: {
        userId,
        tripId,
        rating,
        comment,
        driverRating,
      },
    });

    // Update trip and driver ratings
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: { reviews: true, driver: true },
    });

    if (trip) {
      const avgRating = trip.reviews.reduce((sum, r) => sum + r.rating, 0) / trip.reviews.length;
      
      if (trip.driver && driverRating) {
        const driverTrips = await prisma.trip.findMany({
          where: { driverId: trip.driverId },
          include: { reviews: { where: { driverRating: { not: null } } } },
        });
        
        const driverRatings = driverTrips.flatMap(t => t.reviews.map(r => r.driverRating!));
        const avgDriverRating = driverRatings.reduce((sum, r) => sum + r, 0) / driverRatings.length;
        
        await prisma.driver.update({
          where: { id: trip.driverId },
          data: { rating: avgDriverRating as any },
        });
      }
    }

    res.status(201).json(review);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get reviews for a trip
router.get('/trip/:tripId', async (req, res) => {
  try {
    const reviews = await prisma.tripReview.findMany({
      where: { tripId: req.params.tripId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(reviews);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get user's reviews
router.get('/my-reviews', authenticate, async (req: AuthRequest, res) => {
  try {
    const reviews = await prisma.tripReview.findMany({
      where: { userId: req.user!.id },
      include: {
        trip: {
          include: {
            origin: true,
            destination: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(reviews);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

