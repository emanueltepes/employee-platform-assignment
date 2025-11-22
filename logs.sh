#!/bin/bash

# Colors for output
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📋 Showing logs (Ctrl+C to exit)...${NC}\n"

# Check if a service name was provided
if [ -z "$1" ]; then
    # No service specified, show all logs
    docker-compose -f docker-compose.dev.yml logs -f
else
    # Show logs for specific service (backend or frontend)
    docker-compose -f docker-compose.dev.yml logs -f "$1"
fi

