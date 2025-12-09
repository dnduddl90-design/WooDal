import React, { useMemo, useState } from 'react';
import { Plus, Eye, EyeOff, Edit2, StopCircle, Receipt, AlertCircle } from 'lucide-react';
import { CATEGORIES } from '../constants';
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
  onToggleActive
}) => {
  const [isMigrating, setIsMigrating] = useState(false);
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

  // 마이그레이션 함수
  const handleMigrateData = async () => {
    const fixedExpensesToUpdate = fixedExpenses.filter(
      fixed => fixed.isUnlimited && (!fixed.startDate || fixed.startDate === '')
    );

    if (fixedExpensesToUpdate.length === 0) {
      alert('마이그레이션할 항목이 없습니다. 모든 고정지출이 이미 시작일을 가지고 있습니다.');
      return;
    }

    if (!window.confirm(`기존 무기한 고정지출 ${fixedExpensesToUpdate.length}개의 시작일을 2025-10-01로 설정하시겠습니까?`)) {
      return;
    }

    setIsMigrating(true);
    try {
      for (const fixed of fixedExpensesToUpdate) {
        await onEdit(fixed.id, {
          ...fixed,
          startDate: '2025-10-01'
        });
      }
      alert(`✅ 마이그레이션 완료! ${fixedExpensesToUpdate.length}개 항목이 업데이트되었습니다.`);
    } catch (error) {
      console.error('마이그레이션 오류:', error);
      alert('❌ 마이그레이션 중 오류가 발생했습니다.');
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in pb-20 sm:pb-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center gap-2">
        <h2 className="text-lg sm:text-2xl font-bold gradient-text">고정지출 관리</h2>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={handleMigrateData}
            disabled={isMigrating}
            className="text-xs"
          >
            {isMigrating ? '처리 중...' : '🔧 마이그레이션'}
          </Button>
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
      </div>

      {/* 요약 카드들 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-6">
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

        {/* 전체 항목 */}
        <div className="glass-effect rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-shadow card-hover">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-gray-600 mb-1">전체 항목</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-800">
                {validFixedExpenses.length}개
              </p>
              {inactiveCount > 0 && (
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  (비활성 {inactiveCount}개)
                </p>
              )}
            </div>
            <div className="p-3 sm:p-4 rounded-full bg-gray-100 text-gray-600 flex-shrink-0">
              <Receipt size={24} className="sm:w-8 sm:h-8" />
            </div>
          </div>
        </div>
      </div>

      {/* 고정지출 목록 */}
      <div className="glass-effect rounded-xl p-4 sm:p-6 shadow-lg">
        <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4">고정지출 목록</h3>

        {validFixedExpenses.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">📋</div>
            <p className="text-sm sm:text-base text-gray-500 mb-1 sm:mb-2">등록된 고정지출이 없습니다</p>
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
            {validFixedExpenses.map(fixed => {
              const category = CATEGORIES.expense.find(c => c.id === fixed.category);
              const Icon = category?.icon;

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
                            fixed.isActive
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-200 text-gray-600'
                          }`}>
                            {fixed.isActive ? '활성' : '비활성'}
                          </span>
                        </div>

                        <div className="space-y-0.5 sm:space-y-1 text-xs sm:text-sm text-gray-600">
                          <p className="font-bold text-gray-800 truncate">
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
                          <p className="truncate">카테고리: {category?.name || '기타'}</p>
                          {fixed.paymentMethod && (
                            <p className="truncate">결제 수단: {fixed.paymentMethod}</p>
                          )}
                          {fixed.memo && (
                            <p className="text-gray-500 truncate">메모: {fixed.memo}</p>
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
