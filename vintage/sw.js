/* Service Worker — Vintage Mission
   VERSION bei jedem Deployment erhöhen, damit installierte Apps das Update holen. */
var VERSION = 'v1';
var CACHE = 'vintage-mission-' + VERSION;
var ASSETS = [
  './',
  './index.html',
  './app.css',
  './data.js',
  './app.js',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(ASSETS); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; })
                             .map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('message', function (e) {
  if (e.data === 'SKIP_WAITING') self.skipWaiting();
});

/* Cache-first mit Hintergrund-Aktualisierung: sofort offline verfügbar,
   parallel wird der Cache aufgefrischt. */
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  var url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  var refresh = fetch(e.request).then(function (res) {
    if (res && res.ok) {
      var copy = res.clone();
      return caches.open(CACHE)
        .then(function (c) { return c.put(e.request, copy); })
        .then(function () { return res; });
    }
    return res;
  });
  e.waitUntil(refresh.catch(function () {}));
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(function (hit) {
      return hit || refresh;
    }).catch(function () { return refresh; })
  );
});
