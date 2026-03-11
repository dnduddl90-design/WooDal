import { useMemo } from 'react';
import { CATEGORIES, PAYMENT_METHODS } from '../constants';
import {
  calculateMonthsSince,
  formatDate,
  getAvailableUsers,
  parseDateString,
  resolveUserInfo,
  sortByDateDesc
} from '../utils';
import { TransactionService } from '../services/transactionService';

const getMonthKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

const getMonthRange = (date) => ({
  start: new Date(date.getFullYear(), date.getMonth(), 1),
  end: new Date(date.getFullYear(), date.getMonth() + 1, 0)
});

const getCategoryName = (categoryId) => {
  const category = CATEGORIES.expense.find((item) => item.id === categoryId);
  return category ? category.name : '기타';
};

const getPaymentMethodName = (paymentMethodId) => {
  const paymentMethod = PAYMENT_METHODS.find((item) => item.id === paymentMethodId);
  return paymentMethod ? paymentMethod.name : paymentMethodId || '미지정';
};

export const createMonthSummary = ({
  monthDate,
  monthTransactions,
  fixedExpenses,
  adminUserId,
  currentUserId
}) => {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const monthStr = formatDate(new Date(year, month, 15));

  const monthFixedExpenses = fixedExpenses
    .filter((fixed) => {
      if (!fixed.isActive) return false;
      if (fixed.isUnlimited !== false) return true;
      if (fixed.startDate && monthStr < fixed.startDate) return false;
      if (fixed.endDate && monthStr > fixed.endDate) return false;
      return true;
    })
    .map((fixed) => {
      const monthsSinceBase = calculateMonthsSince(fixed.baseDate, monthStr);
      const monthlyIncrease = fixed.monthlyIncrease || 0;
      return {
        ...fixed,
        calculatedAmount: fixed.amount + (monthlyIncrease * monthsSinceBase)
      };
    });

  const incomeTransactions = monthTransactions.filter((transaction) => transaction.type === 'income');
  const expenseTransactions = monthTransactions.filter((transaction) => transaction.type === 'expense');
  const savingsTransactions = expenseTransactions.filter((transaction) => transaction.category === 'savings');
  const fixedSavings = monthFixedExpenses.filter((fixed) => fixed.category === 'savings');
  const fixedNonSavings = monthFixedExpenses.filter((fixed) => fixed.category !== 'savings');

  const income = TransactionService.calculateTotal(incomeTransactions);
  const transactionSavings = TransactionService.calculateTotal(savingsTransactions);
  const fixedSavingsTotal = fixedSavings.reduce((sum, fixed) => sum + fixed.calculatedAmount, 0);
  const savings = transactionSavings + fixedSavingsTotal;
  const transactionExpenseTotal = TransactionService.calculateTotal(expenseTransactions);
  const fixedExpenseTotal = monthFixedExpenses.reduce((sum, fixed) => sum + fixed.calculatedAmount, 0);
  const fixedNonSavingsTotal = fixedNonSavings.reduce((sum, fixed) => sum + fixed.calculatedAmount, 0);
  const variableExpense = transactionExpenseTotal - transactionSavings;
  const totalConsumption = variableExpense + fixedNonSavingsTotal;
  const expenseTotal = transactionExpenseTotal + fixedExpenseTotal;
  const totalOutflow = expenseTotal;

  const categoryTotals = {};
  const categoryDetails = {};
  const paymentMethodTotals = {};
  const expensesByUser = {};
  const savingsByUser = {};
  const pocketMoneyByUser = {};

  expenseTransactions.forEach((transaction) => {
    const categoryName = getCategoryName(transaction.category);
    categoryTotals[categoryName] = (categoryTotals[categoryName] || 0) + transaction.amount;
    if (!categoryDetails[categoryName]) categoryDetails[categoryName] = [];
    categoryDetails[categoryName].push({
      ...transaction,
      isFixed: false,
      displayPaymentMethod: getPaymentMethodName(transaction.paymentMethod)
    });

    const paymentMethodName = getPaymentMethodName(transaction.paymentMethod);
    paymentMethodTotals[paymentMethodName] = (paymentMethodTotals[paymentMethodName] || 0) + transaction.amount;

    const targetBucket = transaction.category === 'savings' ? savingsByUser : expensesByUser;
    const userId = transaction.userId || 'unknown';
    targetBucket[userId] = (targetBucket[userId] || 0) + transaction.amount;

    if (transaction.isPocketMoney === true) {
      if (!pocketMoneyByUser[userId]) {
        pocketMoneyByUser[userId] = {
          total: 0,
          transactions: []
        };
      }
      pocketMoneyByUser[userId].total += transaction.amount;
      pocketMoneyByUser[userId].transactions.push(transaction);
    }
  });

  monthFixedExpenses.forEach((fixed) => {
    const categoryName = getCategoryName(fixed.category);
    categoryTotals[categoryName] = (categoryTotals[categoryName] || 0) + fixed.calculatedAmount;
    if (!categoryDetails[categoryName]) categoryDetails[categoryName] = [];
    categoryDetails[categoryName].push({
      id: `fixed-${fixed.id}`,
      type: 'expense',
      category: fixed.category,
      subcategory: fixed.subcategory,
      amount: fixed.calculatedAmount,
      paymentMethod: fixed.paymentMethod,
      displayPaymentMethod: getPaymentMethodName(fixed.paymentMethod),
      memo: `[고정지출] ${fixed.name}${fixed.memo ? ` - ${fixed.memo}` : ''}`,
      date: formatDate(new Date(year, month, fixed.autoRegisterDate || 1)),
      userId: fixed.userId || adminUserId || currentUserId || 'unknown',
      isFixed: true
    });

    const paymentMethodName = getPaymentMethodName(fixed.paymentMethod);
    paymentMethodTotals[paymentMethodName] = (paymentMethodTotals[paymentMethodName] || 0) + fixed.calculatedAmount;

    const targetBucket = fixed.category === 'savings' ? savingsByUser : expensesByUser;
    const userId = fixed.userId || adminUserId || currentUserId || 'unknown';
    targetBucket[userId] = (targetBucket[userId] || 0) + fixed.calculatedAmount;
  });

  Object.keys(categoryDetails).forEach((categoryName) => {
    categoryDetails[categoryName] = sortByDateDesc(categoryDetails[categoryName]);
  });

  const totalPocketMoney = Object.values(pocketMoneyByUser).reduce((sum, item) => sum + item.total, 0);
  const fixedShareRate = expenseTotal > 0 ? (fixedExpenseTotal / expenseTotal) * 100 : 0;
  const savingRate = income > 0 ? (savings / income) * 100 : 0;

  return {
    income,
    expense: variableExpense,
    variableExpense,
    totalConsumption,
    savings,
    savingRate,
    expenseTotal,
    totalOutflow,
    transactionExpenseTotal,
    fixedExpenseTotal,
    fixedNonSavingsTotal,
    transactionSavings,
    fixedSavingsTotal,
    fixedShareRate,
    monthTransactions,
    monthFixedExpenses,
    categoryTotals,
    categoryDetails,
    paymentMethodTotals,
    expensesByUser,
    savingsByUser,
    pocketMoneyByUser,
    totalPocketMoney
  };
};

export const useStatistics = ({
  currentDate,
  transactions = [],
  fixedExpenses = [],
  familyInfo = null,
  currentUser = null
}) => {
  const getUserInfo = useMemo(() => {
    return (userId, options = {}) => resolveUserInfo(userId, familyInfo, currentUser, options);
  }, [familyInfo, currentUser]);

  const familyMembers = useMemo(() => {
    return getAvailableUsers(familyInfo, currentUser).map((user) =>
      getUserInfo(user.id, { shortName: true })
    );
  }, [familyInfo, currentUser, getUserInfo]);

  const adminUserId = useMemo(() => {
    if (!familyInfo) return currentUser?.id || 'user1';
    return Object.keys(familyInfo.members || {}).find((id) => familyInfo.members[id].role === 'admin')
      || Object.keys(familyInfo.members || {})[0]
      || currentUser?.id
      || 'user1';
  }, [familyInfo, currentUser]);

  const transactionsByMonth = useMemo(() => {
    return transactions.reduce((acc, transaction) => {
      const transactionDate = parseDateString(transaction.date);
      const key = getMonthKey(transactionDate);
      if (!acc[key]) acc[key] = [];
      acc[key].push(transaction);
      return acc;
    }, {});
  }, [transactions]);

  const monthSummaryMap = useMemo(() => {
    const summaries = {};

    for (let i = 5; i >= -1; i -= 1) {
      const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthKey = getMonthKey(targetDate);
      if (summaries[monthKey]) continue;

      const monthRange = getMonthRange(targetDate);
      const monthTransactions = transactionsByMonth[monthKey]
        ? transactionsByMonth[monthKey]
        : TransactionService.filterByDateRange(
            transactions,
            formatDate(monthRange.start),
            formatDate(monthRange.end)
          );

      summaries[monthKey] = createMonthSummary({
        monthDate: targetDate,
        monthTransactions,
        fixedExpenses,
        adminUserId,
        currentUserId: currentUser?.id
      });
    }

    return summaries;
  }, [adminUserId, currentDate, currentUser, fixedExpenses, transactions, transactionsByMonth]);

  const currentMonthKey = getMonthKey(currentDate);
  const previousMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
  const previousMonthKey = getMonthKey(previousMonthDate);
  const currentSummary = monthSummaryMap[currentMonthKey] || createMonthSummary({
    monthDate: currentDate,
    monthTransactions: [],
    fixedExpenses,
    adminUserId,
    currentUserId: currentUser?.id
  });
  const previousSummary = monthSummaryMap[previousMonthKey] || createMonthSummary({
    monthDate: previousMonthDate,
    monthTransactions: [],
    fixedExpenses,
    adminUserId,
    currentUserId: currentUser?.id
  });

  const incomeChange = previousSummary.income > 0
    ? ((currentSummary.income - previousSummary.income) / previousSummary.income) * 100
    : 0;
  const expenseChange = previousSummary.expense > 0
    ? ((currentSummary.expense - previousSummary.expense) / previousSummary.expense) * 100
    : 0;

  const last6Months = useMemo(() => {
    return Array.from({ length: 6 }, (_, index) => {
      const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - (5 - index), 1);
      const summary = monthSummaryMap[getMonthKey(targetDate)];
      return {
        month: `${targetDate.getMonth() + 1}월`,
        monthKey: getMonthKey(targetDate),
        income: summary?.income || 0,
        expense: summary?.expense || 0,
        saving: summary?.savings || 0,
        totalOutflow: summary?.totalOutflow || 0
      };
    });
  }, [currentDate, monthSummaryMap]);

  return {
    familyMembers,
    getUserInfo,
    currentSummary,
    previousSummary,
    incomeChange,
    expenseChange,
    last6Months
  };
};
