self.addEventListener('fetch', function(event) {
  // Questo serve a far credere al browser che l'app funzioni offline
  event.respondWith(fetch(event.request));
});