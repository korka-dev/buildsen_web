// Service worker minimal : rend l'application installable, sans mise en cache des pages (données toujours à jour)
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", () => {});
