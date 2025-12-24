-- Migration: Enhanced Features for All Roles
-- Run this in Supabase SQL Editor
-- This migration adds tables for loyalty, reviews, earnings, inventory enhancements, etc.

-- Add new columns to existing tables

-- Users table enhancements
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "loyaltyPoints" INTEGER DEFAULT 0;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "vipTier" TEXT DEFAULT 'BRONZE';
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "referralCode" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "referredBy" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "dateOfBirth" TIMESTAMP(3);

CREATE UNIQUE INDEX IF NOT EXISTS "users_referralCode_key" ON "users"("referralCode");

-- Bookings table enhancements
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "qrCode" TEXT;
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "ticketNumber" TEXT;
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "paymentMethod" TEXT;
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "paymentStatus" TEXT DEFAULT 'PENDING';
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "specialRequests" TEXT;
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "seatPreference" TEXT;
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "checkedIn" BOOLEAN DEFAULT false;
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "checkedInAt" TIMESTAMP(3);
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "refundAmount" DOUBLE PRECISION DEFAULT 0;
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "refundReason" TEXT;
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "refundedAt" TIMESTAMP(3);

CREATE UNIQUE INDEX IF NOT EXISTS "bookings_qrCode_key" ON "bookings"("qrCode");
CREATE UNIQUE INDEX IF NOT EXISTS "bookings_ticketNumber_key" ON "bookings"("ticketNumber");

-- Trips table enhancements
ALTER TABLE "trips" ADD COLUMN IF NOT EXISTS "currentLatitude" DOUBLE PRECISION;
ALTER TABLE "trips" ADD COLUMN IF NOT EXISTS "currentLongitude" DOUBLE PRECISION;
ALTER TABLE "trips" ADD COLUMN IF NOT EXISTS "estimatedArrival" TIMESTAMP(3);
ALTER TABLE "trips" ADD COLUMN IF NOT EXISTS "passengerCount" INTEGER DEFAULT 0;

-- Drivers table enhancements
ALTER TABLE "drivers" ADD COLUMN IF NOT EXISTS "totalEarnings" DOUBLE PRECISION DEFAULT 0;
ALTER TABLE "drivers" ADD COLUMN IF NOT EXISTS "onTimeRate" DOUBLE PRECISION DEFAULT 0;
ALTER TABLE "drivers" ADD COLUMN IF NOT EXISTS "rating" DOUBLE PRECISION DEFAULT 0;
ALTER TABLE "drivers" ADD COLUMN IF NOT EXISTS "totalTrips" INTEGER DEFAULT 0;

-- Buses table enhancements
ALTER TABLE "buses" ADD COLUMN IF NOT EXISTS "lastMaintenance" TIMESTAMP(3);
ALTER TABLE "buses" ADD COLUMN IF NOT EXISTS "nextMaintenance" TIMESTAMP(3);
ALTER TABLE "buses" ADD COLUMN IF NOT EXISTS "mileage" DOUBLE PRECISION DEFAULT 0;

-- Inventory items enhancements
ALTER TABLE "inventory_items" ADD COLUMN IF NOT EXISTS "barcode" TEXT;
ALTER TABLE "inventory_items" ADD COLUMN IF NOT EXISTS "supplierId" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "inventory_items_barcode_key" ON "inventory_items"("barcode");

-- Create new tables

-- Favorite Routes
CREATE TABLE IF NOT EXISTS "favorite_routes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "routeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorite_routes_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "favorite_routes_userId_routeId_key" ON "favorite_routes"("userId", "routeId");

-- Trip Reviews
CREATE TABLE IF NOT EXISTS "trip_reviews" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "driverRating" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trip_reviews_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "trip_reviews_userId_tripId_key" ON "trip_reviews"("userId", "tripId");

-- Waitlist Entries
CREATE TABLE IF NOT EXISTS "waitlist_entries" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "seatCount" INTEGER NOT NULL DEFAULT 1,
    "notified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "waitlist_entries_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "waitlist_entries_userId_tripId_key" ON "waitlist_entries"("userId", "tripId");

-- Loyalty Transactions
CREATE TABLE IF NOT EXISTS "loyalty_transactions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "bookingId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "loyalty_transactions_pkey" PRIMARY KEY ("id")
);

-- Payments
CREATE TABLE IF NOT EXISTS "payments" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "method" TEXT NOT NULL,
    "reference" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "paidAt" TIMESTAMP(3),
    "refundedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "payments_reference_key" ON "payments"("reference");

-- Driver Earnings
CREATE TABLE IF NOT EXISTS "driver_earnings" (
    "id" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "tripId" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "period" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "driver_earnings_pkey" PRIMARY KEY ("id")
);

-- Incidents
CREATE TABLE IF NOT EXISTS "incidents" (
    "id" TEXT NOT NULL,
    "tripId" TEXT,
    "driverId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'LOW',
    "description" TEXT NOT NULL,
    "location" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "reportedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,
    "resolution" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "incidents_pkey" PRIMARY KEY ("id")
);

-- Vehicle Inspections
CREATE TABLE IF NOT EXISTS "vehicle_inspections" (
    "id" TEXT NOT NULL,
    "tripId" TEXT,
    "busId" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "inspectionType" TEXT NOT NULL,
    "checklist" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "inspectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "inspectedBy" TEXT,

    CONSTRAINT "vehicle_inspections_pkey" PRIMARY KEY ("id")
);

-- Messages
CREATE TABLE IF NOT EXISTS "messages" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT,
    "driverId" TEXT,
    "type" TEXT NOT NULL DEFAULT 'MESSAGE',
    "subject" TEXT,
    "content" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- Customer Profiles
CREATE TABLE IF NOT EXISTS "customer_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "totalBookings" INTEGER NOT NULL DEFAULT 0,
    "totalSpent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "preferredSeat" TEXT,
    "specialNeeds" TEXT,
    "marketingOptIn" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customer_profiles_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "customer_profiles_userId_key" ON "customer_profiles"("userId");

-- Complaints
CREATE TABLE IF NOT EXISTS "complaints" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bookingId" TEXT,
    "type" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "assignedTo" TEXT,
    "resolution" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "complaints_pkey" PRIMARY KEY ("id")
);

-- Expenses
CREATE TABLE IF NOT EXISTS "expenses" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "description" TEXT NOT NULL,
    "busId" TEXT,
    "driverId" TEXT,
    "receiptUrl" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "expenses_pkey" PRIMARY KEY ("id")
);

-- Maintenance Schedules
CREATE TABLE IF NOT EXISTS "maintenance_schedules" (
    "id" TEXT NOT NULL,
    "busId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "completedDate" TIMESTAMP(3),
    "cost" DOUBLE PRECISION DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "maintenance_schedules_pkey" PRIMARY KEY ("id")
);

-- Suppliers
CREATE TABLE IF NOT EXISTS "suppliers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contactName" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "category" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id")
);

-- Purchase Orders
CREATE TABLE IF NOT EXISTS "purchase_orders" (
    "id" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "items" TEXT NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "orderDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expectedDate" TIMESTAMP(3),
    "receivedDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "purchase_orders_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "purchase_orders_orderNumber_key" ON "purchase_orders"("orderNumber");

-- Stock Movements
CREATE TABLE IF NOT EXISTS "stock_movements" (
    "id" TEXT NOT NULL,
    "inventoryId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "reason" TEXT,
    "referenceId" TEXT,
    "performedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_movements_pkey" PRIMARY KEY ("id")
);

-- Add foreign key constraints

-- Favorite Routes
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'favorite_routes_userId_fkey'
    ) THEN
        ALTER TABLE "favorite_routes" 
        ADD CONSTRAINT "favorite_routes_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'favorite_routes_routeId_fkey'
    ) THEN
        ALTER TABLE "favorite_routes" 
        ADD CONSTRAINT "favorite_routes_routeId_fkey" 
        FOREIGN KEY ("routeId") REFERENCES "routes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- Trip Reviews
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'trip_reviews_userId_fkey') THEN
        ALTER TABLE "trip_reviews" 
        ADD CONSTRAINT "trip_reviews_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'trip_reviews_tripId_fkey') THEN
        ALTER TABLE "trip_reviews" 
        ADD CONSTRAINT "trip_reviews_tripId_fkey" 
        FOREIGN KEY ("tripId") REFERENCES "trips"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- Waitlist Entries
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'waitlist_entries_userId_fkey') THEN
        ALTER TABLE "waitlist_entries" 
        ADD CONSTRAINT "waitlist_entries_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'waitlist_entries_tripId_fkey') THEN
        ALTER TABLE "waitlist_entries" 
        ADD CONSTRAINT "waitlist_entries_tripId_fkey" 
        FOREIGN KEY ("tripId") REFERENCES "trips"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- Loyalty Transactions
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'loyalty_transactions_userId_fkey') THEN
        ALTER TABLE "loyalty_transactions" 
        ADD CONSTRAINT "loyalty_transactions_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- Payments
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payments_bookingId_fkey') THEN
        ALTER TABLE "payments" 
        ADD CONSTRAINT "payments_bookingId_fkey" 
        FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- Driver Earnings
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'driver_earnings_driverId_fkey') THEN
        ALTER TABLE "driver_earnings" 
        ADD CONSTRAINT "driver_earnings_driverId_fkey" 
        FOREIGN KEY ("driverId") REFERENCES "drivers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- Incidents
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'incidents_tripId_fkey') THEN
        ALTER TABLE "incidents" 
        ADD CONSTRAINT "incidents_tripId_fkey" 
        FOREIGN KEY ("tripId") REFERENCES "trips"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'incidents_driverId_fkey') THEN
        ALTER TABLE "incidents" 
        ADD CONSTRAINT "incidents_driverId_fkey" 
        FOREIGN KEY ("driverId") REFERENCES "drivers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

-- Vehicle Inspections
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'vehicle_inspections_tripId_fkey') THEN
        ALTER TABLE "vehicle_inspections" 
        ADD CONSTRAINT "vehicle_inspections_tripId_fkey" 
        FOREIGN KEY ("tripId") REFERENCES "trips"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'vehicle_inspections_driverId_fkey') THEN
        ALTER TABLE "vehicle_inspections" 
        ADD CONSTRAINT "vehicle_inspections_driverId_fkey" 
        FOREIGN KEY ("driverId") REFERENCES "drivers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

-- Messages
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'messages_driverId_fkey') THEN
        ALTER TABLE "messages" 
        ADD CONSTRAINT "messages_driverId_fkey" 
        FOREIGN KEY ("driverId") REFERENCES "drivers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- Customer Profiles
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'customer_profiles_userId_fkey') THEN
        ALTER TABLE "customer_profiles" 
        ADD CONSTRAINT "customer_profiles_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- Complaints
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'complaints_userId_fkey') THEN
        ALTER TABLE "complaints" 
        ADD CONSTRAINT "complaints_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- Purchase Orders
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'purchase_orders_supplierId_fkey') THEN
        ALTER TABLE "purchase_orders" 
        ADD CONSTRAINT "purchase_orders_supplierId_fkey" 
        FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

-- Stock Movements
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'stock_movements_inventoryId_fkey') THEN
        ALTER TABLE "stock_movements" 
        ADD CONSTRAINT "stock_movements_inventoryId_fkey" 
        FOREIGN KEY ("inventoryId") REFERENCES "inventory_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

-- Inventory Items - Supplier relation
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'inventory_items_supplierId_fkey') THEN
        ALTER TABLE "inventory_items" 
        ADD CONSTRAINT "inventory_items_supplierId_fkey" 
        FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- Create triggers for updatedAt
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to new tables
DROP TRIGGER IF EXISTS update_trip_reviews_updated_at ON "trip_reviews";
CREATE TRIGGER update_trip_reviews_updated_at
    BEFORE UPDATE ON "trip_reviews"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_payments_updated_at ON "payments";
CREATE TRIGGER update_payments_updated_at
    BEFORE UPDATE ON "payments"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_incidents_updated_at ON "incidents";
CREATE TRIGGER update_incidents_updated_at
    BEFORE UPDATE ON "incidents"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_customer_profiles_updated_at ON "customer_profiles";
CREATE TRIGGER update_customer_profiles_updated_at
    BEFORE UPDATE ON "customer_profiles"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_complaints_updated_at ON "complaints";
CREATE TRIGGER update_complaints_updated_at
    BEFORE UPDATE ON "complaints"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_expenses_updated_at ON "expenses";
CREATE TRIGGER update_expenses_updated_at
    BEFORE UPDATE ON "expenses"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_maintenance_schedules_updated_at ON "maintenance_schedules";
CREATE TRIGGER update_maintenance_schedules_updated_at
    BEFORE UPDATE ON "maintenance_schedules"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_suppliers_updated_at ON "suppliers";
CREATE TRIGGER update_suppliers_updated_at
    BEFORE UPDATE ON "suppliers"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_purchase_orders_updated_at ON "purchase_orders";
CREATE TRIGGER update_purchase_orders_updated_at
    BEFORE UPDATE ON "purchase_orders"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

