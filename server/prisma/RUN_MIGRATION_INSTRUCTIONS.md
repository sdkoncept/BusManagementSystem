# Database Migration Instructions

## Fix: Route Schedules Table Missing

The `route_schedules` table is missing from your database. Follow these steps to fix it:

### Step 1: Open Supabase SQL Editor
1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New query"

### Step 2: Run the Migration
1. Open the file: `server/prisma/migration_add_route_schedule.sql`
2. Copy the entire contents of the file
3. Paste it into the Supabase SQL Editor
4. Click "Run" or press Ctrl+Enter

### Step 3: Verify
After running the migration, you should see:
- Success message: "Success. No rows returned"
- The `route_schedules` table should now exist

### Step 4: Restart Your Server
After the migration is complete, restart your backend server:
```bash
cd server
npm run dev
```

## What This Migration Does
- Creates the `route_schedules` table
- Sets up the relationship between routes and schedules
- Adds proper indexes and foreign key constraints
- Creates a trigger to automatically update the `updatedAt` timestamp

## Troubleshooting
If you encounter any errors:
1. Make sure you're connected to the correct Supabase project
2. Check that the `routes` table already exists
3. Verify your database connection string in `.env` file

