import React, { useState } from 'react';
import { STOCK_MARKETS, ETF_STOCKS, ACCOUNT_TYPES } from '../../constants/stocks';
import { Button, Input, Modal } from '../common';

/**
 * 주식 추가/수정 폼 컴포넌트
 * SRP: 주식 폼 UI만 담당
 * DIP: Props를 통해 데이터와 핸들러 주입받음
 */
export const StockForm = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null
}) => {
  const [formData, setFormData] = useState(initialData || {
    market: 'KR',
    account: 'GENERAL', // 계좌 기본값: 일반
    symbol: '',
    name: '',
    quantity: '',
    buyPrice: '',
    currentPrice: '', // 현재가 추가
    buyDate: new Date().toISOString().split('T')[0],
    memo: ''
  });

  // 시장 변경 시 초기화
  const handleMarketChange = (market) => {
    setFormData({
      ...formData,
      market,
      symbol: '',
      name: ''
    });
  };

  // 종목 선택
  const handleStockSelect = (stock) => {
    setFormData({
      ...formData,
      symbol: stock.symbol,
      name: stock.name
    });
  };

  // 폼 제출
  const handleSubmit = (e) => {
    e.preventDefault();

    // 현금 항목은 종목 선택 없이 금액만 입력
    if (formData.market === 'CASH') {
      if (!formData.buyPrice) {
        alert('현금 금액을 입력해주세요.');
        return;
      }
      onSubmit({
        ...formData,
        symbol: 'CASH',
        name: '현금',
        quantity: 1, // 현금은 수량 1로 고정
        buyPrice: Number(formData.buyPrice),
        currentPrice: Number(formData.buyPrice) // 현금은 현재가 = 매입가
      });
    } else {
      // ETF 종목 선택
      if (!formData.symbol || !formData.name || !formData.quantity || !formData.buyPrice) {
        alert('모든 필수 항목을 입력해주세요.');
        return;
      }
      onSubmit({
        ...formData,
        quantity: Number(formData.quantity),
        buyPrice: Number(formData.buyPrice),
        currentPrice: formData.currentPrice ? Number(formData.currentPrice) : Number(formData.buyPrice) // 현재가 미입력 시 매입가 사용
      });
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? '주식 수정' : '주식 추가'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 구분 선택 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            구분 <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(STOCK_MARKETS).map(([key, market]) => (
              <button
                key={key}
                type="button"
                onClick={() => handleMarketChange(key)}
                className={`px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                  formData.market === key
                    ? 'bg-indigo-500 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {market.icon} {market.label}
              </button>
            ))}
          </div>
        </div>

        {/* 계좌 선택 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            계좌 <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(ACCOUNT_TYPES).map(([key, account]) => (
              <button
                key={key}
                type="button"
                onClick={() => setFormData({ ...formData, account: key })}
                className={`px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                  formData.account === key
                    ? 'bg-indigo-500 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {account.icon} {account.label}
              </button>
            ))}
          </div>
        </div>

        {/* ETF 종목 선택 (현금이 아닐 때만 표시) */}
        {formData.market === 'KR' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              종목 선택 <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto border border-gray-200 rounded-xl p-3">
              {ETF_STOCKS.map((stock) => (
                <button
                  key={stock.symbol}
                  type="button"
                  onClick={() => handleStockSelect(stock)}
                  className={`px-3 py-2 text-sm text-left rounded-lg transition-all duration-200 ${
                    formData.symbol === stock.symbol
                      ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-500 font-medium'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <div className="font-medium">{stock.name}</div>
                  <div className="text-xs text-gray-500">{stock.symbol}</div>
                </button>
              ))}
            </div>
            {formData.symbol && (
              <div className="mt-2 text-sm text-indigo-600">
                ✓ 선택: {formData.name} ({formData.symbol})
              </div>
            )}
          </div>
        )}

        {/* 현금이 아닐 때만 수량 표시 */}
        {formData.market !== 'CASH' && (
          <Input
            label="보유 수량"
            type="number"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            placeholder="0"
            min="0"
            step="1"
            required
          />
        )}

        {/* 금액 필드 (현금: 보유액 / ETF: 매입가) */}
        <Input
          label={formData.market === 'CASH' ? '보유 금액 (원)' : `매입가 (${STOCK_MARKETS[formData.market].currency})`}
          type="number"
          value={formData.buyPrice}
          onChange={(e) => setFormData({ ...formData, buyPrice: e.target.value })}
          placeholder="0"
          min="0"
          step={formData.market === 'CASH' ? '1' : '0.01'}
          required
        />

        {/* 현재가 (ETF만 입력) */}
        {formData.market !== 'CASH' && (
          <Input
            label={`현재가 (${STOCK_MARKETS[formData.market].currency})`}
            type="number"
            value={formData.currentPrice}
            onChange={(e) => setFormData({ ...formData, currentPrice: e.target.value })}
            placeholder="현재 시세 입력 (선택사항)"
            min="0"
            step="0.01"
          />
        )}

        {/* 현금이 아닐 때만 매입일 표시 */}
        {formData.market !== 'CASH' && (
          <Input
            label="매입일"
            type="date"
            value={formData.buyDate}
            onChange={(e) => setFormData({ ...formData, buyDate: e.target.value })}
            required
          />
        )}

        {/* 메모 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            메모
          </label>
          <textarea
            value={formData.memo}
            onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
            placeholder="메모를 입력하세요"
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 resize-none"
          />
        </div>

        {/* 액션 버튼 */}
        <div className="flex space-x-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="flex-1"
          >
            취소
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="flex-1"
          >
            {initialData ? '수정' : '추가'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
