import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Get revenue analytics
router.get('/revenue', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const { period } = req.query; // 'day', 'week', 'month', 'year'

    let startDate: Date;
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    switch (period) {
      case 'day':
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        break;
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

    const bookings = await prisma.booking.findMany({
      where: {
        bookingDate: {
          gte: startDate,
          lte: endDate,
        },
        status: { in: ['CONFIRMED', 'COMPLETED'] },
      },
      include: {
        trip: {
          include: {
            route: true,
            origin: true,
            destination: true,
          },
        },
      },
    });

    const totalRevenue = bookings.reduce((sum, b) => sum + b.totalAmount, 0);
    const totalBookings = bookings.length;
    const averageBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;

    // Revenue by route
    const revenueByRoute = bookings.reduce((acc: any, booking) => {
      const routeName = booking.trip.route.name;
      if (!acc[routeName]) {
        acc[routeName] = { revenue: 0, bookings: 0 };
      }
      acc[routeName].revenue += booking.totalAmount;
      acc[routeName].bookings += 1;
      return acc;
    }, {});

    // Daily revenue breakdown
    const dailyRevenue = bookings.reduce((acc: any, booking) => {
      const date = new Date(booking.bookingDate).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date] += booking.totalAmount;
      return acc;
    }, {});

    res.json({
      totalRevenue,
      totalBookings,
      averageBookingValue,
      revenueByRoute,
      dailyRevenue,
      period,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get route profitability
router.get('/routes/profitability', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const routes = await prisma.route.findMany({
      include: {
        trips: {
          include: {
            bookings: {
              where: {
                status: { in: ['CONFIRMED', 'COMPLETED'] },
              },
            },
          },
        },
      },
    });

    const profitability = routes.map((route) => {
      const totalRevenue = route.trips.reduce(
        (sum, trip) => sum + trip.bookings.reduce((s, b) => s + b.totalAmount, 0),
        0
      );
      const totalTrips = route.trips.length;
      const totalBookings = route.trips.reduce((sum, trip) => sum + trip.bookings.length, 0);
      const averageRevenuePerTrip = totalTrips > 0 ? totalRevenue / totalTrips : 0;

      return {
        routeId: route.id,
        routeName: route.name,
        routeCode: route.code,
        totalRevenue,
        totalTrips,
        totalBookings,
        averageRevenuePerTrip,
        utilizationRate: totalTrips > 0 ? (totalBookings / (totalTrips * 50)) * 100 : 0, // Assuming 50 seats average
      };
    });

    res.json(profitability.sort((a, b) => b.totalRevenue - a.totalRevenue));
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get peak hours analysis
router.get('/peak-hours', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: {
        status: { in: ['CONFIRMED', 'COMPLETED'] },
      },
      include: {
        trip: {
          select: {
            departureTime: true,
          },
        },
      },
    });

    const hourlyData: any = {};
    bookings.forEach((booking) => {
      const hour = new Date(booking.trip.departureTime).getHours();
      if (!hourlyData[hour]) {
        hourlyData[hour] = { bookings: 0, revenue: 0 };
      }
      hourlyData[hour].bookings += 1;
      hourlyData[hour].revenue += booking.totalAmount;
    });

    res.json(hourlyData);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get customer demographics
router.get('/customers/demographics', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { role: 'RIDER' },
      include: {
        bookings: {
          where: {
            status: { in: ['CONFIRMED', 'COMPLETED'] },
          },
        },
        customerProfile: true,
      },
    });

    const totalCustomers = users.length;
    const activeCustomers = users.filter((u) => u.bookings.length > 0).length;
    const newCustomers = users.filter(
      (u) => new Date(u.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    ).length;

    const customerSegments = {
      new: newCustomers,
      active: activeCustomers - newCustomers,
      inactive: totalCustomers - activeCustomers,
    };

    const topCustomers = users
      .map((u) => ({
        userId: u.id,
        name: `${u.firstName} ${u.lastName}`,
        email: u.email,
        totalBookings: u.bookings.length,
        totalSpent: u.bookings.reduce((sum, b) => sum + b.totalAmount, 0),
        loyaltyPoints: u.loyaltyPoints || 0,
      }))
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10);

    res.json({
      totalCustomers,
      activeCustomers,
      newCustomers,
      customerSegments,
      topCustomers,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get driver performance
router.get('/drivers/performance', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const drivers = await prisma.driver.findMany({
      include: {
        trips: {
          where: {
            status: 'COMPLETED',
          },
          include: {
            bookings: {
              where: {
                status: { in: ['CONFIRMED', 'COMPLETED'] },
              },
            },
            reviews: {
              select: {
                driverRating: true,
              },
            },
          },
        },
        earnings: true,
      },
    });

    const performance = drivers.map((driver) => {
      const completedTrips = driver.trips.length;
      const onTimeTrips = driver.trips.filter(
        (t) => new Date(t.arrivalTime) <= new Date(t.estimatedArrival || t.arrivalTime)
      ).length;
      const onTimeRate = completedTrips > 0 ? (onTimeTrips / completedTrips) * 100 : 0;

      const totalPassengers = driver.trips.reduce(
        (sum, trip) => sum + trip.bookings.length,
        0
      );

      const avgRating =
        driver.trips.reduce(
          (sum, trip) => sum + trip.reviews.reduce((s, r) => s + (r.driverRating || 0), 0),
          0
        ) / driver.trips.reduce((sum, trip) => sum + trip.reviews.length, 0) || 0;

      const totalEarnings = driver.earnings.reduce((sum, e) => sum + e.amount, 0);

      return {
        driverId: driver.id,
        name: `${driver.firstName} ${driver.lastName}`,
        totalTrips: completedTrips,
        onTimeRate,
        totalPassengers,
        averageRating: avgRating || driver.rating,
        totalEarnings,
        yearsInService: driver.yearsInService,
      };
    });

    res.json(performance.sort((a, b) => b.totalTrips - a.totalTrips));
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get bus utilization
router.get('/buses/utilization', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const buses = await prisma.bus.findMany({
      include: {
        trips: {
          include: {
            bookings: {
              where: {
                status: { in: ['CONFIRMED', 'COMPLETED'] },
              },
            },
          },
        },
      },
    });

    const utilization = buses.map((bus) => {
      const totalTrips = bus.trips.length;
      const totalSeatsSold = bus.trips.reduce(
        (sum, trip) => sum + trip.bookings.reduce((s, b) => s + b.seatNumbers.length, 0),
        0
      );
      const totalCapacity = totalTrips * bus.capacity;
      const utilizationRate = totalCapacity > 0 ? (totalSeatsSold / totalCapacity) * 100 : 0;

      return {
        busId: bus.id,
        plateNumber: bus.plateNumber,
        vehicleType: bus.vehicleType,
        capacity: bus.capacity,
        totalTrips,
        totalSeatsSold,
        utilizationRate,
        isActive: bus.isActive,
      };
    });

    res.json(utilization);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get cancellation analysis
router.get('/cancellations', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const where: any = {
      status: 'CANCELLED',
    };

    if (startDate || endDate) {
      where.bookingDate = {};
      if (startDate) {
        where.bookingDate.gte = new Date(startDate as string);
      }
      if (endDate) {
        const end = new Date(endDate as string);
        end.setHours(23, 59, 59, 999);
        where.bookingDate.lte = end;
      }
    }

    const cancellations = await prisma.booking.findMany({
      where,
      include: {
        trip: {
          include: {
            route: true,
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    const totalCancelled = cancellations.length;
    const totalRefunded = cancellations.filter((c) => c.refundAmount && c.refundAmount > 0).length;
    const totalRefundAmount = cancellations.reduce((sum, c) => sum + (c.refundAmount || 0), 0);

    const cancellationsByRoute = cancellations.reduce((acc: any, booking) => {
      const routeName = booking.trip.route.name;
      if (!acc[routeName]) {
        acc[routeName] = 0;
      }
      acc[routeName] += 1;
      return acc;
    }, {});

    res.json({
      totalCancelled,
      totalRefunded,
      totalRefundAmount,
      cancellationsByRoute,
      cancellations: cancellations.slice(0, 50), // Latest 50
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get booking conversion rate
router.get('/conversion', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const { period } = req.query; // 'day', 'week', 'month'

    let startDate: Date;
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    switch (period) {
      case 'day':
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      default:
        startDate = new Date(0);
    }

    const totalBookings = await prisma.booking.count({
      where: {
        bookingDate: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const confirmedBookings = await prisma.booking.count({
      where: {
        bookingDate: {
          gte: startDate,
          lte: endDate,
        },
        status: 'CONFIRMED',
      },
    });

    const cancelledBookings = await prisma.booking.count({
      where: {
        bookingDate: {
          gte: startDate,
          lte: endDate,
        },
        status: 'CANCELLED',
      },
    });

    const conversionRate = totalBookings > 0 ? (confirmedBookings / totalBookings) * 100 : 0;
    const cancellationRate = totalBookings > 0 ? (cancelledBookings / totalBookings) * 100 : 0;

    res.json({
      totalBookings,
      confirmedBookings,
      cancelledBookings,
      conversionRate,
      cancellationRate,
      period,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

