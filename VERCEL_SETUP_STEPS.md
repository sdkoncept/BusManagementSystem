# Complete Vercel GitHub Connection - Step by Step

## I can't do this automatically (requires browser login), but here's the EXACT steps:

## Method 1: Via Vercel Dashboard (EASIEST - Recommended)

### Step 1: Open Browser and Login
1. Open: https://vercel.com/login
2. Login with your Vercel account (or sign up if needed)

### Step 2: Add GitHub Integration
1. Go to: https://vercel.com/account/integrations
2. Click "Add" button next to "GitHub"
3. GitHub will ask you to authorize - click "Authorize Vercel"
4. Select which repositories - choose "All repositories" or select `sdkoncept/BusManagementSystem`
5. Click "Install"

### Step 3: Create/Import Project
1. Go to: https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. You should see your GitHub repositories
4. Find and click on `sdkoncept/BusManagementSystem`
5. Click "Import"

### Step 4: Configure Project
On the import screen, set:

- **Framework Preset**: `Other`
- **Root Directory**: `.` (leave as default)
- **Build Command**: 
  ```
  npm install && cd server && npm install && npm run prisma:generate && cd ../client && npm install && npm run build
  ```
- **Output Directory**: `client/dist`
- **Install Command**: (leave empty)

### Step 5: Add Environment Variables
Scroll down to "Environment Variables" and add:

1. **DATABASE_URL**
   - Value: Your Supabase connection string (from server/.env)
   - Environment: Production, Preview, Development (select all)

2. **JWT_SECRET**
   - Value: Your JWT secret (from server/.env)
   - Environment: Production, Preview, Development (select all)

3. **NODE_ENV**
   - Value: `production`
   - Environment: Production (only)

4. **FRONTEND_URL**
   - Leave this - Vercel will set it automatically

### Step 6: Deploy
1. Click "Deploy" button at bottom
2. Wait for build to complete
3. Once deployed, check: https://github.com/sdkoncept/BusManagementSystem/settings/hooks
4. You should see a Vercel webhook! ✅

---

## Method 2: Via Vercel CLI (Alternative)

If you prefer command line:

```bash
# 1. Login (opens browser)
vercel login

# 2. Link project (will ask about GitHub)
vercel link

# 3. Deploy
vercel --prod
```

---

## After Setup - Test Automatic Deployment

Once connected, make a test commit:

```bash
git add .
git commit -m "Test Vercel auto-deployment"
git push origin main
```

Then check Vercel dashboard - you should see a new deployment automatically! 🎉

