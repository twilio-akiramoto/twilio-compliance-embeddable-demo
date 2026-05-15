#!/bin/bash

# Twilio Compliance Embeddable Demo - Restart Script
# This script stops and then starts both servers

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Twilio Compliance Embeddable Demo - Restart Script     ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Stop services
"$SCRIPT_DIR/stop.sh"

# Wait a moment
echo ""
echo -e "${BLUE}⏳ Waiting 2 seconds before restart...${NC}"
sleep 2
echo ""

# Start services
"$SCRIPT_DIR/start.sh"
