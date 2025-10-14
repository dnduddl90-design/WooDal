import React, { useState, useEffect } from 'react';

// Hooks
import { useAuth, useTransactions, useFixedExpenses } from './hooks';

// Pages
import {
  LoginPage,
  CalendarPage,
  StatisticsPage,
  FixedExpensePage,
  SearchPage,
  SettingsPage
} from './pages';

// Layout Components
import { Header, Sidebar } from './components/layout';

// Form Components
import { TransactionForm, FixedExpenseForm } from './components/forms';

// Utils
import { STORAGE_KEYS, loadFromStorage, saveToStorage, clearAllStorage } from './utils';

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
    loading: authLoading,
    handleLogin,
    handleLogout
  } = useAuth();

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
    registerFixedExpense
  } = useTransactions(currentUser);

  // ===== 3. 고정지출 상태 (useFixedExpenses 훅 사용) =====
  const {
    fixedExpenses,
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
  } = useFixedExpenses();

  // ===== 4. 뷰 및 날짜 상태 =====
  const [currentView, setCurrentView] = useState('calendar');
  const [currentDate, setCurrentDate] = useState(new Date());

  // ===== 5. 검색 상태 =====
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

  // ===== 6. 설정 상태 (localStorage에서 불러오기) =====
  const [settings, setSettings] = useState(() => {
    return loadFromStorage(STORAGE_KEYS.SETTINGS, {
      theme: 'default',
      currency: 'KRW',
      dateFormat: 'ko-KR',
      budget: {
        monthly: '',
        categories: {
          food: '', transport: '', living: '', medical: '',
          culture: '', fashion: '', communication: ''
        }
      },
      notifications: {
        budgetAlert: true,
        dailyReminder: false,
        weeklyReport: true
      },
      backup: {
        autoBackup: true,
        backupFrequency: 'weekly'
      }
    });
  });
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [backupData, setBackupData] = useState('');

  // settings가 변경될 때마다 localStorage에 저장
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.SETTINGS, settings);
  }, [settings]);

  // ===== 고정지출 자동 등록 로직 =====
  /**
   * 특정 월의 고정지출을 자동으로 등록
   * 현재 날짜가 autoRegisterDate를 지났고, 아직 등록되지 않은 경우에만 등록
   */
  const autoRegisterFixedExpenses = () => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const currentDay = today.getDate();

    let registeredCount = 0;

    fixedExpenses.forEach(fixed => {
      if (!fixed.isActive) return; // 비활성 고정지출은 무시

      // 등록 날짜가 현재 날짜보다 이전인 경우
      if (fixed.autoRegisterDate <= currentDay) {
        const registerDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(fixed.autoRegisterDate).padStart(2, '0')}`;

        // 이미 해당 고정지출이 해당 날짜에 등록되었는지 확인
        const alreadyRegistered = transactions.some(
          t => t.fixedExpenseId === fixed.id && t.date === registerDate
        );

        if (!alreadyRegistered) {
          registerFixedExpense(fixed, registerDate);
          registeredCount++;
        }
      }
    });

    return registeredCount;
  };

  // 앱 로드 시 1회 실행 (로그인 후에만)
  useEffect(() => {
    if (isAuthenticated && fixedExpenses.length > 0) {
      const count = autoRegisterFixedExpenses();
      if (count > 0) {
        console.log(`✅ 고정지출 ${count}건이 자동 등록되었습니다.`);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]); // 로그인 시에만 실행

  // ===== 테마 적용 =====
  useEffect(() => {
    const root = document.documentElement;

    // 모든 테마 클래스 제거
    document.body.classList.remove('dark-theme', 'colorful-theme');

    if (settings.theme === 'dark') {
      root.style.setProperty('--bg-primary', '#1a1a2e');
      root.style.setProperty('--bg-secondary', '#16213e');
      root.style.setProperty('--text-primary', '#eee');
      root.style.setProperty('--text-secondary', '#aaa');
      document.body.classList.add('dark-theme');
    } else if (settings.theme === 'colorful') {
      root.style.setProperty('--bg-primary', '#ffeaa7');
      root.style.setProperty('--bg-secondary', '#fdcb6e');
      root.style.setProperty('--text-primary', '#2d3436');
      root.style.setProperty('--text-secondary', '#636e72');
      document.body.classList.add('colorful-theme');
    } else {
      // 기본 테마
      root.style.removeProperty('--bg-primary');
      root.style.removeProperty('--bg-secondary');
      root.style.removeProperty('--text-primary');
      root.style.removeProperty('--text-secondary');
    }
  }, [settings.theme]);

  // ===== 검색 관련 함수들 =====
  const performSearch = () => {
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
  };

  const resetSearch = () => {
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
  };

  // ===== 설정 관련 함수들 =====
  const updateSettings = (newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const exportData = () => {
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
  };

  const importData = (jsonStr) => {
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
  };

  const resetAllData = () => {
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
  };

  const downloadBackup = () => {
    const blob = new Blob([backupData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `가계부_백업_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

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
  if (transactionsLoading) {
    return (
      <div className="min-h-screen bg-animated flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium">거래 내역 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // ===== 메인 앱 레이아웃 =====
  return (
    <div className="min-h-screen bg-animated">
      {/* 헤더 */}
      <Header
        user={currentUser}
        onLogout={handleLogout}
      />

      <div className="flex">
        {/* 사이드바 */}
        <Sidebar
          currentView={currentView}
          onViewChange={setCurrentView}
        />

        {/* 메인 컨텐츠 */}
        <main className="flex-1 p-8">
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
