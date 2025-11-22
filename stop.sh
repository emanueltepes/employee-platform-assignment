#!/bin/bash

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🛑 Stopping all development services...${NC}"
docker-compose -f docker-compose.dev.yml down

echo -e "${RED}✅ All services stopped!${NC}"

