# Service Worker 캐싱 전략

## 📚 학습 목표
- Service Worker의 역할 이해하기
- 캐시 우선 vs 네트워크 우선 전략 비교
- PWA에서 캐싱 문제 해결하기
- 실무에서 최적의 캐싱 전략 선택하기

---

## 1. Service Worker란?

Service Worker는 웹 브라우저와 서버 사이에서 동작하는 **중간 프록시** 역할을 합니다.

### 기본 구조

```
사용자
  ↓
브라우저
  ↓
Service Worker ← 여기서 캐싱 제어!
  ↓
서버
```

### 주요 기능

1. **오프라인 지원** 🌐
   - 인터넷 없어도 앱 실행
   - 캐시된 데이터 사용

2. **빠른 로딩** ⚡
   - 파일을 미리 캐싱
   - 서버 요청 없이 즉시 로드

3. **자동 업데이트** 🔄
   - 새 버전 자동 감지
   - 백그라운드 업데이트

4. **푸시 알림** 🔔 (향후 구현 가능)
   - 앱 닫혀있어도 알림

---

## 2. Service Worker 생명주기

```
등록 (Register)
  ↓
설치 (Install)
  ↓
활성화 (Activate)
  ↓
동작 (Fetch)
```

### 1단계: 등록 (Register)

```javascript
// src/index.js
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

serviceWorkerRegistration.register({
  onSuccess: () => {
    console.log('✅ Service Worker 등록 성공!');
  },
  onUpdate: (registration) => {
    console.log('🔄 새 버전 감지됨!');
  }
});
```

### 2단계: 설치 (Install)

```javascript
// public/service-worker.js
const CACHE_NAME = 'woodal-budget-v2';
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  console.log('[SW] 설치 중...');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] 파일 캐싱 시작');
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => self.skipWaiting()) // 즉시 활성화
  );
});
```

### 3단계: 활성화 (Activate)

```javascript
self.addEventListener('activate', (event) => {
  console.log('[SW] 활성화 중...');

  event.waitUntil(
    // 오래된 캐시 삭제
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] 오래된 캐시 삭제:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // 즉시 제어 시작
  );
});
```

### 4단계: 동작 (Fetch)

```javascript
self.addEventListener('fetch', (event) => {
  // 여기서 캐싱 전략 구현!
});
```

---

## 3. 캐싱 전략 비교

### 전략 1: 캐시 우선 (Cache First)

**특징**: 빠르지만 오래된 버전 가능성

```javascript
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // 캐시가 있으면 즉시 반환
        if (cachedResponse) {
          return cachedResponse;
        }

        // 캐시 없으면 네트워크 요청
        return fetch(event.request);
      })
  );
});
```

**장점**:
- ✅ 매우 빠른 로딩
- ✅ 오프라인 즉시 작동
- ✅ 데이터 사용량 절약

**단점**:
- ❌ 최신 버전 느리게 반영
- ❌ 새 배포 후에도 옛날 버전 보임

**적합한 경우**:
- 자주 변하지 않는 콘텐츠
- 오프라인 우선 앱
- 속도가 최우선인 경우

---

### 전략 2: 네트워크 우선 (Network First)

**특징**: 항상 최신 버전, 오프라인 시 캐시 사용

```javascript
self.addEventListener('fetch', (event) => {
  event.respondWith(
    // 네트워크 먼저 시도
    fetch(event.request)
      .then((networkResponse) => {
        // 성공하면 캐시 업데이트
        const responseToCache = networkResponse.clone();
        caches.open(RUNTIME_CACHE).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      })
      .catch(() => {
        // 네트워크 실패 시 캐시 사용
        return caches.match(event.request);
      })
  );
});
```

**장점**:
- ✅ 항상 최신 버전
- ✅ 오프라인에서도 작동
- ✅ 자동 캐시 업데이트

**단점**:
- ❌ 네트워크 느리면 로딩 느림
- ❌ 데이터 사용량 증가

**적합한 경우**:
- 자주 업데이트되는 콘텐츠
- 실시간 데이터 중요한 앱
- 우리 프로젝트! (가계부 앱)

---

### 전략 3: 캐시 우선 + 백그라운드 업데이트 (Stale While Revalidate)

**특징**: 즉시 캐시 반환, 백그라운드에서 업데이트

```javascript
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // 백그라운드에서 최신 버전 가져오기
        const fetchPromise = fetch(event.request)
          .then((networkResponse) => {
            // 캐시 업데이트
            const responseToCache = networkResponse.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(event.request, responseToCache);
            });
            return networkResponse;
          });

        // 캐시가 있으면 즉시 반환
        return cachedResponse || fetchPromise;
      })
  );
});
```

**장점**:
- ✅ 매우 빠른 첫 로딩
- ✅ 다음 방문 때 업데이트 반영
- ✅ 오프라인 지원

**단점**:
- ❌ 현재 방문에서는 옛날 버전
- ❌ 2번 새로고침 필요할 수 있음

**적합한 경우**:
- 속도와 최신성 둘 다 중요
- 뉴스 앱, SNS 피드

---

## 4. 실전 사례: 우리 프로젝트 개선

### 문제 상황

```javascript
// 기존 코드 (캐시 우선 전략)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          // 캐시 먼저 반환
          fetch(event.request).then((networkResponse) => {
            // 백그라운드에서만 업데이트
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(event.request, networkResponse.clone());
            });
          });

          return cachedResponse; // 오래된 버전!
        }

        return fetch(event.request);
      })
  );
});
```

**증상**:
- 모바일에서 배포 후에도 예전 버전 표시
- F5 눌러도 업데이트 안 됨
- Ctrl+Shift+R만 작동

**원인**:
- 캐시 우선 전략
- 항상 오래된 캐시 먼저 반환

---

### 해결 방법

#### Step 1: 캐시 버전 업그레이드

```javascript
// Before
const CACHE_NAME = 'woodal-budget-v1';
const RUNTIME_CACHE = 'woodal-runtime-v1';

// After
const CACHE_NAME = 'woodal-budget-v2';
const RUNTIME_CACHE = 'woodal-runtime-v2';
```

**효과**: 오래된 캐시 자동 삭제

#### Step 2: 네트워크 우선 전략으로 변경

```javascript
// After (네트워크 우선)
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Firebase 요청은 항상 네트워크 사용
  if (url.hostname.includes('firebase') || url.hostname.includes('googleapis')) {
    event.respondWith(fetch(request));
    return;
  }

  // HTML, JS, CSS는 네트워크 우선
  if (request.method === 'GET' && !url.pathname.startsWith('/api')) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          // 성공하면 캐시 업데이트
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // 오프라인 시에만 캐시 사용
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              console.log('[SW] 오프라인 - 캐시 사용:', request.url);
              return cachedResponse;
            }
            // 캐시도 없으면 기본 페이지
            if (request.destination === 'document') {
              return caches.match('/index.html');
            }
          });
        })
    );
  }
});
```

#### Step 3: 배포

```bash
npm run build && firebase deploy --only hosting
```

**결과**:
- ✅ F5만 눌러도 최신 버전
- ✅ 모바일에서도 즉시 업데이트
- ✅ 오프라인 지원 유지

---

## 5. 캐시 버전 관리

### 버전 네이밍 규칙

```javascript
// 메이저 변경
const CACHE_NAME = 'woodal-budget-v1'; // 초기 버전
const CACHE_NAME = 'woodal-budget-v2'; // 대규모 변경
const CACHE_NAME = 'woodal-budget-v3'; // 다음 대규모 변경

// 또는 날짜 기반
const CACHE_NAME = 'woodal-budget-2025-10-16';

// 또는 시맨틱 버저닝
const CACHE_NAME = 'woodal-budget-1.0.0';
const CACHE_NAME = 'woodal-budget-1.1.0';
const CACHE_NAME = 'woodal-budget-2.0.0';
```

### 배포 체크리스트

```markdown
[ ] Service Worker 캐시 버전 올림
[ ] 빌드 성공 확인 (npm run build)
[ ] 배포 (firebase deploy)
[ ] 데스크톱 브라우저 확인
[ ] 모바일 브라우저 확인
[ ] 오프라인 테스트
```

---

## 6. 오프라인 테스트 방법

### Chrome DevTools 사용

```
1. F12 (개발자 도구)
2. Network 탭
3. 상단에서 "Online" → "Offline" 변경
4. F5 새로고침
5. 앱이 여전히 작동하는지 확인
```

### Service Worker 상태 확인

```
1. Chrome에서 chrome://serviceworker-internals/ 접속
2. 등록된 Service Worker 목록 확인
3. "Unregister" 클릭하여 제거 가능
4. "Start" 클릭하여 디버깅 가능
```

### 캐시 내용 확인

```
1. F12 (개발자 도구)
2. Application 탭
3. Storage → Cache Storage
4. 캐시 이름 클릭
5. 저장된 파일 목록 확인
6. 우클릭 → Delete로 삭제 가능
```

---

## 7. 디버깅 팁

### 콘솔 로그 활용

```javascript
// public/service-worker.js
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 모든 요청 로깅
  console.log('[SW] 요청:', url.pathname);

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        console.log('[SW] 네트워크 성공:', url.pathname);
        return response;
      })
      .catch(() => {
        console.log('[SW] 오프라인 - 캐시 사용:', url.pathname);
        return caches.match(event.request);
      })
  );
});
```

### 업데이트 프롬프트

```javascript
// src/serviceWorkerRegistration.js
export function register(config) {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then((registration) => {
          registration.onupdatefound = () => {
            const installingWorker = registration.installing;

            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  // 새 버전 발견!
                  if (config?.onUpdate) {
                    config.onUpdate(registration);
                  }

                  // 사용자에게 알림
                  if (window.confirm('새로운 버전이 있습니다. 지금 업데이트하시겠습니까?')) {
                    installingWorker.postMessage({ type: 'SKIP_WAITING' });
                    window.location.reload();
                  }
                }
              }
            };
          };
        });
    });
  }
}
```

---

## 8. 최적의 전략 선택 가이드

### 가계부 앱 (우리 프로젝트)

**선택**: 네트워크 우선

**이유**:
- 실시간 데이터 중요 (거래 내역)
- 가족 간 동기화 필수
- 최신 버전 즉시 반영 필요

### 뉴스 앱

**선택**: Stale While Revalidate

**이유**:
- 빠른 로딩 중요
- 옛날 뉴스 봐도 괜찮음
- 다음 방문 때 업데이트

### 문서 사이트

**선택**: 캐시 우선

**이유**:
- 자주 안 바뀜
- 속도가 최우선
- 오프라인 중요

---

## 9. 요약

### Service Worker 역할
- 오프라인 지원
- 빠른 로딩
- 자동 업데이트
- 캐싱 제어

### 캐싱 전략

| 전략 | 장점 | 단점 | 적합한 경우 |
|------|------|------|------------|
| 캐시 우선 | 매우 빠름 | 오래된 버전 | 문서 사이트 |
| 네트워크 우선 | 항상 최신 | 느릴 수 있음 | 가계부 앱 |
| Stale While Revalidate | 빠르고 최신성 | 2번 로드 | 뉴스 앱 |

### 배포 시 체크리스트
1. 캐시 버전 올리기 (v2 → v3)
2. 빌드 확인
3. 배포
4. 데스크톱/모바일 테스트
5. 오프라인 테스트

---

## 10. 실습 문제

### 문제: 캐싱 전략 구현하기

다음 요구사항을 만족하는 캐싱 전략을 구현하세요.

**요구사항**:
- 이미지는 캐시 우선
- API 요청은 네트워크 우선
- HTML/CSS/JS는 네트워크 우선

<details>
<summary>정답 보기</summary>

```javascript
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 이미지 - 캐시 우선
  if (request.destination === 'image') {
    event.respondWith(
      caches.match(request)
        .then(cached => cached || fetch(request))
    );
    return;
  }

  // API - 네트워크 우선
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .catch(() => caches.match(request))
    );
    return;
  }

  // HTML/CSS/JS - 네트워크 우선
  event.respondWith(
    fetch(request)
      .then(response => {
        // 캐시 업데이트
        const clone = response.clone();
        caches.open('my-cache').then(cache => {
          cache.put(request, clone);
        });
        return response;
      })
      .catch(() => caches.match(request))
  );
});
```
</details>

---

## 11. 참고 자료

- [MDN - Service Worker API](https://developer.mozilla.org/ko/docs/Web/API/Service_Worker_API)
- [Google - Service Worker 캐싱 전략](https://web.dev/offline-cookbook/)
- [Workbox - Google의 SW 라이브러리](https://developers.google.com/web/tools/workbox)
- 개발일지.md - Phase 11 참고

---

**작성일**: 2025-10-16
**난이도**: ⭐⭐⭐⭐☆ (고급)
**소요 시간**: 약 60분
