-- Create Users for Different Views
-- Run this in Supabase SQL Editor
-- Password for all users: Admin1234!
-- Bcrypt hash: $2a$10$uxNwGLKAoVXx47CZAWfS8uvNW0ZwzsRR9D0JQs6y6bARRFPDJdQC.

-- First, ensure driverId column exists in users table
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "driverId" TEXT;

-- Create unique index if it doesn't exist
CREATE UNIQUE INDEX IF NOT EXISTS "users_driverId_key" ON "users"("driverId");

-- Add foreign key constraint if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'users_driverId_fkey'
    ) THEN
        ALTER TABLE "users" 
        ADD CONSTRAINT "users_driverId_fkey" 
        FOREIGN KEY ("driverId") REFERENCES "drivers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
DECLARE
    driver_id_var TEXT;
BEGIN
    -- Get or create driver record for the driver user
    SELECT "id" INTO driver_id_var
    FROM "drivers"
    WHERE "driversLicense" = 'DL-DRIVER-001';
    
    IF driver_id_var IS NULL THEN
        driver_id_var := gen_random_uuid()::text;
        INSERT INTO "drivers" (
            "id",
            "firstName",
            "lastName",
            "dateOfBirth",
            "phoneNumber",
            "driversLicense",
            "licenseExpiryDate",
            "bloodGroup",
            "nextOfKinName",
            "nextOfKinPhone",
            "nextOfKinRelation",
            "homeAddress",
            "yearsInService",
            "isActive",
            "createdAt",
            "updatedAt"
        ) VALUES (
            driver_id_var,
            'Driver',
            'Eagle Line',
            '1990-01-01'::timestamp,
            '+2348000000000',
            'DL-DRIVER-001',
            '2030-12-31'::timestamp,
            'O+',
            'Next of Kin',
            '+2348000000001',
            'Spouse',
            'Lagos, Nigeria',
            5,
            true,
            NOW(),
            NOW()
        );
    END IF;

    -- Create Front Office Staff User
    INSERT INTO "users" (
        "id",
        "email",
        "password",
        "firstName",
        "lastName",
        "phone",
        "role",
        "createdAt",
        "updatedAt"
    ) VALUES (
        gen_random_uuid()::text,
        'staff@eagleline.com',
        '$2a$10$uxNwGLKAoVXx47CZAWfS8uvNW0ZwzsRR9D0JQs6y6bARRFPDJdQC.',
        'Front Office',
        'Staff',
        '+2348000000002',
        'STAFF',
        NOW(),
        NOW()
    ) ON CONFLICT ("email") DO UPDATE
    SET 
        "password" = EXCLUDED."password",
        "role" = EXCLUDED."role",
        "updatedAt" = NOW();

    -- Create Driver User (linked to driver)
    INSERT INTO "users" (
        "id",
        "email",
        "password",
        "firstName",
        "lastName",
        "phone",
        "role",
        "driverId",
        "createdAt",
        "updatedAt"
    ) VALUES (
        gen_random_uuid()::text,
        'driver@eagleline.com',
        '$2a$10$uxNwGLKAoVXx47CZAWfS8uvNW0ZwzsRR9D0JQs6y6bARRFPDJdQC.',
        'Driver',
        'Eagle Line',
        '+2348000000000',
        'DRIVER', -- DRIVER role for driver mobile app access
        driver_id_var,
        NOW(),
        NOW()
    ) ON CONFLICT ("email") DO UPDATE
    SET 
        "password" = EXCLUDED."password",
        "role" = EXCLUDED."role",
        "driverId" = EXCLUDED."driverId",
        "updatedAt" = NOW();

    -- Create Store Keeper User
    INSERT INTO "users" (
        "id",
        "email",
        "password",
        "firstName",
        "lastName",
        "phone",
        "role",
        "createdAt",
        "updatedAt"
    ) VALUES (
        gen_random_uuid()::text,
        'storekeeper@eagleline.com',
        '$2a$10$uxNwGLKAoVXx47CZAWfS8uvNW0ZwzsRR9D0JQs6y6bARRFPDJdQC.',
        'Store',
        'Keeper',
        '+2348000000003',
        'STORE_KEEPER', -- STORE_KEEPER role for inventory management
        NOW(),
        NOW()
    ) ON CONFLICT ("email") DO UPDATE
    SET 
        "password" = EXCLUDED."password",
        "role" = EXCLUDED."role",
        "updatedAt" = NOW();

    RAISE NOTICE 'Users created successfully!';
    RAISE NOTICE 'Driver ID: %', driver_id_var;
END $$;

-- Verify users were created
SELECT 
    email,
    "firstName",
    "lastName",
    role,
    "driverId",
    "createdAt"
FROM "users"
WHERE email IN (
    'staff@eagleline.com',
    'driver@eagleline.com',
    'storekeeper@eagleline.com'
)
ORDER BY email;

