/**
 * Service worker de Camello.
 * Guarda la app en caché para que abra rápido y funcione sin conexión.
 * Al publicar cambios, sube el número de VERSION para que todos reciban la nueva.
 */
const VERSION = 'camello-v12';

const ARCHIVOS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/app.css',
  './css/motion.css',
  './icons/camello.svg',
  './icons/icono-192.png',
  './icons/icono-512.png',
  './js/main.js',
  './js/motion.js',
  './js/auth.js',
  './js/pedidos.js',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => Promise.all(ARCHIVOS.map((u) => c.add(new Request(u, { cache: 'reload' })).catch(() => {})))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((claves) => Promise.all(claves.filter((k) => k.startsWith('camello-') && k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/**
 * Primero la copia guardada: así la app abre al instante y, aunque millones de
 * personas la abran a la vez, cada teléfono solo descarga la app una vez.
 * Las actualizaciones llegan cuando cambia VERSION (el navegador revisa sw.js
 * cada vez que se abre la app; main.js recarga la página al activarse la nueva).
 */
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(
      (guardada) =>
        guardada ||
        fetch(e.request)
          .then((resp) => {
            if (resp.ok && resp.type === 'basic') {
              const copia = resp.clone();
              caches.open(VERSION).then((c) => c.put(e.request, copia));
            }
            return resp;
          })
          .catch(() => caches.match('./index.html'))
    )
  );
});
