# Connect Vercel to GitHub - Step by Step Guide

## The Problem
Vercel has no GitHub integration installed, so it can't access your repository or create webhooks.

## Solution: Install GitHub Integration

### Step 1: Connect GitHub to Vercel Account

1. Go to: **https://vercel.com/account/integrations**
2. You should see a list of available integrations
3. Find **"GitHub"** in the list
4. Click **"Add"** or **"Connect"** button next to GitHub
5. You'll be redirected to GitHub to authorize Vercel
6. Click **"Authorize Vercel"** on GitHub
7. GitHub will ask what repositories to grant access to:
   - **Option A**: Select "All repositories" (easiest)
   - **Option B**: Select "Only select repositories" and choose `sdkoncept/BusManagementSystem`
8. Click **"Install"** or **"Authorize"**

### Step 2: Connect Repository to Your Project

After installing the GitHub integration:

1. Go back to your Vercel dashboard: **https://vercel.com/dashboard**
2. If you already have a project:
   - Click on your project
   - Go to **Settings** → **Git**
   - Click **"Connect Git Repository"**
   - You should now see your GitHub repositories
   - Select `sdkoncept/BusManagementSystem`
   - Click **"Import"** or **"Connect"**

3. If you DON'T have a project yet:
   - Click **"Add New..."** → **"Project"**
   - You should now see your GitHub repositories
   - Find and select `sdkoncept/BusManagementSystem`
   - Click **"Import"**

### Step 3: Configure Project Settings

When importing the project, Vercel will ask for configuration:

1. **Root Directory**: Leave as default (`.`)
2. **Framework Preset**: Select "Other" or "Vite"
3. **Build Command**: 
   ```
   npm install && cd server && npm install && npm run prisma:generate && cd ../client && npm install && npm run build
   ```
4. **Output Directory**: `client/dist`
5. **Install Command**: Leave empty

### Step 4: Add Environment Variables

Before deploying, add your environment variables:

1. In the project import screen, scroll to **"Environment Variables"**
2. Add these variables:
   - `DATABASE_URL` = Your Supabase connection string
   - `JWT_SECRET` = Your JWT secret
   - `NODE_ENV` = `production`
   - `FRONTEND_URL` = Will be set automatically

3. Click **"Deploy"**

### Step 5: Verify Webhook is Created

After deployment starts:

1. Go to: **https://github.com/sdkoncept/BusManagementSystem/settings/hooks**
2. You should now see a webhook with URL containing `vercel.com`
3. If you see it, automatic deployments are working! ✅

### Step 6: Test Automatic Deployment

1. Make a small change in your code
2. Commit and push:
   ```bash
   git add .
   git commit -m "Test auto-deployment"
   git push origin main
   ```
3. Go to Vercel dashboard → Deployments
4. You should see a new deployment automatically triggered! 🎉

## Troubleshooting

### If you don't see GitHub in integrations:
- Make sure you're logged into the correct Vercel account
- Try logging out and logging back in
- Check if you're on a team/org account that might have restrictions

### If GitHub integration is already there but not working:
- Click "Configure" next to GitHub
- Make sure `sdkoncept/BusManagementSystem` has access
- Try disconnecting and reconnecting

### If webhook still doesn't appear:
- Wait 2-3 minutes after connecting
- Check if repository is private (may need additional permissions)
- Try manually redeploying once to trigger webhook creation

