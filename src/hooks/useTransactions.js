import { useState, useEffect } from 'react';
import { TransactionService } from '../services/transactionService';
import {
  saveTransaction,
  updateTransaction,
  deleteTransaction,
  onTransactionsChange
} from '../firebase/databaseService';
import { STORAGE_KEYS, loadFromStorage } from '../utils';

/**
 * 거래 내역 관리 커스텀 훅 (Firebase 사용)
 * SRP: 거래 내역 상태 및 CRUD 로직만 담당
 */
export const useTransactions = (currentUser) => {
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
   */
  useEffect(() => {
    if (!currentUser?.firebaseId) {
      setLoading(false);
      return;
    }

    console.log('📥 Firebase에서 거래 내역 로드 중...');

    // 실시간 리스너 설정
    const unsubscribe = onTransactionsChange(
      currentUser.firebaseId,
      (firebaseTransactions) => {
        console.log(`✅ 거래 내역 ${firebaseTransactions.length}건 로드됨`);

        // Firebase 데이터가 비어있으면 LocalStorage에서 마이그레이션
        if (firebaseTransactions.length === 0) {
          const localTransactions = loadFromStorage(STORAGE_KEYS.TRANSACTIONS, []);
          if (localTransactions.length > 0) {
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
  }, [currentUser?.firebaseId]);

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
   * 거래 추가
   */
  const handleAddTransaction = async (formData) => {
    try {
      const newTransaction = TransactionService.createTransaction(
        formData,
        currentUser?.id
      );

      // Firebase에 저장
      const savedId = await saveTransaction(
        currentUser.firebaseId,
        newTransaction
      );

      console.log('✅ 거래 추가 성공:', savedId);
      // 실시간 리스너가 자동으로 UI 업데이트
    } catch (error) {
      console.error('❌ 거래 추가 실패:', error);
      alert('거래 추가에 실패했습니다.');
    }
  };

  /**
   * 거래 수정
   */
  const handleUpdateTransaction = async (id, formData) => {
    try {
      const existingTransaction = transactions.find(t => t.id === id);
      const updatedTransaction = TransactionService.updateTransaction(
        existingTransaction,
        formData
      );

      // Firebase에 업데이트
      await updateTransaction(
        currentUser.firebaseId,
        id,
        updatedTransaction
      );

      console.log('✅ 거래 수정 성공:', id);
      // 실시간 리스너가 자동으로 UI 업데이트
    } catch (error) {
      console.error('❌ 거래 수정 실패:', error);
      alert('거래 수정에 실패했습니다.');
    }
  };

  /**
   * 거래 삭제
   */
  const handleDeleteTransaction = async (id) => {
    try {
      // Firebase에서 삭제
      await deleteTransaction(currentUser.firebaseId, id);
      console.log('✅ 거래 삭제 성공:', id);
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
   * 고정지출을 실제 거래로 등록
   */
  const registerFixedExpense = async (fixedExpense, date) => {
    const newTransaction = {
      id: Date.now() + Math.random(), // 고유 ID 보장
      type: 'expense',
      category: fixedExpense.category,
      subcategory: `고정지출: ${fixedExpense.name}`,
      amount: fixedExpense.amount,
      paymentMethod: fixedExpense.paymentMethod || '',
      memo: `[자동등록] ${fixedExpense.memo || ''}`.trim(),
      date: date,
      userId: currentUser?.id || 'user1',
      isFromFixedExpense: true,
      fixedExpenseId: fixedExpense.id
    };

    try {
      await saveTransaction(currentUser.firebaseId, newTransaction);
      console.log('✅ 고정지출 자동 등록 성공');
      return newTransaction;
    } catch (error) {
      console.error('❌ 고정지출 등록 실패:', error);
      return null;
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
