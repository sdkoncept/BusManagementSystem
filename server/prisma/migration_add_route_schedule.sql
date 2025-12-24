-- Migration: Add RouteSchedule model
-- Run this in Supabase SQL Editor

-- Create route_schedules table
CREATE TABLE IF NOT EXISTS "route_schedules" (
    "id" TEXT NOT NULL,
    "routeId" TEXT NOT NULL,
    "startTime" TEXT NOT NULL DEFAULT '07:00',
    "endTime" TEXT NOT NULL DEFAULT '16:00',
    "interval" INTEGER NOT NULL DEFAULT 60,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "route_schedules_pkey" PRIMARY KEY ("id")
);

-- Create unique index on routeId
CREATE UNIQUE INDEX IF NOT EXISTS "route_schedules_routeId_key" ON "route_schedules"("routeId");

-- Add foreign key constraint
ALTER TABLE "route_schedules" 
ADD CONSTRAINT "route_schedules_routeId_fkey" 
FOREIGN KEY ("routeId") REFERENCES "routes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create function to update updatedAt timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updatedAt
DROP TRIGGER IF EXISTS update_route_schedules_updated_at ON "route_schedules";
CREATE TRIGGER update_route_schedules_updated_at
    BEFORE UPDATE ON "route_schedules"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

