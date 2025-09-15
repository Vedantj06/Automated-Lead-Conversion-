#!/bin/bash

# Marketing Hub Development Startup Script
echo "🚀 Starting Marketing Hub Development Environment..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 18+ first.${NC}"
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${YELLOW}⚠️ Not in project root. Looking for package.json...${NC}"
    if [ -d "../" ] && [ -f "../package.json" ]; then
        cd ../
        echo -e "${GREEN}✅ Found project root${NC}"
    else
        echo -e "${RED}❌ Could not find project root with package.json${NC}"
        exit 1
    fi
fi

echo -e "${BLUE}📦 Installing frontend dependencies...${NC}"
npm install

echo -e "${BLUE}📦 Installing backend dependencies...${NC}"
cd backend
npm install
cd ..

# Check if .env files exist
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️ Frontend .env file not found. Creating from template...${NC}"
    cp .env.example .env 2>/dev/null || echo "# Add your environment variables here" > .env
fi

if [ ! -f "backend/.env" ]; then
    echo -e "${YELLOW}⚠️ Backend .env file not found. Creating from template...${NC}"
    cp backend/.env.example backend/.env 2>/dev/null || echo "No backend .env.example found"
fi

echo -e "${GREEN}🎉 Setup complete! Starting development servers...${NC}"
echo -e "${BLUE}Frontend will be available at: http://localhost:5173${NC}"
echo -e "${BLUE}Backend will be available at: http://localhost:3001${NC}"
echo ""
echo -e "${YELLOW}📧 Don't forget to configure your email service in backend/.env!${NC}"
echo ""

# Start both servers using concurrently if available, otherwise use separate terminals
if command -v concurrently &> /dev/null; then
    echo -e "${GREEN}🚀 Starting both servers with concurrently...${NC}"
    npx concurrently "npm run dev" "cd backend && npm run dev" --names "frontend,backend" --prefix name --kill-others
else
    echo -e "${YELLOW}⚠️ 'concurrently' not found. Starting servers separately...${NC}"
    echo -e "${BLUE}Starting backend server...${NC}"
    cd backend
    npm run dev &
    BACKEND_PID=$!
    cd ..
    
    echo -e "${BLUE}Starting frontend server...${NC}"
    npm run dev &
    FRONTEND_PID=$!
    
    # Wait for user to stop servers
    echo -e "${GREEN}✅ Both servers started!${NC}"
    echo "Press Ctrl+C to stop all servers"
    
    # Cleanup function
    cleanup() {
        echo -e "\n${YELLOW}🛑 Stopping servers...${NC}"
        kill $BACKEND_PID 2>/dev/null
        kill $FRONTEND_PID 2>/dev/null
        exit 0
    }
    
    trap cleanup SIGINT
    wait
fi