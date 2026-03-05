/* ═══════════════════════════════════════════════════════
   PontoCerto — Service Worker
   ═══════════════════════════════════════════════════════ */

var CACHE_NAME = 'pontocerto-v2';
var URLS_TO_CACHE = [
    './',
    './index.html',
    './css/styles.css',
    './js/constants.js',
    './js/helpers.js',
    './js/components.js',
    './js/tabs.js',
    './js/app.js'
];

/* Instala e faz cache dos arquivos */
self.addEventListener('install', function (event) {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function (cache) { return cache.addAll(URLS_TO_CACHE); })
    );
});

/* Ativa e limpa caches antigos */
self.addEventListener('activate', function (event) {
    event.waitUntil(
        caches.keys().then(function (names) {
            return Promise.all(
                names.filter(function (n) { return n !== CACHE_NAME; })
                    .map(function (n) { return caches.delete(n); })
            );
        })
    );
});

/* Responde com cache-first, fallback para rede */
self.addEventListener('fetch', function (event) {
    event.respondWith(
        caches.match(event.request)
            .then(function (resp) { return resp || fetch(event.request); })
    );
});
