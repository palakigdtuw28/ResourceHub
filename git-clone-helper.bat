@echo off
title Git Installation & Clone Helper
color 0A

echo ========================================
echo     Git Installation & Clone Helper
echo ========================================
echo.

echo Checking if Git is installed...
git --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Git is installed!
    echo.
    goto clone_repo
) else (
    echo ❌ Git is not installed.
    echo.
    echo Please install Git first:
    echo 1. Download from: https://git-scm.com/download/win
    echo 2. Install with default settings
    echo 3. Restart this script
    echo.
    echo Opening Git download page...
    start https://git-scm.com/download/win
    echo.
    pause
    exit /b 1
)

:clone_repo
echo Cloning ResourceHub repository...
echo.
git clone https://github.com/palakigdtuw28/ResourceHub.git

if %errorlevel% equ 0 (
    echo.
    echo ✓ Successfully cloned ResourceHub!
    echo.
    echo The repository has been cloned to:
    echo %CD%\ResourceHub
    echo.
    echo Next steps:
    echo 1. cd ResourceHub
    echo 2. npm install
    echo 3. npm run dev
    echo.
    echo Opening the cloned folder...
    start ResourceHub
) else (
    echo.
    echo ❌ Failed to clone repository.
    echo.
    echo Possible reasons:
    echo - Network connection issues
    echo - Repository doesn't exist or is private
    echo - Authentication required
    echo.
    echo Manual clone command:
    echo git clone https://github.com/palakigdtuw28/ResourceHub.git
)

echo.
pause