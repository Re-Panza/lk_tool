const CACHE_VERSION = 'v3.4';
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const PAGES_CACHE = `pages-${CACHE_VERSION}`;

const OFFLINE_URLS = [
  '/',
  '/index.html'
];

// Attiva subito il nuovo SW
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(PAGES_CACHE).then(cache => cache.addAll(OFFLINE_URLS))
  );
});

// Prende subito controllo delle pagine
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => !k.includes(CACHE_VERSION)).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);

  // ❌ Non cache manifest e icone PWA
  if (
    url.pathname.endsWith('/manifest.json') ||
    url.pathname.endsWith('/icona.png') ||
    url.pathname.endsWith('/pwa-icon-192.png') ||
    url.pathname.endsWith('/pwa-icon-512.png')
  ) {
    return;
  }

  // 📄 HTML / pagine → network first
  if (req.mode === 'navigate' || req.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(req)
        .then(res => {
          const copy = res.clone();
          caches.open(PAGES_CACHE).then(cache => cache.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then(r => r || caches.match('/index.html')))
    );
    return;
  }

  // 📦 Asset statici → cache first + update in background
  event.respondWith(
    caches.match(req).then(cached => {
      const fetchPromise = fetch(req).then(res => {
        if (res && res.status === 200) {
          const copy = res.clone();
          caches.open(STATIC_CACHE).then(cache => cache.put(req, copy));
        }
        return res;
      }).catch(() => cached);

      return cached || fetchPromise;
    })
  );
});









