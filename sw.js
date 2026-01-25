// 1. CAMBIA QUESTO NUMERO (es. v1.4, v1.5...) OGNI VOLTA CHE MODIFICHI IL SITO
const CACHE_NAME = 'lk-tools-universal-v1.3';

// 2. Installazione: forza l'attivazione immediata
self.addEventListener('install', event => {
  self.skipWaiting();
});

// 3. Pulizia: cancella automaticamente le vecchie versioni della cache
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Cache vecchia rimossa:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// 4. Gestione Intelligente: Rete con backup in Cache
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Se c'è rete, scarica il file e ne salva una copia aggiornata
        if (event.request.method === 'GET' && response.status === 200) {
          const resClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, resClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Se NON c'è rete (offline), prova a pescare il file dalla memoria
        return caches.match(event.request);
      })
  );
});
