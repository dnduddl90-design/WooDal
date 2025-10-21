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

  /**
   * Firebase에서 용돈 거래 내역 및 예산 로드
   */
  useEffect(() => {
    if (!currentUser?.firebaseId) {
      setLoading(false);
      return;
    }

    console.log('📥 Firebase에서 용돈 데이터 로드 중...');

    // 예산 로드
    getPocketMoneyBudget(currentUser.firebaseId).then(budget => {
      if (budget !== null) {
        setMonthlyBudget(budget);
        console.log('✅ 예산 로드:', budget);
      }
    });

    // 거래 내역 실시간 리스너
    const unsubscribe = onPocketMoneyTransactionsChange(
      currentUser.firebaseId,
      (firebaseTransactions) => {
        console.log(`✅ 용돈 거래 ${firebaseTransactions.length}건 로드됨`);
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
      console.log('✅ 예산 업데이트 성공:', newBudget);
      return true;
    } catch (error) {
      console.error('❌ 예산 업데이트 실패:', error);
      alert('예산 업데이트에 실패했습니다.');
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
      console.log('✅ 잔고 추가 성공:', amount, '→ 새 잔고:', newBalance);
      return true;
    } catch (error) {
      console.error('❌ 잔고 추가 실패:', error);
      alert('잔고 추가에 실패했습니다.');
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
      console.log('✅ 용돈 거래 추가 성공');
      return true;
    } catch (error) {
      console.error('❌ 거래 추가 실패:', error);
      alert('거래 추가에 실패했습니다.');
      return false;
    }
  };

  /**
   * 거래 수정
   */
  const updateTransaction = async (id, transactionData) => {
    try {
      await updatePocketMoneyTransaction(currentUser.firebaseId, id, transactionData);
      console.log('✅ 용돈 거래 수정 성공');
      return true;
    } catch (error) {
      console.error('❌ 거래 수정 실패:', error);
      alert('거래 수정에 실패했습니다.');
      return false;
    }
  };

  /**
   * 거래 삭제
   */
  const deleteTransaction = async (id) => {
    try {
      await deletePocketMoneyTransaction(currentUser.firebaseId, id);
      console.log('✅ 용돈 거래 삭제 성공');
      return true;
    } catch (error) {
      console.error('❌ 거래 삭제 실패:', error);
      alert('거래 삭제에 실패했습니다.');
      return false;
    }
  };

  return {
    transactions,
    monthlyBudget,
    loading,
    updateBudget,
    addBalance,
    addTransaction,
    updateTransaction,
    deleteTransaction
  };
};
