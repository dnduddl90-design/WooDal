import React from 'react';
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';
import { USERS } from '../constants';
import { getDaysInMonth, getFirstDayOfMonth, formatCurrency } from '../utils';
import { Button } from '../components/common';

/**
 * 달력 페이지 컴포넌트
 * SRP: 달력 UI 렌더링과 거래 표시만 담당
 * DIP: Props를 통해 데이터와 핸들러 주입받음
 */
export const CalendarPage = ({
  currentDate,
  onDateChange,
  transactions = [],
  fixedExpenses = [],
  onAddTransaction,
  onEditTransaction,
  onDeleteTransaction
}) => {
  // 특정 날짜의 거래 내역 가져오기
  const getDayTransactions = (day, month, year) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return transactions.filter(t => t.date === dateStr);
  };

  // 특정 날짜의 고정지출 가져오기
  const getFixedExpensesForDay = (day) => {
    return fixedExpenses.filter(expense =>
      expense.isActive && expense.autoRegisterDate === day
    );
  };

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

  const handleToday = () => {
    onDateChange(new Date());
  };

  // 달력 렌더링
  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // 이전 달 빈 칸
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`prev-${i}`} className="h-16 sm:h-24 border border-gray-100 p-1 bg-gray-50" />
      );
    }

    // 현재 달 날짜들
    for (let day = 1; day <= daysInMonth; day++) {
      const dayTransactions = getDayTransactions(day, month, year);
      const fixedExpensesForDay = getFixedExpensesForDay(day);
      const today = new Date();
      const isToday =
        day === today.getDate() &&
        month === today.getMonth() &&
        year === today.getFullYear();

      const allItems = [
        ...dayTransactions,
        ...fixedExpensesForDay.map(f => ({...f, type: 'fixed'}))
      ];

      days.push(
        <div
          key={day}
          className={`h-16 sm:h-24 border border-gray-200 p-0.5 sm:p-1 hover:bg-gray-50 transition-colors ${
            isToday ? 'ring-2 ring-blue-500' : ''
          }`}
        >
          <div className="text-xs sm:text-sm font-medium mb-0.5 sm:mb-1">{day}</div>
          {allItems.length > 0 ? (
            <div className="space-y-0.5 sm:space-y-1">
              {allItems.slice(0, 2).map((item, index) => {
                const user = item.type === 'fixed' ? null : USERS[item.userId];

                return (
                  <div
                    key={index}
                    className="text-[10px] sm:text-xs flex items-center justify-between group hover:bg-white hover:bg-opacity-50 rounded px-0.5 sm:px-1 py-0.5 transition-colors"
                  >
                    <div
                      className="flex items-center space-x-0.5 sm:space-x-1 flex-1 cursor-pointer min-w-0"
                      onClick={() => {
                        if (item.type !== 'fixed') {
                          onEditTransaction(item);
                        }
                      }}
                    >
                      <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full flex-shrink-0 ${
                        item.type === 'fixed' ? 'bg-orange-500' :
                        user ? user.color : 'bg-gray-500'
                      }`} />
                      <span className={`truncate ${
                        item.type === 'expense' || item.type === 'fixed' ? 'text-red-600' : 'text-blue-600'
                      }`}>
                        {item.type === 'expense' || item.type === 'fixed' ? '-' : '+'}
                        {formatCurrency(item.amount)}
                      </span>
                    </div>
                    {item.type !== 'fixed' && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteTransaction(item.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-0.5 text-red-500 hover:text-red-700 transition-all flex-shrink-0"
                        title="삭제"
                      >
                        <X size={10} className="sm:w-3 sm:h-3" />
                      </button>
                    )}
                  </div>
                );
              })}
              {allItems.length > 2 && (
                <div className="text-[10px] sm:text-xs text-gray-500">
                  +{allItems.length - 2}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-8 sm:h-12">
              <div className="text-xl sm:text-2xl opacity-30">😴</div>
            </div>
          )}
        </div>
      );
    }

    // 다음 달 빈 칸
    const totalCells = 42;
    const usedCells = firstDay + daysInMonth;
    for (let i = 1; i <= totalCells - usedCells; i++) {
      days.push(
        <div key={`next-${i}`} className="h-16 sm:h-24 border border-gray-100 p-0.5 sm:p-1 bg-blue-50">
          <div className="text-xs sm:text-sm text-blue-400 mb-0.5 sm:mb-1">{i}</div>
        </div>
      );
    }

    return days;
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in pb-20 sm:pb-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl sm:text-2xl font-bold gradient-text">
          {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
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
            onClick={handleToday}
            className="text-xs sm:text-sm px-2 sm:px-3"
          >
            오늘
          </Button>
          <button
            onClick={handleNextMonth}
            className="p-2 sm:p-3 hover:bg-gray-100 rounded-xl transition-colors btn-animate"
          >
            <ChevronRight size={18} className="sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      {/* 달력 그리드 */}
      <div className="glass-effect rounded-xl sm:rounded-2xl shadow-lg overflow-hidden">
        <div className="grid grid-cols-7 gap-0">
          {/* 요일 헤더 */}
          {['일', '월', '화', '수', '목', '금', '토'].map(day => (
            <div
              key={day}
              className="p-2 sm:p-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-center font-semibold text-xs sm:text-base"
            >
              {day}
            </div>
          ))}

          {/* 날짜 셀들 */}
          {renderCalendar()}
        </div>
      </div>

      {/* 거래 추가 버튼 (플로팅) */}
      <button
        onClick={onAddTransaction}
        className="fixed bottom-20 right-4 sm:bottom-8 sm:right-8 w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-200 flex items-center justify-center btn-animate hover:scale-110 z-50"
        title="거래 추가"
      >
        <Plus size={28} className="sm:w-8 sm:h-8" />
      </button>
    </div>
  );
};
