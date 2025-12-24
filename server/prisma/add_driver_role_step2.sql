-- STEP 2: Update driver user role
-- Run this AFTER add_driver_role_step1.sql completes successfully
-- This must be in a separate transaction

-- First get the driver ID
DO $$
DECLARE
    driver_id_var TEXT;
BEGIN
    -- Get driver ID
    SELECT "id" INTO driver_id_var
    FROM "drivers"
    WHERE "driversLicense" = 'DL-DRIVER-001'
    LIMIT 1;
    
    -- Update user role and link to driver
    UPDATE users 
    SET 
        role = 'DRIVER',
        "driverId" = driver_id_var
    WHERE email = 'driver@eagleline.com';
    
    RAISE NOTICE 'Driver user updated. Driver ID: %', driver_id_var;
END $$;

-- Verify the update
SELECT 
    email,
    role,
    "driverId",
    "firstName",
    "lastName"
FROM users 
WHERE email = 'driver@eagleline.com';

