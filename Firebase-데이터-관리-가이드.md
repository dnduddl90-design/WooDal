# 📊 Firebase 데이터 관리 가이드

**작성일**: 2025-10-20
**프로젝트**: 우영달림 가계부 (woodal-budget)

---

## 목차

1. [Firebase 데이터 저장 방식](#firebase-데이터-저장-방식)
2. [무료 요금제 한도](#무료-요금제-한도)
3. [데이터 영구성](#데이터-영구성)
4. [사용량 모니터링](#사용량-모니터링)
5. [백업 전략](#백업-전략)
6. [요금제 비교](#요금제-비교)
7. [FAQ](#faq)

---

## Firebase 데이터 저장 방식

### 1️⃣ 데이터는 영구적으로 저장됩니다

Firebase Realtime Database는 **클라우드 기반 실시간 NoSQL 데이터베이스**입니다.

**핵심 특징**:
- ✅ 삭제하지 않는 한 **영구적으로 보관**
- ✅ 30일, 60일, 1년이 지나도 데이터 유지
- ✅ 무료 요금제에서도 동일
- ✅ 자동 백업 없음 (수동 백업 필요)

### 2️⃣ 데이터 구조

현재 프로젝트의 Firebase 데이터베이스 구조:

```
woodal-budget-default-rtdb/
├── families/
│   └── {familyId}/
│       ├── transactions/        # 가족 공유 거래
│       │   └── {transactionId}
│       └── fixedExpenses/       # 가족 공유 고정지출
│           └── {fixedExpenseId}
├── users/
│   └── {userId}/
│       ├── transactions/        # 개인 거래 (개인 모드)
│       │   └── {transactionId}
│       └── fixedExpenses/       # 개인 고정지출
│           └── {fixedExpenseId}
└── invitations/                 # 가족 초대
    └── {invitationId}
```

---

## 무료 요금제 한도

### Spark Plan (무료)

현재 프로젝트가 사용 중인 무료 요금제의 한도:

#### Firebase Realtime Database
| 항목 | 한도 | 설명 |
|------|------|------|
| **저장 용량** | 1GB | 데이터베이스 전체 크기 |
| **다운로드** | 10GB/월 | 데이터 읽기 전송량 |
| **동시 연결** | 100개 | 동시 접속 사용자 수 |

#### Firebase Hosting
| 항목 | 한도 | 설명 |
|------|------|------|
| **저장 용량** | 10GB | 호스팅 파일 크기 |
| **전송량** | 360MB/일 | 약 10GB/월 |
| **SSL 인증서** | 무료 | 자동 제공 |

### 우영달림 가계부 예상 사용량

#### 월별 데이터 증가량

```javascript
// 월 예상 거래 데이터
- 거래 내역: 200-400건 (2인 × 100-200건)
- 고정지출: 10-20건
- 1건당 평균 크기: 500 bytes

월 증가량 = 400건 × 500 bytes = 200KB
연 증가량 = 200KB × 12 = 2.4MB

👉 1GB 무료 한도로 400년 이상 사용 가능!
```

#### 월별 다운로드 트래픽

```javascript
// 예상 다운로드 시나리오
- 앱 로드 시: 전체 데이터 (약 2-10MB/연)
- 실시간 리스너: 변경사항만 (수 KB)
- 월 접속: 60회 (2인 × 1일 1회)

월 다운로드 = 60회 × 50KB = 3MB
👉 10GB 한도의 0.03% 사용

실제 사용량은 더 적을 것으로 예상
```

### 결론

**무료 한도로 충분합니다!**
- 저장 용량: 수십 년간 사용 가능
- 다운로드: 무료 한도의 1% 미만 사용 예상
- 동시 연결: 2-4명 사용 (100명 한도의 4%)

---

## 데이터 영구성

### ❓ 30일 후 데이터는 어떻게 되나요?

**무료 한도 내 사용 시**:
```
✅ 아무 문제 없음
✅ 데이터 계속 저장됨
✅ 앱 정상 작동
✅ 비용 청구 없음
```

**무료 한도 초과 시**:
```
⚠️ Spark Plan (무료):
   - 서비스 일시 중단
   - 읽기/쓰기 차단
   - 데이터는 삭제되지 않음
   - Blaze Plan으로 업그레이드 시 복구

💰 Blaze Plan (종량제):
   - 서비스 중단 없음
   - 초과 사용량만큼 과금
   - 예산 한도 설정 가능
```

### 🔒 데이터 보안

**현재 설정** (프로덕션 보안 규칙 적용됨):
```json
{
  "rules": {
    "families": {
      "$familyId": {
        ".read": "auth != null && (
          root.child('families').child($familyId).child('members').child(auth.uid).exists()
        )",
        ".write": "auth != null && (
          root.child('families').child($familyId).child('members').child(auth.uid).exists()
        )"
      }
    },
    "users": {
      "$userId": {
        ".read": "auth != null && auth.uid === $userId",
        ".write": "auth != null && auth.uid === $userId"
      }
    }
  }
}
```

**보안 특징**:
- ✅ 인증된 사용자만 접근 가능
- ✅ 가족 구성원만 가족 데이터 읽기/쓰기
- ✅ 본인 데이터만 접근 가능 (개인 모드)
- ✅ 초대 시스템을 통한 안전한 공유

---

## 사용량 모니터링

### Firebase Console에서 확인

#### 1. 프로젝트 대시보드
```
https://console.firebase.google.com/project/woodal-budget
```

#### 2. Realtime Database 사용량
```
왼쪽 메뉴 → Realtime Database → 사용량 탭

확인 가능 항목:
- 저장된 데이터 크기
- 월간 다운로드량
- 동시 연결 수
- 일일 사용 추이 그래프
```

#### 3. Hosting 사용량
```
왼쪽 메뉴 → Hosting → 사용량 대시보드

확인 가능 항목:
- 호스팅 파일 크기
- 월간 전송량
- 일일 요청 수
```

### 알림 설정

#### 예산 알림 설정하기

1. **Firebase Console 접속**
2. **프로젝트 설정 → 예산 및 알림**
3. **알림 규칙 추가**:
   ```
   - 임계값: 80% (무료 한도의 80% 도달 시)
   - 수신자: 이메일 주소
   - 빈도: 매일
   ```

#### Cloud Monitoring (선택사항)

Blaze Plan으로 업그레이드 시 사용 가능:
- 실시간 알림
- 커스텀 메트릭
- 상세 로그

---

## 백업 전략

### 1️⃣ 수동 백업 (권장)

#### Firebase Console에서 JSON 내보내기

**주기**: 월 1회 권장

**절차**:
1. Firebase Console 접속
2. Realtime Database → 데이터 탭
3. 루트(`/`) 선택
4. ⋮ (더보기) → **JSON 내보내기**
5. 파일 저장

**파일명 예시**:
```
woodal-budget-backup-2025-10-20.json
```

#### 백업 파일 저장 위치

**옵션 1: Google Drive** (권장)
- 자동 동기화
- 버전 관리
- 접근 편리

**옵션 2: 로컬 컴퓨터**
- 빠른 접근
- 오프라인 백업
- 정기적 백업 필요

**옵션 3: GitHub Private Repository**
- 버전 관리
- 협업 가능
- 주의: `.gitignore`에 추가 권장 (민감 정보)

### 2️⃣ 자동 백업 (선택사항)

#### Cloud Functions로 자동화 (Blaze Plan 필요)

**예시 코드**:
```javascript
// functions/index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');

exports.scheduledBackup = functions.pubsub
  .schedule('0 0 * * 0')  // 매주 일요일 자동
  .timeZone('Asia/Seoul')
  .onRun(async (context) => {
    const db = admin.database();
    const snapshot = await db.ref('/').once('value');
    const data = snapshot.val();

    // Cloud Storage에 저장
    const bucket = admin.storage().bucket();
    const fileName = `backup-${Date.now()}.json`;
    const file = bucket.file(`backups/${fileName}`);

    await file.save(JSON.stringify(data), {
      contentType: 'application/json',
    });

    console.log(`Backup created: ${fileName}`);
  });
```

**비용**: 무료 (무료 한도 내)

### 3️⃣ 데이터 복구

#### JSON 파일로 복구하기

1. Firebase Console → Realtime Database → 데이터
2. 복구할 경로 선택 (루트 또는 특정 노드)
3. ⋮ (더보기) → **JSON 가져오기**
4. 백업 파일 선택
5. **가져오기** 클릭

**주의**:
- ⚠️ 기존 데이터를 덮어씁니다
- ⚠️ 복구 전 현재 데이터 백업 권장

---

## 요금제 비교

### Spark Plan vs Blaze Plan

| 항목 | Spark (무료) | Blaze (종량제) |
|------|--------------|----------------|
| **월 비용** | $0 | $0 + 사용량 |
| **저장 (DB)** | 1GB | 1GB 무료 + $5/GB |
| **다운로드** | 10GB/월 | 10GB 무료 + $1/GB |
| **함수 실행** | 불가 | 무료 할당량 + 종량제 |
| **서비스 중단** | 한도 초과 시 | 없음 (과금) |
| **신용카드** | 불필요 | 필수 |

### Blaze Plan 예상 비용

우영달림 가계부 기준:

```
저장 용량: 1GB 미만 → $0
다운로드: 10GB 미만 → $0
함수 실행: 미사용 → $0

예상 월 비용: $0 (무료 한도 내)
```

**초과 시 최대 비용**:
```
최악의 시나리오 (비현실적):
- 저장 2GB 사용: $5
- 다운로드 20GB: $10
월 최대 $15 (거의 발생 안 함)
```

### 권장 사항

**현재 단계**: Spark Plan (무료) 유지
- 충분한 무료 한도
- 비용 부담 없음
- 필요 시 언제든 업그레이드 가능

**Blaze 전환 고려 시점**:
- 사용량이 무료 한도의 80% 도달
- Cloud Functions 사용 필요
- 자동 백업 시스템 구축
- 상세 모니터링 필요

---

## FAQ

### Q1: 30일이 지나면 데이터가 삭제되나요?

**A**: 아니요! 30일은 그냥 시간의 경과일 뿐입니다.
- Firebase에 저장된 데이터는 **영구적**으로 보관됩니다
- 직접 삭제하지 않는 한 사라지지 않습니다
- 무료 요금제여도 동일합니다

---

### Q2: 무료 한도를 초과하면 어떻게 되나요?

**A**: Spark Plan에서는 서비스가 일시 중단됩니다.
- 읽기/쓰기 작업 차단
- 데이터는 삭제되지 않음
- Blaze Plan으로 업그레이드하면 즉시 복구

**예방 방법**:
1. Firebase Console에서 사용량 정기 확인
2. 80% 도달 시 알림 설정
3. 필요 시 Blaze Plan 전환 (무료 한도 동일)

---

### Q3: 현재 프로젝트로 얼마나 사용할 수 있나요?

**A**: 수십 년간 무료로 사용 가능합니다!

**계산 근거**:
```
월 데이터 증가: 200KB
연 데이터 증가: 2.4MB
1GB 무료 한도 = 1,024MB

1,024MB ÷ 2.4MB/년 = 약 427년
```

**다운로드**:
```
월 다운로드: 약 3MB
무료 한도: 10GB (10,240MB)

사용률: 0.03%
```

---

### Q4: 백업은 얼마나 자주 해야 하나요?

**A**: 월 1회 권장, 중요 작업 전 필수

**권장 백업 시점**:
- 정기: 매월 1일
- 중요 작업 전: 데이터 대량 수정/삭제 전
- 주요 이벤트 후: 월말 결산 후

---

### Q5: 데이터 보안은 어떻게 되나요?

**A**: Firebase Security Rules로 보호됩니다.

**현재 설정**:
- ✅ 로그인한 사용자만 접근
- ✅ 가족 구성원만 가족 데이터 접근
- ✅ 본인 데이터만 읽기/쓰기
- ✅ HTTPS 암호화 통신
- ✅ Google 인증 시스템

---

### Q6: Blaze Plan으로 언제 전환해야 하나요?

**A**: 현재는 필요 없습니다.

**전환 고려 시점**:
1. 무료 한도 80% 도달 시
2. Cloud Functions 필요 시 (자동 백업 등)
3. 고급 모니터링 필요 시

**현재 상황**:
- 사용량: 무료 한도의 1% 미만
- Spark Plan으로 충분
- 비용 부담 없음

---

### Q7: 실수로 데이터를 삭제하면 복구할 수 있나요?

**A**: 백업이 있으면 복구 가능합니다.

**복구 방법**:
1. 백업 JSON 파일 준비
2. Firebase Console → Realtime Database
3. JSON 가져오기로 복구

**주의**:
- Firebase는 자동 백업 없음
- 정기 수동 백업 필수
- 중요 작업 전 백업 권장

---

### Q8: 여러 명이 동시에 사용해도 되나요?

**A**: 네, 가능합니다!

**현재 한도**:
- 동시 연결: 100명
- 우영달림 가계부: 2명 사용
- 충분한 여유 있음

**실시간 동기화**:
- 한 명이 데이터 추가/수정
- 다른 사람 화면에 즉시 반영
- 충돌 없이 안전하게 동작

---

## 📚 참고 자료

### 공식 문서
- [Firebase Pricing](https://firebase.google.com/pricing)
- [Realtime Database Limits](https://firebase.google.com/docs/database/usage/limits)
- [Security Rules](https://firebase.google.com/docs/database/security)
- [Backup Best Practices](https://firebase.google.com/docs/database/backups)

### 프로젝트 정보
- **Firebase Console**: https://console.firebase.google.com/project/woodal-budget
- **Hosting URL**: https://woodal-budget.web.app
- **Database Region**: asia-southeast1 (싱가포르)

### 모니터링 링크
- **사용량 대시보드**: https://console.firebase.google.com/project/woodal-budget/usage
- **Realtime Database**: https://console.firebase.google.com/project/woodal-budget/database
- **Hosting**: https://console.firebase.google.com/project/woodal-budget/hosting

---

**작성자**: Claude Code
**최종 수정**: 2025-10-20
**문서 버전**: 1.0
