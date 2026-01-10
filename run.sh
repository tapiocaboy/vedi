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

echo -e "${CYAN}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                                                               ║${NC}"
echo -e "${CYAN}║       ${BLUE}██╗   ██╗███████╗██████╗ ██╗${NC}                             ${CYAN}║${NC}"
echo -e "${CYAN}║       ${BLUE}██║   ██║██╔════╝██╔══██╗██║${NC}                             ${CYAN}║${NC}"
echo -e "${CYAN}║       ${BLUE}██║   ██║█████╗  ██║  ██║██║${NC}                             ${CYAN}║${NC}"
echo -e "${CYAN}║       ${BLUE}╚██╗ ██╔╝██╔══╝  ██║  ██║██║${NC}                             ${CYAN}║${NC}"
echo -e "${CYAN}║       ${BLUE} ╚████╔╝ ███████╗██████╔╝██║${NC}                             ${CYAN}║${NC}"
echo -e "${CYAN}║       ${BLUE}  ╚═══╝  ╚══════╝╚═════╝ ╚═╝${NC}                             ${CYAN}║${NC}"
echo -e "${CYAN}║                                                               ║${NC}"
echo -e "${CYAN}║         Vedic Astrology Calculator - Dev Server               ║${NC}"
echo -e "${CYAN}╚═══════════════════════════════════════════════════════════════╝${NC}"
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

# Start Backend
echo -e "${BLUE}Starting Backend Server...${NC}"
cd "$PROJECT_ROOT/backend"

if [ -d "../.venv" ]; then
    source ../.venv/bin/activate
elif [ -d ".venv" ]; then
    source .venv/bin/activate
else
    echo -e "${RED}Virtual environment not found. Please run: python -m venv .venv && pip install -r requirements.txt${NC}"
    exit 1
fi

# Install dependencies if needed
poetry install --quiet 2>/dev/null || pip install -q -e . 2>/dev/null || true

# Start uvicorn in background
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
echo -e "${GREEN}✓ Backend starting on http://localhost:8000${NC}"

# Wait a moment for backend to start
sleep 2

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
echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  Servers are running!${NC}"
echo -e ""
echo -e "  ${BLUE}Frontend:${NC}  http://localhost:5173"
echo -e "  ${BLUE}Backend:${NC}   http://localhost:8000"
echo -e "  ${BLUE}API Docs:${NC}  http://localhost:8000/docs"
echo -e ""
echo -e "${YELLOW}  Press Ctrl+C to stop all servers${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo ""

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID

