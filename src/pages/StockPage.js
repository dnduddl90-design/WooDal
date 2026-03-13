import React, { useEffect, useState } from 'react';
import { Plus, DollarSign, RefreshCw, FolderTree } from 'lucide-react';
import { Button, Modal } from '../components/common';
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
  onRefreshMarketPrices,
  currentUser,
  stockSymbols = [],
  stockCategories = [],
  symbolsLoading = false,
  isRefreshingPrices = false,
  lastPriceUpdatedAt = null,
  priceRefreshStatus = null
}) => {
  const [showForm, setShowForm] = useState(false);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [showUncategorizedModal, setShowUncategorizedModal] = useState(false);
  const [editingStock, setEditingStock] = useState(null);
  const [editingHoldingIndex, setEditingHoldingIndex] = useState(null); // 계좌별 수정 시 holding 인덱스
  const [selectedAccount, setSelectedAccount] = useState('ALL'); // 계좌 필터

  useEffect(() => {
    if (stocks.length === 0 || !onRefreshMarketPrices) {
      return;
    }

    onRefreshMarketPrices();
  }, [stocks.length, onRefreshMarketPrices]);

  // 관리자 권한 확인 (role이 'admin'인 경우)
  const isAdmin = currentUser?.role === 'admin';
  const uncategorizedStocks = stocks.filter(
    (stock) => stock.market !== 'CASH' && (!stock.categoryId || stock.categoryName === '미분류')
  );

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
          <h3 className="text-xl font-bold text-slate-800 mb-2">접근 권한이 없습니다</h3>
          <p className="text-slate-600">주식 포트폴리오는 관리자만 사용할 수 있습니다.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-4 sm:p-8 flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600">주식 데이터 로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-w-0 max-w-full overflow-x-hidden p-4 sm:p-8 space-y-6">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">주식 포트폴리오</h1>
          <p className="text-sm text-slate-600 mt-1">보유 주식을 관리하고 수익률을 확인하세요</p>
          {lastPriceUpdatedAt && (
            <p className="text-xs text-slate-500 mt-2">
              마지막 시세 갱신: {new Date(lastPriceUpdatedAt).toLocaleString('ko-KR')}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          {stocks.length > 0 && (
            <Button
              variant="secondary"
              icon={RefreshCw}
              onClick={() => onRefreshMarketPrices?.({ force: true })}
              disabled={isRefreshingPrices}
              className={isRefreshingPrices ? 'opacity-80' : ''}
            >
              {isRefreshingPrices ? '조회 중...' : '시세 새로고침'}
            </Button>
          )}
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

      {priceRefreshStatus && (
        <div
          className={`rounded-xl px-4 py-3 text-sm border ${
            priceRefreshStatus.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
              : priceRefreshStatus.type === 'partial'
                ? 'bg-amber-50 border-amber-200 text-amber-700'
                : priceRefreshStatus.type === 'cached'
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                  : priceRefreshStatus.type === 'error'
                    ? 'bg-rose-50 border-rose-200 text-rose-700'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
          }`}
        >
          {priceRefreshStatus.message}
        </div>
      )}

      {uncategorizedStocks.length > 0 && (
        <div className="rounded-xl px-4 py-4 border bg-amber-50 border-amber-200 text-amber-800">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <FolderTree size={20} className="mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold">미분류 종목이 {uncategorizedStocks.length}개 있습니다.</p>
                <p className="text-sm text-amber-800">
                  분류를 지정하면 상단 그래프와 요약이 더 깔끔하게 정리됩니다.
                </p>
              </div>
            </div>
            <Button
              variant="secondary"
              onClick={() => setShowUncategorizedModal(true)}
              className="text-sm"
            >
              미분류 정리
            </Button>
          </div>
        </div>
      )}

      {/* 계좌 필터 */}
      {stocks.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedAccount('ALL')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              selectedAccount === 'ALL'
                ? 'bg-indigo-500 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
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
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
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
          <h2 className="text-lg font-bold text-slate-800 mb-4">
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
          <h3 className="text-xl font-bold text-slate-800 mb-2">해당 계좌에 종목이 없습니다</h3>
          <p className="text-slate-600">다른 계좌를 선택하거나 종목을 추가해보세요</p>
        </div>
      ) : (
        <div className="glass-effect p-12 rounded-xl text-center">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">아직 보유 중인 주식이 없습니다</h3>
          <p className="text-slate-600 mb-6">주식 추가 버튼을 눌러 포트폴리오를 시작하세요</p>
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
          stockCategories={stockCategories}
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

      {showUncategorizedModal && (
        <Modal
          isOpen={showUncategorizedModal}
          onClose={() => setShowUncategorizedModal(false)}
          title="미분류 종목 정리"
          size="md"
        >
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              아래 종목에 분류를 지정하면 상단 요약이 분류 기준으로 더 정확하게 묶입니다.
            </p>
            <div className="space-y-2">
              {uncategorizedStocks.map((stock) => (
                <div
                  key={stock.id}
                  className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium text-slate-900">{stock.name}</p>
                    <p className="text-xs text-slate-500">
                      {stock.symbol} · {stock.quantity}주
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setShowUncategorizedModal(false);
                      handleEdit(stock, null);
                    }}
                  >
                    분류 지정
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
