// Offline copy of the link-route viewer (/r/). Cache-first; the report itself is in the
// URL fragment, which never reaches the network, so one cached page serves every report.
const CACHE = "qr-viewer-v1";
const FILES = ["./", "./index.html"];
self.addEventListener("install", (e) => e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting())));
self.addEventListener("activate", (e) => e.waitUntil(
  caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()),
));
self.addEventListener("fetch", (e) => {
  if (e.request.mode === "navigate") {
    e.respondWith(caches.match("./index.html").then((hit) => hit || fetch(e.request)));
    return;
  }
  e.respondWith(caches.match(e.request).then((hit) => hit || fetch(e.request)));
});
