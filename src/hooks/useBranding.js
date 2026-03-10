import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  getFamilyBranding,
  saveFamilyBranding,
  onFamilyBrandingChange,
  getPersonalBranding,
  savePersonalBranding,
  onPersonalBrandingChange
} from '../firebase/databaseService';
import { BrandingService } from '../services/brandingService';
import { DEFAULT_BRANDING } from '../constants/branding';

/**
 * 브랜딩 관리 커스텀 훅
 * Firebase와 실시간 동기화하여 브랜딩 설정을 관리합니다.
 *
 * @param {Object} currentUser - 현재 로그인한 사용자 정보
 * @param {Object} familyInfo - 가족 정보
 * @returns {Object} - brandingSettings, updateBrandingSettings, getUserName, getAppTitle
 */
export const useBranding = (currentUser, familyInfo) => {
  const [brandingSettings, setBrandingSettings] = useState(DEFAULT_BRANDING);
  const [loading, setLoading] = useState(true);

  // 가족이 있는지 확인
  const hasFamilyMode = Boolean(familyInfo?.id);
  const familyId = familyInfo?.id;
  const userId = currentUser?.firebaseId;

  // Firebase에서 초기 브랜딩 설정 로드 및 마이그레이션
  useEffect(() => {
    if (!currentUser) {
      // 로그인하지 않은 경우 기본값 사용
      setBrandingSettings(DEFAULT_BRANDING);
      setLoading(false);
      return;
    }

    const loadBrandingSettings = async () => {
      try {
        setLoading(true);

        let firebaseBranding = null;

        // 가족 모드인 경우
        if (hasFamilyMode && familyId) {
          firebaseBranding = await getFamilyBranding(familyId);

          // Firebase에 설정이 없으면 마이그레이션 (기본값 생성)
          if (!firebaseBranding) {
            const defaultBranding = BrandingService.createDefaultBrandingFromFamily(familyInfo);
            await saveFamilyBranding(familyId, defaultBranding);
            firebaseBranding = defaultBranding;
          }
        }
        // 개인 모드인 경우
        else if (userId) {
          firebaseBranding = await getPersonalBranding(userId);

          // Firebase에 설정이 없으면 기본값 저장
          if (!firebaseBranding) {
            const defaultBranding = {
              ...DEFAULT_BRANDING,
              createdAt: new Date().toISOString()
            };
            await savePersonalBranding(userId, defaultBranding);
            firebaseBranding = defaultBranding;
          }
        }

        // 설정 병합 및 적용
        if (firebaseBranding) {
          const mergedSettings = BrandingService.mergeBrandingSettings(
            firebaseBranding,
            DEFAULT_BRANDING
          );
          setBrandingSettings(mergedSettings);
        } else {
          setBrandingSettings(DEFAULT_BRANDING);
        }
      } catch (error) {
        console.error('❌ 브랜딩 설정 로드 실패:', error);
        setBrandingSettings(DEFAULT_BRANDING);
      } finally {
        setLoading(false);
      }
    };

    loadBrandingSettings();
  }, [currentUser, hasFamilyMode, familyId, userId, familyInfo]);

  // 실시간 리스너 설정
  useEffect(() => {
    if (!currentUser) return;

    let unsubscribe = null;

    if (hasFamilyMode && familyId) {
      // 가족 모드 실시간 리스너
      unsubscribe = onFamilyBrandingChange(familyId, (firebaseBranding) => {
        if (firebaseBranding) {
          const mergedSettings = BrandingService.mergeBrandingSettings(
            firebaseBranding,
            DEFAULT_BRANDING
          );
          setBrandingSettings(mergedSettings);
        }
      });
    } else if (userId) {
      // 개인 모드 실시간 리스너
      unsubscribe = onPersonalBrandingChange(userId, (firebaseBranding) => {
        if (firebaseBranding) {
          const mergedSettings = BrandingService.mergeBrandingSettings(
            firebaseBranding,
            DEFAULT_BRANDING
          );
          setBrandingSettings(mergedSettings);
        }
      });
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [currentUser, hasFamilyMode, familyId, userId]);

  // 브랜딩 설정 업데이트 함수
  const updateBrandingSettings = useCallback(
    async (updates) => {
      if (!currentUser) {
        alert('로그인이 필요합니다.');
        return;
      }

      try {
        // 업데이트 데이터 정리 및 유효성 검증
        const sanitized = BrandingService.sanitizeBrandingSettings(updates);
        const validation = BrandingService.validateBrandingSettings(sanitized);

        if (!validation.valid) {
          alert(`입력값 오류:\n${validation.errors.join('\n')}`);
          return;
        }

        // 새 설정 병합
        const newSettings = {
          ...brandingSettings,
          ...sanitized
        };

        // 즉시 로컬 상태 업데이트 (낙관적 업데이트)
        setBrandingSettings(newSettings);

        // Firebase 저장
        if (hasFamilyMode && familyId) {
          await saveFamilyBranding(familyId, newSettings);
        } else if (userId) {
          await savePersonalBranding(userId, newSettings);
        }
      } catch (error) {
        console.error('❌ 브랜딩 설정 저장 실패:', error);
        alert('브랜딩 설정 저장에 실패했습니다.');
        // 실패 시 원래 상태로 복구 (실시간 리스너가 처리)
      }
    },
    [currentUser, brandingSettings, hasFamilyMode, familyId, userId]
  );

  // Helper: 사용자 이름 가져오기 (Memoized)
  const getUserName = useCallback(
    (userIdParam, fallback) => {
      return BrandingService.getUserDisplayName(
        userIdParam,
        brandingSettings,
        fallback
      );
    },
    [brandingSettings]
  );

  // Helper: 앱 제목 가져오기 (Memoized)
  const getAppTitle = useCallback(
    (fallback) => {
      return BrandingService.getAppName(brandingSettings, fallback);
    },
    [brandingSettings]
  );

  // Helper: PWA 메타데이터 가져오기 (Memoized)
  const getPWAConfig = useMemo(() => {
    return BrandingService.getPWAMetadata(brandingSettings);
  }, [brandingSettings]);

  return {
    brandingSettings,
    loading,
    updateBrandingSettings,
    getUserName,
    getAppTitle,
    getPWAConfig
  };
};
