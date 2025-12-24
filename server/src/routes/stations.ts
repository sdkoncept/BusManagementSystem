import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Get all stations
router.get('/', async (req, res) => {
  try {
    const stations = await prisma.station.findMany({
      orderBy: { name: 'asc' },
    });
    res.json(stations);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get station by ID
router.get('/:id', async (req, res) => {
  try {
    const station = await prisma.station.findUnique({
      where: { id: req.params.id },
      include: {
        routeStations: {
          include: {
            route: true,
          },
        },
      },
    });

    if (!station) {
      return res.status(404).json({ message: 'Station not found' });
    }

    res.json(station);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Create station (Admin/Staff only)
router.post('/', authenticate, authorize('ADMIN', 'STAFF'), async (req, res) => {
  try {
    const { name, code, address, city, state, country, latitude, longitude } = req.body;

    // Check if code already exists
    const existing = await prisma.station.findUnique({ where: { code } });
    if (existing) {
      return res.status(400).json({ message: 'Station code already exists' });
    }

    const station = await prisma.station.create({
      data: {
        name,
        code,
        address,
        city,
        state,
        country,
        latitude,
        longitude,
      },
    });

    res.status(201).json(station);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Update station (Admin/Staff only)
router.put('/:id', authenticate, authorize('ADMIN', 'STAFF'), async (req, res) => {
  try {
    const { name, code, address, city, state, country, latitude, longitude } = req.body;

    // Check if station exists
    const existing = await prisma.station.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ message: 'Station not found' });
    }

    // Check if code is being changed and if new code exists
    if (code && code !== existing.code) {
      const codeExists = await prisma.station.findUnique({ where: { code } });
      if (codeExists) {
        return res.status(400).json({ message: 'Station code already exists' });
      }
    }

    const station = await prisma.station.update({
      where: { id: req.params.id },
      data: {
        name,
        code,
        address,
        city,
        state,
        country,
        latitude,
        longitude,
      },
    });

    res.json(station);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Delete station (Admin only)
router.delete('/:id', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const station = await prisma.station.findUnique({ where: { id: req.params.id } });
    if (!station) {
      return res.status(404).json({ message: 'Station not found' });
    }

    await prisma.station.delete({ where: { id: req.params.id } });
    res.json({ message: 'Station deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;






