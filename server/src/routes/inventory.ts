import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Get all inventory items
router.get('/', authenticate, authorize('ADMIN', 'STAFF', 'STORE_KEEPER', 'DRIVER'), async (req, res) => {
  try {
    const { category, lowStock } = req.query;
    const where: any = {};

    if (category) {
      where.category = category as string;
    }

    if (lowStock === 'true') {
      where.quantity = { lte: prisma.inventoryItem.fields.minQuantity };
    }

    const items = await prisma.inventoryItem.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    res.json(items);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get inventory item by barcode
router.get('/barcode/:barcode', authenticate, authorize('ADMIN', 'STAFF', 'STORE_KEEPER'), async (req, res) => {
  try {
    const item = await prisma.inventoryItem.findUnique({
      where: { barcode: req.params.barcode },
      include: {
        supplier: true,
        stockMovements: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    res.json(item);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get inventory item by ID
router.get('/:id', authenticate, authorize('ADMIN', 'STAFF', 'STORE_KEEPER'), async (req, res) => {
  try {
    const item = await prisma.inventoryItem.findUnique({
      where: { id: req.params.id },
      include: {
        supplier: true,
        requests: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        stockMovements: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    res.json(item);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Create inventory item (Admin only)
router.post('/', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const { name, description, category, unit, quantity, minQuantity, unitPrice, location } = req.body;

    const item = await prisma.inventoryItem.create({
      data: {
        name,
        description,
        category,
        unit,
        quantity: quantity || 0,
        minQuantity: minQuantity || 0,
        unitPrice,
        location,
      },
    });

    res.status(201).json(item);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Update inventory item (Admin only)
router.put('/:id', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const { name, description, category, unit, quantity, minQuantity, unitPrice, location, isActive } = req.body;

    const item = await prisma.inventoryItem.update({
      where: { id: req.params.id },
      data: {
        name,
        description,
        category,
        unit,
        quantity,
        minQuantity,
        unitPrice,
        location,
        isActive,
      },
    });

    res.json(item);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Delete inventory item (Admin only)
router.delete('/:id', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    await prisma.inventoryItem.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Inventory item deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Stock Requests

// Get all stock requests
router.get('/requests/all', authenticate, authorize('ADMIN', 'STAFF', 'STORE_KEEPER'), async (req, res) => {
  try {
    const { status } = req.query;
    const where: any = {};

    if (status) {
      where.status = status as string;
    }

    const requests = await prisma.stockRequest.findMany({
      where,
      include: {
        inventory: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(requests);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Create stock request (Staff/Mechanic/Driver)
router.post('/requests', authenticate, authorize('ADMIN', 'STAFF', 'STORE_KEEPER', 'DRIVER'), async (req, res) => {
  try {
    const { inventoryId, quantity, reason } = req.body;
    const requestedById = req.user!.id;

    if (!inventoryId || !quantity || quantity <= 0) {
      return res.status(400).json({ message: 'Inventory item, quantity are required and quantity must be positive.' });
    }

    const item = await prisma.inventoryItem.findUnique({ where: { id: inventoryId } });
    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    const request = await prisma.stockRequest.create({
      data: {
        inventoryId: inventoryId,
        requestedBy: requestedById,
        quantity,
        reason,
        status: 'PENDING',
      },
      include: {
        inventory: true,
      },
    });

    res.status(201).json(request);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Approve stock request (Admin only)
router.patch('/requests/:id/approve', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const { notes } = req.body;
    const userId = req.user!.id;

    const request = await prisma.stockRequest.update({
      where: { id: req.params.id },
      data: {
        status: 'APPROVED',
        approvedBy: userId,
        approvedAt: new Date(),
        notes,
      },
      include: {
        inventory: true,
      },
    });

    res.json(request);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Reject stock request (Admin only)
router.patch('/requests/:id/reject', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const { notes } = req.body;

    const request = await prisma.stockRequest.update({
      where: { id: req.params.id },
      data: {
        status: 'REJECTED',
        notes,
      },
      include: {
        inventory: true,
      },
    });

    res.json(request);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Fulfill stock request (Store Keeper/Staff)
router.patch('/requests/:id/fulfill', authenticate, authorize('ADMIN', 'STAFF', 'STORE_KEEPER'), async (req, res) => {
  try {
    const userId = req.user!.id;

    // Get the request
    const request = await prisma.stockRequest.findUnique({
      where: { id: req.params.id },
      include: { inventory: true },
    });

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.status !== 'APPROVED') {
      return res.status(400).json({ message: 'Request must be approved before fulfillment' });
    }

    if (request.inventory.quantity < request.quantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    // Update request, inventory, and record stock movement in a transaction
    const [updatedRequest, updatedInventory] = await prisma.$transaction([
      prisma.stockRequest.update({
        where: { id: req.params.id },
        data: {
          status: 'FULFILLED',
          fulfilledBy: userId,
          fulfilledAt: new Date(),
        },
      }),
      prisma.inventoryItem.update({
        where: { id: request.inventoryId },
        data: {
          quantity: {
            decrement: request.quantity,
          },
        },
      }),
    ]);

    // Record stock movement
    await prisma.stockMovement.create({
      data: {
        inventoryId: request.inventoryId,
        type: 'OUT',
        quantity: request.quantity,
        reason: `Fulfilled request: ${request.reason || 'No reason provided'}`,
        referenceId: request.id,
        performedBy: userId,
      },
    });

    res.json({ request: updatedRequest, inventory: updatedInventory });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Stock Movements

// Get stock movements for an item
router.get('/:id/movements', authenticate, authorize('ADMIN', 'STORE_KEEPER'), async (req, res) => {
  try {
    const movements = await prisma.stockMovement.findMany({
      where: { inventoryId: req.params.id },
      orderBy: { createdAt: 'desc' },
    });

    res.json(movements);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Record stock movement (Admin/Store Keeper)
router.post('/:id/movements', authenticate, authorize('ADMIN', 'STORE_KEEPER'), async (req, res) => {
  try {
    const { type, quantity, reason, referenceId } = req.body;
    const performedBy = req.user!.id;

    if (!type || !quantity) {
      return res.status(400).json({ message: 'Type and quantity are required' });
    }

    const item = await prisma.inventoryItem.findUnique({
      where: { id: req.params.id },
    });

    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    // Update quantity based on movement type
    let newQuantity = item.quantity;
    if (type === 'IN') {
      newQuantity += quantity;
    } else if (type === 'OUT') {
      if (item.quantity < quantity) {
        return res.status(400).json({ message: 'Insufficient stock' });
      }
      newQuantity -= quantity;
    } else if (type === 'ADJUSTMENT') {
      newQuantity = quantity; // Direct adjustment
    }

    // Update item quantity
    await prisma.inventoryItem.update({
      where: { id: req.params.id },
      data: { quantity: newQuantity },
    });

    // Record movement
    const movement = await prisma.stockMovement.create({
      data: {
        inventoryId: req.params.id,
        type,
        quantity,
        reason,
        referenceId,
        performedBy,
      },
    });

    res.status(201).json(movement);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

