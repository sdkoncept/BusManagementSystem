-- Create sample trips with buses and seats for testing bookings
-- Run this in Supabase SQL Editor

-- First, create a sample bus if none exists
INSERT INTO buses (id, "plateNumber", model, manufacturer, year, capacity, "seatLayout", "isActive", "createdAt", "updatedAt")
VALUES 
  (gen_random_uuid(), 'EL-001', 'Mercedes Tourismo', 'Mercedes-Benz', 2023, 50, '{"rows": 13, "cols": 4}', true, NOW(), NOW()),
  (gen_random_uuid(), 'EL-002', 'Volvo 9700', 'Volvo', 2023, 45, '{"rows": 12, "cols": 4}', true, NOW(), NOW())
ON CONFLICT ("plateNumber") DO NOTHING;

-- Get station IDs (assuming they exist from seed.sql)
WITH station_ids AS (
  SELECT id, code FROM stations WHERE code IN ('BEN', 'WAR', 'ABJ', 'IBA', 'LOS')
),
bus_ids AS (
  SELECT id FROM buses LIMIT 1
),
route_ids AS (
  SELECT id, code FROM routes WHERE code IN ('BEN-WAR', 'BEN-ABJ', 'BEN-IBA', 'BEN-LOS')
),
trip_data AS (
  SELECT 
    r.id as route_id,
    r.code as route_code,
    b.id as bus_id,
    s1.id as origin_id,
    s2.id as destination_id,
    NOW() + INTERVAL '1 day' + (random() * INTERVAL '7 days') as departure_time,
    CASE 
      WHEN r.code = 'BEN-WAR' THEN INTERVAL '120 minutes'
      WHEN r.code = 'BEN-ABJ' THEN INTERVAL '480 minutes'
      WHEN r.code = 'BEN-IBA' THEN INTERVAL '360 minutes'
      WHEN r.code = 'BEN-LOS' THEN INTERVAL '360 minutes'
      ELSE INTERVAL '240 minutes'
    END as duration,
    CASE 
      WHEN r.code = 'BEN-WAR' THEN 5000.00
      WHEN r.code = 'BEN-ABJ' THEN 15000.00
      WHEN r.code = 'BEN-IBA' THEN 12000.00
      WHEN r.code = 'BEN-LOS' THEN 12000.00
      ELSE 10000.00
    END as price
  FROM route_ids r
  CROSS JOIN bus_ids b
  CROSS JOIN station_ids s1
  CROSS JOIN station_ids s2
  WHERE (r.code = 'BEN-WAR' AND s1.code = 'BEN' AND s2.code = 'WAR')
     OR (r.code = 'BEN-ABJ' AND s1.code = 'BEN' AND s2.code = 'ABJ')
     OR (r.code = 'BEN-IBA' AND s1.code = 'BEN' AND s2.code = 'IBA')
     OR (r.code = 'BEN-LOS' AND s1.code = 'BEN' AND s2.code = 'LOS')
)
-- Create sample trips
INSERT INTO trips (id, "routeId", "busId", "originId", "destinationId", "departureTime", "arrivalTime", price, status, "createdAt", "updatedAt")
SELECT 
  gen_random_uuid(),
  route_id,
  bus_id,
  origin_id,
  destination_id,
  departure_time,
  departure_time + duration as arrival_time,
  price,
  'SCHEDULED',
  NOW(),
  NOW()
FROM trip_data
ON CONFLICT DO NOTHING;

-- Create seats for all trips (this is critical for booking to work)
INSERT INTO seats (id, "tripId", "seatNumber", status, "createdAt", "updatedAt")
SELECT 
  gen_random_uuid(),
  t.id,
  generate_series::text,
  'AVAILABLE',
  NOW(),
  NOW()
FROM trips t
INNER JOIN buses b ON t."busId" = b.id
CROSS JOIN generate_series(1, b.capacity)
WHERE NOT EXISTS (
  SELECT 1 FROM seats s WHERE s."tripId" = t.id
);

