@echo off
title ResourceHub - Docker Setup and Deployment
color 0B
cls

echo.
echo ================================================================
echo              ResourceHub - Docker Deployment Setup
echo ================================================================
echo.

echo [STEP 1] Checking if Docker is installed...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not installed on your system.
    echo.
    echo Please install Docker Desktop first:
    echo.
    echo 1. Download Docker Desktop for Windows:
    echo    https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe
    echo.
    echo 2. Install Docker Desktop with default settings
    echo 3. Restart your computer
    echo 4. Start Docker Desktop
    echo 5. Run this script again
    echo.
    echo Opening Docker download page...
    start https://www.docker.com/products/docker-desktop/
    echo.
    pause
    goto end
) else (
    echo ✓ Docker is installed!
    docker --version
    echo.
)

echo [STEP 2] Checking if Docker is running...
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not running. Please start Docker Desktop and try again.
    echo.
    pause
    goto end
) else (
    echo ✓ Docker is running!
    echo.
)

echo [STEP 3] Building ResourceHub Docker image...
echo This may take a few minutes on first build...
echo.
docker build -t resourcehub .
if %errorlevel% neq 0 (
    echo ❌ Failed to build Docker image. Check the error messages above.
    echo.
    pause
    goto end
) else (
    echo ✓ Docker image built successfully!
    echo.
)

echo [STEP 4] Creating data directories...
if not exist "data" mkdir data
if not exist "uploads" mkdir uploads
echo ✓ Data directories created!
echo.

echo [STEP 5] Starting ResourceHub application...
echo.
docker-compose up -d
if %errorlevel% neq 0 (
    echo ❌ Failed to start application with Docker Compose.
    echo Trying with direct Docker command...
    echo.
    docker run -d --name resourcehub-app -p 5000:5000 -v %CD%\data:/app/data -v %CD%\uploads:/app/uploads -e NODE_ENV=production -e SESSION_SECRET=change-this-secure-secret resourcehub
    if %errorlevel% neq 0 (
        echo ❌ Failed to start application.
        pause
        goto end
    )
)

echo.
echo ================================================================
echo                    🎉 SUCCESS! 🎉
echo ================================================================
echo.
echo ResourceHub is now running in Docker!
echo.
echo 🌐 Access your application at: http://localhost:5000
echo.
echo 👤 Default Admin Login:
echo    Username: palak123
echo    Password: admin123
echo    ⚠️  CHANGE THESE CREDENTIALS IMMEDIATELY!
echo.
echo 🐳 Docker Commands:
echo    View logs:     docker-compose logs -f app
echo    Stop app:      docker-compose down
echo    Restart app:   docker-compose restart
echo    Update app:    docker-compose up -d --build
echo.
echo 📁 Your data is stored in:
echo    Database: .\data\resourcehub.db
echo    Uploads:  .\uploads\
echo.
echo Opening your application in browser...
start http://localhost:5000
echo.

:end
pause