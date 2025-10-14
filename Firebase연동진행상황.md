# 🔥 Firebase 연동 진행 상황

**작성일**: 2025-10-14
**진행 시간**: 약 2시간
**현재 상태**: Phase 1 완료 (Google 인증 완료)

---

## ✅ 완료된 작업 (Phase 1: Firebase Authentication)

### 1. Firebase 프로젝트 설정 ✅
- **Firebase Console**: https://console.firebase.google.com/
- **프로젝트 이름**: woodal-budget
- **위치**: asia-southeast1 (싱가포르)
- **웹 앱 등록**: WooDal Web App

### 2. Firebase 서비스 활성화 ✅
- ✅ **Authentication**: Google 로그인 활성화
- ✅ **Realtime Database**: 생성 완료 (테스트 모드)
- ⏳ **Database Rules**: 아직 프로덕션 규칙 미설정

### 3. Firebase SDK 설치 ✅
```bash
npm install firebase
```
- **firebase 패키지**: 64개 패키지 추가됨
- **버전**: 최신 버전 자동 설치

### 4. 환경 변수 설정 (.env) ✅
파일 위치: `D:\1.Project\test\WooDal\.env`

```env
REACT_APP_FIREBASE_API_KEY=AIzaSyCQwEqrP0pW7nqs2zTvWuSe31B0ZNsVLGg
REACT_APP_FIREBASE_AUTH_DOMAIN=woodal-budget.firebaseapp.com
REACT_APP_FIREBASE_DATABASE_URL=https://woodal-budget-default-rtdb.asia-southeast1.firebasedatabase.app
REACT_APP_FIREBASE_PROJECT_ID=woodal-budget
REACT_APP_FIREBASE_STORAGE_BUCKET=woodal-budget.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=1040216797513
REACT_APP_FIREBASE_APP_ID=1:1040216797513:web:432663bcfa041a7858aa98
```

⚠️ **보안**: `.gitignore`에 `.env` 추가됨 (Git에 업로드 안 됨)

### 5. Firebase 설정 파일 생성 ✅

#### `src/firebase/config.js` - Firebase 초기화
```javascript
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const database = getDatabase(app);
```

#### `src/firebase/authService.js` - 인증 서비스
- `signInWithGoogle()` - Google 팝업 로그인
- `logout()` - 로그아웃
- `onAuthChange()` - 인증 상태 리스너
- `getCurrentUser()` - 현재 사용자 정보

#### `src/firebase/databaseService.js` - 데이터베이스 서비스
- 거래 내역 CRUD 함수들 (아직 사용 안 함)
- 고정지출 CRUD 함수들 (아직 사용 안 함)
- 설정 CRUD 함수들 (아직 사용 안 함)
- 실시간 리스너 함수들 (아직 사용 안 함)

### 6. Google 로그인 구현 ✅

#### `src/pages/LoginPage.js` 수정
**이전**: 비밀번호 입력 방식
```javascript
if (password === '1234') {
  onLogin();
}
```

**수정 후**: Google 로그인
```javascript
const handleGoogleLogin = async () => {
  const user = await signInWithGoogle();
  onLogin(user);
};
```

#### `src/hooks/useAuth.js` 수정
**주요 변경사항**:
- Firebase 인증 상태 리스너 추가
- 자동 로그인 기능 (세션 유지)
- 사용자 ID를 `user1`로 고정 (기존 LocalStorage 호환)
- Firebase UID는 `firebaseId`로 별도 저장

```javascript
const user = {
  id: 'user1', // 기존 데이터 호환
  firebaseId: firebaseUser.uid,
  email: firebaseUser.email,
  name: displayName, // 이메일 @ 앞부분 또는 Google 이름
  avatar: '👨',
  role: 'admin'
};
```

#### `src/App.js` 수정
- 로딩 상태 추가 (`authLoading`)
- 로딩 중 스피너 화면 표시

### 7. 문제 해결 이력 ✅

#### 문제 1: 환경 변수 로드 안 됨
**증상**: `auth/invalid-api-key` 에러
**원인**: `.env` 파일 변경 후 서버 재시작 안 함
**해결**:
```bash
npx kill-port 3000
npm start
```

#### 문제 2: 사용자 ID 불일치
**증상**: 기존 거래 내역이 안 보임
**원인**: Firebase UID와 LocalStorage의 `user1` ID 불일치
**해결**: 사용자 ID를 `user1`로 고정, Firebase UID는 별도 저장

#### 문제 3: 헤더에 이메일 주소 표시
**증상**: "example@gmail.com" 전체가 표시됨
**원인**: Google displayName이 없을 때 이메일 전체 사용
**해결**: `@` 앞부분만 추출하여 표시

---

## 🎉 현재 작동 상태

### ✅ 정상 작동하는 기능
1. **Google 로그인** - 팝업으로 로그인 가능
2. **자동 로그인** - 한 번 로그인하면 세션 유지
3. **로그아웃** - 오른쪽 위 버튼으로 로그아웃
4. **기존 데이터 유지** - LocalStorage 데이터 그대로 사용
5. **모든 가계부 기능** - 거래 추가/수정/삭제, 통계, 검색 등

### 🔄 현재 데이터 흐름
```
로그인 → Firebase Auth (Google) → 사용자 인증
데이터 → LocalStorage (아직 Firebase 아님)
```

### 📊 데이터 저장 위치
- ✅ **인증 정보**: Firebase Authentication
- ❌ **거래 내역**: LocalStorage (→ Firebase 마이그레이션 필요)
- ❌ **고정지출**: LocalStorage (→ Firebase 마이그레이션 필요)
- ❌ **설정**: LocalStorage (→ Firebase 마이그레이션 필요)

---

## 🚀 다음 단계 (Phase 2: Firebase Realtime Database 연동)

### 1. 데이터 마이그레이션 계획

#### Step 1: Firebase Database 구조 설계
```
woodal-budget/
├── users/
│   ├── {firebaseUserId}/
│   │   ├── profile/
│   │   │   ├── name: "우영"
│   │   │   ├── avatar: "👨"
│   │   │   └── role: "admin"
│   │   ├── transactions/
│   │   │   ├── {transactionId}/
│   │   │   │   ├── type: "expense"
│   │   │   │   ├── category: "food"
│   │   │   │   ├── amount: 15000
│   │   │   │   ├── date: "2025-10-14"
│   │   │   │   └── memo: "점심"
│   │   ├── fixedExpenses/
│   │   │   ├── {expenseId}/
│   │   │   │   ├── name: "월세"
│   │   │   │   ├── amount: 500000
│   │   │   │   └── isActive: true
│   │   └── settings/
│   │       ├── theme: "default"
│   │       ├── budget: {...}
│   │       └── notifications: {...}
```

#### Step 2: LocalStorage → Firebase 마이그레이션 로직
1. 로그인 시 Firebase에 사용자 데이터 없으면
2. LocalStorage 데이터 읽기
3. Firebase로 업로드
4. LocalStorage 데이터 삭제 (선택)

#### Step 3: 실시간 동기화 구현
1. `onTransactionsChange()` 리스너 추가
2. 데이터 변경 시 자동 업데이트
3. 두 사용자가 동시에 접속 가능

### 2. 예상 작업 시간
- **데이터베이스 연동**: 1-2시간
- **실시간 동기화**: 30분
- **테스트 및 디버깅**: 30분
- **총 예상 시간**: 2-3시간

### 3. 필요한 작업 목록
- [ ] `useTransactions` 훅을 Firebase 사용하도록 수정
- [ ] `useFixedExpenses` 훅을 Firebase 사용하도록 수정
- [ ] LocalStorage → Firebase 마이그레이션 함수 작성
- [ ] 실시간 리스너 추가
- [ ] 로딩 상태 추가 (데이터 가져오는 동안)
- [ ] 에러 처리 추가
- [ ] 공유 가계부 기능 (두 사용자 연결)

---

## 📝 알아두면 좋은 것들

### Firebase Realtime Database 특징
- **NoSQL 데이터베이스**: JSON 트리 구조
- **실시간 동기화**: 데이터 변경 즉시 반영
- **오프라인 지원**: 인터넷 끊겨도 작동 (재연결 시 동기화)
- **보안 규칙**: 데이터 접근 권한 설정 가능

### 실시간 동기화 동작 방식
```javascript
// 데이터 변경 리스너
onValue(ref(database, 'users/uid/transactions'), (snapshot) => {
  const data = snapshot.val();
  setTransactions(data); // 자동으로 UI 업데이트!
});
```

### 보안 규칙 예시 (나중에 적용)
```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    }
  }
}
```

---

## ⚠️ 주의사항

### 개발 중
- 현재 Firebase Database는 **테스트 모드** (30일간 모든 사람 읽기/쓰기 가능)
- 프로덕션 배포 전 **보안 규칙 설정** 필수!

### 데이터 백업
- LocalStorage → Firebase 마이그레이션 전에 **데이터 백업** 권장
- 설정 > 데이터 내보내기 → JSON 파일 저장

### 비용
- Firebase 무료 플랜 (Spark)
  - Realtime Database: 1GB 저장, 10GB/월 다운로드
  - 가계부 앱 수준에서는 충분함
  - 초과 시에만 과금

---

## 📚 참고 링크

- **Firebase Console**: https://console.firebase.google.com/
- **Firebase 문서**: https://firebase.google.com/docs
- **Realtime Database 가이드**: https://firebase.google.com/docs/database
- **보안 규칙**: https://firebase.google.com/docs/database/security

---

**작성자**: Claude Code
**최종 수정**: 2025-10-14
**다음 작업**: Firebase Realtime Database 연동
