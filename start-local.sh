#!/bin/bash

echo "🚀 Starting Orange Sky Empathy Ledger (Local Development)"
echo "======================================================="

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if nvm is installed
if [ -s "$HOME/.nvm/nvm.sh" ]; then
    source "$HOME/.nvm/nvm.sh"
    echo -e "${GREEN}✓ NVM detected${NC}"
    
    # Use Node version from .nvmrc
    nvm use
else
    echo -e "${YELLOW}⚠ NVM not found, using system Node${NC}"
fi

# Check Node version
NODE_VERSION=$(node -v)
echo -e "📦 Using Node ${NODE_VERSION}"

# Clean install if needed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📥 Installing dependencies...${NC}"
    npm install
fi

# Kill any process on port 5173
echo -e "${YELLOW}🔍 Checking for processes on port 5173...${NC}"
lsof -ti:5173 | xargs kill -9 2>/dev/null || true

# Start Vite with explicit port
echo -e "${GREEN}🎉 Starting development server...${NC}"
echo -e "${GREEN}📱 Access the app at: http://localhost:5173${NC}"
echo ""

# Run Vite directly with port configuration
npx vite --port 5173 --host localhost