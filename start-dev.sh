#!/bin/bash

echo "🚀 Starting Orange Sky Empathy Ledger Development Server"
echo "================================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker Desktop from https://www.docker.com/products/docker-desktop"
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "❌ Docker is not running. Please start Docker Desktop."
    exit 1
fi

echo "✅ Docker is ready"
echo ""
echo "🔨 Building and starting the development container..."
echo ""

# Build and start the container
docker-compose up --build

# Alternative: Run without Docker (fallback)
# echo "Running without Docker..."
# npm install && npm run dev:vite