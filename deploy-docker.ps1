# ResourceHub Docker Deployment - PowerShell Script

Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "              ResourceHub - Docker Deployment Setup" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is installed
Write-Host "[STEP 1] Checking if Docker is installed..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version 2>$null
    Write-Host "✓ Docker is installed: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not installed on your system." -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Docker Desktop first:" -ForegroundColor Yellow
    Write-Host "1. Download: https://www.docker.com/products/docker-desktop/" -ForegroundColor White
    Write-Host "2. Install with default settings" -ForegroundColor White
    Write-Host "3. Restart your computer" -ForegroundColor White
    Write-Host "4. Start Docker Desktop" -ForegroundColor White
    Write-Host "5. Run this script again" -ForegroundColor White
    Write-Host ""
    Start-Process "https://www.docker.com/products/docker-desktop/"
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if Docker is running
Write-Host ""
Write-Host "[STEP 2] Checking if Docker is running..." -ForegroundColor Yellow
try {
    docker info | Out-Null
    Write-Host "✓ Docker is running!" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not running. Please start Docker Desktop and try again." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Build Docker image
Write-Host ""
Write-Host "[STEP 3] Building ResourceHub Docker image..." -ForegroundColor Yellow
Write-Host "This may take a few minutes on first build..." -ForegroundColor Cyan

try {
    docker build -t resourcehub . 2>&1 | ForEach-Object {
        if ($_ -match "Step \d+/\d+") {
            Write-Host $_ -ForegroundColor Blue
        } elseif ($_ -match "Successfully") {
            Write-Host $_ -ForegroundColor Green
        } else {
            Write-Host $_ -ForegroundColor White
        }
    }
    Write-Host "✓ Docker image built successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to build Docker image. Check the error messages above." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Create data directories
Write-Host ""
Write-Host "[STEP 4] Creating data directories..." -ForegroundColor Yellow
if (!(Test-Path "data")) { New-Item -ItemType Directory -Name "data" | Out-Null }
if (!(Test-Path "uploads")) { New-Item -ItemType Directory -Name "uploads" | Out-Null }
Write-Host "✓ Data directories created!" -ForegroundColor Green

# Start application
Write-Host ""
Write-Host "[STEP 5] Starting ResourceHub application..." -ForegroundColor Yellow

try {
    # Try Docker Compose first
    if (Get-Command docker-compose -ErrorAction SilentlyContinue) {
        docker-compose up -d
        Write-Host "✓ Application started with Docker Compose!" -ForegroundColor Green
    } else {
        # Fallback to direct Docker command
        Write-Host "Docker Compose not found, using direct Docker command..." -ForegroundColor Cyan
        docker run -d --name resourcehub-app -p 5000:5000 -v "${PWD}/data:/app/data" -v "${PWD}/uploads:/app/uploads" -e NODE_ENV=production -e SESSION_SECRET=change-this-secure-secret resourcehub
        Write-Host "✓ Application started with Docker!" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Failed to start application." -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "================================================================" -ForegroundColor Green
Write-Host "                    🎉 SUCCESS! 🎉" -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Green
Write-Host ""
Write-Host "ResourceHub is now running in Docker!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Access your application at: http://localhost:5000" -ForegroundColor Cyan
Write-Host ""
Write-Host "👤 Default Admin Login:" -ForegroundColor Yellow
Write-Host "   Username: palak123" -ForegroundColor White
Write-Host "   Password: admin123" -ForegroundColor White
Write-Host "   ⚠️  CHANGE THESE CREDENTIALS IMMEDIATELY!" -ForegroundColor Red
Write-Host ""
Write-Host "🐳 Docker Commands:" -ForegroundColor Yellow
Write-Host "   View logs:     docker-compose logs -f app" -ForegroundColor White
Write-Host "   Stop app:      docker-compose down" -ForegroundColor White
Write-Host "   Restart app:   docker-compose restart" -ForegroundColor White
Write-Host "   Update app:    docker-compose up -d --build" -ForegroundColor White
Write-Host ""
Write-Host "📁 Your data is stored in:" -ForegroundColor Yellow
Write-Host "   Database: .\data\resourcehub.db" -ForegroundColor White
Write-Host "   Uploads:  .\uploads\" -ForegroundColor White
Write-Host ""

# Open browser
Write-Host "Opening your application in browser..." -ForegroundColor Cyan
Start-Process "http://localhost:5000"

Read-Host "Press Enter to exit"