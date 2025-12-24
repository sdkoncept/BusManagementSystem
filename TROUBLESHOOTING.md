# Troubleshooting: Changes Not Showing

If you're still seeing old navigation or features, follow these steps:

## Step 1: Verify User Role in Database

Run this in Supabase SQL Editor to check the store keeper's role:

```sql
SELECT email, role, "firstName", "lastName" 
FROM users 
WHERE email = 'storekeeper@eagleline.com';
```

The role should be `STORE_KEEPER`. If it's `STAFF`, update it:

```sql
UPDATE users 
SET role = 'STORE_KEEPER' 
WHERE email = 'storekeeper@eagleline.com';
```

## Step 2: Clear Browser Cache

1. **Chrome/Edge**: Press `Ctrl + Shift + Delete` (or `Cmd + Shift + Delete` on Mac)
2. Select "Cached images and files"
3. Click "Clear data"
4. Or do a hard refresh: `Ctrl + Shift + R` (or `Cmd + Shift + R` on Mac)

## Step 3: Log Out and Log Back In

1. Click "Logout" in the application
2. Clear browser localStorage (or use incognito/private mode)
3. Log back in with: `storekeeper@eagleline.com` / `Admin1234!`
4. You should be redirected to `/inventory`

## Step 4: Restart Development Server

If changes still don't appear:

```bash
# Stop the frontend server (Ctrl+C in the terminal running it)
# Then restart:
cd client
npm run dev
```

## Step 5: Verify Role Migration

Make sure you ran the role migration:

```sql
-- Run: server/prisma/migration_add_roles.sql
```

Then verify roles exist:

```sql
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'UserRole')
ORDER BY enumsortorder;
```

Should show: ADMIN, DRIVER, RIDER, STAFF, STORE_KEEPER

## What Store Keepers Should See

✅ **Should See:**
- Only "Inventory Management" in navigation
- Inventory items list
- Stock requests panel
- Fulfill button on approved requests

❌ **Should NOT See:**
- Home, Routes, Stations, Search Trips links
- Dashboard, Bookings
- Add Item button (Admin only)
- New Request button (Store keepers can't create requests)

## Quick Fix Script

Run this to ensure store keeper has correct role:

```sql
-- Fix store keeper role
UPDATE users 
SET role = 'STORE_KEEPER' 
WHERE email = 'storekeeper@eagleline.com';

-- Verify
SELECT email, role FROM users WHERE email = 'storekeeper@eagleline.com';
```

