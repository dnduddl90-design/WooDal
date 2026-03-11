import React, { useMemo, useState } from 'react';
import { Plus, Eye, EyeOff, Edit2, StopCircle, Receipt, AlertCircle, Filter, PauseCircle } from 'lucide-react';
import { CATEGORIES, PAYMENT_METHODS } from '../constants';
import { formatCurrency, formatDate } from '../utils';
import { Button } from '../components/common';

/**
 * 고정지출 관리 페이지 컴포넌트
 * SRP: 고정지출 목록 UI 렌더링만 담당
 * DIP: Props를 통해 데이터와 핸들러 주입받음
 */
export const FixedExpensePage = ({
  fixedExpenses = [],
  onAdd,
  onEdit,
  onDelete,
  onCancel,
  onToggleActive,
  onDeactivateMultiple
}) => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // 오늘 날짜
  const today = formatDate(new Date());

  // 기간이 유효한 고정지출만 필터링 (endDate가 없거나 오늘 이후인 것만)
  const validFixedExpenses = useMemo(() => {
    return fixedExpenses.filter(fixed => {
      // endDate가 없거나 무기한이면 표시
      if (!fixed.endDate || fixed.isUnlimited !== false) return true;
      // endDate가 오늘 이후면 표시
      return fixed.endDate >= today;
    });
  }, [fixedExpenses, today]);

  // 통계 계산
  const activeExpenses = validFixedExpenses.filter(f => f.isActive);
  const inactiveCount = validFixedExpenses.length - activeExpenses.length;
  const monthlyTotal = activeExpenses.reduce((sum, f) => sum + f.amount, 0);

  const getFixedStatus = (fixed) => {
    if (!fixed.isActive) {
      return { label: '일시중지', className: 'bg-gray-200 text-gray-700' };
    }

    if (fixed.isUnlimited === false && fixed.endDate) {
      if (fixed.endDate < today) {
        return { label: '해지됨', className: 'bg-red-100 text-red-700' };
      }
      return { label: '종료 예정', className: 'bg-amber-100 text-amber-700' };
    }

    return { label: '활성', className: 'bg-green-100 text-green-700' };
  };

  const filteredExpenses = validFixedExpenses.filter((fixed) => {
    const status = getFixedStatus(fixed).label;
    const matchesStatus = statusFilter === 'all'
      || (statusFilter === 'active' && status === '활성')
      || (statusFilter === 'paused' && status === '일시중지')
      || (statusFilter === 'scheduled' && status === '종료 예정');
    const matchesCategory = categoryFilter === 'all' || fixed.category === categoryFilter;

    return matchesStatus && matchesCategory;
  });

  const scheduledCount = validFixedExpenses.filter((fixed) => getFixedStatus(fixed).label === '종료 예정').length;
  const pausedCount = validFixedExpenses.filter((fixed) => getFixedStatus(fixed).label === '일시중지').length;
  const hasActiveFilters = statusFilter !== 'all' || categoryFilter !== 'all';
  const upcomingExpenses = [...activeExpenses]
    .sort((a, b) => (a.autoRegisterDate || 99) - (b.autoRegisterDate || 99))
    .slice(0, 3);

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in pb-20 sm:pb-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center gap-2">
        <h2 className="text-lg sm:text-2xl font-bold gradient-text">고정지출 관리</h2>
        <Button
          variant="primary"
          icon={Plus}
          onClick={onAdd}
          className="text-xs sm:text-sm"
        >
          <span className="hidden sm:inline">고정지출 추가</span>
          <span className="sm:hidden">추가</span>
        </Button>
      </div>

      {/* 요약 카드들 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-6">
        {/* 활성 고정지출 개수 */}
        <div className="glass-effect rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-shadow card-hover">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-gray-600 mb-1">활성 고정지출</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-800">
                {activeExpenses.length}개
              </p>
            </div>
            <div className="p-3 sm:p-4 rounded-full bg-blue-100 text-blue-600 flex-shrink-0">
              <Receipt size={24} className="sm:w-8 sm:h-8" />
            </div>
          </div>
        </div>

        {/* 월 총액 */}
        <div className="glass-effect rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-shadow card-hover">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-gray-600 mb-1">월 고정지출 총액</p>
              <p className="text-lg sm:text-2xl font-bold text-red-600 truncate">
                {formatCurrency(monthlyTotal)}원
              </p>
            </div>
            <div className="p-3 sm:p-4 rounded-full bg-red-100 text-red-600 flex-shrink-0">
              <AlertCircle size={24} className="sm:w-8 sm:h-8" />
            </div>
          </div>
        </div>

        {/* 일시중지 */}
        <div className="glass-effect rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-shadow card-hover">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-gray-600 mb-1">일시중지</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-800">
                {pausedCount}개
              </p>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                자동 등록 중단 상태
              </p>
            </div>
            <div className="p-3 sm:p-4 rounded-full bg-gray-100 text-gray-600 flex-shrink-0">
              <PauseCircle size={24} className="sm:w-8 sm:h-8" />
            </div>
          </div>
        </div>

        {/* 종료 예정/전체 */}
        <div className="glass-effect rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-shadow card-hover">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-gray-600 mb-1">종료 예정 / 전체</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-800">
                {scheduledCount} / {validFixedExpenses.length}
              </p>
              {inactiveCount > 0 && (
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  비활성 {inactiveCount}개 포함
                </p>
              )}
            </div>
            <div className="p-3 sm:p-4 rounded-full bg-amber-100 text-amber-600 flex-shrink-0">
              <AlertCircle size={24} className="sm:w-8 sm:h-8" />
            </div>
          </div>
        </div>
      </div>

      {upcomingExpenses.length > 0 && (
        <div className="glass-effect rounded-xl p-4 sm:p-5 shadow-lg bg-gradient-to-r from-emerald-50 via-white to-blue-50">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-800">다음 자동 등록 예정</p>
              <p className="text-xs sm:text-sm text-gray-600">
                활성 고정지출 중 등록일이 가장 가까운 항목입니다.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {upcomingExpenses.map((fixed) => (
                <div key={fixed.id} className="rounded-full bg-white/90 px-3 py-2 text-xs sm:text-sm shadow-sm border border-emerald-100">
                  <span className="font-semibold text-gray-800">{fixed.name}</span>
                  <span className="mx-2 text-gray-400">|</span>
                  <span className="text-emerald-700">매월 {fixed.autoRegisterDate}일</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 고정지출 목록 */}
      <div className="glass-effect rounded-xl p-4 sm:p-6 shadow-lg">
        <div className="flex flex-col gap-3 mb-4">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h3 className="text-base sm:text-lg font-bold text-gray-800">고정지출 목록</h3>
            {activeExpenses.length > 1 && (
              <Button
                variant="secondary"
                size="sm"
                icon={PauseCircle}
                onClick={() => {
                  if (window.confirm(`활성 고정지출 ${activeExpenses.length}개를 모두 비활성화하시겠습니까?`)) {
                    onDeactivateMultiple(activeExpenses.map((fixed) => fixed.id));
                  }
                }}
              >
                전체 비활성화
              </Button>
            )}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Filter size={16} />
              <span>필터</span>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-xl text-sm"
            >
              <option value="all">전체 상태</option>
              <option value="active">활성</option>
              <option value="paused">일시중지</option>
              <option value="scheduled">종료 예정</option>
            </select>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-xl text-sm"
            >
              <option value="all">전체 카테고리</option>
              {CATEGORIES.expense.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setStatusFilter('all');
                  setCategoryFilter('all');
                }}
              >
                필터 초기화
              </Button>
            )}
          </div>

          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 text-xs sm:text-sm">
              {statusFilter !== 'all' && (
                <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">
                  상태: {statusFilter === 'active' ? '활성' : statusFilter === 'paused' ? '일시중지' : '종료 예정'}
                </span>
              )}
              {categoryFilter !== 'all' && (
                <span className="rounded-full bg-purple-50 px-3 py-1 text-purple-700">
                  카테고리: {CATEGORIES.expense.find((category) => category.id === categoryFilter)?.name || categoryFilter}
                </span>
              )}
            </div>
          )}
        </div>

        {filteredExpenses.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">📋</div>
            <p className="text-sm sm:text-base text-gray-500 mb-1 sm:mb-2">
              {validFixedExpenses.length === 0 ? '등록된 고정지출이 없습니다' : '조건에 맞는 고정지출이 없습니다'}
            </p>
            <p className="text-xs sm:text-sm text-gray-400 mb-4 sm:mb-6">
              월세, 구독료 등 매달 반복되는 지출을 등록하세요
            </p>
            <Button
              variant="primary"
              icon={Plus}
              onClick={onAdd}
              className="text-xs sm:text-sm"
            >
              첫 고정지출 추가하기
            </Button>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {filteredExpenses.map(fixed => {
              const category = CATEGORIES.expense.find(c => c.id === fixed.category);
              const Icon = category?.icon;
              const statusMeta = getFixedStatus(fixed);
              const paymentMethod = PAYMENT_METHODS.find((method) => method.id === fixed.paymentMethod);

              return (
                <div
                  key={fixed.id}
                  className={`p-3 sm:p-4 border rounded-xl transition-all duration-200 card-hover ${
                    fixed.isActive
                      ? 'border-gray-200 bg-white'
                      : 'border-gray-300 bg-gray-50 opacity-60'
                  }`}
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
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="text-base sm:text-lg font-bold text-gray-800 truncate">
                            {fixed.name}
                          </h4>
                          <span className={`px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs font-medium flex-shrink-0 ${
                            statusMeta.className
                          }`}>
                            {statusMeta.label}
                          </span>
                        </div>

                        <div className="space-y-0.5 sm:space-y-1 text-xs sm:text-sm text-gray-600">
                          <p className="font-bold text-gray-800 break-words">
                            {formatCurrency(fixed.amount)}원
                            {fixed.monthlyIncrease > 0 && (
                              <span className="text-orange-600 ml-2">
                                (매월 +{formatCurrency(fixed.monthlyIncrease)}원)
                              </span>
                            )}
                          </p>
                          <p>매월 {fixed.autoRegisterDate}일 자동 등록</p>
                          {/* 기간 정보 표시 */}
                          {fixed.isUnlimited === false && (fixed.startDate || fixed.endDate) && (
                            <p className="text-blue-600 font-medium">
                              📅 기간: {fixed.startDate || '시작'} ~ {fixed.endDate || '종료'}
                            </p>
                          )}
                          {fixed.isUnlimited !== false && (
                            <p className="text-green-600 font-medium">
                              ♾️ 무기한
                            </p>
                          )}
                          <p className="break-words">카테고리: {category?.name || '기타'}</p>
                          {fixed.paymentMethod && (
                            <p className="break-words">결제 수단: {paymentMethod?.name || fixed.paymentMethod}</p>
                          )}
                          {fixed.memo && (
                            <p className="text-gray-500 break-words">메모: {fixed.memo}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 오른쪽: 액션 버튼들 */}
                    <div className="flex items-center space-x-1 sm:space-x-2 w-full sm:w-auto justify-end sm:justify-start">
                      <Button
                        variant="outline"
                        size="sm"
                        icon={fixed.isActive ? Eye : EyeOff}
                        onClick={() => onToggleActive(fixed.id)}
                        title={fixed.isActive ? '비활성화' : '활성화'}
                        className="flex-1 sm:flex-none"
                      />
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={Edit2}
                        onClick={() => onEdit(fixed)}
                        title="수정"
                        className="flex-1 sm:flex-none"
                      />
                      <Button
                        variant="danger"
                        size="sm"
                        icon={StopCircle}
                        onClick={() => onCancel(fixed.id)}
                        title="해지"
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

      {/* 도움말 섹션 */}
      <div className="glass-effect rounded-xl p-4 sm:p-6 shadow-lg bg-gradient-to-r from-blue-50 to-purple-50">
        <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4">💡 고정지출 활용 팁</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          <div className="bg-white rounded-lg p-3 sm:p-4">
            <p className="font-semibold text-sm sm:text-base text-gray-800 mb-1 sm:mb-2">🔄 자동 등록</p>
            <p className="text-xs sm:text-sm text-gray-600">
              매월 지정한 날짜에 자동으로 거래가 등록됩니다.
            </p>
          </div>
          <div className="bg-white rounded-lg p-3 sm:p-4">
            <p className="font-semibold text-sm sm:text-base text-gray-800 mb-1 sm:mb-2">📅 기간 설정</p>
            <p className="text-xs sm:text-sm text-gray-600">
              무기한 또는 기간 제한 고정지출을 설정할 수 있습니다.
            </p>
          </div>
          <div className="bg-white rounded-lg p-3 sm:p-4">
            <p className="font-semibold text-sm sm:text-base text-gray-800 mb-1 sm:mb-2">📈 월 증가액</p>
            <p className="text-xs sm:text-sm text-gray-600">
              매달 일정 금액씩 증가하는 지출을 설정할 수 있습니다.
            </p>
          </div>
          <div className="bg-white rounded-lg p-3 sm:p-4">
            <p className="font-semibold text-sm sm:text-base text-gray-800 mb-1 sm:mb-2">⏸️ 일시 중지</p>
            <p className="text-xs sm:text-sm text-gray-600">
              비활성화하면 자동 등록이 중지되지만 데이터는 유지됩니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
