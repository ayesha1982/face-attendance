# 🎯 FaceAttend — Face Recognition Attendance System

**Corporate Dark Design · React + Flask + DeepFace · 20 Employees**

---

## 🚀 Quick Start

### Option A — One command (after setup)
```bash
python backend/serve.py
```
Open: http://localhost:5000  
Login: `admin` / `admin123`

### Option B — Deploy to Production (Railway)
See **DEPLOYMENT_GUIDE.md** for complete instructions, or run:
```bash
./deploy.bat  # Windows
bash deploy.sh  # Linux/Mac (if created)
```
Then connect GitHub repository to Railway.app for auto-deployment.

---

## 📋 Setup Instructions

### 1. Backend (Python)
```bash
cd backend
pip install -r requirements.txt
```

> ⚠️ DeepFace installs TensorFlow (~500MB). For testing without face recognition, the app still runs — just face scan won't work until DeepFace is installed.

### 2. Frontend (React) — Pre-built, no action needed
The `frontend/dist/` folder is already built and served by Flask.

To rebuild frontend:
```bash
cd frontend
npm install
npm run build
```

### 3. Run
```bash
cd backend
python serve.py
```

---

## 🖥️ Pages

| URL | Description |
|-----|-------------|
| `/` | Redirect to dashboard |
| `/login` | Admin login |
| `/dashboard` | Live stats, charts, absent list |
| `/employees` | Manage 20 employees, register faces |
| `/attendance` | Filter & view attendance history |
| `/reports` | Export Excel/PDF reports |
| `/kiosk` | **Full-screen kiosk mode** for door tablet |

---

## ⚙️ Configuration

Copy `.env.example` to `.env` and update:

```env
SECRET_KEY=your-secret-key
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your@gmail.com
MAIL_PASSWORD=your-app-password
```

For Gmail, use an **App Password** (not your regular password):  
https://myaccount.google.com/apppasswords

---

## 📁 Folder Structure

```
face-attendance/
├── backend/
│   ├── app.py                 # Flask app factory
│   ├── serve.py               # Unified server (API + frontend)
│   ├── extensions.py          # db, mail instances
│   ├── requirements.txt
│   ├── .env.example
│   ├── models/
│   │   ├── user.py            # Admin user model
│   │   └── employee.py        # Employee + Attendance models
│   ├── routes/
│   │   ├── auth.py            # Login/logout
│   │   ├── employees.py       # CRUD + face registration
│   │   ├── attendance.py      # Scan + history + alerts
│   │   └── reports.py         # Excel + PDF export
│   ├── utils/
│   │   ├── face_utils.py      # DeepFace encode + recognize
│   │   └── email_utils.py     # Absence email alerts
│   └── uploads/
│       ├── registered/        # Employee face photos
│       └── temp/              # Temporary scan frames
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   ├── pages/
    │   │   ├── LoginPage.jsx
    │   │   ├── DashboardPage.jsx
    │   │   ├── KioskPage.jsx
    │   │   ├── EmployeesPage.jsx
    │   │   ├── AttendancePage.jsx
    │   │   └── ReportsPage.jsx
    │   ├── components/
    │   │   ├── Layout/Layout.jsx
    │   │   ├── Admin/EmployeeModal.jsx
    │   │   └── Attendance/CameraView.jsx
    │   ├── hooks/
    │   │   ├── useAuth.jsx
    │   │   └── useToast.js
    │   └── utils/api.js
    └── dist/                  # Pre-built production bundle
```

---

## 🔐 Default Credentials
- **Admin**: `admin` / `admin123`  
- Change via Settings after first login

---

## 📦 Key Dependencies

### Backend
| Package | Purpose |
|---------|---------|
| Flask | Web framework |
| Flask-SQLAlchemy | SQLite ORM |
| Flask-Mail | Email alerts |
| deepface | Face recognition (Facenet512) |
| openpyxl | Excel export |
| reportlab | PDF export |

### Frontend
| Package | Purpose |
|---------|---------|
| React 18 | UI framework |
| React Router | SPA routing |
| Recharts | Charts & graphs |
| Axios | API calls |
| Lucide React | Icons |
| date-fns | Date formatting |

---

## 💡 Tips
- **Kiosk Mode**: Open `/kiosk` on a tablet at the office entrance — it auto-scans every 3.5 seconds
- **Face Registration**: Go to Employees → Edit → Use Camera or Upload Photo
- **Absent Alerts**: Dashboard → "Send Absence Alerts" button sends emails to all absent employees
- **Export**: Reports page → Export Excel or PDF with date range filters
