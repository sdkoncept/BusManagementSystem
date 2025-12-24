# How to Add DRIVER and STORE_KEEPER Roles

## ⚠️ IMPORTANT: PostgreSQL Limitation
PostgreSQL requires new enum values to be committed in **separate transactions** before they can be used. You must run each step separately!

## Quick Fix (Recommended)

### Option 1: Run Individual Steps

**Step 1:** Run this in Supabase SQL Editor (click Run):
```sql
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'DRIVER';
```

**Step 2:** Wait for it to complete, then run this:
```sql
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'STORE_KEEPER';
```

**Step 3:** Wait for it to complete, then run this:
```sql
UPDATE users 
SET role = 'STORE_KEEPER' 
WHERE email = 'storekeeper@eagleline.com';
```

**Step 4:** Update driver user:
```sql
DO $$
DECLARE
    driver_id_var TEXT;
BEGIN
    SELECT "id" INTO driver_id_var
    FROM "drivers"
    WHERE "driversLicense" = 'DL-DRIVER-001'
    LIMIT 1;
    
    UPDATE users 
    SET role = 'DRIVER', "driverId" = driver_id_var
    WHERE email = 'driver@eagleline.com';
END $$;
```

**Step 5:** Verify:
```sql
SELECT email, role FROM users 
WHERE email IN ('storekeeper@eagleline.com', 'driver@eagleline.com');
```

### Option 2: Use the Step Files

1. Run `add_driver_role_step1.sql` → Wait → Run `add_driver_role_step2.sql`
2. Run `add_store_keeper_role_step1.sql` → Wait → Run `add_store_keeper_role_step2.sql`

## Why Separate Transactions?

PostgreSQL doesn't allow using a new enum value in the same transaction where it's created. Each `ALTER TYPE` must be committed before the value can be used in `UPDATE` statements.

## After Running

1. **Log out** from the application
2. **Clear browser localStorage** (or use incognito mode)
3. **Log back in** with `storekeeper@eagleline.com`
4. You should see only "Inventory Management" in navigation

