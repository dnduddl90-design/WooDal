import React from 'react';
import { TrendingUp, TrendingDown, Trash2 } from 'lucide-react';
import { STOCK_MARKETS } from '../../constants/stocks';
import {
  calculateProfit,
  calculateProfitRate,
  calculateStockValue
} from '../../services/stockCalculationService';

/**
 * 개별 주식 카드 컴포넌트 (API 없이 MOCK 데이터 사용)
 * SRP: 주식 카드 UI만 담당
 * DIP: Props를 통해 데이터와 핸들러 주입받음
 */
export const StockCard = ({ stock, currentPrice, onDelete }) => {
  // 현재가가 없으면 매입가 사용
  const price = currentPrice || stock.buyPrice;

  // 계산
  const stockValue = calculateStockValue(stock, price);
  const profit = calculateProfit(stock, price);
  const profitRate = calculateProfitRate(stock, price);
  const isProfit = profit >= 0;

  // 시장 정보
  const market = STOCK_MARKETS[stock.market];

  return (
    <div className="glass-effect p-5 rounded-xl space-y-4 hover:shadow-lg transition-all duration-200">
      {/* 헤더: 종목명과 시장 */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-lg">{stock.name}</h3>
          <p className="text-sm text-gray-600">{stock.symbol}</p>
        </div>
        <span className="text-xs px-2 py-1 bg-gray-100 rounded-lg">
          {market.icon} {market.label}
        </span>
      </div>

      {/* 보유 수량 */}
      <div className="text-sm text-gray-600">
        보유: <span className="font-semibold text-gray-900">{stock.quantity.toLocaleString()}주</span>
      </div>

      {/* 가격 정보 */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-gray-600 mb-1">매입가</p>
          <p className="font-semibold text-gray-900">
            {stock.buyPrice.toLocaleString()}{market.currency}
          </p>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-gray-600 mb-1">현재가</p>
          <p className="font-semibold text-gray-900">
            {price.toLocaleString()}{market.currency}
          </p>
        </div>
      </div>

      {/* 평가금액 */}
      <div className="pt-3 border-t border-gray-200">
        <p className="text-sm text-gray-600 mb-1">평가금액</p>
        <p className="text-2xl font-bold text-gray-900">
          {stockValue.toLocaleString()}{market.currency}
        </p>
      </div>

      {/* 수익/손실 */}
      <div
        className={`flex items-center justify-between p-3 rounded-lg ${
          isProfit ? 'bg-red-50' : 'bg-blue-50'
        }`}
      >
        <div className={`flex items-center gap-2 ${isProfit ? 'text-red-600' : 'text-blue-600'}`}>
          {isProfit ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
          <span className="font-semibold">
            {isProfit ? '+' : ''}{profit.toLocaleString()}{market.currency}
          </span>
        </div>
        <span className={`font-bold ${isProfit ? 'text-red-600' : 'text-blue-600'}`}>
          {isProfit ? '+' : ''}{profitRate.toFixed(2)}%
        </span>
      </div>

      {/* 매입일 & 메모 */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>매입일: {stock.buyDate}</p>
        {stock.memo && <p className="italic">"{stock.memo}"</p>}
      </div>

      {/* 삭제 버튼 */}
      <button
        onClick={() => onDelete(stock.id)}
        className="w-full py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
      >
        <Trash2 size={16} />
        삭제
      </button>
    </div>
  );
};
