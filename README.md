# Eagle Line Bus Management System

A comprehensive bus management system built for Eagle Line company with features for trip tracking, online reservations, seat selection, and administrative management.

## Features

### Core Features
- **Trip Tracking**: Real-time tracking of bus trips with location updates
- **Online Reservation**: Complete booking system with seat selection
- **Seat Selection**: Interactive seat map for choosing preferred seats
- **Bus Booking Form**: Streamlined booking process for riders
- **Smart App Experience**: Intuitive interfaces for both riders and bus staff
- **Trip Management**: Create, update, and manage bus trips
- **Route Management**: Define and manage bus routes with multiple stations
- **Station Management**: Add and manage bus stations
- **Customizable Web Portal Settings**: Admin-configurable system settings

### User Roles
- **Rider**: Book trips, view bookings, track trips
- **Staff**: Manage trips, view all bookings, update trip status
- **Admin**: Full system access including settings, buses, routes, and stations

## Tech Stack

### Backend
- **Node.js** with **Express**
- **TypeScript** for type safety
- **Prisma** ORM with **PostgreSQL** database
- **JWT** for authentication
- **bcryptjs** for password hashing

### Frontend
- **React** with **TypeScript**
- **Vite** for build tooling
- **React Router** for navigation
- **Zustand** for state management
- **Tailwind CSS** for styling
- **Axios** for API calls
- **React Hot Toast** for notifications
- **Lucide React** for icons

## Project Structure

```
Bus Management System/
├── server/                 # Backend API
│   ├── src/
│   │   ├── routes/        # API route handlers
│   │   ├── middleware/    # Auth middleware
│   │   └── index.ts       # Server entry point
│   ├── prisma/
│   │   └── schema.prisma  # Database schema
│   └── package.json
├── client/                # Frontend application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API service
│   │   ├── store/         # State management
│   │   └── App.tsx        # Main app component
│   └── package.json
└── package.json          # Root package.json
```

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database (local installation or Supabase - see [SUPABASE_SETUP.md](./SUPABASE_SETUP.md))
- npm or yarn

### Installation

1. **Clone the repository** (or navigate to the project directory)

2. **Install dependencies**:
   ```bash
   npm run install:all
   ```

3. **Set up the database**:
   - **Option A - Supabase (Recommended for beginners)**: See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed instructions
   - **Option B - Local PostgreSQL**: Create a PostgreSQL database, copy `server/.env.example` to `server/.env` and update the `DATABASE_URL`
   - Run migrations:
     ```bash
     cd server
     npm run prisma:generate
     npm run prisma:migrate
     ```

4. **Start the development servers**:
   ```bash
   npm run dev
   ```
   This will start both the backend (port 5000) and frontend (port 3000) servers.

### Environment Variables

Create a `server/.env` file with the following variables:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/eagle_line_db?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
PORT=5000
NODE_ENV=development
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Routes
- `GET /api/routes` - Get all routes
- `GET /api/routes/:id` - Get route by ID
- `POST /api/routes` - Create route (Admin/Staff)
- `PUT /api/routes/:id` - Update route (Admin/Staff)
- `DELETE /api/routes/:id` - Delete route (Admin)

### Stations
- `GET /api/stations` - Get all stations
- `GET /api/stations/:id` - Get station by ID
- `POST /api/stations` - Create station (Admin/Staff)
- `PUT /api/stations/:id` - Update station (Admin/Staff)
- `DELETE /api/stations/:id` - Delete station (Admin)

### Trips
- `GET /api/trips` - Get trips (with filters)
- `GET /api/trips/:id` - Get trip with seat availability
- `POST /api/trips` - Create trip (Admin/Staff)
- `PUT /api/trips/:id` - Update trip (Admin/Staff)
- `PATCH /api/trips/:id/location` - Update trip location (Staff)
- `DELETE /api/trips/:id` - Delete trip (Admin)

### Bookings
- `GET /api/bookings` - Get bookings (filtered by user role)
- `GET /api/bookings/:id` - Get booking by ID
- `POST /api/bookings` - Create booking
- `PATCH /api/bookings/:id/status` - Update booking status (Admin/Staff)
- `PATCH /api/bookings/:id/cancel` - Cancel booking

### Buses
- `GET /api/buses` - Get all buses
- `GET /api/buses/:id` - Get bus by ID
- `POST /api/buses` - Create bus (Admin/Staff)
- `PUT /api/buses/:id` - Update bus (Admin/Staff)
- `DELETE /api/buses/:id` - Delete bus (Admin)

### Settings
- `GET /api/settings` - Get all settings (Admin/Staff)
- `GET /api/settings/:key` - Get setting by key (Admin/Staff)
- `POST /api/settings` - Create/update setting (Admin)
- `PUT /api/settings/:key` - Update setting (Admin)
- `DELETE /api/settings/:key` - Delete setting (Admin)

## Database Schema

The system uses the following main models:
- **User**: Users with roles (ADMIN, STAFF, RIDER)
- **Station**: Bus stations with location data
- **Route**: Bus routes connecting stations
- **RouteStation**: Junction table for route-station relationships
- **Bus**: Bus fleet information
- **Trip**: Scheduled trips with departure/arrival times
- **SeatStatus**: Seat availability for each trip
- **Booking**: Customer bookings
- **Settings**: System configuration

## Development

### Backend Development
```bash
cd server
npm run dev        # Start dev server with hot reload
npm run build      # Build for production
npm run prisma:studio  # Open Prisma Studio for database management
```

### Frontend Development
```bash
cd client
npm run dev        # Start dev server
npm run build      # Build for production
npm run preview    # Preview production build
```

## Production Deployment

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Set production environment variables** in `server/.env`

3. **Run database migrations**:
   ```bash
   cd server
   npm run prisma:migrate
   ```

4. **Start the server**:
   ```bash
   cd server
   npm start
   ```

5. **Serve the frontend** using a static file server (nginx, Apache, etc.) or deploy to a platform like Vercel, Netlify, etc.

## Security Considerations

- Passwords are hashed using bcrypt
- JWT tokens for authentication
- Role-based access control (RBAC)
- Input validation on API endpoints
- CORS configuration for API security

## Future Enhancements

- Payment integration
- Email notifications
- SMS notifications
- Mobile app (React Native)
- Advanced analytics dashboard
- Multi-language support
- Real-time chat support

## License

This project is proprietary software for Eagle Line company.

## Support

For issues and questions, please contact the development team.
