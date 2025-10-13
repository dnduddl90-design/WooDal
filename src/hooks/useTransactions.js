import { useState, useEffect } from 'react';
import { TransactionService } from '../services/transactionService';
import { STORAGE_KEYS, loadFromStorage, saveToStorage } from '../utils';

/**
 * 거래 내역 관리 커스텀 훅
 * SRP: 거래 내역 상태 및 CRUD 로직만 담당
 */
export const useTransactions = (currentUser) => {
  // localStorage에서 초기 데이터 불러오기
  const [transactions, setTransactions] = useState(() => {
    return loadFromStorage(STORAGE_KEYS.TRANSACTIONS, []);
  });
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
   * 거래 추가
   */
  const handleAddTransaction = (formData) => {
    const newTransaction = TransactionService.createTransaction(
      formData,
      currentUser?.id
    );
    setTransactions(prev => [...prev, newTransaction]);
  };

  /**
   * 거래 수정
   */
  const handleUpdateTransaction = (id, formData) => {
    setTransactions(prev =>
      prev.map(t =>
        t.id === id
          ? TransactionService.updateTransaction(t, formData)
          : t
      )
    );
  };

  /**
   * 거래 삭제
   */
  const handleDeleteTransaction = (id) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
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

  // transactions가 변경될 때마다 localStorage에 저장
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.TRANSACTIONS, transactions);
  }, [transactions]);

  return {
    transactions,
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
    getDayTransactions
  };
};
