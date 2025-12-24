# Fix Vercel GitHub Connection - No Webhook Issue

## Problem
Vercel project connected to GitHub but no webhook is created, so automatic deployments don't work.

## Solution Steps

### Step 1: Check GitHub App Installation

1. Go to: https://github.com/settings/installations
2. Look for "Vercel" in the list
3. Click on it
4. Check if it has access to `sdkoncept/BusManagementSystem` repository
5. If not, click "Configure" and add access to your repository
6. Make sure it has these permissions:
   - ✅ Repository access: Read and write
   - ✅ Repository permissions: Contents, Metadata, Pull requests
   - ✅ Webhook permissions: Read and write

### Step 2: Re-authorize Vercel

1. Go to: https://vercel.com/account/integrations
2. Find "GitHub" integration
3. Click "Configure" or "Edit"
4. Re-authorize Vercel to access your GitHub account
5. Make sure to grant access to all repositories (or at least `sdkoncept/BusManagementSystem`)

### Step 3: Reconnect in Vercel Project

1. Go to your Vercel project dashboard
2. Settings → Git
3. Click "Disconnect" 
4. Click "Connect Git Repository"
5. Select `sdkoncept/BusManagementSystem`
6. Follow the prompts to authorize

### Step 4: Check for Webhook (Wait a few minutes)

After reconnecting, wait 1-2 minutes, then:
1. Go to: https://github.com/sdkoncept/BusManagementSystem/settings/hooks
2. Look for a webhook with URL containing `vercel.com`
3. If still not there, continue to Step 5

### Step 5: Manual Deployment Test

Even without webhook, you can test if the connection works:
1. In Vercel dashboard, go to Deployments tab
2. Click "Redeploy" on the latest deployment (or create a new one)
3. Select "Use existing Build Cache" = No
4. Click "Redeploy"

This will test if Vercel can access your repository.

### Step 6: Alternative - Use Vercel CLI (Optional)

If webhook still doesn't work, you can use Vercel CLI to deploy manually:
```bash
npm install -g vercel
cd "/home/aanenih/Documents/Cursor Projects/Bus Management System"
vercel --prod
```

### Step 7: Verify Email Match

Make sure your Git commit email matches your Vercel account email:
```bash
git config user.email
```

Check this matches your Vercel account email.

## Quick Test

After completing the steps above, make a test commit:
```bash
echo "// Test" >> vercel.json
git add vercel.json
git commit -m "Test deployment trigger"
git push origin main
```

Then check Vercel dashboard for a new deployment.

