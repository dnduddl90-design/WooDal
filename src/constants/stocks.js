/**
 * 주식 관련 상수
 */

// 지원 시장
export const STOCK_MARKETS = {
  KR: { label: '한국', icon: '🇰🇷', currency: '원' },
  US: { label: '미국', icon: '🇺🇸', currency: '$' }
};

// 인기 종목 (빠른 선택용)
export const POPULAR_STOCKS = {
  KR: [
    { symbol: '005930', name: '삼성전자' },
    { symbol: '000660', name: 'SK하이닉스' },
    { symbol: '035420', name: 'NAVER' },
    { symbol: '005380', name: '현대차' },
    { symbol: '035720', name: '카카오' },
    { symbol: '051910', name: 'LG화학' },
    { symbol: '006400', name: '삼성SDI' },
    { symbol: '028260', name: '삼성물산' }
  ],
  US: [
    { symbol: 'AAPL', name: 'Apple' },
    { symbol: 'MSFT', name: 'Microsoft' },
    { symbol: 'GOOGL', name: 'Google' },
    { symbol: 'AMZN', name: 'Amazon' },
    { symbol: 'TSLA', name: 'Tesla' },
    { symbol: 'NVDA', name: 'NVIDIA' },
    { symbol: 'META', name: 'Meta (Facebook)' },
    { symbol: 'NFLX', name: 'Netflix' }
  ]
};

// 목업 데이터 (API 연동 전 테스트용)
export const MOCK_STOCK_PRICES = {
  // 한국 주식 (원)
  '005930': 71000,  // 삼성전자
  '000660': 119000, // SK하이닉스
  '035420': 185000, // NAVER
  '005380': 195000, // 현대차
  '035720': 48500,  // 카카오
  '051910': 420000, // LG화학
  '006400': 730000, // 삼성SDI
  '028260': 115000, // 삼성물산

  // 미국 주식 ($)
  'AAPL': 175.50,   // Apple
  'MSFT': 378.25,   // Microsoft
  'GOOGL': 140.75,  // Google
  'AMZN': 152.30,   // Amazon
  'TSLA': 242.80,   // Tesla
  'NVDA': 495.20,   // NVIDIA
  'META': 312.45,   // Meta
  'NFLX': 445.60    // Netflix
};
