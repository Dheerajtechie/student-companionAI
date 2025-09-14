@echo off
echo 🚀 Starting Study Companion App...
echo 📁 Current directory: %CD%
echo.

echo 📦 Checking if package.json exists...
if exist package.json (
    echo ✅ package.json found
) else (
    echo ❌ package.json not found!
    pause
    exit /b 1
)

echo.
echo 📦 Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo 🚀 Starting development server...
echo 🌐 The app will be available at: http://localhost:5173
echo.
echo Press Ctrl+C to stop the server
echo.

call npm run dev
