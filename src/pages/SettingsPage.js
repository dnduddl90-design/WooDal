import React from 'react';
import { Download, Trash2, Upload, Save } from 'lucide-react';
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
  onDownloadBackup
}) => {
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
    <div className="space-y-6 animate-fade-in">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold gradient-text">설정</h2>
        <div className="flex space-x-3">
          <Button
            variant="success"
            icon={Download}
            onClick={onExportData}
          >
            내보내기
          </Button>
          <Button
            variant="danger"
            icon={Trash2}
            onClick={onResetData}
          >
            초기화
          </Button>
        </div>
      </div>

      {/* 설정 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 기본 설정 */}
        <div className="glass-effect rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-bold text-gray-800 mb-4">기본 설정</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                테마
              </label>
              <select
                value={settings.theme}
                onChange={(e) => onUpdateSettings({ theme: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="default">기본</option>
                <option value="dark">다크</option>
                <option value="colorful">컬러풀</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                통화
              </label>
              <select
                value={settings.currency}
                onChange={(e) => onUpdateSettings({ currency: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="KRW">한국 원 (₩)</option>
                <option value="USD">미국 달러 ($)</option>
                <option value="EUR">유로 (€)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                날짜 형식
              </label>
              <select
                value={settings.dateFormat}
                onChange={(e) => onUpdateSettings({ dateFormat: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="ko-KR">한국식 (YYYY-MM-DD)</option>
                <option value="en-US">미국식 (MM/DD/YYYY)</option>
              </select>
            </div>
          </div>
        </div>

        {/* 예산 설정 */}
        <div className="glass-effect rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-bold text-gray-800 mb-4">예산 설정</h3>
          <div className="space-y-4">
            <Input
              label="월 예산"
              type="number"
              value={settings.budget.monthly}
              onChange={(e) => onUpdateSettings({
                budget: { ...settings.budget, monthly: e.target.value }
              })}
              placeholder="0"
            />

            <div className="border-t border-gray-200 pt-4">
              <p className="text-sm font-medium text-gray-700 mb-3">
                카테고리별 예산
              </p>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {CATEGORIES.expense.map(category => {
                  const Icon = category.icon;
                  return (
                    <div key={category.id} className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${category.color}`}>
                        <Icon size={16} />
                      </div>
                      <span className="text-sm font-medium text-gray-700 min-w-[80px]">
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
                        className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* 알림 설정 */}
        <div className="glass-effect rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-bold text-gray-800 mb-4">알림 설정</h3>
          <div className="space-y-4">
            {[
              { key: 'budgetAlert', label: '예산 초과 알림', desc: '예산을 초과하면 알림을 받습니다' },
              { key: 'dailyReminder', label: '일일 기록 알림', desc: '매일 저녁 거래 기록을 알림합니다' },
              { key: 'weeklyReport', label: '주간 리포트', desc: '매주 월요일 지난 주 요약을 받습니다' }
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{label}</p>
                  <p className="text-sm text-gray-600 mt-1">{desc}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onUpdateSettings({
                    notifications: {
                      ...settings.notifications,
                      [key]: !settings.notifications[key]
                    }
                  })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.notifications[key] ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.notifications[key] ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 백업 설정 */}
        <div className="glass-effect rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-bold text-gray-800 mb-4">백업 설정</h3>
          <div className="space-y-4">
            <div className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <p className="font-medium text-gray-800">자동 백업</p>
                <p className="text-sm text-gray-600 mt-1">
                  데이터를 자동으로 백업합니다
                </p>
              </div>
              <button
                type="button"
                onClick={() => onUpdateSettings({
                  backup: {
                    ...settings.backup,
                    autoBackup: !settings.backup.autoBackup
                  }
                })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.backup.autoBackup ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.backup.autoBackup ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {settings.backup.autoBackup && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="daily">매일</option>
                  <option value="weekly">매주</option>
                  <option value="monthly">매월</option>
                </select>
              </div>
            )}

            <div className="border-t border-gray-200 pt-4 space-y-3">
              <Button
                variant="primary"
                icon={Save}
                onClick={onExportData}
                className="w-full"
              >
                지금 백업하기
              </Button>

              <div>
                <label htmlFor="import-file" className="block">
                  <div className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-xl text-center cursor-pointer hover:border-blue-500 transition-colors">
                    <Upload className="inline-block mr-2" size={20} />
                    <span className="text-sm font-medium text-gray-700">
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
      <div className="glass-effect rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-bold text-gray-800 mb-4">앱 정보</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
    </div>
  );
};
