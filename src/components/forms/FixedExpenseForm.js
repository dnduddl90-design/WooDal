import React from 'react';
import { CATEGORIES, PAYMENT_METHODS } from '../../constants';
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
  // 폼 제출 핸들러
  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.category && formData.amount) {
      onSubmit();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? '고정지출 수정' : '고정지출 추가'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 고정지출명 */}
        <Input
          label="고정지출명"
          type="text"
          value={formData.name}
          onChange={(e) => onFormChange({ ...formData, name: e.target.value })}
          placeholder="예: 월세, 넷플릭스 구독료"
          required
        />

        {/* 카테고리 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            카테고리 <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.category}
            onChange={(e) => onFormChange({ ...formData, category: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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

        {/* 금액 */}
        <Input
          label="금액"
          type="number"
          value={formData.amount}
          onChange={(e) => onFormChange({ ...formData, amount: e.target.value })}
          placeholder="0"
          required
        />

        {/* 자동 등록 날짜 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            자동 등록 날짜 <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.autoRegisterDate}
            onChange={(e) => onFormChange({ ...formData, autoRegisterDate: parseInt(e.target.value) })}
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            required
          >
            {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
              <option key={day} value={day}>
                매월 {day}일
              </option>
            ))}
          </select>
          <p className="text-sm text-gray-500 mt-1">
            매달 이 날짜에 자동으로 거래가 등록됩니다
          </p>
        </div>

        {/* 월 증가액 */}
        <Input
          label="월 증가액 (선택)"
          type="number"
          value={formData.monthlyIncrease}
          onChange={(e) => onFormChange({ ...formData, monthlyIncrease: e.target.value })}
          placeholder="0"
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

        {/* 활성화 상태 */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <p className="font-medium text-gray-800">활성화</p>
            <p className="text-sm text-gray-600">
              비활성화하면 자동 등록이 중지됩니다
            </p>
          </div>
          <button
            type="button"
            onClick={() => onFormChange({ ...formData, isActive: !formData.isActive })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              formData.isActive ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                formData.isActive ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
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
