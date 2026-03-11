import React, { useMemo, useState } from 'react';
import {
  Calendar,
  Edit,
  Minus,
  Plus,
  Search,
  Trash2,
  TrendingDown,
  TrendingUp,
  Wallet
} from 'lucide-react';
import { Button, Input, Modal } from '../components/common';
import { formatCurrency, getTodayDateString, parseDateString } from '../utils';
import { usePocketMoney } from '../hooks';

const POCKET_MONEY_CATEGORIES = [
  '식비',
  '간식',
  '교통비',
  '카페',
  '쇼핑',
  '취미',
  '문화생활',
  '게임',
  '생활용품',
  '기타'
];

export const PocketMoneyPage = ({ currentUser }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isEditingBalance, setIsEditingBalance] = useState(false);
  const [balanceEditMode, setBalanceEditMode] = useState('');
  const [balanceInput, setBalanceInput] = useState('');
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [transactionForm, setTransactionForm] = useState({
    category: '',
    amount: '',
    memo: '',
    date: getTodayDateString()
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortOption, setSortOption] = useState('dateDesc');

  const {
    transactions,
    monthlyBudget,
    updateBudget,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addBalance
  } = usePocketMoney(currentUser);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const currentMonthStart = useMemo(() => new Date(currentYear, currentMonth, 1), [currentMonth, currentYear]);
  const currentMonthEnd = useMemo(() => new Date(currentYear, currentMonth + 1, 0), [currentMonth, currentYear]);
  const today = useMemo(() => new Date(), []);
  const isCurrentMonth = currentYear === today.getFullYear() && currentMonth === today.getMonth();

  const allCategoryOptions = useMemo(() => {
    const customCategories = transactions
      .map((transaction) => transaction.category)
      .filter(Boolean);
    return [...new Set([...POCKET_MONEY_CATEGORIES, ...customCategories])];
  }, [transactions]);

  const previousMonthTransactions = useMemo(() => {
    return transactions.filter((transaction) => parseDateString(transaction.date) < currentMonthStart);
  }, [transactions, currentMonthStart]);

  const currentMonthTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const transactionDate = parseDateString(transaction.date);
      return transactionDate >= currentMonthStart && transactionDate <= currentMonthEnd;
    });
  }, [transactions, currentMonthEnd, currentMonthStart]);

  const previousMonthsSpent = useMemo(() => {
    return previousMonthTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
  }, [previousMonthTransactions]);

  const totalSpent = useMemo(() => {
    return currentMonthTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
  }, [currentMonthTransactions]);

  const monthStartBalance = monthlyBudget - previousMonthsSpent;
  const remaining = monthStartBalance - totalSpent;
  const remainingPercentage = monthStartBalance > 0 ? (remaining / monthStartBalance) * 100 : 0;

  const recentCategories = useMemo(() => {
    const sorted = [...currentMonthTransactions]
      .sort((a, b) => parseDateString(b.date) - parseDateString(a.date))
      .map((transaction) => transaction.category)
      .filter(Boolean);
    return [...new Set(sorted)].slice(0, 5);
  }, [currentMonthTransactions]);

  const filteredTransactions = useMemo(() => {
    const loweredTerm = searchTerm.trim().toLowerCase();
    let items = currentMonthTransactions.filter((transaction) => {
      const matchesCategory = categoryFilter === 'all' || transaction.category === categoryFilter;
      const matchesSearch = !loweredTerm
        || transaction.category.toLowerCase().includes(loweredTerm)
        || (transaction.memo || '').toLowerCase().includes(loweredTerm);
      return matchesCategory && matchesSearch;
    });

    items.sort((a, b) => {
      if (sortOption === 'amountDesc') return b.amount - a.amount;
      if (sortOption === 'amountAsc') return a.amount - b.amount;
      if (sortOption === 'dateAsc') return parseDateString(a.date) - parseDateString(b.date);
      return parseDateString(b.date) - parseDateString(a.date);
    });

    return items;
  }, [categoryFilter, currentMonthTransactions, searchTerm, sortOption]);

  const categoryBreakdown = useMemo(() => {
    const grouped = currentMonthTransactions.reduce((acc, transaction) => {
      acc[transaction.category] = (acc[transaction.category] || 0) + transaction.amount;
      return acc;
    }, {});

    return Object.entries(grouped).sort(([, a], [, b]) => b - a);
  }, [currentMonthTransactions]);

  const stats = useMemo(() => {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysElapsed = isCurrentMonth ? today.getDate() : daysInMonth;
    const daysRemaining = Math.max(daysInMonth - daysElapsed, 0);
    const averageDaily = daysElapsed > 0 ? totalSpent / daysElapsed : 0;
    const recommendedDaily = daysRemaining > 0 ? Math.max(remaining, 0) / daysRemaining : Math.max(remaining, 0);
    const maxSpending = currentMonthTransactions.length > 0
      ? Math.max(...currentMonthTransactions.map((transaction) => transaction.amount))
      : 0;
    const topCategory = categoryBreakdown[0] || null;

    return {
      averageDaily,
      recommendedDaily,
      maxSpending,
      transactionCount: currentMonthTransactions.length,
      daysElapsed,
      daysRemaining,
      topCategory
    };
  }, [categoryBreakdown, currentMonthTransactions, currentMonth, currentYear, isCurrentMonth, remaining, today, totalSpent]);

  const getProgressColor = () => {
    if (remaining < 0) return 'bg-red-600';
    if (remainingPercentage >= 50) return 'bg-green-500';
    if (remainingPercentage >= 20) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getProgressTextColor = () => {
    if (remaining < 0) return 'text-red-700';
    if (remainingPercentage >= 50) return 'text-green-600';
    if (remainingPercentage >= 20) return 'text-yellow-600';
    return 'text-red-600';
  };

  const openBalanceEditor = (mode) => {
    setIsEditingBalance(true);
    setBalanceEditMode(mode);
    setBalanceInput(mode === 'edit' ? String(monthlyBudget) : '');
  };

  const resetBalanceEditor = () => {
    setIsEditingBalance(false);
    setBalanceEditMode('');
    setBalanceInput('');
  };

  const handleSaveBalance = async () => {
    const amount = parseInt(balanceInput, 10);

    if (Number.isNaN(amount)) {
      alert('올바른 금액을 입력해주세요.');
      return;
    }

    let success = false;

    if (balanceEditMode === 'add') {
      if (amount <= 0) return alert('0보다 큰 금액을 입력해주세요.');
      success = await addBalance(amount);
    } else if (balanceEditMode === 'subtract') {
      if (amount <= 0) return alert('0보다 큰 금액을 입력해주세요.');
      success = await addBalance(-amount);
    } else if (balanceEditMode === 'edit') {
      if (amount < 0) return alert('0 이상의 금액을 입력해주세요.');
      success = await updateBudget(amount);
    }

    if (success) resetBalanceEditor();
  };

  const resetTransactionForm = () => {
    setTransactionForm({
      category: '',
      amount: '',
      memo: '',
      date: getTodayDateString()
    });
    setEditingTransaction(null);
  };

  const openAddTransactionModal = () => {
    resetTransactionForm();
    setShowTransactionModal(true);
  };

  const openEditTransactionModal = (transaction) => {
    setEditingTransaction(transaction);
    setTransactionForm({
      category: transaction.category,
      amount: String(transaction.amount),
      memo: transaction.memo || '',
      date: transaction.date
    });
    setShowTransactionModal(true);
  };

  const closeTransactionModal = () => {
    setShowTransactionModal(false);
    resetTransactionForm();
  };

  const handleSubmitTransaction = async () => {
    if (!transactionForm.category || !transactionForm.amount || !transactionForm.date) {
      alert('카테고리, 금액, 날짜를 입력해주세요.');
      return;
    }

    const payload = {
      category: transactionForm.category.trim(),
      amount: parseInt(transactionForm.amount, 10),
      memo: transactionForm.memo.trim(),
      date: transactionForm.date
    };

    if (!payload.category || Number.isNaN(payload.amount) || payload.amount <= 0) {
      alert('올바른 카테고리와 금액을 입력해주세요.');
      return;
    }

    const success = editingTransaction
      ? await updateTransaction(editingTransaction.id, payload)
      : await addTransaction(payload);

    if (success) closeTransactionModal();
  };

  const handleDeleteTransaction = async (id) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      await deleteTransaction(id);
    }
  };

  const handlePrevMonth = () => setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentYear, currentMonth + 1, 1));

  const monthlyChangeAmount = monthlyBudget - monthStartBalance;
  const summaryWarning = remaining < 0
    ? `현재 ${formatCurrency(Math.abs(remaining))}원 초과 사용 중입니다.`
    : stats.daysRemaining > 0
      ? `남은 ${stats.daysRemaining}일 동안 하루 ${formatCurrency(Math.round(stats.recommendedDaily))}원 이하 사용 권장`
      : '이번 달 마감 상태입니다.';

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-2">
          <Wallet className="w-8 h-8" />
          용돈 관리
        </h1>
        <div className="text-sm text-gray-500">
          이번 달 시작 잔고와 사용 흐름을 기준으로 봅니다.
        </div>
      </div>

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

      <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 shadow-xl text-white">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-4 flex-1">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              용돈 잔액
            </h2>

            {isEditingBalance ? (
              <div className="space-y-3">
                <div className="text-sm">
                  {balanceEditMode === 'add' && '추가 충전할 금액을 입력하세요'}
                  {balanceEditMode === 'subtract' && '잔액에서 차감할 금액을 입력하세요'}
                  {balanceEditMode === 'edit' && '전체 잔액 기준값을 다시 설정하세요'}
                </div>
                <Input
                  type="number"
                  value={balanceInput}
                  onChange={(e) => setBalanceInput(e.target.value)}
                  placeholder="금액 입력"
                  className="bg-white text-gray-800"
                  min="0"
                />
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="primary" onClick={handleSaveBalance}>
                    저장
                  </Button>
                  <Button variant="secondary" onClick={resetBalanceEditor}>
                    취소
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="text-3xl font-bold">{formatCurrency(monthlyBudget)}</div>
                <div className="grid grid-cols-3 gap-2">
                  <Button variant="secondary" size="sm" onClick={() => openBalanceEditor('add')} icon={Plus}>
                    충전
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => openBalanceEditor('subtract')} icon={Minus}>
                    차감
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => openBalanceEditor('edit')} icon={Edit}>
                    기준 수정
                  </Button>
                </div>
              </>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 lg:w-[340px]">
            <div className="bg-white/15 rounded-xl p-4">
              <p className="text-xs text-white/80 mb-1">이번 달 시작 잔고</p>
              <p className="text-lg font-bold">{formatCurrency(monthStartBalance)}</p>
            </div>
            <div className="bg-white/15 rounded-xl p-4">
              <p className="text-xs text-white/80 mb-1">누적 충전/차감</p>
              <p className={`text-lg font-bold ${monthlyChangeAmount >= 0 ? 'text-green-100' : 'text-red-100'}`}>
                {monthlyChangeAmount >= 0 ? '+' : '-'}{formatCurrency(Math.abs(monthlyChangeAmount))}
              </p>
            </div>
            <div className="bg-white/15 rounded-xl p-4">
              <p className="text-xs text-white/80 mb-1">이번 달 사용</p>
              <p className="text-lg font-bold">{formatCurrency(totalSpent)}</p>
            </div>
            <div className="bg-white/15 rounded-xl p-4">
              <p className="text-xs text-white/80 mb-1">현재 잔액</p>
              <p className="text-lg font-bold">{formatCurrency(remaining)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">이번 달 지출 현황</h2>
          <span className={`text-sm font-semibold ${getProgressTextColor()}`}>{summaryWarning}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
            <p className="text-sm text-gray-600 mb-1">이번 달 시작 잔고</p>
            <p className="text-lg font-bold text-blue-600">{formatCurrency(monthStartBalance)}</p>
          </div>
          <div className="p-4 bg-red-50 rounded-xl border border-red-200">
            <p className="text-sm text-gray-600 mb-1">이번 달 지출</p>
            <p className="text-lg font-bold text-red-500">{formatCurrency(totalSpent)}</p>
          </div>
          <div className={`p-4 rounded-xl border ${remaining < 0 ? 'bg-red-100 border-red-300' : 'bg-green-50 border-green-200'}`}>
            <p className="text-sm text-gray-600 mb-1">현재 잔액</p>
            <p className={`text-lg font-bold ${getProgressTextColor()}`}>{formatCurrency(remaining)}</p>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">잔액 진행률</span>
            <span className={`font-semibold ${getProgressTextColor()}`}>
              {remainingPercentage.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div
              className={`h-full ${getProgressColor()} transition-all duration-300`}
              style={{ width: `${Math.max(0, Math.min(100, remainingPercentage))}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg">
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <TrendingDown className="w-4 h-4" />
            <span className="text-sm">일평균 지출</span>
          </div>
          <div className="text-xl font-bold text-gray-800">{formatCurrency(Math.round(stats.averageDaily))}</div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg">
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm">남은 기간 권장</span>
          </div>
          <div className="text-xl font-bold text-gray-800">{formatCurrency(Math.round(stats.recommendedDaily))}</div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg">
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <Wallet className="w-4 h-4" />
            <span className="text-sm">최대 지출</span>
          </div>
          <div className="text-xl font-bold text-gray-800">{formatCurrency(stats.maxSpending)}</div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg">
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">가장 많이 쓴 카테고리</span>
          </div>
          <div className="text-lg font-bold text-gray-800 truncate">
            {stats.topCategory ? `${stats.topCategory[0]} · ${formatCurrency(stats.topCategory[1])}` : '-'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[0.7fr_1.3fr] gap-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">카테고리 요약</h2>
            <span className="text-sm text-gray-500">{stats.transactionCount}건</span>
          </div>

          {categoryBreakdown.length > 0 ? (
            <div className="space-y-3">
              {categoryBreakdown.map(([category, amount]) => (
                <div key={category} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700">{category}</span>
                    <span className="font-semibold text-gray-800">{formatCurrency(amount)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-pink-400 to-purple-500"
                      style={{ width: `${totalSpent > 0 ? (amount / totalSpent) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">이번 달 사용 내역이 없습니다.</div>
          )}
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
          <div className="flex flex-col gap-3 mb-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">거래 내역</h2>
              <Button variant="primary" size="sm" onClick={openAddTransactionModal} icon={Plus}>
                추가
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-[1.1fr_0.9fr_0.9fr] gap-3">
              <Input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="카테고리/메모 검색"
                icon={Search}
              />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-xl bg-white/80"
              >
                <option value="all">전체 카테고리</option>
                {allCategoryOptions.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-xl bg-white/80"
              >
                <option value="dateDesc">최신순</option>
                <option value="dateAsc">오래된순</option>
                <option value="amountDesc">금액 큰순</option>
                <option value="amountAsc">금액 작은순</option>
              </select>
            </div>

            {recentCategories.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {recentCategories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setTransactionForm((prev) => ({ ...prev, category }))}
                    className="px-3 py-1.5 rounded-full bg-pink-50 text-pink-700 text-sm hover:bg-pink-100 transition-colors"
                  >
                    최근 {category}
                  </button>
                ))}
              </div>
            )}
          </div>

          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {currentMonthTransactions.length === 0 ? '아직 거래 내역이 없습니다' : '조건에 맞는 거래가 없습니다'}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-800 break-words">{transaction.category}</div>
                    <div className="text-sm text-gray-500 break-words">
                      {transaction.date} {transaction.memo && `· ${transaction.memo}`}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 ml-3">
                    <div className="text-lg font-bold text-red-500">
                      -{formatCurrency(transaction.amount)}
                    </div>
                    <button
                      onClick={() => openEditTransactionModal(transaction)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-blue-100 rounded-lg"
                      title="수정"
                    >
                      <Edit size={18} className="text-blue-500" />
                    </button>
                    <button
                      onClick={() => handleDeleteTransaction(transaction.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-100 rounded-lg"
                      title="삭제"
                    >
                      <Trash2 size={18} className="text-red-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={showTransactionModal}
        onClose={closeTransactionModal}
        title={editingTransaction ? '용돈 사용 내역 수정' : '용돈 사용 내역 추가'}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">카테고리</label>
            <select
              value={transactionForm.category}
              onChange={(e) => setTransactionForm({ ...transactionForm, category: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl bg-white/80"
            >
              <option value="">카테고리 선택</option>
              {allCategoryOptions.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {recentCategories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {recentCategories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setTransactionForm({ ...transactionForm, category })}
                  className="px-3 py-1.5 rounded-full bg-pink-50 text-pink-700 text-sm hover:bg-pink-100 transition-colors"
                >
                  {category}
                </button>
              ))}
            </div>
          )}

          <Input
            label="금액"
            type="number"
            value={transactionForm.amount}
            onChange={(e) => setTransactionForm({ ...transactionForm, amount: e.target.value })}
            placeholder="0"
            min="1"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">메모</label>
            <textarea
              value={transactionForm.memo}
              onChange={(e) => setTransactionForm({ ...transactionForm, memo: e.target.value })}
              placeholder="메모 (선택사항)"
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <Button variant="secondary" onClick={closeTransactionModal} className="flex-1">
              취소
            </Button>
            <Button variant="primary" onClick={handleSubmitTransaction} className="flex-1">
              {editingTransaction ? '수정' : '추가'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
