self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('image-viewer-cache').then(cache => {
      return cache.addAll([
        '/',
        '/index.html',
        '/styles.css',
        '/viewer.js',
        '/manifest.json',
        '/icon.png',
        // Añade aquí otros archivos que necesites cachear
      ]);
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
