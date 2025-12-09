import React, { useState } from 'react';
import { Plus, DollarSign } from 'lucide-react';
import { Button } from '../components/common';
import { StockForm } from '../components/stock/StockForm';
import { StockCard } from '../components/stock/StockCard';
import { StockSummary } from '../components/stock/StockSummary';
import { PriceUpdateModal } from '../components/stock/PriceUpdateModal';
import { ACCOUNT_TYPES } from '../constants/stocks';

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
  onUpdateStock,
  onDeleteStock,
  onUpdateCurrentPrice,
  onUpdateMultiplePrices,
  currentUser,
  stockSymbols = [],
  symbolsLoading = false
}) => {
  const [showForm, setShowForm] = useState(false);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [editingStock, setEditingStock] = useState(null);
  const [editingHoldingIndex, setEditingHoldingIndex] = useState(null); // 계좌별 수정 시 holding 인덱스
  const [selectedAccount, setSelectedAccount] = useState('ALL'); // 계좌 필터

  // 관리자 권한 확인 (role이 'admin'인 경우)
  const isAdmin = currentUser?.role === 'admin';

  // 계좌별 필터링 (holdings 기반)
  const filteredStocks = selectedAccount === 'ALL'
    ? stocks
    : stocks
        .filter(stock => {
          // holdings 배열에서 해당 계좌가 있는지 확인
          const holdings = stock.holdings || [];
          return holdings.some(h => h.account === selectedAccount);
        })
        .map(stock => {
          // 선택된 계좌의 holdings만 필터링
          const filteredHoldings = stock.holdings.filter(h => h.account === selectedAccount);

          // 필터링된 holdings 기준으로 총 수량과 평균 매입가 재계산
          const totalQuantity = filteredHoldings.reduce((sum, h) => sum + h.quantity, 0);
          const totalBuyValue = filteredHoldings.reduce((sum, h) => sum + (h.quantity * h.buyPrice), 0);
          const avgBuyPrice = totalQuantity > 0 ? totalBuyValue / totalQuantity : 0;

          return {
            ...stock,
            holdings: filteredHoldings,
            quantity: totalQuantity,
            buyPrice: avgBuyPrice
          };
        });

  // 수정 모달 열기
  const handleEdit = (stock, holdingIndex = null) => {
    setEditingStock(stock);
    setEditingHoldingIndex(holdingIndex);
    setShowForm(true);
  };

  // 계좌별 삭제
  const handleDeleteHolding = (stock, holdingIndex) => {
    if (window.confirm('이 계좌의 보유 내역을 삭제하시겠습니까?')) {
      onDeleteStock(stock.id, holdingIndex);
    }
  };

  // 폼 닫기
  const handleCloseForm = () => {
    setShowForm(false);
    setEditingStock(null);
    setEditingHoldingIndex(null);
  };

  // 주식 추가/수정 제출
  const handleSubmit = (formData) => {
    if (editingStock) {
      // 계좌별 수정인 경우
      if (editingHoldingIndex !== null) {
        onUpdateStock(editingStock.id, formData, editingHoldingIndex);
      } else {
        // 전체 수정인 경우
        onUpdateStock(editingStock.id, formData);
      }
    } else {
      onAddStock(formData);
    }
    handleCloseForm();
  };

  // 권한이 없는 경우 접근 거부
  if (!isAdmin) {
    return (
      <div className="p-4 sm:p-8 flex items-center justify-center h-full">
        <div className="glass-effect p-12 rounded-xl text-center max-w-md">
          <div className="text-6xl mb-4">🔒</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">접근 권한이 없습니다</h3>
          <p className="text-gray-600">주식 포트폴리오는 관리자만 사용할 수 있습니다.</p>
        </div>
      </div>
    );
  }

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
              icon={DollarSign}
              onClick={() => setShowPriceModal(true)}
            >
              현재가 입력
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

      {/* 계좌 필터 */}
      {stocks.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedAccount('ALL')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              selectedAccount === 'ALL'
                ? 'bg-indigo-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            전체
          </button>
          {Object.entries(ACCOUNT_TYPES).map(([key, account]) => (
            <button
              key={key}
              onClick={() => setSelectedAccount(key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                selectedAccount === key
                  ? 'bg-indigo-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {account.icon} {account.label}
            </button>
          ))}
        </div>
      )}

      {/* 포트폴리오 요약 */}
      <StockSummary stocks={filteredStocks} currentPrices={currentPrices} />

      {/* 주식 목록 */}
      {filteredStocks.length > 0 ? (
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            보유 종목 ({filteredStocks.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStocks.map((stock) => (
              <StockCard
                key={stock.id}
                stock={stock}
                currentPrice={currentPrices[stock.symbol]}
                onDelete={onDeleteStock}
                onUpdatePrice={onUpdateCurrentPrice}
                onEdit={handleEdit}
                onDeleteHolding={handleDeleteHolding}
              />
            ))}
          </div>
        </div>
      ) : stocks.length > 0 ? (
        <div className="glass-effect p-12 rounded-xl text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">해당 계좌에 종목이 없습니다</h3>
          <p className="text-gray-600">다른 계좌를 선택하거나 종목을 추가해보세요</p>
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

      {/* 주식 추가/수정 폼 모달 */}
      {showForm && (
        <StockForm
          isOpen={showForm}
          onClose={handleCloseForm}
          onSubmit={handleSubmit}
          initialData={editingStock}
          holdingIndex={editingHoldingIndex}
          stockSymbols={stockSymbols}
          symbolsLoading={symbolsLoading}
        />
      )}

      {/* 현재가 일괄 입력 모달 */}
      {showPriceModal && (
        <PriceUpdateModal
          isOpen={showPriceModal}
          onClose={() => setShowPriceModal(false)}
          stocks={stocks}
          onUpdatePrices={onUpdateMultiplePrices}
        />
      )}
    </div>
  );
};
