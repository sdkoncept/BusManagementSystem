# Fix Your .env File - Quick Instructions

## The Problem
Your current `DATABASE_URL` is:
```
DATABASE_URL=https://gbkousybqfubewjmrqld.supabase.co
```

This is the **Supabase API URL**, but Prisma needs the **PostgreSQL connection string**.

## The Solution

### Step 1: Get Your PostgreSQL Connection String

1. Go to: https://supabase.com/dashboard/project/gbkousybqfubewjmrqld/settings/database
2. Scroll down to **"Connection string"** section
3. Click on the **"URI"** tab (not "Connection pooling")
4. You'll see a connection string like:
   ```
   postgresql://postgres.gbkousybqfubewjmrqld:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres
   ```
5. **Copy this entire string** (it includes your password)

### Step 2: Update Your .env File

Open your `.env` file in the `server` directory and replace the `DATABASE_URL` line:

**Before:**
```env
DATABASE_URL=https://gbkousybqfubewjmrqld.supabase.co
```

**After (use your actual connection string from Step 1):**
```env
DATABASE_URL="postgresql://postgres.gbkousybqfubewjmrqld:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
```

**Important:**
- Make sure it starts with `postgresql://` (not `https://`)
- Keep the quotes around the value
- Replace `[YOUR-PASSWORD]` with your actual database password

### Step 3: Verify Your .env File

Your complete `.env` file should look like:

```env
DATABASE_URL="postgresql://postgres.gbkousybqfubewjmrqld:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
JWT_SECRET=Q1fbPOlNAPClxDNWRyKjkW0JILW0iaaDb/XdfSw2GZy7sWwPmKtIkyw9O1xFfACNIv5QXmmsR++l3leZoI73jQ==
PORT=5000
NODE_ENV=development
```

### Step 4: Test the Connection

After updating, run:
```bash
cd server
npm run prisma:migrate
```

If you still get errors, try using the **direct connection** (port 5432) instead:
```env
DATABASE_URL="postgresql://postgres.gbkousybqfubewjmrqld:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:5432/postgres"
```

## Quick Edit Command

You can edit the file directly:
```bash
cd server
nano .env
# or
code .env
```

Then replace the DATABASE_URL line with your PostgreSQL connection string.






