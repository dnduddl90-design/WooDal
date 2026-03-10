import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, TrendingUp, Receipt, PiggyBank } from 'lucide-react';
import { CATEGORIES } from '../constants';
import {
  formatCurrency,
  calculateMonthsSince,
  formatDate,
  getAvailableUsers,
  parseDateString,
  resolveUserInfo,
  sortByDateDesc
} from '../utils';
import { Button, Modal } from '../components/common';

/**
 * 통계 페이지 컴포넌트
 * SRP: 통계 UI 렌더링만 담당
 * DIP: Props를 통해 데이터 주입받음
 */
export const StatisticsPage = ({
  currentDate,
  onDateChange,
  transactions = [],
  fixedExpenses = [],
  settings = { budget: { monthly: '' } },
  familyInfo = null,
  currentUser = null,
  onSettlePocketMoney
}) => {
  const getUserInfo = useMemo(() => {
    return (userId, options = {}) => resolveUserInfo(userId, familyInfo, currentUser, options);
  }, [familyInfo, currentUser]);
  // 카테고리 세부 내역 모달 상태
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  // 사용자 필터 상태 ('all', userId)
  const [userFilter, setUserFilter] = useState('all');

  // 가족 구성원 목록 (필터 버튼용)
  const familyMembers = useMemo(() => {
    return getAvailableUsers(familyInfo, currentUser).map((user) =>
      getUserInfo(user.id, { shortName: true })
    );
  }, [familyInfo, currentUser, getUserInfo]);
  // 월 이동 핸들러
  const handlePrevMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    onDateChange(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    onDateChange(newDate);
  };

  const handleThisMonth = () => {
    onDateChange(new Date());
  };

  // 현재 월의 데이터 계산
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0);

  const currentMonthData = transactions.filter(t => {
    const transactionDate = parseDateString(t.date);
    return transactionDate >= startDate && transactionDate <= endDate;
  });

  // 현재 월의 활성화된 고정지출 계산
  const currentMonthFixedExpenses = useMemo(() => {
    const monthStr = formatDate(new Date(year, month, 15)); // 월 중간 날짜 사용

    return fixedExpenses
      .filter(fixed => {
        // 비활성화된 고정지출 제외
        if (!fixed.isActive) return false;

        // 무기한 고정지출
        if (fixed.isUnlimited !== false) return true;

        // 기간 제한 고정지출
        if (fixed.startDate && monthStr < fixed.startDate) return false;
        if (fixed.endDate && monthStr > fixed.endDate) return false;

        return true;
      })
      .map(fixed => {
        // 월 증감액 계산
        const monthsSinceBase = calculateMonthsSince(fixed.baseDate, monthStr);
        const monthlyIncrease = fixed.monthlyIncrease || 0;
        const calculatedAmount = fixed.amount + (monthlyIncrease * monthsSinceBase);

        return {
          ...fixed,
          calculatedAmount
        };
      });
  }, [fixedExpenses, year, month]);

  // 고정지출 총액
  const fixedExpenseTotal = currentMonthFixedExpenses.reduce((sum, fixed) => sum + fixed.calculatedAmount, 0);

  // 이전 월 데이터 계산
  const prevYear = month === 0 ? year - 1 : year;
  const prevMonth = month === 0 ? 11 : month - 1;
  const prevStartDate = new Date(prevYear, prevMonth, 1);
  const prevEndDate = new Date(prevYear, prevMonth + 1, 0);

  const previousMonthData = transactions.filter(t => {
    const transactionDate = parseDateString(t.date);
    return transactionDate >= prevStartDate && transactionDate <= prevEndDate;
  });

  // 수입/지출 계산
  const currentIncome = currentMonthData
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  // 거래 내역에서 저축 카테고리 지출 계산
  const transactionSavings = currentMonthData
    .filter(t => t.type === 'expense' && t.category === 'savings')
    .reduce((sum, t) => sum + t.amount, 0);

  // 고정지출에서 저축 카테고리 금액 계산
  const fixedSavings = currentMonthFixedExpenses
    .filter(fixed => fixed.category === 'savings')
    .reduce((sum, fixed) => sum + fixed.calculatedAmount, 0);

  // 저축 카테고리 지출 총액 (거래 + 고정지출)
  const currentSavings = transactionSavings + fixedSavings;

  // 거래 내역 총 지출 (저축 포함)
  const transactionExpenseTotal = currentMonthData
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  // 총 지출 (거래 + 고정지출, 저축 포함)
  const currentExpenseTotal = transactionExpenseTotal + fixedExpenseTotal;

  // 실제 소비 지출 (저축 제외)
  const currentExpense = currentExpenseTotal - currentSavings;

  const previousIncome = previousMonthData
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const previousSavings = previousMonthData
    .filter(t => t.type === 'expense' && t.category === 'savings')
    .reduce((sum, t) => sum + t.amount, 0);

  const previousExpenseTotal = previousMonthData
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const previousExpense = previousExpenseTotal - previousSavings;

  // 카테고리별 지출 계산 (거래 + 고정지출)
  const expensesByCategory = currentMonthData
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      const category = CATEGORIES.expense.find(c => c.id === t.category);
      const categoryName = category ? category.name : '기타';
      acc[categoryName] = (acc[categoryName] || 0) + t.amount;
      return acc;
    }, {});

  // 고정지출을 카테고리별 지출에 추가
  currentMonthFixedExpenses.forEach(fixed => {
    const category = CATEGORIES.expense.find(c => c.id === fixed.category);
    const categoryName = category ? category.name : '기타';
    expensesByCategory[categoryName] = (expensesByCategory[categoryName] || 0) + fixed.calculatedAmount;
  });

  // 카테고리 클릭 핸들러
  const handleCategoryClick = (categoryName) => {
    // 해당 카테고리의 거래 내역 필터링
    const category = CATEGORIES.expense.find(c => c.name === categoryName);

    const categoryTransactions = currentMonthData
      .filter(t => {
        if (t.type !== 'expense') return false;
        const transactionCategory = CATEGORIES.expense.find(c => c.id === t.category);
        const transactionCategoryName = transactionCategory ? transactionCategory.name : '기타';
        return transactionCategoryName === categoryName;
      })
      .map(t => ({ ...t, isFixed: false })); // 일반 거래 표시

    // 해당 카테고리의 고정지출 추가
    const categoryFixedExpenses = currentMonthFixedExpenses
      .filter(fixed => {
        const fixedCategory = CATEGORIES.expense.find(c => c.id === fixed.category);
        const fixedCategoryName = fixedCategory ? fixedCategory.name : '기타';
        return fixedCategoryName === categoryName;
      })
      .map(fixed => ({
        id: `fixed-${fixed.id}`,
        type: 'expense',
        category: fixed.category,
        subcategory: fixed.subcategory,
        amount: fixed.calculatedAmount,
        paymentMethod: fixed.paymentMethod,
        memo: `[고정지출] ${fixed.name}${fixed.memo ? ` - ${fixed.memo}` : ''}`,
        date: formatDate(new Date(year, month, fixed.autoRegisterDate || 1)),
        userId: currentUser?.id || 'unknown',
        isFixed: true // 고정지출 표시
      }));

    // 거래 + 고정지출 합치기
    const allItems = sortByDateDesc([...categoryTransactions, ...categoryFixedExpenses]);

    setSelectedCategory({
      name: categoryName,
      transactions: allItems,
      total: expensesByCategory[categoryName] || 0,
      icon: category?.icon,
      color: category?.color
    });
    setUserFilter('all'); // 모달 열 때마다 필터 초기화
    setShowCategoryModal(true);
  };

  // 필터링된 거래 내역 계산
  const getFilteredTransactions = () => {
    if (!selectedCategory) return [];

    if (userFilter === 'all') {
      return selectedCategory.transactions;
    }

    return selectedCategory.transactions.filter(t => t.userId === userFilter);
  };

  // 변화율 계산
  const incomeChange = previousIncome > 0 ? ((currentIncome - previousIncome) / previousIncome) * 100 : 0;
  const expenseChange = previousExpense > 0 ? ((currentExpense - previousExpense) / previousExpense) * 100 : 0;

  // 저축 = 저축 카테고리 금액 (실제로 저축한 금액)
  const savingChange = currentSavings;
  const savingRate = currentIncome > 0 ? (savingChange / currentIncome) * 100 : 0;

  // 최근 6개월 데이터 계산 (월별 비교)
  const last6Months = [];
  for (let i = 5; i >= 0; i--) {
    const targetDate = new Date(year, month - i, 1);
    const targetYear = targetDate.getFullYear();
    const targetMonth = targetDate.getMonth();
    const monthStart = new Date(targetYear, targetMonth, 1);
    const monthEnd = new Date(targetYear, targetMonth + 1, 0);

    const monthData = transactions.filter(t => {
      const transactionDate = parseDateString(t.date);
      return transactionDate >= monthStart && transactionDate <= monthEnd;
    });

    // 해당 월의 고정지출 계산
    const monthStr = formatDate(new Date(targetYear, targetMonth, 15));
    const monthFixedExpenses = fixedExpenses
      .filter(fixed => {
        if (!fixed.isActive) return false;
        if (fixed.isUnlimited !== false) return true;
        if (fixed.startDate && monthStr < fixed.startDate) return false;
        if (fixed.endDate && monthStr > fixed.endDate) return false;
        return true;
      })
      .map(fixed => {
        const monthsSinceBase = calculateMonthsSince(fixed.baseDate, monthStr);
        const monthlyIncrease = fixed.monthlyIncrease || 0;
        return {
          ...fixed,
          calculatedAmount: fixed.amount + (monthlyIncrease * monthsSinceBase)
        };
      });

    const income = monthData.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);

    // 거래 내역 저축
    const transactionSavings = monthData.filter(t => t.type === 'expense' && t.category === 'savings').reduce((sum, t) => sum + t.amount, 0);
    // 고정지출 저축
    const fixedSavings = monthFixedExpenses.filter(fixed => fixed.category === 'savings').reduce((sum, fixed) => sum + fixed.calculatedAmount, 0);
    const savings = transactionSavings + fixedSavings;

    // 거래 내역 지출
    const transactionExpenseTotal = monthData.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    // 고정지출 총액
    const fixedExpenseTotal = monthFixedExpenses.reduce((sum, fixed) => sum + fixed.calculatedAmount, 0);
    // 전체 지출 (저축 제외)
    const expenseTotal = transactionExpenseTotal + fixedExpenseTotal;
    const expense = expenseTotal - savings;

    last6Months.push({
      month: `${targetMonth + 1}월`,
      income,
      expense,
      saving: savings
    });
  }

  // 가족 구성원별 지출 (familyInfo가 있을 때만, 저축 제외)
  const expensesByUser = currentMonthData
    .filter(t => t.type === 'expense' && t.category !== 'savings')
    .reduce((acc, t) => {
      const userId = t.userId || 'unknown';
      acc[userId] = (acc[userId] || 0) + t.amount;
      return acc;
    }, {});

  // 고정지출 중 저축 제외한 금액을 가족 구성원별로 추가
  // 고정지출은 admin 또는 첫 번째 구성원에게 할당
  const adminUserId = familyInfo
    ? Object.keys(familyInfo.members || {}).find(id => familyInfo.members[id].role === 'admin') || Object.keys(familyInfo.members || {})[0]
    : currentUser?.id || 'user1';

  currentMonthFixedExpenses
    .filter(fixed => fixed.category !== 'savings')
    .forEach(fixed => {
      const userId = fixed.userId || adminUserId;
      expensesByUser[userId] = (expensesByUser[userId] || 0) + fixed.calculatedAmount;
    });

  // 가족 구성원별 저축 (저축 카테고리만)
  const savingsByUser = currentMonthData
    .filter(t => t.type === 'expense' && t.category === 'savings')
    .reduce((acc, t) => {
      const userId = t.userId || 'unknown';
      acc[userId] = (acc[userId] || 0) + t.amount;
      return acc;
    }, {});

  // 고정지출 중 저축을 가족 구성원별로 추가
  currentMonthFixedExpenses
    .filter(fixed => fixed.category === 'savings')
    .forEach(fixed => {
      const userId = fixed.userId || adminUserId;
      savingsByUser[userId] = (savingsByUser[userId] || 0) + fixed.calculatedAmount;
    });

  // 사용자별 용돈 사용 내역 계산
  const pocketMoneyByUser = currentMonthData
    .filter(t => t.type === 'expense' && t.isPocketMoney === true)
    .reduce((acc, t) => {
      const userId = t.userId || 'unknown';
      if (!acc[userId]) {
        acc[userId] = {
          total: 0,
          transactions: []
        };
      }
      acc[userId].total += t.amount;
      acc[userId].transactions.push(t);
      return acc;
    }, {});

  // 전체 용돈 사용 금액
  const totalPocketMoney = Object.values(pocketMoneyByUser).reduce((sum, data) => sum + data.total, 0);

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in pb-20 sm:pb-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg sm:text-2xl font-bold gradient-text">
          {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월 통계
        </h2>
        <div className="flex space-x-1 sm:space-x-3">
          <button
            onClick={handlePrevMonth}
            className="p-2 sm:p-3 hover:bg-gray-100 rounded-xl transition-colors btn-animate"
          >
            <ChevronLeft size={18} className="sm:w-5 sm:h-5" />
          </button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleThisMonth}
            className="text-xs sm:text-sm px-2 sm:px-3"
          >
            이번 달
          </Button>
          <button
            onClick={handleNextMonth}
            className="p-2 sm:p-3 hover:bg-gray-100 rounded-xl transition-colors btn-animate"
          >
            <ChevronRight size={18} className="sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      {/* 요약 카드들 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-6">
        {/* 수입 카드 */}
        <div className="glass-effect rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-shadow card-hover">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-gray-600 mb-1">이번 달 수입</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-800 truncate">
                {formatCurrency(currentIncome)}원
              </p>
              {incomeChange !== 0 && (
                <div className={`flex items-center mt-1 sm:mt-2 text-xs sm:text-sm ${
                  incomeChange >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  <span className="truncate">전월 대비 </span>
                  <span className="font-semibold ml-1 flex-shrink-0">
                    {incomeChange > 0 ? '+' : ''}{incomeChange.toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
            <div className="p-3 sm:p-4 rounded-full bg-green-100 text-green-600 flex-shrink-0">
              <TrendingUp size={24} className="sm:w-8 sm:h-8" />
            </div>
          </div>
        </div>

        {/* 지출 카드 */}
        <div className="glass-effect rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-shadow card-hover">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-gray-600 mb-1">이번 달 지출</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-800 truncate">
                {formatCurrency(currentExpense)}원
              </p>
              {expenseChange !== 0 && (
                <div className={`flex items-center mt-1 sm:mt-2 text-xs sm:text-sm ${
                  expenseChange <= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  <span className="truncate">전월 대비 </span>
                  <span className="font-semibold ml-1 flex-shrink-0">
                    {expenseChange > 0 ? '+' : ''}{expenseChange.toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
            <div className="p-3 sm:p-4 rounded-full bg-red-100 text-red-600 flex-shrink-0">
              <Receipt size={24} className="sm:w-8 sm:h-8" />
            </div>
          </div>
        </div>

        {/* 저축 카드 */}
        <div className="glass-effect rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-shadow card-hover">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-gray-600 mb-1">이번 달 저축</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-800 truncate">
                {formatCurrency(savingChange)}원
              </p>
              {currentIncome > 0 && (
                <div className="flex items-center mt-1 sm:mt-2 text-xs sm:text-sm text-blue-600">
                  <span>저축률: </span>
                  <span className="font-semibold ml-1">
                    {savingRate.toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
            <div className={`p-3 sm:p-4 rounded-full flex-shrink-0 ${
              savingChange >= 0 ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'
            }`}>
              <PiggyBank size={24} className="sm:w-8 sm:h-8" />
            </div>
          </div>
        </div>
      </div>

      {/* 예산 진행률 */}
      {settings.budget.monthly && parseInt(settings.budget.monthly) > 0 && (
        <div className="glass-effect rounded-xl p-4 sm:p-6 shadow-lg">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-base sm:text-lg font-bold text-gray-800">월 예산 진행률</h3>
            <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
              currentExpense <= parseInt(settings.budget.monthly)
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}>
              {((currentExpense / parseInt(settings.budget.monthly)) * 100).toFixed(1)}%
            </span>
          </div>

          {/* 진행률 바 */}
          <div className="mb-3 sm:mb-4">
            <div className="w-full bg-gray-200 rounded-full h-6 sm:h-8 relative overflow-hidden">
              <div
                className={`h-6 sm:h-8 rounded-full transition-all duration-1000 ease-out ${
                  currentExpense <= parseInt(settings.budget.monthly)
                    ? 'bg-gradient-to-r from-green-400 to-green-600'
                    : 'bg-gradient-to-r from-red-400 to-red-600'
                }`}
                style={{
                  width: `${Math.min((currentExpense / parseInt(settings.budget.monthly)) * 100, 100)}%`
                }}
              >
                {currentExpense > 0 && (
                  <div className="flex items-center justify-center h-full text-xs sm:text-sm font-bold text-white">
                    {formatCurrency(currentExpense)}원
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 상세 정보 */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
            <div className="bg-blue-50 p-2 sm:p-3 rounded-lg">
              <p className="text-[10px] sm:text-xs text-gray-600 mb-0.5 sm:mb-1">예산</p>
              <p className="text-xs sm:text-sm font-bold text-blue-600 truncate">
                {formatCurrency(parseInt(settings.budget.monthly))}원
              </p>
            </div>
            <div className={`p-2 sm:p-3 rounded-lg ${
              currentExpense <= parseInt(settings.budget.monthly)
                ? 'bg-green-50'
                : 'bg-red-50'
            }`}>
              <p className="text-[10px] sm:text-xs text-gray-600 mb-0.5 sm:mb-1">사용</p>
              <p className={`text-xs sm:text-sm font-bold truncate ${
                currentExpense <= parseInt(settings.budget.monthly)
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}>
                {formatCurrency(currentExpense)}원
              </p>
            </div>
            <div className="bg-purple-50 p-2 sm:p-3 rounded-lg">
              <p className="text-[10px] sm:text-xs text-gray-600 mb-0.5 sm:mb-1">남은 예산</p>
              <p className={`text-xs sm:text-sm font-bold truncate ${
                parseInt(settings.budget.monthly) - currentExpense >= 0
                  ? 'text-purple-600'
                  : 'text-red-600'
              }`}>
                {formatCurrency(Math.max(parseInt(settings.budget.monthly) - currentExpense, 0))}원
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 카테고리별 예산 진행률 */}
      {settings.budget.categories && Object.keys(settings.budget.categories).some(k => settings.budget.categories[k] > 0) && (
        <div className="glass-effect rounded-xl p-4 sm:p-6 shadow-lg">
          <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4">카테고리별 예산</h3>
          <div className="space-y-3 sm:space-y-4">
            {CATEGORIES.expense.map(category => {
              const budgetAmount = parseInt(settings.budget.categories[category.id]) || 0;
              if (budgetAmount === 0) return null;

              // 거래 내역 지출
              const transactionSpent = currentMonthData
                .filter(t => t.type === 'expense' && t.category === category.id)
                .reduce((sum, t) => sum + t.amount, 0);

              // 고정지출
              const fixedSpent = currentMonthFixedExpenses
                .filter(fixed => fixed.category === category.id)
                .reduce((sum, fixed) => sum + fixed.calculatedAmount, 0);

              // 총 지출 (거래 + 고정지출)
              const spentAmount = transactionSpent + fixedSpent;

              const percentage = budgetAmount > 0 ? (spentAmount / budgetAmount) * 100 : 0;
              const Icon = category.icon;
              const isOverBudget = spentAmount > budgetAmount;

              return (
                <div key={category.id} className="space-y-1.5 sm:space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 sm:p-2 rounded-lg ${category.color}`}>
                        <Icon size={14} className="sm:w-4 sm:h-4" />
                      </div>
                      <span className="text-xs sm:text-sm font-medium text-gray-700">
                        {category.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs sm:text-sm font-bold ${
                        isOverBudget ? 'text-red-600' : 'text-gray-800'
                      }`}>
                        {formatCurrency(spentAmount)}원
                      </span>
                      <span className="text-[10px] sm:text-xs text-gray-500">
                        / {formatCurrency(budgetAmount)}원
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 sm:h-2.5">
                    <div
                      className={`h-2 sm:h-2.5 rounded-full transition-all duration-1000 ease-out ${
                        isOverBudget
                          ? 'bg-gradient-to-r from-red-400 to-red-600'
                          : percentage > 80
                          ? 'bg-gradient-to-r from-orange-400 to-orange-600'
                          : 'bg-gradient-to-r from-green-400 to-green-600'
                      }`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                  {isOverBudget && (
                    <p className="text-[10px] sm:text-xs text-red-600 font-medium">
                      ⚠️ {formatCurrency(spentAmount - budgetAmount)}원 초과
                    </p>
                  )}
                </div>
              );
            }).filter(Boolean)}
          </div>
        </div>
      )}

      {/* 카테고리별 지출 차트 */}
      <div className="glass-effect rounded-xl p-4 sm:p-6 shadow-lg">
        <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-4 sm:mb-6">카테고리별 지출</h3>

        {Object.keys(expensesByCategory).length > 0 ? (
          <div className="space-y-3 sm:space-y-4">
            {Object.entries(expensesByCategory)
              .sort(([,a], [,b]) => b - a)
              .map(([category, amount], index) => {
                const maxAmount = Math.max(...Object.values(expensesByCategory));
                const percentage = maxAmount > 0 ? (amount / maxAmount) * 100 : 0;
                const colors = [
                  'bg-blue-500', 'bg-red-500', 'bg-green-500',
                  'bg-yellow-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500'
                ];

                return (
                  <div
                    key={category}
                    className="space-y-1.5 sm:space-y-2 cursor-pointer hover:bg-gray-50 p-2 sm:p-3 rounded-lg transition-colors"
                    onClick={() => handleCategoryClick(category)}
                  >
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-gray-700 font-medium truncate mr-2">{category}</span>
                      <span className="font-bold text-gray-800 flex-shrink-0">
                        {formatCurrency(amount)}원
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 sm:h-3">
                      <div
                        className={`h-2.5 sm:h-3 rounded-full transition-all duration-1000 ease-out ${colors[index % colors.length]}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        ) : (
          <div className="text-center py-6 sm:py-8">
            <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">📊</div>
            <p className="text-sm sm:text-base text-gray-500">이번 달 지출 내역이 없습니다</p>
          </div>
        )}
      </div>

      {/* 예산 초과 알림 */}
      {settings.budget.monthly && currentExpense > parseInt(settings.budget.monthly) && settings.notifications?.budgetAlert && (
        <div className="glass-effect rounded-xl p-4 sm:p-6 shadow-lg bg-gradient-to-r from-red-100 to-orange-100 border-2 border-red-400 animate-pulse">
          <h3 className="text-base sm:text-lg font-bold text-red-700 mb-2 sm:mb-3">
            🚨 예산 초과 경고!
          </h3>
          <p className="text-sm sm:text-base text-gray-800 mb-2">
            이번 달 지출이 설정한 예산을 <span className="font-bold text-red-600">
              {formatCurrency(currentExpense - parseInt(settings.budget.monthly))}원
            </span> 초과했습니다!
          </p>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 mt-3 pt-3 border-t border-red-300">
            <span className="text-xs sm:text-sm text-gray-700">예산: {formatCurrency(parseInt(settings.budget.monthly))}원</span>
            <span className="text-xs sm:text-sm font-bold text-red-600">지출: {formatCurrency(currentExpense)}원</span>
          </div>
        </div>
      )}

      {/* 재정 건강 알림 */}
      {currentMonthData.length > 0 && (
        <div className={`glass-effect rounded-xl p-4 sm:p-6 shadow-lg ${
          currentIncome >= currentExpense
            ? 'bg-gradient-to-r from-green-50 to-blue-50'
            : 'bg-gradient-to-r from-red-50 to-orange-50'
        }`}>
          <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4">
            💡 이번 달 가계 분석
          </h3>
          {currentIncome >= currentExpense ? (
            <div>
              <p className="text-sm sm:text-base text-gray-700 mb-2">
                🎉 훌륭합니다! 이번 달 <span className="font-bold text-green-600">
                  {formatCurrency(savingChange)}원
                </span>을 저축했습니다.
              </p>
              <p className="text-xs sm:text-sm text-gray-600 mb-2">
                저축률 {savingRate.toFixed(1)}%를 달성했습니다. 계속 이런 습관을 유지하세요!
              </p>
              {currentIncome > currentExpense + currentSavings && (
                <p className="text-xs sm:text-sm text-blue-600">
                  추가로 <span className="font-semibold">{formatCurrency(currentIncome - currentExpense - currentSavings)}원</span>의 여유 자금이 있습니다.
                </p>
              )}
            </div>
          ) : (
            <div>
              <p className="text-sm sm:text-base text-gray-700 mb-2">
                ⚠️ 이번 달 지출이 수입을 <span className="font-bold text-red-600">
                  {formatCurrency(currentExpense - currentIncome)}원
                </span> 초과했습니다.
              </p>
              <p className="text-xs sm:text-sm text-gray-600">
                다음 달에는 지출을 줄이고 저축을 늘려보세요!
              </p>
            </div>
          )}
        </div>
      )}

      {/* 최근 6개월 트렌드 */}
      {last6Months.length > 0 && last6Months.some(m => m.income > 0 || m.expense > 0) && (
        <div className="glass-effect rounded-xl p-4 sm:p-6 shadow-lg">
          <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-4 sm:mb-6">
            📈 최근 6개월 트렌드
          </h3>
          <div className="space-y-3 sm:space-y-4">
            {last6Months.map((monthData, index) => {
              // 각 월별로 개별 최대값 기준으로 계산
              const maxAmount = Math.max(monthData.income, monthData.expense, monthData.saving);
              const incomePercentage = maxAmount > 0 ? (monthData.income / maxAmount) * 100 : 0;
              const expensePercentage = maxAmount > 0 ? (monthData.expense / maxAmount) * 100 : 0;
              const savingPercentage = maxAmount > 0 ? (monthData.saving / maxAmount) * 100 : 0;
              const isCurrentMonth = index === last6Months.length - 1;

              return (
                <div key={index} className={`space-y-1.5 sm:space-y-2 ${isCurrentMonth ? 'bg-blue-50 p-2 sm:p-3 rounded-lg' : ''}`}>
                  <div className="flex justify-between items-center">
                    <span className={`text-xs sm:text-sm font-medium ${isCurrentMonth ? 'text-blue-800' : 'text-gray-700'}`}>
                      {monthData.month} {isCurrentMonth && '(이번 달)'}
                    </span>
                    <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                      <span className="text-green-600 font-semibold">
                        +{formatCurrency(monthData.income)}
                      </span>
                      <span className="text-red-600 font-semibold">
                        -{formatCurrency(monthData.expense)}
                      </span>
                      <span className={`font-bold ${monthData.saving >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                        💰{monthData.saving >= 0 ? '+' : ''}{formatCurrency(monthData.saving)}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {/* 수입 바 */}
                    <div
                      className="h-2 sm:h-2.5 bg-gradient-to-r from-green-400 to-green-600 rounded transition-all duration-1000"
                      style={{ width: `${incomePercentage}%` }}
                    />
                    {/* 지출 바 */}
                    <div
                      className="h-2 sm:h-2.5 bg-gradient-to-r from-red-400 to-red-600 rounded transition-all duration-1000"
                      style={{ width: `${expensePercentage}%` }}
                    />
                    {/* 저축 바 */}
                    {monthData.saving > 0 && (
                      <div
                        className="h-2 sm:h-2.5 bg-gradient-to-r from-blue-400 to-blue-600 rounded transition-all duration-1000"
                        style={{ width: `${savingPercentage}%` }}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 가족 구성원별 지출 */}
      {Object.keys(expensesByUser).length > 1 && (
        <div className="glass-effect rounded-xl p-4 sm:p-6 shadow-lg">
          <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-4 sm:mb-6">
            👨‍👩‍👧‍👦 가족 구성원별 지출
          </h3>

          {/* 소비 지출 (저축 제외) */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">💳 소비 지출</h4>
            <div className="space-y-3 sm:space-y-4">
              {Object.entries(expensesByUser)
                .sort(([,a], [,b]) => b - a)
                .map(([userId, amount], index) => {
                  const maxAmount = Math.max(...Object.values(expensesByUser));
                  const percentage = maxAmount > 0 ? (amount / maxAmount) * 100 : 0;
                  const user = getUserInfo(userId);
                  const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-amber-500'];

                  return (
                    <div key={userId} className="space-y-1.5 sm:space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs sm:text-sm font-medium text-gray-700 flex items-center gap-2">
                          <span className="text-base">{user.avatar}</span>
                          <span>{user.name}</span>
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm font-bold text-gray-800">
                            {formatCurrency(amount)}원
                          </span>
                          <span className="text-[10px] sm:text-xs text-gray-500">
                            ({((amount / currentExpense) * 100).toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 sm:h-3">
                        <div
                          className={`h-2.5 sm:h-3 rounded-full transition-all duration-1000 ease-out ${colors[index % colors.length]}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* 저축 */}
          {Object.keys(savingsByUser).length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">💰 저축</h4>
              <div className="space-y-3 sm:space-y-4">
                {Object.entries(savingsByUser)
                  .sort(([,a], [,b]) => b - a)
                  .map(([userId, amount], index) => {
                    const maxAmount = Math.max(...Object.values(savingsByUser));
                    const percentage = maxAmount > 0 ? (amount / maxAmount) * 100 : 0;
                    const user = getUserInfo(userId);
                    const colors = ['bg-blue-500', 'bg-cyan-500', 'bg-indigo-500', 'bg-sky-500'];

                    return (
                      <div key={userId} className="space-y-1.5 sm:space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs sm:text-sm font-medium text-gray-700 flex items-center gap-2">
                            <span className="text-base">{user.avatar}</span>
                            <span>{user.name}</span>
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs sm:text-sm font-bold text-blue-600">
                              {formatCurrency(amount)}원
                            </span>
                            <span className="text-[10px] sm:text-xs text-gray-500">
                              ({((amount / currentSavings) * 100).toFixed(1)}%)
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 sm:h-3">
                          <div
                            className={`h-2.5 sm:h-3 rounded-full transition-all duration-1000 ease-out ${colors[index % colors.length]}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* 합계 */}
          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs sm:text-sm font-medium text-gray-700">전체 소비</span>
              <span className="text-sm sm:text-base font-bold text-red-600">
                {formatCurrency(currentExpense)}원
              </span>
            </div>
            {currentSavings > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm font-medium text-gray-700">전체 저축</span>
                <span className="text-sm sm:text-base font-bold text-blue-600">
                  {formatCurrency(currentSavings)}원
                </span>
              </div>
            )}
            <div className="flex justify-between items-center pt-2 border-t border-gray-100">
              <span className="text-xs sm:text-sm font-semibold text-gray-800">전체 합계</span>
              <span className="text-sm sm:text-base font-bold text-gray-900">
                {formatCurrency(currentExpense + currentSavings)}원
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 용돈 사용 내역 (정산 필요) */}
      {totalPocketMoney > 0 && (
        <div className="glass-effect rounded-xl p-4 sm:p-6 shadow-lg border-2 border-orange-300 bg-gradient-to-br from-orange-50 to-yellow-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base sm:text-lg font-bold text-gray-800 flex items-center gap-2">
              <span className="text-2xl">💰</span>
              <span>용돈 사용 내역 (정산 필요)</span>
            </h3>
            <span className="text-xl sm:text-2xl font-bold text-orange-600">
              {formatCurrency(totalPocketMoney)}원
            </span>
          </div>

          <p className="text-xs sm:text-sm text-gray-600 mb-4">
            개인 용돈으로 생활비를 지출한 내역입니다. 정산이 필요합니다.
          </p>

          {/* 사용자별 용돈 사용 내역 */}
          <div className="space-y-3 sm:space-y-4">
            {Object.entries(pocketMoneyByUser)
              .sort(([,a], [,b]) => b.total - a.total)
              .map(([userId, data], index) => {
                const user = getUserInfo(userId);
                const percentage = totalPocketMoney > 0 ? (data.total / totalPocketMoney) * 100 : 0;

                return (
                  <div key={userId} className="bg-white rounded-lg p-3 sm:p-4 shadow">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{user.avatar}</span>
                        <span className="text-sm sm:text-base font-bold text-gray-800">{user.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-base sm:text-lg font-bold text-orange-600">
                          {formatCurrency(data.total)}원
                        </p>
                        <p className="text-xs text-gray-500">
                          {data.transactions.length}건
                        </p>
                      </div>
                    </div>

                    {/* 진행률 바 */}
                    <div className="w-full bg-gray-200 rounded-full h-2 sm:h-2.5 mb-3">
                      <div
                        className="h-2 sm:h-2.5 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full transition-all duration-1000"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>

                    {/* 거래 내역 목록 (최대 5개만 표시) */}
                    <div className="space-y-1.5">
                      {data.transactions.slice(0, 5).map((t, idx) => {
                        const category = CATEGORIES.expense.find(c => c.id === t.category);
                        return (
                          <div key={idx} className="flex items-center justify-between text-xs sm:text-sm py-1 border-b border-gray-100 last:border-0">
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <span className="text-gray-500">{t.date.slice(5)}</span>
                              <span className="font-medium text-gray-700 truncate">
                                {category?.name || '기타'}
                              </span>
                              {t.memo && (
                                <span className="text-gray-400 truncate text-xs">
                                  {t.memo}
                                </span>
                              )}
                            </div>
                            <span className="font-semibold text-orange-600 flex-shrink-0 ml-2">
                              {formatCurrency(t.amount)}원
                            </span>
                          </div>
                        );
                      })}
                      {data.transactions.length > 5 && (
                        <p className="text-xs text-gray-500 text-center pt-1">
                          외 {data.transactions.length - 5}건
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>

          {/* 정산 완료 버튼 */}
          <div className="mt-4 pt-4 border-t border-orange-200">
            <button
              onClick={async () => {
                if (window.confirm(`💰 용돈 ${formatCurrency(totalPocketMoney)}원을 정산 완료 처리하시겠습니까?\n\n정산 완료하면 해당 거래들의 '용돈 사용' 체크가 해제됩니다.`)) {
                  await onSettlePocketMoney(currentDate.getFullYear(), currentDate.getMonth());
                }
              }}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-3 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              ✅ 정산 완료
            </button>
          </div>
        </div>
      )}

      {/* 카테고리 세부 내역 모달 */}
      {selectedCategory && (
        <Modal
          isOpen={showCategoryModal}
          onClose={() => setShowCategoryModal(false)}
          title={`${selectedCategory.name} 세부 내역`}
          size="lg"
        >
          {/* 카테고리 요약 */}
          <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {selectedCategory.icon && (
                  <div className={`p-3 rounded-lg ${selectedCategory.color || 'bg-gray-100'}`}>
                    <selectedCategory.icon size={24} />
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{selectedCategory.name}</h3>
                  <p className="text-sm text-gray-600">
                    총 {selectedCategory.transactions.length}건의 거래
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-red-600">
                  -{formatCurrency(selectedCategory.total)}원
                </p>
              </div>
            </div>
          </div>

          {/* 사용자 필터 버튼 */}
          <div className="mb-4 flex gap-2 flex-wrap">
            <button
              onClick={() => setUserFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                userFilter === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              전체 ({selectedCategory.transactions.length})
            </button>
            {familyMembers.map((member, index) => {
              const count = selectedCategory.transactions.filter(t => t.userId === member.id).length;
              const colors = ['bg-blue-600', 'bg-pink-600', 'bg-purple-600', 'bg-green-600'];
              const activeColor = colors[index % colors.length];

              return (
                <button
                  key={member.id}
                  onClick={() => setUserFilter(member.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                    userFilter === member.id
                      ? `${activeColor} text-white`
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span>{member.avatar}</span>
                  <span>{member.name}</span>
                  <span className="text-xs">({count})</span>
                </button>
              );
            })}
          </div>

          {/* 거래 내역 리스트 */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {getFilteredTransactions().length > 0 ? (
              getFilteredTransactions().map((transaction, index) => {
                const user = getUserInfo(transaction.userId);
                const transactionDate = parseDateString(transaction.date);
                const dateStr = `${transactionDate.getMonth() + 1}/${transactionDate.getDate()}`;

                return (
                  <div
                    key={transaction.id || index}
                    className={`flex items-center gap-3 p-3 border rounded-lg transition-colors ${
                      transaction.isFixed
                        ? 'border-blue-300 bg-blue-50 hover:bg-blue-100'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {/* 사용자 아바타 + 이름 */}
                    <div className="flex-shrink-0">
                      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${user.color} bg-opacity-10`}>
                        <span className="text-lg">{user.avatar}</span>
                        <span className={`text-xs font-bold ${
                          user.role === 'admin' ? 'text-blue-700' : 'text-pink-700'
                        }`}>
                          {user.name}
                        </span>
                      </div>
                    </div>

                    {/* 거래 정보 */}
                    <div className="flex-1 min-w-0">
                      {/* 날짜 */}
                      <div className="text-xs text-gray-500 mb-1">
                        {transaction.date} ({dateStr})
                      </div>

                      {/* 메모 */}
                      {transaction.memo && (
                        <div className="text-sm font-medium text-gray-800 truncate">
                          {transaction.memo}
                        </div>
                      )}

                      {/* 결제수단 */}
                      {transaction.paymentMethod && (
                        <div className="text-xs text-gray-600">
                          {transaction.paymentMethod}
                        </div>
                      )}
                    </div>

                    {/* 금액 */}
                    <div className="text-right flex-shrink-0">
                      <span className="text-base font-bold text-red-600">
                        -{formatCurrency(transaction.amount)}원
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-500">
                거래 내역이 없습니다
              </div>
            )}
          </div>

          {/* 푸터 통계 */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-600 mb-1">거래 건수</div>
                <div className="text-base font-bold text-gray-800">
                  {getFilteredTransactions().length}건
                </div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-xs text-gray-600 mb-1">평균 지출</div>
                <div className="text-base font-bold text-blue-600">
                  {getFilteredTransactions().length > 0
                    ? formatCurrency(Math.round(
                        getFilteredTransactions().reduce((sum, t) => sum + t.amount, 0) /
                        getFilteredTransactions().length
                      ))
                    : 0}원
                </div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-xs text-gray-600 mb-1">총 지출</div>
                <div className="text-base font-bold text-red-600">
                  {formatCurrency(
                    getFilteredTransactions().reduce((sum, t) => sum + t.amount, 0)
                  )}원
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
