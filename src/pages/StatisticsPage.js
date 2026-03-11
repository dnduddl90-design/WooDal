import React, { useMemo, useState } from 'react';
import {
  BarChart3,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Layers3,
  PiggyBank,
  Receipt,
  TrendingUp,
  Users,
  Wallet
} from 'lucide-react';
import { CATEGORIES } from '../constants';
import { formatCurrency, parseDateString } from '../utils';
import { Button, Modal } from '../components/common';
import { useStatistics } from '../hooks';

const SectionCard = ({ title, subtitle, isOpen, onToggle, children, badge = null }) => (
  <div className="glass-effect rounded-xl shadow-lg overflow-hidden">
    <button
      type="button"
      onClick={onToggle}
      className="w-full flex items-center justify-between gap-3 px-4 py-4 sm:px-6 sm:py-5 text-left hover:bg-white/40 transition-colors"
    >
      <div className="min-w-0">
        <h3 className="text-base sm:text-lg font-bold text-gray-800">{title}</h3>
        {subtitle && (
          <p className="text-xs sm:text-sm text-gray-500 mt-1">{subtitle}</p>
        )}
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        {badge}
        <ChevronDown className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} size={18} />
      </div>
    </button>
    {isOpen && (
      <div className="px-4 pb-4 sm:px-6 sm:pb-6 border-t border-white/50">
        {children}
      </div>
    )}
  </div>
);

const SummaryCard = ({ label, value, detail, icon: Icon, tone = 'blue', onClick = null }) => {
  const toneClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    red: 'bg-red-100 text-red-600',
    amber: 'bg-amber-100 text-amber-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600'
  };

  return (
    <button
      type="button"
      onClick={onClick || undefined}
      className={`glass-effect rounded-xl p-4 sm:p-5 shadow-lg text-left w-full ${onClick ? 'hover:shadow-xl transition-shadow' : ''}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs sm:text-sm text-gray-600 mb-1">{label}</p>
          <p className="text-lg sm:text-2xl font-bold text-gray-800 truncate">{value}</p>
          {detail && <p className="text-xs sm:text-sm text-gray-500 mt-1">{detail}</p>}
        </div>
        <div className={`p-3 rounded-full flex-shrink-0 ${toneClasses[tone] || toneClasses.blue}`}>
          <Icon size={22} className="sm:w-7 sm:h-7" />
        </div>
      </div>
    </button>
  );
};

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
  const {
    familyMembers,
    getUserInfo,
    currentSummary,
    incomeChange,
    expenseChange,
    last6Months
  } = useStatistics({
    currentDate,
    transactions,
    fixedExpenses,
    familyInfo,
    currentUser
  });

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showPocketMoneyModal, setShowPocketMoneyModal] = useState(false);
  const [userFilter, setUserFilter] = useState('all');
  const [detailTypeFilter, setDetailTypeFilter] = useState('all');
  const [detailSort, setDetailSort] = useState('dateDesc');
  const [sections, setSections] = useState({
    overview: true,
    budget: true,
    categories: true,
    family: true,
    trends: true
  });

  const toggleSection = (sectionKey) => {
    setSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

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

  const currentIncome = currentSummary.income;
  const currentExpense = currentSummary.expense;
  const currentSavings = currentSummary.savings;
  const currentExpenseTotal = currentSummary.expenseTotal;
  const fixedExpenseTotal = currentSummary.fixedExpenseTotal;
  const fixedNonSavingsTotal = currentSummary.fixedNonSavingsTotal;
  const totalPocketMoney = currentSummary.totalPocketMoney;
  const savingRate = currentSummary.savingRate;
  const monthlyBudget = parseInt(settings?.budget?.monthly, 10) || 0;
  const budgetRate = monthlyBudget > 0 ? (currentExpense / monthlyBudget) * 100 : 0;

  const categoryEntries = useMemo(() => {
    return Object.entries(currentSummary.categoryTotals).sort(([, a], [, b]) => b - a);
  }, [currentSummary.categoryTotals]);

  const paymentMethodEntries = useMemo(() => {
    return Object.entries(currentSummary.paymentMethodTotals).sort(([, a], [, b]) => b - a);
  }, [currentSummary.paymentMethodTotals]);

  const categoryBudgetEntries = useMemo(() => {
    return CATEGORIES.expense
      .map((category) => {
        const budgetAmount = parseInt(settings?.budget?.categories?.[category.id], 10) || 0;
        if (budgetAmount <= 0) return null;

        const spentAmount = currentSummary.categoryTotals[category.name] || 0;
        return {
          ...category,
          budgetAmount,
          spentAmount,
          percentage: budgetAmount > 0 ? (spentAmount / budgetAmount) * 100 : 0
        };
      })
      .filter(Boolean);
  }, [currentSummary.categoryTotals, settings]);

  const categoryModalTransactions = useMemo(() => {
    if (!selectedCategory) return [];

    let items = [...selectedCategory.transactions];

    if (userFilter !== 'all') {
      items = items.filter((item) => item.userId === userFilter);
    }

    if (detailTypeFilter === 'transactions') {
      items = items.filter((item) => !item.isFixed);
    }

    if (detailTypeFilter === 'fixed') {
      items = items.filter((item) => item.isFixed);
    }

    items.sort((a, b) => {
      if (detailSort === 'amountDesc') return b.amount - a.amount;
      if (detailSort === 'amountAsc') return a.amount - b.amount;
      if (detailSort === 'dateAsc') return parseDateString(a.date) - parseDateString(b.date);
      return parseDateString(b.date) - parseDateString(a.date);
    });

    return items;
  }, [detailSort, detailTypeFilter, selectedCategory, userFilter]);

  const pocketMoneyEntries = useMemo(() => {
    return Object.entries(currentSummary.pocketMoneyByUser).sort(([, a], [, b]) => b.total - a.total);
  }, [currentSummary.pocketMoneyByUser]);

  const pocketMoneyAverage = totalPocketMoney > 0 && pocketMoneyEntries.length > 0
    ? Math.round(totalPocketMoney / pocketMoneyEntries.length)
    : 0;

  const openCategoryModal = (categoryName) => {
    const categoryMeta = CATEGORIES.expense.find((item) => item.name === categoryName);
    setSelectedCategory({
      name: categoryName,
      total: currentSummary.categoryTotals[categoryName] || 0,
      transactions: currentSummary.categoryDetails[categoryName] || [],
      icon: categoryMeta?.icon,
      color: categoryMeta?.color
    });
    setUserFilter('all');
    setDetailTypeFilter('all');
    setDetailSort('dateDesc');
    setShowCategoryModal(true);
  };

  const pocketMoneyChangeText = totalPocketMoney > 0
    ? `${pocketMoneyEntries.length}명 정산 필요`
    : '정산 대기 내역 없음';

  const analysisMessage = currentIncome >= currentExpense
    ? `이번 달은 소비 ${formatCurrency(currentExpense)}원, 저축 ${formatCurrency(currentSavings)}원으로 흑자 흐름입니다.`
    : `이번 달은 소비가 수입보다 ${formatCurrency(currentExpense - currentIncome)}원 많습니다. 지출 점검이 필요합니다.`;

  const filteredCategoryAverage = categoryModalTransactions.length > 0
    ? Math.round(categoryModalTransactions.reduce((sum, item) => sum + item.amount, 0) / categoryModalTransactions.length)
    : 0;

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in pb-20 sm:pb-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg sm:text-2xl font-bold gradient-text">
            {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월 통계
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            소비, 고정지출, 저축, 가족별 사용 흐름을 한 번에 봅니다.
          </p>
        </div>
        <div className="flex items-center gap-2">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-6">
        <SummaryCard
          label="이번 달 수입"
          value={`${formatCurrency(currentIncome)}원`}
          detail={incomeChange !== 0 ? `전월 대비 ${incomeChange > 0 ? '+' : ''}${incomeChange.toFixed(1)}%` : '전월 대비 변화 없음'}
          icon={TrendingUp}
          tone="green"
        />
        <SummaryCard
          label="소비 지출"
          value={`${formatCurrency(currentExpense)}원`}
          detail={expenseChange !== 0 ? `전월 대비 ${expenseChange > 0 ? '+' : ''}${expenseChange.toFixed(1)}%` : '전월 대비 변화 없음'}
          icon={Receipt}
          tone="red"
        />
        <SummaryCard
          label="고정지출"
          value={`${formatCurrency(fixedExpenseTotal)}원`}
          detail={`총 유출의 ${currentSummary.fixedShareRate.toFixed(1)}%`}
          icon={Layers3}
          tone="purple"
        />
        <SummaryCard
          label="저축"
          value={`${formatCurrency(currentSavings)}원`}
          detail={`저축률 ${savingRate.toFixed(1)}%`}
          icon={PiggyBank}
          tone="blue"
        />
        <SummaryCard
          label="총 유출"
          value={`${formatCurrency(currentExpenseTotal)}원`}
          detail={`소비 ${formatCurrency(currentExpense)}원 + 저축 ${formatCurrency(currentSavings)}원`}
          icon={Wallet}
          tone="amber"
        />
        <SummaryCard
          label="정산 필요 용돈"
          value={`${formatCurrency(totalPocketMoney)}원`}
          detail={pocketMoneyChangeText}
          icon={CreditCard}
          tone="orange"
          onClick={() => {
            if (totalPocketMoney > 0) setShowPocketMoneyModal(true);
          }}
        />
      </div>

      <SectionCard
        title="요약 인사이트"
        subtitle="이번 달 흐름을 짧게 읽고, 결제수단과 고정지출 비중을 같이 봅니다."
        isOpen={sections.overview}
        onToggle={() => toggleSection('overview')}
        badge={(
          <span className="px-3 py-1 rounded-full bg-white/80 text-xs font-semibold text-gray-700">
            핵심 요약
          </span>
        )}
      >
        <div className="space-y-4 pt-4">
          <div className={`rounded-xl p-4 sm:p-5 ${currentIncome >= currentExpense ? 'bg-gradient-to-r from-green-50 to-blue-50' : 'bg-gradient-to-r from-red-50 to-orange-50'}`}>
            <p className="text-sm sm:text-base font-semibold text-gray-800 mb-2">이번 달 해석</p>
            <p className="text-sm sm:text-base text-gray-700">{analysisMessage}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-xl border border-gray-200 bg-white/80 p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-gray-800">지출 구성</p>
                <span className="text-xs text-gray-500">소비/고정/저축 구분</span>
              </div>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-600">일반 지출</span>
                    <span className="font-semibold text-gray-800">{formatCurrency(currentSummary.transactionExpenseTotal)}원</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-slate-400 to-slate-600"
                      style={{ width: `${currentExpenseTotal > 0 ? (currentSummary.transactionExpenseTotal / currentExpenseTotal) * 100 : 0}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-600">고정지출</span>
                    <span className="font-semibold text-purple-700">{formatCurrency(fixedExpenseTotal)}원</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-400 to-purple-600"
                      style={{ width: `${currentExpenseTotal > 0 ? (fixedExpenseTotal / currentExpenseTotal) * 100 : 0}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-600">저축</span>
                    <span className="font-semibold text-blue-700">{formatCurrency(currentSavings)}원</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-400 to-blue-600"
                      style={{ width: `${currentExpenseTotal > 0 ? (currentSavings / currentExpenseTotal) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white/80 p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-gray-800">결제수단 비중</p>
                <span className="text-xs text-gray-500">거래 + 고정지출 포함</span>
              </div>
              {paymentMethodEntries.length > 0 ? (
                <div className="space-y-3">
                  {paymentMethodEntries.slice(0, 5).map(([method, amount]) => (
                    <div key={method} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">{method}</span>
                        <span className="font-semibold text-gray-800">
                          {formatCurrency(amount)}원
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-400 to-blue-600"
                          style={{ width: `${currentExpenseTotal > 0 ? (amount / currentExpenseTotal) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">표시할 결제수단 데이터가 없습니다.</p>
              )}
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="예산"
        subtitle="월 예산과 카테고리 예산을 같이 봅니다."
        isOpen={sections.budget}
        onToggle={() => toggleSection('budget')}
        badge={monthlyBudget > 0 ? (
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${currentExpense <= monthlyBudget ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {budgetRate.toFixed(1)}%
          </span>
        ) : null}
      >
        <div className="space-y-4 pt-4">
          {monthlyBudget > 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white/80 p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm sm:text-base font-semibold text-gray-800">월 예산 진행률</h4>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${currentExpense <= monthlyBudget ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {budgetRate.toFixed(1)}%
                </span>
              </div>
              <div className="h-8 rounded-full bg-gray-200 overflow-hidden">
                <div
                  className={`h-full ${currentExpense <= monthlyBudget ? 'bg-gradient-to-r from-green-400 to-green-600' : 'bg-gradient-to-r from-red-400 to-red-600'}`}
                  style={{ width: `${Math.min(budgetRate, 100)}%` }}
                />
              </div>
              <div className="grid grid-cols-3 gap-3 mt-4 text-center">
                <div className="rounded-lg bg-blue-50 p-3">
                  <p className="text-[11px] sm:text-xs text-gray-500">예산</p>
                  <p className="text-sm sm:text-base font-bold text-blue-700">{formatCurrency(monthlyBudget)}원</p>
                </div>
                <div className="rounded-lg bg-red-50 p-3">
                  <p className="text-[11px] sm:text-xs text-gray-500">사용</p>
                  <p className="text-sm sm:text-base font-bold text-red-700">{formatCurrency(currentExpense)}원</p>
                </div>
                <div className="rounded-lg bg-purple-50 p-3">
                  <p className="text-[11px] sm:text-xs text-gray-500">남은 예산</p>
                  <p className="text-sm sm:text-base font-bold text-purple-700">{formatCurrency(Math.max(monthlyBudget - currentExpense, 0))}원</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-gray-300 p-4 text-sm text-gray-500">
              월 예산이 아직 설정되지 않았습니다.
            </div>
          )}

          {categoryBudgetEntries.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white/80 p-4 sm:p-5">
              <h4 className="text-sm sm:text-base font-semibold text-gray-800 mb-4">카테고리별 예산</h4>
              <div className="space-y-4">
                {categoryBudgetEntries.map((entry) => {
                  const Icon = entry.icon;
                  const isOverBudget = entry.spentAmount > entry.budgetAmount;
                  return (
                    <div key={entry.id} className="space-y-2">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className={`p-2 rounded-lg ${entry.color}`}>
                            <Icon size={14} />
                          </div>
                          <span className="text-sm font-medium text-gray-700 truncate">{entry.name}</span>
                        </div>
                        <div className="text-right text-xs sm:text-sm">
                          <p className={`font-semibold ${isOverBudget ? 'text-red-600' : 'text-gray-800'}`}>
                            {formatCurrency(entry.spentAmount)}원
                          </p>
                          <p className="text-gray-500">/ {formatCurrency(entry.budgetAmount)}원</p>
                        </div>
                      </div>
                      <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className={`h-full ${isOverBudget ? 'bg-gradient-to-r from-red-400 to-red-600' : entry.percentage > 80 ? 'bg-gradient-to-r from-orange-400 to-orange-600' : 'bg-gradient-to-r from-green-400 to-green-600'}`}
                          style={{ width: `${Math.min(entry.percentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </SectionCard>

      <SectionCard
        title="카테고리"
        subtitle="카테고리 상세와 고정지출 비중을 확인합니다."
        isOpen={sections.categories}
        onToggle={() => toggleSection('categories')}
        badge={(
          <span className="px-3 py-1 rounded-full bg-white/80 text-xs font-semibold text-gray-700">
            {categoryEntries.length}개
          </span>
        )}
      >
        <div className="space-y-4 pt-4">
          <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_0.7fr] gap-4">
            <div className="rounded-xl border border-gray-200 bg-white/80 p-4 sm:p-5">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm sm:text-base font-semibold text-gray-800">카테고리별 지출</h4>
                <span className="text-xs text-gray-500">눌러서 상세 보기</span>
              </div>
              {categoryEntries.length > 0 ? (
                <div className="space-y-3">
                  {categoryEntries.map(([categoryName, amount], index) => {
                    const maxAmount = Math.max(...categoryEntries.map(([, value]) => value));
                    const percentage = maxAmount > 0 ? (amount / maxAmount) * 100 : 0;
                    const colors = [
                      'bg-blue-500', 'bg-red-500', 'bg-green-500',
                      'bg-yellow-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500'
                    ];

                    return (
                      <button
                        type="button"
                        key={categoryName}
                        className="w-full text-left rounded-xl p-3 hover:bg-gray-50 transition-colors"
                        onClick={() => openCategoryModal(categoryName)}
                      >
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium text-gray-700 truncate pr-2">{categoryName}</span>
                          <span className="font-bold text-gray-800">{formatCurrency(amount)}원</span>
                        </div>
                        <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
                          <div
                            className={`h-full ${colors[index % colors.length]}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-sm text-gray-500">이번 달 지출 내역이 없습니다.</div>
              )}
            </div>

            <div className="rounded-xl border border-gray-200 bg-white/80 p-4 sm:p-5">
              <h4 className="text-sm sm:text-base font-semibold text-gray-800 mb-4">고정지출 비중</h4>
              <div className="space-y-3 text-sm">
                <div className="rounded-lg bg-purple-50 p-3">
                  <p className="text-xs text-gray-500 mb-1">고정 소비 지출</p>
                  <p className="font-bold text-purple-700">{formatCurrency(fixedNonSavingsTotal)}원</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs text-gray-500 mb-1">전체 일반 지출</p>
                  <p className="font-bold text-slate-700">{formatCurrency(currentSummary.transactionExpenseTotal)}원</p>
                </div>
                <div className="rounded-lg bg-blue-50 p-3">
                  <p className="text-xs text-gray-500 mb-1">저축성 고정지출</p>
                  <p className="font-bold text-blue-700">{formatCurrency(currentSummary.fixedSavingsTotal)}원</p>
                </div>
                <div className="pt-2 border-t border-gray-100">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">총 유출 대비 비중</span>
                    <span className="font-semibold text-gray-800">{currentSummary.fixedShareRate.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="가족"
        subtitle="가족 구성원별 소비와 저축 비중입니다."
        isOpen={sections.family}
        onToggle={() => toggleSection('family')}
        badge={Object.keys(currentSummary.expensesByUser).length > 0 ? (
          <span className="px-3 py-1 rounded-full bg-white/80 text-xs font-semibold text-gray-700">
            {Object.keys(currentSummary.expensesByUser).length}명
          </span>
        ) : null}
      >
        <div className="space-y-4 pt-4">
          {Object.keys(currentSummary.expensesByUser).length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="rounded-xl border border-gray-200 bg-white/80 p-4 sm:p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Users size={18} className="text-red-500" />
                  <h4 className="text-sm sm:text-base font-semibold text-gray-800">소비 지출</h4>
                </div>
                <div className="space-y-3">
                  {Object.entries(currentSummary.expensesByUser)
                    .sort(([, a], [, b]) => b - a)
                    .map(([userId, amount], index) => {
                      const maxAmount = Math.max(...Object.values(currentSummary.expensesByUser));
                      const percentage = maxAmount > 0 ? (amount / maxAmount) * 100 : 0;
                      const user = getUserInfo(userId);
                      const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-amber-500'];
                      return (
                        <div key={userId} className="space-y-1.5">
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                              <span>{user.avatar}</span>
                              <span>{user.name}</span>
                            </span>
                            <span className="text-sm font-bold text-gray-800">{formatCurrency(amount)}원</span>
                          </div>
                          <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
                            <div className={`h-full ${colors[index % colors.length]}`} style={{ width: `${percentage}%` }} />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white/80 p-4 sm:p-5">
                <div className="flex items-center gap-2 mb-4">
                  <PiggyBank size={18} className="text-blue-500" />
                  <h4 className="text-sm sm:text-base font-semibold text-gray-800">저축</h4>
                </div>
                {Object.keys(currentSummary.savingsByUser).length > 0 ? (
                  <div className="space-y-3">
                    {Object.entries(currentSummary.savingsByUser)
                      .sort(([, a], [, b]) => b - a)
                      .map(([userId, amount], index) => {
                        const maxAmount = Math.max(...Object.values(currentSummary.savingsByUser));
                        const percentage = maxAmount > 0 ? (amount / maxAmount) * 100 : 0;
                        const user = getUserInfo(userId);
                        const colors = ['bg-blue-500', 'bg-cyan-500', 'bg-indigo-500', 'bg-sky-500'];
                        return (
                          <div key={userId} className="space-y-1.5">
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <span>{user.avatar}</span>
                                <span>{user.name}</span>
                              </span>
                              <span className="text-sm font-bold text-blue-700">{formatCurrency(amount)}원</span>
                            </div>
                            <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
                              <div className={`h-full ${colors[index % colors.length]}`} style={{ width: `${percentage}%` }} />
                            </div>
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">이번 달 저축 내역이 없습니다.</p>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-gray-300 p-4 text-sm text-gray-500">
              가족별 통계를 표시할 데이터가 없습니다.
            </div>
          )}
        </div>
      </SectionCard>

      <SectionCard
        title="트렌드"
        subtitle="최근 6개월 흐름과 정산 상태를 봅니다."
        isOpen={sections.trends}
        onToggle={() => toggleSection('trends')}
        badge={(
          <span className="px-3 py-1 rounded-full bg-white/80 text-xs font-semibold text-gray-700">
            6개월
          </span>
        )}
      >
        <div className="space-y-4 pt-4">
          <div className="rounded-xl border border-gray-200 bg-white/80 p-4 sm:p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 size={18} className="text-indigo-500" />
                <h4 className="text-sm sm:text-base font-semibold text-gray-800">최근 6개월 트렌드</h4>
              </div>
            </div>
            <div className="space-y-3">
              {last6Months.map((monthData, index) => {
                const maxAmount = Math.max(monthData.income, monthData.expense, monthData.saving);
                const incomePercentage = maxAmount > 0 ? (monthData.income / maxAmount) * 100 : 0;
                const expensePercentage = maxAmount > 0 ? (monthData.expense / maxAmount) * 100 : 0;
                const savingPercentage = maxAmount > 0 ? (monthData.saving / maxAmount) * 100 : 0;
                const isCurrentMonth = index === last6Months.length - 1;

                return (
                  <div key={monthData.monthKey} className={`space-y-2 rounded-xl p-3 ${isCurrentMonth ? 'bg-blue-50' : 'bg-transparent'}`}>
                    <div className="flex justify-between items-center gap-3 text-sm">
                      <span className={`font-semibold ${isCurrentMonth ? 'text-blue-700' : 'text-gray-700'}`}>
                        {monthData.month} {isCurrentMonth && '(이번 달)'}
                      </span>
                      <div className="flex items-center gap-3 text-xs sm:text-sm flex-wrap justify-end">
                        <span className="text-green-600">+{formatCurrency(monthData.income)}</span>
                        <span className="text-red-600">-{formatCurrency(monthData.expense)}</span>
                        <span className="text-blue-600">저축 {formatCurrency(monthData.saving)}</span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <div className="h-2.5 rounded bg-green-500" style={{ width: `${incomePercentage}%` }} />
                      <div className="h-2.5 rounded bg-red-500" style={{ width: `${expensePercentage}%` }} />
                      {monthData.saving > 0 && (
                        <div className="h-2.5 rounded bg-blue-500" style={{ width: `${savingPercentage}%` }} />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gradient-to-r from-orange-50 to-yellow-50 p-4 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h4 className="text-sm sm:text-base font-semibold text-gray-800">용돈 정산 상태</h4>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  통계 본문 아래 긴 블록 대신 여기서 바로 확인하고 상세를 열 수 있습니다.
                </p>
              </div>
              <Button
                variant={totalPocketMoney > 0 ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setShowPocketMoneyModal(true)}
              >
                {totalPocketMoney > 0 ? '정산 내역 보기' : '정산 상태 보기'}
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
              <div className="rounded-lg bg-white/80 p-3">
                <p className="text-[11px] sm:text-xs text-gray-500">정산 필요 금액</p>
                <p className="text-sm sm:text-base font-bold text-orange-700">{formatCurrency(totalPocketMoney)}원</p>
              </div>
              <div className="rounded-lg bg-white/80 p-3">
                <p className="text-[11px] sm:text-xs text-gray-500">대상 인원</p>
                <p className="text-sm sm:text-base font-bold text-gray-800">{pocketMoneyEntries.length}명</p>
              </div>
              <div className="rounded-lg bg-white/80 p-3">
                <p className="text-[11px] sm:text-xs text-gray-500">1인 평균</p>
                <p className="text-sm sm:text-base font-bold text-gray-800">{formatCurrency(pocketMoneyAverage)}원</p>
              </div>
            </div>
          </div>
        </div>
      </SectionCard>

      {selectedCategory && (
        <Modal
          isOpen={showCategoryModal}
          onClose={() => setShowCategoryModal(false)}
          title={`${selectedCategory.name} 세부 내역`}
          size="lg"
        >
          <div className="space-y-4">
            <div className="rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {selectedCategory.icon && (
                    <div className={`p-3 rounded-lg ${selectedCategory.color || 'bg-gray-100'}`}>
                      <selectedCategory.icon size={22} />
                    </div>
                  )}
                  <div>
                    <p className="text-lg font-bold text-gray-800">{selectedCategory.name}</p>
                    <p className="text-sm text-gray-600">총 {selectedCategory.transactions.length}건</p>
                  </div>
                </div>
                <p className="text-xl font-bold text-red-600">-{formatCurrency(selectedCategory.total)}원</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setUserFilter('all')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium ${userFilter === 'all' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                >
                  전체
                </button>
                {familyMembers.map((member, index) => {
                  const count = selectedCategory.transactions.filter((item) => item.userId === member.id).length;
                  const colors = ['bg-blue-600', 'bg-pink-600', 'bg-purple-600', 'bg-green-600'];
                  return (
                    <button
                      key={member.id}
                      onClick={() => setUserFilter(member.id)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${userFilter === member.id ? `${colors[index % colors.length]} text-white` : 'bg-gray-100 text-gray-700'}`}
                    >
                      <span>{member.avatar}</span>
                      <span>{member.name}</span>
                      <span className="text-xs">({count})</span>
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <select
                  value={detailTypeFilter}
                  onChange={(e) => setDetailTypeFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-sm"
                >
                  <option value="all">거래 + 고정지출</option>
                  <option value="transactions">일반 거래만</option>
                  <option value="fixed">고정지출만</option>
                </select>
                <select
                  value={detailSort}
                  onChange={(e) => setDetailSort(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-sm"
                >
                  <option value="dateDesc">날짜 최신순</option>
                  <option value="dateAsc">날짜 오래된순</option>
                  <option value="amountDesc">금액 큰순</option>
                  <option value="amountAsc">금액 작은순</option>
                </select>
              </div>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {categoryModalTransactions.length > 0 ? (
                categoryModalTransactions.map((item) => {
                  const user = getUserInfo(item.userId);
                  const transactionDate = parseDateString(item.date);
                  const dateStr = `${transactionDate.getMonth() + 1}/${transactionDate.getDate()}`;

                  return (
                    <div
                      key={item.id}
                      className={`flex items-center gap-3 p-3 border rounded-lg ${item.isFixed ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-white'}`}
                    >
                      <div className="flex-shrink-0">
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${user.color} bg-opacity-10`}>
                          <span>{user.avatar}</span>
                          <span className="text-xs font-bold text-gray-700">{user.name}</span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-gray-500 mb-1">{item.date} ({dateStr})</div>
                        <div className="text-sm font-medium text-gray-800 break-words">{item.memo || '메모 없음'}</div>
                        <div className="text-xs text-gray-600 mt-1">
                          {item.isFixed ? '고정지출' : '일반 거래'} · {item.displayPaymentMethod}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-base font-bold text-red-600">-{formatCurrency(item.amount)}원</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-gray-500">조건에 맞는 거래가 없습니다.</div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2 border-t border-gray-200">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-600 mb-1">거래 건수</div>
                <div className="text-base font-bold text-gray-800">{categoryModalTransactions.length}건</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-xs text-gray-600 mb-1">평균 지출</div>
                <div className="text-base font-bold text-blue-600">{formatCurrency(filteredCategoryAverage)}원</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-xs text-gray-600 mb-1">총 지출</div>
                <div className="text-base font-bold text-red-600">
                  {formatCurrency(categoryModalTransactions.reduce((sum, item) => sum + item.amount, 0))}원
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      <Modal
        isOpen={showPocketMoneyModal}
        onClose={() => setShowPocketMoneyModal(false)}
        title="용돈 정산 내역"
        size="lg"
      >
        <div className="space-y-4">
          <div className="rounded-xl bg-gradient-to-r from-orange-50 to-yellow-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-lg font-bold text-gray-800">정산 필요 총액</p>
                <p className="text-sm text-gray-600 mt-1">개인 용돈으로 결제된 생활비 사용분입니다.</p>
              </div>
              <p className="text-2xl font-bold text-orange-600">{formatCurrency(totalPocketMoney)}원</p>
            </div>
          </div>
          {pocketMoneyEntries.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {pocketMoneyEntries.map(([userId, data]) => {
                const user = getUserInfo(userId);
                const percentage = totalPocketMoney > 0 ? (data.total / totalPocketMoney) * 100 : 0;

                return (
                  <div key={userId} className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{user.avatar}</span>
                        <span className="font-bold text-gray-800">{user.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-orange-600">{formatCurrency(data.total)}원</p>
                        <p className="text-xs text-gray-500">{data.transactions.length}건</p>
                      </div>
                    </div>
                    <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden mb-3">
                      <div className="h-full bg-gradient-to-r from-orange-400 to-orange-600" style={{ width: `${percentage}%` }} />
                    </div>
                    <div className="space-y-1.5">
                      {data.transactions.slice(0, 5).map((transaction) => {
                        const category = CATEGORIES.expense.find((item) => item.id === transaction.category);
                        return (
                          <div key={transaction.id} className="flex items-center justify-between gap-3 text-sm border-b border-gray-100 pb-1 last:border-0">
                            <div className="min-w-0">
                              <p className="text-gray-700 truncate">
                                {transaction.date} · {category?.name || '기타'}
                              </p>
                              {transaction.memo && (
                                <p className="text-xs text-gray-400 truncate">{transaction.memo}</p>
                              )}
                            </div>
                            <span className="font-semibold text-orange-600 flex-shrink-0">
                              {formatCurrency(transaction.amount)}원
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-sm text-gray-500">정산할 용돈 사용 내역이 없습니다.</div>
          )}

          {totalPocketMoney > 0 && (
            <Button
              variant="primary"
              className="w-full"
              onClick={async () => {
                if (window.confirm(`💰 용돈 ${formatCurrency(totalPocketMoney)}원을 정산 완료 처리하시겠습니까?\n\n정산 완료하면 해당 거래들의 '용돈 사용' 체크가 해제됩니다.`)) {
                  await onSettlePocketMoney(currentDate.getFullYear(), currentDate.getMonth());
                  setShowPocketMoneyModal(false);
                }
              }}
            >
              정산 완료
            </Button>
          )}
        </div>
      </Modal>
    </div>
  );
};
