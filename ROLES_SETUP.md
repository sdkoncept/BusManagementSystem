# Role-Based Access Control Setup

## Available Roles

The system now supports the following roles:

1. **ADMIN** - Full system access
2. **STAFF** - Front office operations (booking passengers)
3. **DRIVER** - Driver mobile app access
4. **STORE_KEEPER** - Inventory management
5. **RIDER** - Regular passenger (default)

## Setup Instructions

### Step 1: Add New Roles to Database

Run the migration to add DRIVER and STORE_KEEPER roles:

```sql
-- Run: server/prisma/migration_add_roles.sql
```

This will add the new enum values to the `UserRole` type.

### Step 2: Create Users

Run the user creation script:

```sql
-- Run: server/prisma/create_users.sql
```

This creates:
- Front Office Staff (STAFF role)
- Driver (DRIVER role, linked to driver record)
- Store Keeper (STORE_KEEPER role)

### Step 3: Verify

Check that all roles are available:

```sql
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'UserRole')
ORDER BY enumsortorder;
```

Should show: ADMIN, DRIVER, RIDER, STAFF, STORE_KEEPER

## Role Permissions

### ADMIN
- Full access to all features
- Manage trips, buses, drivers, routes, stations
- Approve/reject requests
- System settings
- Monitoring dashboard

### STAFF
- Front office booking interface
- Book passengers on trips
- View available trips and seats

### DRIVER
- View assigned trips
- See bus, route, departure time, passenger count
- Request fuel approval
- Call for help if stranded

### STORE_KEEPER
- View all inventory items
- See stock levels and low stock alerts
- View pending and approved requests
- Fulfill approved requests (deducts stock automatically)
- Create stock requests

### RIDER
- Search and book trips
- View own bookings
- Cancel bookings

## Access Routes

- `/front-office` - STAFF only
- `/driver` - DRIVER only
- `/inventory` - STORE_KEEPER only
- `/admin/*` - ADMIN only (some routes allow STAFF)

