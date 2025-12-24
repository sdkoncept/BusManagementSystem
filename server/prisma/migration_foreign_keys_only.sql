-- Foreign Key Constraints for Enhanced Features
-- Run this separately if the main migration fails on foreign keys
-- This script uses DO blocks to safely add constraints

-- Favorite Routes
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'favorite_routes_userId_fkey') THEN
        ALTER TABLE "favorite_routes" 
        ADD CONSTRAINT "favorite_routes_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'favorite_routes_routeId_fkey') THEN
        ALTER TABLE "favorite_routes" 
        ADD CONSTRAINT "favorite_routes_routeId_fkey" 
        FOREIGN KEY ("routeId") REFERENCES "routes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- Trip Reviews
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'trip_reviews_userId_fkey') THEN
        ALTER TABLE "trip_reviews" 
        ADD CONSTRAINT "trip_reviews_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'trip_reviews_tripId_fkey') THEN
        ALTER TABLE "trip_reviews" 
        ADD CONSTRAINT "trip_reviews_tripId_fkey" 
        FOREIGN KEY ("tripId") REFERENCES "trips"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- Waitlist Entries
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'waitlist_entries_userId_fkey') THEN
        ALTER TABLE "waitlist_entries" 
        ADD CONSTRAINT "waitlist_entries_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'waitlist_entries_tripId_fkey') THEN
        ALTER TABLE "waitlist_entries" 
        ADD CONSTRAINT "waitlist_entries_tripId_fkey" 
        FOREIGN KEY ("tripId") REFERENCES "trips"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- Loyalty Transactions
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'loyalty_transactions_userId_fkey') THEN
        ALTER TABLE "loyalty_transactions" 
        ADD CONSTRAINT "loyalty_transactions_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- Payments
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payments_bookingId_fkey') THEN
        ALTER TABLE "payments" 
        ADD CONSTRAINT "payments_bookingId_fkey" 
        FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- Driver Earnings
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'driver_earnings_driverId_fkey') THEN
        ALTER TABLE "driver_earnings" 
        ADD CONSTRAINT "driver_earnings_driverId_fkey" 
        FOREIGN KEY ("driverId") REFERENCES "drivers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- Incidents
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'incidents_tripId_fkey') THEN
        ALTER TABLE "incidents" 
        ADD CONSTRAINT "incidents_tripId_fkey" 
        FOREIGN KEY ("tripId") REFERENCES "trips"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'incidents_driverId_fkey') THEN
        ALTER TABLE "incidents" 
        ADD CONSTRAINT "incidents_driverId_fkey" 
        FOREIGN KEY ("driverId") REFERENCES "drivers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

-- Vehicle Inspections
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'vehicle_inspections_tripId_fkey') THEN
        ALTER TABLE "vehicle_inspections" 
        ADD CONSTRAINT "vehicle_inspections_tripId_fkey" 
        FOREIGN KEY ("tripId") REFERENCES "trips"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'vehicle_inspections_driverId_fkey') THEN
        ALTER TABLE "vehicle_inspections" 
        ADD CONSTRAINT "vehicle_inspections_driverId_fkey" 
        FOREIGN KEY ("driverId") REFERENCES "drivers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

-- Messages
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'messages_driverId_fkey') THEN
        ALTER TABLE "messages" 
        ADD CONSTRAINT "messages_driverId_fkey" 
        FOREIGN KEY ("driverId") REFERENCES "drivers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- Customer Profiles
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'customer_profiles_userId_fkey') THEN
        ALTER TABLE "customer_profiles" 
        ADD CONSTRAINT "customer_profiles_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- Complaints
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'complaints_userId_fkey') THEN
        ALTER TABLE "complaints" 
        ADD CONSTRAINT "complaints_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- Purchase Orders
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'purchase_orders_supplierId_fkey') THEN
        ALTER TABLE "purchase_orders" 
        ADD CONSTRAINT "purchase_orders_supplierId_fkey" 
        FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

-- Stock Movements
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'stock_movements_inventoryId_fkey') THEN
        ALTER TABLE "stock_movements" 
        ADD CONSTRAINT "stock_movements_inventoryId_fkey" 
        FOREIGN KEY ("inventoryId") REFERENCES "inventory_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

-- Inventory Items - Supplier relation
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'inventory_items_supplierId_fkey') THEN
        ALTER TABLE "inventory_items" 
        ADD CONSTRAINT "inventory_items_supplierId_fkey" 
        FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

