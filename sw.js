const CACHE_NAME = 'rata-alada-cache-v3'; // Incrementado para forzar la actualización
const urlsToCache = [
  '/',
  '/index.html',
  '/info.html', // Nueva página de información
  '/styles.css',
  '/manifest.json',
  '/dist/main.js', // Archivo JS compilado
  '/images/apple-touch-icon.png',
  '/images/favicon-16x16.png',
  '/images/favicon-32x32.png',
  '/images/icon_1024x1024.png',
  '/images/icon_128x128.png',
  '/images/icon_144x144.png',
  '/images/icon_152x152.png',
  '/images/icon_16x16.png',
  '/images/icon_180x180.png',
  '/images/icon_192x192.png',
  '/images/icon_256x256.png',
  '/images/icon_32x32.png',
  '/images/icon_384x384.png',
  '/images/icon_48x48.png',
  '/images/icon_512x512.png',
  '/images/icon_512x512999.png',
  '/images/icon_72x72.png',
  '/images/icon_96x96.png',
  '/favicon.ico',
  '/images/listoi.ico'
];

// Evento de instalación: se dispara cuando el SW se instala.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache abierto');
        return cache.addAll(urlsToCache);
      })
  );
});

// Evento de activación: se dispara cuando el SW se activa.
// Aquí limpiamos las cachés antiguas.
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Eliminando caché antigua:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Evento fetch: se dispara cada vez que la página pide un recurso.
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Si el recurso está en la caché, lo devolvemos desde ahí.
        if (response) {
          return response;
        }
        // Si no, lo pedimos a la red.
        return fetch(event.request);
      }
    )
  );
});
