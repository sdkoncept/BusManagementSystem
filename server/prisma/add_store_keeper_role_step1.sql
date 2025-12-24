-- STEP 1: Add STORE_KEEPER to enum
-- Run this FIRST in Supabase SQL Editor
-- After it completes, run step2.sql

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

-- Verify it was added
SELECT enumlabel as role_name
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'UserRole')
ORDER BY enumsortorder;

