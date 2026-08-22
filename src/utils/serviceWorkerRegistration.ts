export function registerServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Amcology ServiceWorker registered with scope:', registration.scope);
        })
        .catch((error) => {
          console.warn('Amcology ServiceWorker registration failed:', error);
        });
    });
  } else if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    // In development mode, register as well so testing offline caching works
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Amcology ServiceWorker (Dev) registered:', registration.scope);
        })
        .catch((e) => {
          console.log('SW registration in dev note:', e);
        });
    });
  }
}
