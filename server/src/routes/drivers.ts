import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Get all drivers
router.get('/', async (req, res) => {
  try {
    const { isActive } = req.query;
    const where: any = {};
    
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const drivers = await prisma.driver.findMany({
      where,
      include: {
        _count: {
          select: {
            trips: true,
          },
        },
      },
      orderBy: { lastName: 'asc' },
    });
    res.json(drivers);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get driver by ID
router.get('/:id', async (req, res) => {
  try {
    const driver = await prisma.driver.findUnique({
      where: { id: req.params.id },
      include: {
        trips: {
          where: {
            status: { in: ['SCHEDULED', 'IN_PROGRESS'] },
          },
          include: {
            route: true,
            origin: true,
            destination: true,
            bus: true,
          },
        },
        _count: {
          select: {
            trips: true,
          },
        },
      },
    });

    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    res.json(driver);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Create driver (Admin/Staff only)
router.post('/', authenticate, authorize('ADMIN', 'STAFF'), async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      dateOfBirth,
      phoneNumber,
      driversLicense,
      licenseExpiryDate,
      bloodGroup,
      nextOfKinName,
      nextOfKinPhone,
      nextOfKinRelation,
      homeAddress,
      yearsInService,
      isActive,
    } = req.body;

    // Check if driver license already exists
    const existingDriver = await prisma.driver.findUnique({
      where: { driversLicense },
    });

    if (existingDriver) {
      return res.status(400).json({ message: 'Driver with this license number already exists' });
    }

    const driver = await prisma.driver.create({
      data: {
        firstName,
        lastName,
        dateOfBirth: new Date(dateOfBirth),
        phoneNumber,
        driversLicense,
        licenseExpiryDate: new Date(licenseExpiryDate),
        bloodGroup,
        nextOfKinName,
        nextOfKinPhone,
        nextOfKinRelation,
        homeAddress,
        yearsInService: yearsInService || 0,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    res.status(201).json(driver);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Update driver (Admin/Staff only)
router.put('/:id', authenticate, authorize('ADMIN', 'STAFF'), async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      dateOfBirth,
      phoneNumber,
      driversLicense,
      licenseExpiryDate,
      bloodGroup,
      nextOfKinName,
      nextOfKinPhone,
      nextOfKinRelation,
      homeAddress,
      yearsInService,
      isActive,
    } = req.body;

    const existing = await prisma.driver.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    // Check if license is being changed and if new license exists
    if (driversLicense && driversLicense !== existing.driversLicense) {
      const licenseExists = await prisma.driver.findUnique({ where: { driversLicense } });
      if (licenseExists) {
        return res.status(400).json({ message: 'Driver with this license number already exists' });
      }
    }

    const driver = await prisma.driver.update({
      where: { id: req.params.id },
      data: {
        firstName,
        lastName,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        phoneNumber,
        driversLicense,
        licenseExpiryDate: licenseExpiryDate ? new Date(licenseExpiryDate) : undefined,
        bloodGroup,
        nextOfKinName,
        nextOfKinPhone,
        nextOfKinRelation,
        homeAddress,
        yearsInService,
        isActive,
      },
    });

    res.json(driver);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get current driver's profile (Driver only)
router.get('/me', authenticate, authorize('DRIVER'), async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { driver: true },
    });

    if (!user || !user.driver) {
      return res.status(403).json({ message: 'User is not linked to a driver account' });
    }

    const driver = await prisma.driver.findUnique({
      where: { id: user.driver.id },
      include: {
        _count: {
          select: {
            trips: true,
          },
        },
      },
    });

    res.json(driver);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Delete driver (Admin only)
router.delete('/:id', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const driver = await prisma.driver.findUnique({
      where: { id: req.params.id },
      include: {
        trips: {
          where: {
            status: { in: ['SCHEDULED', 'IN_PROGRESS'] },
          },
        },
      },
    });

    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    // Check if driver has active trips
    if (driver.trips.length > 0) {
      return res.status(400).json({
        message: 'Cannot delete driver with active trips. Please reassign trips first.',
      });
    }

    await prisma.driver.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Driver deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

