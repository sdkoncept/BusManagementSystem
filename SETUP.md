# Setup Guide for Eagle Line Bus Management System

## Quick Start

### 1. Install Dependencies

```bash
# Install all dependencies (root, server, and client)
npm run install:all
```

Or manually:
```bash
npm install
cd server && npm install
cd ../client && npm install
```

### 2. Database Setup

**Choose one of the following options:**

#### Option A: Supabase (Recommended - Easiest)

See the detailed guide in [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for step-by-step instructions.

Quick steps:
1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Get your connection string from Settings → Database
4. Update `server/.env` with your Supabase connection string

#### Option B: Local PostgreSQL

1. **Install PostgreSQL** if not already installed
   - macOS: `brew install postgresql`
   - Ubuntu: `sudo apt-get install postgresql`
   - Windows: Download from [postgresql.org](https://www.postgresql.org/download/)

2. **Create Database**
   ```bash
   createdb eagle_line_db
   ```

3. **Configure Environment Variables**
   - Copy `server/.env.example` to `server/.env`
   - Update the `DATABASE_URL` with your PostgreSQL credentials:
     ```
     DATABASE_URL="postgresql://username:password@localhost:5432/eagle_line_db?schema=public"
     ```
   - Set a secure `JWT_SECRET` (use a long random string)

4. **Run Database Migrations**
   ```bash
   cd server
   npm run prisma:generate
   npm run prisma:migrate
   ```

### 3. Start Development Servers

From the root directory:
```bash
npm run dev
```

This starts:
- Backend API on `http://localhost:5000`
- Frontend app on `http://localhost:3000`

Or start them separately:
```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

### 4. Create Your First Admin User

You can create an admin user through the registration endpoint:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@eagleline.com",
    "password": "admin123",
    "firstName": "Admin",
    "lastName": "User",
    "role": "ADMIN"
  }'
```

Or use Prisma Studio to manually create a user:
```bash
cd server
npm run prisma:studio
```

Then navigate to the Users table and create a user with role "ADMIN".

## Initial Data Setup

### Add Sample Stations

```bash
# Example: Add a station
curl -X POST http://localhost:5000/api/stations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Central Station",
    "code": "CEN",
    "address": "123 Main Street",
    "city": "New York",
    "state": "NY",
    "country": "USA"
  }'
```

### Add Sample Routes

```bash
# Example: Add a route
curl -X POST http://localhost:5000/api/routes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "New York to Boston",
    "code": "NY-BOS",
    "description": "Express route between New York and Boston",
    "distance": 350,
    "duration": 240,
    "stations": [
      {"stationId": "station-id-1", "order": 1, "distance": 0},
      {"stationId": "station-id-2", "order": 2, "distance": 350}
    ]
  }'
```

### Add Sample Buses

```bash
# Example: Add a bus
curl -X POST http://localhost:5000/api/buses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "plateNumber": "EL-001",
    "model": "Mercedes Tourismo",
    "manufacturer": "Mercedes-Benz",
    "year": 2023,
    "capacity": 50,
    "seatLayout": "{\"rows\": 13, \"cols\": 4}",
    "amenities": "[\"WiFi\", \"AC\", \"USB Charging\", \"Reclining Seats\"]"
  }'
```

## Troubleshooting

### Database Connection Issues

- Verify PostgreSQL is running: `pg_isready`
- Check your DATABASE_URL format
- Ensure the database exists: `psql -l | grep eagle_line_db`

### Port Already in Use

If port 5000 or 3000 is already in use:
- Backend: Change `PORT` in `server/.env`
- Frontend: Change port in `client/vite.config.ts`

### Prisma Issues

- If schema changes, run: `npm run prisma:generate && npm run prisma:migrate`
- Reset database (WARNING: deletes all data): `npx prisma migrate reset`

### Build Issues

- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Clear Prisma cache: `rm -rf server/node_modules/.prisma`

## Production Deployment

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Set production environment variables**

3. **Run migrations**:
   ```bash
   cd server
   npm run prisma:migrate deploy
   ```

4. **Start the server**:
   ```bash
   cd server
   npm start
   ```

5. **Serve frontend** using nginx, Apache, or a platform like Vercel/Netlify

## Next Steps

1. Create admin user
2. Add stations
3. Create routes connecting stations
4. Add buses to the fleet
5. Create trips
6. Start accepting bookings!

For more information, see the main [README.md](./README.md) file.
