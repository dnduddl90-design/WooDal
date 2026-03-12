import React, { useMemo } from 'react';
import { CATEGORIES, PAYMENT_METHODS } from '../../constants';
import { getTodayDateString } from '../../utils';
import { Button, Input, Modal } from '../common';

/**
 * 고정지출 추가/수정 폼 컴포넌트
 * SRP: 고정지출 폼 UI만 담당
 * DIP: Props를 통해 데이터와 핸들러 주입받음
 */
export const FixedExpenseForm = ({
  isOpen,
  onClose,
  formData,
  onFormChange,
  onSubmit,
  isEditMode = false
}) => {
  const amount = parseInt(formData.amount, 10) || 0;
  const monthlyIncrease = parseInt(formData.monthlyIncrease, 10) || 0;
  const previewMonths = useMemo(() => {
    if (!amount) {
      return [];
    }

    const today = new Date();
    const baseDay = formData.autoRegisterDate || 1;

    return Array.from({ length: 3 }, (_, index) => {
      const previewDate = new Date(today.getFullYear(), today.getMonth() + index, Math.min(baseDay, 28));
      return {
        label: `${previewDate.getFullYear()}년 ${previewDate.getMonth() + 1}월`,
        amount: amount + (monthlyIncrease * index)
      };
    });
  }, [amount, formData.autoRegisterDate, monthlyIncrease]);

  const needsBaseDate = monthlyIncrease !== 0;
  const dateRangeInvalid = !formData.isUnlimited && formData.startDate && formData.endDate && formData.endDate < formData.startDate;

  // 폼 제출 핸들러
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name || !formData.category || !formData.amount) {
      return;
    }

    if (dateRangeInvalid) {
      alert('종료일은 시작일보다 빠를 수 없습니다.');
      return;
    }

    if (needsBaseDate && !formData.baseDate) {
      alert('월 증감액을 사용할 때는 증감액 기준일이 필요합니다.');
      return;
    }

    onSubmit();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? '고정지출 수정' : '고정지출 추가'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="ui-surface-soft rounded-xl p-4 space-y-4">
          <div>
            <p className="text-sm font-semibold text-slate-800">기본 정보</p>
            <p className="text-xs text-slate-500 mt-1">고정지출 이름, 카테고리, 금액과 자동 등록일을 입력합니다.</p>
          </div>

          <Input
            label="고정지출명"
            type="text"
            value={formData.name}
            onChange={(e) => onFormChange({ ...formData, name: e.target.value })}
            placeholder="예: 월세, 넷플릭스 구독료"
            required
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              카테고리 <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.category}
              onChange={(e) => onFormChange({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-slate-700"
              required
            >
              <option value="">카테고리 선택</option>
              {CATEGORIES.expense.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="금액"
            type="number"
            value={formData.amount}
            onChange={(e) => onFormChange({ ...formData, amount: e.target.value })}
            placeholder="0"
            min="0"
            required
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              자동 등록 날짜 <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.autoRegisterDate}
              onChange={(e) => onFormChange({ ...formData, autoRegisterDate: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-slate-700"
              required
            >
              {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                <option key={day} value={day}>
                  매월 {day}일
                </option>
              ))}
            </select>
            <p className="text-sm text-slate-500 mt-1">
              매달 이 날짜에 자동으로 거래가 등록됩니다
            </p>
          </div>
        </div>

        <div className="ui-surface-soft rounded-xl p-4 space-y-4">
          <div>
            <p className="text-sm font-semibold text-slate-800">기간과 증감</p>
            <p className="text-xs text-slate-500 mt-1">무기한 여부, 기간, 월별 증감 규칙을 설정합니다.</p>
          </div>

          <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div>
              <p className="font-medium text-slate-800">무기한 고정지출</p>
              <p className="text-sm text-slate-600">
                종료일 없이 계속 사용
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const newIsUnlimited = !formData.isUnlimited;
                const today = getTodayDateString();
                onFormChange({
                  ...formData,
                  isUnlimited: newIsUnlimited,
                  startDate: formData.startDate || today,
                  endDate: newIsUnlimited ? '' : formData.endDate
                });
              }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                formData.isUnlimited ? 'bg-indigo-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  formData.isUnlimited ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {!formData.isUnlimited && (
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="시작일"
                type="date"
                value={formData.startDate || ''}
                onChange={(e) => onFormChange({ ...formData, startDate: e.target.value })}
                required={!formData.isUnlimited}
              />
              <Input
                label="종료일"
                type="date"
                value={formData.endDate || ''}
                onChange={(e) => onFormChange({ ...formData, endDate: e.target.value })}
                min={formData.startDate}
                required={!formData.isUnlimited}
              />
            </div>
          )}

          {!formData.isUnlimited && (
            <p className="text-sm text-slate-500">
              설정한 기간 동안만 자동으로 거래가 등록됩니다
            </p>
          )}
          {dateRangeInvalid && (
            <p className="text-sm text-red-500">
              종료일은 시작일 이후여야 합니다.
            </p>
          )}
          </div>

          <Input
            label="월 증감액 (선택)"
            type="number"
            value={formData.monthlyIncrease}
            onChange={(e) => onFormChange({ ...formData, monthlyIncrease: e.target.value })}
            placeholder="0"
          />
          <p className="text-sm text-slate-500 -mt-3">
            매월 자동으로 증가(+) 또는 감소(-)할 금액을 입력하세요
          </p>

          {needsBaseDate && (
            <div>
              <Input
                label="증감액 기준일"
                type="date"
                value={formData.baseDate || ''}
                onChange={(e) => onFormChange({ ...formData, baseDate: e.target.value })}
                required={formData.monthlyIncrease && parseInt(formData.monthlyIncrease) !== 0}
              />
              <p className="text-sm text-slate-500 mt-1">
                이 날짜부터 매월 {formData.monthlyIncrease > 0 ? '증가' : '감소'}액이 누적됩니다
              </p>
            </div>
          )}

          {previewMonths.length > 0 && (
            <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4">
              <p className="text-sm font-semibold text-indigo-900 mb-3">자동 등록 미리보기</p>
              <div className="space-y-2">
                {previewMonths.map((preview) => (
                  <div key={preview.label} className="flex items-center justify-between text-sm">
                    <span className="text-indigo-800">{preview.label}</span>
                    <span className="font-semibold text-indigo-900">{preview.amount.toLocaleString()}원</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="ui-surface-soft rounded-xl p-4 space-y-4">
          <div>
            <p className="text-sm font-semibold text-slate-800">추가 정보</p>
            <p className="text-xs text-slate-500 mt-1">결제 수단, 메모, 활성 상태를 마지막에 확인합니다.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              결제 수단
            </label>
            <select
              value={formData.paymentMethod}
              onChange={(e) => onFormChange({ ...formData, paymentMethod: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-slate-700"
            >
              <option value="">선택 안함</option>
              {PAYMENT_METHODS.map(method => (
                <option key={method.id} value={method.id}>
                  {method.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              메모
            </label>
            <textarea
              value={formData.memo}
              onChange={(e) => onFormChange({ ...formData, memo: e.target.value })}
              placeholder="메모를 입력하세요"
              rows={3}
              className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 resize-none text-slate-700"
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div>
              <p className="font-medium text-slate-800">활성화</p>
              <p className="text-sm text-slate-600">
                비활성화하면 자동 등록이 중지됩니다
              </p>
            </div>
            <button
              type="button"
              onClick={() => onFormChange({ ...formData, isActive: !formData.isActive })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                formData.isActive ? 'bg-indigo-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  formData.isActive ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="flex space-x-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="flex-1"
          >
            취소
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="flex-1"
          >
            {isEditMode ? '수정' : '추가'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
