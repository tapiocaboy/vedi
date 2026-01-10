# PowerShell script to run the Vedic Astrology application using Docker
# This script handles Windows-specific Docker configurations

param(
    [switch]$Clean,
    [switch]$Rebuild
)

Write-Host "Starting Vedic Astrology Application for Windows..." -ForegroundColor Green
Write-Host ""

# Check if Docker is running
try {
    $dockerInfo = docker info 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Docker is not running. Please start Docker Desktop first." -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
} catch {
    Write-Host "ERROR: Docker command not found. Please install Docker Desktop." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Docker is running. Starting services..." -ForegroundColor Green
Write-Host ""

# Clean up if requested
if ($Clean) {
    Write-Host "Cleaning up previous containers and images..." -ForegroundColor Yellow
    docker-compose down --volumes --remove-orphans 2>$null
    if ($Rebuild) {
        docker system prune -f
    }
    Write-Host ""
}

# Use Windows-specific docker-compose file if it exists
$composeFile = "docker-compose.yml"
if (Test-Path "docker-compose.windows.yml") {
    Write-Host "Using Windows-specific configuration..." -ForegroundColor Cyan
    $composeFile = "docker-compose.windows.yml"
} else {
    Write-Host "Using standard configuration..." -ForegroundColor Cyan
}

# Build and run the services
try {
    if ($Rebuild) {
        docker-compose -f $composeFile up --build --force-recreate
    } else {
        docker-compose -f $composeFile up --build
    }
} catch {
    Write-Host "Error running Docker Compose: $($_.Exception.Message)" -ForegroundColor Red
} finally {
    Write-Host ""
    Write-Host "Services stopped." -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
}
