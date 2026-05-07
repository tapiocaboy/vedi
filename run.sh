#!/bin/bash

# Vedi - Unified Run Script
# This script starts both the backend and frontend servers

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${CYAN}Vedi - Vedic Astrology Calculator${NC}"
echo ""

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Function to cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}Shutting down servers...${NC}"
    
    # Kill background jobs
    if [ -n "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi
    if [ -n "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    
    # Kill any remaining processes on ports
    lsof -ti:8000 | xargs kill -9 2>/dev/null || true
    lsof -ti:5173 | xargs kill -9 2>/dev/null || true
    
    echo -e "${GREEN}Servers stopped.${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Kill any existing processes on the ports
echo -e "${YELLOW}Cleaning up existing processes...${NC}"
lsof -ti:8000 | xargs kill -9 2>/dev/null || true
lsof -ti:5173 | xargs kill -9 2>/dev/null || true

# Start Backend (if backend directory exists)
BACKEND_PID=""
if [ -d "$PROJECT_ROOT/backend" ]; then
    echo -e "${BLUE}Starting Backend Server...${NC}"
    cd "$PROJECT_ROOT/backend"

    if [ -d "../.venv" ]; then
        source ../.venv/bin/activate
    elif [ -d ".venv" ]; then
        source .venv/bin/activate
    else
        echo -e "${YELLOW}Warning: Virtual environment not found. Skipping backend.${NC}"
        cd "$PROJECT_ROOT"
    fi

    if [ -n "$VIRTUAL_ENV" ]; then
        poetry install --quiet 2>/dev/null || pip install -q -e . 2>/dev/null || true
        uvicorn src.main:app --reload --host 0.0.0.0 --port 8000 &
        BACKEND_PID=$!
        echo -e "${GREEN}✓ Backend starting on http://localhost:8000${NC}"
        sleep 2
    fi
else
    echo -e "${YELLOW}No backend directory found, skipping backend server.${NC}"
fi

# Start Frontend
echo -e "${BLUE}Starting Frontend Server...${NC}"
cd "$PROJECT_ROOT/frontend"

# Install npm dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing frontend dependencies...${NC}"
    npm install
fi

# Start vite in background
npm run dev &
FRONTEND_PID=$!
echo -e "${GREEN}✓ Frontend starting on http://localhost:5173${NC}"

echo ""
echo -e "${GREEN}Servers are running!${NC}"
echo -e ""
echo -e "  ${BLUE}Frontend:${NC}  http://localhost:5173"
if [ -n "$BACKEND_PID" ]; then
    echo -e "  ${BLUE}Backend:${NC}   http://localhost:8000"
    echo -e "  ${BLUE}API Docs:${NC}  http://localhost:8000/docs"
fi
echo -e ""
echo -e "${YELLOW}Press Ctrl+C to stop all servers${NC}"
echo ""

# Wait for running processes
if [ -n "$BACKEND_PID" ]; then
    wait $BACKEND_PID $FRONTEND_PID
else
    wait $FRONTEND_PID
fi

