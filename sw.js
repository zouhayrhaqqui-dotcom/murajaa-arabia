// يسمح للتطبيق بالعمل بدون إنترنت.
// غيّر رقم النسخة عند تعديل الملفات (مثلاً عند إضافة أسئلة) لتصل التحديثات بسرعة.
const CACHE = 'murajaa-v1';
const FILES = ['./', './index.html', './data.js', './manifest.json', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];
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
      // الخطوط: من الذاكرة أولاً. ملفات التطبيق: من الذاكرة فوراً مع تحديث في الخلفية.
      if (cached && !sameOrigin) return cached;
      const network = fetch(e.request)
        .then(res => { if (res.ok || res.type === 'opaque') cache.put(e.request, res.clone()); return res; })
        .catch(() => cached);
      return cached || network;
    })
  );
});
