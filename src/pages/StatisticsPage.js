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

  const currentExpense = currentMonthData
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const previousIncome = previousMonthData
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const previousExpense = previousMonthData
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

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
  const savingChange = currentIncome - currentExpense;
  const savingRate = currentIncome > 0 ? (savingChange / currentIncome) * 100 : 0;

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
          savingChange >= 0
            ? 'bg-gradient-to-r from-green-50 to-blue-50'
            : 'bg-gradient-to-r from-red-50 to-orange-50'
        }`}>
          <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4">
            💡 이번 달 가계 분석
          </h3>
          {savingChange >= 0 ? (
            <div>
              <p className="text-sm sm:text-base text-gray-700 mb-2">
                🎉 훌륭합니다! 이번 달 <span className="font-bold text-green-600">
                  {formatCurrency(savingChange)}원
                </span>을 저축했습니다.
              </p>
              <p className="text-xs sm:text-sm text-gray-600">
                저축률 {savingRate.toFixed(1)}%를 달성했습니다. 계속 이런 습관을 유지하세요!
              </p>
            </div>
          ) : (
            <div>
              <p className="text-sm sm:text-base text-gray-700 mb-2">
                ⚠️ 이번 달 지출이 수입을 <span className="font-bold text-red-600">
                  {formatCurrency(Math.abs(savingChange))}원
                </span> 초과했습니다.
              </p>
              <p className="text-xs sm:text-sm text-gray-600">
                다음 달에는 지출을 줄이고 저축을 늘려보세요!
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
