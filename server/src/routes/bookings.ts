import express from 'express';
import { PrismaClient, BookingStatus, SeatStatus } from '@prisma/client';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Get all bookings (with filters)
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { userId, tripId, status, limit, skip } = req.query;
    const where: any = {};

    // Regular users can only see their own bookings
    if (req.user?.role === 'RIDER') {
      where.userId = req.user.id;
    } else if (userId) {
      where.userId = userId as string;
    }

    if (tripId) where.tripId = tripId as string;
    if (status) where.status = status as BookingStatus;

    // Default limit for dashboard (can be overridden)
    const takeLimit = limit ? parseInt(limit as string) : undefined;
    const skipCount = skip ? parseInt(skip as string) : undefined;

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        trip: {
          include: {
            route: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
            bus: {
              select: {
                id: true,
                plateNumber: true,
                model: true,
              },
            },
            origin: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
            destination: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },
      },
      orderBy: { bookingDate: 'desc' },
      take: takeLimit,
      skip: skipCount,
    });

    res.json(bookings);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get booking by ID
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        trip: {
          include: {
            route: true,
            bus: true,
            origin: true,
            destination: true,
            driver: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        seats: true,
      },
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user has permission to view this booking
    if (req.user?.role === 'RIDER' && booking.userId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(booking);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Create booking (Online Reservation)
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { tripId, seatNumbers, passengerName, passengerPhone, passengerEmail } = req.body;

    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Get trip with seat statuses
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        seats: true,
        bus: true,
      },
    });

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    if (trip.status !== 'SCHEDULED' && trip.status !== 'IN_PROGRESS') {
      return res.status(400).json({ message: 'Trip is not available for booking' });
    }

    // Validate seats
    const requestedSeats = Array.isArray(seatNumbers) ? seatNumbers : [seatNumbers];
    const unavailableSeats: string[] = [];

    for (const seatNumber of requestedSeats) {
      const seat = trip.seats.find((s) => s.seatNumber === seatNumber);
      if (!seat || seat.status !== 'AVAILABLE') {
        unavailableSeats.push(seatNumber);
      }
    }

    if (unavailableSeats.length > 0) {
      return res.status(400).json({
        message: 'Some seats are not available',
        unavailableSeats,
      });
    }

    // Calculate total amount
    const totalAmount = trip.price * requestedSeats.length;

    // Generate QR code and ticket number
    const qrCode = `EAGLE-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const ticketNumber = `TKT-${new Date().getFullYear()}${String(Date.now()).slice(-8)}`;

    // Extract special requests and seat preference from body
    const { specialRequests, seatPreference, paymentMethod } = req.body;

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        userId: req.user.id,
        tripId,
        seatNumbers: requestedSeats,
        passengerName,
        passengerPhone,
        passengerEmail,
        totalAmount,
        status: 'CONFIRMED',
        qrCode,
        ticketNumber,
        paymentMethod: paymentMethod || 'CASH',
        paymentStatus: paymentMethod && paymentMethod !== 'CASH' ? 'PENDING' : 'PAID',
        specialRequests: specialRequests ? (typeof specialRequests === 'string' ? specialRequests : JSON.stringify(specialRequests)) : null,
        seatPreference: seatPreference || null,
      },
    });

    // Award loyalty points (if user exists and booking is confirmed)
    if (booking.status === 'CONFIRMED') {
      const pointsEarned = Math.floor(totalAmount / 100); // 1 point per ₦100
      if (pointsEarned > 0) {
        await prisma.user.update({
          where: { id: req.user.id },
          data: { loyaltyPoints: { increment: pointsEarned } },
        });
        await prisma.loyaltyTransaction.create({
          data: {
            userId: req.user.id,
            type: 'EARNED',
            points: pointsEarned,
            description: `Points earned from booking ${ticketNumber}`,
            bookingId: booking.id,
          },
        });
      }
    }

    // Update seat statuses
    await prisma.seat.updateMany({
      where: {
        tripId,
        seatNumber: { in: requestedSeats },
      },
      data: {
        status: 'OCCUPIED',
        bookingId: booking.id,
      },
    });

    const bookingWithDetails = await prisma.booking.findUnique({
      where: { id: booking.id },
      include: {
        trip: {
          include: {
            route: true,
            bus: true,
            origin: true,
            destination: true,
          },
        },
        seats: true,
      },
    });

    res.status(201).json(bookingWithDetails);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Update booking status (Admin/Staff only)
router.patch('/:id/status', authenticate, authorize('ADMIN', 'STAFF'), async (req, res) => {
  try {
    const { status } = req.body;

    const booking = await prisma.booking.findUnique({ where: { id: req.params.id } });
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: req.params.id },
      data: { status },
      include: {
        trip: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // If cancelled, free up seats
    if (status === 'CANCELLED' && booking.status !== 'CANCELLED') {
      await prisma.seat.updateMany({
        where: {
          tripId: booking.tripId,
          seatNumber: { in: booking.seatNumbers },
        },
        data: {
          status: 'AVAILABLE',
          bookingId: null,
        },
      });
    }

    res.json(updatedBooking);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Cancel booking (User can cancel their own)
router.patch('/:id/cancel', authenticate, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const booking = await prisma.booking.findUnique({ where: { id: req.params.id } });
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check permission
    if (req.user.role === 'RIDER' && booking.userId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (booking.status === 'CANCELLED') {
      return res.status(400).json({ message: 'Booking is already cancelled' });
    }

    // Update booking
    const updatedBooking = await prisma.booking.update({
      where: { id: req.params.id },
      data: { status: 'CANCELLED' },
    });

    // Free up seats
    await prisma.seat.updateMany({
      where: {
        tripId: booking.tripId,
        seatNumber: { in: booking.seatNumbers },
      },
      data: {
        status: 'AVAILABLE',
        bookingId: null,
      },
    });

    res.json({ message: 'Booking cancelled successfully', booking: updatedBooking });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
