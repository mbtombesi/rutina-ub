// Guarda la app para que abra sin internet. Cambiá VERSION cuando actualices la rutina.
const VERSION = "rutina-ub-v1";
const FILES = ["./", "index.html", "manifest.json", "icon-192.png", "icon-512.png", "icon-180.png", "icon-maskable.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// Primero intenta la red (para recibir rutinas nuevas); sin conexión usa lo guardado.
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request).then(r => {
      if (r.ok && (r.type === "basic" || r.type === "cors")) {
        const copy = r.clone(); caches.open(VERSION).then(c => c.put(e.request, copy));
      }
      return r;
    }).catch(() => caches.match(e.request).then(m => m || caches.match("index.html")))
  );
});
