const CACHE_NAME = 'agenda-familia-reis-v2-2';
const FILES = [
  './', './index.html', './css/style.css', './js/app.js', './manifest.json',
  './img/edi-camila.jpeg', './img/icon-192.png', './img/icon-512.png'
];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(FILES)));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))));
});
self.addEventListener('fetch', event => {
  event.respondWith(caches.match(event.request).then(response => response || fetch(event.request)));
});
