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

// ==================== 가족 (Family) - 공유 가계부 ====================

/**
 * 가족 데이터 경로 생성 헬퍼
 * @param {string} familyId - 가족 ID
 * @param {string} path - 데이터 경로
 */
const getFamilyPath = (familyId, path) => `families/${familyId}/${path}`;

/**
 * 새 가족 생성
 * @param {string} creatorId - 생성자 사용자 ID
 * @param {string} creatorName - 생성자 이름
 * @param {string} familyName - 가족 이름
 */
export const createFamily = async (creatorId, creatorName, familyName) => {
  const familiesRef = ref(database, 'families');
  const newFamilyRef = push(familiesRef);
  const familyId = newFamilyRef.key;

  const familyData = {
    id: familyId,
    name: familyName,
    createdAt: new Date().toISOString(),
    createdBy: creatorId,
    members: {
      [creatorId]: {
        userId: creatorId,
        name: creatorName,
        role: 'admin',
        joinedAt: new Date().toISOString()
      }
    }
  };

  await set(newFamilyRef, familyData);

  // 사용자 프로필에 가족 ID 저장
  await set(ref(database, `users/${creatorId}/familyId`), familyId);

  return familyId;
};

/**
 * 가족 정보 가져오기
 * @param {string} familyId - 가족 ID
 */
export const getFamily = async (familyId) => {
  const familyRef = ref(database, `families/${familyId}`);
  const snapshot = await get(familyRef);
  return snapshot.exists() ? snapshot.val() : null;
};

/**
 * 사용자의 가족 ID 가져오기
 * @param {string} userId - 사용자 ID
 */
export const getUserFamilyId = async (userId) => {
  const familyIdRef = ref(database, `users/${userId}/familyId`);
  const snapshot = await get(familyIdRef);
  return snapshot.exists() ? snapshot.val() : null;
};

/**
 * 가족에 멤버 추가
 * @param {string} familyId - 가족 ID
 * @param {string} userId - 추가할 사용자 ID
 * @param {string} userName - 사용자 이름
 */
export const addFamilyMember = async (familyId, userId, userName) => {
  const memberData = {
    userId,
    name: userName,
    role: 'member',
    joinedAt: new Date().toISOString()
  };

  await set(ref(database, `families/${familyId}/members/${userId}`), memberData);
  await set(ref(database, `users/${userId}/familyId`), familyId);
};

/**
 * 가족 실시간 리스너
 * @param {string} familyId - 가족 ID
 * @param {Function} callback - 데이터 변경 시 호출될 함수
 */
export const onFamilyChange = (familyId, callback) => {
  const familyRef = ref(database, `families/${familyId}`);
  return onValue(familyRef, (snapshot) => {
    callback(snapshot.exists() ? snapshot.val() : null);
  });
};

// ==================== 가족 공유 데이터 ====================

/**
 * 가족 거래 내역 실시간 리스너
 * @param {string} familyId - 가족 ID
 * @param {Function} callback - 데이터 변경 시 호출될 함수
 */
export const onFamilyTransactionsChange = (familyId, callback) => {
  const transactionsRef = ref(database, getFamilyPath(familyId, 'transactions'));
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

/**
 * 가족 거래 내역 저장
 * @param {string} familyId - 가족 ID
 * @param {Object} transaction - 거래 객체
 */
export const saveFamilyTransaction = async (familyId, transaction) => {
  const transactionsRef = ref(database, getFamilyPath(familyId, 'transactions'));
  const newTransactionRef = push(transactionsRef);
  await set(newTransactionRef, transaction);
  return newTransactionRef.key;
};

/**
 * 가족 거래 내역 수정
 * @param {string} familyId - 가족 ID
 * @param {string} transactionId - 거래 ID
 * @param {Object} updates - 수정할 데이터
 */
export const updateFamilyTransaction = async (familyId, transactionId, updates) => {
  const transactionRef = ref(
    database,
    getFamilyPath(familyId, `transactions/${transactionId}`)
  );
  await update(transactionRef, updates);
};

/**
 * 가족 거래 내역 삭제
 * @param {string} familyId - 가족 ID
 * @param {string} transactionId - 거래 ID
 */
export const deleteFamilyTransaction = async (familyId, transactionId) => {
  const transactionRef = ref(
    database,
    getFamilyPath(familyId, `transactions/${transactionId}`)
  );
  await remove(transactionRef);
};

/**
 * 가족 고정지출 실시간 리스너
 * @param {string} familyId - 가족 ID
 * @param {Function} callback - 데이터 변경 시 호출될 함수
 */
export const onFamilyFixedExpensesChange = (familyId, callback) => {
  const fixedExpensesRef = ref(database, getFamilyPath(familyId, 'fixedExpenses'));
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

/**
 * 가족 고정지출 저장
 * @param {string} familyId - 가족 ID
 * @param {Object} expense - 고정지출 객체
 */
export const saveFamilyFixedExpense = async (familyId, expense) => {
  const fixedExpensesRef = ref(database, getFamilyPath(familyId, 'fixedExpenses'));
  const newExpenseRef = push(fixedExpensesRef);
  await set(newExpenseRef, expense);
  return newExpenseRef.key;
};

/**
 * 가족 고정지출 수정
 * @param {string} familyId - 가족 ID
 * @param {string} expenseId - 고정지출 ID
 * @param {Object} updates - 수정할 데이터
 */
export const updateFamilyFixedExpense = async (familyId, expenseId, updates) => {
  const expenseRef = ref(
    database,
    getFamilyPath(familyId, `fixedExpenses/${expenseId}`)
  );
  await update(expenseRef, updates);
};

/**
 * 가족 고정지출 삭제
 * @param {string} familyId - 가족 ID
 * @param {string} expenseId - 고정지출 ID
 */
export const deleteFamilyFixedExpense = async (familyId, expenseId) => {
  const expenseRef = ref(
    database,
    getFamilyPath(familyId, `fixedExpenses/${expenseId}`)
  );
  await remove(expenseRef);
};

// ==================== 가족 초대 시스템 ====================

/**
 * 가족 초대 생성
 * @param {string} familyId - 가족 ID
 * @param {string} familyName - 가족 이름
 * @param {string} inviterEmail - 초대한 사람 이메일
 * @param {string} inviterName - 초대한 사람 이름
 * @param {string} inviteeEmail - 초대받는 사람 이메일
 */
export const createInvitation = async (familyId, familyName, inviterEmail, inviterName, inviteeEmail) => {
  const invitationsRef = ref(database, 'invitations');
  const newInvitationRef = push(invitationsRef);
  const invitationId = newInvitationRef.key;

  const invitationData = {
    id: invitationId,
    familyId,
    familyName,
    inviterEmail,
    inviterName,
    inviteeEmail: inviteeEmail.toLowerCase(), // 이메일은 소문자로 저장
    status: 'pending', // pending, accepted, rejected
    createdAt: new Date().toISOString()
  };

  await set(newInvitationRef, invitationData);
  return invitationId;
};

/**
 * 사용자의 대기 중인 초대 가져오기
 * @param {string} userEmail - 사용자 이메일
 */
export const getPendingInvitations = async (userEmail) => {
  const invitationsRef = ref(database, 'invitations');
  const snapshot = await get(invitationsRef);

  if (!snapshot.exists()) {
    return [];
  }

  const data = snapshot.val();
  const normalizedEmail = userEmail.toLowerCase();

  // 해당 이메일의 대기 중인 초대만 필터링
  return Object.entries(data)
    .filter(([_, invitation]) =>
      invitation.inviteeEmail === normalizedEmail &&
      invitation.status === 'pending'
    )
    .map(([id, invitation]) => ({
      ...invitation,
      id
    }));
};

/**
 * 초대 실시간 리스너
 * @param {string} userEmail - 사용자 이메일
 * @param {Function} callback - 데이터 변경 시 호출될 함수
 */
export const onInvitationsChange = (userEmail, callback) => {
  const invitationsRef = ref(database, 'invitations');
  const normalizedEmail = userEmail.toLowerCase();

  return onValue(invitationsRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      const pendingInvitations = Object.entries(data)
        .filter(([_, invitation]) =>
          invitation.inviteeEmail === normalizedEmail &&
          invitation.status === 'pending'
        )
        .map(([id, invitation]) => ({
          ...invitation,
          id
        }));
      callback(pendingInvitations);
    } else {
      callback([]);
    }
  });
};

/**
 * 초대 수락
 * @param {string} invitationId - 초대 ID
 * @param {string} userId - 사용자 Firebase UID
 * @param {string} userName - 사용자 이름
 */
export const acceptInvitation = async (invitationId, userId, userName) => {
  // 1. 초대 정보 가져오기
  const invitationRef = ref(database, `invitations/${invitationId}`);
  const snapshot = await get(invitationRef);

  if (!snapshot.exists()) {
    throw new Error('초대를 찾을 수 없습니다.');
  }

  const invitation = snapshot.val();

  // 2. 가족에 멤버 추가
  await addFamilyMember(invitation.familyId, userId, userName);

  // 3. 초대 상태를 'accepted'로 변경
  await update(invitationRef, {
    status: 'accepted',
    acceptedAt: new Date().toISOString(),
    acceptedBy: userId
  });

  return invitation.familyId;
};

/**
 * 초대 거절
 * @param {string} invitationId - 초대 ID
 */
export const rejectInvitation = async (invitationId) => {
  const invitationRef = ref(database, `invitations/${invitationId}`);
  await update(invitationRef, {
    status: 'rejected',
    rejectedAt: new Date().toISOString()
  });
};

// ==================== 아바타 (Avatar) ====================

/**
 * 사용자 아바타 저장
 * @param {string} userId - 사용자 ID
 * @param {string} avatar - 아바타 이모지
 */
export const saveUserAvatar = async (userId, avatar) => {
  const avatarRef = ref(database, `users/${userId}/avatar`);
  await set(avatarRef, avatar);
};

/**
 * 사용자 아바타 가져오기
 * @param {string} userId - 사용자 ID
 */
export const getUserAvatar = async (userId) => {
  const avatarRef = ref(database, `users/${userId}/avatar`);
  const snapshot = await get(avatarRef);
  return snapshot.exists() ? snapshot.val() : null;
};

/**
 * 아바타 실시간 리스너
 * @param {string} userId - 사용자 ID
 * @param {Function} callback - 데이터 변경 시 호출될 함수
 */
export const onAvatarChange = (userId, callback) => {
  const avatarRef = ref(database, `users/${userId}/avatar`);
  return onValue(avatarRef, (snapshot) => {
    callback(snapshot.exists() ? snapshot.val() : null);
  });
};
