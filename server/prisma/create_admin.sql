-- Update your existing user to ADMIN role
-- Run this in Supabase SQL Editor
-- Replace 'your-email@example.com' with your actual registered email

UPDATE users 
SET role = 'ADMIN' 
WHERE email = 'your-email@example.com';

-- After running this, you can login with your existing credentials
-- and you'll have admin access!

