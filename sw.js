/* NutriGuide — service worker : application utilisable hors ligne.
   Tous les fichiers de l'app sont mis en cache d'un bloc, par version :
   l'app s'ouvre instantanément, même sans réseau, et jamais avec un mélange
   d'ancienne et de nouvelle version. Quand ce fichier change sur le serveur,
   le navigateur installe la nouvelle version en arrière-plan et l'app propose
   « Mettre à jour ».
   ⚠️ Incrémenter VERSION à chaque modification des fichiers. */
const VERSION = "nutriguide-v10";
const ASSETS = [
  "./",
  "./index.html",
  "./css/style.css",
  "./js/data.js",
  "./js/plats.js",
  "./js/ciqual.js",
  "./js/app.js",
  "./js/suivi.js",
  "./js/mobile.js",
  "./js/scan.js",
  "./js/recettes.js",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
  "./icons/apple-touch-icon.png",
  "./icons/favicon-32.png"
];

self.addEventListener("install", (event) => {
  // cache: "reload" : contourne le cache HTTP pour récupérer les vrais fichiers à jour
  event.waitUntil(caches.open(VERSION).then(c => c.addAll(ASSETS.map(u => new Request(u, { cache: "reload" })))));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// La page demande l'activation immédiate quand l'utilisateur accepte la mise à jour
self.addEventListener("message", (event) => {
  if (event.data === "skipWaiting") self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith((async () => {
    const cache = await caches.open(VERSION);
    // Ouverture de l'app (avec ou sans ?page=…) : la page en cache
    if (req.mode === "navigate") {
      const page = await cache.match("./index.html");
      if (page) return page;
    }
    const cached = await cache.match(req, { ignoreSearch: true });
    if (cached) return cached;
    try {
      const res = await fetch(req);
      // Lecteur de codes-barres (chargé seulement sur les téléphones sans lecteur natif) :
      // gardé en cache après le premier usage pour fonctionner hors ligne
      if (res.ok && url.pathname.includes("/js/vendor/")) cache.put(req, res.clone());
      return res;
    } catch {
      return req.mode === "navigate" ? (await cache.match("./index.html")) : Response.error();
    }
  })());
});
