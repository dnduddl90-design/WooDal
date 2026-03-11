import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';
import { CATEGORIES } from '../constants';
import { getDaysInMonth, getFirstDayOfMonth, formatCurrency, calculateMonthsSince, resolveUserInfo } from '../utils';
import { Button, Modal } from '../components/common';

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
  familyInfo,
  currentUser,
  onAddTransaction,
  onEditTransaction,
  onDeleteTransaction
}) => {
  // 모바일에서 현재 보고 있는 날짜 (1-31)
  const today = useMemo(() => new Date(), []);
  const initialDay = useMemo(() =>
    currentDate.getFullYear() === today.getFullYear() &&
    currentDate.getMonth() === today.getMonth()
      ? today.getDate()
      : 1,
    [currentDate, today]
  );
  const [currentDay, setCurrentDay] = useState(initialDay);

  // 날짜 상세 모달 상태
  const [selectedDayData, setSelectedDayData] = useState(null);
  const [showDayModal, setShowDayModal] = useState(false);

  // 화면 크기 감지 (640px = sm breakpoint)
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 640);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 640);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const monthKey = useMemo(() => {
    return `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
  }, [currentDate]);

  const transactionsByDate = useMemo(() => {
    return transactions.reduce((acc, transaction) => {
      if (!transaction.date?.startsWith(monthKey)) {
        return acc;
      }

      if (!acc[transaction.date]) {
        acc[transaction.date] = [];
      }

      acc[transaction.date].push(transaction);
      return acc;
    }, {});
  }, [transactions, monthKey]);

  const fixedExpensesByDate = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(currentDate);
    const mappedExpenses = {};

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

      const dayExpenses = fixedExpenses
        .filter(expense => {
          if (!expense.isActive || expense.autoRegisterDate !== day) {
            return false;
          }

          if (expense.isUnlimited !== false) {
            return true;
          }

          if (expense.startDate && dateStr < expense.startDate) {
            return false;
          }

          if (expense.endDate && dateStr > expense.endDate) {
            return false;
          }

          return true;
        })
        .map(expense => {
          const monthsSinceBase = calculateMonthsSince(expense.baseDate, dateStr);
          const monthlyIncrease = expense.monthlyIncrease || 0;
          const calculatedAmount = expense.amount + (monthlyIncrease * monthsSinceBase);

          return {
            ...expense,
            amount: calculatedAmount,
            originalAmount: expense.amount,
            monthsSinceBase
          };
        });

      mappedExpenses[dateStr] = dayExpenses;
    }

    return mappedExpenses;
  }, [currentDate, fixedExpenses]);

  const buildDateString = useCallback((day, month, year) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }, []);

  // 특정 날짜의 거래 내역 가져오기 (useCallback으로 메모이제이션)
  const getDayTransactions = useCallback((day, month, year) => {
    const dateStr = buildDateString(day, month, year);
    return transactionsByDate[dateStr] || [];
  }, [buildDateString, transactionsByDate]);

  // 특정 날짜의 고정지출 가져오기 (useCallback으로 메모이제이션)
  const getFixedExpensesForDay = useCallback((day, month, year) => {
    const dateStr = buildDateString(day, month, year);
    return fixedExpensesByDate[dateStr] || [];
  }, [buildDateString, fixedExpensesByDate]);

  const shouldOpenDayModal = useCallback((itemsCount) => {
    if (isDesktop) {
      return itemsCount > 0;
    }

    return itemsCount > 2;
  }, [isDesktop]);

  const openDayModal = useCallback((day, month, year, allItems) => {
    setSelectedDayData({ day, month, year, allItems });
    setShowDayModal(true);
  }, []);

  const handleDayCellClick = useCallback((day, month, year, allItems) => {
    if (!shouldOpenDayModal(allItems.length)) {
      return;
    }

    openDayModal(day, month, year, allItems);
  }, [openDayModal, shouldOpenDayModal]);

  const handleInlineItemClick = useCallback((event, item) => {
    if (isDesktop || item.type === 'fixed') {
      return;
    }

    event.stopPropagation();
    onEditTransaction(item);
  }, [isDesktop, onEditTransaction]);

  const handleInlineDeleteClick = useCallback((event, itemId) => {
    event.stopPropagation();
    if (!window.confirm('이 거래를 삭제하시겠습니까?')) {
      return;
    }
    onDeleteTransaction(itemId);
  }, [onDeleteTransaction]);

  const handleDeleteClick = useCallback((event, itemId, closeModal = false) => {
    event.stopPropagation();
    if (!window.confirm('이 거래를 삭제하시겠습니까?')) {
      return;
    }
    onDeleteTransaction(itemId);
    if (closeModal) {
      setShowDayModal(false);
    }
  }, [onDeleteTransaction]);


  // 월 이동 핸들러 (useCallback으로 최적화)
  const handlePrevMonth = useCallback(() => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    onDateChange(newDate);
  }, [currentDate, onDateChange]);

  const handleNextMonth = useCallback(() => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    onDateChange(newDate);
  }, [currentDate, onDateChange]);

  const handleToday = useCallback(() => {
    onDateChange(new Date());
  }, [onDateChange]);

  // 달력 렌더링 (useMemo로 최적화)
  const calendarDays = useMemo(() => {
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
      const fixedExpensesForDay = getFixedExpensesForDay(day, month, year);
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
          className={`h-16 sm:h-24 border border-gray-200 p-0.5 sm:p-1 hover:bg-gray-50 transition-colors cursor-pointer ${
            isToday ? 'ring-2 ring-blue-500' : ''
          }`}
          onClick={() => handleDayCellClick(day, month, year, allItems)}
        >
          <div className="text-xs sm:text-sm font-medium mb-0.5 sm:mb-1">{day}</div>
          {allItems.length > 0 ? (
            <div className="space-y-0.5 sm:space-y-1">
              {allItems.slice(0, 2).map((item, index) => {
                const user = item.type === 'fixed'
                  ? null
                  : resolveUserInfo(item.userId, familyInfo, currentUser);

                return (
                  <div
                    key={index}
                    className="text-[10px] sm:text-xs flex items-center justify-between group hover:bg-white hover:bg-opacity-50 rounded px-0.5 sm:px-1 py-0.5 transition-colors"
                  >
                    <div
                      className="flex items-center space-x-0.5 sm:space-x-1 flex-1 cursor-pointer min-w-0"
                      onClick={(e) => handleInlineItemClick(e, item)}
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
                    {item.type !== 'fixed' && !isDesktop && (
                      <button
                        type="button"
                        onClick={(e) => handleInlineDeleteClick(e, item.id)}
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
                <div className="text-[10px] sm:text-xs text-blue-600 font-medium hover:text-blue-800 cursor-pointer">
                  +{allItems.length - 2}개 더보기
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate, getDayTransactions, getFixedExpensesForDay, handleDayCellClick, handleInlineDeleteClick, handleInlineItemClick]);

  // 모바일 하루 뷰 데이터 계산 (useMemo로 최적화)
  const mobileDayData = useMemo(() => {
    const daysInMonth = getDaysInMonth(currentDate);
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const dayTransactions = getDayTransactions(currentDay, month, year);
    const fixedExpensesForDay = getFixedExpensesForDay(currentDay, month, year);
    const todayDate = new Date();
    const isToday =
      currentDay === todayDate.getDate() &&
      month === todayDate.getMonth() &&
      year === todayDate.getFullYear();

    const allItems = [
      ...dayTransactions,
      ...fixedExpensesForDay.map(f => ({...f, type: 'fixed'}))
    ];

    const totalIncome = allItems
      .filter(item => item.type === 'income')
      .reduce((sum, item) => sum + item.amount, 0);
    const totalExpense = allItems
      .filter(item => item.type === 'expense' || item.type === 'fixed')
      .reduce((sum, item) => sum + item.amount, 0);

    const dayOfWeek = new Date(year, month, currentDay).getDay();

    return {
      daysInMonth,
      year,
      month,
      dayTransactions,
      fixedExpensesForDay,
      isToday,
      allItems,
      totalIncome,
      totalExpense,
      dayOfWeek
    };
  }, [currentDate, currentDay, getDayTransactions, getFixedExpensesForDay]);

  // 모바일 하루 이동 핸들러 (useCallback으로 최적화)
  const handlePrevDay = useCallback(() => {
    if (currentDay > 1) {
      setCurrentDay(currentDay - 1);
    } else {
      // 이전 달의 마지막 날로 이동
      const newDate = new Date(currentDate);
      newDate.setMonth(newDate.getMonth() - 1);
      onDateChange(newDate);

      // 이전 달의 마지막 날 계산
      const prevMonthDays = getDaysInMonth(newDate);
      setCurrentDay(prevMonthDays);
    }
  }, [currentDay, currentDate, onDateChange]);

  const handleNextDay = useCallback(() => {
    const daysInMonth = getDaysInMonth(currentDate);
    if (currentDay < daysInMonth) {
      setCurrentDay(currentDay + 1);
    } else {
      // 다음 달의 첫날로 이동
      const newDate = new Date(currentDate);
      newDate.setMonth(newDate.getMonth() + 1);
      onDateChange(newDate);
      setCurrentDay(1);
    }
  }, [currentDay, currentDate, onDateChange]);

  const handleTodayDay = useCallback(() => {
    const now = new Date();
    const isAlreadyToday =
      currentDay === now.getDate() &&
      currentDate.getMonth() === now.getMonth() &&
      currentDate.getFullYear() === now.getFullYear();

    if (isAlreadyToday) return;

    if (currentDate.getFullYear() !== now.getFullYear() ||
        currentDate.getMonth() !== now.getMonth()) {
      onDateChange(now);
    }
    setCurrentDay(now.getDate());
  }, [currentDay, currentDate, onDateChange]);

  // 모바일 하루 뷰 렌더링
  const renderMobileDayView = () => {
    const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
    const { allItems, totalIncome, totalExpense, dayOfWeek, isToday } = mobileDayData;

    return (
      <div className="space-y-4 relative">
        {/* 날짜 네비게이션 */}
        <div className="flex items-center justify-between bg-white rounded-xl p-4 shadow-md">
          <button
            onClick={handlePrevDay}
            className="p-2 rounded-lg transition-colors text-gray-700 hover:bg-gray-100"
          >
            <ChevronLeft size={24} />
          </button>

          <div className="text-center flex-1">
            <div className="flex items-center justify-center gap-2">
              <span className={`text-2xl font-bold ${
                dayOfWeek === 0 ? 'text-red-600' :
                dayOfWeek === 6 ? 'text-blue-600' :
                'text-gray-800'
              }`}>
                {currentDay}일
              </span>
              <span className={`text-lg ${
                dayOfWeek === 0 ? 'text-red-500' :
                dayOfWeek === 6 ? 'text-blue-500' :
                'text-gray-600'
              }`}>
                ({weekDays[dayOfWeek]})
              </span>
            </div>
            {isToday && (
              <span className="inline-block mt-1 text-xs px-3 py-1 bg-blue-500 text-white rounded-full">
                오늘
              </span>
            )}
            {!isToday && (
              <button
                onClick={handleTodayDay}
                className="inline-block mt-1 text-xs px-3 py-1 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-colors"
              >
                오늘로 이동
              </button>
            )}
          </div>

          <button
            onClick={handleNextDay}
            className="p-2 rounded-lg transition-colors text-gray-700 hover:bg-gray-100"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        {/* 일일 요약 */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-50 rounded-xl p-4 text-center">
            <div className="text-sm text-blue-600 mb-1">수입</div>
            <div className="text-xl font-bold text-blue-700">
              +{formatCurrency(totalIncome)}
            </div>
          </div>
          <div className="bg-red-50 rounded-xl p-4 text-center">
            <div className="text-sm text-red-600 mb-1">지출</div>
            <div className="text-xl font-bold text-red-700">
              -{formatCurrency(totalExpense)}
            </div>
          </div>
        </div>

        {/* 거래 리스트 */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {allItems.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {allItems.map((item, index) => {
                const user = item.type === 'fixed'
                  ? null
                  : resolveUserInfo(item.userId, familyInfo, currentUser);

                // 카테고리 한글명 찾기
                let categoryName = item.category || item.name;
                if (item.type === 'fixed' && item.category) {
                  // 고정지출 카테고리
                  const categoryObj = CATEGORIES.expense.find(cat => cat.id === item.category);
                  if (categoryObj) {
                    categoryName = categoryObj.name;
                  }
                } else if (item.type !== 'fixed' && item.category) {
                  // 일반 거래 카테고리
                  const categoryList = item.type === 'income' ? CATEGORIES.income : CATEGORIES.expense;
                  const categoryObj = categoryList.find(cat => cat.id === item.category);
                  if (categoryObj) {
                    categoryName = categoryObj.name;
                  }
                }

                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                    onClick={() => {
                      if (item.type !== 'fixed') {
                        onEditTransaction(item);
                      }
                    }}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                        item.type === 'fixed' ? 'bg-orange-500' :
                        user ? user.color : 'bg-gray-500'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <div className="text-base font-semibold text-gray-900 truncate">
                          {categoryName}
                        </div>
                        {item.memo && (
                          <div className="text-sm text-gray-600 truncate mt-0.5">
                            {item.memo}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-lg font-bold ${
                        item.type === 'expense' || item.type === 'fixed' ? 'text-red-600' : 'text-blue-600'
                      }`}>
                        {item.type === 'expense' || item.type === 'fixed' ? '-' : '+'}
                        {formatCurrency(item.amount)}
                      </span>
                      {item.type !== 'fixed' && (
                        <button
                          type="button"
                          onClick={(e) => {
                            handleDeleteClick(e, item.id);
                          }}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="삭제"
                        >
                          <X size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <div className="text-5xl mb-3">😴</div>
              <div className="text-base">거래 내역이 없습니다</div>
            </div>
          )}
        </div>

      </div>
    );
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

      {/* 모바일: 하루씩 보기 (가로 스와이프) */}
      <div className="calendar-mobile">
        {renderMobileDayView()}
      </div>

      {/* 데스크톱: 달력 그리드 */}
      <div className="calendar-desktop">
        <div className="glass-effect rounded-xl sm:rounded-2xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-7 gap-0">
            {/* 요일 헤더 */}
            {['일', '월', '화', '수', '목', '금', '토'].map(day => (
              <div
                key={day}
                className="p-2 sm:p-4 bg-indigo-600 text-white text-center font-semibold text-xs sm:text-base"
              >
                {day}
              </div>
            ))}

            {/* 날짜 셀들 */}
            {calendarDays}
          </div>
        </div>
      </div>

      {/* 거래 추가 버튼 (항상 표시) */}
      <button
        onClick={onAddTransaction}
        className="fixed bottom-32 sm:bottom-8 right-8 w-16 h-16 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-200 flex items-center justify-center"
        style={{ zIndex: 9999 }}
        title="거래 추가"
      >
        <Plus size={32} />
      </button>

      {/* 날짜 상세 모달 */}
      {selectedDayData && (
        <Modal
          isOpen={showDayModal}
          onClose={() => setShowDayModal(false)}
          title={`${currentDate.getFullYear()}년 ${currentDate.getMonth() + 1}월 ${selectedDayData.day}일`}
          size="md"
        >
          <div className="space-y-3">
            {selectedDayData.allItems.map((item, index) => {
              const user = item.type === 'fixed'
                ? null
                : resolveUserInfo(item.userId, familyInfo, currentUser);

              // 카테고리 한글명 찾기
              let categoryName = item.category || item.name;
              if (item.type === 'fixed' && item.category) {
                const categoryObj = CATEGORIES.expense.find(cat => cat.id === item.category);
                if (categoryObj) {
                  categoryName = categoryObj.name;
                }
              } else if (item.type !== 'fixed' && item.category) {
                const categoryList = item.type === 'income' ? CATEGORIES.income : CATEGORIES.expense;
                const categoryObj = categoryList.find(cat => cat.id === item.category);
                if (categoryObj) {
                  categoryName = categoryObj.name;
                }
              }

              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  onClick={() => {
                    if (item.type !== 'fixed') {
                      onEditTransaction(item);
                      setShowDayModal(false);
                    }
                  }}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                      item.type === 'fixed' ? 'bg-orange-500' :
                      user ? user.color : 'bg-gray-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-900 truncate">
                        {categoryName}
                      </div>
                      {item.memo && (
                        <div className="text-xs text-gray-600 truncate">
                          {item.memo}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-base font-bold ${
                      item.type === 'expense' || item.type === 'fixed' ? 'text-red-600' : 'text-blue-600'
                    }`}>
                      {item.type === 'expense' || item.type === 'fixed' ? '-' : '+'}
                      {formatCurrency(item.amount)}
                    </span>
                    {item.type !== 'fixed' && (
                      <button
                        type="button"
                        onClick={(e) => {
                          handleDeleteClick(e, item.id, true);
                        }}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                        title="삭제"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-xs text-gray-600 mb-1">수입</div>
              <div className="text-base font-bold text-blue-600">
                +{formatCurrency(selectedDayData.allItems.filter(i => i.type === 'income').reduce((sum, i) => sum + i.amount, 0))}원
              </div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-xs text-gray-600 mb-1">지출</div>
              <div className="text-base font-bold text-red-600">
                -{formatCurrency(selectedDayData.allItems.filter(i => i.type === 'expense' || i.type === 'fixed').reduce((sum, i) => sum + i.amount, 0))}원
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
