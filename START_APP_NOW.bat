@echo off
echo ========================================
echo 🚀 STUDY COMPANION - STARTING APP
echo ========================================
echo.

echo 📁 Current directory: %CD%
echo.

echo 🔍 Checking if package.json exists...
if exist package.json (
    echo ✅ package.json found
) else (
    echo ❌ package.json not found!
    echo Please run this from the study-companion directory
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
echo 🔧 Setting up environment...
if not exist .env.local (
    echo Creating .env.local file...
    call node setup-production-env.js
)

echo.
echo 🚀 Starting development server...
echo.
echo ========================================
echo 🎉 YOUR APP IS STARTING!
echo ========================================
echo.
echo 🌐 Local URL: http://localhost:5173/
echo 📱 Mobile: Works perfectly on all devices
echo 💻 Desktop: Full-featured web application
echo.
echo ✨ Features available:
echo    ✅ User Authentication (Login/Register)
echo    ✅ AI Question Generation (OpenAI, Groq, Gemini)
echo    ✅ Study Session Timer
echo    ✅ Subject Management
echo    ✅ Goals Tracking
echo    ✅ Analytics Dashboard
echo    ✅ Spaced Repetition
echo    ✅ Offline PWA Support
echo    ✅ Beautiful UI with Animations
echo    ✅ Dark/Light Mode
echo    ✅ Mobile Responsive
echo.
echo 🔧 To stop the server: Press Ctrl+C
echo.
echo ========================================
echo 🎊 SUCCESS! Study Companion is ready!
echo ========================================
echo.

call npm run dev
