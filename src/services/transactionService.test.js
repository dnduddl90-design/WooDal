import { TransactionService } from './transactionService';

describe('TransactionService', () => {
  const transactions = [
    { id: 1, type: 'expense', category: 'food', amount: 10000, date: '2026-03-01', userId: 'u1' },
    { id: 2, type: 'income', category: 'salary', amount: 3000000, date: '2026-03-02', userId: 'u1' },
    { id: 3, type: 'expense', category: 'traffic', amount: 5000, date: '2026-03-05', userId: 'u2' }
  ];

  it('filters transactions by date range', () => {
    const result = TransactionService.filterByDateRange(transactions, '2026-03-02', '2026-03-05');
    expect(result).toHaveLength(2);
    expect(result.map((item) => item.id)).toEqual([2, 3]);
  });

  it('filters by category, user, and type', () => {
    expect(TransactionService.filterByCategory(transactions, 'food')).toHaveLength(1);
    expect(TransactionService.filterByUser(transactions, 'u1')).toHaveLength(2);
    expect(TransactionService.filterByType(transactions, 'expense')).toHaveLength(2);
  });

  it('calculates totals and category stats', () => {
    expect(TransactionService.calculateTotal(transactions)).toBe(3015000);
    expect(TransactionService.getStatsByCategory(transactions)).toEqual({
      food: { count: 1, total: 10000 },
      salary: { count: 1, total: 3000000 },
      traffic: { count: 1, total: 5000 }
    });
  });
});
