/* SafeTrack Pro service worker: lets the installed app open without signal.
   Only the app's own files are stored. API answers (your data) are never stored here.
   To switch it off everywhere: replace this file with one that calls self.registration.unregister(). */
const VERSION = 'st-shell-v1';
const SHELL = '/app.html';

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(VERSION);
    await cache.add(new Request(SHELL, { cache: 'reload' }));
    try {                                                  // the current build's main script and styles
      const res = await fetch('/asset-manifest.json', { cache: 'no-store' });
      const files = Object.values((await res.json()).files || {})
        .filter((f) => typeof f === 'string' && /^\/static\/(js|css)\/main\.[\w]+\.(js|css)$/.test(f));
      await cache.addAll(files);
    } catch (e) { /* the shell alone still works; scripts are stored on first use */ }
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== VERSION) await caches.delete(k);
    await self.clients.claim();
  })());
});

const fromCache = async (req) => (await caches.open(VERSION)).match(req);
const store = async (req, res) => {
  if (res && res.ok && res.type === 'basic') {
    try { await (await caches.open(VERSION)).put(req, res.clone()); } catch (e) { /* storage full */ }
  }
  return res;
};

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return;

  if (req.mode === 'navigate') {
    // pages: always the network first (new versions and the public pages), the stored app when offline
    event.respondWith((async () => {
      try {
        const res = await fetch(req);
        return res;
      } catch (e) {
        return (await fromCache(SHELL)) || new Response('<h1>No signal</h1><p>Open SafeTrack Pro once with signal first.</p>', { status: 503, headers: { 'Content-Type': 'text/html' } });
      }
    })());
    return;
  }

  if (url.pathname.startsWith('/static/')) {
    // file names change with every build, so a stored copy is never out of date
    event.respondWith((async () => (await fromCache(req)) || store(req, await fetch(req)))());
    return;
  }

  if (/\.(png|ico|svg|webmanifest|json|woff2?)$/.test(url.pathname) && !url.pathname.endsWith('asset-manifest.json')) {
    event.respondWith((async () => {
      try { return await store(req, await fetch(req)); } catch (e) { return (await fromCache(req)) || Response.error(); }
    })());
  }
});
