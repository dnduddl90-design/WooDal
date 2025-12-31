import React, { useState, useEffect } from 'react';
import { Save, RotateCcw, Settings } from 'lucide-react';
import { Button, Input } from '../common';
import { DEFAULT_BRANDING } from '../../constants/branding';

/**
 * 브랜딩 설정 컴포넌트
 * SRP: 브랜딩 커스터마이징 UI만 담당
 * DIP: Props를 통해 데이터와 핸들러 주입받음
 */
export const BrandingSettings = ({
  brandingSettings,
  onUpdateBranding,
  familyInfo,
  currentUser
}) => {
  // Form 상태
  const [appName, setAppName] = useState('');
  const [userNames, setUserNames] = useState({});
  const [pwaShortName, setPwaShortName] = useState('');
  const [pwaFullName, setPwaFullName] = useState('');
  const [pwaDescription, setPwaDescription] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // 브랜딩 설정이 변경되면 폼 초기화
  useEffect(() => {
    if (brandingSettings) {
      setAppName(brandingSettings.appName || DEFAULT_BRANDING.appName);
      setUserNames(
        Object.keys(brandingSettings.users || {}).reduce((acc, userId) => {
          acc[userId] = brandingSettings.users[userId]?.displayName || '';
          return acc;
        }, {})
      );
      setPwaShortName(brandingSettings.pwa?.shortName || DEFAULT_BRANDING.pwa.shortName);
      setPwaFullName(brandingSettings.pwa?.fullName || DEFAULT_BRANDING.pwa.fullName);
      setPwaDescription(brandingSettings.pwa?.description || DEFAULT_BRANDING.pwa.description);
    }
  }, [brandingSettings]);

  // 가족 멤버가 있으면 멤버 목록에서 초기화
  useEffect(() => {
    if (familyInfo?.members) {
      const initialNames = {};
      Object.keys(familyInfo.members).forEach(userId => {
        initialNames[userId] = brandingSettings?.users?.[userId]?.displayName ||
                                familyInfo.members[userId].name || '';
      });
      setUserNames(initialNames);
    }
  }, [familyInfo, brandingSettings]);

  // 저장 핸들러
  const handleSave = () => {
    // 사용자 이름 객체 변환
    const usersData = {};
    Object.entries(userNames).forEach(([userId, displayName]) => {
      usersData[userId] = { displayName: displayName.trim() };
    });

    const updates = {
      appName: appName.trim(),
      users: usersData,
      pwa: {
        shortName: pwaShortName.trim(),
        fullName: pwaFullName.trim(),
        description: pwaDescription.trim()
      }
    };

    onUpdateBranding(updates);
    alert('브랜딩 설정이 저장되었습니다!');
  };

  // 기본값으로 복원 핸들러
  const handleReset = () => {
    if (window.confirm('모든 브랜딩 설정을 기본값으로 복원하시겠습니까?')) {
      setAppName(DEFAULT_BRANDING.appName);
      setPwaShortName(DEFAULT_BRANDING.pwa.shortName);
      setPwaFullName(DEFAULT_BRANDING.pwa.fullName);
      setPwaDescription(DEFAULT_BRANDING.pwa.description);

      // 사용자 이름도 기본값으로
      const defaultUserNames = {};
      Object.keys(userNames).forEach((userId, index) => {
        defaultUserNames[userId] = DEFAULT_BRANDING.users[`user${index + 1}`] || '사용자';
      });
      setUserNames(defaultUserNames);

      alert('기본값으로 복원되었습니다. 저장 버튼을 눌러주세요.');
    }
  };

  // Admin 권한 확인
  const isAdmin = currentUser?.role === 'admin' ||
                  (familyInfo?.members?.[currentUser?.firebaseId]?.role === 'admin');

  if (!isAdmin) {
    return (
      <div className="glass-effect rounded-xl p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="w-5 h-5 text-purple-500" />
          <h3 className="text-base sm:text-lg font-semibold">앱 커스터마이징</h3>
        </div>
        <p className="text-sm text-gray-600">
          브랜딩 설정은 관리자만 변경할 수 있습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-effect rounded-xl p-4 sm:p-6">
      {/* 헤더 */}
      <div className="flex items-center gap-2 mb-4">
        <Settings className="w-5 h-5 text-purple-500" />
        <h3 className="text-base sm:text-lg font-semibold">앱 커스터마이징</h3>
      </div>

      {/* 앱 이름 */}
      <div className="mb-4">
        <Input
          label="앱 이름"
          value={appName}
          onChange={(e) => setAppName(e.target.value)}
          placeholder="우영달림 가계부"
          maxLength={50}
        />
        <p className="text-xs text-gray-500 mt-1">
          Header에 표시될 앱 이름입니다. (최대 50자)
        </p>
      </div>

      {/* 사용자 이름들 */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          사용자 표시 이름
        </label>
        <div className="space-y-2">
          {familyInfo?.members && Object.entries(familyInfo.members).map(([userId, member]) => (
            <div key={userId}>
              <Input
                label={`${member.name}님의 표시 이름`}
                value={userNames[userId] || ''}
                onChange={(e) => setUserNames({ ...userNames, [userId]: e.target.value })}
                placeholder={member.name}
                maxLength={20}
              />
            </div>
          ))}
          {(!familyInfo?.members || Object.keys(familyInfo.members).length === 0) && (
            <p className="text-sm text-gray-500">
              가족 모드에서만 사용자 이름을 설정할 수 있습니다.
            </p>
          )}
        </div>
      </div>

      {/* PWA 고급 설정 (접을 수 있음) */}
      <div className="mb-4 border-t pt-4">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-purple-600 transition-colors"
        >
          <span>{showAdvanced ? '▼' : '▶'}</span>
          PWA 설정 (고급)
        </button>

        {showAdvanced && (
          <div className="mt-3 space-y-3 pl-6">
            <Input
              label="짧은 이름"
              value={pwaShortName}
              onChange={(e) => setPwaShortName(e.target.value)}
              placeholder="우영달림"
              maxLength={12}
            />
            <p className="text-xs text-gray-500 -mt-2">
              PWA 홈 화면 아이콘에 표시될 짧은 이름입니다. (최대 12자)
            </p>

            <Input
              label="전체 이름"
              value={pwaFullName}
              onChange={(e) => setPwaFullName(e.target.value)}
              placeholder="우영♥달림 커플 가계부"
              maxLength={45}
            />
            <p className="text-xs text-gray-500 -mt-2">
              PWA 스플래시 화면에 표시될 전체 이름입니다. (최대 45자)
            </p>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                설명
              </label>
              <textarea
                value={pwaDescription}
                onChange={(e) => setPwaDescription(e.target.value)}
                placeholder="커플을 위한 실시간 동기화 가계부 앱"
                maxLength={200}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                PWA 설명 및 검색 최적화에 사용됩니다. (최대 200자)
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 버튼들 */}
      <div className="flex gap-2 sm:gap-3">
        <Button
          icon={Save}
          onClick={handleSave}
          className="flex-1"
        >
          저장
        </Button>
        <Button
          variant="secondary"
          icon={RotateCcw}
          onClick={handleReset}
          className="flex-1"
        >
          기본값 복원
        </Button>
      </div>

      {/* 안내 메시지 */}
      <div className="mt-4 p-3 bg-purple-50 rounded-lg">
        <p className="text-xs text-purple-800">
          💡 <strong>Tip:</strong> 브랜딩 설정은 가족 구성원 모두에게 실시간으로 반영됩니다.
          PWA로 설치한 경우, 앱을 재설치하면 새 이름이 적용됩니다.
        </p>
      </div>
    </div>
  );
};
