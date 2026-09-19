import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register PWA service worker with auto-update safely
let updateSW: ((reloadPage?: boolean) => Promise<void>) | undefined;
try {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    updateSW = registerSW({
      onNeedRefresh() {
        console.log('[DEVIL PWA] New content available, refreshing...');
        if (typeof updateSW === 'function') {
          updateSW(true);
        }
      },
      onOfflineReady() {
        console.log('[DEVIL PWA] Offline service worker ready: core functionality cached.');
      },
    });
  }
} catch (err) {
  console.warn('[DEVIL PWA] Service worker registration deferred or unavailable:', err);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
