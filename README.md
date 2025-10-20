# 💰 우영달림 가계부 앱

2인 공유 가계부 애플리케이션 - SOLID 원칙 기반 React 프로젝트

**🌐 배포 URL**: https://woodal-budget.web.app
**📱 모바일 최적화** | **🔥 Firebase 연동** | **✨ 실시간 동기화**

## 📋 프로젝트 소개

우영달림 가계부는 커플/부부가 함께 사용할 수 있는 실시간 동기화 가계부 애플리케이션입니다.
SOLID 원칙을 준수하여 유지보수와 확장이 용이하도록 설계되었으며, Firebase를 통해 실시간 데이터 공유를 지원합니다.

### ✨ 주요 기능

**인증 & 공유**
- 🔐 Google 로그인 (Firebase Authentication)
- 👨‍👩‍👧‍👦 가족 가계부 생성 및 공유
- 📧 이메일 초대 시스템
- 🔄 실시간 데이터 동기화

**거래 관리**
- 👤 사용자별 거래 내역 관리
- 📅 달력 기반 일별 수입/지출 관리
- 💳 다양한 결제 수단 지원 (현금, 신용카드, 체크카드, 계좌이체 등)
- 🏷️ 카테고리별 거래 분류 (식비, 교통, 쇼핑, 의료, 주거 등)
- 🔄 고정 지출 자동 등록 (월세, 구독료 등)
- 🔍 거래 내역 검색 및 필터링

**통계 & 설정**
- 📊 월별 통계 및 요약 대시보드
- 💰 카테고리별 지출 분석
- ⚙️ 사용자 설정 관리
- 📱 모바일 반응형 UI

## 🏗️ SOLID 원칙 기반 아키텍처

이 프로젝트는 **SOLID 원칙**을 엄격히 준수하여 리팩토링되었습니다.

```
src/
├── constants/          # 상수 관리 (SRP)
│   ├── categories.js   # 카테고리 상수
│   ├── paymentMethods.js  # 결제 수단 상수
│   ├── users.js        # 사용자 상수
│   └── index.js
│
├── utils/              # 유틸리티 함수 (SRP)
│   ├── dateUtils.js    # 날짜 처리
│   ├── formatUtils.js  # 포맷 함수
│   └── index.js
│
├── services/           # 비즈니스 로직 (DIP)
│   └── transactionService.js  # 거래 서비스
│
├── hooks/              # 커스텀 훅 (SRP)
│   ├── useAuth.js      # 인증 훅
│   ├── useTransactions.js  # 거래 훅
│   ├── useFixedExpenses.js  # 고정지출 훅
│   └── index.js
│
├── components/         # 재사용 가능한 컴포넌트
│   └── common/         # 공통 컴포넌트 (OCP)
│       ├── Button.js
│       ├── Input.js
│       ├── Modal.js
│       └── index.js
│
└── App.js             # 메인 애플리케이션
```

### 📖 SOLID 원칙 적용

- **S**RP (단일 책임 원칙): 각 모듈/컴포넌트는 하나의 책임만 수행
- **O**CP (개방-폐쇄 원칙): 확장에는 열려있고 수정에는 닫혀있음
- **L**SP (리스코프 치환 원칙): 동일한 인터페이스로 교체 가능
- **I**SP (인터페이스 분리 원칙): 필요한 것만 의존
- **D**IP (의존성 역전 원칙): 추상화에 의존

자세한 내용은 [SOLID-GUIDE.md](./SOLID-GUIDE.md)를 참고하세요.

## 🛠️ 기술 스택

**Frontend**
- **React** 19.2.0 - UI 라이브러리
- **Lucide React** 0.545.0 - 아이콘
- **Tailwind CSS** (CDN) - 스타일링
- **JavaScript** - 프로그래밍 언어

**Backend & Infrastructure**
- **Firebase Authentication** - Google 로그인
- **Firebase Realtime Database** - 실시간 데이터 동기화
- **Firebase Hosting** - 정적 웹 호스팅

**Build & Development**
- **Create React App** - 빌드 도구
- **Git** - 버전 관리

### 향후 계획

- Firebase Security Rules 설정
- PWA 전환 (오프라인 지원)
- TypeScript 마이그레이션
- Jest/React Testing Library (테스트)

## 🚀 시작하기

### 환경 변수 설정

`.env` 파일 생성 및 Firebase 설정:

```env
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_DATABASE_URL=https://your_project.firebasedatabase.app
REACT_APP_FIREBASE_PROJECT_ID=your_project
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

### 설치

```bash
npm install
```

### 개발 서버 실행

```bash
npm start
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

### 프로덕션 빌드 및 배포

```bash
# 빌드
npm run build

# Firebase 배포
firebase deploy --only hosting

# 원 라이너
npm run build && firebase deploy --only hosting
```

**배포 가이드**: [DEPLOYMENT.md](./DEPLOYMENT.md) 참고

## 📚 주요 문서

### 개발 가이드
- [CLAUDE.md](./CLAUDE.md) - 프로젝트 전체 설계 문서 및 개발 가이드
- [SOLID-GUIDE.md](./SOLID-GUIDE.md) - SOLID 원칙 개발 가이드 (필수)
- [SOLID.md](./SOLID.md) - SOLID 원칙 설명

### 개발 일지 & 배포
- [개발일지.md](./개발일지.md) - 전체 개발 과정 기록 (Phase 1-13)
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Firebase Hosting 배포 가이드

### Firebase 관리
- [Firebase-데이터-관리-가이드.md](./Firebase-데이터-관리-가이드.md) - 데이터 저장, 요금제, 백업 전략 (⭐ 필독)

## 🎨 디자인 시스템

### 컬러 팔레트
- 주요 색상: Blue-Purple 그라데이션
- 지출: 빨강 계열
- 수입: 초록 계열
- 카테고리별 고유 색상

### 디자인 특징
- 글래스모피즘 효과
- 부드러운 애니메이션
- 반응형 디자인
- 다크 모드 지원 예정

## 📦 컴포넌트 사용 예시

### Button 컴포넌트

```javascript
import { Button } from './components/common';
import { Save } from 'lucide-react';

<Button variant="primary" size="md" icon={Save} onClick={handleSave}>
  저장
</Button>
```

### Input 컴포넌트

```javascript
import { Input } from './components/common';

<Input
  label="금액"
  type="number"
  value={amount}
  onChange={(e) => setAmount(e.target.value)}
  required
  placeholder="금액을 입력하세요"
/>
```

### Modal 컴포넌트

```javascript
import { Modal } from './components/common';

<Modal
  isOpen={isOpen}
  onClose={handleClose}
  title="거래 추가"
  size="md"
>
  {/* 모달 내용 */}
</Modal>
```

## 🔄 개발 워크플로우

### 새 기능 추가 시

1. SOLID-GUIDE.md의 체크리스트 확인
2. 적절한 폴더에 파일 생성
3. 단일 책임 원칙 준수
4. index.js에 export 추가
5. 코드 리뷰 체크리스트 확인

### 코드 리뷰 체크리스트

- [ ] SOLID 원칙 준수
- [ ] 파일 크기 200줄 이하
- [ ] 함수 크기 30줄 이하
- [ ] Props 5개 이하
- [ ] 주석 작성
- [ ] 테스트 가능한 구조

## 📈 프로젝트 상태

### 완료된 Phase (Phase 1-7) ✅

- ✅ **Phase 1**: SOLID 리팩토링 (100%)
  - 상수, 유틸리티, 서비스, 훅, 컴포넌트 분리

- ✅ **Phase 2**: Firebase Authentication (100%)
  - Google 로그인 구현

- ✅ **Phase 3**: Firebase Realtime Database (100%)
  - 실시간 데이터 동기화
  - LocalStorage → Firebase 자동 마이그레이션

- ✅ **Phase 4**: 공유 가계부 기능 (100%)
  - 가족 데이터 구조 설계
  - 개인/공유 모드 자동 전환

- ✅ **Phase 5**: 가족 관리 UI (100%)
  - 가족 생성, 탈퇴 기능

- ✅ **Phase 6**: 이메일 초대 시스템 (100%)
  - 초대 생성, 수락/거절 기능
  - Header 초대 알림 UI

- ✅ **Phase 7**: 모바일 반응형 (100%)
  - 모든 페이지 모바일 최적화
  - 프로덕션 빌드 및 배포 준비

- ✅ **Phase 13**: PC/모바일 달력 UX 개선 (100%)
  - 반응형 달력 클릭 동작 분리
  - 고정지출 기간 설정 기능
  - 저축 카테고리 추가 및 통계 개선
  - 주식 메뉴 숨김

### 다음 단계

- [ ] 예산 관리 기능
- [ ] 알림 시스템
- [ ] PWA 전환 (오프라인 지원)
- [ ] TypeScript 마이그레이션
- [ ] 테스트 코드 작성

**전체 진행률**: 약 99%
**총 개발 시간**: 약 16시간
**현재 상태**: 프로덕션 배포 중 (v1.0.13)
**최종 업데이트**: 2025-10-20

## 🤝 개발 가이드라인

이 프로젝트는 **SOLID 원칙을 엄격히 준수**합니다.

모든 개발은 [SOLID-GUIDE.md](./SOLID-GUIDE.md)를 참고하여 진행해주세요.

### 핵심 규칙

1. 하나의 파일은 하나의 책임만
2. 기존 코드 수정 없이 확장 가능하게
3. 동일한 인터페이스 유지
4. 필요한 것만 import
5. 추상화에 의존

## 📝 라이선스

이 프로젝트는 개인 프로젝트입니다.

## 👥 개발 정보

- **시작일**: 2025-10-13
- **최종 업데이트**: 2025-10-20
- **개발**: Claude Code와 함께
- **상태**: Phase 13 완료 (프로덕션 배포 중)
- **버전**: v1.0.13
- **배포 URL**: https://woodal-budget.web.app

---

## 📞 배포 방법

```bash
# 빠른 배포
npm run build && firebase deploy --only hosting
```

**상세 가이드**: [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## 💡 중요 안내

### Firebase 데이터 관리
데이터는 Firebase에 **영구적으로 저장**되며, 무료 한도(1GB)로 **수십 년간 사용 가능**합니다.
자세한 내용은 [Firebase-데이터-관리-가이드.md](./Firebase-데이터-관리-가이드.md)를 참고하세요.

### 정기 백업 권장
- Firebase Console에서 월 1회 JSON 내보내기
- 중요 작업 전 백업 필수

---

**🎯 프로젝트 완성도**: 99%
**다음 작업**: 예산 관리 기능 및 알림 시스템

자세한 개발 과정은 [개발일지.md](./개발일지.md)를 참고하세요.
