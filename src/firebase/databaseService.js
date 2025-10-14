/**
 * Firebase Realtime Database 서비스
 *
 * 거래 내역, 고정지출, 설정 등의 데이터를 Firebase에 저장/조회합니다.
 */

import {
  ref,
  set,
  get,
  update,
  remove,
  onValue,
  push
} from 'firebase/database';
import { database } from './config';

/**
 * 데이터 경로 생성 헬퍼
 * @param {string} userId - 사용자 ID
 * @param {string} path - 데이터 경로
 */
const getUserPath = (userId, path) => `users/${userId}/${path}`;

// ==================== 거래 내역 (Transactions) ====================

/**
 * 모든 거래 내역 가져오기
 * @param {string} userId - 사용자 ID
 */
export const getTransactions = async (userId) => {
  const transactionsRef = ref(database, getUserPath(userId, 'transactions'));
  const snapshot = await get(transactionsRef);

  if (snapshot.exists()) {
    const data = snapshot.val();
    // 객체를 배열로 변환 (id를 키로 사용)
    return Object.entries(data).map(([id, transaction]) => ({
      ...transaction,
      id
    }));
  }
  return [];
};

/**
 * 거래 내역 저장
 * @param {string} userId - 사용자 ID
 * @param {Object} transaction - 거래 객체
 */
export const saveTransaction = async (userId, transaction) => {
  const transactionsRef = ref(database, getUserPath(userId, 'transactions'));
  const newTransactionRef = push(transactionsRef);
  await set(newTransactionRef, transaction);
  return newTransactionRef.key; // 생성된 ID 반환
};

/**
 * 거래 내역 수정
 * @param {string} userId - 사용자 ID
 * @param {string} transactionId - 거래 ID
 * @param {Object} updates - 수정할 데이터
 */
export const updateTransaction = async (userId, transactionId, updates) => {
  const transactionRef = ref(
    database,
    getUserPath(userId, `transactions/${transactionId}`)
  );
  await update(transactionRef, updates);
};

/**
 * 거래 내역 삭제
 * @param {string} userId - 사용자 ID
 * @param {string} transactionId - 거래 ID
 */
export const deleteTransaction = async (userId, transactionId) => {
  const transactionRef = ref(
    database,
    getUserPath(userId, `transactions/${transactionId}`)
  );
  await remove(transactionRef);
};

/**
 * 거래 내역 실시간 리스너
 * @param {string} userId - 사용자 ID
 * @param {Function} callback - 데이터 변경 시 호출될 함수
 */
export const onTransactionsChange = (userId, callback) => {
  const transactionsRef = ref(database, getUserPath(userId, 'transactions'));
  return onValue(transactionsRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      const transactions = Object.entries(data).map(([id, transaction]) => ({
        ...transaction,
        id
      }));
      callback(transactions);
    } else {
      callback([]);
    }
  });
};

// ==================== 고정지출 (Fixed Expenses) ====================

/**
 * 모든 고정지출 가져오기
 * @param {string} userId - 사용자 ID
 */
export const getFixedExpenses = async (userId) => {
  const fixedExpensesRef = ref(database, getUserPath(userId, 'fixedExpenses'));
  const snapshot = await get(fixedExpensesRef);

  if (snapshot.exists()) {
    const data = snapshot.val();
    return Object.entries(data).map(([id, expense]) => ({
      ...expense,
      id
    }));
  }
  return [];
};

/**
 * 고정지출 저장
 * @param {string} userId - 사용자 ID
 * @param {Object} expense - 고정지출 객체
 */
export const saveFixedExpense = async (userId, expense) => {
  const fixedExpensesRef = ref(database, getUserPath(userId, 'fixedExpenses'));
  const newExpenseRef = push(fixedExpensesRef);
  await set(newExpenseRef, expense);
  return newExpenseRef.key;
};

/**
 * 고정지출 수정
 * @param {string} userId - 사용자 ID
 * @param {string} expenseId - 고정지출 ID
 * @param {Object} updates - 수정할 데이터
 */
export const updateFixedExpense = async (userId, expenseId, updates) => {
  const expenseRef = ref(
    database,
    getUserPath(userId, `fixedExpenses/${expenseId}`)
  );
  await update(expenseRef, updates);
};

/**
 * 고정지출 삭제
 * @param {string} userId - 사용자 ID
 * @param {string} expenseId - 고정지출 ID
 */
export const deleteFixedExpense = async (userId, expenseId) => {
  const expenseRef = ref(
    database,
    getUserPath(userId, `fixedExpenses/${expenseId}`)
  );
  await remove(expenseRef);
};

/**
 * 고정지출 실시간 리스너
 * @param {string} userId - 사용자 ID
 * @param {Function} callback - 데이터 변경 시 호출될 함수
 */
export const onFixedExpensesChange = (userId, callback) => {
  const fixedExpensesRef = ref(database, getUserPath(userId, 'fixedExpenses'));
  return onValue(fixedExpensesRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      const expenses = Object.entries(data).map(([id, expense]) => ({
        ...expense,
        id
      }));
      callback(expenses);
    } else {
      callback([]);
    }
  });
};

// ==================== 설정 (Settings) ====================

/**
 * 설정 가져오기
 * @param {string} userId - 사용자 ID
 */
export const getSettings = async (userId) => {
  const settingsRef = ref(database, getUserPath(userId, 'settings'));
  const snapshot = await get(settingsRef);
  return snapshot.exists() ? snapshot.val() : null;
};

/**
 * 설정 저장
 * @param {string} userId - 사용자 ID
 * @param {Object} settings - 설정 객체
 */
export const saveSettings = async (userId, settings) => {
  const settingsRef = ref(database, getUserPath(userId, 'settings'));
  await set(settingsRef, settings);
};

/**
 * 설정 실시간 리스너
 * @param {string} userId - 사용자 ID
 * @param {Function} callback - 데이터 변경 시 호출될 함수
 */
export const onSettingsChange = (userId, callback) => {
  const settingsRef = ref(database, getUserPath(userId, 'settings'));
  return onValue(settingsRef, (snapshot) => {
    callback(snapshot.exists() ? snapshot.val() : null);
  });
};
