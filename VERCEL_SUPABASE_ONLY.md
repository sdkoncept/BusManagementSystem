# Deploy to Vercel + Supabase
## Complete Guide: Frontend & Backend on Vercel, Database on Supabase

This guide will help you deploy your entire application to Vercel using Supabase only for the database.

---

## Architecture

- **Frontend**: Vercel (React/Vite from `client/`)
- **Backend**: Vercel Serverless Functions (Express API from `server/`)
- **Database**: Supabase PostgreSQL (already configured)

**Everything runs on Vercel, Supabase is only for data storage!**

---

## Part 1: Prepare Your Code

### ✅ Already Done

The code has been prepared with:
- ✅ `api/index.ts` - Serverless function entry point
- ✅ `vercel.json` - Vercel configuration
- ✅ `server/src/index.ts` - Updated to work as serverless function
- ✅ CORS configured for production
- ✅ API configuration uses environment variables

---

## Part 2: Deploy to Vercel

### Step 1: Push Code to GitHub

Make sure all changes are committed and pushed:

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### Step 2: Sign up for Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub (recommended)
3. Connect your GitHub account

### Step 3: Import Project

1. Click "Add New..." → "Project"
2. Import your GitHub repository
3. Select your repository
4. Click "Import"

### Step 4: Configure Project Settings

Vercel will try to auto-detect, but you need to configure manually:

**Framework Preset**: Other (or Vite if available)

**Root Directory**: Leave empty (root of repo)

**Build and Output Settings**:
- **Build Command**: `cd client && npm install && npm run build`
- **Output Directory**: `client/dist`
- **Install Command**: Leave default (`npm install`)

### Step 5: Configure Environment Variables

**Before deploying**, add these environment variables in Vercel:

Click "Environment Variables" and add:

#### For Backend (API Functions):

```
DATABASE_URL=your-supabase-connection-string
JWT_SECRET=generate-a-strong-random-secret-minimum-32-characters
NODE_ENV=production
FRONTEND_URL=https://your-app.vercel.app
```

**Generate JWT Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### For Frontend:

```
VITE_API_URL=/api
```

**Important Notes:**
- Use your Supabase connection string (from Supabase dashboard)
- `VITE_API_URL=/api` means API calls go to the same domain (Vercel handles routing)
- `FRONTEND_URL` will be your Vercel app URL (update after first deployment)

### Step 6: Install Vercel CLI (Optional but Recommended)

For local testing:

```bash
npm i -g vercel
vercel login
```

### Step 7: Deploy

1. Click "Deploy" in Vercel dashboard
2. Wait for build to complete (5-10 minutes first time)
3. Vercel will provide a URL like: `https://your-app.vercel.app`

### Step 8: Update Frontend URL

After deployment, update the `FRONTEND_URL` environment variable:

1. Go to Vercel dashboard → Your project → Settings → Environment Variables
2. Update `FRONTEND_URL` with your actual Vercel URL:
   ```
   FRONTEND_URL=https://your-app.vercel.app
   ```
3. Redeploy (or it will auto-redeploy on next commit)

---

## Part 3: Configure Supabase

### Step 1: Get Connection String

1. Go to your Supabase dashboard
2. Settings → Database
3. Connection string section
4. Copy the connection string (URI format)
5. It should look like:
   ```
   postgresql://postgres.xxxxx:[PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres
   ```

### Step 2: Add to Vercel Environment Variables

Add the connection string as `DATABASE_URL` in Vercel (already done in Step 5 above).

---

## Part 4: Verify Deployment

### Test Backend API

Visit: `https://your-app.vercel.app/api/health`

Should return:
```json
{"status":"ok","message":"Eagle Line API is running"}
```

### Test Frontend

1. Visit: `https://your-app.vercel.app`
2. Try logging in with demo credentials:
   - Email: `admin@eagleline.com`
   - Password: `password123`
3. Check browser console for any errors
4. Test booking flow

---

## Part 5: Prisma Setup on Vercel

### Option 1: Generate Prisma Client During Build

Add to `vercel.json` build command or create a build script:

```json
{
  "buildCommand": "cd server && npm run prisma:generate && cd ../client && npm install && npm run build"
}
```

### Option 2: Use Vercel Build Step

Add to your root `package.json`:

```json
{
  "scripts": {
    "build": "cd server && npm run prisma:generate && npm run build && cd ../client && npm install && npm run build"
  }
}
```

Actually, Vercel will handle this automatically if Prisma is in dependencies.

---

## Environment Variables Summary

### Required Variables in Vercel:

```
# Database
DATABASE_URL=postgresql://postgres.xxxxx:[PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres

# Security
JWT_SECRET=your-generated-secret-32-characters-minimum

# Configuration
NODE_ENV=production
FRONTEND_URL=https://your-app.vercel.app

# Frontend API URL (relative path works because same domain)
VITE_API_URL=/api
```

---

## Project Structure for Vercel

```
your-project/
├── api/
│   └── index.ts          # Serverless function entry (exports Express app)
├── server/
│   ├── src/
│   │   └── index.ts      # Express app (exported, not started if VERCEL=1)
│   └── package.json
├── client/
│   ├── dist/             # Build output (created during build)
│   └── package.json
├── vercel.json           # Vercel configuration
└── package.json
```

---

## Troubleshooting

### Issue: Build fails - Prisma client not generated

**Solution**: 
1. Ensure Prisma is in dependencies
2. Add build step: `cd server && npm run prisma:generate`
3. Or add to root package.json build script

### Issue: API routes return 404

**Solution**:
1. Check `vercel.json` routes configuration
2. Ensure `api/index.ts` exists and exports the app
3. Verify `/api/*` routes are correct

### Issue: Database connection errors

**Solution**:
1. Verify `DATABASE_URL` is set correctly
2. Check Supabase connection string format
3. Ensure connection string includes password
4. Test connection string locally first

### Issue: CORS errors

**Solution**:
1. Update `FRONTEND_URL` environment variable
2. Check CORS configuration in `server/src/index.ts`
3. Ensure frontend URL matches your Vercel domain

### Issue: Environment variables not working

**Solution**:
1. Ensure variables are set for "Production" environment
2. Restart deployment after adding variables
3. Frontend variables need `VITE_` prefix
4. Check variable names match exactly (case-sensitive)

---

## Cost Estimate

### Vercel
- **Hobby Plan**: $0/month (free tier)
  - Unlimited personal projects
  - 100GB bandwidth
  - Serverless functions included
  - Perfect for demos

### Supabase
- **Free Tier**: Available
  - 500MB database
  - Perfect for demo/testing

**Total: $0/month** 🎉

---

## Production Recommendations

### Before Going Live:

1. **Custom Domain**
   - Add custom domain in Vercel settings
   - Update `FRONTEND_URL` environment variable

2. **Environment Variables**
   - Use Vercel's environment variable management
   - Separate variables for production/preview

3. **Database**
   - Consider upgrading Supabase plan for production
   - Set up automatic backups
   - Enable connection pooling

4. **Monitoring**
   - Enable Vercel Analytics (free tier available)
   - Set up error tracking
   - Monitor function execution times

5. **Security**
   - Change all demo passwords
   - Use strong JWT secrets
   - Enable Supabase RLS (Row Level Security) if needed

---

## Quick Deploy Checklist

- [ ] Code pushed to GitHub
- [ ] Vercel account created
- [ ] Project imported to Vercel
- [ ] Build settings configured
- [ ] Environment variables added
- [ ] DATABASE_URL set (Supabase)
- [ ] JWT_SECRET generated and set
- [ ] Frontend deployed successfully
- [ ] Backend API accessible at `/api/health`
- [ ] Login works
- [ ] All features tested

---

## Support

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Prisma with Vercel**: [pris.ly/d/deployment-vercel](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)

---

**You're ready to deploy! Everything runs on Vercel with Supabase for the database! 🚀**

