#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🐳 Employee Platform - Development Environment${NC}"
echo -e "${BLUE}================================================${NC}\n"

# Stop any running containers using stop.sh
echo -e "${YELLOW}Stopping existing containers...${NC}"
./stop.sh

# Rebuild everything from scratch
echo -e "\n${YELLOW}Rebuilding all containers (this may take a few minutes)...${NC}"
docker-compose -f docker-compose.dev.yml build --no-cache

# Start the services
echo -e "\n${GREEN}Starting services...${NC}"
docker-compose -f docker-compose.dev.yml up -d

# Show status
echo -e "\n${GREEN}✅ Services started!${NC}\n"
echo -e "${BLUE}🌐 Frontend:${NC} http://localhost:3000"
echo -e "${BLUE}🚀 Backend:${NC}  http://localhost:8080/api"
echo -e "${BLUE}💾 H2 Console:${NC} http://localhost:8080/h2-console\n"

echo -e "${YELLOW}Test Accounts:${NC}"
echo -e "  Manager:  manager / password123"
echo -e "  Employee: employee / password123"
echo -e "  Coworker: coworker / password123\n"

# Follow logs
echo -e "${YELLOW}Following logs (Ctrl+C to stop watching logs, services will keep running)...${NC}\n"
docker-compose -f docker-compose.dev.yml logs -f

