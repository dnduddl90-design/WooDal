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
import { STORAGE_KEYS, loadFromStorage, getTodayDateString } from '../utils';

const createNormalizedFixedExpense = (formData, fallbackDate) => ({
  ...formData,
  amount: parseInt(formData.amount, 10) || 0,
  autoRegisterDate: parseInt(formData.autoRegisterDate, 10) || 1,
  monthlyIncrease: parseInt(formData.monthlyIncrease, 10) || 0,
  startDate: formData.startDate || fallbackDate,
  baseDate: (parseInt(formData.monthlyIncrease, 10) || 0) !== 0
    ? (formData.baseDate || formData.startDate || fallbackDate)
    : '',
  endDate: formData.isUnlimited ? '' : formData.endDate || ''
});

/**
 * 고정지출 관리 커스텀 훅 (Firebase 사용)
 * SRP: 고정지출 상태 및 CRUD 로직만 담당
 * 가족 모드와 개인 모드를 모두 지원
 */
export const useFixedExpenses = (currentUser, familyInfo, options = {}) => {
  const { onActivity } = options;
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
    // 실시간 리스너 설정 (가족 모드 or 개인 모드)
    const listenerFunction = isFamilyMode ? onFamilyFixedExpensesChange : onFixedExpensesChange;

    const unsubscribe = listenerFunction(
      dataId,
      (firebaseFixed) => {
        // Firebase 데이터가 비어있으면 LocalStorage에서 마이그레이션
        if (firebaseFixed.length === 0) {
          const localFixed = loadFromStorage(STORAGE_KEYS.FIXED_EXPENSES, []);
          if (localFixed.length > 0 && !isFamilyMode) { // 개인 모드일 때만 마이그레이션
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
      const today = getTodayDateString();
      const normalizedFixed = createNormalizedFixedExpense(formData, today);
      const duplicateFixed = fixedExpenses.find((fixed) =>
        fixed.name?.trim() === normalizedFixed.name?.trim() &&
        fixed.category === normalizedFixed.category &&
        Number(fixed.amount) === Number(normalizedFixed.amount) &&
        Number(fixed.autoRegisterDate) === Number(normalizedFixed.autoRegisterDate) &&
        fixed.isActive
      );

      if (duplicateFixed && !window.confirm(`'${normalizedFixed.name}'와 거의 같은 고정지출이 이미 있습니다. 그래도 추가하시겠습니까?`)) {
        return;
      }

      const newFixed = {
        id: Date.now(),
        ...normalizedFixed
      };

      const isFamilyMode = familyInfo && familyInfo.id;

      // 가족 모드 or 개인 모드로 저장
      if (isFamilyMode) {
        await saveFamilyFixedExpense(familyInfo.id, newFixed);
        await onActivity?.({
          type: 'fixed_expense_added',
          title: '고정지출 추가',
          description: `${normalizedFixed.name} ${normalizedFixed.amount.toLocaleString()}원을 추가했습니다.`,
          metadata: {
            name: normalizedFixed.name,
            amount: normalizedFixed.amount,
            category: normalizedFixed.category
          }
        });
      } else {
        await saveFixedExpense(currentUser.firebaseId, newFixed);
      }

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
      const today = getTodayDateString();
      const updatedFixed = {
        ...existingFixed,
        ...createNormalizedFixedExpense(formData, today)
      };

      const isFamilyMode = familyInfo && familyInfo.id;

      // 가족 모드 or 개인 모드로 업데이트
      if (isFamilyMode) {
        await updateFamilyFixedExpense(familyInfo.id, id, updatedFixed);
        await onActivity?.({
          type: 'fixed_expense_updated',
          title: '고정지출 수정',
          description: `${updatedFixed.name} 고정지출을 수정했습니다.`,
          metadata: {
            name: updatedFixed.name,
            amount: updatedFixed.amount,
            category: updatedFixed.category
          }
        });
      } else {
        await updateFixedExpense(currentUser.firebaseId, id, updatedFixed);
      }

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
      const existingFixed = fixedExpenses.find((fixed) => fixed.id === id);

      // 가족 모드 or 개인 모드로 삭제
      if (isFamilyMode) {
        await deleteFamilyFixedExpense(familyInfo.id, id);
        if (existingFixed) {
          await onActivity?.({
            type: 'fixed_expense_deleted',
            title: '고정지출 삭제',
            description: `${existingFixed.name} 고정지출을 삭제했습니다.`,
            metadata: {
              name: existingFixed.name,
              amount: existingFixed.amount,
              category: existingFixed.category
            }
          });
        }
      } else {
        await deleteFixedExpense(currentUser.firebaseId, id);
      }

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
        await onActivity?.({
          type: 'fixed_expense_toggled',
          title: updatedFixed.isActive ? '고정지출 활성화' : '고정지출 일시중지',
          description: `${existingFixed.name} 상태를 ${updatedFixed.isActive ? '활성' : '일시중지'}로 변경했습니다.`,
          metadata: {
            name: existingFixed.name,
            isActive: updatedFixed.isActive
          }
        });
      } else {
        await updateFixedExpense(currentUser.firebaseId, id, updatedFixed);
      }

      // 실시간 리스너가 자동으로 UI 업데이트
    } catch (error) {
      console.error('❌ 고정지출 토글 실패:', error);
      alert('고정지출 상태 변경에 실패했습니다.');
    }
  };

  const handleDeactivateMultiple = async (ids) => {
    try {
      const targets = fixedExpenses.filter((fixed) => ids.includes(fixed.id) && fixed.isActive);

      if (targets.length === 0) {
        return;
      }

      const isFamilyMode = familyInfo && familyInfo.id;
      const updateFunction = isFamilyMode ? updateFamilyFixedExpense : updateFixedExpense;
      const dataId = isFamilyMode ? familyInfo.id : currentUser.firebaseId;

      await Promise.all(
        targets.map((fixed) =>
          updateFunction(dataId, fixed.id, {
            ...fixed,
            isActive: false
          })
        )
      );

      if (isFamilyMode) {
        await onActivity?.({
          type: 'fixed_expense_bulk_paused',
          title: '고정지출 일괄 비활성화',
          description: `${targets.length}개의 고정지출을 한 번에 비활성화했습니다.`,
          metadata: {
            count: targets.length
          }
        });
      }

      alert(`${targets.length}개의 고정지출을 비활성화했습니다.`);
    } catch (error) {
      console.error('❌ 고정지출 일괄 비활성화 실패:', error);
      alert('고정지출 일괄 비활성화에 실패했습니다.');
    }
  };

  /**
   * 고정지출 해지 (endDate를 오늘로 설정)
   */
  const handleCancelFixedExpense = async (id) => {
    const fixedExpense = fixedExpenses.find(f => f.id === id);
    if (!fixedExpense) return;

    const startDateStr = fixedExpense.startDate || '알 수 없음';
    const today = getTodayDateString();

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
        await onActivity?.({
          type: 'fixed_expense_cancelled',
          title: '고정지출 해지',
          description: `${fixedExpense.name} 고정지출을 해지했습니다.`,
          metadata: {
            name: fixedExpense.name,
            endDate: today
          }
        });
      } else {
        await updateFixedExpense(currentUser.firebaseId, id, updatedExpense);
      }

      alert('✅ 고정지출이 해지되었습니다.');
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
    handleDeactivateMultiple,
    getFixedExpensesForDay,
    startAddFixed,
    startEditFixed,
    resetFixedForm,
    handleSubmitFixed
  };
};
