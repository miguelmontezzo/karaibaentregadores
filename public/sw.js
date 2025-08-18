// Service Worker simples para PWA
const APP_VERSION = 'v1';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Sem estratégia de cache agressiva por enquanto; tráfego segue para a rede.