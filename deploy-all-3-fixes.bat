@echo off
echo.
echo ============================================================
echo  DEPLOYING ALL 3 FIXES FOR CORS, API CONFIG, VERCEL PROXY
echo ============================================================
echo.

cd /d d:\face-attendance

echo [1/4] Staging files...
git add backend/app.py frontend/src/utils/api.js vercel.json
if %ERRORLEVEL% NEQ 0 goto :error

echo [2/4] Committing changes...
git commit -m "Fix: CORS, API config, and Vercel proxy for production

- Add Vercel domain to CORS allowed origins in app.py
- Update frontend API config to use Railway URL in production
- Create vercel.json with proper build and rewrite rules

Fixes console CORS errors and enables login from Vercel frontend."
if %ERRORLEVEL% NEQ 0 goto :error

echo [3/4] Pushing to GitHub...
git push origin main
if %ERRORLEVEL% NEQ 0 goto :error

echo.
echo ============================================================
echo ✅ SUCCESS! All fixes deployed!
echo ============================================================
echo.
echo 📋 WHAT JUST HAPPENED:
echo   1. Vercel domain added to CORS allowed origins
echo   2. Frontend API config now uses Railway URL in production
echo   3. vercel.json created with build and proxy config
echo.
echo 🚀 NEXT STEPS:
echo   1. Wait 2-3 minutes for Vercel to rebuild
echo   2. Go to: https://face-attendance-43ynllikg-shaikayeshanilofar-365zs-projects.vercel.app
echo   3. Login with: admin / admin123
echo   4. Open Console (F12) - should see NO CORS errors!
echo.
echo 🎯 Expected Result:
echo   ✅ No CORS errors in console
echo   ✅ Dashboard loads after login
echo   ✅ Can see employees and mark attendance
echo.
pause
exit /b 0

:error
echo.
echo ❌ ERROR: Deploy failed!
echo Please check the error messages above and try again.
echo.
pause
exit /b 1
