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
export const StockCard = ({ stock, currentPrice, onDelete, onUpdatePrice, onEdit, onDeleteHolding }) => {
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
      <div className="flex justify-between items-start gap-3">
        <div className="min-w-0">
          <h3 className="font-bold text-lg text-slate-900 truncate">{stock.name}</h3>
          <p className="text-sm text-slate-600 truncate">{stock.symbol}</p>
        </div>
        <span className="text-xs px-2 py-1 bg-slate-100 text-slate-700 rounded-lg">
          {market.icon} {market.label}
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">평가금액</p>
            <p className="text-2xl font-bold text-slate-900">
              {stockValue.toLocaleString()}{market.currency}
            </p>
          </div>
          <div className={`px-3 py-2 rounded-lg ${isProfit ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
            <div className="flex items-center gap-2">
              {isProfit ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
              <span className="font-semibold">
                {isProfit ? '+' : ''}{profitRate.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-slate-50 p-3 rounded-lg">
            <p className="text-slate-500 mb-1">보유 수량</p>
            <p className="font-semibold text-slate-900">
              {stock.quantity.toLocaleString()}주
              {hasMultipleAccounts && (
                <span className="ml-2 text-xs text-indigo-600">({holdings.length}개 계좌)</span>
              )}
            </p>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg">
            <p className="text-slate-500 mb-1">손익</p>
            <p className={`font-semibold ${isProfit ? 'text-emerald-600' : 'text-rose-600'}`}>
              {isProfit ? '+' : ''}{profit.toLocaleString()}{market.currency}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
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
        <div className="bg-slate-50 p-3 rounded-lg space-y-2">
          <p className="text-xs font-semibold text-slate-700 mb-2">계좌별 보유 내역</p>
          {holdings.map((holding, index) => {
            const accountType = ACCOUNT_TYPES[holding.account] || ACCOUNT_TYPES.GENERAL;
            return (
              <div
                key={index}
                className="flex flex-col gap-2 text-xs bg-white p-2 rounded group/holding hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex flex-wrap items-center gap-2 min-w-0">
                  <span className={`px-2 py-1 rounded ${accountType.color}`}>
                    {accountType.icon} {accountType.label}
                  </span>
                  <span className="text-slate-600">{holding.quantity}주</span>
                </div>
                <div className="flex items-start justify-between gap-2 sm:items-center sm:justify-end">
                  <div className="min-w-0">
                    <div className="text-slate-900 font-medium">
                      @{holding.buyPrice.toLocaleString()}{market.currency}
                    </div>
                    <div className="text-slate-500 text-xs">{holding.buyDate}</div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => onEdit(stock, index)}
                      className="stock-inline-action opacity-100 sm:opacity-0 sm:group-hover/holding:opacity-100 transition-opacity p-1 hover:bg-indigo-100 rounded"
                      title="이 계좌 수정"
                    >
                      <Edit2 size={14} className="text-indigo-600" />
                    </button>
                    <button
                      onClick={() => onDeleteHolding(stock, index)}
                      className="stock-inline-action opacity-100 sm:opacity-0 sm:group-hover/holding:opacity-100 transition-opacity p-1 hover:bg-red-100 rounded"
                      title="이 계좌 삭제"
                    >
                      <Trash2 size={14} className="text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="bg-slate-50 p-3 rounded-lg">
          <p className="text-slate-600 mb-1">매입가</p>
          <p className="font-semibold text-slate-900">
            {stock.buyPrice.toLocaleString()}{market.currency}
          </p>
        </div>
        <div className="bg-slate-50 p-3 rounded-lg relative">
          <p className="text-slate-600 mb-1">현재가</p>
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
                className="px-2 py-1 bg-slate-300 text-slate-700 text-xs rounded hover:bg-slate-400"
              >
                ✕
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <p className="font-semibold text-slate-900">
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

      {/* 매입일 & 메모 */}
      <div className="text-xs text-slate-500 space-y-1">
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
