const CACHE_NAME = 'workbench-v2';
const ASSETS = [
  '.',
  'index.html',
  'manifest.json',
  'icons/icon-192.png',
  'icons/icon-512.png'
];

// 安装：预缓存核心资源
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// 激活：清理旧缓存
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// 请求拦截：网络优先，缓存兜底（保证每次打开都是最新版本）
self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request)
      .then(response => {
        // 更新缓存
        const cloned = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, cloned));
        return response;
      })
      .catch(() => {
        // 网络不可用时降级到缓存
        return caches.match(e.request);
      })
  );
});
