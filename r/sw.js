// Offline copy of the hosted viewer (/r/). The report is in the URL fragment, which never
// reaches the network, so one cached viewer serves every report. Install caches the page and,
// best effort, the photo decoder, so both the link and photo routes work offline afterwards.
const CACHE = "qr-viewer-v2";
const CORE = ["./", "./index.html"];
const PHOTO_READER = "./zxing_reader.wasm";
self.addEventListener("install", (e) => e.waitUntil(
  caches.open(CACHE)
    .then((c) => c.addAll(CORE).then(() => c.add(PHOTO_READER).catch(() => {}))) // photo reader is optional
    .then(() => self.skipWaiting()),
));
self.addEventListener("activate", (e) => e.waitUntil(
  caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()),
));
self.addEventListener("fetch", (e) => {
  if (e.request.mode === "navigate") {
    e.respondWith(caches.match("./index.html").then((hit) => hit || fetch(e.request)));
    return;
  }
  e.respondWith(caches.match(e.request).then((hit) => hit || fetch(e.request).then((res) => {
    if (res.ok && new URL(e.request.url).origin === location.origin) {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(e.request, copy));
    }
    return res;
  })));
});
