/**
 * 브랜딩 서비스
 * SRP: 브랜딩 관련 비즈니스 로직만 담당
 * DIP: 상위 모듈이 하위 모듈에 의존하지 않도록 추상화
 */

import { DEFAULT_BRANDING, DEFAULT_USER_NAMES } from '../constants/branding';

export class BrandingService {
  /**
   * 사용자 표시 이름 가져오기
   * @param {string} userId - 사용자 ID
   * @param {Object} brandingSettings - 브랜딩 설정 객체
   * @param {string} fallback - fallback 이름
   * @returns {string} - 사용자 표시 이름
   */
  static getUserDisplayName(userId, brandingSettings, fallback) {
    if (brandingSettings?.users?.[userId]?.displayName) {
      return brandingSettings.users[userId].displayName;
    }
    if (fallback) {
      return fallback;
    }
    return DEFAULT_USER_NAMES[userId] || '사용자';
  }

  /**
   * 앱 이름 가져오기
   * @param {Object} brandingSettings - 브랜딩 설정 객체
   * @param {string} fallback - fallback 앱 이름
   * @returns {string} - 앱 이름
   */
  static getAppName(brandingSettings, fallback) {
    if (brandingSettings?.appName) {
      return brandingSettings.appName;
    }
    if (fallback) {
      return fallback;
    }
    return DEFAULT_BRANDING.appName;
  }

  /**
   * PWA 메타데이터 가져오기
   * @param {Object} brandingSettings - 브랜딩 설정 객체
   * @param {Object} defaults - 기본값 객체
   * @returns {Object} - PWA 메타데이터
   */
  static getPWAMetadata(brandingSettings, defaults = DEFAULT_BRANDING.pwa) {
    if (brandingSettings?.pwa) {
      return {
        shortName: brandingSettings.pwa.shortName || defaults.shortName,
        fullName: brandingSettings.pwa.fullName || defaults.fullName,
        description: brandingSettings.pwa.description || defaults.description
      };
    }
    return defaults;
  }

  /**
   * 브랜딩 설정 유효성 검증
   * @param {Object} settings - 검증할 브랜딩 설정
   * @returns {Object} - { valid: boolean, errors: string[] }
   */
  static validateBrandingSettings(settings) {
    const errors = [];

    // 앱 이름 검증
    if (settings.appName) {
      if (typeof settings.appName !== 'string') {
        errors.push('앱 이름은 문자열이어야 합니다.');
      } else if (settings.appName.trim().length === 0) {
        errors.push('앱 이름은 비어있을 수 없습니다.');
      } else if (settings.appName.length > 50) {
        errors.push('앱 이름은 50자를 초과할 수 없습니다.');
      }
    }

    // 사용자 이름 검증
    if (settings.users) {
      Object.entries(settings.users).forEach(([userId, userData]) => {
        if (userData.displayName) {
          if (typeof userData.displayName !== 'string') {
            errors.push(`${userId}의 이름은 문자열이어야 합니다.`);
          } else if (userData.displayName.trim().length === 0) {
            errors.push(`${userId}의 이름은 비어있을 수 없습니다.`);
          } else if (userData.displayName.length > 20) {
            errors.push(`${userId}의 이름은 20자를 초과할 수 없습니다.`);
          }
        }
      });
    }

    // PWA 설정 검증
    if (settings.pwa) {
      if (settings.pwa.shortName) {
        if (typeof settings.pwa.shortName !== 'string') {
          errors.push('PWA 짧은 이름은 문자열이어야 합니다.');
        } else if (settings.pwa.shortName.length > 12) {
          errors.push('PWA 짧은 이름은 12자를 초과할 수 없습니다.');
        }
      }

      if (settings.pwa.fullName && settings.pwa.fullName.length > 45) {
        errors.push('PWA 전체 이름은 45자를 초과할 수 없습니다.');
      }

      if (settings.pwa.description && settings.pwa.description.length > 200) {
        errors.push('PWA 설명은 200자를 초과할 수 없습니다.');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * 커스텀 설정과 기본값 병합
   * @param {Object} customSettings - 사용자 커스텀 설정
   * @param {Object} defaults - 기본값
   * @returns {Object} - 병합된 설정
   */
  static mergeBrandingSettings(customSettings, defaults = DEFAULT_BRANDING) {
    return {
      appName: customSettings?.appName || defaults.appName,
      users: {
        ...defaults.users,
        ...customSettings?.users
      },
      pwa: {
        ...defaults.pwa,
        ...customSettings?.pwa
      }
    };
  }

  /**
   * 가족 멤버 정보에서 기본 브랜딩 설정 생성
   * @param {Object} familyInfo - 가족 정보 객체
   * @returns {Object} - 기본 브랜딩 설정
   */
  static createDefaultBrandingFromFamily(familyInfo) {
    const branding = {
      appName: DEFAULT_BRANDING.appName,
      users: {},
      pwa: { ...DEFAULT_BRANDING.pwa },
      createdAt: new Date().toISOString()
    };

    // 가족 멤버에서 사용자 이름 추출
    if (familyInfo?.members) {
      Object.entries(familyInfo.members).forEach(([userId, member]) => {
        branding.users[userId] = {
          displayName: member.name || DEFAULT_USER_NAMES[userId] || '사용자'
        };
      });
    }

    return branding;
  }

  /**
   * 브랜딩 설정 정리 (trim, sanitize)
   * @param {Object} settings - 정리할 설정
   * @returns {Object} - 정리된 설정
   */
  static sanitizeBrandingSettings(settings) {
    const sanitized = { ...settings };

    // 앱 이름 정리
    if (sanitized.appName) {
      sanitized.appName = sanitized.appName.trim();
    }

    // 사용자 이름 정리
    if (sanitized.users) {
      Object.keys(sanitized.users).forEach(userId => {
        if (sanitized.users[userId]?.displayName) {
          sanitized.users[userId].displayName =
            sanitized.users[userId].displayName.trim();
        }
      });
    }

    // PWA 설정 정리
    if (sanitized.pwa) {
      if (sanitized.pwa.shortName) {
        sanitized.pwa.shortName = sanitized.pwa.shortName.trim();
      }
      if (sanitized.pwa.fullName) {
        sanitized.pwa.fullName = sanitized.pwa.fullName.trim();
      }
      if (sanitized.pwa.description) {
        sanitized.pwa.description = sanitized.pwa.description.trim();
      }
    }

    return sanitized;
  }
}
