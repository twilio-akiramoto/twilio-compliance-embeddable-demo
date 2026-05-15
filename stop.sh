#!/bin/bash

# Twilio Compliance Embeddable Demo - Stop Script
# This script stops both backend and frontend servers

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PID_DIR="$SCRIPT_DIR/logs"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Twilio Compliance Embeddable Demo - Shutdown Script    ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""

STOPPED_COUNT=0

# Stop Backend
if [ -f "$PID_DIR/backend.pid" ]; then
    BACKEND_PID=$(cat "$PID_DIR/backend.pid")
    if ps -p $BACKEND_PID > /dev/null 2>&1; then
        echo -e "${BLUE}🛑 Stopping Backend (PID: $BACKEND_PID)...${NC}"
        kill $BACKEND_PID 2>/dev/null

        # Wait for graceful shutdown
        for i in {1..10}; do
            if ! ps -p $BACKEND_PID > /dev/null 2>&1; then
                echo -e "${GREEN}   ✅ Backend stopped${NC}"
                STOPPED_COUNT=$((STOPPED_COUNT + 1))
                break
            fi
            sleep 1
        done

        # Force kill if still running
        if ps -p $BACKEND_PID > /dev/null 2>&1; then
            echo -e "${YELLOW}   ⚠️  Force killing backend...${NC}"
            kill -9 $BACKEND_PID 2>/dev/null
            echo -e "${GREEN}   ✅ Backend stopped (forced)${NC}"
            STOPPED_COUNT=$((STOPPED_COUNT + 1))
        fi
    else
        echo -e "${YELLOW}⚠️  Backend not running (stale PID file)${NC}"
    fi
    rm -f "$PID_DIR/backend.pid"
else
    echo -e "${YELLOW}⚠️  Backend PID file not found${NC}"
fi

# Also kill any processes on port 3011
BACKEND_PORT_PID=$(lsof -ti:3011 2>/dev/null)
if [ ! -z "$BACKEND_PORT_PID" ]; then
    echo -e "${BLUE}🛑 Stopping process on port 3011 (PID: $BACKEND_PORT_PID)...${NC}"
    kill $BACKEND_PORT_PID 2>/dev/null
    sleep 1
    if lsof -ti:3011 > /dev/null 2>&1; then
        kill -9 $BACKEND_PORT_PID 2>/dev/null
    fi
    echo -e "${GREEN}   ✅ Port 3011 freed${NC}"
fi

echo ""

# Stop Frontend
if [ -f "$PID_DIR/frontend.pid" ]; then
    FRONTEND_PID=$(cat "$PID_DIR/frontend.pid")
    if ps -p $FRONTEND_PID > /dev/null 2>&1; then
        echo -e "${BLUE}🛑 Stopping Frontend (PID: $FRONTEND_PID)...${NC}"

        # Kill the entire process group (includes child processes)
        PGID=$(ps -o pgid= $FRONTEND_PID | grep -o '[0-9]*')
        kill -- -$PGID 2>/dev/null || kill $FRONTEND_PID 2>/dev/null

        # Wait for graceful shutdown
        for i in {1..10}; do
            if ! ps -p $FRONTEND_PID > /dev/null 2>&1; then
                echo -e "${GREEN}   ✅ Frontend stopped${NC}"
                STOPPED_COUNT=$((STOPPED_COUNT + 1))
                break
            fi
            sleep 1
        done

        # Force kill if still running
        if ps -p $FRONTEND_PID > /dev/null 2>&1; then
            echo -e "${YELLOW}   ⚠️  Force killing frontend...${NC}"
            kill -9 $FRONTEND_PID 2>/dev/null
            [ ! -z "$PGID" ] && kill -9 -- -$PGID 2>/dev/null
            echo -e "${GREEN}   ✅ Frontend stopped (forced)${NC}"
            STOPPED_COUNT=$((STOPPED_COUNT + 1))
        fi
    else
        echo -e "${YELLOW}⚠️  Frontend not running (stale PID file)${NC}"
    fi
    rm -f "$PID_DIR/frontend.pid"
else
    echo -e "${YELLOW}⚠️  Frontend PID file not found${NC}"
fi

# Also kill any processes on port 3010
FRONTEND_PORT_PID=$(lsof -ti:3010 2>/dev/null)
if [ ! -z "$FRONTEND_PORT_PID" ]; then
    echo -e "${BLUE}🛑 Stopping process on port 3010 (PID: $FRONTEND_PORT_PID)...${NC}"
    kill $FRONTEND_PORT_PID 2>/dev/null
    sleep 1
    if lsof -ti:3010 > /dev/null 2>&1; then
        kill -9 $FRONTEND_PORT_PID 2>/dev/null
    fi
    echo -e "${GREEN}   ✅ Port 3010 freed${NC}"
fi

# Kill any remaining react-scripts or node processes related to this project
echo ""
echo -e "${BLUE}🧹 Cleaning up remaining processes...${NC}"
REACT_PIDS=$(ps aux | grep -E "react-scripts|$SCRIPT_DIR" | grep -v grep | grep -v stop.sh | awk '{print $2}')
if [ ! -z "$REACT_PIDS" ]; then
    echo "$REACT_PIDS" | while read pid; do
        kill $pid 2>/dev/null
    done
    sleep 1
    echo -e "${GREEN}   ✅ Cleanup complete${NC}"
else
    echo -e "${GREEN}   ✅ No remaining processes found${NC}"
fi

echo ""

if [ $STOPPED_COUNT -gt 0 ]; then
    echo -e "${GREEN}╔══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║          ✅ Demo Stopped Successfully! ($STOPPED_COUNT services)         ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════════╝${NC}"
else
    echo -e "${YELLOW}╔══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${YELLOW}║            ℹ️  No services were running                  ║${NC}"
    echo -e "${YELLOW}╚══════════════════════════════════════════════════════════╝${NC}"
fi

echo ""
echo -e "${BLUE}📍 To start again:${NC}"
echo -e "   Run: ${GREEN}./start.sh${NC}"
echo ""
