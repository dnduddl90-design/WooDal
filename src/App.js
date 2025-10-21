import React, { useState, useEffect, useCallback } from 'react';

// Hooks
import { useAuth, useTransactions, useFixedExpenses, useStocks, useSettings, useTheme } from './hooks';

// Services
import { autoRegisterFixedExpenses } from './services/autoRegisterService';

// Pages
import {
  LoginPage,
  CalendarPage,
  StatisticsPage,
  StockPage,
  FixedExpensePage,
  SearchPage,
  SettingsPage,
  PocketMoneyPage
} from './pages';

// Layout Components
import { Header, Sidebar } from './components/layout';

// Form Components
import { TransactionForm, FixedExpenseForm } from './components/forms';

// Utils
import { STORAGE_KEYS, saveToStorage, clearAllStorage } from './utils';

/**
 * 메인 애플리케이션 컴포넌트
 * SOLID 원칙을 준수하여 리팩토링됨
 *
 * SRP: App.js는 전체 앱 구조와 상태 관리만 담당
 * OCP: 새로운 뷰 추가 시 쉽게 확장 가능
 * DIP: 각 컴포넌트는 props를 통해 의존성 주입받음
 */
export default function App() {
  // ===== 1. 인증 상태 (useAuth 훅 사용) =====
  const {
    isAuthenticated,
    currentUser,
    familyInfo,
    pendingInvitations,
    userAvatar,
    loading: authLoading,
    handleLogin,
    handleLogout,
    handleChangeAvatar
  } = useAuth();

  // ===== 테마 관리 (useTheme 훅 사용) =====
  const { theme, changeTheme } = useTheme();

  // ===== 2. 거래 내역 상태 (useTransactions 훅 사용) =====
  const {
    transactions,
    loading: transactionsLoading,
    transactionForm,
    showAddTransaction,
    isEditMode,
    setTransactionForm,
    setShowAddTransaction,
    startAddTransaction,
    startEditTransaction,
    handleDeleteTransaction,
    handleSubmitTransaction,
    resetTransactionForm,
    registerFixedExpense,
    settlePocketMoney
  } = useTransactions(currentUser, familyInfo);

  // 디버그: 로딩 상태 로그
  console.log('🔍 App.js 로딩 상태:', {
    authLoading,
    transactionsLoading,
    isAuthenticated,
    currentUser: currentUser?.email
  });

  // ===== 3. 고정지출 상태 (useFixedExpenses 훅 사용) =====
  const {
    fixedExpenses,
    // loading: fixedExpensesLoading,  // 사용하지 않음
    fixedForm,
    showAddFixed,
    editingFixed,
    setFixedForm,
    setShowAddFixed,
    startAddFixed,
    startEditFixed,
    handleDeleteFixedExpense,
    handleToggleActive,
    handleSubmitFixed,
    resetFixedForm
  } = useFixedExpenses(currentUser, familyInfo);

  // ===== 4. 주식 상태 (useStocks 훅 사용) =====
  const {
    stocks,
    loading: stocksLoading,
    currentPrices,
    handleAddStock,
    handleDeleteStock,
    refreshPrices
  } = useStocks(currentUser);

  // ===== 5. 설정 상태 (useSettings 훅 사용) =====
  const { settings, updateSettings } = useSettings(currentUser);

  // ===== 5. 뷰 및 날짜 상태 =====
  const [currentView, setCurrentView] = useState('calendar');
  const [currentDate, setCurrentDate] = useState(new Date());

  // ===== 6. 검색 상태 =====
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilters, setSearchFilters] = useState({
    type: 'all',
    category: 'all',
    dateFrom: '',
    dateTo: '',
    amountMin: '',
    amountMax: '',
    user: 'all'
  });
  const [searchResults, setSearchResults] = useState([]);

  // ===== 7. 백업 모달 상태 =====
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [backupData, setBackupData] = useState('');

  // ===== 8. PWA 설치 프롬프트 상태 =====
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  // PWA 설치 프롬프트 이벤트 감지
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      // 기본 설치 배너 방지
      e.preventDefault();
      // 나중에 사용하기 위해 이벤트 저장
      setDeferredPrompt(e);
      // 커스텀 설치 버튼 표시
      setShowInstallPrompt(true);
      console.log('[PWA] 앱 설치 가능');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 이미 설치된 경우 감지
    if (window.matchMedia('(display-mode: standalone)').matches) {
      console.log('[PWA] 앱이 이미 설치되어 있습니다.');
      setShowInstallPrompt(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // PWA 설치 함수
  const handleInstallPWA = async () => {
    if (!deferredPrompt) {
      alert('이 브라우저에서는 앱 설치가 지원되지 않습니다.');
      return;
    }

    // 설치 프롬프트 표시
    deferredPrompt.prompt();

    // 사용자 선택 대기
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`[PWA] 사용자 선택: ${outcome}`);

    if (outcome === 'accepted') {
      console.log('[PWA] 앱 설치 수락');
      setShowInstallPrompt(false);
    } else {
      console.log('[PWA] 앱 설치 거절');
    }

    // 프롬프트는 한 번만 사용 가능
    setDeferredPrompt(null);
  };

  // ===== 고정지출 자동 등록 로직 =====
  useEffect(() => {
    // 로그인 및 데이터 로드 완료 후 자동 등록 체크
    if (isAuthenticated && currentUser && fixedExpenses.length > 0 && !transactionsLoading) {
      autoRegisterFixedExpenses(
        fixedExpenses,
        transactions,
        currentUser.id,
        registerFixedExpense
      ).then(count => {
        if (count > 0) {
          alert(`🎉 ${count}건의 고정지출이 자동으로 등록되었습니다!`);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, currentUser?.id, fixedExpenses.length]); // 로그인 및 고정지출 변경 시 실행

  // ===== 검색 관련 함수들 (useCallback으로 최적화) =====
  const performSearch = useCallback(() => {
    let results = [...transactions];

    // 텍스트 검색
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      results = results.filter(transaction => {
        const memo = (transaction.memo || '').toLowerCase();
        const category = transaction.category?.toLowerCase() || '';
        const subcategory = (transaction.subcategory || '').toLowerCase();
        return memo.includes(query) || category.includes(query) || subcategory.includes(query);
      });
    }

    // 타입 필터
    if (searchFilters.type !== 'all') {
      results = results.filter(t => t.type === searchFilters.type);
    }

    // 카테고리 필터
    if (searchFilters.category !== 'all') {
      results = results.filter(t => t.category === searchFilters.category);
    }

    // 날짜 범위 필터
    if (searchFilters.dateFrom) {
      results = results.filter(t => t.date >= searchFilters.dateFrom);
    }
    if (searchFilters.dateTo) {
      results = results.filter(t => t.date <= searchFilters.dateTo);
    }

    // 금액 범위 필터
    if (searchFilters.amountMin) {
      const minAmount = parseInt(searchFilters.amountMin);
      results = results.filter(t => t.amount >= minAmount);
    }
    if (searchFilters.amountMax) {
      const maxAmount = parseInt(searchFilters.amountMax);
      results = results.filter(t => t.amount <= maxAmount);
    }

    // 사용자 필터
    if (searchFilters.user !== 'all') {
      results = results.filter(t => t.userId === searchFilters.user);
    }

    // 날짜순 정렬 (최신순)
    results.sort((a, b) => new Date(b.date) - new Date(a.date));

    setSearchResults(results);
  }, [transactions, searchQuery, searchFilters]);

  const resetSearch = useCallback(() => {
    setSearchQuery('');
    setSearchFilters({
      type: 'all',
      category: 'all',
      dateFrom: '',
      dateTo: '',
      amountMin: '',
      amountMax: '',
      user: 'all'
    });
    setSearchResults([]);
  }, []);

  // ===== 설정 관련 함수들 (useCallback으로 최적화) =====
  const exportData = useCallback(() => {
    const exportObj = {
      transactions,
      fixedExpenses,
      settings,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    const dataStr = JSON.stringify(exportObj, null, 2);
    setBackupData(dataStr);
    setShowBackupModal(true);
  }, [transactions, fixedExpenses, settings]);

  const importData = useCallback((jsonStr) => {
    try {
      const importObj = JSON.parse(jsonStr);

      // 데이터 유효성 검사
      if (!importObj.transactions || !Array.isArray(importObj.transactions)) {
        alert('❌ 유효하지 않은 데이터 형식입니다.\n거래 내역을 찾을 수 없습니다.');
        return;
      }

      if (!importObj.fixedExpenses || !Array.isArray(importObj.fixedExpenses)) {
        alert('❌ 유효하지 않은 데이터 형식입니다.\n고정지출 내역을 찾을 수 없습니다.');
        return;
      }

      // 확인 다이얼로그
      const confirmed = window.confirm(
        `📥 데이터 가져오기\n\n` +
        `거래 내역: ${importObj.transactions.length}건\n` +
        `고정지출: ${importObj.fixedExpenses.length}건\n` +
        `백업 날짜: ${new Date(importObj.exportDate).toLocaleString('ko-KR')}\n\n` +
        `⚠️ 현재 데이터는 모두 삭제되고 백업 데이터로 대체됩니다.\n계속하시겠습니까?`
      );

      if (!confirmed) return;

      // 데이터 저장
      saveToStorage(STORAGE_KEYS.TRANSACTIONS, importObj.transactions);
      saveToStorage(STORAGE_KEYS.FIXED_EXPENSES, importObj.fixedExpenses);

      if (importObj.settings) {
        saveToStorage(STORAGE_KEYS.SETTINGS, importObj.settings);
      }

      alert('✅ 데이터를 성공적으로 가져왔습니다!\n\n페이지를 새로고침합니다.');
      window.location.reload();

    } catch (error) {
      console.error('Import error:', error);
      alert('❌ 데이터 가져오기 실패\n\n잘못된 JSON 형식이거나 파일이 손상되었습니다.');
    }
  }, []);

  const resetAllData = useCallback(() => {
    if (window.confirm('⚠️ 정말로 모든 데이터를 초기화하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.')) {
      // 모든 localStorage 데이터 삭제
      const success = clearAllStorage();

      if (success) {
        alert('✅ 모든 데이터가 초기화되었습니다.\n\n페이지를 새로고침합니다.');
        // 페이지 새로고침으로 초기 상태로 복원
        window.location.reload();
      } else {
        alert('❌ 데이터 초기화 중 오류가 발생했습니다.');
      }
    }
  }, []);

  const downloadBackup = useCallback(() => {
    const blob = new Blob([backupData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `가계부_백업_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [backupData]);

  // ===== 가족 관리 함수들 (useCallback으로 최적화) =====
  const handleCreateFamily = useCallback(async (familyName) => {
    try {
      const { createFamily } = await import('./firebase/databaseService');
      const familyId = await createFamily(
        currentUser.firebaseId,
        currentUser.name,
        familyName,
        userAvatar || '👨'  // 사용자 아바타 전달
      );
      console.log('✅ 가족 생성 완료:', familyId);
      alert(`🎉 "${familyName}" 가족 가계부가 생성되었습니다!`);

      // 페이지 새로고침으로 가족 정보 로드
      window.location.reload();
    } catch (error) {
      console.error('❌ 가족 생성 실패:', error);
      alert('가족 생성에 실패했습니다.');
    }
  }, [currentUser, userAvatar]);

  const handleInviteMember = useCallback(async (email) => {
    if (!familyInfo || !currentUser) return;

    // 이메일 유효성 검사
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      alert('❌ 유효한 이메일 주소를 입력해주세요.');
      return;
    }

    try {
      const { createInvitation } = await import('./firebase/databaseService');

      // 초대 생성 (이메일은 소문자로 정규화)
      await createInvitation(
        familyInfo.id,
        familyInfo.name,
        (currentUser.email || 'unknown@example.com').toLowerCase(),
        currentUser.name,
        trimmedEmail.toLowerCase()
      );

      console.log('✅ 초대 생성 완료:', trimmedEmail.toLowerCase());
      alert(`🎉 ${trimmedEmail}로 초대를 보냈습니다!\n\n해당 이메일로 Google 로그인하면 자동으로 초대를 확인할 수 있습니다.`);
    } catch (error) {
      console.error('❌ 초대 실패:', error);
      alert('초대에 실패했습니다.');
    }
  }, [familyInfo, currentUser]);

  const handleLeaveFamily = useCallback(async () => {
    if (!familyInfo) return;

    const confirmed = window.confirm(
      `⚠️ 가족 가계부에서 탈퇴하시겠습니까?\n\n` +
      `가족: ${familyInfo.name}\n\n` +
      `탈퇴 후에는 개인 가계부 모드로 전환됩니다.\n` +
      `가족 공유 데이터는 유지되지만 접근할 수 없게 됩니다.`
    );

    if (!confirmed) return;

    try {
      const { ref, database, remove } = await import('./firebase/config');

      // users/{userId}/familyId 삭제
      const userFamilyRef = ref(database, `users/${currentUser.firebaseId}/familyId`);
      await remove(userFamilyRef);

      // families/{familyId}/members/{userId} 삭제
      const memberRef = ref(database, `families/${familyInfo.id}/members/${currentUser.firebaseId}`);
      await remove(memberRef);

      console.log('✅ 가족 탈퇴 완료');
      alert('가족 가계부에서 탈퇴했습니다.');

      // 페이지 새로고침으로 개인 모드로 전환
      window.location.reload();
    } catch (error) {
      console.error('❌ 가족 탈퇴 실패:', error);
      alert('가족 탈퇴에 실패했습니다.');
    }
  }, [familyInfo, currentUser]);

  // ===== 초대 관련 함수들 (useCallback으로 최적화) =====
  const handleAcceptInvitation = useCallback(async (invitationId) => {
    try {
      const { acceptInvitation } = await import('./firebase/databaseService');

      const familyId = await acceptInvitation(
        invitationId,
        currentUser.firebaseId,
        currentUser.name,
        userAvatar || '👩'  // 사용자 아바타 전달
      );

      console.log('✅ 초대 수락 완료:', familyId);
      alert('🎉 가족 가계부에 참여했습니다!');

      // 페이지 새로고침으로 가족 모드로 전환
      window.location.reload();
    } catch (error) {
      console.error('❌ 초대 수락 실패:', error);
      alert('초대 수락에 실패했습니다.');
    }
  }, [currentUser, userAvatar]);

  const handleRejectInvitation = useCallback(async (invitationId) => {
    try {
      const { rejectInvitation } = await import('./firebase/databaseService');

      await rejectInvitation(invitationId);

      console.log('✅ 초대 거절 완료:', invitationId);
      alert('초대를 거절했습니다.');
    } catch (error) {
      console.error('❌ 초대 거절 실패:', error);
      alert('초대 거절에 실패했습니다.');
    }
  }, []);

  // ===== 인증 로딩 중 =====
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">로딩 중...</p>
        </div>
      </div>
    );
  }

  // ===== 로그인하지 않은 경우 =====
  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // ===== 데이터 로딩 중 =====
  // 주석 처리: 로딩 무한루프 방지
  // if (transactionsLoading || fixedExpensesLoading) {
  //   return (
  //     <div className="min-h-screen bg-animated flex items-center justify-center">
  //       <div className="text-center">
  //         <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
  //         <p className="text-gray-700 font-medium">데이터 불러오는 중...</p>
  //       </div>
  //     </div>
  //   );
  // }

  // ===== 메인 앱 레이아웃 =====
  return (
    <div className="min-h-screen bg-animated">
      {/* 헤더 */}
      <Header
        user={currentUser}
        onLogout={handleLogout}
        pendingInvitations={pendingInvitations}
        onAcceptInvitation={handleAcceptInvitation}
        onRejectInvitation={handleRejectInvitation}
        showInstallButton={showInstallPrompt}
        onInstallPWA={handleInstallPWA}
      />

      <div className="flex">
        {/* 사이드바 */}
        <Sidebar
          currentView={currentView}
          onViewChange={setCurrentView}
        />

        {/* 메인 컨텐츠 */}
        <main className="flex-1 p-4 sm:p-8">
          {currentView === 'calendar' && (
            <CalendarPage
              currentDate={currentDate}
              onDateChange={setCurrentDate}
              transactions={transactions}
              fixedExpenses={fixedExpenses}
              onAddTransaction={startAddTransaction}
              onEditTransaction={startEditTransaction}
              onDeleteTransaction={handleDeleteTransaction}
            />
          )}

          {currentView === 'statistics' && (
            <StatisticsPage
              currentDate={currentDate}
              onDateChange={setCurrentDate}
              transactions={transactions}
              settings={settings}
              familyInfo={familyInfo}
              currentUser={currentUser}
              onSettlePocketMoney={settlePocketMoney}
            />
          )}

          {currentView === 'stocks' && (
            <StockPage
              stocks={stocks}
              currentPrices={currentPrices}
              loading={stocksLoading}
              onAddStock={handleAddStock}
              onDeleteStock={handleDeleteStock}
              onRefreshPrices={refreshPrices}
            />
          )}

          {currentView === 'fixed' && (
            <FixedExpensePage
              fixedExpenses={fixedExpenses}
              onAdd={startAddFixed}
              onEdit={startEditFixed}
              onDelete={handleDeleteFixedExpense}
              onToggleActive={handleToggleActive}
            />
          )}

          {currentView === 'search' && (
            <SearchPage
              searchQuery={searchQuery}
              searchFilters={searchFilters}
              searchResults={searchResults}
              onSearchQueryChange={setSearchQuery}
              onSearchFiltersChange={setSearchFilters}
              onPerformSearch={performSearch}
              onResetSearch={resetSearch}
              onEditTransaction={startEditTransaction}
              onDeleteTransaction={handleDeleteTransaction}
            />
          )}

          {currentView === 'pocketmoney' && (
            <PocketMoneyPage
              currentUser={currentUser}
            />
          )}

          {currentView === 'settings' && (
            <SettingsPage
              settings={settings}
              transactions={transactions}
              fixedExpenses={fixedExpenses}
              onUpdateSettings={updateSettings}
              onExportData={exportData}
              onImportData={importData}
              onResetData={resetAllData}
              showBackupModal={showBackupModal}
              backupData={backupData}
              onShowBackupModal={setShowBackupModal}
              onDownloadBackup={downloadBackup}
              currentUser={currentUser}
              familyInfo={familyInfo}
              onCreateFamily={handleCreateFamily}
              onInviteMember={handleInviteMember}
              onLeaveFamily={handleLeaveFamily}
              theme={theme}
              onChangeTheme={changeTheme}
              userAvatar={userAvatar}
              onChangeAvatar={handleChangeAvatar}
            />
          )}
        </main>
      </div>

      {/* 거래 추가/수정 폼 모달 */}
      <TransactionForm
        isOpen={showAddTransaction}
        onClose={() => {
          setShowAddTransaction(false);
          resetTransactionForm();
        }}
        formData={transactionForm}
        onFormChange={setTransactionForm}
        onSubmit={handleSubmitTransaction}
        isEditMode={isEditMode}
      />

      {/* 고정지출 추가/수정 폼 모달 */}
      <FixedExpenseForm
        isOpen={showAddFixed}
        onClose={() => {
          setShowAddFixed(false);
          resetFixedForm();
        }}
        formData={fixedForm}
        onFormChange={setFixedForm}
        onSubmit={handleSubmitFixed}
        isEditMode={!!editingFixed}
      />
    </div>
  );
}
