/* eslint-disable no-restricted-globals */

// 캐시 버전
const CACHE_NAME = 'woodal-budget-v1';
const RUNTIME_CACHE = 'woodal-runtime-v1';

// 오프라인 시 캐시할 파일들
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/static/js/main.chunk.js',
  '/static/js/bundle.js',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png'
];

// Service Worker 설치
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Precaching app shell');
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => self.skipWaiting())
      .catch((error) => {
        console.error('[Service Worker] Precaching failed:', error);
      })
  );
});

// Service Worker 활성화
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch 이벤트 - 네트워크 우선, 실패 시 캐시
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Firebase 요청은 항상 네트워크 사용
  if (url.hostname.includes('firebase') || url.hostname.includes('googleapis')) {
    event.respondWith(fetch(request));
    return;
  }

  // Chrome extension requests
  if (url.protocol === 'chrome-extension:') {
    return;
  }

  // API 요청이 아닌 경우 (HTML, JS, CSS, 이미지 등)
  if (request.method === 'GET' && !url.pathname.startsWith('/api')) {
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          // 캐시가 있으면 캐시 반환하면서 백그라운드에서 네트워크 요청
          if (cachedResponse) {
            // 백그라운드에서 최신 버전 가져오기
            fetch(request).then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                caches.open(RUNTIME_CACHE).then((cache) => {
                  cache.put(request, networkResponse.clone());
                });
              }
            }).catch(() => {
              // 네트워크 실패는 무시 (이미 캐시 반환됨)
            });

            return cachedResponse;
          }

          // 캐시가 없으면 네트워크 요청
          return fetch(request)
            .then((networkResponse) => {
              // 유효한 응답이면 캐시에 저장
              if (networkResponse && networkResponse.status === 200) {
                const responseToCache = networkResponse.clone();
                caches.open(RUNTIME_CACHE).then((cache) => {
                  cache.put(request, responseToCache);
                });
              }
              return networkResponse;
            })
            .catch(() => {
              // 오프라인이고 캐시도 없으면 기본 오프라인 페이지
              if (request.destination === 'document') {
                return caches.match('/index.html');
              }
            });
        })
    );
  }
});

// 푸시 알림 (향후 구현 가능)
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push received');
  const title = '우영달림 가계부';
  const options = {
    body: event.data ? event.data.text() : '새로운 알림이 있습니다',
    icon: '/logo192.png',
    badge: '/logo192.png'
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});
