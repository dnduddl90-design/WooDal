import { createMonthSummary } from './useStatistics';

describe('createMonthSummary', () => {
  it('splits variable expense, fixed expense, savings, and total outflow correctly', () => {
    const summary = createMonthSummary({
      monthDate: new Date(2026, 2, 1),
      monthTransactions: [
        {
          id: 1,
          type: 'income',
          category: 'salary',
          amount: 3000000,
          date: '2026-03-01',
          userId: 'user-1'
        },
        {
          id: 2,
          type: 'expense',
          category: 'food',
          amount: 100000,
          date: '2026-03-03',
          userId: 'user-1'
        },
        {
          id: 3,
          type: 'expense',
          category: 'savings',
          amount: 200000,
          date: '2026-03-05',
          userId: 'user-1'
        }
      ],
      fixedExpenses: [
        {
          id: 11,
          name: '월세',
          category: 'housing',
          amount: 500000,
          autoRegisterDate: 5,
          isActive: true,
          isUnlimited: true
        },
        {
          id: 12,
          name: '적금',
          category: 'savings',
          amount: 300000,
          autoRegisterDate: 10,
          isActive: true,
          isUnlimited: true
        }
      ],
      adminUserId: 'user-1',
      currentUserId: 'user-1'
    });

    expect(summary.income).toBe(3000000);
    expect(summary.variableExpense).toBe(100000);
    expect(summary.fixedNonSavingsTotal).toBe(500000);
    expect(summary.fixedExpenseTotal).toBe(800000);
    expect(summary.savings).toBe(500000);
    expect(summary.totalConsumption).toBe(600000);
    expect(summary.totalOutflow).toBe(1100000);
  });
});
