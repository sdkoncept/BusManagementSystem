-- STEP 2: Update store keeper user role
-- Run this AFTER step1.sql completes successfully
-- This must be in a separate transaction

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

