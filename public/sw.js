const VERSION = "v2";
const SHELL_CACHE = `os-mamutes-shell-${VERSION}`;
const ASSET_CACHE = `os-mamutes-assets-${VERSION}`;
const PAGE_CACHE = `os-mamutes-pages-${VERSION}`;
const OWN_CACHES = [SHELL_CACHE, ASSET_CACHE, PAGE_CACHE];
const APP_SHELL = [
  "/",
  "/manifest.webmanifest",
  "/favicon.png",
  "/apple-touch-icon-v2.png",
  "/icon-192-v2.png",
  "/icon-512-v2.png",
  "/mamutes-logo-transparent-256.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const shell = await caches.open(SHELL_CACHE);
      await Promise.all(
        APP_SHELL.map(async (url) => {
          try {
            const response = await fetch(url, { cache: "reload" });
            if (response.ok) await shell.put(url, response);
          } catch {
            // A failed optional file must not prevent the rest of the app shell caching.
          }
        }),
      );

      const document = await shell.match("/");
      if (document) {
        const html = await document.text();
        const assetUrls = new Set();
        for (const match of html.matchAll(
          /<(?:script|link)\b[^>]*(?:src|href)=["']([^"']+)["'][^>]*>/gi,
        )) {
          try {
            const assetUrl = new URL(match[1], self.location.origin);
            if (
              assetUrl.origin === self.location.origin &&
              /\.(?:js|css)(?:$|\?)/i.test(assetUrl.href)
            ) {
              assetUrls.add(assetUrl.href);
            }
          } catch {
            // Ignore malformed resource URLs in server-rendered markup.
          }
        }
        const assets = await caches.open(ASSET_CACHE);
        await Promise.all(
          [...assetUrls].map(async (url) => {
            try {
              const response = await fetch(url, { cache: "reload" });
              if (response.ok) await assets.put(url, response);
            } catch {
              // Resources are also cached as they are requested during normal use.
            }
          }),
        );
      }
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key.startsWith("os-mamutes-") && !OWN_CACHES.includes(key))
          .map((key) => caches.delete(key)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  const isGoogleFont =
    ["fonts.googleapis.com", "fonts.gstatic.com"].includes(url.hostname) &&
    ["style", "font"].includes(request.destination);
  if (url.origin !== self.location.origin && !isGoogleFont) return;

  if (url.origin === self.location.origin && request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(request);
          if (response.ok) {
            const pages = await caches.open(PAGE_CACHE);
            await pages.put(request, response.clone());
          }
          return response;
        } catch {
          const pages = await caches.open(PAGE_CACHE);
          return (
            (await pages.match(request)) ||
            (await pages.match(url.pathname)) ||
            (await (await caches.open(SHELL_CACHE)).match("/")) ||
            new Response(
              "<h1>Você está offline</h1><p>Abra o app conectado uma vez para preparar os arquivos neste aparelho.</p>",
              {
                status: 503,
                headers: { "Content-Type": "text/html; charset=utf-8" },
              },
            )
          );
        }
      })(),
    );
    return;
  }

  const isAppAsset =
    isGoogleFont ||
    (url.origin === self.location.origin &&
      (["script", "style", "font", "image"].includes(request.destination) ||
        url.pathname.startsWith("/assets/") ||
        /\.(?:js|css|woff2?|png|svg|ico|webmanifest)$/i.test(url.pathname)));
  if (!isAppAsset) return;

  event.respondWith(
    (async () => {
      const cache = await caches.open(ASSET_CACHE);
      const cached = await cache.match(request);
      if (cached) return cached;
      try {
        const response = await fetch(request);
        if (response.ok || response.type === "opaque") await cache.put(request, response.clone());
        return response;
      } catch {
        return new Response("Recurso ainda não disponível offline.", { status: 503 });
      }
    })(),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    (async () => {
      const all = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      if (all[0]) return all[0].focus();
      return self.clients.openWindow("/tempo-com-deus");
    })(),
  );
});
