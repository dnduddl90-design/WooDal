import { useState, useEffect } from 'react';
import { TransactionService } from '../services/transactionService';
import {
  saveTransaction,
  updateTransaction,
  deleteTransaction,
  onTransactionsChange,
  saveFamilyTransaction,
  updateFamilyTransaction,
  deleteFamilyTransaction,
  onFamilyTransactionsChange
} from '../firebase/databaseService';
import { STORAGE_KEYS, loadFromStorage } from '../utils';

/**
 * 거래 내역 관리 커스텀 훅 (Firebase 사용)
 * SRP: 거래 내역 상태 및 CRUD 로직만 담당
 * 가족 모드와 개인 모드를 모두 지원
 */
export const useTransactions = (currentUser, familyInfo) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [transactionForm, setTransactionForm] = useState({
    type: 'expense',
    category: '',
    subcategory: '',
    amount: '',
    paymentMethod: '',
    memo: '',
    date: new Date().toISOString().split('T')[0]
  });

  /**
   * Firebase에서 데이터 로드 및 실시간 리스너 설정
   * 가족 모드: families/{familyId}/transactions
   * 개인 모드: users/{userId}/transactions
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

    console.log(`📥 Firebase에서 거래 내역 로드 중... (${mode} 모드)`);

    // 실시간 리스너 설정 (가족 모드 or 개인 모드)
    const listenerFunction = isFamilyMode ? onFamilyTransactionsChange : onTransactionsChange;

    const unsubscribe = listenerFunction(
      dataId,
      (firebaseTransactions) => {
        console.log(`✅ 거래 내역 ${firebaseTransactions.length}건 로드됨 (${mode} 모드)`);

        // Firebase 데이터가 비어있으면 LocalStorage에서 마이그레이션
        if (firebaseTransactions.length === 0) {
          const localTransactions = loadFromStorage(STORAGE_KEYS.TRANSACTIONS, []);
          if (localTransactions.length > 0 && !isFamilyMode) { // 개인 모드일 때만 마이그레이션
            console.log(`🔄 LocalStorage에서 ${localTransactions.length}건 마이그레이션 시작...`);
            migrateLocalTransactions(localTransactions);
          } else {
            setTransactions([]);
            setLoading(false);
          }
        } else {
          setTransactions(firebaseTransactions);
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
  const migrateLocalTransactions = async (localTransactions) => {
    try {
      for (const transaction of localTransactions) {
        await saveTransaction(currentUser.firebaseId, transaction);
      }
      console.log('✅ 마이그레이션 완료!');
      setLoading(false);
    } catch (error) {
      console.error('❌ 마이그레이션 실패:', error);
      // 실패 시 로컬 데이터 사용
      setTransactions(localTransactions);
      setLoading(false);
    }
  };

  /**
   * 거래 추가 (가족 모드/개인 모드 자동 선택)
   */
  const handleAddTransaction = async (formData) => {
    try {
      const newTransaction = TransactionService.createTransaction(
        formData,
        currentUser?.id
      );

      const isFamilyMode = familyInfo && familyInfo.id;

      // 가족 모드 or 개인 모드로 저장
      const savedId = isFamilyMode
        ? await saveFamilyTransaction(familyInfo.id, newTransaction)
        : await saveTransaction(currentUser.firebaseId, newTransaction);

      console.log('✅ 거래 추가 성공:', savedId, `(${isFamilyMode ? '가족 공유' : '개인'} 모드)`);
      // 실시간 리스너가 자동으로 UI 업데이트
    } catch (error) {
      console.error('❌ 거래 추가 실패:', error);
      alert('거래 추가에 실패했습니다.');
    }
  };

  /**
   * 거래 수정 (가족 모드/개인 모드 자동 선택)
   */
  const handleUpdateTransaction = async (id, formData) => {
    try {
      const existingTransaction = transactions.find(t => t.id === id);
      const updatedTransaction = TransactionService.updateTransaction(
        existingTransaction,
        formData
      );

      const isFamilyMode = familyInfo && familyInfo.id;

      // 가족 모드 or 개인 모드로 업데이트
      if (isFamilyMode) {
        await updateFamilyTransaction(familyInfo.id, id, updatedTransaction);
      } else {
        await updateTransaction(currentUser.firebaseId, id, updatedTransaction);
      }

      console.log('✅ 거래 수정 성공:', id, `(${isFamilyMode ? '가족 공유' : '개인'} 모드)`);
      // 실시간 리스너가 자동으로 UI 업데이트
    } catch (error) {
      console.error('❌ 거래 수정 실패:', error);
      alert('거래 수정에 실패했습니다.');
    }
  };

  /**
   * 거래 삭제 (가족 모드/개인 모드 자동 선택)
   */
  const handleDeleteTransaction = async (id) => {
    try {
      const isFamilyMode = familyInfo && familyInfo.id;

      // 가족 모드 or 개인 모드로 삭제
      if (isFamilyMode) {
        await deleteFamilyTransaction(familyInfo.id, id);
      } else {
        await deleteTransaction(currentUser.firebaseId, id);
      }

      console.log('✅ 거래 삭제 성공:', id, `(${isFamilyMode ? '가족 공유' : '개인'} 모드)`);
      // 실시간 리스너가 자동으로 UI 업데이트
    } catch (error) {
      console.error('❌ 거래 삭제 실패:', error);
      alert('거래 삭제에 실패했습니다.');
    }
  };

  /**
   * 수정 모드 시작
   */
  const startEditTransaction = (transaction) => {
    setIsEditMode(true);
    setEditingTransaction(transaction);
    setTransactionForm({
      type: transaction.type,
      category: transaction.category,
      subcategory: transaction.subcategory || '',
      amount: transaction.amount.toString(),
      paymentMethod: transaction.paymentMethod || '',
      memo: transaction.memo || '',
      date: transaction.date
    });
    setShowAddTransaction(true);
  };

  /**
   * 추가 모드 시작
   */
  const startAddTransaction = (date = null) => {
    setIsEditMode(false);
    setEditingTransaction(null);
    setTransactionForm({
      type: 'expense',
      category: '',
      subcategory: '',
      amount: '',
      paymentMethod: '',
      memo: '',
      date: date || new Date().toISOString().split('T')[0]
    });
    setShowAddTransaction(true);
  };

  /**
   * 폼 리셋
   */
  const resetTransactionForm = () => {
    setTransactionForm({
      type: 'expense',
      category: '',
      subcategory: '',
      amount: '',
      paymentMethod: '',
      memo: '',
      date: new Date().toISOString().split('T')[0]
    });
    setIsEditMode(false);
    setEditingTransaction(null);
  };

  /**
   * 거래 제출
   */
  const handleSubmitTransaction = () => {
    if (transactionForm.category && transactionForm.amount) {
      if (isEditMode && editingTransaction) {
        handleUpdateTransaction(editingTransaction.id, transactionForm);
      } else {
        handleAddTransaction(transactionForm);
      }
      resetTransactionForm();
      setShowAddTransaction(false);
      return true;
    }
    return false;
  };

  /**
   * 특정 날짜의 거래 가져오기
   */
  const getDayTransactions = (day, month, year) => {
    return TransactionService.filterByDate(transactions, day, month, year);
  };

  /**
   * 고정지출을 실제 거래로 등록 (가족 모드/개인 모드 자동 선택)
   * @param {Object} transaction - 이미 생성된 거래 객체 (createTransactionFromFixed에서 생성)
   * @param {String} date - 등록 날짜 (사용하지 않음, 이미 transaction에 포함)
   */
  const registerFixedExpense = async (transaction, date) => {
    try {
      const isFamilyMode = familyInfo && familyInfo.id;

      // 가족 모드 or 개인 모드로 저장
      if (isFamilyMode) {
        await saveFamilyTransaction(familyInfo.id, transaction);
      } else {
        await saveTransaction(currentUser.firebaseId, transaction);
      }

      console.log('✅ 고정지출 자동 등록 성공', `(${isFamilyMode ? '가족 공유' : '개인'} 모드)`);
      return transaction;
    } catch (error) {
      console.error('❌ 고정지출 등록 실패:', error);
      throw error;
    }
  };

  return {
    transactions,
    loading,
    setTransactions,
    showAddTransaction,
    setShowAddTransaction,
    isEditMode,
    editingTransaction,
    transactionForm,
    setTransactionForm,
    handleAddTransaction,
    handleUpdateTransaction,
    handleDeleteTransaction,
    startEditTransaction,
    startAddTransaction,
    resetTransactionForm,
    handleSubmitTransaction,
    getDayTransactions,
    registerFixedExpense
  };
};
