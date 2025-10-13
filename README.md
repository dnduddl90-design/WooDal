# 💰 우영달림 가계부 앱

2인 공유 가계부 애플리케이션 - SOLID 원칙 기반 React 프로젝트

## 📋 프로젝트 소개

우영달림 가계부는 두 명의 사용자가 함께 사용할 수 있는 가계부 애플리케이션입니다.
SOLID 원칙을 준수하여 유지보수와 확장이 용이하도록 설계되었습니다.

### ✨ 주요 기능

- 👤 사용자별 거래 내역 관리 (우영 / 달림)
- 📅 달력 기반 일별 수입/지출 관리
- 💳 다양한 결제 수단 지원 (현금, 신용카드, 체크카드, 계좌이체 등)
- 🏷️ 카테고리별 거래 분류 (식비, 교통, 쇼핑, 의료, 주거 등)
- 🔄 고정 지출 관리 (월세, 구독료 등)
- 📊 통계 및 요약 대시보드
- 🔍 거래 내역 검색 및 필터링
- ⚙️ 사용자 설정 관리

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

- **React** 19.2.0 - UI 라이브러리
- **Lucide React** - 아이콘
- **Tailwind CSS** - 스타일링
- **JavaScript** - 프로그래밍 언어
- **Create React App** - 빌드 도구

### 향후 계획

- Firebase (인증, Firestore DB, 호스팅)
- TypeScript 마이그레이션
- Jest/React Testing Library (테스트)

## 🚀 시작하기

### 설치

```bash
npm install
```

### 개발 서버 실행

```bash
npm start
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

### 프로덕션 빌드

```bash
npm run build
```

## 📚 주요 문서

- [claude.md](./claude.md) - 프로젝트 전체 설계 문서
- [SOLID-GUIDE.md](./SOLID-GUIDE.md) - SOLID 원칙 개발 가이드 (필수)
- [SOLID.md](./SOLID.md) - SOLID 원칙 설명

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

### Phase 1 (완료 ✅)
- [x] 상수 분리
- [x] 유틸리티 함수 분리
- [x] 서비스 레이어 생성
- [x] 커스텀 훅 생성
- [x] 공통 컴포넌트 생성

### Phase 2 (진행 예정)
- [ ] 레이아웃 컴포넌트 분리
- [ ] 폼 컴포넌트 분리
- [ ] 페이지 컴포넌트 분리
- [ ] 컨텍스트 API 추가
- [ ] App.js 리팩토링

### Phase 3 (향후 계획)
- [ ] Firebase 통합
- [ ] TypeScript 마이그레이션
- [ ] 유닛 테스트
- [ ] E2E 테스트

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

## 👥 개발자

- **작성일**: 2025-10-13
- **개발**: Claude Code와 함께
- **상태**: Phase 1 완료, Phase 2 진행 중

---

**🎯 다음 단계**: Phase 2 리팩토링 (레이아웃, 폼, 페이지 컴포넌트 분리)

자세한 내용은 [SOLID-GUIDE.md](./SOLID-GUIDE.md)의 "다음 작업 가이드" 섹션을 참고하세요.
