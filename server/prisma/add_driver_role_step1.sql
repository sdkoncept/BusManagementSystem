-- STEP 1: Add DRIVER to enum
-- Run this FIRST in Supabase SQL Editor
-- After it completes, you can use DRIVER role

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

-- Verify it was added
SELECT enumlabel as role_name
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'UserRole')
ORDER BY enumsortorder;

