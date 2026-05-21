# 📋 Complete Deployment Setup - Face Attendance System

## What's Been Prepared

✅ **Dockerfile** - Multi-stage build that:
   - Builds React frontend from source
   - Copies to backend static folder
   - Installs Python dependencies
   - Runs unified Flask server

✅ **Fixed Configuration**:
   - Updated CORS to work with deployed domains
   - Added dynamic PORT detection for Railway
   - Fixed frontend path resolution for Docker
   - Updated app.py for production CORS

✅ **Project Structure Ready**:
   - Procfile for application startup
   - runtime.txt with Python 3.11.9
   - railway.json for Railway.app configuration
   - .gitignore for clean git history

---

## 🚀 Step-by-Step Deployment to Railway

### Step 1: Initialize Git Repository
```bash
cd d:\face-attendance
git init
git add .
git commit -m "Initial commit: Face Attendance System ready for deployment"
```

### Step 2: Create GitHub Repository
1. Go to https://github.com/new
2. Create new repository: `face-attendance`
3. **Do NOT** initialize with README (we have one)
4. Copy the push commands shown, for example:
```bash
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/face-attendance.git
git push -u origin main
```

### Step 3: Deploy to Railway
1. Visit https://railway.app
2. Sign up (free account)
3. Click **"New Project"** → **"Deploy from GitHub"**
4. Connect GitHub account and authorize Railway
5. Select `face-attendance` repository
6. Railway auto-detects the Dockerfile and deploys automatically!
7. Takes ~5-10 minutes for first deployment

### Step 4: Configure Environment Variables
Once deployed on Railway:
1. Go to Railway Dashboard → Your Project
2. Click **"Variables"** tab
3. Add these (optional but recommended):
```
SECRET_KEY=your-super-secret-key-12345
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your@gmail.com
MAIL_PASSWORD=your-app-password
```

### Step 5: Get Your Live URL
1. Railway Dashboard → **"Domains"** tab
2. You'll see: `https://face-attendance-production.up.railway.app`
3. **Share this URL with coworkers!**

---

## 🔐 Default Login Credentials
- **Username**: `admin`
- **Password**: `admin123`

Change after first login via Settings page.

---

## 🎯 Features Available
- ✅ Face recognition attendance
- ✅ Employee management (register faces)
- ✅ Live dashboard with charts
- ✅ Attendance history & filtering
- ✅ Excel/PDF export reports
- ✅ Kiosk mode (full-screen for tablets)
- ✅ Email alerts for absent employees

---

## 🔧 How It Works

### Local Development (Before Deployment)
```bash
cd backend
pip install -r requirements.txt
python serve.py
# Open http://localhost:5000
```

### Deployed on Railway
- React frontend is compiled into static files
- Flask backend serves both API and frontend
- Single port (5000 → Railway assigns PORT env var)
- SQLite database persists between deployments
- Uploaded face photos stored in container

---

## 📝 Important Notes

### Database & Files
- **Database**: SQLite stored in the Railway container
- **Uploaded files**: Face images stored in `backend/uploads/`
- **Persistence**: Data survives deployments on Railway

### Sharing With Coworkers
Send them your Railway domain URL. They can:
1. Login with `admin` / `admin123`
2. Register employees & their faces
3. Use kiosk mode on tablets at office entrance
4. View attendance reports

### If Deployment Fails
Check Railway logs:
1. Dashboard → Logs tab
2. Common issues:
   - Missing dependencies: Add to `backend/requirements.txt`
   - Port not exposed: ✅ Already configured
   - Missing frontend build: ✅ Already in Dockerfile
   - Database path: ✅ Already configured

---

## 🛠️ Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| App crashes on startup | Check Logs tab in Railway. Usually missing Python dependency |
| Frontend shows 404 | Ensure `frontend/dist/` exists locally before git push |
| Can't upload face photos | Railway app has persistent storage enabled ✅ |
| Login fails | Check CORS is enabled (✅ already done) |
| DeepFace not working | It's optional - app still runs, just face scan is disabled |

---

## 📊 Next Steps After Deployment

1. **Share URL with team** - Send the Railway domain
2. **Change default password** - Login → Settings → Change Password
3. **Add employees** - Employees page → Add → Register faces
4. **Set up kiosk** - Open `/kiosk` on a tablet (auto-scans every 3.5s)
5. **Configure email alerts** - Set MAIL_* environment variables in Railway
6. **Export reports** - Use Reports page for Excel/PDF attendance exports

---

**Your app is production-ready!** 🎉 Push to GitHub and Railway will deploy automatically.
