-- Quick Fix: Ensure Store Keeper Has Correct Role
-- IMPORTANT: Run these in SEPARATE transactions!
-- Run Part 1 first, then run Part 2

-- ============================================
-- PART 1: Add STORE_KEEPER to enum (Run this FIRST)
-- ============================================
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

-- Verify enum was added
SELECT enumlabel as role_name
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'UserRole')
ORDER BY enumsortorder;

-- ============================================
-- PART 2: Update user role (Run this AFTER Part 1 completes)
-- ============================================
-- After Part 1 completes successfully, run this:

UPDATE users 
SET role = 'STORE_KEEPER' 
WHERE email = 'storekeeper@eagleline.com';

-- Verify the update
SELECT 
    email,
    role,
    "firstName",
    "lastName"
FROM users 
WHERE email = 'storekeeper@eagleline.com';

