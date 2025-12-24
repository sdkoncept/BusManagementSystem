# Force Vercel to Use Latest Code

## The Problem
Vercel is still using an old cached version of `package.json` that has `tsc && vite build` instead of just `vite build`.

## Solution: Force Fresh Deployment

### Step 1: Verify Latest Commit
The latest commit should be: `d48fb2c` - "Remove tsc step from build - Vite handles TypeScript compilation"

### Step 2: In Vercel Dashboard

1. Go to: https://vercel.com/dashboard
2. Click on your project
3. Go to **Deployments** tab
4. Find the latest deployment (should show commit `d48fb2c` or later)
5. Click the **three dots (⋯)** menu on that deployment
6. Select **"Redeploy"**
7. **IMPORTANT**: Make sure **"Use existing Build Cache"** is set to **NO** (unchecked)
8. Click **"Redeploy"**

### Step 3: Alternative - Delete Build Cache

If redeploy doesn't work:

1. In Vercel project → **Settings** → **General**
2. Scroll to **"Build & Development Settings"**
3. Look for cache settings and clear them
4. Or just delete the project and re-import it (last resort)

### Step 4: Verify Build Command

While you're in Settings → General → Build & Development Settings:

1. **Build Command**: Should be empty (so Vercel uses vercel.json) OR set to the full command
2. Make sure it's not set to use an old cached version
3. **Output Directory**: Should be `client/dist` or empty (to use vercel.json)

## Expected Behavior

After redeploying without cache, you should see:
```
> eagle-line-client@1.0.0 build
> vite build
```

NOT:
```
> tsc && vite build
```

