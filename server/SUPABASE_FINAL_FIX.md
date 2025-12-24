# Final Fix for Supabase Connection

## The Issue
- Direct connection (port 5432) is **not reachable** from your network
- Pooled connection (port 6543) is reachable but authentication is failing

## Solution: Get the Exact Connection String from Supabase Dashboard

Since the direct connection endpoint isn't accessible, you need to use Supabase's connection pooler. Here's how to get the correct connection string:

### Step 1: Get Pooled Connection String
1. Go to: https://supabase.com/dashboard/project/gbkousybqfubewjmrqld/settings/database
2. Scroll to **"Connection string"** section
3. Click on **"Transaction mode"** tab (for pooled connections)
4. Copy the connection string - it should look like:
   ```
   postgresql://postgres.gbkousybqfubewjmrqld:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true
   ```

### Step 2: Update Your .env File
Replace `[YOUR-PASSWORD]` with `BusManagementSystem1234`:

```env
DATABASE_URL="postgresql://postgres.gbkousybqfubewjmrqld:BusManagementSystem1234@aws-0-us-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
```

### Step 3: Alternative - Use Supabase's SQL Editor Connection
If the above doesn't work, try getting the connection string from:
- Supabase Dashboard → SQL Editor → Click the connection info icon
- This will show you the exact connection parameters

### Step 4: Verify Password in Supabase
Make absolutely sure the password is set correctly:
1. Settings → Database → Database password
2. Reset it to: `BusManagementSystem1234`
3. Wait 30 seconds for changes to propagate

## Important Notes

- **Port 5432 (direct)** is blocked from your network - you MUST use port **6543 (pooled)**
- For pooled connections, username is usually `postgres.[project-ref]` format
- Make sure you're using the **Transaction mode** connection string from Supabase
- The password must match exactly what's set in Supabase

## If Still Not Working

1. **Check Supabase project status** - make sure it's not paused
2. **Verify the exact connection string format** from Supabase dashboard
3. **Try resetting the database password** in Supabase and updating your .env
4. **Check Supabase logs** for any connection errors

The key is to use the **exact** connection string format that Supabase provides in their dashboard for the pooled connection.





