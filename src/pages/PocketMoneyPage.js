import React, { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, Wallet, Calendar, Plus, Trash2, Minus, Edit } from 'lucide-react';
import { Button, Input, Modal } from '../components/common';
import { formatCurrency, formatDate, getTodayDateString, parseDateString } from '../utils';
import { usePocketMoney } from '../hooks';

/**
 * 개인 용돈 관리 페이지
 * SRP: 개인 용돈 예산, 지출, 통계를 한 화면에 표시
 * 달력 없이 간단한 목록과 통계만 제공
 */
export const PocketMoneyPage = ({ currentUser }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [budgetEditMode, setBudgetEditMode] = useState(''); // 'add', 'subtract', 'edit'
  const [budgetInput, setBudgetInput] = useState('');
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [transactionForm, setTransactionForm] = useState({
    category: '',
    amount: '',
    memo: '',
    date: getTodayDateString()
  });

  // usePocketMoney 훅 사용
  const {
    transactions,
    monthlyBudget,
    updateBudget,
    addTransaction,
    deleteTransaction,
    addBalance
  } = usePocketMoney(currentUser);

  // 현재 월 계산
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // 현재 월의 거래만 필터링
  const currentMonthTransactions = useMemo(() => {
    return transactions.filter(t => {
      const transactionDate = parseDateString(t.date);
      return transactionDate.getFullYear() === currentYear &&
             transactionDate.getMonth() === currentMonth;
    });
  }, [transactions, currentYear, currentMonth]);

  // 지난 달까지의 총 지출 계산 (이월 잔고 계산용)
  const previousMonthsSpent = useMemo(() => {
    return transactions.filter(t => {
      const transactionDate = parseDateString(t.date);
      const currentMonthStart = new Date(currentYear, currentMonth, 1);
      return transactionDate < currentMonthStart;
    }).reduce((sum, t) => sum + t.amount, 0);
  }, [transactions, currentYear, currentMonth]);

  // 이번 달 지출 계산
  const totalSpent = useMemo(() => {
    return currentMonthTransactions.reduce((sum, t) => sum + t.amount, 0);
  }, [currentMonthTransactions]);

  // 이월 잔고 = 전체 잔고 - 지난 달까지 지출
  const carriedOverBalance = monthlyBudget - previousMonthsSpent;

  // 남은 금액 = 이월 잔고 - 이번 달 지출
  const remaining = carriedOverBalance - totalSpent;
  const remainingPercentage = carriedOverBalance > 0 ? (remaining / carriedOverBalance) * 100 : 0;

  // 통계 계산
  const stats = useMemo(() => {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const today = new Date().getDate();
    const daysElapsed = currentMonth === new Date().getMonth() ? today : daysInMonth;

    const averageDaily = daysElapsed > 0 ? totalSpent / daysElapsed : 0;
    const maxSpending = currentMonthTransactions.length > 0
      ? Math.max(...currentMonthTransactions.map(t => t.amount))
      : 0;

    return {
      averageDaily,
      maxSpending,
      transactionCount: currentMonthTransactions.length,
      daysElapsed,
      daysRemaining: daysInMonth - daysElapsed
    };
  }, [currentMonthTransactions, totalSpent, currentYear, currentMonth]);

  // 잔고 추가 핸들러
  const handleAddBalance = () => {
    setIsEditingBudget(true);
    setBudgetEditMode('add');
    setBudgetInput('');
  };

  // 잔고 차감 핸들러
  const handleSubtractBalance = () => {
    setIsEditingBudget(true);
    setBudgetEditMode('subtract');
    setBudgetInput('');
  };

  // 잔고 직접 수정 핸들러
  const handleEditBalance = () => {
    setIsEditingBudget(true);
    setBudgetEditMode('edit');
    setBudgetInput(monthlyBudget.toString());
  };

  const handleSaveBalance = async () => {
    const inputAmount = parseInt(budgetInput);

    if (isNaN(inputAmount)) {
      alert('올바른 금액을 입력해주세요.');
      return;
    }

    let success = false;

    if (budgetEditMode === 'add') {
      if (inputAmount <= 0) {
        alert('0보다 큰 금액을 입력해주세요.');
        return;
      }
      success = await addBalance(inputAmount);
    } else if (budgetEditMode === 'subtract') {
      if (inputAmount <= 0) {
        alert('0보다 큰 금액을 입력해주세요.');
        return;
      }
      success = await addBalance(-inputAmount);
    } else if (budgetEditMode === 'edit') {
      if (inputAmount < 0) {
        alert('0 이상의 금액을 입력해주세요.');
        return;
      }
      success = await updateBudget(inputAmount);
    }

    if (success) {
      setIsEditingBudget(false);
      setBudgetInput('');
      setBudgetEditMode('');
    }
  };

  const handleCancelEdit = () => {
    setIsEditingBudget(false);
    setBudgetInput('');
    setBudgetEditMode('');
  };

  // 거래 추가 핸들러
  const handleAddTransaction = async () => {
    if (!transactionForm.category || !transactionForm.amount) {
      alert('카테고리와 금액을 입력해주세요.');
      return;
    }

    const success = await addTransaction({
      category: transactionForm.category,
      amount: parseInt(transactionForm.amount),
      memo: transactionForm.memo,
      date: transactionForm.date
    });

    if (success) {
      setShowAddTransaction(false);
      setTransactionForm({
        category: '',
        amount: '',
        memo: '',
        date: getTodayDateString()
      });
    }
  };

  // 거래 삭제 핸들러
  const handleDeleteTransaction = async (id) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      await deleteTransaction(id);
    }
  };

  // 월 변경
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1));
  };

  // 진행률에 따른 색상
  const getProgressColor = () => {
    if (remainingPercentage >= 50) return 'bg-green-500';
    if (remainingPercentage >= 20) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getProgressTextColor = () => {
    if (remainingPercentage >= 50) return 'text-green-600';
    if (remainingPercentage >= 20) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-2">
          <Wallet className="w-8 h-8" />
          💰 용돈 관리
        </h1>
      </div>

      {/* 월 선택 */}
      <div className="flex items-center justify-center gap-4 bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
        <Button variant="secondary" onClick={handlePrevMonth}>
          &lt;
        </Button>
        <div className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          {currentYear}년 {currentMonth + 1}월
        </div>
        <Button variant="secondary" onClick={handleNextMonth}>
          &gt;
        </Button>
      </div>

      {/* 잔고 섹션 */}
      <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 shadow-xl text-white">
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <Wallet className="w-5 h-5" />
          💵 용돈 잔고
        </h2>

        {isEditingBudget ? (
          <div className="space-y-3">
            <div className="text-sm mb-2">
              {budgetEditMode === 'add' && '💰 추가할 금액을 입력하세요'}
              {budgetEditMode === 'subtract' && '💸 차감할 금액을 입력하세요'}
              {budgetEditMode === 'edit' && '✏️ 새로운 잔고를 입력하세요'}
            </div>
            <Input
              type="number"
              value={budgetInput}
              onChange={(e) => setBudgetInput(e.target.value)}
              placeholder={
                budgetEditMode === 'add' ? '추가할 금액' :
                budgetEditMode === 'subtract' ? '차감할 금액' :
                '새로운 잔고'
              }
              className="bg-white text-gray-800"
            />
            <div className="flex gap-2">
              <Button variant="primary" onClick={handleSaveBalance} className="flex-1">
                {budgetEditMode === 'add' && '추가'}
                {budgetEditMode === 'subtract' && '차감'}
                {budgetEditMode === 'edit' && '저장'}
              </Button>
              <Button variant="secondary" onClick={handleCancelEdit} className="flex-1">
                취소
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-3xl font-bold">{formatCurrency(monthlyBudget)}</div>
            {/* 버튼들 - 모바일에서는 세로, 데스크톱에서는 가로 */}
            <div className="grid grid-cols-3 gap-2">
              <Button variant="secondary" size="sm" onClick={handleAddBalance} icon={Plus}>
                추가
              </Button>
              <Button variant="secondary" size="sm" onClick={handleSubtractBalance} icon={Minus}>
                차감
              </Button>
              <Button variant="secondary" size="sm" onClick={handleEditBalance} icon={Edit}>
                수정
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* 지출 현황 */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">이번 달 지출 현황</h2>

        {/* 이월 잔고 */}
        <div className="mb-4 p-3 bg-blue-50 rounded-xl border border-blue-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">📅 이월 잔고</span>
            <span className="text-lg font-semibold text-blue-600">{formatCurrency(carriedOverBalance)}</span>
          </div>
        </div>

        {/* 이번 달 지출 */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">이번 달 지출</span>
            <span className="text-2xl font-bold text-red-500">{formatCurrency(totalSpent)}</span>
          </div>
        </div>

        {/* 남은 금액 */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">남은 금액</span>
            <span className={`text-2xl font-bold ${getProgressTextColor()}`}>
              {formatCurrency(remaining)}
            </span>
          </div>
          {/* 진행률 바 */}
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div
              className={`h-full ${getProgressColor()} transition-all duration-300`}
              style={{ width: `${Math.max(0, Math.min(100, remainingPercentage))}%` }}
            />
          </div>
          <div className="text-sm text-gray-500 text-right mt-1">
            {remainingPercentage.toFixed(1)}% 남음
          </div>
        </div>
      </div>

      {/* 통계 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg">
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <TrendingDown className="w-4 h-4" />
            <span className="text-sm">일평균 지출</span>
          </div>
          <div className="text-xl font-bold text-gray-800">
            {formatCurrency(Math.round(stats.averageDaily))}
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg">
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm">최대 지출</span>
          </div>
          <div className="text-xl font-bold text-gray-800">
            {formatCurrency(stats.maxSpending)}
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg">
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <Wallet className="w-4 h-4" />
            <span className="text-sm">거래 건수</span>
          </div>
          <div className="text-xl font-bold text-gray-800">
            {stats.transactionCount}건
          </div>
        </div>
      </div>

      {/* 거래 내역 */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">거래 내역</h2>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowAddTransaction(true)}
            icon={Plus}
          >
            추가
          </Button>
        </div>

        {currentMonthTransactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            아직 거래 내역이 없습니다
          </div>
        ) : (
          <div className="space-y-2">
            {currentMonthTransactions.map(transaction => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
              >
                <div className="flex-1">
                  <div className="font-medium text-gray-800">{transaction.category}</div>
                  <div className="text-sm text-gray-500">
                    {formatDate(transaction.date)} {transaction.memo && `· ${transaction.memo}`}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-lg font-bold text-red-500">
                    -{formatCurrency(transaction.amount)}
                  </div>
                  <button
                    onClick={() => handleDeleteTransaction(transaction.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-100 rounded-lg"
                  >
                    <Trash2 size={18} className="text-red-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 거래 추가 모달 */}
      <Modal
        isOpen={showAddTransaction}
        onClose={() => setShowAddTransaction(false)}
        title="용돈 사용 내역 추가"
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="카테고리"
            type="text"
            value={transactionForm.category}
            onChange={(e) => setTransactionForm({ ...transactionForm, category: e.target.value })}
            placeholder="예: 식비, 교통비, 간식 등"
            required
          />

          <Input
            label="금액"
            type="number"
            value={transactionForm.amount}
            onChange={(e) => setTransactionForm({ ...transactionForm, amount: e.target.value })}
            placeholder="0"
            required
          />

          <Input
            label="날짜"
            type="date"
            value={transactionForm.date}
            onChange={(e) => setTransactionForm({ ...transactionForm, date: e.target.value })}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              메모
            </label>
            <textarea
              value={transactionForm.memo}
              onChange={(e) => setTransactionForm({ ...transactionForm, memo: e.target.value })}
              placeholder="메모 (선택사항)"
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setShowAddTransaction(false)}
              className="flex-1"
            >
              취소
            </Button>
            <Button
              variant="primary"
              onClick={handleAddTransaction}
              className="flex-1"
            >
              추가
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
