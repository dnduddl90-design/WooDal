/**
 * 주식 관련 상수
 */

// 지원 시장
export const STOCK_MARKETS = {
  KR: { label: '한국', icon: '🇰🇷', currency: '원' },
  CASH: { label: '현금', icon: '💵', currency: '원' }
};

// 계좌 구분
export const ACCOUNT_TYPES = {
  ISA: { label: 'ISA', icon: '🏦', color: 'bg-blue-100 text-blue-700' },
  PENSION: { label: '연금저축', icon: '👴', color: 'bg-green-100 text-green-700' },
  GENERAL: { label: '일반', icon: '💼', color: 'bg-gray-100 text-gray-700' },
  IRP: { label: 'IRP', icon: '🏢', color: 'bg-purple-100 text-purple-700' },
  DC: { label: 'DC', icon: '💰', color: 'bg-yellow-100 text-yellow-700' }
};

// ETF 종목 리스트
export const ETF_STOCKS = [
  { symbol: '411060', name: 'ACE KRX금현물' },
  { symbol: '458730', name: 'TIGER 미국배당다우존스' },
  { symbol: '475380', name: 'RISE 글로벌리얼티인컴' },
  { symbol: '453850', name: 'ACE 미국30년국채액티브(H)' },
  { symbol: '379800', name: 'KODEX 미국S&P500' },
  { symbol: '379810', name: 'KODEX 미국나스닥100' },
  { symbol: '455890', name: 'RISE 머니마켓액티브' },
  { symbol: '489250', name: 'KODEX 미국배당다우존스' }
];

// 목업 데이터 (API 연동 전 테스트용)
export const MOCK_STOCK_PRICES = {
  // ETF (원)
  '411060': 0,  // ACE KRX금현물
  '458730': 0,  // TIGER 미국배당다우존스
  '475380': 0,  // RISE 글로벌리얼티인컴
  '453850': 0,  // ACE 미국30년국채액티브(H)
  '379800': 0,  // KODEX 미국S&P500
  '379810': 0,  // KODEX 미국나스닥100
  '455890': 0,  // RISE 머니마켓액티브
  '489250': 0,  // KODEX 미국배당다우존스
  'CASH': 1     // 현금 (1:1 비율)
};
