# Vedic Astrology Application - Windows Setup Guide

This guide will help you run the Vedic Astrology application on Windows using Docker.

## Prerequisites

1. **Windows 10/11 Pro, Enterprise, or Education** (Home edition requires WSL 2)
2. **Docker Desktop for Windows** - Download from https://www.docker.com/products/docker-desktop
3. **Git** - Download from https://git-scm.com/downloads
4. **At least 4GB RAM** available for Docker

## Quick Start

### Method 1: Batch Script (Recommended)

1. **Clone the repository:**
   ```cmd
   git clone https://github.com/yourusername/vedi.git
   cd vedi
   ```

2. **Run the application:**
   ```cmd
   docker-run.bat
   ```

That's it! The application will be available at:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs

### Method 2: PowerShell Script

```powershell
.\docker-run.ps1
```

For a clean rebuild:
```powershell
.\docker-run.ps1 -Clean -Rebuild
```

### Method 3: Manual Docker Commands

```cmd
# Start services
docker-compose -f docker-compose.windows.yml up --build

# Or use standard compose file
docker-compose up --build
```

## Troubleshooting

### Docker Desktop Not Starting
- Ensure WSL 2 is enabled (Windows Feature)
- Enable virtualization in BIOS
- Restart Windows after enabling virtualization

### Port Already in Use
If ports 3000 or 8000 are busy:
```cmd
# Check what's using the ports
netstat -ano | findstr :3000
netstat -ano | findstr :8000

# Kill the process (replace PID)
taskkill /PID <PID> /F
```

### Build Failures

**Clear Docker cache:**
```cmd
docker system prune -a --volumes
```

**Rebuild without cache:**
```cmd
docker-compose -f docker-compose.windows.yml build --no-cache
```

### File Permissions Issues

**Reset Docker Desktop:**
1. Right-click Docker icon in system tray
2. Select "Reset to factory defaults"
3. Restart Docker Desktop

### Performance Issues

**For better performance on Windows:**
1. Enable WSL 2 integration in Docker Desktop settings
2. Allocate more CPU cores and RAM to Docker
3. Use SSD for Docker data location

## Development

### Running Tests

```cmd
# Run backend tests
docker-compose -f docker-compose.windows.yml exec backend pytest tests/ -v

# Run frontend tests
docker-compose -f docker-compose.windows.yml exec frontend npm test
```

### Accessing Container Shell

```cmd
# Backend shell
docker-compose -f docker-compose.windows.yml exec backend bash

# Frontend shell
docker-compose -f docker-compose.windows.yml exec frontend sh
```

### Viewing Logs

```cmd
# All services
docker-compose -f docker-compose.windows.yml logs -f

# Specific service
docker-compose -f docker-compose.windows.yml logs -f backend
docker-compose -f docker-compose.windows.yml logs -f frontend
```

## File Structure

```
vedi/
├── docker-compose.yml          # Standard configuration
├── docker-compose.windows.yml  # Windows-optimized configuration
├── docker-run.bat             # Windows batch script
├── docker-run.ps1             # PowerShell script
├── backend/
│   ├── Dockerfile             # Standard backend container
│   ├── Dockerfile.windows     # Windows-optimized backend
│   ├── pyproject.toml         # Poetry dependencies
│   └── src/                   # Backend source code
├── frontend/
│   ├── Dockerfile             # Standard frontend container
│   ├── Dockerfile.windows     # Windows-optimized frontend
│   ├── package.json           # Node dependencies
│   └── src/                   # Frontend source code
└── README-Windows.md          # This file
```

## Windows-Specific Optimizations

- **File watching:** Uses polling instead of native file watching
- **Line endings:** Proper handling of CRLF/LF differences
- **Path separators:** Forward slashes for container paths
- **Memory limits:** Increased Node.js memory allocation
- **Platform specification:** Forces linux/amd64 containers

## Stopping the Application

```cmd
# Stop all services
docker-compose -f docker-compose.windows.yml down

# Stop and remove volumes
docker-compose -f docker-compose.windows.yml down -v

# Stop and remove everything
docker-compose -f docker-compose.windows.yml down --rmi all --volumes
```

## Support

If you encounter issues:

1. Check the [main README.md](../README.md) for general documentation
2. Review Docker Desktop logs
3. Ensure Windows is up to date
4. Try restarting Docker Desktop
5. Check GitHub Issues for similar problems

## System Requirements

- **OS:** Windows 10/11 (64-bit)
- **RAM:** 8GB minimum, 16GB recommended
- **Disk:** 10GB free space
- **Docker:** Version 20.10 or later
- **WSL 2:** Required for Windows Home edition
