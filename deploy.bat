@echo off
REM Quick deployment setup script for Face Attendance System
REM Usage: Run this in the project root directory

echo.
echo ========================================
echo Face Attendance - Railway Deployment
echo ========================================
echo.

REM Check if git is installed
git --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Git is not installed. Please install Git from https://git-scm.com
    pause
    exit /b 1
)

echo [1/4] Initializing Git repository...
git init
if errorlevel 1 (
    echo ERROR: Git initialization failed
    pause
    exit /b 1
)

echo [2/4] Adding all files...
git add .
if errorlevel 1 (
    echo ERROR: Could not add files
    pause
    exit /b 1
)

echo [3/4] Creating initial commit...
git commit -m "Initial commit: Face Attendance System ready for Railway deployment"
if errorlevel 1 (
    echo ERROR: Could not create commit
    pause
    exit /b 1
)

echo [4/4] Renaming branch to main...
git branch -M main
if errorlevel 1 (
    echo WARNING: Could not rename branch (may already be main)
)

echo.
echo ========================================
echo SUCCESS! Repository initialized.
echo ========================================
echo.
echo NEXT STEPS:
echo 1. Go to https://github.com/new and create a new repository called "face-attendance"
echo 2. Copy the commands shown (starting with "git remote add origin...")
echo 3. Run those commands in this terminal
echo 4. Go to https://railway.app
echo 5. Click "New Project" then "Deploy from GitHub"
echo 6. Select your face-attendance repository
echo 7. Wait for deployment (5-10 minutes)
echo.
echo After deployment:
echo - Login with: admin / admin123
echo - Share the Railway URL with your coworkers!
echo.
pause
