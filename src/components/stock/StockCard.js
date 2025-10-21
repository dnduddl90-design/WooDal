import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Trash2, Edit2, ChevronDown, ChevronUp } from 'lucide-react';
import { STOCK_MARKETS, ACCOUNT_TYPES } from '../../constants/stocks';
import {
  calculateProfit,
  calculateProfitRate,
  calculateStockValue
} from '../../services/stockCalculationService';

/**
 * 개별 주식 카드 컴포넌트 (현재가 수동 입력 + 계좌별 내역)
 * SRP: 주식 카드 UI만 담당
 * DIP: Props를 통해 데이터와 핸들러 주입받음
 */
export const StockCard = ({ stock, currentPrice, onDelete, onUpdatePrice, onEdit }) => {
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [newPrice, setNewPrice] = useState('');
  const [showHoldings, setShowHoldings] = useState(false); // 계좌별 내역 표시

  // 현재가가 없으면 매입가 사용
  const price = currentPrice || stock.buyPrice;

  // 현재가 수정 핸들러
  const handleUpdatePrice = () => {
    if (!newPrice || Number(newPrice) <= 0) {
      alert('올바른 현재가를 입력해주세요.');
      return;
    }
    onUpdatePrice(stock.id, newPrice);
    setIsEditingPrice(false);
    setNewPrice('');
  };

  // 계산
  const stockValue = calculateStockValue(stock, price);
  const profit = calculateProfit(stock, price);
  const profitRate = calculateProfitRate(stock, price);
  const isProfit = profit >= 0;

  // 시장 정보
  const market = STOCK_MARKETS[stock.market];
  const holdings = stock.holdings || [];
  const hasMultipleAccounts = holdings.length > 1;

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

      {/* 보유 수량 + 계좌 내역 토글 */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          보유: <span className="font-semibold text-gray-900">{stock.quantity.toLocaleString()}주</span>
          {hasMultipleAccounts && (
            <span className="ml-2 text-xs text-indigo-600">({holdings.length}개 계좌)</span>
          )}
        </div>
        {holdings.length > 0 && (
          <button
            onClick={() => setShowHoldings(!showHoldings)}
            className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            {showHoldings ? (
              <>
                <ChevronUp size={14} />
                숨기기
              </>
            ) : (
              <>
                <ChevronDown size={14} />
                상세보기
              </>
            )}
          </button>
        )}
      </div>

      {/* 계좌별 내역 (확장 시) */}
      {showHoldings && holdings.length > 0 && (
        <div className="bg-gray-50 p-3 rounded-lg space-y-2">
          <p className="text-xs font-semibold text-gray-700 mb-2">계좌별 보유 내역</p>
          {holdings.map((holding, index) => {
            const accountType = ACCOUNT_TYPES[holding.account] || ACCOUNT_TYPES.GENERAL;
            return (
              <div key={index} className="flex justify-between items-center text-xs bg-white p-2 rounded group/holding hover:bg-gray-50">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded ${accountType.color}`}>
                    {accountType.icon} {accountType.label}
                  </span>
                  <span className="text-gray-600">{holding.quantity}주</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div className="text-gray-900 font-medium">
                      @{holding.buyPrice.toLocaleString()}{market.currency}
                    </div>
                    <div className="text-gray-500 text-xs">{holding.buyDate}</div>
                  </div>
                  <button
                    onClick={() => onEdit(stock, index)}
                    className="opacity-0 group-hover/holding:opacity-100 transition-opacity p-1 hover:bg-indigo-100 rounded"
                    title="이 계좌 수정"
                  >
                    <Edit2 size={14} className="text-indigo-600" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 가격 정보 */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-gray-600 mb-1">매입가</p>
          <p className="font-semibold text-gray-900">
            {stock.buyPrice.toLocaleString()}{market.currency}
          </p>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg relative">
          <p className="text-gray-600 mb-1">현재가</p>
          {isEditingPrice ? (
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                placeholder={price.toString()}
                className="w-full px-2 py-1 text-sm border border-indigo-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                autoFocus
              />
              <button
                onClick={handleUpdatePrice}
                className="px-2 py-1 bg-indigo-500 text-white text-xs rounded hover:bg-indigo-600"
              >
                ✓
              </button>
              <button
                onClick={() => {
                  setIsEditingPrice(false);
                  setNewPrice('');
                }}
                className="px-2 py-1 bg-gray-300 text-gray-700 text-xs rounded hover:bg-gray-400"
              >
                ✕
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <p className="font-semibold text-gray-900">
                {price.toLocaleString()}{market.currency}
              </p>
              <button
                onClick={() => setIsEditingPrice(true)}
                className="text-indigo-600 hover:text-indigo-700"
              >
                <Edit2 size={14} />
              </button>
            </div>
          )}
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

      {/* 수정/삭제 버튼 */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => onEdit(stock, null)}
          className="py-2 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
        >
          <Edit2 size={16} />
          {hasMultipleAccounts ? '전체 수정' : '수정'}
        </button>
        <button
          onClick={() => onDelete(stock.id)}
          className="py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
        >
          <Trash2 size={16} />
          삭제
        </button>
      </div>
    </div>
  );
};
