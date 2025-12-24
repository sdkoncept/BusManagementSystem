# Seed Data Information

The platform has been populated with comprehensive sample data.

## Summary

- **10 Stations** across major Nigerian cities (Benin, Warri, Abuja, Lagos, Ibadan, Kano, Port Harcourt, Enugu, Kaduna, Abeokuta)
- **10 Routes** connecting various cities with distances and durations
- **10 Buses** (mix of buses and Siennas with different models and capacities)
- **10 Drivers** with complete profiles, ratings, and service history
- **20 Users** with different roles:
  - 1 Admin user
  - 2 Staff users
  - 1 Store Keeper user
  - 3 Driver users (linked to driver records)
  - 13 Rider/Passenger users
- **20 Trips** scheduled across different routes and dates
- **15 Bookings** for various trips with different statuses
- **10 Inventory Items** for maintenance and supplies

## Default Login Credentials

**Password for ALL users:** `password123`

### Admin Access
- Email: `admin@eagleline.com`
- Password: `password123`
- Role: ADMIN

### Staff Access
- Email: `staff1@eagleline.com` or `staff2@eagleline.com`
- Password: `password123`
- Role: STAFF

### Store Keeper Access
- Email: `storekeeper@eagleline.com`
- Password: `password123`
- Role: STORE_KEEPER

### Driver Access
- Email: `driver1@eagleline.com`, `driver2@eagleline.com`, or `driver3@eagleline.com`
- Password: `password123`
- Role: DRIVER

### Rider/Passenger Access
- Email: `rider1@example.com` through `rider13@example.com`
- Password: `password123`
- Role: RIDER

## Running the Seed Script Again

To re-run the seed script (it uses upsert, so it will update existing records):

```bash
cd server
node prisma/seed_comprehensive.js
```

## Notes

- All users share the same default password for easy testing
- Routes include pricing information
- Trips are scheduled over 4 days with different times
- Bookings include various statuses (CONFIRMED, COMPLETED)
- Inventory items have stock levels and pricing information
- Driver records include ratings, service history, and earnings data

