/**
 * 포맷 관련 유틸리티 함수
 * SRP: 데이터 포맷팅만 담당
 */

/**
 * 숫자를 한국 통화 형식으로 포맷
 */
export const formatCurrency = (amount) => {
  if (typeof amount !== 'number') {
    return '0';
  }
  return new Intl.NumberFormat('ko-KR').format(amount);
};

/**
 * 금액을 원 단위로 표시
 */
export const formatCurrencyWithUnit = (amount) => {
  return `${formatCurrency(amount)}원`;
};

/**
 * 백분율 포맷
 */
export const formatPercentage = (value, total) => {
  if (total === 0) return '0%';
  const percentage = (value / total) * 100;
  return `${percentage.toFixed(1)}%`;
};
