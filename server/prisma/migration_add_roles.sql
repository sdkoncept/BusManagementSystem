-- Migration: Add DRIVER and STORE_KEEPER roles
-- IMPORTANT: Run each ALTER TYPE in a SEPARATE transaction!
-- PostgreSQL requires new enum values to be committed before use

-- ============================================
-- STEP 1: Add DRIVER role (Run this FIRST, then click Run again)
-- ============================================
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
-- STEP 2: Add STORE_KEEPER role (Run this AFTER Step 1 completes)
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

-- ============================================
-- STEP 3: Verify the enum values (Run this LAST)
-- ============================================
SELECT enumlabel as role_name
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'UserRole')
ORDER BY enumsortorder;

