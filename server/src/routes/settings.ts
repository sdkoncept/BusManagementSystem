import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Get all settings
router.get('/', authenticate, authorize('ADMIN', 'STAFF'), async (req, res) => {
  try {
    const { category } = req.query;
    const where: any = {};
    
    if (category) {
      where.category = category as string;
    }

    const settings = await prisma.settings.findMany({
      where,
      orderBy: { category: 'asc' },
    });

    // Parse JSON values
    const parsedSettings = settings.map((setting) => ({
      ...setting,
      value: tryParseJSON(setting.value),
    }));

    res.json(parsedSettings);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get setting by key
router.get('/:key', authenticate, authorize('ADMIN', 'STAFF'), async (req, res) => {
  try {
    const setting = await prisma.settings.findUnique({
      where: { key: req.params.key },
    });

    if (!setting) {
      return res.status(404).json({ message: 'Setting not found' });
    }

    res.json({
      ...setting,
      value: tryParseJSON(setting.value),
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Create or update setting (Admin only)
router.post('/', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const { key, value, category } = req.body;

    const setting = await prisma.settings.upsert({
      where: { key },
      update: {
        value: typeof value === 'string' ? value : JSON.stringify(value),
        category,
      },
      create: {
        key,
        value: typeof value === 'string' ? value : JSON.stringify(value),
        category: category || 'general',
      },
    });

    res.json({
      ...setting,
      value: tryParseJSON(setting.value),
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Update setting (Admin only)
router.put('/:key', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const { value, category } = req.body;

    const setting = await prisma.settings.findUnique({ where: { key: req.params.key } });
    if (!setting) {
      return res.status(404).json({ message: 'Setting not found' });
    }

    const updated = await prisma.settings.update({
      where: { key: req.params.key },
      data: {
        value: typeof value === 'string' ? value : JSON.stringify(value),
        category,
      },
    });

    res.json({
      ...updated,
      value: tryParseJSON(updated.value),
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Delete setting (Admin only)
router.delete('/:key', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const setting = await prisma.settings.findUnique({ where: { key: req.params.key } });
    if (!setting) {
      return res.status(404).json({ message: 'Setting not found' });
    }

    await prisma.settings.delete({ where: { key: req.params.key } });
    res.json({ message: 'Setting deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Helper function to parse JSON
function tryParseJSON(value: string): any {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

export default router;






