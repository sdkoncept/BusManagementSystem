import express from 'express';
import { PrismaClient, TripStatus } from '@prisma/client';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Get all trips with filters
router.get('/', async (req, res) => {
  try {
    const { routeId, status, originId, destinationId, date, busId, availableOnly, includeCompleted } = req.query;
    const where: any = {};

    if (routeId) where.routeId = routeId as string;
    if (status) where.status = status as TripStatus;
    if (originId) where.originId = originId as string;
    if (destinationId) where.destinationId = destinationId as string;
    if (busId) where.busId = busId as string;
    
    // Filter by date (default to today if not specified and availableOnly is true)
    if (date) {
      const startDate = new Date(date as string);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date as string);
      endDate.setHours(23, 59, 59, 999);
      where.departureTime = {
        gte: startDate,
        lte: endDate,
      };
    } else if (availableOnly === 'true') {
      // Default to today for passenger view
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      where.departureTime = {
        gte: today,
        lt: tomorrow,
      };
    }

    // For passenger view, only show trips with bus and driver assigned
    if (availableOnly === 'true') {
      where.busId = { not: null };
      where.driverId = { not: null };
      where.status = { in: ['SCHEDULED', 'IN_PROGRESS'] };
    } else if (includeCompleted !== 'true') {
      // By default, exclude completed trips from admin view unless explicitly requested
      where.status = { not: 'COMPLETED' };
    }

    let trips;
    // Try simpler query first to avoid relation issues
    try {
      trips = await prisma.trip.findMany({
        where,
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
              manufacturer: true,
              year: true,
              capacity: true,
              isActive: true,
            },
          },
          origin: {
            select: {
              id: true,
              name: true,
              city: true,
              state: true,
            },
          },
          destination: {
            select: {
              id: true,
              name: true,
              city: true,
              state: true,
            },
          },
          driver: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phoneNumber: true,
            },
          },
        },
        orderBy: { departureTime: 'asc' },
      });

      // Manually count seats and bookings for each trip (if tables exist)
      for (const trip of trips) {
        try {
          let availableSeats = trip.bus?.capacity || 0;
          let bookingCount = 0;
          
          // Try to count seats if Seat model exists
          try {
            availableSeats = await prisma.seat.count({
              where: {
                tripId: trip.id,
                status: 'AVAILABLE',
              },
            });
          } catch (seatError: any) {
            // Seat table might not exist or have issues - use bus capacity as fallback
            console.warn(`Could not count seats for trip ${trip.id}, using bus capacity`);
          }
          
          // Try to count bookings
          try {
            bookingCount = await prisma.booking.count({
              where: {
                tripId: trip.id,
                status: { in: ['PENDING', 'CONFIRMED'] },
              },
            });
          } catch (bookingError: any) {
            console.warn(`Could not count bookings for trip ${trip.id}`);
          }
          
          (trip as any).availableSeats = availableSeats;
          (trip as any).seats = [];
          (trip as any)._count = {
            bookings: bookingCount,
            seats: availableSeats,
          };
        } catch (countError: any) {
          console.warn(`Error processing trip ${trip.id}:`, countError.message);
          (trip as any).availableSeats = trip.bus?.capacity || 0;
          (trip as any).seats = [];
          (trip as any)._count = {
            bookings: 0,
            seats: trip.bus?.capacity || 0,
          };
        }
      }
    } catch (error: any) {
      console.error('Error fetching trips:', error);
      console.error('Error code:', error.code);
      console.error('Error meta:', error.meta);
      // If schedule table doesn't exist, fetch without it
      if (error.message?.includes('route_schedules') || error.message?.includes('does not exist')) {
        try {
          trips = await prisma.trip.findMany({
            where,
            include: {
              route: true,
              bus: {
                select: {
                  id: true,
                  plateNumber: true,
                  model: true,
                  manufacturer: true,
                  year: true,
                  capacity: true,
                  seatLayout: true,
                  amenities: true,
                  isActive: true,
                  // vehicleType might not exist yet if migration not run
                },
              },
              origin: true,
              destination: true,
              driver: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  phoneNumber: true,
                  driversLicense: true,
                },
              },
              seats: {
                where: {
                  status: 'AVAILABLE',
                },
              },
              _count: {
                select: {
                  bookings: true,
                  seats: true,
                },
              },
            },
            orderBy: { departureTime: 'asc' },
          });
        } catch (retryError: any) {
          console.error('Retry error:', retryError);
          throw retryError;
        }
      } else if (error.message?.includes('vehicleType') || error.message?.includes('column') || error.code === 'P2021') {
        // Handle missing vehicleType column - try without it
        console.warn('vehicleType column may not exist, fetching without it');
        try {
          trips = await prisma.trip.findMany({
            where,
            include: {
              route: true,
              bus: {
                select: {
                  id: true,
                  plateNumber: true,
                  model: true,
                  manufacturer: true,
                  year: true,
                  capacity: true,
                  seatLayout: true,
                  amenities: true,
                  isActive: true,
                },
              },
              origin: true,
              destination: true,
              driver: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  phoneNumber: true,
                  driversLicense: true,
                },
              },
              seats: {
                where: {
                  status: 'AVAILABLE',
                },
              },
              _count: {
                select: {
                  bookings: true,
                  seats: true,
                },
              },
            },
            orderBy: { departureTime: 'asc' },
          });
        } catch (retryError2: any) {
          console.error('Retry error after vehicleType fix:', retryError2);
          throw retryError2;
        }
      } else {
        // Try a simpler query as fallback
        console.warn('Attempting simpler query as fallback. Original error:', error.message);
        try {
          trips = await prisma.trip.findMany({
            where,
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
                  manufacturer: true,
                  year: true,
                  capacity: true,
                  isActive: true,
                },
              },
              origin: {
                select: {
                  id: true,
                  name: true,
                  city: true,
                  state: true,
                },
              },
              destination: {
                select: {
                  id: true,
                  name: true,
                  city: true,
                  state: true,
                },
              },
              driver: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  phoneNumber: true,
                },
              },
            },
            orderBy: { departureTime: 'asc' },
          });
          
          // Manually add seat and booking counts
          for (const trip of trips) {
            try {
              const seatCount = await prisma.seat.count({
                where: {
                  tripId: trip.id,
                  status: 'AVAILABLE',
                },
              });
              const bookingCount = await prisma.booking.count({
                where: {
                  tripId: trip.id,
                  status: { in: ['PENDING', 'CONFIRMED'] },
                },
              });
              (trip as any).availableSeats = seatCount;
              (trip as any).isAvailable = trip.bus && trip.driver && trip.status !== 'CANCELLED' && trip.status !== 'COMPLETED';
              (trip as any)._count = {
                bookings: bookingCount,
                seats: seatCount,
              };
            } catch (countError) {
              console.warn('Error counting seats/bookings for trip:', trip.id, countError);
              (trip as any).availableSeats = trip.bus?.capacity || 0;
              (trip as any).isAvailable = trip.bus && trip.driver && trip.status !== 'CANCELLED' && trip.status !== 'COMPLETED';
              (trip as any)._count = {
                bookings: 0,
                seats: trip.bus?.capacity || 0,
              };
            }
          }
        } catch (fallbackError: any) {
          console.error('Fallback query also failed:', fallbackError);
          throw error; // Throw original error
        }
      }
    }

    // Add availability info for passenger view
    const tripsWithAvailability = trips.map((trip: any) => ({
      ...trip,
      availableSeats: trip.availableSeats ?? trip.seats?.length ?? trip.bus?.capacity ?? 0,
      isAvailable: trip.bus && trip.driver && trip.status !== 'CANCELLED' && trip.status !== 'COMPLETED',
      seats: trip.seats || [],
    }));

    res.json(tripsWithAvailability);
  } catch (error: any) {
    console.error('Error in GET /trips:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack
    });
    res.status(500).json({ 
      message: error.message || 'Failed to fetch trips',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      code: error.code
    });
  }
});

// Get trip by ID with seat availability
router.get('/:id', async (req, res) => {
  try {
    const trip = await prisma.trip.findUnique({
      where: { id: req.params.id },
      include: {
        route: {
          include: {
            routeStations: {
              include: {
                station: true,
              },
              orderBy: { order: 'asc' },
            },
          },
        },
        bus: true,
        origin: true,
        destination: true,
        driver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phoneNumber: true,
            driversLicense: true,
          },
        },
        seats: {
          orderBy: { seatNumber: 'asc' },
        },
        bookings: {
          where: {
            status: { in: ['PENDING', 'CONFIRMED'] },
          },
          select: {
            id: true,
            seatNumbers: true,
            passengerName: true,
          },
        },
      },
    });

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    res.json(trip);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Create trip (Admin/Staff only)
router.post('/', authenticate, authorize('ADMIN', 'STAFF'), async (req, res) => {
  try {
    const {
      routeId,
      busId,
      driverId,
      originId,
      destinationId,
      departureTime,
      arrivalTime,
      price,
    } = req.body;

    // Validate bus exists
    const bus = await prisma.bus.findUnique({ where: { id: busId } });
    if (!bus) {
      return res.status(404).json({ message: 'Bus not found' });
    }

    // Create trip
    const trip = await prisma.trip.create({
      data: {
        routeId,
        busId,
        driverId,
        originId,
        destinationId,
        departureTime: new Date(departureTime),
        arrivalTime: new Date(arrivalTime),
        price,
        status: 'SCHEDULED',
      },
      include: {
        route: true,
        bus: true,
        origin: true,
        destination: true,
      },
    });

    // Initialize seat statuses
    const seatNumbers = Array.from({ length: bus.capacity }, (_, i) => String(i + 1));
    await prisma.seat.createMany({
      data: seatNumbers.map((seatNumber) => ({
        tripId: trip.id,
        seatNumber,
        status: 'AVAILABLE',
      })),
    });

    const tripWithSeats = await prisma.trip.findUnique({
      where: { id: trip.id },
      include: {
        seats: true,
      },
    });

    res.status(201).json(tripWithSeats);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Update trip (Admin/Staff only)
router.put('/:id', authenticate, authorize('ADMIN', 'STAFF'), async (req, res) => {
  try {
    const {
      routeId,
      busId,
      driverId,
      originId,
      destinationId,
      departureTime,
      arrivalTime,
      price,
      status,
      currentLocation,
      delayMinutes,
    } = req.body;

    const trip = await prisma.trip.findUnique({ where: { id: req.params.id } });
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    const updatedTrip = await prisma.trip.update({
      where: { id: req.params.id },
      data: {
        routeId: routeId || undefined,
        busId: busId || undefined,
        driverId: driverId || null,
        originId: originId || undefined,
        destinationId: destinationId || undefined,
        departureTime: departureTime ? new Date(departureTime) : undefined,
        arrivalTime: arrivalTime ? new Date(arrivalTime) : undefined,
        price: price !== undefined ? price : undefined,
        status: status || undefined,
        currentLocation: currentLocation !== undefined ? currentLocation : undefined,
        delayMinutes: delayMinutes !== undefined ? delayMinutes : undefined,
      },
      include: {
        route: {
          include: {
            schedule: true,
          },
        },
        bus: true,
        origin: true,
        destination: true,
        driver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phoneNumber: true,
            driversLicense: true,
          },
        },
        seats: {
          where: {
            status: 'AVAILABLE',
          },
        },
        _count: {
          select: {
            bookings: true,
          },
        },
      },
    });

    res.json(updatedTrip);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Update trip location (for tracking) - Staff/Driver only
router.patch('/:id/location', authenticate, authorize('ADMIN', 'STAFF'), async (req, res) => {
  try {
    const { currentLocation, status, latitude, longitude, estimatedArrival, passengerCount } = req.body;

    const trip = await prisma.trip.findUnique({ where: { id: req.params.id } });
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    const updatedTrip = await prisma.trip.update({
      where: { id: req.params.id },
      data: {
        currentLocation,
        currentLatitude: latitude,
        currentLongitude: longitude,
        estimatedArrival: estimatedArrival ? new Date(estimatedArrival) : undefined,
        passengerCount: passengerCount !== undefined ? passengerCount : undefined,
        status: status || trip.status,
      },
      include: {
        route: true,
        bus: true,
        origin: true,
        destination: true,
      },
    });

    res.json(updatedTrip);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Assign driver to trip (Admin/Staff only)
router.patch('/:id/assign-driver', authenticate, authorize('ADMIN', 'STAFF'), async (req, res) => {
  try {
    const { driverId } = req.body;

    const trip = await prisma.trip.findUnique({ where: { id: req.params.id } });
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // If driver is being assigned, check for conflicts
    if (driverId) {
      const driver = await prisma.driver.findUnique({ where: { id: driverId } });
      if (!driver) {
        return res.status(404).json({ message: 'Driver not found' });
      }

      if (!driver.isActive) {
        return res.status(400).json({ message: 'Driver is not active' });
      }

      // Check if driver is already assigned to another trip at the same time
      const conflictingTrip = await prisma.trip.findFirst({
        where: {
          driverId,
          id: { not: req.params.id },
          status: { in: ['SCHEDULED', 'IN_PROGRESS'] },
          OR: [
            {
              departureTime: {
                lte: trip.arrivalTime,
                gte: trip.departureTime,
              },
            },
            {
              arrivalTime: {
                lte: trip.arrivalTime,
                gte: trip.departureTime,
              },
            },
          ],
        },
      });

      if (conflictingTrip) {
        return res.status(400).json({
          message: 'Driver is already assigned to another trip during this time',
        });
      }
    }

    const updatedTrip = await prisma.trip.update({
      where: { id: req.params.id },
      data: { driverId: driverId || null },
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
            phoneNumber: true,
            driversLicense: true,
          },
        },
      },
    });

    res.json(updatedTrip);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Assign bus to trip (Admin/Staff only)
router.patch('/:id/assign-bus', authenticate, authorize('ADMIN', 'STAFF'), async (req, res) => {
  try {
    const { busId } = req.body;

    const trip = await prisma.trip.findUnique({ where: { id: req.params.id } });
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    const bus = await prisma.bus.findUnique({ where: { id: busId } });
    if (!bus) {
      return res.status(404).json({ message: 'Bus not found' });
    }

    if (!bus.isActive) {
      return res.status(400).json({ message: 'Bus is not active' });
    }

    // Check if bus is already assigned to another trip at the same time
    const conflictingTrip = await prisma.trip.findFirst({
      where: {
        busId,
        id: { not: req.params.id },
        status: { in: ['SCHEDULED', 'IN_PROGRESS'] },
        OR: [
          {
            departureTime: {
              lte: trip.arrivalTime,
              gte: trip.departureTime,
            },
          },
          {
            arrivalTime: {
              lte: trip.arrivalTime,
              gte: trip.departureTime,
            },
          },
        ],
      },
    });

    if (conflictingTrip) {
      return res.status(400).json({
        message: 'Bus is already assigned to another trip during this time',
      });
    }

    // Update seats if bus capacity changed
    const currentSeats = await prisma.seat.count({ where: { tripId: trip.id } });
    if (bus.capacity !== currentSeats) {
      // Delete old seats
      await prisma.seat.deleteMany({ where: { tripId: trip.id } });
      // Create new seats
      const seatNumbers = Array.from({ length: bus.capacity }, (_, i) => String(i + 1));
      await prisma.seat.createMany({
        data: seatNumbers.map((seatNumber) => ({
          tripId: trip.id,
          seatNumber,
          status: 'AVAILABLE',
        })),
      });
    }

    const updatedTrip = await prisma.trip.update({
      where: { id: req.params.id },
      data: { busId },
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
            phoneNumber: true,
            driversLicense: true,
          },
        },
      },
    });

    res.json(updatedTrip);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get completed trips (Admin/Staff only)
router.get('/completed', authenticate, authorize('ADMIN', 'STAFF'), async (req, res) => {
  try {
    const { routeId, originId, destinationId, startDate, endDate } = req.query;
    const where: any = {
      status: 'COMPLETED',
    };

    if (routeId) where.routeId = routeId as string;
    if (originId) where.originId = originId as string;
    if (destinationId) where.destinationId = destinationId as string;
    
    if (startDate || endDate) {
      where.departureTime = {};
      if (startDate) {
        const start = new Date(startDate as string);
        start.setHours(0, 0, 0, 0);
        where.departureTime.gte = start;
      }
      if (endDate) {
        const end = new Date(endDate as string);
        end.setHours(23, 59, 59, 999);
        where.departureTime.lte = end;
      }
    }

    const trips = await prisma.trip.findMany({
      where,
      include: {
        route: {
          include: {
            schedule: true,
          },
        },
        bus: {
          select: {
            id: true,
            plateNumber: true,
            model: true,
            capacity: true,
          },
        },
        driver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phoneNumber: true,
            driversLicense: true,
          },
        },
        origin: {
          select: {
            id: true,
            name: true,
            code: true,
            city: true,
          },
        },
        destination: {
          select: {
            id: true,
            name: true,
            code: true,
            city: true,
          },
        },
        _count: {
          select: {
            bookings: true,
          },
        },
      },
      orderBy: { departureTime: 'desc' }, // Most recent first
    });

    res.json(trips);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get assignments monitoring (Admin/Staff only)
router.get('/monitoring/assignments', authenticate, authorize('ADMIN', 'STAFF'), async (req, res) => {
  try {
    const { date, status } = req.query;

    const where: any = {};
    if (date) {
      const startDate = new Date(date as string);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date as string);
      endDate.setHours(23, 59, 59, 999);
      where.departureTime = {
        gte: startDate,
        lte: endDate,
      };
    }
    if (status) {
      where.status = status;
    }

    const trips = await prisma.trip.findMany({
      where,
      include: {
        route: true,
        bus: {
          select: {
            id: true,
            plateNumber: true,
            model: true,
            capacity: true,
            isActive: true,
          },
        },
        driver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phoneNumber: true,
            driversLicense: true,
            isActive: true,
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
        _count: {
          select: {
            bookings: true,
          },
        },
      },
      orderBy: { departureTime: 'asc' },
    });

    // Get unassigned buses and drivers
    const tripDateFilter = date
      ? {
          departureTime: {
            gte: new Date(date as string),
            lte: new Date(new Date(date as string).setHours(23, 59, 59, 999)),
          },
        }
      : {};

    const allBuses = await prisma.bus.findMany({
      where: { isActive: true },
      include: {
        trips: {
          where: {
            status: { in: ['SCHEDULED', 'IN_PROGRESS'] },
            ...tripDateFilter,
          },
        },
      },
    });

    const allDrivers = await prisma.driver.findMany({
      where: { isActive: true },
      include: {
        trips: {
          where: {
            status: { in: ['SCHEDULED', 'IN_PROGRESS'] },
            ...tripDateFilter,
          },
        },
      },
    });

    res.json({
      trips,
      unassignedBuses: allBuses.filter((bus) => bus.trips.length === 0),
      unassignedDrivers: allDrivers.filter((driver) => driver.trips.length === 0),
      busAssignments: allBuses.map((bus) => ({
        bus,
        assignedTrips: bus.trips,
      })),
      driverAssignments: allDrivers.map((driver) => ({
        driver,
        assignedTrips: driver.trips,
      })),
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Generate daily trips for all active routes (Admin/Staff only)
router.post('/generate-daily', authenticate, authorize('ADMIN', 'STAFF'), async (req, res) => {
  try {
    const { date } = req.body;
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);

    // Get all active routes with schedules
    let routes;
    try {
      routes = await prisma.route.findMany({
        where: { isActive: true },
        include: {
          schedule: true,
          routeStations: {
            include: {
              station: true,
            },
            orderBy: { order: 'asc' },
          },
        },
      });
    } catch (error: any) {
      if (error.message?.includes('route_schedules') || error.message?.includes('does not exist')) {
        return res.status(500).json({ 
          message: 'Route schedules table not found. Please run the migration: server/prisma/migration_add_route_schedule.sql in Supabase SQL Editor',
          error: error.message 
        });
      }
      throw error;
    }

    const generatedTrips: any[] = [];
    const errors: string[] = [];

    for (const route of routes) {
      if (!route.schedule || !route.schedule.isActive) {
        continue; // Skip routes without active schedules
      }

      const { startTime, endTime, interval, price } = route.schedule;
      const [startHour, startMinute] = startTime.split(':').map(Number);
      const [endHour, endMinute] = endTime.split(':').map(Number);

      const startDateTime = new Date(targetDate);
      startDateTime.setHours(startHour, startMinute, 0, 0);

      const endDateTime = new Date(targetDate);
      endDateTime.setHours(endHour, endMinute, 0, 0);

      // Get origin and destination from route stations
      const originStation = route.routeStations[0]?.station;
      const destinationStation = route.routeStations[route.routeStations.length - 1]?.station;

      if (!originStation || !destinationStation) {
        errors.push(`Route ${route.name} is missing origin or destination stations`);
        continue;
      }

      // Get available buses and drivers for this date
      const availableBuses = await prisma.bus.findMany({
        where: {
          isActive: true,
          trips: {
            none: {
              status: { in: ['SCHEDULED', 'IN_PROGRESS'] },
              departureTime: {
                gte: startDateTime,
                lte: endDateTime,
              },
            },
          },
        },
      });

      const availableDrivers = await prisma.driver.findMany({
        where: {
          isActive: true,
          trips: {
            none: {
              status: { in: ['SCHEDULED', 'IN_PROGRESS'] },
              departureTime: {
                gte: startDateTime,
                lte: endDateTime,
              },
            },
          },
        },
      });

      if (availableBuses.length === 0) {
        errors.push(`No available buses for route ${route.name} on ${targetDate.toDateString()}`);
        continue;
      }

      if (availableDrivers.length === 0) {
        errors.push(`No available drivers for route ${route.name} on ${targetDate.toDateString()}`);
        continue;
      }

      // Generate trips at intervals
      let currentTime = new Date(startDateTime);
      let busIndex = 0;
      let driverIndex = 0;

      while (currentTime <= endDateTime) {
        // Check if trip already exists for this route and time
        const existingTrip = await prisma.trip.findFirst({
          where: {
            routeId: route.id,
            departureTime: {
              gte: new Date(currentTime.getTime() - 5 * 60000), // 5 minutes before
              lte: new Date(currentTime.getTime() + 5 * 60000), // 5 minutes after
            },
          },
        });

        if (!existingTrip) {
          const bus = availableBuses[busIndex % availableBuses.length];
          const driver = availableDrivers[driverIndex % availableDrivers.length];

          // Calculate arrival time
          const arrivalTime = new Date(currentTime);
          arrivalTime.setMinutes(arrivalTime.getMinutes() + (route.duration || 0));

          try {
            const trip = await prisma.trip.create({
              data: {
                routeId: route.id,
                busId: bus.id,
                driverId: driver.id,
                originId: originStation.id,
                destinationId: destinationStation.id,
                departureTime: currentTime,
                arrivalTime: arrivalTime,
                price: price || 0,
                status: 'SCHEDULED',
              },
            });

            // Initialize seats
            const seatNumbers = Array.from({ length: bus.capacity }, (_, i) => String(i + 1));
            await prisma.seat.createMany({
              data: seatNumbers.map((seatNumber) => ({
                tripId: trip.id,
                seatNumber,
                status: 'AVAILABLE',
              })),
            });

            generatedTrips.push(trip);
            busIndex++;
            driverIndex++;
          } catch (error: any) {
            errors.push(`Failed to create trip for ${route.name} at ${currentTime.toLocaleTimeString()}: ${error.message}`);
          }
        }

        // Move to next interval
        currentTime = new Date(currentTime.getTime() + interval * 60000);
      }
    }

    res.json({
      message: `Generated ${generatedTrips.length} trips for ${targetDate.toDateString()}`,
      generated: generatedTrips.length,
      trips: generatedTrips,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Delete trip (Admin only)
router.delete('/:id', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const trip = await prisma.trip.findUnique({ where: { id: req.params.id } });
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    await prisma.trip.delete({ where: { id: req.params.id } });
    res.json({ message: 'Trip deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get driver's trips (for driver mobile app)
router.get('/driver/my-trips', authenticate, authorize('DRIVER'), async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    
    // Find driver linked to this user (by driverId or by matching name/phone)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { driver: true },
    });

    let driverId: string | null = null;

    // If user has driverId, use it
    if (user?.driverId) {
      driverId = user.driverId;
    } else if (user?.driver) {
      // If user has driver relation, use that
      driverId = user.driver.id;
    } else {
      // Try to find driver by matching name or phone
      const driver = await prisma.driver.findFirst({
        where: {
          OR: [
            { phoneNumber: user?.phone || '' },
            { 
              AND: [
                { firstName: { contains: user?.firstName || '', mode: 'insensitive' } },
                { lastName: { contains: user?.lastName || '', mode: 'insensitive' } }
              ]
            }
          ]
        }
      });
      
      if (driver) {
        driverId = driver.id;
        // Link the user to the driver
        await prisma.user.update({
          where: { id: userId },
          data: { driverId: driver.id }
        });
      }
    }

    if (!driverId) {
      return res.status(403).json({ message: 'User is not linked to a driver account. Please contact admin.' });
    }

    const { status, date } = req.query;
    const where: any = {
      driverId: driverId,
    };

    if (status) {
      where.status = status as TripStatus;
    }

    if (date) {
      const startDate = new Date(date as string);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date as string);
      endDate.setHours(23, 59, 59, 999);
      where.departureTime = {
        gte: startDate,
        lte: endDate,
      };
    } else {
      // Default to today and future trips
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      where.departureTime = {
        gte: today,
      };
    }

    const trips = await prisma.trip.findMany({
      where,
      include: {
        route: {
          include: {
            schedule: true,
          },
        },
        bus: {
          select: {
            id: true,
            plateNumber: true,
            model: true,
            capacity: true,
          },
        },
        origin: {
          select: {
            id: true,
            name: true,
            city: true,
            address: true,
          },
        },
        destination: {
          select: {
            id: true,
            name: true,
            city: true,
            address: true,
          },
        },
        _count: {
          select: {
            bookings: true,
          },
        },
      },
      orderBy: { departureTime: 'asc' },
    });

    res.json(trips);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get driver's trip history with filters (Driver only)
router.get('/driver/history', authenticate, authorize('DRIVER'), async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    
    // Find driver linked to this user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { driver: true },
    });

    if (!user || !user.driver) {
      return res.status(403).json({ message: 'User is not linked to a driver account' });
    }

    const { period, status } = req.query; // period: 'week', 'month', 'year'
    
    const where: any = {
      driverId: user.driver.id,
      status: { in: ['COMPLETED', 'CANCELLED'] }, // Only completed/cancelled trips for history
    };

    // Calculate date range based on period
    const now = new Date();
    let startDate = new Date();
    
    if (period === 'week') {
      startDate.setDate(now.getDate() - 7);
    } else if (period === 'month') {
      startDate.setMonth(now.getMonth() - 1);
    } else if (period === 'year') {
      startDate.setFullYear(now.getFullYear() - 1);
    } else {
      // Default: all time
      startDate = new Date(0); // Beginning of time
    }

    where.departureTime = {
      gte: startDate,
      lte: now,
    };

    if (status) {
      where.status = status as TripStatus;
    }

    const trips = await prisma.trip.findMany({
      where,
      include: {
        route: {
          select: {
            id: true,
            name: true,
            distance: true,
            duration: true,
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
            city: true,
            address: true,
            state: true,
          },
        },
        destination: {
          select: {
            id: true,
            name: true,
            city: true,
            address: true,
            state: true,
          },
        },
        _count: {
          select: {
            bookings: {
              where: {
                status: { in: ['CONFIRMED', 'COMPLETED'] },
              },
            },
          },
        },
      },
      orderBy: { departureTime: 'desc' },
    });

    res.json(trips);
  } catch (error: any) {
    console.error('Error fetching driver trip history:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
