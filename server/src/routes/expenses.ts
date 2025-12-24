import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Create expense (Admin)
router.post('/', authenticate, authorize('ADMIN'), async (req: AuthRequest, res) => {
  try {
    const { category, amount, description, busId, driverId, receiptUrl, date } = req.body;

    if (!category || !amount || !description) {
      return res.status(400).json({ message: 'Category, amount, and description are required' });
    }

    const expense = await prisma.expense.create({
      data: {
        category,
        amount,
        description,
        busId,
        driverId,
        receiptUrl,
        date: date ? new Date(date) : new Date(),
      },
    });

    res.status(201).json(expense);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get all expenses (Admin)
router.get('/', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const { category, busId, driverId, startDate, endDate } = req.query;
    const where: any = {};

    if (category) where.category = category as string;
    if (busId) where.busId = busId as string;
    if (driverId) where.driverId = driverId as string;

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate as string);
      }
      if (endDate) {
        const end = new Date(endDate as string);
        end.setHours(23, 59, 59, 999);
        where.date.lte = end;
      }
    }

    const expenses = await prisma.expense.findMany({
      where,
      orderBy: { date: 'desc' },
    });

    const total = expenses.reduce((sum, e) => sum + e.amount, 0);

    res.json({ expenses, total });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Update expense (Admin)
router.put('/:id', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const { category, amount, description, busId, driverId, receiptUrl, date } = req.body;

    const expense = await prisma.expense.update({
      where: { id: req.params.id },
      data: {
        category,
        amount,
        description,
        busId,
        driverId,
        receiptUrl,
        date: date ? new Date(date) : undefined,
      },
    });

    res.json(expense);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Delete expense (Admin)
router.delete('/:id', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    await prisma.expense.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Expense deleted' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

