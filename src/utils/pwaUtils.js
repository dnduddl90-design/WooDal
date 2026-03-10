/**
 * PWA 메타데이터 유틸리티
 * SRP: PWA manifest와 meta 태그 동적 업데이트만 담당
 */

/**
 * PWA manifest와 meta 태그를 동적으로 업데이트
 * - document.title 변경
 * - meta description 변경
 * - manifest.json blob URL로 동적 생성
 *
 * @param {Object} pwaSettings - PWA 설정 객체
 * @param {string} pwaSettings.shortName - 짧은 이름
 * @param {string} pwaSettings.fullName - 전체 이름
 * @param {string} pwaSettings.description - 설명
 */
export const updatePWAMetadata = (pwaSettings) => {
  if (!pwaSettings) return;

  try {
    // 1. document.title 변경
    if (pwaSettings.fullName) {
      document.title = pwaSettings.fullName;
    }

    // 2. meta description 업데이트
    if (pwaSettings.description) {
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', pwaSettings.description);
      }
    }

    // 3. meta apple-mobile-web-app-title 업데이트
    if (pwaSettings.shortName) {
      const appleTitle = document.querySelector('meta[name="apple-mobile-web-app-title"]');
      if (appleTitle) {
        appleTitle.setAttribute('content', pwaSettings.shortName);
      }
    }

    // 4. meta application-name 업데이트
    if (pwaSettings.shortName) {
      const appName = document.querySelector('meta[name="application-name"]');
      if (appName) {
        appName.setAttribute('content', pwaSettings.fullName || pwaSettings.shortName);
      }
    }

    // 5. manifest.json 동적 생성 (blob URL)
    const manifest = {
      short_name: pwaSettings.shortName || "우영달림",
      name: pwaSettings.fullName || "우영♥달림 커플 가계부",
      description: pwaSettings.description || "커플을 위한 실시간 동기화 가계부 앱",
      icons: [
        {
          src: "favicon.ico",
          sizes: "64x64 32x32 24x24 16x16",
          type: "image/x-icon"
        },
        {
          src: "logo192.png",
          type: "image/png",
          sizes: "192x192",
          purpose: "any maskable"
        },
        {
          src: "logo512.png",
          type: "image/png",
          sizes: "512x512",
          purpose: "any maskable"
        }
      ],
      start_url: ".",
      display: "standalone",
      theme_color: "#4f46e5",
      background_color: "#f5f7fa",
      orientation: "portrait",
      scope: "/",
      categories: ["finance", "productivity"],
      lang: "ko-KR",
      dir: "ltr"
    };

    // Blob URL 생성
    const manifestBlob = new Blob(
      [JSON.stringify(manifest, null, 2)],
      { type: 'application/json' }
    );
    const manifestURL = URL.createObjectURL(manifestBlob);

    // manifest link 업데이트
    let manifestLink = document.querySelector('link[rel="manifest"]');
    if (manifestLink) {
      // 기존 blob URL revoke (메모리 누수 방지)
      if (manifestLink.href.startsWith('blob:')) {
        URL.revokeObjectURL(manifestLink.href);
      }
      manifestLink.href = manifestURL;
    } else {
      // manifest link가 없으면 생성
      manifestLink = document.createElement('link');
      manifestLink.rel = 'manifest';
      manifestLink.href = manifestURL;
      document.head.appendChild(manifestLink);
    }

  } catch (error) {
    console.error('❌ PWA 메타데이터 업데이트 실패:', error);
  }
};

/**
 * PWA 메타데이터 초기화 (기본값으로 복원)
 */
export const resetPWAMetadata = () => {
  updatePWAMetadata({
    shortName: "우영달림",
    fullName: "우영♥달림 커플 가계부",
    description: "커플을 위한 실시간 동기화 가계부 앱 - 우영♥달림"
  });
};
