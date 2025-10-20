import React from 'react';
import { ChevronLeft, ChevronRight, TrendingUp, Receipt, PiggyBank } from 'lucide-react';
import { CATEGORIES } from '../constants';
import { formatCurrency } from '../utils';
import { Button } from '../components/common';

/**
 * 통계 페이지 컴포넌트
 * SRP: 통계 UI 렌더링만 담당
 * DIP: Props를 통해 데이터 주입받음
 */
export const StatisticsPage = ({
  currentDate,
  onDateChange,
  transactions = [],
  settings = { budget: { monthly: '' } }
}) => {
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
    const transactionDate = new Date(t.date);
    return transactionDate >= startDate && transactionDate <= endDate;
  });

  // 이전 월 데이터 계산
  const prevYear = month === 0 ? year - 1 : year;
  const prevMonth = month === 0 ? 11 : month - 1;
  const prevStartDate = new Date(prevYear, prevMonth, 1);
  const prevEndDate = new Date(prevYear, prevMonth + 1, 0);

  const previousMonthData = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate >= prevStartDate && transactionDate <= prevEndDate;
  });

  // 수입/지출 계산
  const currentIncome = currentMonthData
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  // 저축 카테고리 지출 계산
  const currentSavings = currentMonthData
    .filter(t => t.type === 'expense' && t.category === 'savings')
    .reduce((sum, t) => sum + t.amount, 0);

  // 총 지출 (저축 포함)
  const currentExpenseTotal = currentMonthData
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

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

  // 카테고리별 지출 계산
  const expensesByCategory = currentMonthData
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      const category = CATEGORIES.expense.find(c => c.id === t.category);
      const categoryName = category ? category.name : '기타';
      acc[categoryName] = (acc[categoryName] || 0) + t.amount;
      return acc;
    }, {});

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
      const transactionDate = new Date(t.date);
      return transactionDate >= monthStart && transactionDate <= monthEnd;
    });

    const income = monthData.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const savings = monthData.filter(t => t.type === 'expense' && t.category === 'savings').reduce((sum, t) => sum + t.amount, 0);
    const expenseTotal = monthData.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const expense = expenseTotal - savings;

    last6Months.push({
      month: `${targetMonth + 1}월`,
      income,
      expense,
      saving: savings
    });
  }

  // 가족 구성원별 지출 (familyInfo가 있을 때만)
  const expensesByUser = currentMonthData
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      const userId = t.userId || 'unknown';
      acc[userId] = (acc[userId] || 0) + t.amount;
      return acc;
    }, {});

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

              const spentAmount = currentMonthData
                .filter(t => t.type === 'expense' && t.category === category.id)
                .reduce((sum, t) => sum + t.amount, 0);

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
                  <div key={category} className="space-y-1.5 sm:space-y-2">
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
          currentIncome >= currentExpenseTotal
            ? 'bg-gradient-to-r from-green-50 to-blue-50'
            : 'bg-gradient-to-r from-red-50 to-orange-50'
        }`}>
          <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4">
            💡 이번 달 가계 분석
          </h3>
          {currentIncome >= currentExpenseTotal ? (
            <div>
              <p className="text-sm sm:text-base text-gray-700 mb-2">
                🎉 훌륭합니다! 이번 달 <span className="font-bold text-green-600">
                  {formatCurrency(savingChange)}원
                </span>을 저축했습니다.
              </p>
              <p className="text-xs sm:text-sm text-gray-600 mb-2">
                저축률 {savingRate.toFixed(1)}%를 달성했습니다. 계속 이런 습관을 유지하세요!
              </p>
              {currentIncome > currentExpenseTotal && (
                <p className="text-xs sm:text-sm text-blue-600">
                  추가로 <span className="font-semibold">{formatCurrency(currentIncome - currentExpenseTotal)}원</span>의 여유 자금이 있습니다.
                </p>
              )}
            </div>
          ) : (
            <div>
              <p className="text-sm sm:text-base text-gray-700 mb-2">
                ⚠️ 이번 달 지출이 수입을 <span className="font-bold text-red-600">
                  {formatCurrency(currentExpenseTotal - currentIncome)}원
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
              const maxAmount = Math.max(
                ...last6Months.map(m => Math.max(m.income, m.expense))
              );
              const incomePercentage = maxAmount > 0 ? (monthData.income / maxAmount) * 100 : 0;
              const expensePercentage = maxAmount > 0 ? (monthData.expense / maxAmount) * 100 : 0;
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
                        {monthData.saving >= 0 ? '+' : ''}{formatCurrency(monthData.saving)}
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
          <div className="space-y-3 sm:space-y-4">
            {Object.entries(expensesByUser)
              .sort(([,a], [,b]) => b - a)
              .map(([userId, amount], index) => {
                const maxAmount = Math.max(...Object.values(expensesByUser));
                const percentage = maxAmount > 0 ? (amount / maxAmount) * 100 : 0;
                const userName = userId === 'user1' ? '우영 👨' : userId === 'user2' ? '달림 👩' : userId;
                const colors = ['bg-blue-500', 'bg-pink-500', 'bg-purple-500', 'bg-green-500'];

                return (
                  <div key={userId} className="space-y-1.5 sm:space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm font-medium text-gray-700">
                        {userName}
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
          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-xs sm:text-sm font-medium text-gray-700">전체 지출</span>
              <span className="text-sm sm:text-base font-bold text-gray-900">
                {formatCurrency(currentExpense)}원
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
