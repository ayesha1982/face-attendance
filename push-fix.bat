@echo off
cd /d d:\face-attendance

echo.
echo 🔧 Pushing CORS fix to Railway...
echo.

git add backend/app.py
git commit -m "Fix: CORS cross-origin requests - allow all origins with credentials"
git push origin main

echo.
echo ✅ Push complete! Railway will deploy automatically in 2-5 minutes.
echo.
pause
