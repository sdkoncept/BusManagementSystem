-- Migration: Add vehicleType to buses table
-- Run this in Supabase SQL Editor

-- Add vehicleType column to buses table
ALTER TABLE "buses" ADD COLUMN IF NOT EXISTS "vehicleType" TEXT DEFAULT 'Bus';

-- Update existing records to have 'Bus' as default
UPDATE "buses" SET "vehicleType" = 'Bus' WHERE "vehicleType" IS NULL;

-- Make it NOT NULL after setting defaults
ALTER TABLE "buses" ALTER COLUMN "vehicleType" SET NOT NULL;
ALTER TABLE "buses" ALTER COLUMN "vehicleType" SET DEFAULT 'Bus';

