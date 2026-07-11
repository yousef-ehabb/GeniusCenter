import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

if ('serviceWorker' in navigator) {
  if (import.meta.env.DEV) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister().then((success) => {
          if (success) {
            console.log('Unregistered active service worker for development');
            // Clear caches and reload
            caches.keys().then((names) => {
              for (const name of names) caches.delete(name);
            }).then(() => {
              window.location.reload();
            });
          }
        });
      }
    });
  } else {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(console.error);
    });
  }
}
