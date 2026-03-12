import React, { useMemo, useState } from 'react';
import {
  Bell,
  Briefcase,
  ChevronDown,
  ChevronUp,
  Database,
  Download,
  Info,
  LogOut,
  Mail,
  PiggyBank,
  Save,
  Shield,
  Smile,
  Trash2,
  Upload,
  UserPlus,
  Users
} from 'lucide-react';
import { CATEGORIES, DEFAULT_AVATARS } from '../constants';
import { Button, Input, Modal } from '../components/common';
import { AvatarPicker } from '../components/forms';
import { StockCategoryManager } from '../components/settings/StockCategoryManager';
import { StockSymbolManager } from '../components/settings/StockSymbolManager';
import { BrandingSettings } from '../components/settings/BrandingSettings';

const AccordionSection = ({ icon: Icon, title, description, isOpen, onToggle, children, badge = null }) => (
  <section className="glass-effect rounded-xl shadow-lg overflow-hidden">
    <button
      type="button"
      onClick={onToggle}
      className="w-full flex items-center justify-between gap-4 px-4 py-4 sm:px-6 sm:py-5 text-left hover:bg-white/20 transition-colors"
    >
      <div className="flex items-start gap-3 min-w-0">
        <div className="mt-0.5 p-2 rounded-lg bg-white/60">
          <Icon size={18} className="text-slate-700" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base sm:text-lg font-bold text-slate-800">{title}</h3>
            {badge}
          </div>
          {description && <p className="text-sm text-slate-600 mt-1">{description}</p>}
        </div>
      </div>
      {isOpen ? <ChevronUp size={18} className="text-slate-500 flex-shrink-0" /> : <ChevronDown size={18} className="text-slate-500 flex-shrink-0" />}
    </button>
    {isOpen && <div className="px-4 pb-4 sm:px-6 sm:pb-6 border-t border-white/40">{children}</div>}
  </section>
);

export const SettingsPage = ({
  settings,
  transactions = [],
  fixedExpenses = [],
  stocks = [],
  saveStatus = 'idle',
  onUpdateSettings,
  onExportData,
  onImportData,
  onResetData,
  showBackupModal,
  backupData,
  onShowBackupModal,
  onDownloadBackup,
  currentUser,
  familyInfo,
  onCreateFamily,
  onInviteMember,
  onLeaveFamily,
  theme,
  onChangeTheme,
  userAvatar,
  onChangeAvatar,
  stockSymbols = [],
  stockCategories = [],
  onAddSymbol,
  onUpdateSymbol,
  onDeleteSymbol,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  brandingSettings,
  onUpdateBranding
}) => {
  const [showFamilyModal, setShowFamilyModal] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [familyName, setFamilyName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [openSections, setOpenSections] = useState({
    data: true,
    account: true,
    stock: true,
    family: true,
    budget: false,
    notifications: false,
    app: false
  });

  const toggleSection = (sectionKey) => {
    setOpenSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  const dataUsage = useMemo(() => {
    const snapshot = {
      transactions,
      fixedExpenses,
      stocks,
      stockSymbols,
      stockCategories,
      familyInfo: familyInfo ? {
        id: familyInfo.id,
        memberCount: Object.keys(familyInfo.members || {}).length
      } : null
    };

    const json = JSON.stringify(snapshot);
    const estimatedBytes = new Blob([json]).size;
    const estimatedKB = estimatedBytes / 1024;
    const estimatedMB = estimatedKB / 1024;

    let usageText = `${estimatedKB.toFixed(1)} KB`;
    if (estimatedKB >= 1024) {
      usageText = `${estimatedMB.toFixed(2)} MB`;
    }

    return {
      usageText,
      backupRecommended: estimatedKB >= 250 || transactions.length >= 1000
    };
  }, [transactions, fixedExpenses, stocks, stockSymbols, stockCategories, familyInfo]);

  const saveStatusMeta = {
    idle: { text: '변경 대기', className: 'bg-slate-100 text-slate-600' },
    saving: { text: '저장 중...', className: 'bg-indigo-100 text-indigo-700' },
    saved: { text: '저장됨', className: 'bg-emerald-100 text-emerald-700' },
    error: { text: '저장 실패', className: 'bg-rose-100 text-rose-700' }
  };

  const currentSaveStatus = saveStatusMeta[saveStatus] || saveStatusMeta.idle;
  const familyMemberCount = Object.keys(familyInfo?.members || {}).length;
  const isFamilyAdmin = currentUser?.role === 'admin';

  const handleFileImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        onImportData(event.target.result);
      } catch (error) {
        alert('파일을 읽는 중 오류가 발생했습니다.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in pb-20 sm:pb-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg sm:text-2xl font-bold gradient-text">설정</h2>
          <p className="text-sm text-slate-600 mt-1">계정, 데이터, 주식, 가족 설정을 한 곳에서 관리합니다.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${currentSaveStatus.className}`}>
            {currentSaveStatus.text}
          </span>
          <Button
            variant="success"
            icon={Download}
            onClick={onExportData}
            className="text-xs sm:text-sm"
          >
            내보내기
          </Button>
          <Button
            variant="danger"
            icon={Trash2}
            onClick={onResetData}
            className="text-xs sm:text-sm"
          >
            초기화
          </Button>
        </div>
      </div>

      <AccordionSection
        icon={Database}
        title="데이터 관리"
        description="현재 데이터 규모를 확인하고 백업/복원을 관리합니다."
        isOpen={openSections.data}
        onToggle={() => toggleSection('data')}
        badge={dataUsage.backupRecommended ? <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">백업 권장</span> : null}
      >
        <div className="pt-4 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-slate-50 rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-indigo-600">{transactions.length}</p>
              <p className="text-xs text-slate-600 mt-1">거래</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-violet-600">{fixedExpenses.length}</p>
              <p className="text-xs text-slate-600 mt-1">고정지출</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-indigo-600">{stocks.length}</p>
              <p className="text-xs text-slate-600 mt-1">주식</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-emerald-600">{stockSymbols.length}</p>
              <p className="text-xs text-slate-600 mt-1">종목 목록</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-emerald-600">{stockCategories.length}</p>
              <p className="text-xs text-slate-600 mt-1">주식 분류</p>
            </div>
            <div className="bg-indigo-50 rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-indigo-700">{dataUsage.usageText}</p>
              <p className="text-xs text-slate-600 mt-1">추정 저장 크기</p>
            </div>
          </div>

          <div className={`rounded-lg px-4 py-3 text-sm border ${
            dataUsage.backupRecommended
              ? 'bg-amber-50 border-amber-200 text-amber-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}>
            {dataUsage.backupRecommended
              ? '데이터가 꽤 쌓였습니다. 지금 백업해두는 것을 권장합니다.'
              : '현재 데이터 규모는 안정적인 편입니다. 그래도 주기적 백업은 권장합니다.'}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-200 bg-white/70 p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold text-slate-800">백업 설정</p>
                <button
                  type="button"
                  onClick={() => onUpdateSettings({
                    backup: {
                      ...settings.backup,
                      autoBackup: !settings.backup.autoBackup
                    }
                  })}
                  className={`relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors ${
                    settings.backup.autoBackup ? 'bg-indigo-600' : 'bg-slate-300'
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
                  <label className="block text-sm font-medium text-slate-700 mb-2">백업 주기</label>
                  <select
                    value={settings.backup.backupFrequency}
                    onChange={(e) => onUpdateSettings({
                      backup: {
                        ...settings.backup,
                        backupFrequency: e.target.value
                      }
                    })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-xl text-sm text-slate-700"
                  >
                    <option value="daily">매일</option>
                    <option value="weekly">매주</option>
                    <option value="monthly">매월</option>
                  </select>
                </div>
              )}

              <Button
                variant="primary"
                icon={Save}
                onClick={onExportData}
                className="w-full text-sm"
              >
                지금 백업하기
              </Button>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white/70 p-4 space-y-3">
              <p className="font-semibold text-slate-800">복원 및 참고</p>
              <div>
                <label htmlFor="import-file" className="block">
                  <div className="w-full px-3 py-2 border-2 border-dashed border-slate-300 rounded-xl text-center cursor-pointer hover:border-indigo-500 transition-colors">
                    <Upload className="inline-block mr-1" size={16} />
                    <span className="text-sm font-medium text-slate-700">파일에서 가져오기</span>
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
              <p className="text-xs text-slate-500">
                이 수치는 앱이 읽은 데이터 기준의 대략적인 JSON 크기입니다. Firebase Console의 실제 사용량과는 차이가 있을 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      </AccordionSection>

      <AccordionSection
        icon={Shield}
        title="계정 및 기본 설정"
        description="아바타, 테마, 개인 기본 환경을 관리합니다."
        isOpen={openSections.account}
        onToggle={() => toggleSection('account')}
      >
        <div className="pt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-xl border border-slate-200 bg-white/70 p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">내 아바타</label>
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-sky-100 rounded-2xl flex items-center justify-center text-3xl shadow-md">
                  {userAvatar || DEFAULT_AVATARS.user1}
                </div>
                <Button
                  variant="secondary"
                  icon={Smile}
                  onClick={() => setShowAvatarPicker(true)}
                  className="text-sm"
                >
                  변경하기
                </Button>
              </div>
              <p className="text-xs text-slate-500 mt-2">헤더와 가족 구성원 정보에 표시됩니다.</p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white/70 p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">테마</label>
              <select
                value={theme || 'light'}
                onChange={(e) => onChangeTheme(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-xl text-sm text-slate-700"
              >
                <option value="light">라이트 (기본)</option>
                <option value="dark">다크</option>
                <option value="colorful">컬러풀</option>
              </select>
            </div>
            <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
              저장 상태는 상단 배지에서 바로 확인할 수 있습니다. 변경 사항은 자동 저장됩니다.
            </div>
          </div>
        </div>
      </AccordionSection>

      <AccordionSection
        icon={Briefcase}
        title="주식 설정"
        description="종목 목록과 분류 체계를 관리합니다."
        isOpen={openSections.stock}
        onToggle={() => toggleSection('stock')}
      >
        <div className="pt-4 grid grid-cols-1 xl:grid-cols-2 gap-4">
          <StockSymbolManager
            stockSymbols={stockSymbols}
            onAddSymbol={onAddSymbol}
            onUpdateSymbol={onUpdateSymbol}
            onDeleteSymbol={onDeleteSymbol}
            currentUser={currentUser}
          />
          <StockCategoryManager
            stockCategories={stockCategories}
            onAddCategory={onAddCategory}
            onUpdateCategory={onUpdateCategory}
            onDeleteCategory={onDeleteCategory}
            currentUser={currentUser}
          />
        </div>
      </AccordionSection>

      <AccordionSection
        icon={Users}
        title="가족 가계부"
        description={familyInfo ? '공유 중인 가족과 역할을 관리합니다.' : '가족 가계부를 만들어 공유 모드로 전환할 수 있습니다.'}
        isOpen={openSections.family}
        onToggle={() => toggleSection('family')}
        badge={
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${familyInfo ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
            {familyInfo ? '공유 중' : '개인 모드'}
          </span>
        }
      >
        <div className="pt-4 space-y-4">
          {familyInfo ? (
            <>
              <div className="rounded-xl bg-indigo-50 p-4">
                <p className="text-sm text-slate-700">가족 이름</p>
                <p className="text-lg font-bold text-slate-900 mt-1">{familyInfo.name}</p>
                <p className="text-xs text-slate-500 mt-2">
                  현재 {familyMemberCount}명이 참여 중이며, {isFamilyAdmin ? '관리자 권한으로 초대와 멤버 관리를 할 수 있습니다.' : '멤버로 참여 중이며 데이터는 공유되지만 관리 권한은 제한됩니다.'}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-700">가족 구성원</p>
                {Object.values(familyInfo.members || {}).map((member) => (
                  <div key={member.userId} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-800 text-sm">{member.name}</p>
                      <p className="text-xs text-slate-600">{member.role === 'admin' ? '관리자: 초대 및 멤버 관리 가능' : '멤버: 데이터 열람 및 작성 가능'}</p>
                    </div>
                    {member.userId === currentUser?.firebaseId && (
                      <span className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded">나</span>
                    )}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
            </>
          ) : (
            <>
              <div className="rounded-xl bg-indigo-50 p-4 text-sm text-indigo-900">
                <p className="font-semibold mb-2">가족 가계부 기능</p>
                <p>실시간 거래 공유, 고정지출 공유, 함께하는 예산 관리가 가능합니다.</p>
              </div>
              <Button
                variant="primary"
                icon={Users}
                onClick={() => setShowFamilyModal(true)}
                className="w-full text-sm"
              >
                가족 만들기
              </Button>
            </>
          )}
        </div>
      </AccordionSection>

      <AccordionSection
        icon={PiggyBank}
        title="예산 설정"
        description="월 예산과 카테고리별 예산을 관리합니다."
        isOpen={openSections.budget}
        onToggle={() => toggleSection('budget')}
      >
        <div className="pt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">월 예산</label>
            <input
              type="number"
              value={settings.budget.monthly}
              onChange={(e) => onUpdateSettings({
                budget: { ...settings.budget, monthly: e.target.value }
              })}
              placeholder="0"
              className="w-full px-4 py-2 border border-slate-300 rounded-xl text-sm text-slate-700"
            />
          </div>

          <div className="border-t border-slate-200 pt-4">
            <p className="text-sm font-medium text-slate-700 mb-3">카테고리별 예산</p>
            <div className="space-y-2 lg:max-h-[28vh] lg:overflow-y-auto pr-1">
              {CATEGORIES.expense.map((category) => {
                const Icon = category.icon;
                return (
                  <div key={category.id} className="flex items-center gap-2">
                    <div className={`p-1 rounded ${category.color} flex-shrink-0`}>
                      <Icon size={12} />
                    </div>
                    <span className="text-xs font-medium text-slate-700 min-w-[56px] flex-shrink-0">{category.name}</span>
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
                      className="flex-1 min-w-0 px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-700"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </AccordionSection>

      <AccordionSection
        icon={Bell}
        title="알림 설정"
        description="앱 내 알림 선호도를 관리합니다."
        isOpen={openSections.notifications}
        onToggle={() => toggleSection('notifications')}
      >
        <div className="pt-4 space-y-2">
          {[
            { key: 'budgetAlert', label: '예산 초과 알림', desc: '예산을 초과하면 알림을 받습니다' },
            { key: 'dailyReminder', label: '일일 기록 알림', desc: '매일 저녁 거래 기록을 알림합니다' },
            { key: 'weeklyReport', label: '주간 리포트', desc: '매주 월요일 지난 주 요약을 받습니다' }
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg gap-3">
              <div className="min-w-0">
                <p className="font-medium text-slate-800 text-sm">{label}</p>
                <p className="text-xs text-slate-500 mt-1">{desc}</p>
              </div>
              <button
                type="button"
                onClick={() => onUpdateSettings({
                  notifications: {
                    ...settings.notifications,
                    [key]: !settings.notifications[key]
                  }
                })}
                className={`relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors ${
                  settings.notifications[key] ? 'bg-indigo-600' : 'bg-slate-300'
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
      </AccordionSection>

      <AccordionSection
        icon={Info}
        title="앱 정보 및 브랜딩"
        description="앱 이름, PWA 정보, 기본 정보를 관리합니다."
        isOpen={openSections.app}
        onToggle={() => toggleSection('app')}
      >
        <div className="pt-4 space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <p className="text-2xl font-bold text-indigo-600">{transactions.length}</p>
              <p className="text-sm text-slate-600 mt-1">총 거래 수</p>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <p className="text-2xl font-bold text-violet-600">{fixedExpenses.length}</p>
              <p className="text-sm text-slate-600 mt-1">고정지출 항목</p>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <p className="text-2xl font-bold text-emerald-600">v1.0</p>
              <p className="text-sm text-slate-600 mt-1">앱 버전</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-r from-indigo-100 to-sky-100 rounded-lg">
              <p className="text-2xl font-bold">💕</p>
              <p className="text-sm text-slate-600 mt-1">{brandingSettings?.pwa?.shortName || '우영♥달림'}</p>
            </div>
          </div>

          <BrandingSettings
            brandingSettings={brandingSettings}
            onUpdateBranding={onUpdateBranding}
            familyInfo={familyInfo}
            currentUser={currentUser}
          />

          <p className="text-sm text-slate-500 text-center">
            {brandingSettings?.appName || '우영달림 가계부'} • 2025
          </p>
        </div>
      </AccordionSection>

      {showBackupModal && (
        <Modal
          isOpen={showBackupModal}
          onClose={() => onShowBackupModal(false)}
          title="데이터 백업"
          size="lg"
        >
          <div className="space-y-4">
            <p className="text-slate-700">아래 데이터를 복사하거나 파일로 다운로드하세요.</p>
            <textarea
              value={backupData}
              readOnly
              className="w-full h-64 px-4 py-3 border border-slate-300 rounded-xl font-mono text-sm text-slate-700"
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
              <>
                <p className="text-slate-700">초대할 가족 구성원의 이메일 주소를 입력하세요.</p>
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
              <>
                <p className="text-slate-700">우리 가족만의 가계부를 만들어보세요.</p>
                <Input
                  label="가족 이름"
                  type="text"
                  value={familyName}
                  onChange={(e) => setFamilyName(e.target.value)}
                  placeholder="예: 우리 가족, 홍길동 가족"
                  icon={Users}
                />
                <div className="p-4 bg-indigo-50 rounded-lg">
                  <p className="text-sm font-medium text-indigo-900 mb-2">가족 만들기 후에는</p>
                  <ul className="text-sm text-indigo-800 space-y-1">
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

      {showAvatarPicker && (
        <AvatarPicker
          currentAvatar={userAvatar || DEFAULT_AVATARS.user1}
          onSelect={(emoji) => {
            onChangeAvatar(emoji);
          }}
          onClose={() => setShowAvatarPicker(false)}
        />
      )}
    </div>
  );
};
