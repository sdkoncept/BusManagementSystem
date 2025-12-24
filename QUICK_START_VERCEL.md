# Quick Start: Deploy to Vercel + Supabase
## 30-Minute Deployment Guide

---

## What You're Deploying

- ✅ **Frontend** → Vercel (React/Vite app)
- ✅ **Backend** → Vercel Serverless Functions (Express API)
- ✅ **Database** → Supabase PostgreSQL

**Everything runs on Vercel, Supabase is only for the database!**

---

## Step 1: Get Supabase Connection String (2 min)

1. Go to Supabase dashboard → Settings → Database
2. Copy connection string (URI format)
3. It looks like: `postgresql://postgres.xxxxx:[PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres`

---

## Step 2: Deploy to Vercel (20 min)

### 2.1 Sign up and Import

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click "Add New Project"
4. Import your GitHub repository

### 2.2 Configure Project

**Framework Preset**: Other
**Root Directory**: (leave empty)

**Build Settings** (you may need to click "Override"):
- **Build Command**: `npm run vercel-build`
- **Output Directory**: `client/dist`

### 2.3 Add Environment Variables

Click "Environment Variables" and add:

```
DATABASE_URL=your-supabase-connection-string-here
JWT_SECRET=generate-with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
NODE_ENV=production
VITE_API_URL=/api
```

**Generate JWT Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2.4 Deploy

1. Click "Deploy"
2. Wait 5-10 minutes for first build
3. Copy your URL (e.g., `https://your-app.vercel.app`)

### 2.5 Update Frontend URL (After First Deploy)

1. Go to Settings → Environment Variables
2. Add: `FRONTEND_URL=https://your-app.vercel.app`
3. Redeploy (or wait for auto-redeploy)

---

## Step 3: Test (5 min)

### Test Backend
Visit: `https://your-app.vercel.app/api/health`

Should see: `{"status":"ok","message":"Eagle Line API is running"}`

### Test Frontend
1. Visit: `https://your-app.vercel.app`
2. Login: `admin@eagleline.com` / `password123`
3. Test features

---

## Environment Variables Checklist

```
✅ DATABASE_URL (from Supabase)
✅ JWT_SECRET (generate new one)
✅ NODE_ENV=production
✅ VITE_API_URL=/api
✅ FRONTEND_URL (your Vercel URL - add after deploy)
```

---

## That's It! 🎉

Your app is live on Vercel with Supabase database!

**URL**: `https://your-app.vercel.app`

---

## Troubleshooting

**Build fails?**
- Check build logs in Vercel
- Ensure all dependencies are in package.json

**API not working?**
- Check `/api/health` endpoint
- Verify `DATABASE_URL` is correct
- Check Vercel function logs

**Frontend blank?**
- Check browser console
- Verify `VITE_API_URL=/api` is set
- Check build output in Vercel

---

## Need More Details?

See `VERCEL_SUPABASE_ONLY.md` for comprehensive guide.

---

**Cost: $0/month for demo!** 🎉

