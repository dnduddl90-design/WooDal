import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, PieChart } from 'lucide-react';
import { calculatePortfolioStats } from '../../services/stockCalculationService';

/**
 * 포트폴리오 요약 컴포넌트
 * SRP: 포트폴리오 통계 표시만 담당
 * DIP: Props를 통해 데이터 주입받음
 */
export const StockSummary = ({ stocks, currentPrices }) => {
  // 주식이 없으면 빈 상태 표시
  if (!stocks || stocks.length === 0) {
    return (
      <div className="glass-effect p-6 rounded-xl text-center text-gray-500">
        <PieChart size={48} className="mx-auto mb-3 opacity-50" />
        <p>보유 중인 주식이 없습니다.</p>
        <p className="text-sm mt-1">주식 추가 버튼을 눌러 시작하세요.</p>
      </div>
    );
  }

  // 포트폴리오 통계 계산
  const stats = calculatePortfolioStats(stocks, currentPrices);
  const isProfit = stats.totalProfit >= 0;

  return (
    <div className="glass-effect p-6 rounded-xl space-y-4">
      {/* 타이틀 */}
      <div className="flex items-center gap-2 text-gray-700 mb-2">
        <PieChart size={20} />
        <h2 className="text-lg font-bold">포트폴리오 요약</h2>
      </div>

      {/* 통계 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 총 매입금액 */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <DollarSign size={16} />
            <p className="text-sm">총 매입금액</p>
          </div>
          <p className="text-xl font-bold text-gray-900">
            {stats.totalBuyValue.toLocaleString()}원
          </p>
        </div>

        {/* 총 평가금액 */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <DollarSign size={16} />
            <p className="text-sm">총 평가금액</p>
          </div>
          <p className="text-xl font-bold text-gray-900">
            {stats.totalCurrentValue.toLocaleString()}원
          </p>
        </div>

        {/* 총 손익 */}
        <div className={`p-4 rounded-lg ${isProfit ? 'bg-red-50' : 'bg-blue-50'}`}>
          <div className={`flex items-center gap-2 mb-2 ${isProfit ? 'text-red-600' : 'text-blue-600'}`}>
            {isProfit ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            <p className="text-sm font-medium">총 손익</p>
          </div>
          <p className={`text-xl font-bold ${isProfit ? 'text-red-600' : 'text-blue-600'}`}>
            {isProfit ? '+' : ''}{stats.totalProfit.toLocaleString()}원
          </p>
          <p className={`text-sm font-semibold mt-1 ${isProfit ? 'text-red-600' : 'text-blue-600'}`}>
            {isProfit ? '+' : ''}{stats.totalProfitRate.toFixed(2)}%
          </p>
        </div>
      </div>

      {/* 보유 종목 수 */}
      <div className="pt-3 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          총 <span className="font-semibold text-gray-900">{stocks.length}</span>개 종목 보유 중
        </p>
      </div>
    </div>
  );
};
