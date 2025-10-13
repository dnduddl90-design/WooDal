/**
 * 거래 내역 서비스
 * SRP: 거래 내역 비즈니스 로직만 담당
 * DIP: 상위 모듈이 하위 모듈에 의존하지 않도록 추상화
 */

export class TransactionService {
  /**
   * 새 거래 생성
   */
  static createTransaction(formData, userId) {
    return {
      id: Date.now(),
      ...formData,
      amount: parseInt(formData.amount) || 0,
      userId
    };
  }

  /**
   * 거래 업데이트
   */
  static updateTransaction(transaction, formData) {
    return {
      ...transaction,
      ...formData,
      amount: parseInt(formData.amount) || 0
    };
  }

  /**
   * 특정 날짜의 거래 필터링
   */
  static filterByDate(transactions, day, month, year) {
    return transactions.filter(t => {
      const tDate = new Date(t.date);
      return (
        tDate.getDate() === day &&
        tDate.getMonth() === month &&
        tDate.getFullYear() === year
      );
    });
  }

  /**
   * 특정 기간의 거래 필터링
   */
  static filterByDateRange(transactions, startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    return transactions.filter(t => {
      const tDate = new Date(t.date);
      return tDate >= start && tDate <= end;
    });
  }

  /**
   * 카테고리별 필터링
   */
  static filterByCategory(transactions, category) {
    if (!category) return transactions;
    return transactions.filter(t => t.category === category);
  }

  /**
   * 사용자별 필터링
   */
  static filterByUser(transactions, userId) {
    if (!userId) return transactions;
    return transactions.filter(t => t.userId === userId);
  }

  /**
   * 타입별 필터링 (수입/지출)
   */
  static filterByType(transactions, type) {
    if (!type) return transactions;
    return transactions.filter(t => t.type === type);
  }

  /**
   * 총 금액 계산
   */
  static calculateTotal(transactions) {
    return transactions.reduce((sum, t) => sum + t.amount, 0);
  }

  /**
   * 카테고리별 통계
   */
  static getStatsByCategory(transactions) {
    const stats = {};
    transactions.forEach(t => {
      if (!stats[t.category]) {
        stats[t.category] = {
          count: 0,
          total: 0
        };
      }
      stats[t.category].count++;
      stats[t.category].total += t.amount;
    });
    return stats;
  }
}
