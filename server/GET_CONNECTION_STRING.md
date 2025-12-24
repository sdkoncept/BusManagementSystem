# Get the Correct Connection String from Supabase

## Step-by-Step Instructions

1. **Go to your Supabase Dashboard:**
   - https://supabase.com/dashboard/project/gbkousybqfubewjmrqld/settings/database

2. **Scroll to "Connection string" section**

3. **For Prisma Migrations, use "Session mode" (Direct connection):**
   - Click on the **"Session mode"** tab
   - You'll see a connection string like:
     ```
     postgresql://postgres.gbkousybqfubewjmrqld:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:5432/postgres
     ```

4. **Copy the entire connection string**

5. **Update your .env file:**
   ```bash
   cd server
   nano .env
   ```
   
   Replace the DATABASE_URL line with the connection string from Supabase, making sure to:
   - Keep the quotes around the value
   - Use your actual password: `BusManagementSystem1234`
   - The connection string should look exactly like what Supabase shows

## Example Format

Your `.env` should look like:
```env
DATABASE_URL="postgresql://postgres.gbkousybqfubewjmrqld:BusManagementSystem1234@aws-0-us-west-1.pooler.supabase.com:5432/postgres"
JWT_SECRET=Q1fbPOlNAPClxDNWRyKjkW0JILW0iaaDb/XdfSw2GZy7sWwPmKtIkyw9O1xFfACNIv5QXmmsR++l3leZoI73jQ==
PORT=5000
NODE_ENV=development
```

## Important Notes

- Use the **exact** connection string format from Supabase
- Make sure you're using the **Session mode** connection string (not Transaction mode)
- The password should be `BusManagementSystem1234` (no URL encoding needed since it has no special characters)
- The username format might be `postgres.[project-ref]` or just `postgres` depending on your Supabase setup

## After Updating

Run the migration:
```bash
npm run prisma:migrate
```

If you still get errors, try the **Transaction mode** connection string instead, or check if your database password was actually updated in Supabase.





