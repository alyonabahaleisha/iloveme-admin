# Deployment Guide - iLovMe Admin Panel

This guide walks you through deploying the iLovMe Admin Panel to production.

## Architecture

The admin panel consists of 3 services:

1. **Frontend** (React + Vite) → Deploy to **Vercel**
2. **Backend** (Node.js + Express) → Deploy to **Render**
3. **Background Removal Service** (Python + Flask) → Deploy to **Render**

All services share the same **Supabase** database.

---

## Prerequisites

- GitHub account
- Vercel account (free tier)
- Render account (free tier)
- Supabase project (already configured)

---

## Step 1: Deploy Frontend to Vercel

### 1.1 Connect to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New Project"**
3. Import your GitHub repository: `alyonabahaleisha/ilovme-admin`
4. Select the repository and click **"Import"**

### 1.2 Configure Project Settings

- **Framework Preset**: Vite
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### 1.3 Add Environment Variables

In Vercel project settings, add these environment variables:

```
VITE_SUPABASE_URL=https://rtzpmrbjelywvpxryjix.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0enBtcmJqZWx5d3ZweHJ5aml4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2OTc5NjEsImV4cCI6MjA3NjI3Mzk2MX0.p8bE9bkZ_VC2IM4s_lC-ZQexJA4c5Y-HYZ2p3D05-6M
VITE_API_BASE_URL=https://ilovme-admin-backend.onrender.com
VITE_BG_REMOVAL_URL=https://ilovme-admin-bg-removal.onrender.com
```

### 1.4 Deploy

Click **"Deploy"** and wait for the build to complete.

Your frontend will be live at: `https://your-project.vercel.app`

---

## Step 2: Deploy Backend to Render

### 2.1 Create Backend Service

1. Go to [render.com](https://render.com) and sign in
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository: `alyonabahaleisha/ilovme-admin`
4. Click **"Connect"**

### 2.2 Configure Service

- **Name**: `ilovme-admin-backend`
- **Region**: Oregon (US West)
- **Branch**: `main`
- **Root Directory**: `backend`
- **Runtime**: Node
- **Build Command**: `npm install`
- **Start Command**: `node server.js`
- **Plan**: Free

### 2.3 Add Environment Variables

```
PORT=5000
NODE_ENV=production
BG_REMOVAL_SERVICE_URL=https://ilovme-admin-bg-removal.onrender.com
SUPABASE_URL=https://rtzpmrbjelywvpxryjix.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0enBtcmJqZWx5d3ZweHJ5aml4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2OTc5NjEsImV4cCI6MjA3NjI3Mzk2MX0.p8bE9bkZ_VC2IM4s_lC-ZQexJA4c5Y-HYZ2p3D05-6M
```

### 2.4 Deploy

Click **"Create Web Service"** and wait for deployment.

Your backend will be live at: `https://ilovme-admin-backend.onrender.com`

---

## Step 3: Deploy Background Removal Service to Render

### 3.1 Create BG Removal Service

1. In Render dashboard, click **"New +"** → **"Web Service"**
2. Connect the same repository
3. Click **"Connect"**

### 3.2 Configure Service

- **Name**: `ilovme-admin-bg-removal`
- **Region**: Oregon (US West)
- **Branch**: `main`
- **Root Directory**: `backend`
- **Runtime**: Python
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `python bg_removal_service.py`
- **Plan**: Free

### 3.3 Add Environment Variables

```
PORT=5001
FLASK_ENV=production
```

### 3.4 Deploy

Click **"Create Web Service"** and wait for deployment.

Your BG removal service will be live at: `https://ilovme-admin-bg-removal.onrender.com`

---

## Step 4: Configure GitHub Actions (Optional - for Auto-Deploy)

### 4.1 Get Deployment Tokens

**From Vercel:**
1. Go to Settings → Tokens → Create Token
2. Save as `VERCEL_TOKEN`
3. Get your Org ID and Project ID from project settings

**From Render:**
1. Go to each service → Settings → Deploy Hook
2. Copy the deploy hook URLs

### 4.2 Add GitHub Secrets

In your GitHub repository (`alyonabahaleisha/ilovme-admin`):
1. Go to Settings → Secrets and variables → Actions
2. Add these secrets:

```
VERCEL_TOKEN=<your-vercel-token>
VERCEL_ORG_ID=<your-org-id>
VERCEL_PROJECT_ID=<your-project-id>
RENDER_BACKEND_DEPLOY_HOOK_URL=<backend-hook-url>
RENDER_BG_REMOVAL_DEPLOY_HOOK_URL=<bg-removal-hook-url>
VITE_SUPABASE_URL=https://rtzpmrbjelywvpxryjix.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
VITE_API_BASE_URL=https://ilovme-admin-backend.onrender.com
VITE_BG_REMOVAL_URL=https://ilovme-admin-bg-removal.onrender.com
```

Now every push to `main` will automatically deploy all services!

---

## Step 5: Update Frontend URLs

After all services are deployed, update the frontend environment variables in Vercel with the actual production URLs.

---

## Production URLs

After deployment, you'll have:

- **Admin Frontend**: `https://ilovme-admin.vercel.app`
- **Backend API**: `https://ilovme-admin-backend.onrender.com`
- **BG Removal**: `https://ilovme-admin-bg-removal.onrender.com`

---

## Testing

1. Visit your frontend URL
2. Try creating a new outfit
3. Upload product images (tests BG removal service)
4. Compose and save outfit (tests backend API)
5. Click "Publish" (tests database integration)
6. Check FitOnMe.ai SaaS to see published outfit

---

## Troubleshooting

### Frontend build fails
- Check environment variables are set in Vercel
- Verify build command is `npm run build` in `frontend` directory

### Backend won't start
- Check Render logs for errors
- Verify Node version compatibility
- Ensure all environment variables are set

### BG Removal fails
- Check Python service logs in Render
- Verify `requirements.txt` is in `backend` directory
- rembg package may take time to install (3-5 minutes)

### CORS errors
- Ensure backend has CORS configured for your frontend URL
- Check that API URLs are correct in frontend .env

---

## Free Tier Limitations

**Render Free Tier:**
- Services spin down after 15 minutes of inactivity
- First request after spin-down takes ~30-60 seconds (cold start)
- 750 hours/month per service

**Vercel Free Tier:**
- Unlimited deployments
- 100GB bandwidth/month
- Serverless functions with 10-second timeout

---

## Next Steps

- Set up custom domain for frontend
- Configure authentication for admin access
- Set up monitoring and error tracking
- Consider upgrading to paid tier for production use
