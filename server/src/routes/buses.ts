import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Get all buses
router.get('/', async (req, res) => {
  try {
    const { isActive } = req.query;
    const where: any = {};
    
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const buses = await prisma.bus.findMany({
      where,
      include: {
        _count: {
          select: {
            trips: true,
          },
        },
      },
      orderBy: { plateNumber: 'asc' },
    });
    res.json(buses);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get bus by ID
router.get('/:id', async (req, res) => {
  try {
    const bus = await prisma.bus.findUnique({
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
          },
        },
      },
    });

    if (!bus) {
      return res.status(404).json({ message: 'Bus not found' });
    }

    res.json(bus);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Create bus (Admin/Staff only)
router.post('/', authenticate, authorize('ADMIN', 'STAFF'), async (req, res) => {
  try {
    const { plateNumber, vehicleType, model, manufacturer, year, capacity, seatLayout, amenities, isActive } = req.body;

    // Check if plate number already exists
    const existing = await prisma.bus.findUnique({ where: { plateNumber } });
    if (existing) {
      return res.status(400).json({ message: 'Bus with this plate number already exists' });
    }

    // Build data object, conditionally include vehicleType if column exists
    const busData: any = {
      plateNumber,
      model,
      manufacturer,
      year,
      capacity,
      seatLayout: typeof seatLayout === 'string' ? seatLayout : JSON.stringify(seatLayout || { rows: Math.ceil(capacity / 4), cols: 4 }),
      amenities: amenities ? (typeof amenities === 'string' ? amenities : JSON.stringify(amenities)) : null,
      isActive: isActive !== undefined ? isActive : true,
    };

    // Only include vehicleType if it's provided (column may not exist yet)
    if (vehicleType !== undefined) {
      busData.vehicleType = vehicleType;
    }

    const bus = await prisma.bus.create({
      data: busData,
    });

    res.status(201).json(bus);
  } catch (error: any) {
    console.error('Error creating bus:', error);
    // If vehicleType column doesn't exist, try without it
    if (error.message?.includes('vehicleType') || error.code === 'P2021') {
      try {
        const { plateNumber, model, manufacturer, year, capacity, seatLayout, amenities, isActive } = req.body;
        const bus = await prisma.bus.create({
          data: {
            plateNumber,
            model,
            manufacturer,
            year,
            capacity,
            seatLayout: typeof seatLayout === 'string' ? seatLayout : JSON.stringify(seatLayout || { rows: Math.ceil(capacity / 4), cols: 4 }),
            amenities: amenities ? (typeof amenities === 'string' ? amenities : JSON.stringify(amenities)) : null,
            isActive: isActive !== undefined ? isActive : true,
          },
        });
        return res.status(201).json(bus);
      } catch (retryError: any) {
        return res.status(500).json({ message: retryError.message || 'Failed to create bus' });
      }
    }
    res.status(500).json({ message: error.message || 'Failed to create bus' });
  }
});

// Update bus (Admin/Staff only)
router.put('/:id', authenticate, authorize('ADMIN', 'STAFF'), async (req, res) => {
  try {
    const { plateNumber, vehicleType, model, manufacturer, year, capacity, seatLayout, amenities, isActive } = req.body;

    const existing = await prisma.bus.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ message: 'Bus not found' });
    }

    // Check if plate number is being changed and if new plate exists
    if (plateNumber && plateNumber !== existing.plateNumber) {
      const plateExists = await prisma.bus.findUnique({ where: { plateNumber } });
      if (plateExists) {
        return res.status(400).json({ message: 'Bus with this plate number already exists' });
      }
    }

    // Build update data, conditionally include vehicleType
    const updateData: any = {
      plateNumber,
      model,
      manufacturer,
      year,
      capacity,
      seatLayout: seatLayout ? (typeof seatLayout === 'string' ? seatLayout : JSON.stringify(seatLayout)) : undefined,
      amenities: amenities ? (typeof amenities === 'string' ? amenities : JSON.stringify(amenities)) : undefined,
      isActive,
    };

    // Only include vehicleType if it's provided (column may not exist yet)
    if (vehicleType !== undefined) {
      updateData.vehicleType = vehicleType;
    }

    const bus = await prisma.bus.update({
      where: { id: req.params.id },
      data: updateData,
    });

    res.json(bus);
  } catch (error: any) {
    console.error('Error updating bus:', error);
    // If vehicleType column doesn't exist, try without it
    if (error.message?.includes('vehicleType') || error.code === 'P2021') {
      try {
        const { plateNumber, model, manufacturer, year, capacity, seatLayout, amenities, isActive } = req.body;
        const updateDataWithoutVehicleType: any = {
          plateNumber,
          model,
          manufacturer,
          year,
          capacity,
          seatLayout: seatLayout ? (typeof seatLayout === 'string' ? seatLayout : JSON.stringify(seatLayout)) : undefined,
          amenities: amenities ? (typeof amenities === 'string' ? amenities : JSON.stringify(amenities)) : undefined,
          isActive,
        };
        const bus = await prisma.bus.update({
          where: { id: req.params.id },
          data: updateDataWithoutVehicleType,
        });
        return res.json(bus);
      } catch (retryError: any) {
        return res.status(500).json({ message: retryError.message || 'Failed to update bus' });
      }
    }
    res.status(500).json({ message: error.message || 'Failed to update bus' });
  }
});

// Delete bus (Admin only)
router.delete('/:id', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const bus = await prisma.bus.findUnique({ where: { id: req.params.id } });
    if (!bus) {
      return res.status(404).json({ message: 'Bus not found' });
    }

    await prisma.bus.delete({ where: { id: req.params.id } });
    res.json({ message: 'Bus deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;






