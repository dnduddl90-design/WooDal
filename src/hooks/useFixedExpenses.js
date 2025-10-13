import { useState, useEffect } from 'react';
import { STORAGE_KEYS, loadFromStorage, saveToStorage } from '../utils';

/**
 * 고정지출 관리 커스텀 훅
 * SRP: 고정지출 상태 및 CRUD 로직만 담당
 */
export const useFixedExpenses = () => {
  // localStorage에서 초기 데이터 불러오기
  const [fixedExpenses, setFixedExpenses] = useState(() => {
    return loadFromStorage(STORAGE_KEYS.FIXED_EXPENSES, []);
  });
  const [showAddFixed, setShowAddFixed] = useState(false);
  const [editingFixed, setEditingFixed] = useState(null);
  const [fixedForm, setFixedForm] = useState({
    name: '',
    category: '',
    amount: '',
    autoRegisterDate: 1,
    monthlyIncrease: '',
    paymentMethod: '',
    memo: '',
    isActive: true
  });

  /**
   * 고정지출 추가
   */
  const handleAddFixedExpense = (formData) => {
    const newFixed = {
      id: Date.now(),
      ...formData,
      amount: parseInt(formData.amount) || 0,
      autoRegisterDate: parseInt(formData.autoRegisterDate) || 1,
      monthlyIncrease: parseInt(formData.monthlyIncrease) || 0
    };
    setFixedExpenses(prev => [...prev, newFixed]);
  };

  /**
   * 고정지출 수정
   */
  const handleUpdateFixedExpense = (id, formData) => {
    setFixedExpenses(prev =>
      prev.map(f =>
        f.id === id
          ? {
              ...f,
              ...formData,
              amount: parseInt(formData.amount) || 0,
              autoRegisterDate: parseInt(formData.autoRegisterDate) || 1,
              monthlyIncrease: parseInt(formData.monthlyIncrease) || 0
            }
          : f
      )
    );
  };

  /**
   * 고정지출 삭제
   */
  const handleDeleteFixedExpense = (id) => {
    setFixedExpenses(prev => prev.filter(f => f.id !== id));
  };

  /**
   * 고정지출 활성화/비활성화 토글
   */
  const handleToggleActive = (id) => {
    setFixedExpenses(prev =>
      prev.map(f =>
        f.id === id ? { ...f, isActive: !f.isActive } : f
      )
    );
  };

  /**
   * 특정 날짜의 고정지출 가져오기
   */
  const getFixedExpensesForDay = (day) => {
    return fixedExpenses.filter(f => f.autoRegisterDate === day && f.isActive);
  };

  /**
   * 추가 모드 시작
   */
  const startAddFixed = () => {
    setEditingFixed(null);
    setFixedForm({
      name: '',
      category: '',
      amount: '',
      autoRegisterDate: 1,
      monthlyIncrease: '',
      paymentMethod: '',
      memo: '',
      isActive: true
    });
    setShowAddFixed(true);
  };

  /**
   * 수정 모드 시작
   */
  const startEditFixed = (fixed) => {
    setEditingFixed(fixed);
    setFixedForm({
      name: fixed.name,
      category: fixed.category,
      amount: fixed.amount.toString(),
      autoRegisterDate: fixed.autoRegisterDate,
      monthlyIncrease: (fixed.monthlyIncrease || '').toString(),
      paymentMethod: fixed.paymentMethod || '',
      memo: fixed.memo || '',
      isActive: fixed.isActive
    });
    setShowAddFixed(true);
  };

  /**
   * 폼 리셋
   */
  const resetFixedForm = () => {
    setFixedForm({
      name: '',
      category: '',
      amount: '',
      autoRegisterDate: 1,
      monthlyIncrease: '',
      paymentMethod: '',
      memo: '',
      isActive: true
    });
    setEditingFixed(null);
  };

  /**
   * 고정지출 제출
   */
  const handleSubmitFixed = () => {
    if (fixedForm.name && fixedForm.category && fixedForm.amount) {
      if (editingFixed) {
        handleUpdateFixedExpense(editingFixed.id, fixedForm);
      } else {
        handleAddFixedExpense(fixedForm);
      }
      resetFixedForm();
      setShowAddFixed(false);
      return true;
    }
    return false;
  };

  // fixedExpenses가 변경될 때마다 localStorage에 저장
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.FIXED_EXPENSES, fixedExpenses);
  }, [fixedExpenses]);

  return {
    fixedExpenses,
    setFixedExpenses,
    showAddFixed,
    setShowAddFixed,
    editingFixed,
    fixedForm,
    setFixedForm,
    handleAddFixedExpense,
    handleUpdateFixedExpense,
    handleDeleteFixedExpense,
    handleToggleActive,
    getFixedExpensesForDay,
    startAddFixed,
    startEditFixed,
    resetFixedForm,
    handleSubmitFixed
  };
};
