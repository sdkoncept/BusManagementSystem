# Fix Vercel Build Error - "cd: server: No such file or directory"

## The Problem
Vercel is using an OLD build command from project settings instead of `vercel.json`.

## The Solution

You need to update the build command in **Vercel Project Settings**:

### Step 1: Go to Vercel Dashboard
1. Open: https://vercel.com/dashboard
2. Click on your project (BusManagementSystem)

### Step 2: Update Build Settings
1. Go to **Settings** → **General**
2. Scroll to **"Build & Development Settings"**
3. Find **"Build Command"**
4. **Delete the old command** (if it shows the old long command)
5. Set it to: `npm run vercel-build`
6. **OR** leave it empty/auto - Vercel will use `vercel.json`

### Step 3: Verify Output Directory
1. In the same section, find **"Output Directory"**
2. Set it to: `client/dist`
3. **OR** leave it empty - Vercel will use `vercel.json`

### Step 4: Remove Install Command Override
1. If there's an **"Install Command"** field, **delete it** or leave it empty
2. Vercel automatically runs `npm install` - you don't need to specify it

### Step 5: Save and Redeploy
1. Click **"Save"**
2. Go to **Deployments** tab
3. Click **"Redeploy"** on the latest deployment
4. Select **"Use existing Build Cache"** = No
5. Click **"Redeploy"**

## Alternative: Delete Build Settings Override

If Vercel is still using old settings:

1. Go to **Settings** → **General**
2. Find **"Build & Development Settings"**
3. **Clear/Delete** any values in:
   - Build Command
   - Output Directory  
   - Install Command
4. This forces Vercel to read from `vercel.json` instead
5. Save and redeploy

## Current vercel.json Configuration

Your `vercel.json` should have:
```json
{
  "buildCommand": "npm run vercel-build",
  "outputDirectory": "client/dist",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

And `package.json` has the `vercel-build` script:
```json
"vercel-build": "cd server && npm install && npm run prisma:generate && cd ../client && npm install && npm run build"
```

