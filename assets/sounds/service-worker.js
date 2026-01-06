/* Boteco do Belém - Service Worker */
const CACHE_VERSION = 'boteco-pwa-v1';
const STATIC_CACHE = CACHE_VERSION + '-static';
const RUNTIME_CACHE = CACHE_VERSION + '-runtime';

const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.webmanifest',
  '/pwa.js',
  '/assets/style.css',
  '/assets/app.js',
  '/assets/data/products.default.json',
  '/assets/icons/icon-192.png',
  '/assets/icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(k => {
        if (k.startsWith('boteco-pwa-') && k !== STATIC_CACHE && k !== RUNTIME_CACHE) {
          return caches.delete(k);
        }
      })
    )).then(() => self.clients.claim())
  );
});

function isNavigationRequest(request){
  return request.mode === 'navigate' || (request.headers.get('accept') || '').includes('text/html');
}

async function cacheFirst(request){
  const cached = await caches.match(request);
  if (cached) return cached;
  const res = await fetch(request);
  const cache = await caches.open(RUNTIME_CACHE);
  cache.put(request, res.clone());
  return res;
}

async function networkFirst(request){
  try{
    const res = await fetch(request);
    const cache = await caches.open(RUNTIME_CACHE);
    cache.put(request, res.clone());
    return res;
  }catch(e){
    const cached = await caches.match(request);
    if (cached) return cached;
    throw e;
  }
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  if (isNavigationRequest(req)) {
    event.respondWith(
      (async () => {
        try{ return await networkFirst(req); }
        catch(e){ return caches.match('/offline.html'); }
      })()
    );
    return;
  }

  if (url.pathname.endsWith('/assets/data/products.default.json')) {
    event.respondWith(networkFirst(req));
    return;
  }

  if (url.pathname.startsWith('/assets/') || url.pathname === '/manifest.webmanifest' || url.pathname === '/pwa.js') {
    event.respondWith(cacheFirst(req));
    return;
  }
});
