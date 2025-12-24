-- Migration: Add Driver model and update Trip model
-- Run this in Supabase SQL Editor

-- Step 1: Create drivers table
CREATE TABLE IF NOT EXISTS "drivers" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "driversLicense" TEXT NOT NULL,
    "licenseExpiryDate" TIMESTAMP(3) NOT NULL,
    "bloodGroup" TEXT NOT NULL,
    "nextOfKinName" TEXT NOT NULL,
    "nextOfKinPhone" TEXT NOT NULL,
    "nextOfKinRelation" TEXT NOT NULL,
    "homeAddress" TEXT NOT NULL,
    "yearsInService" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "drivers_pkey" PRIMARY KEY ("id")
);

-- Step 2: Create unique index on driversLicense
CREATE UNIQUE INDEX IF NOT EXISTS "drivers_driversLicense_key" ON "drivers"("driversLicense");

-- Step 3: Update trips table to change driverId foreign key
-- First, check if the old foreign key constraint exists and drop it
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'trips_driverId_fkey' 
        AND table_name = 'trips'
    ) THEN
        ALTER TABLE "trips" DROP CONSTRAINT "trips_driverId_fkey";
    END IF;
END $$;

-- Step 4: Clear any existing driverId values that point to users table
-- (since we're switching from users to drivers)
UPDATE "trips" SET "driverId" = NULL WHERE "driverId" IS NOT NULL;

-- Step 5: Add foreign key constraint to drivers table
ALTER TABLE "trips" 
ADD CONSTRAINT "trips_driverId_fkey" 
FOREIGN KEY ("driverId") REFERENCES "drivers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

