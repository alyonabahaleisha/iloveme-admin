# Production Setup Guide for ilovme.ai

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         ENVIRONMENTS                             │
├─────────────────────────────────┬───────────────────────────────┤
│             UAT                 │           PRODUCTION          │
├─────────────────────────────────┼───────────────────────────────┤
│ Branch: main                    │ Branch: production            │
│ Domain: admin-uat.ilovme.ai     │ Domain: admin.ilovme.ai       │
│ Supabase: UAT project           │ Supabase: PROD project        │
│ Render: UAT backend             │ Render: PROD backend          │
└─────────────────────────────────┴───────────────────────────────┘
```

---

## STEP 1: Create Production Branch

```bash
# From your main branch
git checkout main
git pull origin main
git checkout -b production
git push -u origin production
```

---

## STEP 2: Create PROD Supabase Project

1. Go to https://supabase.com/dashboard
2. Click **"New Project"**
3. Fill in:
   - Organization: Your org
   - Name: `ilovme-prod`
   - Database Password: Generate strong password (save it!)
   - Region: Choose closest to your users
4. Wait for project to be ready (~2 minutes)

### Get PROD Credentials
Go to **Settings → API** and copy:
- `Project URL` → This is your `SUPABASE_URL_PROD`
- `anon public` key → This is your `SUPABASE_ANON_KEY_PROD`
- `service_role` key → This is your `SUPABASE_SERVICE_KEY_PROD`

### Run Schema Migration
1. Go to **SQL Editor** in your PROD Supabase
2. Copy and run contents of: `migrations/prod-complete-schema.sql`

### Create Storage Bucket
1. Go to **Storage** in Supabase Dashboard
2. Click **"New Bucket"**
3. Name: `outfit-images`
4. Check **"Public bucket"**
5. Click **"Create bucket"**

### Migrate Data from UAT (Optional)
1. Go to UAT Supabase → SQL Editor
2. Run: `migrations/export-uat-data.sql`
3. Copy the INSERT statements from results
4. Go to PROD Supabase → SQL Editor
5. Paste and run the INSERT statements

**Note:** Images are stored via URLs. If they reference UAT Supabase storage, you may need to re-upload images or keep UAT storage accessible.

---

## STEP 3: Create PROD Render Backend

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repo: `alyonabahaleisha/iloveme-admin`
4. Configure:

| Setting | Value |
|---------|-------|
| Name | `ilovme-admin-backend-prod` |
| Region | Oregon (US West) |
| Branch | `production` |
| Root Directory | `backend` |
| Runtime | Node |
| Build Command | `npm install` |
| Start Command | `node index.js` |
| Instance Type | Free (or Starter for better performance) |

5. Add Environment Variables:

| Key | Value |
|-----|-------|
| `PORT` | `5000` |
| `NODE_ENV` | `production` |
| `SUPABASE_URL` | Your PROD Supabase URL |
| `SUPABASE_ANON_KEY` | Your PROD anon key |
| `SUPABASE_SERVICE_KEY` | Your PROD service key |
| `REMOVEBG_API_KEY` | Your remove.bg API key |

6. Click **"Create Web Service"**
7. Copy the service URL (e.g., `https://ilovme-admin-backend-prod.onrender.com`)

### Get Deploy Hook URL
1. Go to your new service → **Settings**
2. Scroll to **"Deploy Hook"**
3. Click **"Create Deploy Hook"**
4. Copy the URL → This is your `RENDER_BACKEND_DEPLOY_HOOK_URL_PROD`

---

## STEP 4: Create PROD Vercel Project

### Option A: New Project (Recommended)
1. Go to https://vercel.com/dashboard
2. Click **"Add New Project"**
3. Import: `alyonabahaleisha/iloveme-admin`
4. Configure:

| Setting | Value |
|---------|-------|
| Project Name | `ilovme-admin-prod` |
| Framework | Vite |
| Root Directory | `frontend` |
| Build Command | `npm run build` |
| Output Directory | `dist` |

5. Add Environment Variables:

| Key | Value |
|-----|-------|
| `VITE_SUPABASE_URL` | Your PROD Supabase URL |
| `VITE_SUPABASE_ANON_KEY` | Your PROD anon key |
| `VITE_API_BASE_URL` | Your PROD Render URL |

6. Go to **Settings → Git**
7. Change **Production Branch** to `production`

### Get Vercel Project ID
1. Go to **Settings → General**
2. Copy **Project ID** → This is your `VERCEL_PROJECT_ID_PROD`

---

## STEP 5: Connect Domain ilovme.ai

### In Namecheap (DNS Settings)
1. Log in to Namecheap
2. Go to **Domain List** → your domain → **Manage**
3. Click **Advanced DNS**
4. Add these records:

| Type | Host | Value | TTL |
|------|------|-------|-----|
| A | admin | 76.76.21.21 | Automatic |
| CNAME | www | cname.vercel-dns.com | Automatic |

### In Vercel
1. Go to your PROD project → **Settings → Domains**
2. Add: `admin.ilovme.ai`
3. Vercel will verify the DNS

### For UAT (Optional)
Add subdomain `admin-uat.ilovme.ai` pointing to your UAT Vercel project.

---

## STEP 6: Configure GitHub Secrets

Go to your GitHub repo → **Settings → Secrets and variables → Actions**

### Existing Secrets (UAT)
Keep these as-is for UAT:
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_API_BASE_URL`
- `RENDER_BACKEND_DEPLOY_HOOK_URL`

### Add New Secrets (PROD)
Add these for production:

| Secret Name | Value |
|-------------|-------|
| `VERCEL_PROJECT_ID_PROD` | Your PROD Vercel project ID |
| `VITE_SUPABASE_URL_PROD` | Your PROD Supabase URL |
| `VITE_SUPABASE_ANON_KEY_PROD` | Your PROD Supabase anon key |
| `VITE_API_BASE_URL_PROD` | Your PROD Render URL |
| `RENDER_BACKEND_DEPLOY_HOOK_URL_PROD` | Your PROD Render deploy hook |

---

## STEP 7: Deployment Workflow

### Development Flow
```
feature-branch → main (UAT) → production (PROD)
```

### Deploy to UAT
```bash
git checkout main
git merge feature-branch
git push origin main
# Automatically deploys to UAT
```

### Deploy to PRODUCTION
```bash
git checkout production
git merge main
git push origin production
# Automatically deploys to PROD
```

### Quick Commands
```bash
# Deploy current main to production
git checkout production && git merge main && git push origin production && git checkout main
```

---

## Environment Summary

### UAT Environment
| Service | URL |
|---------|-----|
| Frontend | https://admin-uat.ilovme.ai |
| Backend | https://ilovme-admin-backend.onrender.com |
| Database | UAT Supabase project |

### PRODUCTION Environment
| Service | URL |
|---------|-----|
| Frontend | https://admin.ilovme.ai |
| Backend | https://ilovme-admin-backend-prod.onrender.com |
| Database | PROD Supabase project |

---

## Checklist

- [ ] Create `production` branch
- [ ] Create PROD Supabase project
- [ ] Run schema migration on PROD Supabase
- [ ] Create `outfit-images` storage bucket on PROD
- [ ] Migrate data from UAT (if needed)
- [ ] Create PROD Render backend service
- [ ] Get PROD Render deploy hook URL
- [ ] Create PROD Vercel project
- [ ] Connect `admin.ilovme.ai` domain
- [ ] Add all PROD secrets to GitHub
- [ ] Test deployment to production branch
- [ ] Verify everything works on admin.ilovme.ai

---

## Troubleshooting

### Images not loading on PROD
- Check if images are stored on UAT Supabase storage
- Either migrate images to PROD storage or keep UAT storage public

### Backend returning 500 errors
- Check Render logs for your PROD service
- Verify environment variables are set correctly
- Ensure PROD Supabase credentials are correct

### Domain not working
- DNS propagation can take up to 48 hours
- Verify DNS records in Namecheap
- Check Vercel domain settings for errors
