# Setting Up PostgreSQL Database with Supabase

This guide will walk you through setting up your Eagle Line Bus Management System with Supabase as your PostgreSQL database provider.

## Step 1: Create a Supabase Account

1. Go to [supabase.com](https://supabase.com)
2. Click **"Start your project"** or **"Sign Up"**
3. Sign up using GitHub, Google, or email
4. Verify your email if required

## Step 2: Create a New Project

1. Once logged in, click **"New Project"**
2. Fill in the project details:
   - **Name**: `eagle-line-bus-management` (or any name you prefer)
   - **Database Password**: Create a strong password (save this - you'll need it!)
   - **Region**: Choose the region closest to you
   - **Pricing Plan**: Free tier is perfect for development
3. Click **"Create new project"**
4. Wait 2-3 minutes for the project to be set up

## Step 3: Get Your Database Connection String

1. In your Supabase project dashboard, go to **Settings** (gear icon in the left sidebar)
2. Click on **Database** in the settings menu
3. Scroll down to **Connection string** section
4. Select **URI** tab
5. Copy the connection string - it will look like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```

## Step 4: Configure Your Project

1. **Create the `.env` file** in the `server` directory:
   ```bash
   cd server
   cp .env.example .env
   ```

2. **Update the `.env` file** with your Supabase connection string:
   ```env
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"
   JWT_SECRET="your-super-secret-jwt-key-change-this-in-production-min-32-chars"
   PORT=5000
   NODE_ENV=development
   ```

   **Important Notes:**
   - Replace `[YOUR-PASSWORD]` with the database password you created
   - Replace `[PROJECT-REF]` with your actual project reference (found in your Supabase URL)
   - The `?pgbouncer=true&connection_limit=1` parameters help with connection pooling
   - Use a strong, random string for `JWT_SECRET` (at least 32 characters)

   **Example:**
   ```env
   DATABASE_URL="postgresql://postgres:MySecurePassword123@db.abcdefghijklmnop.supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"
   JWT_SECRET="a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6"
   PORT=5000
   NODE_ENV=development
   ```

## Step 5: Install Dependencies

From the root directory:
```bash
npm run install:all
```

Or manually:
```bash
npm install
cd server && npm install
cd ../client && npm install
```

## Step 6: Set Up the Database Schema

1. **Generate Prisma Client**:
   ```bash
   cd server
   npm run prisma:generate
   ```

2. **Run Database Migrations**:
   ```bash
   npm run prisma:migrate
   ```
   
   When prompted:
   - Enter a migration name: `init` or `initial_schema`
   - This will create all the tables in your Supabase database

3. **Verify the Migration**:
   - Go to your Supabase dashboard
   - Click on **Table Editor** in the left sidebar
   - You should see all the tables created (users, stations, routes, trips, bookings, etc.)

## Step 7: (Optional) View Database in Supabase

Supabase provides a nice UI to view and manage your data:

1. **Table Editor**: View and edit data directly
2. **SQL Editor**: Run SQL queries
3. **Database**: View database structure and relationships

## Step 8: Start Your Application

1. **Start the development servers**:
   ```bash
   # From root directory
   npm run dev
   ```

   Or separately:
   ```bash
   # Terminal 1 - Backend
   cd server
   npm run dev

   # Terminal 2 - Frontend  
   cd client
   npm run dev
   ```

2. **Access your application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Alternative: Using Direct Connection (Without Connection Pooling)

If you encounter connection issues with the pooled connection, you can use the direct connection string:

1. In Supabase Dashboard → Settings → Database
2. Under **Connection string**, select **Session mode** (instead of Transaction mode)
3. Copy the connection string
4. Update your `.env` file (remove the `pgbouncer` parameters):
   ```env
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
   ```

## Troubleshooting

### Connection Issues

**Error: "Connection refused" or "Connection timeout"**
- Verify your database password is correct
- Check that your project reference is correct
- Ensure your IP is not blocked (Supabase free tier allows all IPs by default)

**Error: "Too many connections"**
- Use the connection pooling string (with `pgbouncer=true`)
- Or use the Session mode connection string

**Error: "SSL required"**
- Supabase requires SSL. Prisma should handle this automatically, but if you see this error, add `?sslmode=require` to your connection string

### Migration Issues

**Error: "Migration failed"**
- Check your connection string is correct
- Ensure you have the correct database password
- Try running `npx prisma migrate reset` (WARNING: This deletes all data)

**Error: "Schema already exists"**
- If you've run migrations before, you might need to reset:
  ```bash
  npx prisma migrate reset
  ```
  Then run migrations again

### Viewing Your Data

- Use **Supabase Table Editor** to view and edit data
- Use **Prisma Studio** for a better development experience:
  ```bash
   cd server
   npm run prisma:studio
   ```
   This opens a local UI at http://localhost:5555

## Security Best Practices

1. **Never commit your `.env` file** - It's already in `.gitignore`
2. **Use strong passwords** for your database
3. **Rotate your JWT_SECRET** regularly in production
4. **Use environment-specific `.env` files** (`.env.development`, `.env.production`)

## Next Steps

1. Create your first admin user (see main SETUP.md)
2. Add sample stations, routes, and buses
3. Start creating trips and accepting bookings!

## Supabase Free Tier Limits

- **Database Size**: 500 MB
- **Bandwidth**: 2 GB/month
- **API Requests**: 50,000/month
- **Database Connections**: Limited (use connection pooling)

For production, consider upgrading to a paid plan or using Supabase's self-hosting option.

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Prisma with Supabase](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-supabase)
- [Supabase Connection Pooling](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler)






