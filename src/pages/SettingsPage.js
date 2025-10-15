import React, { useState } from 'react';
import { Download, Trash2, Upload, Save, Users, UserPlus, Mail, LogOut } from 'lucide-react';
import { CATEGORIES } from '../constants';
import { Button, Input, Modal } from '../components/common';

/**
 * 설정 페이지 컴포넌트
 * SRP: 설정 UI 렌더링만 담당
 * DIP: Props를 통해 데이터와 핸들러 주입받음
 */
export const SettingsPage = ({
  settings,
  transactions = [],
  fixedExpenses = [],
  onUpdateSettings,
  onExportData,
  onImportData,
  onResetData,
  showBackupModal,
  backupData,
  onShowBackupModal,
  onDownloadBackup,
  // 가족 관련 props
  currentUser,
  familyInfo,
  onCreateFamily,
  onInviteMember,
  onLeaveFamily,
  // 테마 관련 props
  theme,
  onChangeTheme
}) => {
  const [showFamilyModal, setShowFamilyModal] = useState(false);
  const [familyName, setFamilyName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const handleFileImport = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          onImportData(event.target.result);
        } catch (error) {
          alert('파일을 읽는 중 오류가 발생했습니다.');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in pb-20 sm:pb-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center gap-2">
        <h2 className="text-lg sm:text-2xl font-bold gradient-text">설정</h2>
        <div className="flex space-x-2 sm:space-x-3">
          <Button
            variant="success"
            icon={Download}
            onClick={onExportData}
            className="text-xs sm:text-sm"
          >
            <span className="hidden sm:inline">내보내기</span>
            <span className="sm:hidden text-xs">내보내기</span>
          </Button>
          <Button
            variant="danger"
            icon={Trash2}
            onClick={onResetData}
            className="text-xs sm:text-sm"
          >
            <span className="hidden sm:inline">초기화</span>
            <span className="sm:hidden text-xs">초기화</span>
          </Button>
        </div>
      </div>

      {/* 가족 가계부 설정 */}
      {familyInfo ? (
        <div className="glass-effect rounded-xl p-4 sm:p-6 shadow-lg">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-base sm:text-lg font-bold text-gray-800 flex items-center">
              <Users className="mr-2" size={16} />
              <span>가족 가계부</span>
            </h3>
            <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-green-100 text-green-700 text-xs sm:text-sm font-medium rounded-full">
              공유 중
            </span>
          </div>

          <div className="space-y-2 sm:space-y-4">
            <div className="p-2.5 sm:p-4 bg-blue-50 rounded-lg">
              <p className="text-xs sm:text-sm font-medium text-gray-700 mb-0.5 sm:mb-1">가족 이름</p>
              <p className="text-sm sm:text-lg font-bold text-gray-900">{familyInfo.name}</p>
            </div>

            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">가족 구성원</p>
              <div className="space-y-1.5 sm:space-y-2">
                {Object.values(familyInfo.members || {}).map(member => (
                  <div key={member.userId} className="flex items-center justify-between p-2.5 sm:p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800 text-sm">{member.name}</p>
                      <p className="text-xs text-gray-600">{member.role === 'admin' ? '관리자' : '멤버'}</p>
                    </div>
                    {member.userId === currentUser?.firebaseId && (
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">나</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-200 pt-2 sm:pt-4 space-y-1.5 sm:space-y-3">
              <Button
                variant="primary"
                icon={UserPlus}
                onClick={() => setShowFamilyModal(true)}
                className="w-full text-sm"
              >
                가족 초대하기
              </Button>

              <Button
                variant="danger"
                icon={LogOut}
                onClick={onLeaveFamily}
                className="w-full text-sm"
              >
                가족 탈퇴하기
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-effect rounded-xl p-4 sm:p-6 shadow-lg">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-base sm:text-lg font-bold text-gray-800 flex items-center">
              <Users className="mr-2" size={16} />
              가족 가계부
            </h3>
            <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-gray-100 text-gray-700 text-xs sm:text-sm font-medium rounded-full">
              개인 모드
            </span>
          </div>

          <div className="space-y-2 sm:space-y-4">
            <p className="text-gray-600 text-xs sm:text-sm">
              가족과 함께 가계부를 공유하고 실시간으로 함께 관리하세요.
            </p>

            <div className="p-2.5 sm:p-4 bg-blue-50 rounded-lg">
              <p className="text-xs sm:text-sm font-medium text-blue-900 mb-1.5 sm:mb-2">가족 가계부 기능</p>
              <ul className="text-xs sm:text-sm text-blue-800 space-y-0.5 sm:space-y-1">
                <li>• 실시간 거래 내역 공유</li>
                <li>• 함께하는 예산 관리</li>
                <li>• 고정지출 자동 등록</li>
              </ul>
            </div>

            <Button
              variant="primary"
              icon={Users}
              onClick={() => setShowFamilyModal(true)}
              className="w-full text-sm"
            >
              가족 만들기
            </Button>
          </div>
        </div>
      )}

      {/* 설정 그리드 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6">
        {/* 기본 설정 */}
        <div className="glass-effect rounded-xl p-4 sm:p-6 shadow-lg max-h-[50vh] overflow-y-auto">
          <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4">기본 설정</h3>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              테마
            </label>
            <select
              value={theme}
              onChange={(e) => onChangeTheme(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option value="light">라이트 (기본)</option>
              <option value="dark">다크</option>
              <option value="colorful">컬러풀</option>
            </select>
          </div>
        </div>

        {/* 예산 설정 */}
        <div className="glass-effect rounded-xl p-4 sm:p-6 shadow-lg max-h-[50vh] overflow-y-auto">
          <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4">예산 설정</h3>
          <div className="space-y-2 sm:space-y-3">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                월 예산
              </label>
              <input
                type="number"
                value={settings.budget.monthly}
                onChange={(e) => onUpdateSettings({
                  budget: { ...settings.budget, monthly: e.target.value }
                })}
                placeholder="0"
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            <div className="border-t border-gray-200 pt-1.5 sm:pt-2">
              <p className="text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                카테고리별 예산
              </p>
              <div className="space-y-1.5 max-h-[20vh] sm:max-h-[25vh] overflow-y-auto pr-1">
                {CATEGORIES.expense.map(category => {
                  const Icon = category.icon;
                  return (
                    <div key={category.id} className="flex items-center gap-1.5">
                      <div className={`p-1 rounded ${category.color} flex-shrink-0`}>
                        <Icon size={12} />
                      </div>
                      <span className="text-xs font-medium text-gray-700 min-w-[50px] flex-shrink-0">
                        {category.name}
                      </span>
                      <input
                        type="number"
                        value={settings.budget.categories[category.id] || ''}
                        onChange={(e) => onUpdateSettings({
                          budget: {
                            ...settings.budget,
                            categories: {
                              ...settings.budget.categories,
                              [category.id]: e.target.value
                            }
                          }
                        })}
                        placeholder="0"
                        className="flex-1 min-w-0 px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* 알림 설정 */}
        <div className="glass-effect rounded-xl p-4 sm:p-6 shadow-lg max-h-[50vh] overflow-y-auto">
          <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4">알림 설정</h3>
          <div className="space-y-2">
            {[
              { key: 'budgetAlert', label: '예산 초과 알림', desc: '예산을 초과하면 알림을 받습니다' },
              { key: 'dailyReminder', label: '일일 기록 알림', desc: '매일 저녁 거래 기록을 알림합니다' },
              { key: 'weeklyReport', label: '주간 리포트', desc: '매주 월요일 지난 주 요약을 받습니다' }
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between p-2 sm:p-2.5 bg-gray-50 rounded-lg gap-2">
                <p className="font-medium text-gray-800 text-xs flex-1 min-w-0">{label}</p>
                <button
                  type="button"
                  onClick={() => onUpdateSettings({
                    notifications: {
                      ...settings.notifications,
                      [key]: !settings.notifications[key]
                    }
                  })}
                  className={`relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors ${
                    settings.notifications[key] ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                      settings.notifications[key] ? 'translate-x-5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 백업 설정 */}
        <div className="glass-effect rounded-xl p-4 sm:p-6 shadow-lg max-h-[50vh] overflow-y-auto">
          <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4">백업 설정</h3>
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center justify-between p-2 sm:p-2.5 bg-gray-50 rounded-lg gap-2">
              <p className="font-medium text-gray-800 text-xs flex-1 min-w-0">자동 백업</p>
              <button
                type="button"
                onClick={() => onUpdateSettings({
                  backup: {
                    ...settings.backup,
                    autoBackup: !settings.backup.autoBackup
                  }
                })}
                className={`relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors ${
                  settings.backup.autoBackup ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                    settings.backup.autoBackup ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {settings.backup.autoBackup && (
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  백업 주기
                </label>
                <select
                  value={settings.backup.backupFrequency}
                  onChange={(e) => onUpdateSettings({
                    backup: {
                      ...settings.backup,
                      backupFrequency: e.target.value
                    }
                  })}
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="daily">매일</option>
                  <option value="weekly">매주</option>
                  <option value="monthly">매월</option>
                </select>
              </div>
            )}

            <div className="border-t border-gray-200 pt-1.5 sm:pt-2 space-y-1.5 sm:space-y-2">
              <Button
                variant="primary"
                icon={Save}
                onClick={onExportData}
                className="w-full text-xs sm:text-sm py-2"
              >
                지금 백업하기
              </Button>

              <div>
                <label htmlFor="import-file" className="block">
                  <div className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 border-2 border-dashed border-gray-300 rounded-xl text-center cursor-pointer hover:border-blue-500 transition-colors">
                    <Upload className="inline-block mr-1" size={16} />
                    <span className="text-xs sm:text-sm font-medium text-gray-700">
                      파일에서 가져오기
                    </span>
                  </div>
                </label>
                <input
                  id="import-file"
                  type="file"
                  accept=".json"
                  onChange={handleFileImport}
                  className="hidden"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 앱 정보 */}
      <div className="glass-effect rounded-xl p-4 sm:p-6 shadow-lg">
        <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4">앱 정보</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{transactions.length}</p>
            <p className="text-sm text-gray-600 mt-1">총 거래 수</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-purple-600">{fixedExpenses.length}</p>
            <p className="text-sm text-gray-600 mt-1">고정지출 항목</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">v1.0</p>
            <p className="text-sm text-gray-600 mt-1">앱 버전</p>
          </div>
          <div className="text-center p-4 bg-gradient-to-r from-pink-100 to-blue-100 rounded-lg">
            <p className="text-2xl font-bold">💕</p>
            <p className="text-sm text-gray-600 mt-1">우영♥달림</p>
          </div>
        </div>
        <p className="text-sm text-gray-500 text-center mt-4">
          우영달림 가계부 • 2025 • Made with Claude Code
        </p>
      </div>

      {/* 백업 모달 */}
      {showBackupModal && (
        <Modal
          isOpen={showBackupModal}
          onClose={() => onShowBackupModal(false)}
          title="데이터 백업"
          size="lg"
        >
          <div className="space-y-4">
            <p className="text-gray-700">
              아래 데이터를 복사하거나 파일로 다운로드하세요.
            </p>
            <textarea
              value={backupData}
              readOnly
              className="w-full h-64 px-4 py-3 border border-gray-300 rounded-xl font-mono text-sm"
            />
            <div className="flex space-x-3">
              <Button
                variant="primary"
                icon={Download}
                onClick={onDownloadBackup}
                className="flex-1"
              >
                파일로 다운로드
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  navigator.clipboard.writeText(backupData);
                  alert('클립보드에 복사되었습니다!');
                }}
                className="flex-1"
              >
                클립보드에 복사
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* 가족 생성/초대 모달 */}
      {showFamilyModal && (
        <Modal
          isOpen={showFamilyModal}
          onClose={() => {
            setShowFamilyModal(false);
            setFamilyName('');
            setInviteEmail('');
          }}
          title={familyInfo ? '가족 초대하기' : '가족 만들기'}
        >
          <div className="space-y-4">
            {familyInfo ? (
              // 가족 초대 폼
              <>
                <p className="text-gray-700">
                  초대할 가족 구성원의 이메일 주소를 입력하세요.
                </p>
                <Input
                  label="이메일 주소"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="family@example.com"
                  icon={Mail}
                />
                <div className="flex space-x-3">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setShowFamilyModal(false);
                      setInviteEmail('');
                    }}
                    className="flex-1"
                  >
                    취소
                  </Button>
                  <Button
                    variant="primary"
                    icon={UserPlus}
                    onClick={() => {
                      if (inviteEmail) {
                        onInviteMember(inviteEmail);
                        setShowFamilyModal(false);
                        setInviteEmail('');
                      }
                    }}
                    className="flex-1"
                  >
                    초대하기
                  </Button>
                </div>
              </>
            ) : (
              // 가족 생성 폼
              <>
                <p className="text-gray-700">
                  우리 가족만의 가계부를 만들어보세요.
                </p>
                <Input
                  label="가족 이름"
                  type="text"
                  value={familyName}
                  onChange={(e) => setFamilyName(e.target.value)}
                  placeholder="예: 우리 가족, 홍길동 가족"
                  icon={Users}
                />
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-900 mb-2">가족 만들기 후에는</p>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• 가족 구성원을 초대할 수 있어요</li>
                    <li>• 모든 거래 내역이 실시간으로 공유돼요</li>
                    <li>• 함께 예산을 관리할 수 있어요</li>
                  </ul>
                </div>
                <div className="flex space-x-3">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setShowFamilyModal(false);
                      setFamilyName('');
                    }}
                    className="flex-1"
                  >
                    취소
                  </Button>
                  <Button
                    variant="primary"
                    icon={Users}
                    onClick={() => {
                      if (familyName) {
                        onCreateFamily(familyName);
                        setShowFamilyModal(false);
                        setFamilyName('');
                      }
                    }}
                    className="flex-1"
                  >
                    만들기
                  </Button>
                </div>
              </>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
