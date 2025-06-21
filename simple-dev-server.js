#!/usr/bin/env node
import { createServer } from 'http';
import { readFileSync, existsSync } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = 4444;
const DIST_DIR = join(__dirname, 'dist');

// MIME types
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = createServer((req, res) => {
  let filePath = join(DIST_DIR, req.url === '/' ? 'index.html' : req.url);
  
  // Handle SPA routing - if file doesn't exist, serve index.html
  if (!existsSync(filePath)) {
    filePath = join(DIST_DIR, 'index.html');
  }
  
  try {
    const content = readFileSync(filePath);
    const ext = extname(filePath);
    const contentType = mimeTypes[ext] || 'text/plain';
    
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  } catch (error) {
    res.writeHead(404);
    res.end('File not found');
  }
});

server.listen(PORT, 'localhost', () => {
  console.log(`
✅ Server running at: http://localhost:${PORT}
📁 Serving: ${DIST_DIR}

To use:
1. Run 'npm run build' in another terminal
2. Open http://localhost:${PORT}
3. Refresh after rebuilding

Press Ctrl+C to stop
`);
});