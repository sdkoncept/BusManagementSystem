import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Get all suppliers
router.get('/', authenticate, authorize('ADMIN', 'STORE_KEEPER'), async (req, res) => {
  try {
    const { isActive, category } = req.query;
    const where: any = {};

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }
    if (category) {
      where.category = category as string;
    }

    const suppliers = await prisma.supplier.findMany({
      where,
      include: {
        _count: {
          select: {
            purchaseOrders: true,
            inventoryItems: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    res.json(suppliers);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Create supplier (Admin)
router.post('/', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const { name, contactName, email, phone, address, category } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Supplier name is required' });
    }

    const supplier = await prisma.supplier.create({
      data: {
        name,
        contactName,
        email,
        phone,
        address,
        category,
      },
    });

    res.status(201).json(supplier);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Update supplier (Admin)
router.put('/:id', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const { name, contactName, email, phone, address, category, isActive } = req.body;

    const supplier = await prisma.supplier.update({
      where: { id: req.params.id },
      data: {
        name,
        contactName,
        email,
        phone,
        address,
        category,
        isActive,
      },
    });

    res.json(supplier);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Delete supplier (Admin)
router.delete('/:id', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    await prisma.supplier.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Supplier deleted' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Purchase Orders
router.get('/:supplierId/orders', authenticate, authorize('ADMIN', 'STORE_KEEPER'), async (req, res) => {
  try {
    const orders = await prisma.purchaseOrder.findMany({
      where: { supplierId: req.params.supplierId },
      include: {
        supplier: true,
      },
      orderBy: { orderDate: 'desc' },
    });

    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Create purchase order (Admin/Store Keeper)
router.post('/orders', authenticate, authorize('ADMIN', 'STORE_KEEPER'), async (req, res) => {
  try {
    const { supplierId, items, totalAmount, expectedDate, notes } = req.body;

    if (!supplierId || !items || !totalAmount) {
      return res.status(400).json({ message: 'Supplier ID, items, and total amount are required' });
    }

    // Generate order number
    const orderNumber = `PO-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const order = await prisma.purchaseOrder.create({
      data: {
        supplierId,
        orderNumber,
        items: typeof items === 'string' ? items : JSON.stringify(items),
        totalAmount,
        expectedDate: expectedDate ? new Date(expectedDate) : undefined,
        notes,
      },
      include: {
        supplier: true,
      },
    });

    res.status(201).json(order);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Update purchase order (Admin)
router.put('/orders/:id', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const { status, receivedDate, notes } = req.body;

    const order = await prisma.purchaseOrder.update({
      where: { id: req.params.id },
      data: {
        status,
        receivedDate: receivedDate ? new Date(receivedDate) : undefined,
        notes,
      },
      include: {
        supplier: true,
      },
    });

    res.json(order);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

