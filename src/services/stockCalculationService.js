/**
 * 주식 계산 서비스
 *
 * 주식 관련 계산 로직을 담당합니다.
 * - 평가금액 계산
 * - 수익/손실 계산
 * - 수익률 계산
 * - 포트폴리오 전체 통계
 */

/**
 * 평가금액 계산
 * @param {Object} stock - 주식 객체
 * @param {number} currentPrice - 현재가
 * @returns {number} 평가금액
 */
export const calculateStockValue = (stock, currentPrice) => {
  return stock.quantity * currentPrice;
};

/**
 * 수익/손실 계산
 * @param {Object} stock - 주식 객체
 * @param {number} currentPrice - 현재가
 * @returns {number} 수익/손실 금액
 */
export const calculateProfit = (stock, currentPrice) => {
  const buyValue = stock.quantity * stock.buyPrice;
  const currentValue = stock.quantity * currentPrice;
  return currentValue - buyValue;
};

/**
 * 수익률 계산
 * @param {Object} stock - 주식 객체
 * @param {number} currentPrice - 현재가
 * @returns {number} 수익률 (%)
 */
export const calculateProfitRate = (stock, currentPrice) => {
  const profit = calculateProfit(stock, currentPrice);
  const buyValue = stock.quantity * stock.buyPrice;
  return (profit / buyValue) * 100;
};

/**
 * 포트폴리오 전체 통계 계산
 * @param {Array} stocks - 주식 배열
 * @param {Object} currentPrices - 현재가 객체 { symbol: price }
 * @returns {Object} 포트폴리오 통계
 */
export const calculatePortfolioStats = (stocks, currentPrices) => {
  let totalBuyValue = 0;
  let totalCurrentValue = 0;

  stocks.forEach(stock => {
    const currentPrice = currentPrices[stock.symbol] || stock.buyPrice;
    totalBuyValue += stock.quantity * stock.buyPrice;
    totalCurrentValue += stock.quantity * currentPrice;
  });

  const totalProfit = totalCurrentValue - totalBuyValue;
  const totalProfitRate = totalBuyValue > 0 ? (totalProfit / totalBuyValue) * 100 : 0;

  return {
    totalBuyValue,      // 총 매입금액
    totalCurrentValue,  // 총 평가금액
    totalProfit,        // 총 손익
    totalProfitRate     // 총 수익률
  };
};
