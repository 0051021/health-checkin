/* 塑形打卡 Service Worker —— 离线缓存，让添加到主屏幕后断网也能打开 */
const CACHE = 'health-pwa-v3';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/app.css',
  './js/store.js',
  './js/lib.js',
  './js/anatomy.js',
  './js/app.js',
  './js/pages.js',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// 安装：预缓存全部静态资源
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

// 激活：清理旧版本缓存
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// 请求：缓存优先，找不到再走网络并回填（适合本地工具类静态应用）
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then((hit) => {
      if (hit) return hit;
      return fetch(e.request).then((res) => {
        if (res && res.status === 200) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
        }
        return res;
      }).catch(() => caches.match('./index.html'));
    })
  );
});
