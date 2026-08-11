// MATRIX PWA Service Worker
// Strategy: Network-first for everything. Cache only static assets (JS/CSS/images/fonts).
// NEVER cache API requests or data — always pass through to the server.

const CACHE_VERSION = 'matrix-v3';
const STATIC_CACHE = `${CACHE_VERSION}-static`;

// Only cache requests for static assets from same-origin
const STATIC_ASSET_PATTERNS = [
  /\.(?:js|jsx|ts|tsx|css|png|jpg|jpeg|gif|webp|svg|ico|woff|woff2|ttf|eot|mp4|webm|mp3)$/,
];

// NEVER intercept these — always go to network
const NEVER_CACHE_PATTERNS = [
  /\/api\//,
  /\/auth\//,
  /base44\./,
  /googleapis\.com/,
  /base44\.com/,
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll([
      '/',
      '/index.html',
    ]).catch(() => {}))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => !key.startsWith(CACHE_VERSION))
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle GET requests
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // NEVER cache API/auth/data requests — always pass through to server
  if (NEVER_CACHE_PATTERNS.some((pattern) => pattern.test(url.href))) {
    return; // Let the browser handle it normally (no cache)
  }

  // For navigation requests: network-first, fall back to cached index.html
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(STATIC_CACHE).then((cache) => cache.put(request, copy)).catch(() => {});
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match('/index.html')))
    );
    return;
  }

  // For static assets: cache-first, then network
  if (STATIC_ASSET_PATTERNS.some((pattern) => pattern.test(url.href))) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, copy)).catch(() => {});
          }
          return response;
        });
      })
    );
    return;
  }

  // For everything else: network-first, no caching of responses
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});

// Handle messages from the client (e.g., force update)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
