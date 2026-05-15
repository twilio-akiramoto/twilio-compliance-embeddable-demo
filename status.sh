#!/bin/bash

# Twilio Compliance Embeddable Demo - Status Script
# This script checks the status of backend and frontend servers

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PID_DIR="$SCRIPT_DIR/logs"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║    Twilio Compliance Embeddable Demo - Status Check     ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""

SERVICES_RUNNING=0
SERVICES_TOTAL=4

# Check Backend Status
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Backend Server${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ -f "$PID_DIR/backend.pid" ]; then
    BACKEND_PID=$(cat "$PID_DIR/backend.pid")
    if ps -p $BACKEND_PID > /dev/null 2>&1; then
        echo -e "   Status:     ${GREEN}✅ Running${NC}"
        echo -e "   PID:        ${GREEN}$BACKEND_PID${NC}"

        # Check health endpoint
        if HEALTH_RESPONSE=$(curl -s http://localhost:3011/health 2>/dev/null); then
            echo -e "   Health:     ${GREEN}✅ Healthy${NC}"
            echo -e "   URL:        ${GREEN}http://localhost:3011${NC}"

            # Check mock mode
            if [ -f "$SCRIPT_DIR/backend/.env" ]; then
                if grep -q "AU_ALPHANUMERIC_MOCK_MODE=true" "$SCRIPT_DIR/backend/.env" 2>/dev/null; then
                    echo -e "   Mock Mode:  ${YELLOW}⚠️  ENABLED (AU Alphanumeric)${NC}"
                else
                    echo -e "   Mock Mode:  ${GREEN}✅ Disabled${NC}"
                fi
            fi

            SERVICES_RUNNING=$((SERVICES_RUNNING + 1))
        else
            echo -e "   Health:     ${RED}❌ Not responding${NC}"
            echo -e "   URL:        ${RED}http://localhost:3011 (unreachable)${NC}"
        fi

        # Show resource usage
        CPU=$(ps -p $BACKEND_PID -o %cpu= | xargs)
        MEM=$(ps -p $BACKEND_PID -o %mem= | xargs)
        echo -e "   CPU:        ${BLUE}${CPU}%${NC}"
        echo -e "   Memory:     ${BLUE}${MEM}%${NC}"
    else
        echo -e "   Status:     ${RED}❌ Not running (stale PID)${NC}"
        echo -e "   PID File:   ${YELLOW}$PID_DIR/backend.pid${NC}"
    fi
else
    echo -e "   Status:     ${RED}❌ Not running${NC}"
    echo -e "   PID File:   ${YELLOW}Not found${NC}"

    # Check if something is on port 3011
    if lsof -ti:3011 > /dev/null 2>&1; then
        PORT_PID=$(lsof -ti:3011)
        echo -e "   Port 3011:  ${YELLOW}⚠️  Occupied by PID $PORT_PID${NC}"
    fi
fi

echo ""

# Check ISV Demo Dashboard Status
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}ISV Demo Dashboard${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ -f "$PID_DIR/frontend.pid" ]; then
    FRONTEND_PID=$(cat "$PID_DIR/frontend.pid")
    if ps -p $FRONTEND_PID > /dev/null 2>&1; then
        echo -e "   Status:     ${GREEN}✅ Running${NC}"
        echo -e "   PID:        ${GREEN}$FRONTEND_PID${NC}"

        # Check if responding
        if curl -s http://localhost:3010 > /dev/null 2>&1; then
            echo -e "   Health:     ${GREEN}✅ Responding${NC}"
            echo -e "   URL:        ${GREEN}http://localhost:3010${NC}"
            SERVICES_RUNNING=$((SERVICES_RUNNING + 1))
        else
            echo -e "   Health:     ${YELLOW}⚠️  Starting up...${NC}"
            echo -e "   URL:        ${YELLOW}http://localhost:3010 (loading)${NC}"
        fi

        # Show resource usage
        CPU=$(ps -p $FRONTEND_PID -o %cpu= | xargs)
        MEM=$(ps -p $FRONTEND_PID -o %mem= | xargs)
        echo -e "   CPU:        ${BLUE}${CPU}%${NC}"
        echo -e "   Memory:     ${BLUE}${MEM}%${NC}"

        # Count child processes (webpack, etc.)
        CHILD_COUNT=$(pgrep -P $FRONTEND_PID | wc -l | xargs)
        echo -e "   Processes:  ${BLUE}${CHILD_COUNT} child processes${NC}"
    else
        echo -e "   Status:     ${RED}❌ Not running (stale PID)${NC}"
        echo -e "   PID File:   ${YELLOW}$PID_DIR/frontend.pid${NC}"
    fi
else
    echo -e "   Status:     ${RED}❌ Not running${NC}"
    echo -e "   PID File:   ${YELLOW}Not found${NC}"

    # Check if something is on port 3010
    if lsof -ti:3010 > /dev/null 2>&1; then
        PORT_PID=$(lsof -ti:3010)
        echo -e "   Port 3010:  ${YELLOW}⚠️  Occupied by PID $PORT_PID${NC}"
    fi
fi

echo ""

# Check Customer Portal Status
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Customer Portal${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ -f "$PID_DIR/customer-portal.pid" ]; then
    PORTAL_PID=$(cat "$PID_DIR/customer-portal.pid")
    if ps -p $PORTAL_PID > /dev/null 2>&1; then
        echo -e "   Status:     ${GREEN}✅ Running${NC}"
        echo -e "   PID:        ${GREEN}$PORTAL_PID${NC}"

        if curl -s http://localhost:3020 > /dev/null 2>&1; then
            echo -e "   Health:     ${GREEN}✅ Responding${NC}"
            echo -e "   URL:        ${GREEN}http://localhost:3020${NC}"
            SERVICES_RUNNING=$((SERVICES_RUNNING + 1))
        else
            echo -e "   Health:     ${RED}❌ Not responding${NC}"
        fi

        CPU=$(ps -p $PORTAL_PID -o %cpu= | xargs)
        MEM=$(ps -p $PORTAL_PID -o %mem= | xargs)
        echo -e "   CPU:        ${BLUE}${CPU}%${NC}"
        echo -e "   Memory:     ${BLUE}${MEM}%${NC}"
    else
        echo -e "   Status:     ${RED}❌ Not running (stale PID)${NC}"
    fi
else
    echo -e "   Status:     ${YELLOW}⚠️  Not started${NC}"
    if lsof -ti:3020 > /dev/null 2>&1; then
        PORT_PID=$(lsof -ti:3020)
        echo -e "   Port 3020:  ${YELLOW}⚠️  Occupied by PID $PORT_PID${NC}"
    fi
fi

echo ""

# Check CSM Dashboard Status
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}CSM Dashboard${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ -f "$PID_DIR/csm-dashboard.pid" ]; then
    DASHBOARD_PID=$(cat "$PID_DIR/csm-dashboard.pid")
    if ps -p $DASHBOARD_PID > /dev/null 2>&1; then
        echo -e "   Status:     ${GREEN}✅ Running${NC}"
        echo -e "   PID:        ${GREEN}$DASHBOARD_PID${NC}"

        if curl -s http://localhost:3030 > /dev/null 2>&1; then
            echo -e "   Health:     ${GREEN}✅ Responding${NC}"
            echo -e "   URL:        ${GREEN}http://localhost:3030${NC}"
            SERVICES_RUNNING=$((SERVICES_RUNNING + 1))
        else
            echo -e "   Health:     ${RED}❌ Not responding${NC}"
        fi

        CPU=$(ps -p $DASHBOARD_PID -o %cpu= | xargs)
        MEM=$(ps -p $DASHBOARD_PID -o %mem= | xargs)
        echo -e "   CPU:        ${BLUE}${CPU}%${NC}"
        echo -e "   Memory:     ${BLUE}${MEM}%${NC}"
    else
        echo -e "   Status:     ${RED}❌ Not running (stale PID)${NC}"
    fi
else
    echo -e "   Status:     ${YELLOW}⚠️  Not started${NC}"
    if lsof -ti:3030 > /dev/null 2>&1; then
        PORT_PID=$(lsof -ti:3030)
        echo -e "   Port 3030:  ${YELLOW}⚠️  Occupied by PID $PORT_PID${NC}"
    fi
fi

echo ""

# Overall Status
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Overall Status${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ $SERVICES_RUNNING -eq $SERVICES_TOTAL ]; then
    echo -e "   ${GREEN}✅ All services running ($SERVICES_RUNNING/$SERVICES_TOTAL)${NC}"
    echo ""
    echo -e "${GREEN}╔══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║              🎉 Demo is Fully Operational! 🎉           ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════════╝${NC}"
elif [ $SERVICES_RUNNING -gt 0 ]; then
    echo -e "   ${YELLOW}⚠️  Partial ($SERVICES_RUNNING/$SERVICES_TOTAL services running)${NC}"
    echo ""
    echo -e "${YELLOW}╔══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${YELLOW}║            ⚠️  Some services are not running            ║${NC}"
    echo -e "${YELLOW}╚══════════════════════════════════════════════════════════╝${NC}"
else
    echo -e "   ${RED}❌ No services running${NC}"
    echo ""
    echo -e "${RED}╔══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║                  ❌ Demo is not running                  ║${NC}"
    echo -e "${RED}╚══════════════════════════════════════════════════════════╝${NC}"
fi

echo ""

# Show logs location if services are running
if [ $SERVICES_RUNNING -gt 0 ]; then
    echo -e "${BLUE}📝 Logs:${NC}"
    if [ -f "$SCRIPT_DIR/logs/backend.log" ]; then
        echo -e "   Backend:         ${YELLOW}tail -f $SCRIPT_DIR/logs/backend.log${NC}"
    fi
    if [ -f "$SCRIPT_DIR/logs/frontend.log" ]; then
        echo -e "   ISV Demo:        ${YELLOW}tail -f $SCRIPT_DIR/logs/frontend.log${NC}"
    fi
    if [ -f "$SCRIPT_DIR/logs/customer-portal.log" ]; then
        echo -e "   Customer Portal: ${YELLOW}tail -f $SCRIPT_DIR/logs/customer-portal.log${NC}"
    fi
    if [ -f "$SCRIPT_DIR/logs/csm-dashboard.log" ]; then
        echo -e "   CSM Dashboard:   ${YELLOW}tail -f $SCRIPT_DIR/logs/csm-dashboard.log${NC}"
    fi
    echo ""
fi

# Show available commands
echo -e "${BLUE}📍 Available Commands:${NC}"
if [ $SERVICES_RUNNING -eq 0 ]; then
    echo -e "   Start ISV Demo:  ${GREEN}./start.sh${NC}"
    echo -e "   Start All Apps:  ${GREEN}./start.sh --all${NC}"
else
    echo -e "   Stop:            ${YELLOW}./stop.sh${NC}"
    echo -e "   Restart:         ${YELLOW}./stop.sh && ./start.sh${NC}"
    echo -e "   Restart All:     ${YELLOW}./stop.sh && ./start.sh --all${NC}"
fi
echo ""

# Exit with appropriate code
if [ $SERVICES_RUNNING -eq $SERVICES_TOTAL ]; then
    exit 0
elif [ $SERVICES_RUNNING -gt 0 ]; then
    exit 1
else
    exit 2
fi
