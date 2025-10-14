# 🚀 배포 가이드

## Firebase Hosting 배포 방법

### 1단계: Firebase 로그인

```bash
firebase login
```

브라우저가 열리면 Google 계정으로 로그인합니다.

### 2단계: 프로덕션 빌드

```bash
npm run build
```

이 명령은 `build/` 폴더에 최적화된 프로덕션 버전을 생성합니다.

### 3단계: Firebase에 배포

```bash
firebase deploy --only hosting
```

배포가 완료되면 다음과 같은 URL을 받게 됩니다:
- **Hosting URL**: `https://woodal-budget.web.app`
- **Alternative URL**: `https://woodal-budget.firebaseapp.com`

### 4단계: 배포 확인

배포 후 URL로 접속하여 정상 작동하는지 확인합니다.

---

## 📝 배포 전 체크리스트

### 필수 사항
- [ ] `.env` 파일의 Firebase 설정이 올바른지 확인
- [ ] Firebase Console에서 Authentication이 활성화되어 있는지 확인
- [ ] Firebase Console에서 Realtime Database가 생성되어 있는지 확인
- [ ] Google 로그인이 Firebase Console에서 활성화되어 있는지 확인

### 보안 설정 (중요!)
- [ ] **Firebase Security Rules 설정** (아래 참조)
- [ ] Authentication 승인된 도메인에 배포 URL 추가
  - Firebase Console > Authentication > Settings > Authorized domains
  - `woodal-budget.web.app` 추가
  - `woodal-budget.firebaseapp.com` 추가

---

## 🔒 Firebase Security Rules (필수!)

### Realtime Database Rules

Firebase Console > Realtime Database > Rules에서 다음 규칙을 설정하세요:

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    },
    "families": {
      "$familyId": {
        ".read": "data.child('members').child(auth.uid).exists()",
        ".write": "data.child('members').child(auth.uid).exists()"
      }
    },
    "invitations": {
      ".read": "auth != null",
      ".indexOn": ["inviteeEmail", "status"],
      "$invitationId": {
        ".write": "auth != null"
      }
    }
  }
}
```

**설명**:
- **users**: 사용자는 자신의 데이터만 읽기/쓰기 가능
- **families**: 가족 멤버만 해당 가족 데이터 접근 가능
- **invitations**: 로그인한 사용자만 초대 데이터 접근 가능

⚠️ **주의**: 현재 테스트 모드 규칙은 **30일 후 만료**되므로 반드시 위 규칙으로 변경하세요!

---

## 🌐 배포 후 접속 방법

### 방법 1: 직접 URL 접속
배포 완료 후 받은 URL로 직접 접속:
- `https://woodal-budget.web.app`

### 방법 2: QR 코드 생성
모바일에서 쉽게 접속하려면:
1. URL을 QR 코드 생성 사이트에 입력
2. QR 코드를 스마트폰으로 스캔

### 방법 3: PWA 설치 (모바일)
1. 브라우저에서 URL 접속
2. 브라우저 메뉴 > "홈 화면에 추가"
3. 앱처럼 사용 가능

---

## 🔄 업데이트 배포

코드를 수정한 후 다시 배포하려면:

```bash
# 1. 빌드
npm run build

# 2. 배포
firebase deploy --only hosting
```

몇 초 안에 새 버전이 배포됩니다.

---

## 📊 배포 관리

### 배포 히스토리 확인
```bash
firebase hosting:channel:list
```

### 이전 버전으로 롤백
Firebase Console > Hosting > Release history에서 이전 버전으로 롤백 가능

### 배포 삭제
```bash
firebase hosting:disable
```

---

## 💰 비용

Firebase Hosting 무료 플랜 (Spark):
- **저장 용량**: 10GB
- **전송량**: 360MB/day (약 10.8GB/month)
- **SSL 인증서**: 무료 자동 제공
- **커스텀 도메인**: 지원

가계부 앱은 작은 규모이므로 **무료 플랜으로 충분**합니다.

---

## 🎯 다음 단계 (선택 사항)

### 1. 커스텀 도메인 연결
Firebase Console > Hosting > Add custom domain

### 2. Google Analytics 연동
사용자 통계 추적

### 3. PWA 기능 추가
오프라인 지원 및 앱 설치 기능

### 4. 성능 모니터링
Firebase Performance Monitoring 활성화

---

## 🆘 문제 해결

### 빌드 실패
```bash
# node_modules 재설치
rm -rf node_modules package-lock.json
npm install
npm run build
```

### 배포 실패
```bash
# Firebase 로그인 재시도
firebase logout
firebase login
firebase deploy --only hosting
```

### 환경 변수 오류
`.env` 파일이 제대로 설정되어 있는지 확인:
- 모든 `REACT_APP_` 접두사가 있는지
- Firebase 설정 값이 올바른지

---

**작성일**: 2025-10-14
**작성자**: Claude Code
**프로젝트**: 우영달림 가계부
