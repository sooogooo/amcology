import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerServiceWorker } from './utils/serviceWorkerRegistration';
import { performanceMonitor } from './utils/performanceMonitor';

// Initialize performance monitoring for FCP, LCP, resource timing, and interaction telemetry
performanceMonitor.init();

// Register Service Worker for offline monograph reading and asset caching
registerServiceWorker();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

