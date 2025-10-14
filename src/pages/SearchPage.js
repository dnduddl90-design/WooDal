import React from 'react';
import { Search, X, Edit2, Trash2 } from 'lucide-react';
import { CATEGORIES, USERS, PAYMENT_METHODS } from '../constants';
import { formatCurrency } from '../utils';
import { Button, Input } from '../components/common';

/**
 * 검색 페이지 컴포넌트
 * SRP: 검색 UI 렌더링만 담당
 * DIP: Props를 통해 데이터와 핸들러 주입받음
 */
export const SearchPage = ({
  searchQuery,
  searchFilters,
  searchResults = [],
  onSearchQueryChange,
  onSearchFiltersChange,
  onPerformSearch,
  onResetSearch,
  onEditTransaction,
  onDeleteTransaction
}) => {
  // 모든 카테고리 가져오기
  const getAllCategories = () => {
    return [
      ...CATEGORIES.income.map(c => ({ ...c, type: 'income' })),
      ...CATEGORIES.expense.map(c => ({ ...c, type: 'expense' }))
    ];
  };

  // Enter 키 핸들러
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onPerformSearch();
    }
  };

  // 검색 결과 통계
  const stats = {
    incomeCount: searchResults.filter(t => t.type === 'income').length,
    incomeTotal: searchResults.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
    expenseCount: searchResults.filter(t => t.type === 'expense').length,
    expenseTotal: searchResults.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
  };
  stats.totalCount = stats.incomeCount + stats.expenseCount;
  stats.netAmount = stats.incomeTotal - stats.expenseTotal;

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in pb-20 sm:pb-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center gap-2">
        <h2 className="text-lg sm:text-2xl font-bold gradient-text">내역 검색</h2>
        <Button
          variant="secondary"
          icon={X}
          onClick={onResetSearch}
          className="text-xs sm:text-sm"
        >
          <span className="hidden sm:inline">초기화</span>
          <span className="sm:hidden">초기화</span>
        </Button>
      </div>

      {/* 검색 패널 */}
      <div className="glass-effect rounded-xl p-4 sm:p-6 shadow-lg">
        <div className="space-y-3 sm:space-y-4">
          {/* 텍스트 검색 */}
          <div>
            <Input
              icon={Search}
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="메모나 카테고리로 검색하세요"
            />
          </div>

          {/* 필터 그리드 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
            {/* 타입 필터 */}
            <select
              value={searchFilters.type}
              onChange={(e) => onSearchFiltersChange({ ...searchFilters, type: e.target.value })}
              className="px-2 sm:px-4 py-2 text-xs sm:text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option value="all">전체</option>
              <option value="income">수입</option>
              <option value="expense">지출</option>
            </select>

            {/* 카테고리 필터 */}
            <select
              value={searchFilters.category}
              onChange={(e) => onSearchFiltersChange({ ...searchFilters, category: e.target.value })}
              className="px-2 sm:px-4 py-2 text-xs sm:text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option value="all">모든 카테고리</option>
              {getAllCategories().map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            {/* 사용자 필터 */}
            <select
              value={searchFilters.user}
              onChange={(e) => onSearchFiltersChange({ ...searchFilters, user: e.target.value })}
              className="px-2 sm:px-4 py-2 text-xs sm:text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option value="all">모든 사용자</option>
              {Object.values(USERS).map(user => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>

            {/* 검색 버튼 */}
            <Button
              variant="primary"
              icon={Search}
              onClick={onPerformSearch}
              className="text-xs sm:text-sm"
            >
              검색
            </Button>
          </div>

          {/* 날짜 범위 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <Input
              label="시작 날짜"
              type="date"
              value={searchFilters.dateFrom}
              onChange={(e) => onSearchFiltersChange({ ...searchFilters, dateFrom: e.target.value })}
            />
            <Input
              label="종료 날짜"
              type="date"
              value={searchFilters.dateTo}
              onChange={(e) => onSearchFiltersChange({ ...searchFilters, dateTo: e.target.value })}
            />
          </div>

          {/* 금액 범위 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <Input
              label="최소 금액"
              type="number"
              value={searchFilters.amountMin}
              onChange={(e) => onSearchFiltersChange({ ...searchFilters, amountMin: e.target.value })}
              placeholder="0"
            />
            <Input
              label="최대 금액"
              type="number"
              value={searchFilters.amountMax}
              onChange={(e) => onSearchFiltersChange({ ...searchFilters, amountMax: e.target.value })}
              placeholder="무제한"
            />
          </div>
        </div>
      </div>

      {/* 검색 결과 통계 */}
      {searchResults.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
          <div className="glass-effect rounded-xl p-3 sm:p-4 shadow-lg">
            <p className="text-xs sm:text-sm text-gray-600 mb-1">수입</p>
            <p className="text-sm sm:text-lg font-bold text-green-600 truncate">
              {stats.incomeCount}건 / {formatCurrency(stats.incomeTotal)}원
            </p>
          </div>
          <div className="glass-effect rounded-xl p-3 sm:p-4 shadow-lg">
            <p className="text-xs sm:text-sm text-gray-600 mb-1">지출</p>
            <p className="text-sm sm:text-lg font-bold text-red-600 truncate">
              {stats.expenseCount}건 / {formatCurrency(stats.expenseTotal)}원
            </p>
          </div>
          <div className="glass-effect rounded-xl p-3 sm:p-4 shadow-lg">
            <p className="text-xs sm:text-sm text-gray-600 mb-1">전체</p>
            <p className="text-sm sm:text-lg font-bold text-gray-800">
              {stats.totalCount}건
            </p>
          </div>
          <div className="glass-effect rounded-xl p-3 sm:p-4 shadow-lg">
            <p className="text-xs sm:text-sm text-gray-600 mb-1">차액</p>
            <p className={`text-sm sm:text-lg font-bold truncate ${
              stats.netAmount >= 0 ? 'text-blue-600' : 'text-red-600'
            }`}>
              {stats.netAmount >= 0 ? '+' : ''}{formatCurrency(stats.netAmount)}원
            </p>
          </div>
        </div>
      )}

      {/* 검색 결과 */}
      <div className="glass-effect rounded-xl p-4 sm:p-6 shadow-lg">
        <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4">
          검색 결과 {searchResults.length > 0 && `(${searchResults.length}건)`}
        </h3>

        {searchResults.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">
              {searchQuery || Object.values(searchFilters).some(v => v !== 'all' && v !== '') ? '🔍' : '🔎'}
            </div>
            <p className="text-sm sm:text-base text-gray-500">
              {searchQuery || Object.values(searchFilters).some(v => v !== 'all' && v !== '')
                ? '검색 결과가 없습니다'
                : '검색을 시작해보세요'}
            </p>
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {searchResults.map(transaction => {
              const category = CATEGORIES[transaction.type]?.find(c => c.id === transaction.category);
              const Icon = category?.icon;
              const user = USERS[transaction.userId];
              const paymentMethod = PAYMENT_METHODS.find(p => p.id === transaction.paymentMethod);

              return (
                <div
                  key={transaction.id}
                  className="p-3 sm:p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200 card-hover"
                >
                  <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                    {/* 왼쪽: 정보 */}
                    <div className="flex items-start space-x-2 sm:space-x-4 flex-1 min-w-0 w-full sm:w-auto">
                      {/* 아이콘 */}
                      <div className={`p-2 sm:p-3 rounded-lg flex-shrink-0 ${category?.color || 'bg-gray-100 text-gray-600'}`}>
                        {Icon && <Icon size={20} className="sm:w-6 sm:h-6" />}
                      </div>

                      {/* 상세 정보 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-1 sm:space-x-2 mb-1">
                          <h4 className="text-base sm:text-lg font-bold text-gray-800 truncate">
                            {category?.name || '기타'}
                          </h4>
                          {transaction.subcategory && (
                            <span className="text-xs sm:text-sm text-gray-500 truncate">
                              • {transaction.subcategory}
                            </span>
                          )}
                          <span className={`px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs font-medium flex-shrink-0 ${
                            transaction.type === 'income'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {transaction.type === 'income' ? '수입' : '지출'}
                          </span>
                        </div>

                        <p className={`text-lg sm:text-xl font-bold mb-1 sm:mb-2 truncate ${
                          transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}원
                        </p>

                        <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-600">
                          <span>📅 {transaction.date}</span>
                          <span>👤 {user?.name || '알 수 없음'}</span>
                          {paymentMethod && (
                            <span>💳 {paymentMethod.name}</span>
                          )}
                        </div>

                        {transaction.memo && (
                          <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2 line-clamp-2">
                            📝 {transaction.memo}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* 오른쪽: 액션 버튼들 */}
                    <div className="flex items-center space-x-1 sm:space-x-2 w-full sm:w-auto justify-end sm:justify-start">
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={Edit2}
                        onClick={() => onEditTransaction(transaction)}
                        title="수정"
                        className="flex-1 sm:flex-none"
                      />
                      <Button
                        variant="danger"
                        size="sm"
                        icon={Trash2}
                        onClick={() => {
                          if (window.confirm('이 거래를 삭제하시겠습니까?')) {
                            onDeleteTransaction(transaction.id);
                          }
                        }}
                        title="삭제"
                        className="flex-1 sm:flex-none"
                      />
                    </div>
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
