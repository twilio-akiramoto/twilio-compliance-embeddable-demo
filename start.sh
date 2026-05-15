#!/bin/bash

# Twilio Compliance Embeddable Demo - Start Script
# This script starts both backend and frontend servers

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/backend"
FRONTEND_DIR="$SCRIPT_DIR/frontend"
CUSTOMER_PORTAL_DIR="$SCRIPT_DIR/customer-portal"
CSM_DASHBOARD_DIR="$SCRIPT_DIR/csm-dashboard"
BACKEND_LOG="$SCRIPT_DIR/logs/backend.log"
FRONTEND_LOG="$SCRIPT_DIR/logs/frontend.log"
CUSTOMER_PORTAL_LOG="$SCRIPT_DIR/logs/customer-portal.log"
CSM_DASHBOARD_LOG="$SCRIPT_DIR/logs/csm-dashboard.log"
PID_DIR="$SCRIPT_DIR/logs"

# Check for --all flag
START_ALL=false
if [ "$1" == "--all" ] || [ "$1" == "-a" ]; then
    START_ALL=true
fi

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Create logs directory
mkdir -p "$SCRIPT_DIR/logs"

echo -e "${BLUE}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Twilio Compliance Embeddable Demo - Startup Script     ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""

if [ "$START_ALL" = true ]; then
    echo -e "${GREEN}🚀 Starting ALL applications (Backend + 3 Frontends)${NC}"
else
    echo -e "${GREEN}🚀 Starting ISV Demo (Backend + Demo Dashboard)${NC}"
    echo -e "${YELLOW}   Tip: Use './start.sh --all' to start all apps${NC}"
fi
echo ""

# Check if servers are already running
ALREADY_RUNNING=false

if [ -f "$PID_DIR/backend.pid" ]; then
    BACKEND_PID=$(cat "$PID_DIR/backend.pid")
    if ps -p $BACKEND_PID > /dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  Backend already running (PID: $BACKEND_PID)${NC}"
        ALREADY_RUNNING=true
    fi
fi

if [ -f "$PID_DIR/frontend.pid" ]; then
    FRONTEND_PID=$(cat "$PID_DIR/frontend.pid")
    if ps -p $FRONTEND_PID > /dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  Frontend already running (PID: $FRONTEND_PID)${NC}"
        ALREADY_RUNNING=true
    fi
fi

if [ -f "$PID_DIR/customer-portal.pid" ]; then
    PORTAL_PID=$(cat "$PID_DIR/customer-portal.pid")
    if ps -p $PORTAL_PID > /dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  Customer Portal already running (PID: $PORTAL_PID)${NC}"
        ALREADY_RUNNING=true
    fi
fi

if [ -f "$PID_DIR/csm-dashboard.pid" ]; then
    DASHBOARD_PID=$(cat "$PID_DIR/csm-dashboard.pid")
    if ps -p $DASHBOARD_PID > /dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  CSM Dashboard already running (PID: $DASHBOARD_PID)${NC}"
        ALREADY_RUNNING=true
    fi
fi

if [ "$ALREADY_RUNNING" = true ]; then
    echo -e "${YELLOW}   Run './stop.sh' first to restart${NC}"
    exit 1
fi

# Check if backend directory exists
if [ ! -d "$BACKEND_DIR" ]; then
    echo -e "${RED}❌ Backend directory not found: $BACKEND_DIR${NC}"
    exit 1
fi

# Check if frontend directory exists
if [ ! -d "$FRONTEND_DIR" ]; then
    echo -e "${RED}❌ Frontend directory not found: $FRONTEND_DIR${NC}"
    exit 1
fi

# Check for .env file
if [ ! -f "$BACKEND_DIR/.env" ]; then
    echo -e "${YELLOW}⚠️  Backend .env file not found${NC}"
    echo -e "${YELLOW}   Copying from .env.example...${NC}"
    cp "$BACKEND_DIR/.env.example" "$BACKEND_DIR/.env"
    echo -e "${RED}   ⚠️  Please edit backend/.env with your Twilio credentials${NC}"
fi

# Determine total steps
TOTAL_STEPS=2
if [ "$START_ALL" = true ]; then
    TOTAL_STEPS=4
fi

# Start Backend
echo -e "${BLUE}[1/$TOTAL_STEPS] Starting Backend Server...${NC}"
cd "$BACKEND_DIR"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}   Installing backend dependencies...${NC}"
    npm install > /dev/null 2>&1
fi

# Start backend in background
npm start > "$BACKEND_LOG" 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > "$PID_DIR/backend.pid"

# Wait for backend to start
echo -e "${BLUE}   Waiting for backend to start...${NC}"
for i in {1..30}; do
    if curl -s http://localhost:3011/health > /dev/null 2>&1; then
        echo -e "${GREEN}   ✅ Backend started successfully (PID: $BACKEND_PID)${NC}"
        echo -e "${GREEN}   📡 Health check: http://localhost:3011/health${NC}"

        # Check if mock mode is enabled
        if grep -q "AU_ALPHANUMERIC_MOCK_MODE=true" "$BACKEND_DIR/.env" 2>/dev/null; then
            echo -e "${YELLOW}   ⚠️  AU Alphanumeric Mock Mode: ENABLED${NC}"
        fi
        break
    fi

    # Check if backend process died
    if ! ps -p $BACKEND_PID > /dev/null 2>&1; then
        echo -e "${RED}   ❌ Backend failed to start${NC}"
        echo -e "${RED}   Check logs: tail -f $BACKEND_LOG${NC}"
        exit 1
    fi

    sleep 1
done

if ! curl -s http://localhost:3011/health > /dev/null 2>&1; then
    echo -e "${RED}   ❌ Backend did not respond in time${NC}"
    echo -e "${RED}   Check logs: tail -f $BACKEND_LOG${NC}"
    exit 1
fi

echo ""

# Start Frontend (ISV Demo Dashboard)
echo -e "${BLUE}[2/$TOTAL_STEPS] Starting ISV Demo Dashboard...${NC}"
cd "$FRONTEND_DIR"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}   Installing frontend dependencies...${NC}"
    npm install > /dev/null 2>&1
fi

# Start frontend in background
BROWSER=none npm start > "$FRONTEND_LOG" 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > "$PID_DIR/frontend.pid"

# Wait for frontend to start
echo -e "${BLUE}   Waiting for frontend to start...${NC}"
for i in {1..60}; do
    if curl -s http://localhost:3010 > /dev/null 2>&1; then
        echo -e "${GREEN}   ✅ Frontend started successfully (PID: $FRONTEND_PID)${NC}"
        echo -e "${GREEN}   🌐 Application: http://localhost:3010${NC}"
        break
    fi

    # Check if frontend process died
    if ! ps -p $FRONTEND_PID > /dev/null 2>&1; then
        echo -e "${RED}   ❌ Frontend failed to start${NC}"
        echo -e "${RED}   Check logs: tail -f $FRONTEND_LOG${NC}"
        exit 1
    fi

    sleep 1
done

if ! curl -s http://localhost:3010 > /dev/null 2>&1; then
    echo -e "${YELLOW}   ⚠️  Frontend may still be starting up...${NC}"
fi

echo ""

# Start Customer Portal (only if --all flag is used)
if [ "$START_ALL" = true ]; then
    echo -e "${BLUE}[3/$TOTAL_STEPS] Starting Customer Portal...${NC}"
    cd "$CUSTOMER_PORTAL_DIR"

    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}   Installing customer portal dependencies...${NC}"
        npm install > /dev/null 2>&1
    fi

    PORT=3020 BROWSER=none npm start > "$CUSTOMER_PORTAL_LOG" 2>&1 &
    PORTAL_PID=$!
    echo $PORTAL_PID > "$PID_DIR/customer-portal.pid"

    echo -e "${BLUE}   Waiting for customer portal to start...${NC}"
    for i in {1..60}; do
        if curl -s http://localhost:3020 > /dev/null 2>&1; then
            echo -e "${GREEN}   ✅ Customer Portal started (PID: $PORTAL_PID)${NC}"
            echo -e "${GREEN}   👤 Portal: http://localhost:3020${NC}"
            break
        fi

        if ! ps -p $PORTAL_PID > /dev/null 2>&1; then
            echo -e "${RED}   ❌ Customer Portal failed to start${NC}"
            echo -e "${RED}   Check logs: tail -f $CUSTOMER_PORTAL_LOG${NC}"
            break
        fi

        sleep 1
    done

    echo ""

    # Start CSM Dashboard
    echo -e "${BLUE}[4/$TOTAL_STEPS] Starting CSM Dashboard...${NC}"
    cd "$CSM_DASHBOARD_DIR"

    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}   Installing CSM dashboard dependencies...${NC}"
        npm install > /dev/null 2>&1
    fi

    PORT=3030 BROWSER=none npm start > "$CSM_DASHBOARD_LOG" 2>&1 &
    DASHBOARD_PID=$!
    echo $DASHBOARD_PID > "$PID_DIR/csm-dashboard.pid"

    echo -e "${BLUE}   Waiting for CSM dashboard to start...${NC}"
    for i in {1..60}; do
        if curl -s http://localhost:3030 > /dev/null 2>&1; then
            echo -e "${GREEN}   ✅ CSM Dashboard started (PID: $DASHBOARD_PID)${NC}"
            echo -e "${GREEN}   📊 Dashboard: http://localhost:3030${NC}"
            break
        fi

        if ! ps -p $DASHBOARD_PID > /dev/null 2>&1; then
            echo -e "${RED}   ❌ CSM Dashboard failed to start${NC}"
            echo -e "${RED}   Check logs: tail -f $CSM_DASHBOARD_LOG${NC}"
            break
        fi

        sleep 1
    done

    echo ""
fi

echo -e "${GREEN}╔══════════════════════════════════════════════════════════╗${NC}"
if [ "$START_ALL" = true ]; then
    echo -e "${GREEN}║        🎉 All Applications Started Successfully! 🎉     ║${NC}"
else
    echo -e "${GREEN}║              🎉 Demo Started Successfully! 🎉            ║${NC}"
fi
echo -e "${GREEN}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}📍 Application URLs:${NC}"
echo -e "   ISV Demo:  ${GREEN}http://localhost:3010${NC}"
echo -e "   Backend:   ${GREEN}http://localhost:3011${NC}"

if [ "$START_ALL" = true ]; then
    echo -e "   Customer Portal: ${GREEN}http://localhost:3020${NC}"
    echo -e "   CSM Dashboard:   ${GREEN}http://localhost:3030${NC}"
    echo ""
    echo -e "${BLUE}🔐 Demo Credentials:${NC}"
    echo -e "   CSM: ${YELLOW}csm@test.com / password123${NC}"
fi

echo ""
echo -e "${BLUE}📝 Logs:${NC}"
echo -e "   Backend:   ${YELLOW}tail -f $BACKEND_LOG${NC}"
echo -e "   Frontend:  ${YELLOW}tail -f $FRONTEND_LOG${NC}"

if [ "$START_ALL" = true ]; then
    echo -e "   Portal:    ${YELLOW}tail -f $CUSTOMER_PORTAL_LOG${NC}"
    echo -e "   Dashboard: ${YELLOW}tail -f $CSM_DASHBOARD_LOG${NC}"
fi

echo ""
echo -e "${BLUE}🛑 To stop:${NC}"
echo -e "   Run: ${YELLOW}./stop.sh${NC}"
echo ""
echo -e "${BLUE}📊 To check status:${NC}"
echo -e "   Run: ${YELLOW}./status.sh${NC}"
echo ""

# Open browser on macOS
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo -e "${BLUE}🌐 Opening browser...${NC}"
    sleep 2
    if [ "$START_ALL" = true ]; then
        open http://localhost:3030  # Open CSM Dashboard for full demo
    else
        open http://localhost:3010  # Open ISV Demo for testing
    fi
fi
