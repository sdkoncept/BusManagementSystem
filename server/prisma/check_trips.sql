-- Check if trips exist and have seats
-- Run this in Supabase SQL Editor to diagnose booking issues

-- Check if any trips exist
SELECT COUNT(*) as trip_count FROM trips;

-- Check if trips have seats
SELECT 
  t.id,
  t."departureTime",
  s.name as origin,
  d.name as destination,
  COUNT(se.id) as seat_count,
  b.capacity as bus_capacity
FROM trips t
LEFT JOIN stations s ON t."originId" = s.id
LEFT JOIN stations d ON t."destinationId" = d.id
LEFT JOIN buses b ON t."busId" = b.id
LEFT JOIN seats se ON se."tripId" = t.id
GROUP BY t.id, t."departureTime", s.name, d.name, b.capacity;

-- If trips exist but have no seats, you need to create seats for them
-- Example: Create seats for a trip (replace TRIP_ID with actual trip ID)
-- INSERT INTO seats (id, "tripId", "seatNumber", status, "createdAt", "updatedAt")
-- SELECT 
--   gen_random_uuid(),
--   'TRIP_ID',
--   generate_series::text,
--   'AVAILABLE',
--   NOW(),
--   NOW()
-- FROM generate_series(1, (SELECT capacity FROM buses WHERE id = (SELECT "busId" FROM trips WHERE id = 'TRIP_ID')));

