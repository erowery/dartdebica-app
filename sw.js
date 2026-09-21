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

// Odbiór powiadomienia push i wyświetlenie go na telefonie
self.addEventListener('push', (event) => {
  let data = { title: 'Dart Dębica', body: 'Masz nowe powiadomienie', url: '/' };
  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch {
    // brak/zły format danych - zostają wartości domyślne
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      data: { url: data.url },
    })
  );
});

// Kliknięcie w powiadomienie - otwiera lub przenosi do apki
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientsList) => {
      for (const client of clientsList) {
        if ('focus' in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(targetUrl);
    })
  );
});
