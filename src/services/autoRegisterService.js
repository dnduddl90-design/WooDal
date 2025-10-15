/**
 * 고정지출 자동 등록 서비스
 *
 * 매월 지정일에 고정지출을 자동으로 거래로 등록하는 서비스
 *
 * 작동 방식:
 * 1. 로그인 시 또는 페이지 로드 시 체크
 * 2. 마지막 체크 날짜를 LocalStorage에 저장
 * 3. 오늘 날짜가 고정지출의 autoRegisterDate와 일치하면 자동 등록
 * 4. 이미 등록된 경우 중복 등록 방지
 *
 * 학습 포인트:
 * - 날짜 비교 로직
 * - LocalStorage를 활용한 마지막 체크 기록
 * - 중복 등록 방지 (같은 날 같은 고정지출 ID)
 * - 월 증가액 계산 로직
 */

import { formatDate } from '../utils/dateUtils';

const LAST_CHECK_KEY = 'lastAutoRegisterCheck';

/**
 * 마지막 자동 등록 체크 날짜 가져오기
 */
export const getLastCheckDate = () => {
  const lastCheck = localStorage.getItem(LAST_CHECK_KEY);
  return lastCheck || null;
};

/**
 * 마지막 자동 등록 체크 날짜 저장
 */
export const setLastCheckDate = (date) => {
  localStorage.setItem(LAST_CHECK_KEY, date);
};

/**
 * 오늘이 고정지출 자동 등록일인지 확인
 */
export const shouldAutoRegister = (fixedExpense, today = new Date()) => {
  const todayDate = today.getDate(); // 1-31
  return fixedExpense.autoRegisterDate === todayDate && fixedExpense.isActive;
};

/**
 * 이미 오늘 등록된 고정지출인지 확인
 * @param {Array} transactions - 모든 거래 내역
 * @param {Number} fixedExpenseId - 고정지출 ID
 * @param {String} todayStr - 오늘 날짜 문자열 (YYYY-MM-DD)
 */
export const isAlreadyRegisteredToday = (transactions, fixedExpenseId, todayStr) => {
  return transactions.some(t =>
    t.date === todayStr &&
    t.fixedExpenseId === fixedExpenseId
  );
};

/**
 * 고정지출에서 거래 데이터 생성
 * @param {Object} fixedExpense - 고정지출 객체
 * @param {String} userId - 사용자 ID
 * @param {String} date - 등록 날짜 (YYYY-MM-DD), 기본값은 오늘
 * @param {Number} monthsSinceStart - 시작 이후 경과 개월 수 (월 증가액 계산용)
 */
export const createTransactionFromFixed = (fixedExpense, userId, date = null, monthsSinceStart = 0) => {
  // 날짜가 지정되지 않으면 오늘 날짜 사용
  const targetDate = date || formatDate(new Date());

  // 월 증가액 계산
  const monthlyIncrease = fixedExpense.monthlyIncrease || 0;
  const increasedAmount = fixedExpense.amount + (monthlyIncrease * monthsSinceStart);

  return {
    id: Date.now() + Math.random(), // 고유 ID 보장
    type: 'expense',
    category: fixedExpense.category,
    subcategory: fixedExpense.subcategory || '',
    amount: increasedAmount,
    paymentMethod: fixedExpense.paymentMethod || '',
    memo: `[자동등록] ${fixedExpense.name}${fixedExpense.memo ? ` - ${fixedExpense.memo}` : ''}`,
    date: targetDate,
    userId: userId,
    fixedExpenseId: fixedExpense.id, // 중복 등록 방지를 위한 ID
    isAutoRegistered: true // 자동 등록 표시
  };
};

/**
 * 고정지출 자동 등록 메인 함수
 * @param {Array} fixedExpenses - 고정지출 목록
 * @param {Array} transactions - 거래 내역 목록
 * @param {String} userId - 사용자 ID
 * @param {Function} onRegister - 거래 등록 콜백 함수
 * @returns {Number} 등록된 거래 개수
 */
export const autoRegisterFixedExpenses = async (
  fixedExpenses,
  transactions,
  userId,
  onRegister
) => {
  const today = new Date();
  const todayStr = formatDate(today);
  const lastCheck = getLastCheckDate();

  // 오늘 이미 체크했으면 스킵
  if (lastCheck === todayStr) {
    console.log('✅ 오늘 이미 자동 등록 체크 완료');
    return 0;
  }

  console.log('🔄 고정지출 자동 등록 체크 시작...');

  let registeredCount = 0;

  for (const fixed of fixedExpenses) {
    // 1. 오늘이 자동 등록일인지 확인
    if (!shouldAutoRegister(fixed, today)) {
      continue;
    }

    // 2. 이미 오늘 등록되었는지 확인
    if (isAlreadyRegisteredToday(transactions, fixed.id, todayStr)) {
      console.log(`⏭️ '${fixed.name}' - 이미 오늘 등록됨`);
      continue;
    }

    // 3. 거래 생성 (오늘 날짜로 등록)
    const transaction = createTransactionFromFixed(fixed, userId, todayStr, 0);

    // 4. 거래 등록
    try {
      await onRegister(transaction, todayStr);
      registeredCount++;
      console.log(`✅ '${fixed.name}' 자동 등록 완료`);
    } catch (error) {
      console.error(`❌ '${fixed.name}' 자동 등록 실패:`, error);
    }
  }

  // 마지막 체크 날짜 업데이트
  setLastCheckDate(todayStr);

  if (registeredCount > 0) {
    console.log(`🎉 총 ${registeredCount}건의 고정지출이 자동 등록되었습니다!`);
  } else {
    console.log('✅ 오늘 자동 등록할 고정지출 없음');
  }

  return registeredCount;
};

/**
 * 수동으로 특정 고정지출 등록 (테스트용)
 * @param {Object} fixedExpense - 고정지출 객체
 * @param {String} userId - 사용자 ID
 * @param {Function} onRegister - 등록 함수
 * @param {String} date - 등록 날짜 (YYYY-MM-DD), 기본값은 오늘
 */
export const manualRegisterFixedExpense = async (
  fixedExpense,
  userId,
  onRegister,
  date = null
) => {
  const targetDate = date || formatDate(new Date());
  const transaction = createTransactionFromFixed(fixedExpense, userId, targetDate, 0);
  await onRegister(transaction, targetDate);
  console.log(`✅ '${fixedExpense.name}' 수동 등록 완료`);
};
