import React from 'react';
import { CATEGORIES, PAYMENT_METHODS } from '../../constants';
import { getTodayDateString } from '../../utils';
import { Button, Input, Modal } from '../common';

/**
 * 거래 추가/수정 폼 컴포넌트
 * SRP: 거래 폼 UI만 담당
 * DIP: Props를 통해 데이터와 핸들러 주입받음
 */
export const TransactionForm = ({
  isOpen,
  onClose,
  formData,
  onFormChange,
  onSubmit,
  isEditMode = false
}) => {
  // 선택된 타입의 카테고리 목록
  const currentCategories = formData.type === 'income'
    ? CATEGORIES.income
    : CATEGORIES.expense;

  // 선택된 카테고리의 서브카테고리
  const selectedCategory = currentCategories.find(c => c.id === formData.category);
  const subCategories = selectedCategory?.subCategories || [];

  // 폼 제출 핸들러
  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.category && formData.amount) {
      onSubmit();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? '거래 수정' : '거래 추가'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="ui-surface-soft rounded-xl p-4 space-y-4">
          <div>
            <p className="text-sm font-semibold text-slate-800">기본 정보</p>
            <p className="text-xs text-slate-500 mt-1">거래의 유형, 날짜, 금액부터 먼저 입력합니다.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              타입 <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => onFormChange({ ...formData, type: 'expense', category: '', subcategory: '' })}
                className={`px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                  formData.type === 'expense'
                    ? 'bg-rose-500 text-white shadow-lg scale-105'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                지출
              </button>
              <button
                type="button"
                onClick={() => onFormChange({ ...formData, type: 'income', category: '', subcategory: '' })}
                className={`px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                  formData.type === 'income'
                    ? 'bg-emerald-500 text-white shadow-lg scale-105'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                수입
              </button>
            </div>
          </div>

          <Input
            label="날짜"
            type="date"
            value={formData.date || getTodayDateString()}
            onChange={(e) => onFormChange({ ...formData, date: e.target.value })}
            required
          />

          <Input
            label="금액"
            type="number"
            value={formData.amount}
            onChange={(e) => onFormChange({ ...formData, amount: e.target.value })}
            placeholder="0"
            required
          />
        </div>

        <div className="ui-surface-soft rounded-xl p-4 space-y-4">
          <div>
            <p className="text-sm font-semibold text-slate-800">분류</p>
            <p className="text-xs text-slate-500 mt-1">카테고리와 결제수단으로 거래를 구분합니다.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              카테고리 <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.category}
              onChange={(e) => onFormChange({ ...formData, category: e.target.value, subcategory: '' })}
              className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-slate-700"
              required
            >
              <option value="">카테고리 선택</option>
              {currentCategories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            {subCategories.length > 0 && (
              <>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  세부 항목
                </label>
                <select
                  value={formData.subcategory}
                  onChange={(e) => onFormChange({ ...formData, subcategory: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-slate-700"
                >
                  <option value="">선택 안함</option>
                  {subCategories.map(sub => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </>
            )}
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
        </div>

        <div className="ui-surface-soft rounded-xl p-4 space-y-4">
          <div>
            <p className="text-sm font-semibold text-slate-800">추가 정보</p>
            <p className="text-xs text-slate-500 mt-1">메모나 정산 여부처럼 나중에 참고할 정보를 남깁니다.</p>
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

          {formData.type === 'expense' && (
            <div className="flex items-center gap-3 p-4 bg-indigo-50 rounded-xl border border-indigo-200">
              <input
                type="checkbox"
                id="isPocketMoney"
                checked={formData.isPocketMoney || false}
                onChange={(e) => onFormChange({ ...formData, isPocketMoney: e.target.checked })}
                className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              />
              <label htmlFor="isPocketMoney" className="text-sm font-medium text-slate-700 cursor-pointer flex items-center gap-2">
                <span>💰</span>
                <span>용돈 사용 (나중에 정산 필요)</span>
              </label>
            </div>
          )}
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
