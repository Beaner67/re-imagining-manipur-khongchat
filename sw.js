/* Offline cache: everything the app needs is precached, so a saved trip opens with no signal. */
const CACHE = "khongchat-v7";
const ASSETS = [
  "./", "index.html", "css/style.css", "js/data.js", "js/store.js", "js/qrcode.js", "js/app.js",
  "img/loktak-hero.webp", "img/loktak-foreground.webp", "img/icon.svg", "manifest.webmanifest",
  "fonts/fraunces-latin-600-normal.woff2", "fonts/fraunces-latin-700-normal.woff2", "fonts/fraunces-latin-600-italic.woff2",
  "fonts/ibm-plex-sans-latin-400-normal.woff2", "fonts/ibm-plex-sans-latin-500-normal.woff2", "fonts/ibm-plex-sans-latin-600-normal.woff2"
];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(hit => {
      const net = fetch(e.request).then(res => {
        if (res.ok && new URL(e.request.url).origin === location.origin) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
        return res;
      }).catch(() => hit || caches.match("index.html"));
      return hit || net;
    })
  );
});
