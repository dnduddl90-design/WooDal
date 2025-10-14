import { useState, useEffect } from 'react';
import {
  saveFixedExpense,
  updateFixedExpense,
  deleteFixedExpense,
  onFixedExpensesChange
} from '../firebase/databaseService';
import { STORAGE_KEYS, loadFromStorage } from '../utils';

/**
 * 고정지출 관리 커스텀 훅 (Firebase 사용)
 * SRP: 고정지출 상태 및 CRUD 로직만 담당
 */
export const useFixedExpenses = (currentUser) => {
  const [fixedExpenses, setFixedExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
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
   * Firebase에서 데이터 로드 및 실시간 리스너 설정
   */
  useEffect(() => {
    if (!currentUser?.firebaseId) {
      setLoading(false);
      return;
    }

    console.log('📥 Firebase에서 고정지출 로드 중...');

    // 실시간 리스너 설정
    const unsubscribe = onFixedExpensesChange(
      currentUser.firebaseId,
      (firebaseFixed) => {
        console.log(`✅ 고정지출 ${firebaseFixed.length}건 로드됨`);

        // Firebase 데이터가 비어있으면 LocalStorage에서 마이그레이션
        if (firebaseFixed.length === 0) {
          const localFixed = loadFromStorage(STORAGE_KEYS.FIXED_EXPENSES, []);
          if (localFixed.length > 0) {
            console.log(`🔄 LocalStorage에서 ${localFixed.length}건 마이그레이션 시작...`);
            migrateLocalFixedExpenses(localFixed);
          } else {
            setFixedExpenses([]);
            setLoading(false);
          }
        } else {
          setFixedExpenses(firebaseFixed);
          setLoading(false);
        }
      }
    );

    // 클린업: 컴포넌트 언마운트 시 리스너 제거
    return () => unsubscribe();
  }, [currentUser?.firebaseId]);

  /**
   * LocalStorage 데이터를 Firebase로 마이그레이션
   */
  const migrateLocalFixedExpenses = async (localFixed) => {
    try {
      for (const fixed of localFixed) {
        await saveFixedExpense(currentUser.firebaseId, fixed);
      }
      console.log('✅ 고정지출 마이그레이션 완료!');
      setLoading(false);
    } catch (error) {
      console.error('❌ 고정지출 마이그레이션 실패:', error);
      // 실패 시 로컬 데이터 사용
      setFixedExpenses(localFixed);
      setLoading(false);
    }
  };

  /**
   * 고정지출 추가
   */
  const handleAddFixedExpense = async (formData) => {
    try {
      const newFixed = {
        id: Date.now(),
        ...formData,
        amount: parseInt(formData.amount) || 0,
        autoRegisterDate: parseInt(formData.autoRegisterDate) || 1,
        monthlyIncrease: parseInt(formData.monthlyIncrease) || 0
      };

      // Firebase에 저장
      const savedId = await saveFixedExpense(
        currentUser.firebaseId,
        newFixed
      );

      console.log('✅ 고정지출 추가 성공:', savedId);
      // 실시간 리스너가 자동으로 UI 업데이트
    } catch (error) {
      console.error('❌ 고정지출 추가 실패:', error);
      alert('고정지출 추가에 실패했습니다.');
    }
  };

  /**
   * 고정지출 수정
   */
  const handleUpdateFixedExpense = async (id, formData) => {
    try {
      const existingFixed = fixedExpenses.find(f => f.id === id);
      const updatedFixed = {
        ...existingFixed,
        ...formData,
        amount: parseInt(formData.amount) || 0,
        autoRegisterDate: parseInt(formData.autoRegisterDate) || 1,
        monthlyIncrease: parseInt(formData.monthlyIncrease) || 0
      };

      // Firebase에 업데이트
      await updateFixedExpense(
        currentUser.firebaseId,
        id,
        updatedFixed
      );

      console.log('✅ 고정지출 수정 성공:', id);
      // 실시간 리스너가 자동으로 UI 업데이트
    } catch (error) {
      console.error('❌ 고정지출 수정 실패:', error);
      alert('고정지출 수정에 실패했습니다.');
    }
  };

  /**
   * 고정지출 삭제
   */
  const handleDeleteFixedExpense = async (id) => {
    try {
      // Firebase에서 삭제
      await deleteFixedExpense(currentUser.firebaseId, id);
      console.log('✅ 고정지출 삭제 성공:', id);
      // 실시간 리스너가 자동으로 UI 업데이트
    } catch (error) {
      console.error('❌ 고정지출 삭제 실패:', error);
      alert('고정지출 삭제에 실패했습니다.');
    }
  };

  /**
   * 고정지출 활성화/비활성화 토글
   */
  const handleToggleActive = async (id) => {
    try {
      const existingFixed = fixedExpenses.find(f => f.id === id);
      const updatedFixed = {
        ...existingFixed,
        isActive: !existingFixed.isActive
      };

      // Firebase에 업데이트
      await updateFixedExpense(
        currentUser.firebaseId,
        id,
        updatedFixed
      );

      console.log('✅ 고정지출 활성화 토글 성공:', id);
      // 실시간 리스너가 자동으로 UI 업데이트
    } catch (error) {
      console.error('❌ 고정지출 토글 실패:', error);
      alert('고정지출 상태 변경에 실패했습니다.');
    }
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

  return {
    fixedExpenses,
    loading,
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
