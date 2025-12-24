# Restart Server to Apply Changes

## The Issue
The Prisma client has been regenerated with the new `STORE_KEEPER` and `DRIVER` roles, but the server needs to be restarted to use the updated client.

## Steps to Fix

### 1. Stop the Backend Server
- Find the terminal running the backend server
- Press `Ctrl + C` to stop it

### 2. Restart the Backend Server
```bash
cd server
npm run dev
```

### 3. Verify It's Running
You should see:
```
🚌 Eagle Line API server running on port 5000
```

### 4. Clear Browser Cache and Login Again
1. **Log out** from the application
2. **Clear localStorage**: 
   - Press F12 → Application tab → Local Storage → Clear all
   - Or use Incognito/Private mode
3. **Log in** with `storekeeper@eagleline.com` / `Admin1234!`

## What Should Work Now

✅ Login should work without errors
✅ Store keeper should see only "Inventory Management" in navigation
✅ Store keeper should be redirected to `/inventory` automatically
✅ No access to routes, stations, trips, etc.

## If Still Not Working

1. **Verify database has the role:**
   ```sql
   SELECT email, role FROM users WHERE email = 'storekeeper@eagleline.com';
   ```
   Should show: `STORE_KEEPER`

2. **Check Prisma client:**
   ```bash
   cd server
   npx prisma generate
   ```

3. **Restart both servers:**
   - Backend: `cd server && npm run dev`
   - Frontend: `cd client && npm run dev`

