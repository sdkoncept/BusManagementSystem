# Quick Deployment Guide
## Deploy in 30 Minutes with Railway

This guide will help you deploy the Bus Management System quickly for investor review.

---

## Prerequisites

✅ GitHub repository (already set up)
✅ Supabase database (already configured)
✅ Node.js installed locally (for testing)

---

## Step-by-Step: Railway Deployment

### Part 1: Deploy Backend (15 minutes)

1. **Sign up for Railway**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub (free tier available)

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Add Backend Service**
   - Click "New" → "Service"
   - Select "GitHub Repo" → Choose your repo
   - In "Root Directory", select: `server`

4. **Configure Environment Variables**
   - Click on the service → "Variables" tab
   - Add these variables:
   ```
   DATABASE_URL=your-supabase-connection-string-here
   JWT_SECRET=generate-strong-secret-32-chars-min
   PORT=5000
   NODE_ENV=production
   ```

5. **Configure Build Settings**
   - Go to "Settings" → "Build"
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

6. **Deploy**
   - Railway will automatically detect and deploy
   - Wait for deployment to complete
   - Copy the generated URL (e.g., `https://your-app.railway.app`)

### Part 2: Deploy Frontend (15 minutes)

1. **Add Frontend Service**
   - In the same Railway project, click "New" → "Service"
   - Select "GitHub Repo" → Same repository
   - Root Directory: `client`

2. **Configure Environment Variables**
   - Add variable:
   ```
   VITE_API_URL=https://your-backend-url.railway.app/api
   ```
   (Replace with your actual backend URL from Part 1)

3. **Configure Build Settings**
   - Build Command: `npm install && npm run build`
   - Start Command: `npx serve -s dist -l 3000`
   
   OR install serve in package.json:
   ```json
   {
     "scripts": {
       "preview": "vite preview",
       "serve": "serve -s dist -l 3000"
     },
     "dependencies": {
       "serve": "^14.2.0"
     }
   }
   ```
   Then use: `npm run serve`

4. **Deploy**
   - Railway will deploy automatically
   - Get your frontend URL

### Part 3: Update Frontend API Configuration

1. **Update API base URL**
   Edit `client/src/services/api.ts`:
   ```typescript
   const api = axios.create({
     baseURL: import.meta.env.VITE_API_URL || '/api',
     headers: {
       'Content-Type': 'application/json',
     },
   });
   ```

2. **Redeploy frontend** (Railway will auto-deploy on push)

---

## Alternative: Vercel (Frontend) + Railway (Backend)

### Frontend on Vercel (Easier for React)

1. **Go to vercel.com**
   - Sign up with GitHub
   - "New Project" → Import your repository

2. **Configure Project**
   - Framework Preset: Vite
   - Root Directory: `client`
   - Build Command: `npm run build`
   - Output Directory: `dist`

3. **Environment Variables**
   ```
   VITE_API_URL=https://your-backend.railway.app/api
   ```

4. **Deploy**
   - Click "Deploy"
   - Get your Vercel URL

---

## Quick Deployment Script

Create `deploy.sh` in root directory:

```bash
#!/bin/bash

echo "🚀 Deploying Bus Management System..."

# Build backend
echo "📦 Building backend..."
cd server
npm install
npm run build

# Build frontend
echo "📦 Building frontend..."
cd ../client
npm install
npm run build

echo "✅ Build complete!"
echo "📋 Next steps:"
echo "1. Push to GitHub"
echo "2. Deploy on Railway/Vercel"
echo "3. Set environment variables"
echo "4. Test deployment"
```

---

## Environment Variables Checklist

### Backend (Railway)
- [ ] `DATABASE_URL` - Supabase connection string
- [ ] `JWT_SECRET` - Strong random secret (32+ chars)
- [ ] `PORT` - 5000 (or Railway will auto-assign)
- [ ] `NODE_ENV` - production

### Frontend (Railway/Vercel)
- [ ] `VITE_API_URL` - Your backend URL + `/api`

---

## Testing Deployment

1. **Test Backend**
   ```bash
   curl https://your-backend.railway.app/api/health
   ```
   Should return: `{"status":"ok","message":"Eagle Line API is running"}`

2. **Test Frontend**
   - Visit your frontend URL
   - Try logging in with demo accounts
   - Test booking flow
   - Verify all pages load

3. **Test API Connection**
   - Open browser console
   - Try logging in
   - Check Network tab for API calls

---

## Troubleshooting

### Backend Issues

**Problem**: Database connection error
- **Solution**: Check `DATABASE_URL` is correct Supabase connection string
- Ensure it starts with `postgresql://`

**Problem**: Build fails
- **Solution**: Check build logs in Railway
- Ensure all dependencies are in package.json

**Problem**: Port already in use
- **Solution**: Remove `PORT` variable, let Railway assign

### Frontend Issues

**Problem**: API calls failing
- **Solution**: Check `VITE_API_URL` matches backend URL
- Ensure CORS is enabled in backend

**Problem**: Build fails
- **Solution**: Check Node version (should be 18+)
- Clear node_modules and reinstall

**Problem**: Blank page
- **Solution**: Check browser console for errors
- Verify build output directory is correct

---

## Post-Deployment Checklist

- [ ] Backend health check works
- [ ] Frontend loads correctly
- [ ] Login works with demo accounts
- [ ] Can create bookings
- [ ] Admin dashboard accessible
- [ ] Mobile view works
- [ ] All pages load without errors

---

## Security Recommendations (Before Production)

1. **Change Default Passwords**
   - Update all demo account passwords
   - Use strong, unique passwords

2. **Update JWT Secret**
   - Generate new secret: 
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

3. **Enable HTTPS**
   - Railway/Vercel provide HTTPS by default ✅

4. **Database Security**
   - Use connection pooling (Supabase provides this)
   - Enable SSL connections
   - Limit database access

5. **CORS Configuration**
   - Update CORS to only allow your frontend domain

---

## Cost Estimate

### Railway (Free Tier)
- $5/month free credit
- Perfect for demo/beta
- Pay-as-you-go after

### Vercel (Free Tier)
- Free for personal projects
- Perfect for frontend hosting
- Generous free tier

### Supabase (Free Tier)
- Free tier available
- 500MB database
- Perfect for demo

**Total for Demo: $0/month** 🎉

---

## Support

If you need help:
1. Check Railway/Vercel documentation
2. Review error logs in dashboard
3. Test locally first
4. Check environment variables

---

**You're ready to deploy! 🚀**

Estimated time: 30-60 minutes for complete deployment.

