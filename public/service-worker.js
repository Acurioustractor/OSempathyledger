/**
 * Service Worker for Orange Sky Empathy Ledger
 * Implements offline caching and progressive loading
 */

const CACHE_NAME = 'empathy-ledger-v1';
const API_CACHE = 'empathy-ledger-api-v1';
const IMAGE_CACHE = 'empathy-ledger-images-v1';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/static/css/main.css',
  '/static/js/main.js',
];

// API endpoints to cache
const API_ROUTES = [
  '/api/stories',
  '/api/storytellers',
  '/api/themes',
  '/api/media',
  '/api/quotes',
];

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME && 
                cacheName !== API_CACHE && 
                cacheName !== IMAGE_CACHE) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle API requests
  if (url.pathname.startsWith('/api/') || url.hostname.includes('airtable.com')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Handle image requests
  if (request.destination === 'image' || 
      /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url.pathname)) {
    event.respondWith(handleImageRequest(request));
    return;
  }

  // Handle static assets
  event.respondWith(handleStaticRequest(request));
});

/**
 * Network-first strategy for API requests
 */
async function handleApiRequest(request) {
  const cache = await caches.open(API_CACHE);

  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    // Clone the response before caching
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Network request failed, checking cache:', error);
    
    // Fall back to cache
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      console.log('Serving from cache:', request.url);
      return cachedResponse;
    }
    
    // Return offline fallback
    return new Response(
      JSON.stringify({ 
        error: 'Offline', 
        message: 'This content is not available offline' 
      }), 
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

/**
 * Cache-first strategy for images
 */
async function handleImageRequest(request) {
  const cache = await caches.open(IMAGE_CACHE);
  
  // Check cache first
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    // Refresh cache in background
    fetchAndCache(request, cache);
    return cachedResponse;
  }
  
  // Not in cache, fetch from network
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Return placeholder image
    return new Response(null, { 
      status: 404, 
      statusText: 'Image not available offline' 
    });
  }
}

/**
 * Cache-first strategy for static assets
 */
async function handleStaticRequest(request) {
  const cache = await caches.open(CACHE_NAME);
  
  // Check cache first
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Not in cache, fetch from network
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      const offlineResponse = await cache.match('/index.html');
      if (offlineResponse) {
        return offlineResponse;
      }
    }
    
    return new Response('Offline', { 
      status: 503, 
      statusText: 'Service Unavailable' 
    });
  }
}

/**
 * Fetch and cache in background
 */
async function fetchAndCache(request, cache) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response);
    }
  } catch (error) {
    console.log('Background fetch failed:', error);
  }
}

// Listen for messages from the client
self.addEventListener('message', event => {
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys()
        .then(cacheNames => Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        ))
        .then(() => event.ports[0].postMessage({ success: true }))
    );
  }
  
  if (event.data.type === 'CACHE_URLS') {
    const urls = event.data.urls;
    event.waitUntil(
      caches.open(API_CACHE)
        .then(cache => cache.addAll(urls))
        .then(() => event.ports[0].postMessage({ success: true }))
        .catch(error => event.ports[0].postMessage({ success: false, error: error.message }))
    );
  }
});