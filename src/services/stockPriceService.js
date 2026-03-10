/**
 * 주식 시세 조회 서비스
 * SRP: 주식 가격 조회 기능만 담당
 *
 * CORS 문제 해결 방법:
 * 1. CORS Proxy 서버 사용 (allorigins.win - 무료, 가입 불필요)
 * 2. 네이버 금융 HTML 파싱
 */

const REQUEST_TIMEOUT_MS = 8000;

const PROXY_BUILDERS = [
  (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url) => `https://r.jina.ai/http://${url.replace(/^https?:\/\//, '')}`
];

const withTimeout = async (url, options = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal
    });
  } finally {
    clearTimeout(timeoutId);
  }
};

const extractNumber = (value) => {
  if (value === undefined || value === null) return null;

  const normalized = String(value).replace(/[^\d.-]/g, '');
  const parsed = Number(normalized);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

const fetchJsonThroughProxies = async (url) => {
  for (const buildProxyUrl of PROXY_BUILDERS) {
    try {
      const response = await withTimeout(buildProxyUrl(url), {
        method: 'GET',
        headers: {
          Accept: 'application/json, text/plain;q=0.9, */*;q=0.8'
        }
      });

      if (!response.ok) {
        continue;
      }

      const text = await response.text();
      const data = JSON.parse(text);
      return data;
    } catch (error) {
      continue;
    }
  }

  return null;
};

const fetchTextThroughProxies = async (url) => {
  for (const buildProxyUrl of PROXY_BUILDERS) {
    try {
      const response = await withTimeout(buildProxyUrl(url), {
        method: 'GET',
        headers: {
          Accept: 'text/html, text/plain;q=0.9, */*;q=0.8'
        }
      });

      if (!response.ok) {
        continue;
      }

      const text = await response.text();
      if (text) {
        return text;
      }
    } catch (error) {
      continue;
    }
  }

  return null;
};

const parseNaverJsonPrice = (data) => {
  const stockData = data?.result?.areas?.[0]?.datas?.[0];
  return (
    extractNumber(stockData?.nv) ||
    extractNumber(stockData?.closePrice) ||
    extractNumber(stockData?.cv) ||
    extractNumber(data?.closePrice) ||
    extractNumber(data?.compareToPreviousClosePrice) ||
    extractNumber(data?.stockItem?.closePrice)
  );
};

const parseNaverHtmlPrice = (html) => {
  if (!html) return null;

  const patterns = [
    /id=["']_nowVal["'][^>]*>\s*([^<\s]+)\s*</i,
    /class=["'][^"']*no_up[^"']*["'][^>]*>\s*([^<\s]+)\s*</i,
    /class=["'][^"']*no_down[^"']*["'][^>]*>\s*([^<\s]+)\s*</i,
    /현재가[^0-9]*([\d,]+)/i
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    const price = extractNumber(match?.[1]);
    if (price) {
      return price;
    }
  }

  return null;
};

/**
 * 한국 주식 (ETF) 현재가 조회
 * @param {string} symbol - 종목 코드 (예: '411060')
 * @returns {Promise<number|null>} - 현재가 또는 null (실패 시)
 */
export const fetchKoreanStockPrice = async (symbol) => {
  try {
    const jsonEndpoints = [
      `https://polling.finance.naver.com/api/realtime?query=SERVICE_ITEM:${symbol}`,
      `https://m.stock.naver.com/api/stock/${symbol}/basic`,
      `https://api.stock.naver.com/stock/${symbol}/basic`
    ];

    for (const endpoint of jsonEndpoints) {
      const jsonData = await fetchJsonThroughProxies(endpoint);
      const jsonPrice = parseNaverJsonPrice(jsonData);

      if (jsonPrice) {
        return jsonPrice;
      }
    }

    const naverPageUrl = `https://finance.naver.com/item/main.naver?code=${symbol}`;
    const html = await fetchTextThroughProxies(naverPageUrl);
    const htmlPrice = parseNaverHtmlPrice(html);

    if (htmlPrice) {
      return htmlPrice;
    }
  } catch (error) {
    console.error('❌ 주식 시세 조회 오류:', error);
  }

  return null;
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
