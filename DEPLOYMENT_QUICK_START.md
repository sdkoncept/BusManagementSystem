# Quick Start: Deploy to Vercel
## Fastest Path to Production

This is a condensed guide for deploying to Vercel quickly.

---

## Prerequisites

- GitHub repository (✅ you have this)
- Supabase database (✅ already configured)
- 30-45 minutes

---

## Step 1: Deploy Backend (Railway) - 15 min

1. Go to [railway.app](https://railway.app) → Sign up with GitHub
2. New Project → Deploy from GitHub → Select your repo
3. New Service → Root Directory: `server`
4. Add Environment Variables:
   ```
   DATABASE_URL=your-supabase-connection-string
   JWT_SECRET=generate-with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   PORT=5000
   NODE_ENV=production
   ```
5. Settings → Build Command: `npm install && npm run build`
6. Settings → Start Command: `npm start`
7. Deploy → Copy the URL (e.g., `https://your-backend.railway.app`)

---

## Step 2: Deploy Frontend (Vercel) - 15 min

1. Go to [vercel.com](https://vercel.com) → Sign up with GitHub
2. Add New Project → Import your GitHub repo
3. Configure:
   - Framework: Vite (auto-detected)
   - Root Directory: `client`
   - Build Command: `npm run build` (default)
   - Output Directory: `dist` (default)
4. Environment Variables → Add:
   ```
   VITE_API_URL=https://your-backend.railway.app/api
   ```
   (Use your Railway URL from Step 1)
5. Deploy → Copy the URL (e.g., `https://your-app.vercel.app`)

---

## Step 3: Update Backend CORS - 2 min

1. Go back to Railway
2. Variables → Add:
   ```
   FRONTEND_URL=https://your-app.vercel.app
   ```
   (Use your Vercel URL from Step 2)
3. Redeploy backend

---

## Step 4: Test - 5 min

1. Visit your Vercel URL
2. Test login: `admin@eagleline.com` / `password123`
3. Verify features work
4. Check browser console for errors

---

## That's It! 🎉

Your app is live and ready for investors!

**Frontend**: `https://your-app.vercel.app`  
**Backend**: `https://your-backend.railway.app`

---

## Common Issues

**Frontend shows blank page?**
- Check `VITE_API_URL` is set correctly
- Ensure backend URL ends with `/api`

**Can't login?**
- Check backend is running (visit `/api/health`)
- Verify CORS is updated with frontend URL

**API errors?**
- Check browser console
- Verify environment variables are set
- Check Railway logs

---

## Need More Details?

See `VERCEL_DEPLOYMENT.md` for comprehensive guide.

