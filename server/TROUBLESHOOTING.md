# Troubleshooting Supabase Connection

## Current Connection String
```
postgresql://postgres:BusManagementSystem1234@db.gbkousybqfubewjmrqld.supabase.co:5432/postgres
```

## Possible Issues & Solutions

### 1. Database Password Not Updated in Supabase
The password might not be updated in Supabase yet. To verify/update:

1. Go to: https://supabase.com/dashboard/project/gbkousybqfubewjmrqld/settings/database
2. Scroll to **"Database password"** section
3. Click **"Reset database password"**
4. Set it to: `BusManagementSystem1234`
5. Save the changes
6. Wait a few seconds for the change to propagate

### 2. IP Restrictions
Supabase might have IP restrictions enabled. Check:

1. Go to: Settings → Database
2. Look for **"Connection pooling"** or **"Network restrictions"**
3. Make sure your IP is allowed, or disable restrictions for development

### 3. Connection Pooling Settings
For migrations, you might need to use the direct connection. Check:

1. In Supabase dashboard → Settings → Database
2. Look at the **"Connection string"** section
3. Make sure you're using the **"Session mode"** connection string
4. If it shows a different format, use that exact format

### 4. Try Using psql to Test Connection
Test the connection directly:

```bash
psql "postgresql://postgres:BusManagementSystem1234@db.gbkousybqfubewjmrqld.supabase.co:5432/postgres"
```

If this works, the connection string is correct and the issue is with Prisma.

### 5. Alternative: Use Supabase's Connection Pooler
If direct connection doesn't work, try the pooler on port 6543:

```env
DATABASE_URL="postgresql://postgres.gbkousybqfubewjmrqld:BusManagementSystem1234@aws-0-us-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
```

### 6. Check Supabase Project Status
Make sure your Supabase project is:
- Active and running
- Not paused (free tier projects can pause after inactivity)
- Database is accessible

## Next Steps

1. **Verify password is set correctly in Supabase**
2. **Check if you can connect using psql** (if installed)
3. **Try the connection string from Supabase dashboard exactly as shown**
4. **Check Supabase project status and network settings**

If none of these work, the connection string format from Supabase might need to be used exactly as provided, including any additional parameters.





