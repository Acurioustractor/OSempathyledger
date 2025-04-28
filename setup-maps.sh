#!/bin/bash
# Setup script for Empathy Ledger map components

echo "Setting up map components..."

# Create required directories
mkdir -p src/components/maps/hooks
mkdir -p src/components/maps/components
mkdir -p src/components/maps/utils

# Install dependencies
echo "Installing required dependencies..."
npm install @googlemaps/markerclusterer
npm install --save-dev @types/google.maps

# Set up environment variable
if [ ! -f .env ]; then
    echo "Creating .env file with placeholder Google Maps API key..."
    echo "VITE_GOOGLE_MAPS_API_KEY=YOUR_API_KEY_HERE" > .env
    echo "Please replace YOUR_API_KEY_HERE with your actual Google Maps API key."
else
    if ! grep -q "VITE_GOOGLE_MAPS_API_KEY" .env; then
        echo "Adding Google Maps API key placeholder to existing .env file..."
        echo "VITE_GOOGLE_MAPS_API_KEY=YOUR_API_KEY_HERE" >> .env
        echo "Please replace YOUR_API_KEY_HERE with your actual Google Maps API key."
    fi
fi

echo ""
echo "Setup complete! To get started with the map components:"
echo "1. Replace the API key in .env with your actual Google Maps API key"
echo "2. Visit http://localhost:3000/map-examples to see the example page"
echo "3. Read the documentation in src/components/maps/README.md"
echo ""
echo "Happy mapping!" 