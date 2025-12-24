-- Add DRIVER and STORE_KEEPER Roles
-- Run each command SEPARATELY in Supabase SQL Editor
-- Click "Run" after each command, wait for it to complete, then run the next

-- ============================================
-- COMMAND 1: Add DRIVER role
-- ============================================
-- Copy and paste this, click Run, wait for "Success"
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'DRIVER' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'UserRole')
    ) THEN
        ALTER TYPE "UserRole" ADD VALUE 'DRIVER';
    END IF;
END $$;

-- ============================================
-- COMMAND 2: Add STORE_KEEPER role  
-- ============================================
-- After Command 1 completes, copy and paste this, click Run
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'STORE_KEEPER' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'UserRole')
    ) THEN
        ALTER TYPE "UserRole" ADD VALUE 'STORE_KEEPER';
    END IF;
END $$;

-- ============================================
-- COMMAND 3: Update store keeper user
-- ============================================
-- After Command 2 completes, copy and paste this, click Run
UPDATE users 
SET role = 'STORE_KEEPER' 
WHERE email = 'storekeeper@eagleline.com';

-- ============================================
-- COMMAND 4: Update driver user
-- ============================================
-- After Command 3 completes, copy and paste this, click Run
DO $$
DECLARE
    driver_id_var TEXT;
BEGIN
    SELECT "id" INTO driver_id_var
    FROM "drivers"
    WHERE "driversLicense" = 'DL-DRIVER-001'
    LIMIT 1;
    
    IF driver_id_var IS NOT NULL THEN
        UPDATE users 
        SET role = 'DRIVER', "driverId" = driver_id_var
        WHERE email = 'driver@eagleline.com';
    END IF;
END $$;

-- ============================================
-- COMMAND 5: Verify (optional)
-- ============================================
-- Run this to verify all roles are set correctly
SELECT 
    email,
    role,
    "firstName",
    "lastName"
FROM users 
WHERE email IN ('storekeeper@eagleline.com', 'driver@eagleline.com', 'staff@eagleline.com')
ORDER BY email;

