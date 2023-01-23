const CACHE_NAME = "version-1";
const urlsToCache = ["index.html", "offline.html"];

this.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("cache opened");
        return cache.addAll(urlsToCache);
      })
      .catch((err) => {
        console.log(err);
      })
  );
});

this.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return fetch(event.request).catch(() => caches.match("offline.html"));
    })
  );
});

this.addEventListener("activate", (event) => {
  const whiteList = [];
  whiteList.push(CACHE_NAME);
  event.waitUntil(
    caches.keys().then((cachesName) => {
      Promise.all(
        cachesName.map((cacheName) => {
          if (!whiteList.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
