# Vercel Deployment Guide
## Deploy Frontend on Vercel + Backend on Railway/Render

This guide will help you deploy your Bus Management System with Vercel for the frontend.

---

## Architecture Overview

- **Frontend**: Vercel (React/Vite app)
- **Backend**: Railway or Render (Node.js/Express API)
- **Database**: Supabase (already set up)

---

## Part 1: Prepare Your Code

### Step 1: Update API Configuration for Production

Edit `client/src/services/api.ts` to handle both development and production:

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token from localStorage if available
const token = localStorage.getItem('auth-storage');
if (token) {
  try {
    const parsed = JSON.parse(token);
    if (parsed.state?.token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${parsed.state.token}`;
    }
  } catch (error) {
    console.error('Error parsing auth token:', error);
  }
}

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth on 401
      localStorage.removeItem('auth-storage');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### Step 2: Verify Vite Configuration

Check `client/vite.config.ts`:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // For Vercel, we don't need the proxy since we'll use environment variables
  server: {
    port: 3000,
    // Proxy only needed for local development
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})
```

---

## Part 2: Deploy Backend First (Railway - Recommended)

### Why Deploy Backend First?
We need the backend URL to configure the frontend environment variable.

### Option A: Railway (Easiest)

1. **Sign up for Railway**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub
   - Free tier: $5/month credit

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Add Backend Service**
   - Click "New" → "Service"
   - Select your GitHub repository
   - **Root Directory**: `server`
   - Railway will auto-detect Node.js

4. **Configure Environment Variables**
   - Click on the service → "Variables" tab
   - Add these variables:
   ```
   DATABASE_URL=your-supabase-connection-string
   JWT_SECRET=generate-a-strong-random-secret-minimum-32-characters
   PORT=5000
   NODE_ENV=production
   ```

   **Generate JWT Secret:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

5. **Configure Build Settings**
   - Go to "Settings" → "Deploy"
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

6. **Deploy**
   - Railway will auto-deploy
   - Wait for deployment (2-5 minutes)
   - Click on the service → "Settings" → "Domains"
   - Railway will generate a domain like: `your-app.railway.app`
   - Copy this URL (e.g., `https://your-backend.railway.app`)

7. **Update CORS in Backend**
   
   Edit `server/src/index.ts`:
   ```typescript
   import cors from 'cors';
   
   // Update CORS configuration
   app.use(cors({
     origin: process.env.FRONTEND_URL || 'http://localhost:3000',
     credentials: true,
   }));
   ```
   
   Add to Railway environment variables:
   ```
   FRONTEND_URL=https://your-vercel-app.vercel.app
   ```
   (You'll update this after deploying frontend)

### Option B: Render

1. **Sign up for Render**
   - Go to [render.com](https://render.com)
   - Sign up with GitHub

2. **Create Web Service**
   - New → Web Service
   - Connect your GitHub repository
   - **Root Directory**: `server`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

3. **Set Environment Variables**
   ```
   DATABASE_URL=your-supabase-connection-string
   JWT_SECRET=your-jwt-secret
   NODE_ENV=production
   ```

4. **Deploy**
   - Click "Create Web Service"
   - Render will assign a URL (e.g., `https://your-backend.onrender.com`)

---

## Part 3: Deploy Frontend on Vercel

### Step 1: Sign up for Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub (recommended)
3. Free tier is perfect for demos

### Step 2: Import Project

1. Click "Add New..." → "Project"
2. Import Git Repository
3. Select your GitHub repository
4. Click "Import"

### Step 3: Configure Project Settings

Vercel will auto-detect Vite, but verify these settings:

**Framework Preset**: Vite
**Root Directory**: `client`
**Build Command**: `npm run build`
**Output Directory**: `dist`
**Install Command**: `npm install`

### Step 4: Set Environment Variables

Before deploying, add environment variables:

1. Click "Environment Variables"
2. Add the following:

```
VITE_API_URL=https://your-backend.railway.app/api
```

Replace `your-backend.railway.app` with your actual backend URL from Part 2.

**Important**: 
- Make sure to add `/api` at the end
- Use `https://` (secure connection)

### Step 5: Deploy

1. Click "Deploy"
2. Wait for build to complete (2-5 minutes)
3. Vercel will provide a URL like: `https://your-app.vercel.app`
4. Copy this URL

### Step 6: Update Backend CORS

Go back to Railway/Render and update the `FRONTEND_URL` environment variable:

```
FRONTEND_URL=https://your-app.vercel.app
```

Redeploy the backend to apply the change.

---

## Part 4: Verify Deployment

### Test Backend

```bash
curl https://your-backend.railway.app/api/health
```

Should return:
```json
{"status":"ok","message":"Eagle Line API is running"}
```

### Test Frontend

1. Visit your Vercel URL: `https://your-app.vercel.app`
2. Open browser DevTools (F12) → Network tab
3. Try logging in
4. Check that API calls go to your backend URL

### Test Login

Use demo credentials:
- Email: `admin@eagleline.com`
- Password: `password123`

---

## Part 5: Update Vercel Configuration (Optional)

Create `vercel.json` in the `client` directory for advanced configuration:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

This ensures React Router works correctly with client-side routing.

---

## Troubleshooting

### Issue: Frontend can't connect to backend

**Solution**: 
1. Check `VITE_API_URL` is set correctly in Vercel
2. Ensure backend URL includes `/api` at the end
3. Verify CORS is configured in backend
4. Check backend is deployed and running

### Issue: 404 errors on page refresh

**Solution**: 
- Add `vercel.json` (see Part 5 above)
- Ensures all routes serve `index.html`

### Issue: Environment variables not working

**Solution**:
- Vite requires `VITE_` prefix for environment variables
- Restart Vercel deployment after adding variables
- Check variables are set for "Production" environment

### Issue: Build fails on Vercel

**Solution**:
- Check Node.js version (should be 18+)
- Verify all dependencies are in `package.json`
- Check build logs in Vercel dashboard
- Ensure root directory is set to `client`

---

## Environment Variables Summary

### Vercel (Frontend)
```
VITE_API_URL=https://your-backend.railway.app/api
```

### Railway/Render (Backend)
```
DATABASE_URL=your-supabase-connection-string
JWT_SECRET=your-generated-secret-32-chars-min
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://your-app.vercel.app
```

---

## Cost Estimate

### Vercel
- **Free Tier**: Unlimited personal projects
- **Hobby Plan**: $0/month (perfect for demos)
- **Features**: 
  - Automatic HTTPS
  - Global CDN
  - Unlimited bandwidth
  - Automatic deployments

### Railway
- **Free Tier**: $5/month credit
- **Hobby Plan**: Pay-as-you-go
- Usually free for small demos

### Render
- **Free Tier**: Available (with limitations)
- **Starter Plan**: $7/month

**Total for Demo: $0/month** 🎉

---

## Production Recommendations

### Before Going Live:

1. **Custom Domain**
   - Add custom domain in Vercel settings
   - Update `FRONTEND_URL` in backend

2. **SSL Certificates**
   - Vercel provides free SSL automatically ✅
   - Railway provides free SSL automatically ✅

3. **Environment Variables**
   - Use Vercel's environment variable management
   - Separate variables for production/staging

4. **Monitoring**
   - Enable Vercel Analytics (free tier available)
   - Set up error tracking (Sentry)

5. **Backup Strategy**
   - Supabase provides automatic backups
   - Configure backup schedule

---

## Quick Deploy Checklist

- [ ] Backend deployed on Railway/Render
- [ ] Backend URL obtained
- [ ] Backend health check working
- [ ] Frontend project imported to Vercel
- [ ] `VITE_API_URL` environment variable set
- [ ] Frontend deployed on Vercel
- [ ] Frontend URL obtained
- [ ] Backend CORS updated with frontend URL
- [ ] Login tested successfully
- [ ] All features working

---

## Support Resources

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Railway Docs**: [docs.railway.app](https://docs.railway.app)
- **Vite Deployment**: [vitejs.dev/guide/static-deploy](https://vitejs.dev/guide/static-deploy.html)

---

**You're ready to deploy with Vercel! 🚀**

Estimated deployment time: **30-45 minutes**

