-- Migration: Add Inventory Management and Request System
-- Run this in Supabase SQL Editor

-- Create enums
DO $$ BEGIN
    CREATE TYPE "RequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'FULFILLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "RequestType" AS ENUM ('FUEL', 'HELP', 'INVENTORY');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add driverId to users table
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "driverId" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "users_driverId_key" ON "users"("driverId");

-- Add foreign key constraint for driverId
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'users_driverId_fkey'
    ) THEN
        ALTER TABLE "users" 
        ADD CONSTRAINT "users_driverId_fkey" 
        FOREIGN KEY ("driverId") REFERENCES "drivers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- Create inventory_items table
CREATE TABLE IF NOT EXISTS "inventory_items" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "minQuantity" INTEGER NOT NULL DEFAULT 0,
    "unitPrice" DOUBLE PRECISION,
    "location" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_items_pkey" PRIMARY KEY ("id")
);

-- Create stock_requests table
CREATE TABLE IF NOT EXISTS "stock_requests" (
    "id" TEXT NOT NULL,
    "inventoryId" TEXT NOT NULL,
    "requestedBy" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "reason" TEXT,
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "fulfilledBy" TEXT,
    "fulfilledAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_requests_pkey" PRIMARY KEY ("id")
);

-- Add foreign key for stock_requests
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'stock_requests_inventoryId_fkey'
    ) THEN
        ALTER TABLE "stock_requests" 
        ADD CONSTRAINT "stock_requests_inventoryId_fkey" 
        FOREIGN KEY ("inventoryId") REFERENCES "inventory_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

-- Create requests table (for fuel and help requests)
CREATE TABLE IF NOT EXISTS "requests" (
    "id" TEXT NOT NULL,
    "type" "RequestType" NOT NULL,
    "userId" TEXT NOT NULL,
    "tripId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "location" TEXT,
    "amount" DOUBLE PRECISION,
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',
    "respondedBy" TEXT,
    "response" TEXT,
    "respondedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "requests_pkey" PRIMARY KEY ("id")
);

-- Add foreign key for requests
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'requests_userId_fkey'
    ) THEN
        ALTER TABLE "requests" 
        ADD CONSTRAINT "requests_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
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

DROP TRIGGER IF EXISTS update_inventory_items_updated_at ON "inventory_items";
CREATE TRIGGER update_inventory_items_updated_at
    BEFORE UPDATE ON "inventory_items"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_stock_requests_updated_at ON "stock_requests";
CREATE TRIGGER update_stock_requests_updated_at
    BEFORE UPDATE ON "stock_requests"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_requests_updated_at ON "requests";
CREATE TRIGGER update_requests_updated_at
    BEFORE UPDATE ON "requests"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

