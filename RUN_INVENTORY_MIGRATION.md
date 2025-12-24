# Run Inventory Migration

## The Issue
The `inventory_items` and `stock_requests` tables don't exist in your database yet.

## Solution

### Step 1: Open Supabase SQL Editor
1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New query"

### Step 2: Run the Migration
1. Open the file: `server/prisma/migration_add_inventory_and_requests.sql`
2. Copy the entire contents
3. Paste it into the Supabase SQL Editor
4. Click "Run" or press `Ctrl+Enter`

### Step 3: Verify
After running, you should see:
- ✅ Success message
- The tables `inventory_items` and `stock_requests` should be created
- The `RequestStatus` enum should be created

### Step 4: Restart Backend Server
After the migration completes:
```bash
cd server
npm run dev
```

## What This Migration Creates

1. **`inventory_items` table** - Stores inventory items (brake pads, spark plugs, tires, etc.)
2. **`stock_requests` table** - Stores requests for inventory items
3. **`RequestStatus` enum** - For request statuses (PENDING, APPROVED, REJECTED, FULFILLED)
4. **Foreign key constraints** - Links stock_requests to inventory_items
5. **Triggers** - Auto-updates `updatedAt` timestamps

## If You Get Errors

- **"type already exists"** - This is fine, the migration handles it
- **"table already exists"** - Some tables may already exist, that's okay
- **"constraint already exists"** - The migration uses `IF NOT EXISTS` to handle this

The migration is idempotent (safe to run multiple times).

