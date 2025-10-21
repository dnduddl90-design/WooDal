/**
 * 기존 user1/user2 데이터를 Firebase UID로 마이그레이션하는 스크립트
 *
 * 사용법:
 * 1. 브라우저 콘솔에서 실행
 * 2. 로그인된 상태에서 실행
 */

async function migrateUserData() {
  console.log('🔄 데이터 마이그레이션 시작...');

  // Firebase 가져오기
  const { ref, get, set, update, database } = await import('./src/firebase/config.js');

  // 현재 로그인된 사용자 정보 가져오기
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (!currentUser || !currentUser.firebaseId) {
    console.error('❌ 로그인된 사용자 정보를 찾을 수 없습니다.');
    return;
  }

  const firebaseId = currentUser.firebaseId;
  console.log(`👤 현재 사용자 Firebase ID: ${firebaseId}`);

  try {
    // 1. 가족 정보 확인
    const familyIdSnapshot = await get(ref(database, `users/${firebaseId}/familyId`));
    const familyId = familyIdSnapshot.exists() ? familyIdSnapshot.val() : null;

    if (familyId) {
      console.log(`👨‍👩‍👧‍👦 가족 모드: ${familyId}`);

      // 가족 공유 데이터의 userId를 업데이트
      const familyTransactionsRef = ref(database, `families/${familyId}/transactions`);
      const familyTransactionsSnapshot = await get(familyTransactionsRef);

      if (familyTransactionsSnapshot.exists()) {
        const transactions = familyTransactionsSnapshot.val();
        let updateCount = 0;

        for (const [transactionId, transaction] of Object.entries(transactions)) {
          if (transaction.userId === 'user1') {
            // user1을 현재 사용자의 Firebase UID로 변경
            await update(ref(database, `families/${familyId}/transactions/${transactionId}`), {
              userId: firebaseId
            });
            updateCount++;
            console.log(`✅ 거래 ${transactionId} 업데이트 완료 (user1 → ${firebaseId})`);
          }
        }

        console.log(`✅ 가족 공유 거래 ${updateCount}건 마이그레이션 완료`);
      }

      // 가족 공유 고정지출 업데이트
      const familyFixedExpensesRef = ref(database, `families/${familyId}/fixedExpenses`);
      const familyFixedExpensesSnapshot = await get(familyFixedExpensesRef);

      if (familyFixedExpensesSnapshot.exists()) {
        const fixedExpenses = familyFixedExpensesSnapshot.val();
        let updateCount = 0;

        for (const [expenseId, expense] of Object.entries(fixedExpenses)) {
          if (expense.userId === 'user1') {
            await update(ref(database, `families/${familyId}/fixedExpenses/${expenseId}`), {
              userId: firebaseId
            });
            updateCount++;
            console.log(`✅ 고정지출 ${expenseId} 업데이트 완료 (user1 → ${firebaseId})`);
          }
        }

        console.log(`✅ 가족 공유 고정지출 ${updateCount}건 마이그레이션 완료`);
      }
    } else {
      console.log('👤 개인 모드');

      // 개인 데이터는 이미 users/{firebaseId}에 저장되어 있으므로
      // 거래 내역의 userId만 업데이트
      const personalTransactionsRef = ref(database, `users/${firebaseId}/transactions`);
      const personalTransactionsSnapshot = await get(personalTransactionsRef);

      if (personalTransactionsSnapshot.exists()) {
        const transactions = personalTransactionsSnapshot.val();
        let updateCount = 0;

        for (const [transactionId, transaction] of Object.entries(transactions)) {
          if (transaction.userId === 'user1') {
            await update(ref(database, `users/${firebaseId}/transactions/${transactionId}`), {
              userId: firebaseId
            });
            updateCount++;
            console.log(`✅ 거래 ${transactionId} 업데이트 완료 (user1 → ${firebaseId})`);
          }
        }

        console.log(`✅ 개인 거래 ${updateCount}건 마이그레이션 완료`);
      }
    }

    console.log('🎉 데이터 마이그레이션 완료!');
    console.log('새로고침하면 업데이트된 데이터를 확인할 수 있습니다.');

  } catch (error) {
    console.error('❌ 마이그레이션 실패:', error);
  }
}

// 실행
migrateUserData();
