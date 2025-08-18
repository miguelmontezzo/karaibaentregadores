import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Garantir idioma padrão do documento
document.documentElement.lang = 'pt-BR'

// Registrar o Service Worker para PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((error) => {
      console.error('Falha ao registrar o service worker:', error);
    });
  });
}

createRoot(document.getElementById('root')!).render(<App />);
