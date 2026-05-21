# 🚀 Railway Deployment Guide

## Prerequisites
- [Railway Account](https://railway.app) (free)
- Git installed
- GitHub account (to connect repository)

## Deployment Steps

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Prepare for Railway deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/face-attendance.git
git push -u origin main
```

### 2. Deploy on Railway

**Option A: Connect GitHub (Recommended - Auto Deploy)**
1. Go to [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub"
3. Select your `face-attendance` repository
4. Railway will auto-detect the Dockerfile and deploy
5. Your app will be live in ~5 minutes

**Option B: Using Railway CLI**
```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

### 3. Environment Variables
In Railway Dashboard, add these variables:
```
SECRET_KEY=your-secret-key-here
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your@gmail.com
MAIL_PASSWORD=your-app-password
```

### 4. Get Your Public URL
- Railway provides: `https://<project-name>-production.up.railway.app`
- Share this URL with coworkers
- Login: `admin` / `admin123`

---

## Features Now Deployed
✅ Face recognition attendance system  
✅ Employee management  
✅ Attendance tracking  
✅ Excel/PDF reports  
✅ Kiosk mode for tablets  
✅ Email alerts  

## Notes
- **Database**: SQLite (stored in Railway container - data persists between restarts)
- **File Uploads**: Face photos stored in container (consider adding persistent storage if needed)
- **First Deploy**: Takes ~5 min (builds Docker image)
- **Updates**: Just push to GitHub, Railway auto-deploys

## Troubleshooting
- Check Railway logs: Dashboard → "Logs" tab
- If app crashes, increase Memory: Settings → Adjust plan
- For persistent file storage: Add Railway Volumes from Settings

---

**Your app is now shareable! Send coworkers the Railway URL.**
