import React, { useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, PieChart, ChevronDown, ChevronUp } from 'lucide-react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { calculatePortfolioStats, calculateStockValue, calculateProfit } from '../../services/stockCalculationService';

// 종목별 색상 팔레트
const COLORS = [
  '#6366f1', '#ec4899', '#8b5cf6', '#f59e0b', '#10b981', '#3b82f6',
  '#f97316', '#06b6d4', '#84cc16', '#a855f7', '#14b8a6', '#ef4444'
];

export const StockSummary = ({ stocks, currentPrices }) => {
  const [sortBy, setSortBy] = useState('value');
  const [isListCollapsed, setIsListCollapsed] = useState(false);

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

  const stockDetails = stocks.map((stock) => {
    const price = currentPrices[stock.symbol] || stock.buyPrice;
    const currentValue = calculateStockValue(stock, price);
    const profit = calculateProfit(stock, price);

    return {
      ...stock,
      currentValue,
      profit
    };
  });

  const groupedSummaries = Object.values(
    stockDetails.reduce((acc, stock) => {
      const groupId = stock.categoryId || `uncategorized-${stock.categoryName || '미분류'}`;
      const groupName = stock.categoryName || '미분류';

      if (!acc[groupId]) {
        acc[groupId] = {
          id: groupId,
          name: groupName,
          currentValue: 0,
          buyValue: 0,
          profit: 0,
          stockCount: 0,
          stockNames: []
        };
      }

      acc[groupId].currentValue += stock.currentValue;
      acc[groupId].buyValue += stock.quantity * stock.buyPrice;
      acc[groupId].profit += stock.profit;
      acc[groupId].stockCount += 1;
      acc[groupId].stockNames.push(stock.name);

      return acc;
    }, {})
  )
    .map((group, index) => ({
      ...group,
      profitRate: group.buyValue > 0 ? (group.profit / group.buyValue) * 100 : 0,
      percentage: stats.totalCurrentValue > 0 ? (group.currentValue / stats.totalCurrentValue) * 100 : 0,
      color: COLORS[index % COLORS.length]
    }))
    .sort((a, b) => {
      if (sortBy === 'profit') {
        return b.profit - a.profit;
      }

      if (sortBy === 'name') {
        return a.name.localeCompare(b.name, 'ko');
      }

      return b.currentValue - a.currentValue;
    });

  const pieChartData = groupedSummaries.map((group) => ({
    name: group.name,
    value: group.currentValue,
    percentage: group.percentage,
    color: group.color
  }));

  // 커스텀 툴팁
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900">{data.name}</p>
          <p className="text-sm text-gray-600">
            {data.value.toLocaleString()}원
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
          <h3 className="text-base font-bold">분류별 포트폴리오 구성</h3>
        </div>

        <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSortBy('value')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                sortBy === 'value'
                  ? 'bg-indigo-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              평가금액순
            </button>
            <button
              type="button"
              onClick={() => setSortBy('profit')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                sortBy === 'profit'
                  ? 'bg-indigo-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              손익순
            </button>
            <button
              type="button"
              onClick={() => setSortBy('name')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                sortBy === 'name'
                  ? 'bg-indigo-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              이름순
            </button>
          </div>
          <button
            type="button"
            onClick={() => setIsListCollapsed((prev) => !prev)}
            className="inline-flex items-center gap-2 self-start rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-200"
          >
            {isListCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
            {isListCollapsed ? '요약 펼치기' : '요약 접기'}
          </button>
        </div>

        {/* 파이 차트 */}
        <div className="bg-white rounded-lg p-3 sm:p-4 mb-4 min-w-0">
          <div className="w-full min-w-0 h-[240px] sm:h-[300px] lg:h-[350px]">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <RechartsPieChart>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ percentage }) => percentage > 5 ? `${percentage.toFixed(1)}%` : ''}
                outerRadius="70%"
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
        </div>

        {/* 분류 요약 목록 */}
        {!isListCollapsed && (
        <div className="space-y-2">
          {groupedSummaries.map((group) => {
            const isProfitable = group.profit >= 0;

            return (
              <div
                key={group.id}
                className="bg-white p-3 rounded-lg border-l-4 hover:shadow-md transition-shadow"
                style={{ borderColor: group.color }}
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-start mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: group.color }}></div>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 break-words">{group.name}</p>
                      <p className="text-xs text-gray-600">{group.stockCount}개 종목</p>
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className={`font-bold text-sm ${isProfitable ? 'text-red-600' : 'text-blue-600'}`}>
                      {isProfitable ? '+' : ''}{group.profit.toLocaleString()}원
                    </p>
                    <p className={`text-xs ${isProfitable ? 'text-red-500' : 'text-blue-500'}`}>
                      ({isProfitable ? '+' : ''}{group.profitRate.toFixed(2)}%)
                    </p>
                  </div>
                </div>

                {/* 포트폴리오 비중 */}
                <div className="mt-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-600">포트폴리오 비중</span>
                    <span className="text-xs font-semibold text-gray-900">{group.percentage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${group.percentage}%`,
                        backgroundColor: group.color
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    평가: {group.currentValue.toLocaleString()}원
                  </p>
                  <p className="text-xs text-gray-400 mt-1 break-words">
                    {group.stockNames.join(', ')}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        )}
      </div>

    </div>
  );
};
