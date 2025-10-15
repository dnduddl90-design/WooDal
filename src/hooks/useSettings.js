import { useState, useEffect } from 'react';
import { getSettings, saveSettings, onSettingsChange } from '../firebase/databaseService';
import { loadFromStorage, saveToStorage, STORAGE_KEYS } from '../utils/storageUtils';

/**
 * 설정 관리 커스텀 훅
 * Firebase와 LocalStorage를 통합하여 설정을 관리합니다.
 *
 * @param {Object} currentUser - 현재 로그인한 사용자 정보
 * @returns {Object} - settings, updateSettings 함수
 */
export const useSettings = (currentUser) => {
  const [settings, setSettings] = useState({
    budget: {
      monthly: 0,
      categories: {}
    },
    notifications: {
      budgetAlert: true,
      dailyReminder: false,
      weeklyReport: false
    },
    backup: {
      autoBackup: false,
      backupFrequency: 'weekly'
    }
  });

  // LocalStorage → Firebase 마이그레이션
  const migrateLocalSettings = async (userId) => {
    try {
      const localSettings = loadFromStorage(STORAGE_KEYS.SETTINGS);
      if (localSettings) {
        console.log('📦 LocalStorage 설정 발견, Firebase로 마이그레이션 중...');
        await saveSettings(userId, localSettings);
        console.log('✅ 설정 마이그레이션 완료');
        // LocalStorage에서 제거 (선택사항)
        // localStorage.removeItem(STORAGE_KEYS.SETTINGS);
      }
    } catch (error) {
      console.error('❌ 설정 마이그레이션 실패:', error);
    }
  };

  // Firebase 설정 로드 및 실시간 리스너 설정
  useEffect(() => {
    if (!currentUser) {
      // 로그인하지 않은 경우 LocalStorage에서 로드
      const localSettings = loadFromStorage(STORAGE_KEYS.SETTINGS);
      if (localSettings) {
        setSettings(localSettings);
      }
      return;
    }

    const userId = currentUser.firebaseId;

    // 초기 로드
    const loadSettings = async () => {
      try {
        const firebaseSettings = await getSettings(userId);

        if (firebaseSettings) {
          setSettings(firebaseSettings);
        } else {
          // Firebase에 설정이 없으면 마이그레이션 시도
          await migrateLocalSettings(userId);
        }
      } catch (error) {
        console.error('❌ 설정 로드 실패:', error);
      }
    };

    loadSettings();

    // 실시간 리스너 설정
    const unsubscribe = onSettingsChange(userId, (firebaseSettings) => {
      if (firebaseSettings) {
        setSettings(firebaseSettings);
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [currentUser]);

  // 설정 업데이트 함수
  const updateSettings = async (updates) => {
    const newSettings = {
      ...settings,
      ...updates
    };

    setSettings(newSettings);

    // Firebase 또는 LocalStorage에 저장
    if (currentUser) {
      try {
        await saveSettings(currentUser.firebaseId, newSettings);
        console.log('✅ 설정 저장 완료 (Firebase)');
      } catch (error) {
        console.error('❌ 설정 저장 실패:', error);
        alert('설정 저장에 실패했습니다.');
      }
    } else {
      // 로그인하지 않은 경우 LocalStorage에 저장
      saveToStorage(STORAGE_KEYS.SETTINGS, newSettings);
      console.log('✅ 설정 저장 완료 (LocalStorage)');
    }
  };

  return {
    settings,
    updateSettings
  };
};
