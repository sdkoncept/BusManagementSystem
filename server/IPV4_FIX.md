# IPv4 Compatibility Issue - Use Shared Pooler

## The Problem
Your network is IPv4-only, but the Dedicated Pooler connection requires IPv6. That's why you're getting connection errors.

## The Solution: Use Shared Pooler

In your Supabase dashboard, you need to use the **"Using the Shared Pooler"** section instead of the Dedicated Pooler.

### Steps:
1. In the Supabase connection string dialog, look for **"Using the Shared Pooler"** section
2. It should have a green "IPV4 COMPATIBLE" tag
3. Expand that section (click on it)
4. Copy the connection string from there
5. It should look like:
   ```
   postgres://postgres.gbkousybqfubewjmrqld:[PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres
   ```
6. Replace `[PASSWORD]` with `BusManagementSystem1234`

## Update Your .env

Once you have the Shared Pooler connection string, update your `.env` file with it.

The Shared Pooler connection string will use:
- Username: `postgres.gbkousybqfubewjmrqld` (with project ref)
- Host: `aws-0-us-west-1.pooler.supabase.com` (pooler endpoint)
- Port: `6543` (pooled connection)
- IPv4 compatible ✅

This should resolve the connection issues!





