# 💰 우영달림 가계부

커플/부부를 위한 실시간 동기화 공유 가계부 앱

**🌐 배포**: https://woodal-budget.web.app
**📱 모바일 최적화** | **🔥 Firebase 실시간 동기화** | **✨ SOLID 원칙**

---

## ✨ 주요 기능

### 👥 공유 & 인증
- Google 로그인
- 가족 가계부 생성 및 공유
- 이메일 초대 시스템
- 실시간 데이터 동기화

### 💸 거래 관리
- 달력 기반 수입/지출 관리
- 사용자별 거래 추적
- 카테고리/결제수단 분류
- 고정지출 자동 등록
- 검색 및 필터링

### 💰 용돈 관리
- **추적**: 공유 가계부에서 용돈 사용 표시 + 정산
- **개인 관리**: 개인 용돈 잔고 관리
  - 추가/차감/수정 기능
  - 자동 이월
  - 월별 통계

### 📊 통계 & 분석
- 월별/연도별 통계
- 카테고리별 지출 분석
- 사용자별 통계 (가족 모드)

---

## 🛠️ 기술 스택

**Frontend**
- React 19.2.0
- Tailwind CSS (CDN)
- Lucide React 0.545.0

**Backend**
- Firebase Authentication (Google)
- Firebase Realtime Database
- Firebase Hosting

**Architecture**
- SOLID 원칙 기반 모듈화
- Custom Hooks 패턴
- Service Layer 분리

---

## 🏗️ 프로젝트 구조

```
src/
├── constants/       # 카테고리, 결제수단 등
├── utils/          # 날짜, 포맷, 저장소 유틸리티
├── services/       # 비즈니스 로직
├── hooks/          # Custom Hooks (useAuth, useTransactions, usePocketMoney 등)
├── firebase/       # Firebase 설정 및 CRUD
├── components/
│   ├── common/     # 재사용 컴포넌트 (Button, Input, Modal)
│   ├── forms/      # 폼 컴포넌트
│   └── layout/     # 레이아웃 (Header, Sidebar)
└── pages/          # 페이지 컴포넌트 (8개)
```

---

## 🚀 시작하기

### 1. 환경 변수 설정

`.env` 파일 생성:

```env
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_DATABASE_URL=https://your_project.firebasedatabase.app
REACT_APP_FIREBASE_PROJECT_ID=your_project
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

### 2. 설치 및 실행

```bash
# 설치
npm install

# 개발 서버 (localhost:3000)
npm start

# 프로덕션 빌드
npm run build

# Firebase 배포
firebase deploy --only hosting
```

---

## 📚 문서

- **[개발일지.md](./개발일지.md)** - 개발 과정 요약 (Phase 1-15)
- **[개발일지-전체.md](./개발일지-전체.md)** - 전체 개발 과정 상세 기록
- **[SOLID.md](./SOLID.md)** - SOLID 원칙 가이드
- **[Firebase-데이터-관리-가이드.md](./Firebase-데이터-관리-가이드.md)** - 데이터 관리 및 백업 전략
- **[CLAUDE.md](./CLAUDE.md)** - 프로젝트 설계 문서

---

## 📈 개발 진행 상황

### 완료된 Phase ✅

| Phase | 완료 항목 | 상태 |
|-------|----------|------|
| 1-3 | SOLID 리팩토링, Firebase 연동 | ✅ |
| 4-7 | 가족 공유, 초대, 모바일 UI | ✅ |
| 8-12 | 고정지출, 검색, 테마 | ✅ |
| 13 | PC/모바일 달력 UX 개선 | ✅ |
| 14 | 용돈 추적 및 정산 | ✅ |
| 15 | 개인 용돈 관리 페이지 | ✅ |

**총 Phase**: 15개 완료
**개발 기간**: 9일 (2025-10-13 ~ 10-21)
**현재 버전**: v1.0.15
**빌드 크기**: 175.25 kB (gzip)

### 다음 단계 🔜

- [ ] Firebase Security Rules 강화
- [ ] PWA 전환 (오프라인 지원)
- [ ] 예산 관리 및 알림
- [ ] TypeScript 마이그레이션

---

## 🎨 SOLID 원칙

이 프로젝트는 **SOLID 원칙**을 엄격히 준수합니다.

- **S**RP: 각 모듈은 단일 책임
- **O**CP: 확장에 열림, 수정에 닫힘
- **L**SP: 동일 인터페이스 교체 가능
- **I**SP: 필요한 것만 의존
- **D**IP: 추상화에 의존

자세한 내용: [SOLID.md](./SOLID.md)

---

## 💡 주요 컴포넌트 사용법

### Button
```javascript
import { Button } from './components/common';
import { Save } from 'lucide-react';

<Button variant="primary" size="md" icon={Save} onClick={handleSave}>
  저장
</Button>
```

### Input
```javascript
import { Input } from './components/common';

<Input
  label="금액"
  type="number"
  value={amount}
  onChange={(e) => setAmount(e.target.value)}
  required
/>
```

### Modal
```javascript
import { Modal } from './components/common';

<Modal isOpen={isOpen} onClose={handleClose} title="거래 추가" size="md">
  {/* 내용 */}
</Modal>
```

---

## 📦 Firebase 데이터 구조

```
users/
  {userId}/
    transactions/        # 개인 거래
    fixedExpenses/       # 개인 고정지출
    pocketMoney/         # 개인 용돈 관리
      budget: 500000
      transactions/

families/
  {familyId}/
    transactions/        # 가족 공유 거래
    fixedExpenses/       # 가족 고정지출
    members/
      {userId}/
        name: "우영"
        role: "admin"
        avatar: "👨"
```

---

## 🔄 개발 워크플로우

### 새 기능 추가 시
1. SOLID 원칙 확인
2. 적절한 폴더에 파일 생성
3. 단일 책임 원칙 준수
4. index.js에 export 추가
5. 테스트 가능한 구조로 작성

### 코드 리뷰 체크리스트
- [ ] SOLID 원칙 준수
- [ ] 파일 크기 200줄 이하
- [ ] 함수 크기 30줄 이하
- [ ] Props 5개 이하
- [ ] 주석 작성

---

## 💾 데이터 관리

### 데이터 영구성
- Firebase Realtime Database에 **영구 저장**
- 무료 한도: 1GB (수십 년 사용 가능)
- 동시 접속: 100명

### 백업 권장
- Firebase Console에서 월 1회 JSON 내보내기
- 중요 작업 전 백업 필수

자세한 내용: [Firebase-데이터-관리-가이드.md](./Firebase-데이터-관리-가이드.md)

---

## 👥 개발 정보

- **시작일**: 2025-10-13
- **최종 업데이트**: 2025-10-21
- **개발**: Claude Code
- **상태**: Phase 15 완료
- **배포**: https://woodal-budget.web.app

---

**Made with ❤️ by Claude Code**
