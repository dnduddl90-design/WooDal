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
    handleLogin,
    handleLogout
  } = useAuth();

  // ===== 2. 거래 내역 상태 (useTransactions 훅 사용) =====
  const {
    transactions,
    transactionForm,
    showAddTransaction,
    isEditMode,
    setTransactionForm,
    setShowAddTransaction,
    startAddTransaction,
    startEditTransaction,
    handleDeleteTransaction,
    handleSubmitTransaction,
    resetTransactionForm
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
      if (importObj.transactions) {
        alert('데이터 가져오기는 개발 중입니다.');
      }
    } catch (error) {
      alert('잘못된 데이터 형식입니다.');
    }
  };

  const resetAllData = () => {
    if (window.confirm('⚠️ 정말로 모든 데이터를 초기화하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.')) {
      alert('데이터 초기화는 개발 중입니다.');
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

  // ===== 로그인하지 않은 경우 =====
  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
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
