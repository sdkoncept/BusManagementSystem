# Fix "Tenant or user not found" - Username Format Issue

## The Problem

For Supabase direct connections (port 5432), the username format is different from pooled connections:
- **Direct connection (5432)**: Username should be `postgres` (not `postgres.[project-ref]`)
- **Pooled connection (6543)**: Username is `postgres.[project-ref]`

## Solution Options

### Option 1: Use Direct Connection with Simple Username (Recommended for Migrations)

Update your `.env` to use just `postgres` as the username:

```env
DATABASE_URL="postgresql://postgres:%211Josephine%401948@aws-0-us-west-1.pooler.supabase.com:5432/postgres"
```

**OR** if that doesn't work, try the direct connection endpoint (not pooler):

```env
DATABASE_URL="postgresql://postgres:%211Josephine%401948@db.gbkousybqfubewjmrqld.supabase.co:5432/postgres"
```

### Option 2: Use Pooled Connection (Port 6543)

If you want to use the pooled connection, use port 6543 with the project-ref username:

```env
DATABASE_URL="postgresql://postgres.gbkousybqfubewjmrqld:%211Josephine%401948@aws-0-us-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
```

### Option 3: Get the Correct Connection String from Supabase

1. Go to: https://supabase.com/dashboard/project/gbkousybqfubewjmrqld/settings/database
2. Scroll to **"Connection string"**
3. For migrations, use **"Session mode"** (direct connection)
4. Copy the connection string exactly as shown
5. Make sure to URL-encode the password if it has special characters

## Try These Formats in Order:

### Format 1: Direct with simple postgres user
```env
DATABASE_URL="postgresql://postgres:%211Josephine%401948@db.gbkousybqfubewjmrqld.supabase.co:5432/postgres"
```

### Format 2: Direct with pooler endpoint
```env
DATABASE_URL="postgresql://postgres:%211Josephine%401948@aws-0-us-west-1.pooler.supabase.com:5432/postgres"
```

### Format 3: Pooled connection
```env
DATABASE_URL="postgresql://postgres.gbkousybqfubewjmrqld:%211Josephine%401948@aws-0-us-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
```

## Verify Your Database Password

Make sure you're using the **database password**, not your Supabase account password. You can reset it in:
Settings → Database → Database password → Reset database password





