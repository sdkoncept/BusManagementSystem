# Fix "cd: server: No such file or directory" Error

## The Problem
Vercel can't find the `server` directory when running the build command. This usually means the **Root Directory** is set incorrectly in Vercel project settings.

## The Solution

### Step 1: Check Root Directory in Vercel

1. Go to: https://vercel.com/dashboard
2. Click on your project (BusManagementSystem)
3. Go to **Settings** → **General**
4. Scroll to **"Root Directory"**
5. **It should be empty** or set to `.` (period/root)
6. If it says anything else (like `client`, `server`, etc.), **clear it** or set it to `.`
7. Click **Save**

### Step 2: Verify Repository Structure

Your repository should have this structure:
```
BusManagementSystem/
├── server/
├── client/
├── api/
├── vercel.json
└── package.json
```

### Step 3: Redeploy

1. Go to **Deployments** tab
2. Click **"Redeploy"** on the latest deployment
3. Select **"Use existing Build Cache"** = **No**
4. Click **"Redeploy"**

## Alternative: Check if Server Directory is in Git

If Root Directory is correct, verify the server directory is actually committed:

Run this locally:
```bash
git ls-files | grep "^server/"
```

You should see many files listed. If you don't see any, the server directory isn't in git and needs to be added.

## Still Not Working?

If it still fails after fixing Root Directory:

1. Go to Vercel project **Settings** → **General**
2. Scroll to **"Build & Development Settings"**
3. Make sure:
   - **Root Directory**: `.` (empty or dot)
   - **Build Command**: Leave empty (so it uses vercel.json) OR set to the full command
   - **Output Directory**: Leave empty (so it uses vercel.json) OR set to `client/dist`
4. Save and redeploy

