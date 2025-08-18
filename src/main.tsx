import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Limpeza completa de service workers e cache
async function clearServiceWorkers() {
  if ('serviceWorker' in navigator) {
    try {
      // Desregistrar todos os service workers
      const registrations = await navigator.serviceWorker.getRegistrations();
      console.log('Found service workers:', registrations.length);
      
      for (const registration of registrations) {
        console.log('Unregistering service worker:', registration);
        await registration.unregister();
      }
      
      // Limpar todos os caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        console.log('Found caches:', cacheNames);
        
        await Promise.all(
          cacheNames.map(cacheName => {
            console.log('Deleting cache:', cacheName);
            return caches.delete(cacheName);
          })
        );
      }
      
      console.log('Service workers and caches cleared successfully');
    } catch (error) {
      console.error('Error clearing service workers:', error);
    }
  }
}

// Executar limpeza antes de inicializar a aplicação
clearServiceWorkers().then(() => {
  // Registrar service worker vazio para substituir o problemático
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then(() => {
        console.log('Empty service worker registered successfully');
        // Desregistrar após alguns segundos
        setTimeout(() => {
          navigator.serviceWorker.getRegistrations().then(registrations => {
            registrations.forEach(registration => registration.unregister());
          });
        }, 2000);
      })
      .catch(error => console.log('Service worker registration failed:', error));
  }
});

createRoot(document.getElementById("root")!).render(<App />);
