@echo off
echo ========================================
echo      ResourceHub - GitHub Setup
echo ========================================
echo.

echo Step 1: Install Git (if not already installed)
echo Download from: https://git-scm.com/download/win
echo.

echo Step 2: Initialize Git Repository
echo git init
echo git add .
echo git commit -m "Initial commit: ResourceHub v1.0.0"
echo.

echo Step 3: Create GitHub Repository
echo 1. Go to https://github.com/new
echo 2. Repository name: resourcehub
echo 3. Description: ResourceHub - A web application for sharing educational resources among students
echo 4. Choose Public or Private
echo 5. Don't initialize with README (we already have one)
echo 6. Click "Create repository"
echo.

echo Step 4: Connect to GitHub
echo git remote add origin https://github.com/yourusername/resourcehub.git
echo git branch -M main
echo git push -u origin main
echo.

echo Step 5: Verify Upload
echo Visit your GitHub repository to confirm all files are uploaded
echo.

echo ========================================
echo           Setup Complete!
echo ========================================
echo.
echo Your ResourceHub project is now organized and ready for GitHub!
echo.
echo Key features included:
echo - Clean, organized file structure
echo - Comprehensive README.md
echo - Proper .gitignore file
echo - MIT License
echo - Contributing guidelines
echo - Environment configuration example
echo.
echo Next steps:
echo 1. Install Git if needed
echo 2. Follow the commands above to upload to GitHub
echo 3. Consider setting up GitHub Pages for documentation
echo 4. Add branch protection rules for main branch
echo.
pause