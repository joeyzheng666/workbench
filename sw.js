const CACHE_NAME = 'workbench-v4';
const ASSETS = [
  '.',
  'index.html',
  'manifest.json',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/apple-touch-icon.png',
  'icons/favicon-32.png',
  'icons/favicon-16.png'
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

// 请求拦截：网络优先，缓存兜底。跳过 API 请求
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // 不缓存 GitHub API 请求
  if (url.hostname === 'api.github.com') {
    return;
  }

  e.respondWith(
    fetch(e.request)
      .then(response => {
        const cloned = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, cloned));
        return response;
      })
      .catch(() => {
        return caches.match(e.request);
      })
  );
});
