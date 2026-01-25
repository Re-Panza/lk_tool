const CACHE_NAME = 'lk-tools-v1';
// Elenca qui i file che vuoi che l'app ricordi sempre
const urlsToCache = [
  'index.html',
  'manifest.json',
  'icona.png',
  // Se le altre pagine sono nello stesso dominio, aggiungile qui sotto:
  // 'calcolo-partenze/index.html',
  // 'calcola_argento/index.html'
];

// Installazione: salva i file nella cache
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Gestione richieste: se sei offline, usa la cache
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Se trova il file in cache lo restituisce, altrimenti lo scarica dalla rete
        return response || fetch(event.request);
      })
  );
});
