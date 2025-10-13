/**
 * 결제 수단 상수
 * SRP: 결제 수단 관련 데이터만 관리
 */
export const PAYMENT_METHODS = [
  { id: 'cash', name: '현금' },
  { id: 'credit', name: '신용카드' },
  { id: 'debit', name: '체크카드' },
  { id: 'transfer', name: '계좌이체' },
  { id: 'other', name: '기타' }
];

/**
 * ID로 결제 수단 찾기
 */
export const getPaymentMethodById = (id) => {
  return PAYMENT_METHODS.find(method => method.id === id);
};
