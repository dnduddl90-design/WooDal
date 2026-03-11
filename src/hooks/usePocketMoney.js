import { useState, useEffect } from 'react';
import {
  savePocketMoneyTransaction,
  updatePocketMoneyTransaction,
  deletePocketMoneyTransaction,
  onPocketMoneyTransactionsChange,
  getPocketMoneyBudget,
  setPocketMoneyBudget
} from '../firebase/databaseService';

/**
 * 개인 용돈 관리 커스텀 훅 (Firebase 사용)
 * SRP: 용돈 예산 및 거래 내역 상태 관리만 담당
 * 개인 모드 전용 (가족 공유 아님)
 */
export const usePocketMoney = (currentUser) => {
  const [transactions, setTransactions] = useState([]);
  const [monthlyBudget, setMonthlyBudget] = useState(300000); // 기본 30만원
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState(null);

  const setStatus = (type, text) => {
    setStatusMessage({ type, text });
  };

  /**
   * Firebase에서 용돈 거래 내역 및 예산 로드
   */
  useEffect(() => {
    if (!currentUser?.firebaseId) {
      setLoading(false);
      return;
    }

    // 예산 로드
    getPocketMoneyBudget(currentUser.firebaseId).then(budget => {
      if (budget !== null) {
        setMonthlyBudget(budget);
      }
    });

    // 거래 내역 실시간 리스너
    const unsubscribe = onPocketMoneyTransactionsChange(
      currentUser.firebaseId,
      (firebaseTransactions) => {
        setTransactions(firebaseTransactions);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser?.firebaseId]);

  /**
   * 예산 업데이트
   */
  const updateBudget = async (newBudget) => {
    try {
      await setPocketMoneyBudget(currentUser.firebaseId, newBudget);
      setMonthlyBudget(newBudget);
      setStatus('success', '잔액 기준이 저장되었습니다.');
      return true;
    } catch (error) {
      console.error('❌ 예산 업데이트 실패:', error);
      setStatus('error', '잔액 기준 저장에 실패했습니다.');
      return false;
    }
  };

  /**
   * 잔고 추가 (기존 잔고에 더하기)
   */
  const addBalance = async (amount) => {
    try {
      const newBalance = monthlyBudget + amount;
      await setPocketMoneyBudget(currentUser.firebaseId, newBalance);
      setMonthlyBudget(newBalance);
      setStatus('success', amount >= 0 ? '잔액을 충전했습니다.' : '잔액을 차감했습니다.');
      return true;
    } catch (error) {
      console.error('❌ 잔고 추가 실패:', error);
      setStatus('error', '잔액 변경에 실패했습니다.');
      return false;
    }
  };

  /**
   * 거래 추가
   */
  const addTransaction = async (transactionData) => {
    try {
      const newTransaction = {
        ...transactionData,
        id: Date.now(),
        createdAt: new Date().toISOString()
      };

      await savePocketMoneyTransaction(currentUser.firebaseId, newTransaction);
      setStatus('success', '용돈 사용 내역을 추가했습니다.');
      return true;
    } catch (error) {
      console.error('❌ 거래 추가 실패:', error);
      setStatus('error', '용돈 사용 내역 추가에 실패했습니다.');
      return false;
    }
  };

  /**
   * 거래 수정
   */
  const updateTransaction = async (id, transactionData) => {
    try {
      await updatePocketMoneyTransaction(currentUser.firebaseId, id, transactionData);
      setStatus('success', '용돈 사용 내역을 수정했습니다.');
      return true;
    } catch (error) {
      console.error('❌ 거래 수정 실패:', error);
      setStatus('error', '용돈 사용 내역 수정에 실패했습니다.');
      return false;
    }
  };

  /**
   * 거래 삭제
   */
  const deleteTransaction = async (id) => {
    try {
      await deletePocketMoneyTransaction(currentUser.firebaseId, id);
      setStatus('success', '용돈 사용 내역을 삭제했습니다.');
      return true;
    } catch (error) {
      console.error('❌ 거래 삭제 실패:', error);
      setStatus('error', '용돈 사용 내역 삭제에 실패했습니다.');
      return false;
    }
  };

  return {
    transactions,
    monthlyBudget,
    loading,
    statusMessage,
    setStatusMessage,
    updateBudget,
    addBalance,
    addTransaction,
    updateTransaction,
    deleteTransaction
  };
};
