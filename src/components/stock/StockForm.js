import React, { useState } from 'react';
import { STOCK_MARKETS, POPULAR_STOCKS } from '../../constants/stocks';
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
    symbol: '',
    name: '',
    quantity: '',
    buyPrice: '',
    buyDate: new Date().toISOString().split('T')[0],
    memo: ''
  });

  // 시장 변경 시 symbol, name 초기화
  const handleMarketChange = (market) => {
    setFormData({
      ...formData,
      market,
      symbol: '',
      name: ''
    });
  };

  // 인기 종목 선택
  const handlePopularStock = (stock) => {
    setFormData({
      ...formData,
      symbol: stock.symbol,
      name: stock.name
    });
  };

  // 폼 제출
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.symbol || !formData.name || !formData.quantity || !formData.buyPrice) {
      alert('모든 필수 항목을 입력해주세요.');
      return;
    }

    onSubmit({
      ...formData,
      quantity: Number(formData.quantity),
      buyPrice: Number(formData.buyPrice)
    });

    onClose();
  };

  const popularStocks = POPULAR_STOCKS[formData.market] || [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? '주식 수정' : '주식 추가'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 시장 선택 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            시장 <span className="text-red-500">*</span>
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

        {/* 인기 종목 빠른 선택 */}
        {popularStocks.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              인기 종목 (빠른 선택)
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
              {popularStocks.map((stock) => (
                <button
                  key={stock.symbol}
                  type="button"
                  onClick={() => handlePopularStock(stock)}
                  className={`px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                    formData.symbol === stock.symbol
                      ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-500'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {stock.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 종목 코드 */}
        <Input
          label="종목 코드"
          type="text"
          value={formData.symbol}
          onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
          placeholder={formData.market === 'KR' ? '예: 005930' : '예: AAPL'}
          required
        />

        {/* 종목명 */}
        <Input
          label="종목명"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder={formData.market === 'KR' ? '예: 삼성전자' : '예: Apple'}
          required
        />

        {/* 보유 수량 */}
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

        {/* 매입가 */}
        <Input
          label={`매입가 (${STOCK_MARKETS[formData.market].currency})`}
          type="number"
          value={formData.buyPrice}
          onChange={(e) => setFormData({ ...formData, buyPrice: e.target.value })}
          placeholder="0"
          min="0"
          step="0.01"
          required
        />

        {/* 매입일 */}
        <Input
          label="매입일"
          type="date"
          value={formData.buyDate}
          onChange={(e) => setFormData({ ...formData, buyDate: e.target.value })}
          required
        />

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
