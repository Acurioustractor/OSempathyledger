#!/bin/bash
# Orange Sky Development Server - The one that ALWAYS works!

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Kill any existing Python servers
echo -e "${YELLOW}🔄 Stopping any existing servers...${NC}"
pkill -f "python3 -m http.server" 2>/dev/null

# Change to script directory
cd "$(dirname "$0")"

# Build the project with optimizations
echo -e "${BLUE}🔨 Building project with optimizations...${NC}"

# Clear old builds
rm -rf dist

# Build with production optimizations
NODE_ENV=production npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi

# Show build stats
echo -e "${GREEN}📊 Build Statistics:${NC}"
du -sh dist/assets/*.js 2>/dev/null | sort -hr | head -5 || echo "No JS files found"

# Start the server
echo -e "${GREEN}✅ Starting development server...${NC}"
echo -e "${GREEN}📁 Serving from: $(pwd)/dist${NC}"
echo -e "${GREEN}🌐 Access at: http://127.0.0.1:7777${NC}"
echo ""
echo -e "${YELLOW}To rebuild after changes: Run 'npm run build' in another terminal${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop${NC}"
echo ""

# Start Python server on port 7777
cd dist && python3 -m http.server 7777 --bind 127.0.0.1