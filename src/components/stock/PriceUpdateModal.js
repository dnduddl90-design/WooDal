import React, { useState } from 'react';
import { DollarSign, ExternalLink } from 'lucide-react';
import { Button, Modal } from '../common';
import { STOCK_MARKETS } from '../../constants/stocks';

/**
 * 현재가 일괄 입력 모달
 * SRP: 여러 종목의 현재가를 한 번에 입력하는 UI만 담당
 * DIP: Props를 통해 데이터와 핸들러 주입받음
 */
export const PriceUpdateModal = ({ isOpen, onClose, stocks, onUpdatePrices }) => {
  const [prices, setPrices] = useState(() => {
    // 초기값: 각 종목의 현재 currentPrice 사용
    const initialPrices = {};
    stocks.forEach(stock => {
      initialPrices[stock.id] = stock.currentPrice || stock.buyPrice || '';
    });
    return initialPrices;
  });

  const handlePriceChange = (stockId, value) => {
    setPrices({
      ...prices,
      [stockId]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // 변경된 가격만 업데이트
    const updates = {};
    Object.keys(prices).forEach(stockId => {
      const newPrice = Number(prices[stockId]);
      if (newPrice > 0) {
        updates[stockId] = newPrice;
      }
    });

    if (Object.keys(updates).length === 0) {
      alert('업데이트할 현재가를 입력해주세요.');
      return;
    }

    onUpdatePrices(updates);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="현재가 일괄 입력"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            보유 중인 {stocks.length}개 종목의 현재가를 입력하세요.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
            💡 <strong>시세 확인 방법:</strong> 각 종목 옆 🔗 버튼을 클릭하면 네이버 금융에서 실시간 시세를 확인할 수 있습니다.
          </div>
        </div>

        {/* 종목 리스트 */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {stocks.map(stock => {
            const market = STOCK_MARKETS[stock.market];
            return (
              <div key={stock.id} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium text-gray-900">{stock.name}</p>
                    <p className="text-xs text-gray-600">{stock.symbol}</p>
                  </div>
                  <div className="text-right text-xs text-gray-500">
                    <p>매입가: {stock.buyPrice.toLocaleString()}{market.currency}</p>
                    <p>{stock.quantity}주 보유</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <DollarSign size={16} className="text-gray-400" />
                  <input
                    type="number"
                    value={prices[stock.id]}
                    onChange={(e) => handlePriceChange(stock.id, e.target.value)}
                    placeholder="현재가 입력"
                    min="0"
                    step="0.01"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  />
                  <span className="text-sm text-gray-600 min-w-[30px]">{market.currency}</span>

                  {/* 네이버 금융 링크 (현금 제외) */}
                  {stock.market !== 'CASH' && (
                    <button
                      type="button"
                      onClick={() => window.open(`https://finance.naver.com/item/main.naver?code=${stock.symbol}`, '_blank')}
                      className="p-2 rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 active:scale-95 transition-all duration-200 flex items-center gap-1"
                      title="네이버 금융에서 시세 확인"
                    >
                      <ExternalLink size={16} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 액션 버튼 */}
        <div className="flex space-x-3 pt-4 border-t border-gray-200">
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
            일괄 업데이트
          </Button>
        </div>
      </form>
    </Modal>
  );
};
