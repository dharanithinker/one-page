const APP_CACHE = "maayai-app-v1";
const IMAGE_CACHE = "maayai-images-v1";

const CORE_ASSETS = [
  "./",
  "./index.html",
  "./niaa.html",
  "./gallery.html",
  "./contact.html",
  "./css/style.css",
  "./css/custom.css",
  "./css/responsive.css",
  "./css/plugin.css",
  "./css/font.css",
  "./css/niaa.css",
  "./css/gallery.css",
  "./js/main.js",
  "./js/jquery-3.6.0.min.js",
  "./js/jquery.smartmenus.min.js",
  "./js/aos.js",
  "./js/swiper-bundle.min.js",
  "./js/isotope.js",
  "./js/imagesloaded.pkgd.min.js",
  "./js/lightgallery-all.min.js",
  "./img/logo_ai_maayai.png",
  "./img/logo_niaa.png",
  "./img/home.jpeg",
  "./img/get_in_touch.jpeg",
  "./img/niaa.png",
  "./img/presence.png",
  "./img/loading.gif",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(APP_CACHE).then((cache) => cache.addAll(CORE_ASSETS)).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== APP_CACHE && key !== IMAGE_CACHE)
          .map((key) => caches.delete(key)),
      ),
    ).then(() => self.clients.claim()),
  );
});

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  const networkResponse = await fetch(request);
  if (networkResponse && networkResponse.ok) {
    cache.put(request, networkResponse.clone());
  }
  return networkResponse;
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  const networkResponsePromise = fetch(request).then((networkResponse) => {
    if (networkResponse && networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  });

  return cachedResponse || networkResponsePromise;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);
  const sameOrigin = url.origin === self.location.origin;

  if (!sameOrigin) {
    return;
  }

  if (request.destination === "image" || url.pathname.startsWith("/img/")) {
    event.respondWith(cacheFirst(request, IMAGE_CACHE));
    return;
  }

  if (request.destination === "style" || request.destination === "script" || request.destination === "font") {
    event.respondWith(staleWhileRevalidate(request, APP_CACHE));
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(APP_CACHE).then((cache) => cache.put(request, responseClone));
          return response;
        })
        .catch(async () => {
          const cache = await caches.open(APP_CACHE);
          return cache.match(request) || cache.match("./index.html");
        }),
    );
  }
});
