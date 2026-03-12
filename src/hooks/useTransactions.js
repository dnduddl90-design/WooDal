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
import { STORAGE_KEYS, loadFromStorage, getTodayDateString, parseDateString } from '../utils';

/**
 * 거래 내역 관리 커스텀 훅 (Firebase 사용)
 * SRP: 거래 내역 상태 및 CRUD 로직만 담당
 * 가족 모드와 개인 모드를 모두 지원
 */
export const useTransactions = (currentUser, familyInfo, options = {}) => {
  const { onActivity } = options;
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
    date: getTodayDateString(),
    isPocketMoney: false
  });

  /**
   * LocalStorage 데이터를 Firebase로 마이그레이션
   */
  const migrateLocalTransactions = async (localTransactions) => {
    try {
      for (const transaction of localTransactions) {
        await saveTransaction(currentUser.firebaseId, transaction);
      }
      setLoading(false);
    } catch (error) {
      console.error('❌ 마이그레이션 실패:', error);
      // 실패 시 로컬 데이터 사용
      setTransactions(localTransactions);
      setLoading(false);
    }
  };

  /**
   * user1/user2를 Firebase UID로 자동 변환 (백그라운드)
   */
  const migrateUserIds = async (dataId, transactions, isFamilyMode) => {
    try {
      const updateFunction = isFamilyMode ? updateFamilyTransaction : updateTransaction;

      for (const transaction of transactions) {
        if (transaction.userId === 'user1' || transaction.userId === 'user2') {
          const updatedTransaction = { ...transaction, userId: currentUser.firebaseId };
          await updateFunction(dataId, transaction.id, updatedTransaction);
        }
      }
    } catch (error) {
      console.error('❌ userId 변환 실패:', error);
    }
  };

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
    // 실시간 리스너 설정 (가족 모드 or 개인 모드)
    const listenerFunction = isFamilyMode ? onFamilyTransactionsChange : onTransactionsChange;

    const unsubscribe = listenerFunction(
      dataId,
      (firebaseTransactions) => {
        // Firebase 데이터가 비어있으면 LocalStorage에서 마이그레이션
        if (firebaseTransactions.length === 0) {
          const localTransactions = loadFromStorage(STORAGE_KEYS.TRANSACTIONS, []);
          if (localTransactions.length > 0 && !isFamilyMode) { // 개인 모드일 때만 마이그레이션
            migrateLocalTransactions(localTransactions);
          } else {
            setTransactions([]);
            setLoading(false);
          }
        } else {
          // user1/user2를 현재 사용자 ID로 자동 변환
          const migratedTransactions = firebaseTransactions.map(t => {
            if (t.userId === 'user1' || t.userId === 'user2') {
              return { ...t, userId: currentUser.firebaseId };
            }
            return t;
          });

          // userId가 변경된 거래가 있으면 Firebase 업데이트 (비동기, 백그라운드)
          const needUpdate = firebaseTransactions.some(t => t.userId === 'user1' || t.userId === 'user2');
          if (needUpdate) {
            migrateUserIds(dataId, firebaseTransactions, isFamilyMode);
          }

          setTransactions(migratedTransactions);
          setLoading(false);
        }
      }
    );

    // 클린업: 컴포넌트 언마운트 시 리스너 제거
    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.firebaseId, familyInfo?.id]);

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
      if (isFamilyMode) {
        await saveFamilyTransaction(familyInfo.id, newTransaction);
        await onActivity?.({
          type: 'transaction_added',
          title: '거래 추가',
          description: `${newTransaction.type === 'income' ? '수입' : '지출'} ${newTransaction.amount.toLocaleString()}원을 추가했습니다.`,
          metadata: {
            amount: newTransaction.amount,
            category: newTransaction.category,
            date: newTransaction.date
          }
        });
      } else {
        await saveTransaction(currentUser.firebaseId, newTransaction);
      }

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
        await onActivity?.({
          type: 'transaction_updated',
          title: '거래 수정',
          description: `${updatedTransaction.type === 'income' ? '수입' : '지출'} ${updatedTransaction.amount.toLocaleString()}원 내역을 수정했습니다.`,
          metadata: {
            amount: updatedTransaction.amount,
            category: updatedTransaction.category,
            date: updatedTransaction.date
          }
        });
      } else {
        await updateTransaction(currentUser.firebaseId, id, updatedTransaction);
      }

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
      const existingTransaction = transactions.find((transaction) => transaction.id === id);

      // 가족 모드 or 개인 모드로 삭제
      if (isFamilyMode) {
        await deleteFamilyTransaction(familyInfo.id, id);
        if (existingTransaction) {
          await onActivity?.({
            type: 'transaction_deleted',
            title: '거래 삭제',
            description: `${existingTransaction.type === 'income' ? '수입' : '지출'} ${existingTransaction.amount.toLocaleString()}원 내역을 삭제했습니다.`,
            metadata: {
              amount: existingTransaction.amount,
              category: existingTransaction.category,
              date: existingTransaction.date
            }
          });
        }
      } else {
        await deleteTransaction(currentUser.firebaseId, id);
      }

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
      date: transaction.date,
      isPocketMoney: transaction.isPocketMoney || false
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
      date: date || getTodayDateString(),
      isPocketMoney: false
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
      date: getTodayDateString(),
      isPocketMoney: false
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
   * 용돈 정산 완료 처리
   * 현재 월의 모든 용돈 사용 거래의 isPocketMoney를 false로 변경
   */
  const settlePocketMoney = async (year, month) => {
    try {
      const isFamilyMode = familyInfo && familyInfo.id;
      const dataId = isFamilyMode ? familyInfo.id : currentUser.firebaseId;

      // 해당 월의 용돈 사용 거래 찾기
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0);

      const pocketMoneyTransactions = transactions.filter(t => {
        const transactionDate = parseDateString(t.date);
        return transactionDate >= startDate &&
               transactionDate <= endDate &&
               t.type === 'expense' &&
               t.isPocketMoney === true;
      });

      // 각 거래의 isPocketMoney를 false로 업데이트
      const updateFunction = isFamilyMode ? updateFamilyTransaction : updateTransaction;

      for (const transaction of pocketMoneyTransactions) {
        const updatedTransaction = { ...transaction, isPocketMoney: false };
        await updateFunction(dataId, transaction.id, updatedTransaction);
      }
      if (isFamilyMode && pocketMoneyTransactions.length > 0) {
        await onActivity?.({
          type: 'pocket_money_settled',
          title: '용돈 정산 완료',
          description: `${year}년 ${month + 1}월 용돈 사용 ${pocketMoneyTransactions.length}건을 정산했습니다.`,
          metadata: {
            year,
            month: month + 1,
            count: pocketMoneyTransactions.length
          }
        });
      }
      alert(`✅ ${pocketMoneyTransactions.length}건의 용돈 사용 내역 정산이 완료되었습니다!`);

      return true;
    } catch (error) {
      console.error('❌ 정산 처리 실패:', error);
      alert('정산 처리에 실패했습니다.');
      return false;
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
    settlePocketMoney
  };
};
