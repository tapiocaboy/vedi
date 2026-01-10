@echo off
REM Windows batch script to run the Vedic Astrology application using Docker
REM This script handles Windows-specific Docker configurations

echo Starting Vedic Astrology Application for Windows...
echo.

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker is not running. Please start Docker Desktop first.
    echo.
    echo Press any key to exit...
    pause >nul
    exit /b 1
)

echo Docker is running. Starting services...
echo.

REM Use Windows-specific docker-compose file if it exists
if exist docker-compose.windows.yml (
    echo Using Windows-specific configuration...
    docker-compose -f docker-compose.windows.yml up --build
) else (
    echo Using standard configuration...
    docker-compose up --build
)

echo.
echo Services stopped.
pause
