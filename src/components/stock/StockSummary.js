import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, PieChart } from 'lucide-react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { STOCK_MARKETS } from '../../constants/stocks';
import { calculatePortfolioStats, calculateStockValue, calculateProfit, calculateProfitRate } from '../../services/stockCalculationService';

// 종목별 색상 팔레트
const COLORS = [
  '#6366f1', '#ec4899', '#8b5cf6', '#f59e0b', '#10b981', '#3b82f6',
  '#f97316', '#06b6d4', '#84cc16', '#a855f7', '#14b8a6', '#ef4444'
];

export const StockSummary = ({ stocks, currentPrices }) => {
  if (!stocks || stocks.length === 0) {
    return (
      <div className="glass-effect p-6 rounded-xl text-center text-gray-500">
        <PieChart size={48} className="mx-auto mb-3 opacity-50" />
        <p>보유 중인 주식이 없습니다.</p>
        <p className="text-sm mt-1">주식 추가 버튼을 눌러 시작하세요.</p>
      </div>
    );
  }

  const stats = calculatePortfolioStats(stocks, currentPrices);
  const isProfit = stats.totalProfit >= 0;

  // 종목별 상세 정보 계산
  const stockDetails = stocks.map((stock, index) => {
    const price = currentPrices[stock.symbol] || stock.buyPrice;
    const currentValue = calculateStockValue(stock, price);
    const profit = calculateProfit(stock, price);
    const profitRate = calculateProfitRate(stock, price);
    const percentage = stats.totalCurrentValue > 0 ? (currentValue / stats.totalCurrentValue) * 100 : 0;

    return {
      ...stock,
      currentValue,
      profit,
      profitRate,
      percentage,
      color: COLORS[index % COLORS.length]
    };
  }).sort((a, b) => b.currentValue - a.currentValue);

  // 파이 차트 데이터
  const pieChartData = stockDetails.map(stock => ({
    name: stock.name,
    value: stock.currentValue,
    percentage: stock.percentage,
    color: stock.color
  }));

  // 커스텀 툴팁
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const market = STOCK_MARKETS[stocks.find(s => s.name === data.name)?.market || 'KR'];
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900">{data.name}</p>
          <p className="text-sm text-gray-600">
            {data.value.toLocaleString()}{market.currency}
          </p>
          <p className="text-sm font-medium text-indigo-600">
            {data.percentage.toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

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

      {/* 포트폴리오 구성 */}
      <div className="pt-3 border-t border-gray-200">
        <div className="flex items-center gap-2 text-gray-700 mb-4">
          <PieChart size={20} />
          <h3 className="text-base font-bold">포트폴리오 구성</h3>
        </div>

        {/* 파이 차트 */}
        <div className="bg-white rounded-lg p-4 mb-4">
          <ResponsiveContainer width="100%" height={350}>
            <RechartsPieChart>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ percentage }) => percentage > 5 ? `${percentage.toFixed(1)}%` : ''}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
                paddingAngle={2}
              >
                {pieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>

        {/* 보유 종목 목록 - 모든 화면에서 표시 */}
        <div className="space-y-2">
          {stockDetails.map((stock) => {
            const market = STOCK_MARKETS[stock.market];
            const isProfitable = stock.profit >= 0;

            return (
              <div
                key={stock.id}
                className="bg-white p-3 rounded-lg border-l-4 hover:shadow-md transition-shadow"
                style={{ borderColor: stock.color }}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stock.color }}></div>
                    <div>
                      <p className="font-medium text-gray-900">{stock.name}</p>
                      <p className="text-xs text-gray-600">{stock.quantity}주</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-sm ${isProfitable ? 'text-red-600' : 'text-blue-600'}`}>
                      {isProfitable ? '+' : ''}{stock.profit.toLocaleString()}{market.currency}
                    </p>
                    <p className={`text-xs ${isProfitable ? 'text-red-500' : 'text-blue-500'}`}>
                      ({isProfitable ? '+' : ''}{stock.profitRate.toFixed(2)}%)
                    </p>
                  </div>
                </div>

                {/* 포트폴리오 비중 */}
                <div className="mt-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-600">포트폴리오 비중</span>
                    <span className="text-xs font-semibold text-gray-900">{stock.percentage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${stock.percentage}%`,
                        backgroundColor: stock.color
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    평가: {stock.currentValue.toLocaleString()}{market.currency}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
