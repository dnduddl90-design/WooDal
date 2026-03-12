import React, { useState } from 'react';
import { Search, X, Edit2, Trash2, SlidersHorizontal, Bookmark, BookmarkPlus } from 'lucide-react';
import { CATEGORIES, PAYMENT_METHODS } from '../constants';
import { formatCurrency, getAvailableUsers, resolveUserInfo } from '../utils';
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
  searchPresets = [],
  familyInfo,
  currentUser,
  onSearchQueryChange,
  onSearchFiltersChange,
  onPerformSearch,
  onResetSearch,
  onApplyPreset,
  onSavePreset,
  onDeletePreset,
  onEditTransaction,
  onDeleteTransaction
}) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [presetName, setPresetName] = useState('');
  const availableUsers = getAvailableUsers(familyInfo, currentUser);
  const hasActiveFilters = Object.entries(searchFilters).some(([key, value]) => {
    if (key === 'type' || key === 'category' || key === 'user') {
      return value !== 'all';
    }

    return value !== '';
  });

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
          {searchPresets.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <Bookmark size={16} />
                <span className="font-medium">빠른 필터</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {searchPresets.map((preset) => (
                  <div key={preset.id} className="flex items-center rounded-full bg-white/80 border border-slate-200">
                    <button
                      type="button"
                      onClick={() => onApplyPreset(preset)}
                      className="px-3 py-1.5 text-xs sm:text-sm text-slate-700 hover:text-indigo-700"
                    >
                      {preset.name}
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeletePreset(preset.id)}
                      className="px-2 py-1.5 text-slate-400 hover:text-rose-600"
                      title="저장 검색 삭제"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

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
          <div className="grid grid-cols-2 md:grid-cols-[1fr_1fr_auto_auto] gap-2 sm:gap-4">
            {/* 타입 필터 */}
            <select
              value={searchFilters.type}
              onChange={(e) => onSearchFiltersChange({ ...searchFilters, type: e.target.value })}
              className="px-2 sm:px-4 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-slate-700"
            >
              <option value="all">전체</option>
              <option value="income">수입</option>
              <option value="expense">지출</option>
            </select>

            {/* 카테고리 필터 */}
            <select
              value={searchFilters.category}
              onChange={(e) => onSearchFiltersChange({ ...searchFilters, category: e.target.value })}
              className="px-2 sm:px-4 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-slate-700"
            >
              <option value="all">모든 카테고리</option>
              {getAllCategories().map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
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

            <Button
              variant="outline"
              icon={SlidersHorizontal}
              onClick={() => setShowAdvancedFilters((prev) => !prev)}
              className="text-xs sm:text-sm"
            >
              {showAdvancedFilters ? '고급 필터 닫기' : '고급 필터'}
            </Button>
          </div>

          {showAdvancedFilters && (
            <div className="ui-surface-soft rounded-xl p-4 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-800">고급 필터</p>
                  <p className="text-xs text-slate-500">사용자, 날짜, 금액 범위를 더 좁혀서 찾습니다.</p>
                </div>
                <span className="px-2 py-1 rounded-full bg-white text-xs font-medium text-slate-600">
                  선택 사항
                </span>
              </div>

              <select
                value={searchFilters.user}
                onChange={(e) => onSearchFiltersChange({ ...searchFilters, user: e.target.value })}
                className="w-full px-3 sm:px-4 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-slate-700"
              >
                <option value="all">모든 사용자</option>
                {availableUsers.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>

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
          )}

          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 text-xs sm:text-sm">
              {searchFilters.type !== 'all' && (
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-indigo-700">
                  유형: {searchFilters.type === 'income' ? '수입' : '지출'}
                </span>
              )}
              {searchFilters.category !== 'all' && (
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-indigo-700">
                  카테고리: {getAllCategories().find((cat) => cat.id === searchFilters.category)?.name || searchFilters.category}
                </span>
              )}
              {searchFilters.user !== 'all' && (
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-indigo-700">
                  사용자: {availableUsers.find((user) => user.id === searchFilters.user)?.name || searchFilters.user}
                </span>
              )}
              {searchFilters.dateFrom && (
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-indigo-700">
                  시작: {searchFilters.dateFrom}
                </span>
              )}
              {searchFilters.dateTo && (
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-indigo-700">
                  종료: {searchFilters.dateTo}
                </span>
              )}
              {searchFilters.amountMin && (
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-indigo-700">
                  최소: {formatCurrency(Number(searchFilters.amountMin))}원
                </span>
              )}
              {searchFilters.amountMax && (
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-indigo-700">
                  최대: {formatCurrency(Number(searchFilters.amountMax))}원
                </span>
              )}
            </div>
          )}

          <div className="ui-surface-soft rounded-xl p-3 sm:p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-800">현재 검색 저장</p>
                <p className="text-xs text-slate-500 mt-1">자주 쓰는 조건을 이름으로 저장해 다음에 바로 불러옵니다.</p>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                  placeholder="예: 이번 달 식비"
                  className="flex-1 sm:w-52 px-3 py-2 border border-slate-300 rounded-xl text-sm text-slate-700"
                />
                <Button
                  variant="secondary"
                  icon={BookmarkPlus}
                  onClick={() => {
                    onSavePreset(presetName);
                    setPresetName('');
                  }}
                  className="text-xs sm:text-sm"
                >
                  저장
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 검색 결과 통계 */}
      {searchResults.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
          <div className="glass-effect rounded-xl p-3 sm:p-4 shadow-lg">
            <p className="text-xs sm:text-sm text-slate-600 mb-1">수입</p>
            <p className="text-sm sm:text-lg font-bold text-green-600 truncate">
              {stats.incomeCount}건 / {formatCurrency(stats.incomeTotal)}원
            </p>
          </div>
          <div className="glass-effect rounded-xl p-3 sm:p-4 shadow-lg">
            <p className="text-xs sm:text-sm text-slate-600 mb-1">지출</p>
            <p className="text-sm sm:text-lg font-bold text-red-600 truncate">
              {stats.expenseCount}건 / {formatCurrency(stats.expenseTotal)}원
            </p>
          </div>
          <div className="glass-effect rounded-xl p-3 sm:p-4 shadow-lg">
            <p className="text-xs sm:text-sm text-slate-600 mb-1">전체</p>
            <p className="text-sm sm:text-lg font-bold text-slate-800">
              {stats.totalCount}건
            </p>
          </div>
          <div className="glass-effect rounded-xl p-3 sm:p-4 shadow-lg">
            <p className="text-xs sm:text-sm text-slate-600 mb-1">차액</p>
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
        <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-3 sm:mb-4">
          검색 결과 {searchResults.length > 0 && `(${searchResults.length}건)`}
        </h3>

        {searchResults.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">
              {searchQuery || Object.values(searchFilters).some(v => v !== 'all' && v !== '') ? '🔍' : '🔎'}
            </div>
            <p className="text-sm sm:text-base text-slate-500">
              {searchQuery || Object.values(searchFilters).some(v => v !== 'all' && v !== '')
                ? '검색 결과가 없습니다'
                : '검색을 시작해보세요'}
            </p>
            {(searchQuery || hasActiveFilters) && (
              <p className="mt-2 text-xs sm:text-sm text-slate-400">
                검색어를 바꾸거나 필터를 줄이면 더 많은 결과를 볼 수 있습니다.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {searchResults.map(transaction => {
              const category = CATEGORIES[transaction.type]?.find(c => c.id === transaction.category);
              const Icon = category?.icon;
              const user = resolveUserInfo(transaction.userId, familyInfo, currentUser);
              const paymentMethod = PAYMENT_METHODS.find(p => p.id === transaction.paymentMethod);

              return (
                <div
                  key={transaction.id}
                  className="p-3 sm:p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all duration-200 card-hover"
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2.5 rounded-lg flex-shrink-0 ${category?.color || 'bg-slate-100 text-slate-600'}`}>
                        {Icon && <Icon size={20} className="sm:w-6 sm:h-6" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h4 className="text-base sm:text-lg font-bold text-slate-800 truncate">
                              {category?.name || '기타'}
                              {transaction.subcategory ? ` · ${transaction.subcategory}` : ''}
                            </h4>
                            <p className="text-xs sm:text-sm text-slate-500 mt-1 truncate">
                              {transaction.date} · {user?.name || '알 수 없음'} {paymentMethod ? `· ${paymentMethod.name}` : ''}
                            </p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-[11px] sm:text-xs font-semibold flex-shrink-0 ${
                            transaction.type === 'income'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-rose-100 text-rose-700'
                          }`}>
                            {transaction.type === 'income' ? '수입' : '지출'}
                          </span>
                        </div>

                        <p className={`text-xl sm:text-2xl font-bold mt-3 ${
                          transaction.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                        }`}>
                          {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}원
                        </p>

                        {transaction.memo && (
                          <p className="text-xs sm:text-sm text-slate-500 mt-2 line-clamp-2">
                            {transaction.memo}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
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
