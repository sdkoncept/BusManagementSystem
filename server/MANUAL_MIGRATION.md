# Manual Database Setup - Alternative Approach

Since Prisma migrations are getting stuck, here's an alternative approach using Supabase's SQL Editor.

## Option 1: Use Supabase SQL Editor (Recommended)

1. **Go to Supabase SQL Editor:**
   - Navigate to: https://supabase.com/dashboard/project/tmcxblknqjmvqmnbodsy/sql/new

2. **Run the SQL to create tables:**
   Copy and paste the SQL from the generated migration file, or use Prisma to generate the SQL:

   ```bash
   cd server
   npx prisma migrate dev --create-only --name init
   ```
   
   This will create a migration file without applying it. Then:
   - Open the created migration file in `prisma/migrations/`
   - Copy the SQL from it
   - Paste it into Supabase SQL Editor
   - Run it

3. **Mark migration as applied:**
   After running SQL manually:
   ```bash
   npx prisma migrate resolve --applied init
   ```

## Option 2: Generate SQL from Schema

1. **Generate migration SQL:**
   ```bash
   cd server
   npx prisma migrate dev --create-only --name init
   ```

2. **Get the SQL:**
   - Check `prisma/migrations/[timestamp]_init/migration.sql`
   - Copy the SQL content

3. **Run in Supabase:**
   - Go to SQL Editor in Supabase
   - Paste and execute the SQL

4. **Mark as applied:**
   ```bash
   npx prisma migrate resolve --applied init
   ```

## Option 3: Use Prisma Studio (if connection works)

If you can get Prisma Studio to connect:
```bash
cd server
npx prisma studio
```

This opens a GUI where you can view and manage your database.

## Current Connection Issue

The connection keeps hanging, which suggests:
- Network timeout issues
- Pooler connection limitations
- SSL/TLS handshake problems
- Firewall blocking the connection

## Next Steps

1. Try the manual SQL approach (Option 1 or 2)
2. Or verify the connection string one more time in Supabase
3. Check if there are any network/firewall restrictions

