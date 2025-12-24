-- Seed script for Eagle Line Bus Management System
-- Run this in Supabase SQL Editor

-- Insert Stations
INSERT INTO stations (id, name, code, address, city, state, country, "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), 'Benin City', 'BEN', 'Ring Road', 'Benin City', 'Edo', 'Nigeria', NOW(), NOW()),
  (gen_random_uuid(), 'Warri', 'WAR', 'Effurun Roundabout', 'Warri', 'Delta', 'Nigeria', NOW(), NOW()),
  (gen_random_uuid(), 'Abuja', 'ABJ', 'Garki Area 1', 'Abuja', 'FCT Abuja', 'Nigeria', NOW(), NOW()),
  (gen_random_uuid(), 'Ibadan', 'IBA', 'Molete', 'Ibadan', 'Oyo', 'Nigeria', NOW(), NOW()),
  (gen_random_uuid(), 'Lagos', 'LOS', 'Ojota Terminal', 'Lagos', 'Lagos', 'Nigeria', NOW(), NOW())
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  address = EXCLUDED.address,
  city = EXCLUDED.city,
  state = EXCLUDED.state,
  "updatedAt" = NOW();

-- Insert Routes with Distance and Duration
INSERT INTO routes (id, name, code, description, distance, duration, "isActive", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), 'Benin to Warri', 'BEN-WAR', 'Direct route from Benin City to Warri', 90.0, 120, true, NOW(), NOW()),
  (gen_random_uuid(), 'Benin to Abuja', 'BEN-ABJ', 'Direct route from Benin City to Abuja', 450.0, 480, true, NOW(), NOW()),
  (gen_random_uuid(), 'Benin to Ibadan', 'BEN-IBA', 'Direct route from Benin City to Ibadan', 320.0, 360, true, NOW(), NOW()),
  (gen_random_uuid(), 'Benin to Lagos', 'BEN-LOS', 'Direct route from Benin City to Lagos', 330.0, 360, true, NOW(), NOW())
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  distance = EXCLUDED.distance,
  duration = EXCLUDED.duration,
  "updatedAt" = NOW();

-- Link Stations to Routes
-- First, delete existing route_stations for these routes to avoid duplicates
DELETE FROM route_stations 
WHERE "routeId" IN (SELECT id FROM routes WHERE code IN ('BEN-WAR', 'BEN-ABJ', 'BEN-IBA', 'BEN-LOS'));

-- Insert Route Stations
INSERT INTO route_stations (id, "routeId", "stationId", "order", distance, "createdAt")
SELECT 
  gen_random_uuid(),
  r.id,
  s.id,
  CASE 
    WHEN r.code = 'BEN-WAR' AND s.code = 'BEN' THEN 1
    WHEN r.code = 'BEN-WAR' AND s.code = 'WAR' THEN 2
    WHEN r.code = 'BEN-ABJ' AND s.code = 'BEN' THEN 1
    WHEN r.code = 'BEN-ABJ' AND s.code = 'ABJ' THEN 2
    WHEN r.code = 'BEN-IBA' AND s.code = 'BEN' THEN 1
    WHEN r.code = 'BEN-IBA' AND s.code = 'IBA' THEN 2
    WHEN r.code = 'BEN-LOS' AND s.code = 'BEN' THEN 1
    WHEN r.code = 'BEN-LOS' AND s.code = 'LOS' THEN 2
  END as "order",
  CASE 
    WHEN r.code = 'BEN-WAR' AND s.code = 'BEN' THEN 0.0
    WHEN r.code = 'BEN-WAR' AND s.code = 'WAR' THEN 90.0
    WHEN r.code = 'BEN-ABJ' AND s.code = 'BEN' THEN 0.0
    WHEN r.code = 'BEN-ABJ' AND s.code = 'ABJ' THEN 450.0
    WHEN r.code = 'BEN-IBA' AND s.code = 'BEN' THEN 0.0
    WHEN r.code = 'BEN-IBA' AND s.code = 'IBA' THEN 320.0
    WHEN r.code = 'BEN-LOS' AND s.code = 'BEN' THEN 0.0
    WHEN r.code = 'BEN-LOS' AND s.code = 'LOS' THEN 330.0
  END as distance,
  NOW()
FROM routes r
CROSS JOIN stations s
WHERE (r.code = 'BEN-WAR' AND s.code IN ('BEN', 'WAR'))
   OR (r.code = 'BEN-ABJ' AND s.code IN ('BEN', 'ABJ'))
   OR (r.code = 'BEN-IBA' AND s.code IN ('BEN', 'IBA'))
   OR (r.code = 'BEN-LOS' AND s.code IN ('BEN', 'LOS'));

