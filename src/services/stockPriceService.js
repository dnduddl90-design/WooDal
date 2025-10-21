/**
 * 주식 시세 조회 서비스
 * SRP: 주식 가격 조회 기능만 담당
 *
 * CORS 문제 해결 방법:
 * 1. CORS Proxy 서버 사용 (allorigins.win - 무료, 가입 불필요)
 * 2. 네이버 금융 HTML 파싱
 */

/**
 * 한국 주식 (ETF) 현재가 조회
 * @param {string} symbol - 종목 코드 (예: '411060')
 * @returns {Promise<number|null>} - 현재가 또는 null (실패 시)
 */
export const fetchKoreanStockPrice = async (symbol) => {
  try {
    // 방법: CORS-anywhere 프록시 사용
    // 참고: 무료 서버는 요청 제한이 있을 수 있습니다
    const corsProxy = 'https://corsproxy.io/?';
    const naverApiUrl = `https://polling.finance.naver.com/api/realtime?query=SERVICE_ITEM:${symbol}`;
    const proxyUrl = corsProxy + encodeURIComponent(naverApiUrl);

    console.log('🔍 주식 시세 조회 시작:', symbol);
    const response = await fetch(proxyUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    console.log('📦 응답 데이터:', data);

    // 네이버 실시간 시세 API 응답 구조
    const stockData = data?.result?.areas?.[0]?.datas?.[0];
    const currentPrice = stockData?.nv || stockData?.closePrice;

    if (currentPrice) {
      const price = Number(currentPrice.replace(/,/g, ''));
      console.log('💰 현재가:', price);
      return price;
    }

    throw new Error('데이터 파싱 실패');

  } catch (error) {
    console.error('❌ 주식 시세 조회 오류:', error);

    // Fallback: 사용자에게 수동 입력 안내
    // 목업 데이터는 제거하고 null 반환
    console.log('ℹ️ 자동 조회 실패 - 수동 입력 필요');
    return null;
  }
};

/**
 * 주식 현재가 조회 (시장별 분기)
 * @param {string} market - 시장 구분 ('KR', 'CASH')
 * @param {string} symbol - 종목 코드
 * @returns {Promise<number|null>} - 현재가 또는 null
 */
export const fetchStockPrice = async (market, symbol) => {
  if (!symbol || market === 'CASH') {
    return null;
  }

  switch (market) {
    case 'KR':
      return await fetchKoreanStockPrice(symbol);
    default:
      return null;
  }
};

/**
 * 한국투자증권 API를 사용한 실시간 시세 조회 (준비)
 * 실제 사용 시 환경변수에 APP_KEY, APP_SECRET 필요
 */
export const fetchKISStockPrice = async (symbol) => {
  // TODO: 한국투자증권 API 인증 토큰 발급 및 시세 조회 구현
  // 참고: https://apiportal.koreainvestment.com/

  const APP_KEY = process.env.REACT_APP_KIS_APP_KEY;
  const APP_SECRET = process.env.REACT_APP_KIS_APP_SECRET;

  if (!APP_KEY || !APP_SECRET) {
    console.warn('한국투자증권 API 키가 설정되지 않았습니다.');
    return null;
  }

  try {
    // 1. 토큰 발급
    const tokenResponse = await fetch('https://openapi.koreainvestment.com:9443/oauth2/tokenP', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        grant_type: 'client_credentials',
        appkey: APP_KEY,
        appsecret: APP_SECRET
      })
    });

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // 2. 주식 현재가 조회
    const priceResponse = await fetch(
      `https://openapi.koreainvestment.com:9443/uapi/domestic-stock/v1/quotations/inquire-price?fid_cond_mrkt_div_code=J&fid_input_iscd=${symbol}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'authorization': `Bearer ${accessToken}`,
          'appkey': APP_KEY,
          'appsecret': APP_SECRET,
          'tr_id': 'FHKST01010100'
        }
      }
    );

    const priceData = await priceResponse.json();
    const currentPrice = priceData?.output?.stck_prpr; // 주식 현재가

    return currentPrice ? Number(currentPrice) : null;
  } catch (error) {
    console.error('한국투자증권 API 조회 오류:', error);
    return null;
  }
};
