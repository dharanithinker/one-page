const APP_CACHE = "maayai-app-v2";
const IMAGE_CACHE = "maayai-images-v2";
const BLOB_MEDIA_ORIGIN = "https://maayaistorage.blob.core.windows.net";
const BLOB_MEDIA_PATH = "/web-images/ai_maayai_webpage/";

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
  "./js/media-config.js",
  "./js/gallery-carousel.js",
  "./js/jquery-3.6.0.min.js",
  "./js/jquery.smartmenus.min.js",
  "./js/aos.js",
  "./js/swiper-bundle.min.js",
  "./js/isotope.js",
  "./js/imagesloaded.pkgd.min.js",
  "./js/lightgallery-all.min.js",
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
  if (isCacheable(networkResponse)) {
    cache.put(request, networkResponse.clone());
  }
  return networkResponse;
}

function isCacheable(response) {
  return response && (response.ok || response.type === "opaque");
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  const networkResponsePromise = fetch(request).then((networkResponse) => {
    if (isCacheable(networkResponse)) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => cachedResponse);

  return cachedResponse || networkResponsePromise;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);
  const sameOrigin = url.origin === self.location.origin;
  const isBlobMedia = url.origin === BLOB_MEDIA_ORIGIN
    && url.pathname.startsWith(BLOB_MEDIA_PATH);

  if (isBlobMedia) {
    if (request.destination === "image") {
      event.respondWith(staleWhileRevalidate(request, IMAGE_CACHE));
    }
    return;
  }

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
