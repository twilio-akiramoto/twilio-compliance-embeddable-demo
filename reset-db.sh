#!/bin/bash

# Twilio Compliance Embeddable Demo - Database Reset Script
# This script removes the database and optionally restarts with fresh data

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DB_FILE="$SCRIPT_DIR/backend/database.sqlite"
AUTO_RESTART=false

# Check for --restart flag
if [ "$1" == "--restart" ] || [ "$1" == "-r" ]; then
    AUTO_RESTART=true
fi

# Check for --all flag (pass through to start.sh)
START_MODE=""
if [ "$2" == "--all" ] || [ "$1" == "--all" ]; then
    START_MODE="--all"
fi

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║       Twilio Compliance Demo - Database Reset           ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Stop services first
echo -e "${BLUE}🛑 Stopping services...${NC}"
./stop.sh > /dev/null 2>&1 || true
echo -e "${GREEN}   ✅ Services stopped${NC}"
echo ""

# Check if database exists
if [ ! -f "$DB_FILE" ]; then
    echo -e "${YELLOW}ℹ️  No database file found${NC}"
else
    # Remove database file
    echo -e "${BLUE}🗑️  Removing database file...${NC}"
    rm -f "$DB_FILE"

    if [ -f "$DB_FILE" ]; then
        echo -e "${RED}❌ Failed to remove database${NC}"
        exit 1
    fi
    echo -e "${GREEN}   ✅ Database removed${NC}"
fi

# Remove log files
echo -e "${BLUE}🧹 Cleaning log files...${NC}"
rm -f "$SCRIPT_DIR/logs"/*.log
echo -e "${GREEN}   ✅ Logs cleaned${NC}"

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║              ✅ Reset Complete!                          ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Auto-restart if flag is set
if [ "$AUTO_RESTART" = true ]; then
    echo -e "${BLUE}🚀 Restarting services...${NC}"
    echo ""
    ./start.sh $START_MODE
else
    echo -e "${BLUE}📍 Next steps:${NC}"
    echo -e "   Start ISV Demo:  ${GREEN}./start.sh${NC}"
    echo -e "   Start All Apps:  ${GREEN}./start.sh --all${NC}"
    echo ""
    echo -e "${YELLOW}💡 Tip: Use './reset-db.sh --restart' to reset and auto-start${NC}"
    echo -e "        Use './reset-db.sh --restart --all' to start all apps${NC}"
    echo ""
    echo -e "${YELLOW}ℹ️  Test credentials will be recreated on startup:${NC}"
    echo -e "   CSM: ${YELLOW}csm@test.com / password123${NC}"
    echo -e "   Customer: ${YELLOW}customer@test.com / customer123${NC}"
    echo ""
fi
