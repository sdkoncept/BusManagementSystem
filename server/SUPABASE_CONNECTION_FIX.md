# Fix "Tenant or user not found" Error

## The Problem
You're getting `FATAL: Tenant or user not found` because Supabase requires different connection strings for:
- **Migrations** (Prisma migrate): Use **direct connection** (port 5432)
- **Application queries**: Use **pooled connection** (port 6543)

## Solution: Use Direct Connection for Migrations

### Step 1: Get Your Direct Connection String

1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/gbkousybqfubewjmrqld/settings/database
2. Scroll to **"Connection string"** section
3. Click on **"Session mode"** tab (NOT "Transaction mode" or "URI")
4. Copy the connection string - it should look like:
   ```
   postgresql://postgres.gbkousybqfubewjmrqld:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:5432/postgres
   ```

**OR** if you see "Connection parameters" instead:
- Host: `aws-0-us-west-1.pooler.supabase.com`
- Port: `5432` (NOT 6543)
- Database: `postgres`
- User: `postgres.gbkousybqfubewjmrqld` (your project ref)
- Password: Your database password

### Step 2: Update Your .env File

Your `DATABASE_URL` should use **port 5432** (direct connection) for migrations:

```env
DATABASE_URL="postgresql://postgres.gbkousybqfubewjmrqld:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:5432/postgres"
```

**Important Notes:**
- Use port **5432** (direct connection) for migrations
- Use port **6543** (pooled connection) for application runtime (optional, but better for production)
- Make sure the username format is `postgres.[PROJECT-REF]` not just `postgres`
- The password is your database password (set when creating the project)

### Step 3: Alternative - Use Connection Pooling URL Format

If the above doesn't work, try this format:

```env
DATABASE_URL="postgresql://postgres.gbkousybqfubewjmrqld:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:5432/postgres?sslmode=require"
```

### Step 4: Verify Connection String Format

Your connection string should have this structure:
```
postgresql://[USERNAME]:[PASSWORD]@[HOST]:[PORT]/[DATABASE]
```

Where:
- `[USERNAME]` = `postgres.gbkousybqfubewjmrqld` (your project ref)
- `[PASSWORD]` = Your database password
- `[HOST]` = `aws-0-us-west-1.pooler.supabase.com` (or your region's host)
- `[PORT]` = `5432` for direct connection
- `[DATABASE]` = `postgres`

### Step 5: Test the Connection

After updating, try the migration again:
```bash
cd server
npm run prisma:migrate
```

## Common Issues

### Issue 1: Wrong Username Format
❌ Wrong: `postgres@...`
✅ Correct: `postgres.gbkousybqfubewjmrqld@...`

### Issue 2: Wrong Port
❌ Wrong: Port 6543 (pooled) for migrations
✅ Correct: Port 5432 (direct) for migrations

### Issue 3: Missing SSL
If you get SSL errors, add `?sslmode=require`:
```env
DATABASE_URL="postgresql://...?sslmode=require"
```

### Issue 4: Password with Special Characters
If your password has special characters, URL-encode them:
- `@` becomes `%40`
- `#` becomes `%23`
- `$` becomes `%24`
- etc.

## Still Having Issues?

1. **Double-check your password** - Make sure it's the database password, not your Supabase account password
2. **Verify project reference** - Make sure `gbkousybqfubewjmrqld` matches your project
3. **Check region** - Make sure the host matches your project's region
4. **Try resetting database password** in Supabase dashboard if needed





