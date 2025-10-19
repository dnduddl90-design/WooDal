import React, { useState } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { Button } from '../components/common';
import { StockForm } from '../components/stock/StockForm';
import { StockCard } from '../components/stock/StockCard';
import { StockSummary } from '../components/stock/StockSummary';

/**
 * 주식 포트폴리오 페이지
 * SRP: 주식 페이지 레이아웃 및 상태 관리만 담당
 * DIP: Props를 통해 데이터와 핸들러 주입받음
 */
export const StockPage = ({
  stocks,
  currentPrices,
  loading,
  onAddStock,
  onDeleteStock,
  onRefreshPrices
}) => {
  const [showForm, setShowForm] = useState(false);

  if (loading) {
    return (
      <div className="p-4 sm:p-8 flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">주식 데이터 로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 space-y-6">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">주식 포트폴리오</h1>
          <p className="text-sm text-gray-600 mt-1">보유 주식을 관리하고 수익률을 확인하세요</p>
        </div>
        <div className="flex gap-2">
          {stocks.length > 0 && (
            <Button
              variant="secondary"
              icon={RefreshCw}
              onClick={onRefreshPrices}
            >
              가격 새로고침
            </Button>
          )}
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setShowForm(true)}
          >
            주식 추가
          </Button>
        </div>
      </div>

      {/* 포트폴리오 요약 */}
      <StockSummary stocks={stocks} currentPrices={currentPrices} />

      {/* 주식 목록 */}
      {stocks.length > 0 ? (
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-4">보유 종목</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stocks.map((stock) => (
              <StockCard
                key={stock.id}
                stock={stock}
                currentPrice={currentPrices[stock.symbol]}
                onDelete={onDeleteStock}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="glass-effect p-12 rounded-xl text-center">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">아직 보유 중인 주식이 없습니다</h3>
          <p className="text-gray-600 mb-6">주식 추가 버튼을 눌러 포트폴리오를 시작하세요</p>
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setShowForm(true)}
          >
            첫 주식 추가하기
          </Button>
        </div>
      )}

      {/* 주식 추가 폼 모달 */}
      {showForm && (
        <StockForm
          isOpen={showForm}
          onClose={() => setShowForm(false)}
          onSubmit={onAddStock}
        />
      )}
    </div>
  );
};
