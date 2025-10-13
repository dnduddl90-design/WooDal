import React from 'react';
import { CATEGORIES, PAYMENT_METHODS } from '../../constants';
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
        {/* 타입 선택 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            타입 <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => onFormChange({ ...formData, type: 'expense', category: '', subcategory: '' })}
              className={`px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                formData.type === 'expense'
                  ? 'bg-red-500 text-white shadow-lg scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              지출
            </button>
            <button
              type="button"
              onClick={() => onFormChange({ ...formData, type: 'income', category: '', subcategory: '' })}
              className={`px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                formData.type === 'income'
                  ? 'bg-green-500 text-white shadow-lg scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              수입
            </button>
          </div>
        </div>

        {/* 날짜 */}
        <Input
          label="날짜"
          type="date"
          value={formData.date}
          onChange={(e) => onFormChange({ ...formData, date: e.target.value })}
          required
        />

        {/* 카테고리 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            카테고리 <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.category}
            onChange={(e) => onFormChange({ ...formData, category: e.target.value, subcategory: '' })}
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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

        {/* 서브카테고리 (있는 경우만) */}
        {subCategories.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              세부 항목
            </label>
            <select
              value={formData.subcategory}
              onChange={(e) => onFormChange({ ...formData, subcategory: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option value="">선택 안함</option>
              {subCategories.map(sub => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* 금액 */}
        <Input
          label="금액"
          type="number"
          value={formData.amount}
          onChange={(e) => onFormChange({ ...formData, amount: e.target.value })}
          placeholder="0"
          required
        />

        {/* 결제 수단 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            결제 수단
          </label>
          <select
            value={formData.paymentMethod}
            onChange={(e) => onFormChange({ ...formData, paymentMethod: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          >
            <option value="">선택 안함</option>
            {PAYMENT_METHODS.map(method => (
              <option key={method.id} value={method.id}>
                {method.name}
              </option>
            ))}
          </select>
        </div>

        {/* 메모 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            메모
          </label>
          <textarea
            value={formData.memo}
            onChange={(e) => onFormChange({ ...formData, memo: e.target.value })}
            placeholder="메모를 입력하세요"
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
          />
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
