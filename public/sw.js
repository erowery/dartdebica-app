// Minimalny service worker - jego jedyny cel to spełnienie wymogów "instalowalności" PWA
// w przeglądarkach takich jak Chrome/Brave/Edge. Celowo NIE cache'uje danych z API,
// żeby apka zawsze pokazywała świeże wyniki i tabele (a nie stare, zapisane w cache).

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Przepuszczamy każde zapytanie bez modyfikacji - brak cache'owania danych live.
self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
