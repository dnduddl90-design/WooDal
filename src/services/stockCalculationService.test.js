import {
  calculatePortfolioStats,
  calculateProfit,
  calculateProfitRate,
  calculateStockValue
} from './stockCalculationService';

describe('stockCalculationService', () => {
  const stock = {
    symbol: '005930',
    quantity: 10,
    buyPrice: 50000
  };

  it('calculates stock value from quantity and current price', () => {
    expect(calculateStockValue(stock, 55000)).toBe(550000);
  });

  it('calculates profit and profit rate', () => {
    expect(calculateProfit(stock, 55000)).toBe(50000);
    expect(calculateProfitRate(stock, 55000)).toBe(10);
  });

  it('calculates portfolio totals using current prices with buy price fallback', () => {
    const stats = calculatePortfolioStats(
      [
        stock,
        { symbol: '000660', quantity: 5, buyPrice: 100000 }
      ],
      {
        '005930': 55000
      }
    );

    expect(stats.totalBuyValue).toBe(1000000);
    expect(stats.totalCurrentValue).toBe(1050000);
    expect(stats.totalProfit).toBe(50000);
    expect(stats.totalProfitRate).toBe(5);
  });
});
