// Service Worker vazio para substituir o cache problemático
console.log('Empty service worker loaded - clearing old cache');

// Desinstalar automaticamente
self.addEventListener('install', (event) => {
  console.log('Service worker installing - will skip waiting');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service worker activating - clearing all caches');
  
  event.waitUntil(
    Promise.all([
      // Limpar todos os caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }),
      // Assumir controle imediatamente
      self.clients.claim()
    ])
  );
});

// Removido o fetch handler para evitar warning