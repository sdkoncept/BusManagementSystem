-- Quick verification script - Run this in Supabase SQL Editor to verify the drivers table exists

-- Check if drivers table exists and show its structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'drivers'
ORDER BY ordinal_position;

-- Check if the unique index exists
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'drivers';

-- Check if the foreign key constraint on trips table exists
SELECT 
    constraint_name,
    table_name,
    constraint_type
FROM information_schema.table_constraints
WHERE constraint_name = 'trips_driverId_fkey';

