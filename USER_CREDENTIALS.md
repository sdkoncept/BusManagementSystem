# User Credentials

## Created Users

All users have been created with the password: **Admin1234!**

### 1. Front Office Staff
- **Email:** `staff@eagleline.com`
- **Password:** `Admin1234!`
- **Role:** STAFF
- **Access:** Front Office booking interface (`/front-office`) and Inventory Management

### 2. Driver
- **Email:** `driver@eagleline.com`
- **Password:** `Admin1234!`
- **Role:** DRIVER (linked to driver account)
- **Access:** Driver mobile app (`/driver`) - View trips, request fuel, call for help

### 3. Store Keeper
- **Email:** `storekeeper@eagleline.com`
- **Password:** `Admin1234!`
- **Role:** STORE_KEEPER
- **Access:** Inventory Management (`/inventory`) - Manage stock, fulfill requests

## Setup Instructions

1. **Run the SQL script:**
   - Open Supabase SQL Editor
   - Run the file: `server/prisma/create_users.sql`
   - Verify users were created successfully

2. **Test Login:**
   - Go to `/login` in your application
   - Use any of the credentials above to login
   - You'll be redirected to the appropriate view based on your role

## Features by User Type

### Front Office Staff (`staff@eagleline.com`)
- Book passengers on trips from front desk
- Search and filter available trips
- Select seats and enter passenger details
- Confirm bookings

### Driver (`driver@eagleline.com`)
- View current/active trip
- See upcoming trips
- View bus assigned, route, departure time, passenger count
- Request fuel approval
- Call for help if stranded

### Store Keeper (`storekeeper@eagleline.com`)
- View all inventory items
- See stock levels and low stock alerts
- View pending and approved requests
- Fulfill approved requests (deducts from stock automatically)
- Create new stock requests (if needed)

## Notes

- The driver user is linked to a driver record (DL-DRIVER-001)
- All passwords are hashed using bcrypt
- Users can be updated or deleted through the admin panel
- For security, change passwords after first login

