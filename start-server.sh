#!/bin/bash
cd "$(dirname "$0")"
echo "🚀 Starting Orange Sky Server..."
echo "📁 Serving from: $(pwd)/dist"
echo "🌐 URL: http://localhost:8888"
echo ""
echo "Press Ctrl+C to stop"
cd dist && python3 -m http.server 8888