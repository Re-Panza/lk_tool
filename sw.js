const CACHE_VERSION = 'v3.8';
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const PAGES_CACHE = `pages-${CACHE_VERSION}`;

// Usiamo percorsi relativi per evitare errori su GitHub Pages
const OFFLINE_URLS = [
  'index.html',
  './'
];

// Installa il Service Worker e salva i file base
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(PAGES_CACHE).then(cache => {
      return cache.addAll(OFFLINE_URLS);
    })
  );
});

// Attiva e pulisce le vecchie cache
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => !k.includes(CACHE_VERSION)).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// Gestisce le richieste (Offline Mode)
self.addEventListener('fetch', event => {
  const req = event.request;
  
  // Per le pagine HTML: prova il network, se fallisce usa la cache
  if (req.mode === 'navigate' || req.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(req)
        .then(res => {
          const copy = res.clone();
          caches.open(PAGES_CACHE).then(cache => cache.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req))
    );
  }
});
