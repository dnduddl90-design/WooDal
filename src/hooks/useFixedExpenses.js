import { useState, useEffect } from 'react';
import {
  saveFixedExpense,
  updateFixedExpense,
  deleteFixedExpense,
  onFixedExpensesChange,
  saveFamilyFixedExpense,
  updateFamilyFixedExpense,
  deleteFamilyFixedExpense,
  onFamilyFixedExpensesChange
} from '../firebase/databaseService';
import { STORAGE_KEYS, loadFromStorage } from '../utils';

/**
 * 고정지출 관리 커스텀 훅 (Firebase 사용)
 * SRP: 고정지출 상태 및 CRUD 로직만 담당
 * 가족 모드와 개인 모드를 모두 지원
 */
export const useFixedExpenses = (currentUser, familyInfo) => {
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
    baseDate: '',
    paymentMethod: '',
    memo: '',
    isActive: true,
    isUnlimited: true,
    startDate: '',
    endDate: ''
  });

  /**
   * Firebase에서 데이터 로드 및 실시간 리스너 설정
   * 가족 모드: families/{familyId}/fixedExpenses
   * 개인 모드: users/{userId}/fixedExpenses
   */
  useEffect(() => {
    if (!currentUser?.firebaseId) {
      setLoading(false);
      return;
    }

    // 가족 모드인지 개인 모드인지 확인
    const isFamilyMode = familyInfo && familyInfo.id;
    const dataId = isFamilyMode ? familyInfo.id : currentUser.firebaseId;
    const mode = isFamilyMode ? '가족 공유' : '개인';

    console.log(`📥 Firebase에서 고정지출 로드 중... (${mode} 모드)`);

    // 실시간 리스너 설정 (가족 모드 or 개인 모드)
    const listenerFunction = isFamilyMode ? onFamilyFixedExpensesChange : onFixedExpensesChange;

    const unsubscribe = listenerFunction(
      dataId,
      (firebaseFixed) => {
        console.log(`✅ 고정지출 ${firebaseFixed.length}건 로드됨 (${mode} 모드)`);

        // Firebase 데이터가 비어있으면 LocalStorage에서 마이그레이션
        if (firebaseFixed.length === 0) {
          const localFixed = loadFromStorage(STORAGE_KEYS.FIXED_EXPENSES, []);
          if (localFixed.length > 0 && !isFamilyMode) { // 개인 모드일 때만 마이그레이션
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.firebaseId, familyInfo?.id]);

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
   * 고정지출 추가 (가족 모드/개인 모드 자동 선택)
   */
  const handleAddFixedExpense = async (formData) => {
    try {
      // startDate 보장: 비어있으면 오늘 날짜로 설정
      const today = new Date().toISOString().split('T')[0];
      const newFixed = {
        id: Date.now(),
        ...formData,
        amount: parseInt(formData.amount) || 0,
        autoRegisterDate: parseInt(formData.autoRegisterDate) || 1,
        monthlyIncrease: parseInt(formData.monthlyIncrease) || 0,
        startDate: formData.startDate || today
      };

      const isFamilyMode = familyInfo && familyInfo.id;

      // 가족 모드 or 개인 모드로 저장
      const savedId = isFamilyMode
        ? await saveFamilyFixedExpense(familyInfo.id, newFixed)
        : await saveFixedExpense(currentUser.firebaseId, newFixed);

      console.log('✅ 고정지출 추가 성공:', savedId, `(${isFamilyMode ? '가족 공유' : '개인'} 모드)`);
      // 실시간 리스너가 자동으로 UI 업데이트
    } catch (error) {
      console.error('❌ 고정지출 추가 실패:', error);
      alert('고정지출 추가에 실패했습니다.');
    }
  };

  /**
   * 고정지출 수정 (가족 모드/개인 모드 자동 선택)
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

      const isFamilyMode = familyInfo && familyInfo.id;

      // 가족 모드 or 개인 모드로 업데이트
      if (isFamilyMode) {
        await updateFamilyFixedExpense(familyInfo.id, id, updatedFixed);
      } else {
        await updateFixedExpense(currentUser.firebaseId, id, updatedFixed);
      }

      console.log('✅ 고정지출 수정 성공:', id, `(${isFamilyMode ? '가족 공유' : '개인'} 모드)`);
      // 실시간 리스너가 자동으로 UI 업데이트
    } catch (error) {
      console.error('❌ 고정지출 수정 실패:', error);
      alert('고정지출 수정에 실패했습니다.');
    }
  };

  /**
   * 고정지출 삭제 (가족 모드/개인 모드 자동 선택)
   */
  const handleDeleteFixedExpense = async (id) => {
    try {
      const isFamilyMode = familyInfo && familyInfo.id;

      // 가족 모드 or 개인 모드로 삭제
      if (isFamilyMode) {
        await deleteFamilyFixedExpense(familyInfo.id, id);
      } else {
        await deleteFixedExpense(currentUser.firebaseId, id);
      }

      console.log('✅ 고정지출 삭제 성공:', id, `(${isFamilyMode ? '가족 공유' : '개인'} 모드)`);
      // 실시간 리스너가 자동으로 UI 업데이트
    } catch (error) {
      console.error('❌ 고정지출 삭제 실패:', error);
      alert('고정지출 삭제에 실패했습니다.');
    }
  };

  /**
   * 고정지출 활성화/비활성화 토글 (가족 모드/개인 모드 자동 선택)
   */
  const handleToggleActive = async (id) => {
    try {
      const existingFixed = fixedExpenses.find(f => f.id === id);
      const updatedFixed = {
        ...existingFixed,
        isActive: !existingFixed.isActive
      };

      const isFamilyMode = familyInfo && familyInfo.id;

      // 가족 모드 or 개인 모드로 업데이트
      if (isFamilyMode) {
        await updateFamilyFixedExpense(familyInfo.id, id, updatedFixed);
      } else {
        await updateFixedExpense(currentUser.firebaseId, id, updatedFixed);
      }

      console.log('✅ 고정지출 활성화 토글 성공:', id, `(${isFamilyMode ? '가족 공유' : '개인'} 모드)`);
      // 실시간 리스너가 자동으로 UI 업데이트
    } catch (error) {
      console.error('❌ 고정지출 토글 실패:', error);
      alert('고정지출 상태 변경에 실패했습니다.');
    }
  };

  /**
   * 고정지출 해지 (endDate를 오늘로 설정)
   */
  const handleCancelFixedExpense = async (id) => {
    const fixedExpense = fixedExpenses.find(f => f.id === id);
    if (!fixedExpense) return;

    const startDateStr = fixedExpense.startDate || '알 수 없음';
    const today = new Date().toISOString().split('T')[0];

    if (!window.confirm(
      `이 고정지출을 해지하시겠습니까?\n\n` +
      `📅 구독 기간: ${startDateStr} ~ ${today}\n\n` +
      `- 오늘 이후로는 자동 등록되지 않습니다\n` +
      `- 이전 기록은 유지됩니다\n` +
      `- 목록에서 숨겨집니다`
    )) {
      return;
    }

    try {
      const updatedExpense = {
        ...fixedExpense,
        endDate: today,
        isUnlimited: false
      };

      const isFamilyMode = familyInfo && familyInfo.id;

      if (isFamilyMode) {
        await updateFamilyFixedExpense(familyInfo.id, id, updatedExpense);
      } else {
        await updateFixedExpense(currentUser.firebaseId, id, updatedExpense);
      }

      alert('✅ 고정지출이 해지되었습니다.');
      console.log('✅ 고정지출 해지 성공:', id, `(${isFamilyMode ? '가족 공유' : '개인'} 모드)`);
    } catch (error) {
      console.error('❌ 고정지출 해지 실패:', error);
      alert('❌ 해지 중 오류가 발생했습니다.');
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
      baseDate: '',
      paymentMethod: '',
      memo: '',
      isActive: true,
      isUnlimited: true,
      startDate: '',
      endDate: ''
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
      baseDate: fixed.baseDate || '',
      paymentMethod: fixed.paymentMethod || '',
      memo: fixed.memo || '',
      isActive: fixed.isActive,
      isUnlimited: fixed.isUnlimited !== false, // 기본값 true
      startDate: fixed.startDate || '',
      endDate: fixed.endDate || ''
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
      baseDate: '',
      paymentMethod: '',
      memo: '',
      isActive: true,
      isUnlimited: true,
      startDate: '',
      endDate: ''
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
    handleCancelFixedExpense,
    handleToggleActive,
    getFixedExpensesForDay,
    startAddFixed,
    startEditFixed,
    resetFixedForm,
    handleSubmitFixed
  };
};
