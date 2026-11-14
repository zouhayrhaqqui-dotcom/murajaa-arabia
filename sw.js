// يسمح للتطبيق بالعمل بدون إنترنت.
// الاستراتيجية: الشبكة أولاً (لتصل التحديثات فوراً)، ثم الذاكرة المؤقتة عند انقطاع الإنترنت.
const CACHE = 'murajaa-v2';
const FILES = ['./', './index.html', './data.js', './data-takh.js', './data-didac.js', './data-tarbia.js',
               './manifest.json', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];
const FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  const sameOrigin = url.origin === location.origin;
  if (!sameOrigin && !FONT_HOSTS.includes(url.hostname)) return;

  e.respondWith(
    caches.open(CACHE).then(async cache => {
      const cached = await cache.match(e.request, {ignoreSearch: sameOrigin});
      if (cached && !sameOrigin) return cached;            // الخطوط: من الذاكرة
      try {
        const res = await fetch(e.request);                  // ملفات التطبيق: من الشبكة أولاً
        if (res.ok || res.type === 'opaque') cache.put(e.request, res.clone());
        return res;
      } catch (err) {
        return cached || Response.error();
      }
    })
  );
});
