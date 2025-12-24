# .env File Format for Supabase

Your `.env` file in the `server` directory should look exactly like this:

```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"
JWT_SECRET="your-super-secret-jwt-key-minimum-32-characters-long"
PORT=5000
NODE_ENV=development
```

## Important Notes:

1. **DATABASE_URL must start with `postgresql://`** (not `https://` or anything else)
2. **Replace `[YOUR-PASSWORD]`** with your actual Supabase database password
3. **Replace `[PROJECT-REF]`** with your Supabase project reference (found in your Supabase dashboard URL)
4. **Use quotes** around the DATABASE_URL value
5. **No spaces** around the `=` sign
6. **JWT_SECRET** should be at least 32 characters long

## How to Get Your Supabase Connection String:

1. Go to your Supabase project dashboard
2. Click **Settings** (gear icon) → **Database**
3. Scroll to **Connection string** section
4. Select **URI** tab
5. Copy the connection string
6. It should look like:
   ```
   postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres
   ```
   
   OR for direct connection:
   ```
   postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:5432/postgres
   ```

## Example .env file:

```env
DATABASE_URL="postgresql://postgres.abcdefghijklmnop:MySecurePassword123@aws-0-us-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
JWT_SECRET="a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6"
PORT=5000
NODE_ENV=development
```

## Troubleshooting:

If you're still getting the error:
1. Make sure there are **no extra spaces** in your .env file
2. Make sure the **DATABASE_URL is on a single line** (no line breaks)
3. Make sure you're **inside the server directory** when running commands
4. Try using the **direct connection** (port 5432) instead of pooled connection (port 6543)






