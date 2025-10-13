# SOLID 원칙 개발 가이드

> **중요**: 앞으로 모든 개발은 이 SOLID 원칙을 준수하여 진행합니다.

## 📁 프로젝트 구조 (완료/진행중)

```
src/
├── constants/          ✅ 완료
│   ├── categories.js   # 카테고리 상수
│   ├── paymentMethods.js  # 결제 수단 상수
│   ├── users.js        # 사용자 상수
│   └── index.js        # 통합 export
│
├── utils/              ✅ 완료
│   ├── dateUtils.js    # 날짜 처리 함수
│   ├── formatUtils.js  # 포맷 함수
│   └── index.js
│
├── services/           ✅ 완료
│   └── transactionService.js  # 거래 비즈니스 로직
│
├── hooks/              ✅ 완료
│   ├── useAuth.js      # 인증 훅
│   ├── useTransactions.js  # 거래 훅
│   ├── useFixedExpenses.js  # 고정지출 훅
│   └── index.js
│
├── components/         ✅ 부분 완료
│   ├── common/         # 공통 컴포넌트
│   │   ├── Button.js
│   │   ├── Input.js
│   │   ├── Modal.js
│   │   └── index.js
│   ├── forms/          # 폼 컴포넌트 (TODO)
│   └── layout/         # 레이아웃 컴포넌트 (TODO)
│
├── pages/              # 페이지 컴포넌트 (TODO)
│   ├── LoginPage.js
│   ├── CalendarPage.js
│   ├── StatisticsPage.js
│   └── SettingsPage.js
│
└── context/            # 컨텍스트 (TODO)
    └── AppContext.js
```

---

## 🎓 SOLID 원칙 적용 규칙

### 1️⃣ SRP (단일 책임 원칙)

**규칙**: 하나의 파일/컴포넌트는 하나의 책임만 가져야 합니다.

#### ✅ 좋은 예시
```javascript
// constants/categories.js - 카테고리 데이터만
export const CATEGORIES = { ... };

// utils/dateUtils.js - 날짜 처리만
export const getDaysInMonth = (date) => { ... };

// hooks/useAuth.js - 인증 로직만
export const useAuth = () => { ... };
```

#### ❌ 나쁜 예시
```javascript
// App.js에 모든 것이 섞여 있음
const CATEGORIES = { ... };
const formatDate = () => { ... };
const handleLogin = () => { ... };
// ... 2000+ 줄
```

### 2️⃣ OCP (개방-폐쇄 원칙)

**규칙**: 확장에는 열려있고, 수정에는 닫혀 있어야 합니다.

#### ✅ 좋은 예시
```javascript
// Button 컴포넌트 - variant로 확장 가능
export const Button = ({ variant = 'primary', ... }) => {
  const variantClasses = {
    primary: '...',
    secondary: '...',
    danger: '...',
    // 새로운 variant 추가 가능 (기존 코드 수정 없음)
  };
  return <button className={variantClasses[variant]} />;
};

// 사용
<Button variant="primary">저장</Button>
<Button variant="danger">삭제</Button>
```

#### ❌ 나쁜 예시
```javascript
// 새로운 스타일 추가 시 if문 수정 필요
export const Button = ({ isPrimary, isDanger, ... }) => {
  if (isPrimary) return <button className="primary" />;
  if (isDanger) return <button className="danger" />;
  // 새로운 타입 추가 시 여기를 수정해야 함
};
```

### 3️⃣ LSP (리스코프 치환 원칙)

**규칙**: 하위 타입은 상위 타입을 대체할 수 있어야 합니다.

#### ✅ 좋은 예시
```javascript
// 모든 필터 함수는 동일한 인터페이스
TransactionService.filterByDate(transactions, ...);
TransactionService.filterByCategory(transactions, ...);
TransactionService.filterByUser(transactions, ...);

// 언제든 교체 가능
const filtered = TransactionService[filterType](transactions, ...);
```

### 4️⃣ ISP (인터페이스 분리 원칙)

**규칙**: 클라이언트는 사용하지 않는 인터페이스에 의존하지 말아야 합니다.

#### ✅ 좋은 예시
```javascript
// 필요한 것만 import
import { formatCurrency } from './utils/formatUtils';
import { CATEGORIES } from './constants/categories';

// index.js를 통한 선택적 export
export { Button } from './Button';
export { Input } from './Input';
```

#### ❌ 나쁜 예시
```javascript
// 모든 것을 한 번에 import
import * as Everything from './utils';
```

### 5️⃣ DIP (의존성 역전 원칙)

**규칙**: 고수준 모듈은 저수준 모듈에 의존하지 말고, 둘 다 추상화에 의존해야 합니다.

#### ✅ 좋은 예시
```javascript
// 컴포넌트는 서비스를 통해 비즈니스 로직에 접근
import { TransactionService } from '../services/transactionService';

const MyComponent = () => {
  const total = TransactionService.calculateTotal(transactions);
  // ...
};
```

#### ❌ 나쁜 예시
```javascript
// 컴포넌트에 비즈니스 로직이 직접 들어감
const MyComponent = () => {
  const total = transactions.reduce((sum, t) => sum + t.amount, 0);
  // ...
};
```

---

## 📝 새로운 기능 추가 시 체크리스트

### ✅ 상수 추가
- [ ] `constants/` 폴더에 새 파일 생성
- [ ] 단일 책임만 가지는지 확인
- [ ] `constants/index.js`에 export 추가

### ✅ 유틸리티 함수 추가
- [ ] `utils/` 폴더에 새 파일 생성
- [ ] 순수 함수로 작성 (사이드 이펙트 없음)
- [ ] `utils/index.js`에 export 추가

### ✅ 비즈니스 로직 추가
- [ ] `services/` 폴더에 새 파일 생성
- [ ] 정적 메서드로 작성 (상태 없음)
- [ ] 테스트 가능하도록 순수 함수로 작성

### ✅ 커스텀 훅 추가
- [ ] `hooks/` 폴더에 새 파일 생성
- [ ] `use`로 시작하는 이름
- [ ] 단일 책임만 가지는지 확인
- [ ] `hooks/index.js`에 export 추가

### ✅ 컴포넌트 추가
- [ ] 적절한 폴더에 생성 (`common/`, `forms/`, `layout/`, `pages/`)
- [ ] Props로 데이터 받기 (의존성 주입)
- [ ] 비즈니스 로직은 서비스로 분리
- [ ] 재사용 가능하게 작성

---

## 🔄 리팩토링 우선순위

### Phase 1 (완료 ✅)
- [x] 상수 분리
- [x] 유틸리티 분리
- [x] 서비스 레이어 생성
- [x] 커스텀 훅 생성
- [x] 공통 컴포넌트 생성

### Phase 2 (진행 예정)
- [ ] 레이아웃 컴포넌트 분리
  - Header.js
  - Sidebar.js
  - Footer.js

- [ ] 폼 컴포넌트 분리
  - TransactionForm.js
  - FixedExpenseForm.js

- [ ] 페이지 컴포넌트 분리
  - LoginPage.js
  - CalendarPage.js
  - StatisticsPage.js
  - FixedExpensePage.js
  - SearchPage.js
  - SettingsPage.js

- [ ] 컨텍스트 추가
  - AppContext.js (전역 상태)

### Phase 3 (향후 계획)
- [ ] TypeScript 마이그레이션
- [ ] 유닛 테스트 추가
- [ ] Storybook 추가
- [ ] E2E 테스트

---

## 💡 코딩 컨벤션

### 파일명
- 컴포넌트: PascalCase (예: `Button.js`, `LoginPage.js`)
- 유틸/서비스: camelCase (예: `dateUtils.js`, `transactionService.js`)
- 상수: camelCase (예: `categories.js`, `users.js`)

### 주석
```javascript
/**
 * 함수/컴포넌트 설명
 * SRP/OCP/LSP/ISP/DIP 중 적용된 원칙 명시
 */
```

### Import 순서
```javascript
// 1. React 관련
import React, { useState } from 'react';

// 2. 외부 라이브러리
import { X, Plus } from 'lucide-react';

// 3. 내부 상수
import { CATEGORIES } from '../constants';

// 4. 내부 유틸/서비스
import { formatCurrency } from '../utils';
import { TransactionService } from '../services';

// 5. 내부 훅
import { useAuth, useTransactions } from '../hooks';

// 6. 내부 컴포넌트
import { Button, Input, Modal } from '../components/common';
```

### Export 방식
```javascript
// Named export 사용 (권장)
export const Button = () => { ... };
export { Button };

// Default export는 페이지 컴포넌트에만 사용
export default LoginPage;
```

---

## 🚀 다음 작업 가이드

### 1. 레이아웃 컴포넌트 분리

```javascript
// components/layout/Header.js
export const Header = ({ user, onLogout }) => {
  // SRP: 헤더 렌더링만
  return (
    <header>...</header>
  );
};

// components/layout/Sidebar.js
export const Sidebar = ({ currentView, onViewChange, items }) => {
  // SRP: 사이드바 렌더링만
  // OCP: items로 확장 가능
  return (
    <nav>...</nav>
  );
};
```

### 2. 페이지 컴포넌트 분리

```javascript
// pages/LoginPage.js
import { useAuth } from '../hooks';
import { Button, Input } from '../components/common';

export const LoginPage = () => {
  const { handleLogin, ... } = useAuth();
  // SRP: 로그인 UI만
  // DIP: useAuth 훅에 의존
  return <div>...</div>;
};

// pages/CalendarPage.js
import { useTransactions } from '../hooks';
import { Calendar } from '../components';

export const CalendarPage = () => {
  const { transactions, ... } = useTransactions();
  // SRP: 달력 UI만
  // DIP: useTransactions 훅에 의존
  return <div>...</div>;
};
```

### 3. App.js 리팩토링

```javascript
// App.js (최종 모습)
import { useAuth, useTransactions, useFixedExpenses } from './hooks';
import { LoginPage, CalendarPage, ... } from './pages';

export default function App() {
  const auth = useAuth();
  const transactions = useTransactions(auth.currentUser);
  const fixedExpenses = useFixedExpenses();

  if (!auth.isAuthenticated) {
    return <LoginPage {...auth} />;
  }

  return (
    <div className="App">
      <Header user={auth.currentUser} onLogout={auth.handleLogout} />
      <Sidebar ... />
      <main>
        {currentView === 'calendar' && <CalendarPage {...transactions} />}
        {currentView === 'statistics' && <StatisticsPage {...transactions} />}
        {/* ... */}
      </main>
    </div>
  );
}
```

---

## 📚 학습 자료

- [SOLID Principles in React](https://medium.com/@cramirez92/s-o-l-i-d-the-first-5-principles-of-object-oriented-design-with-javascript-790f6ac9b9fa)
- [Clean Code JavaScript](https://github.com/ryanmcdermott/clean-code-javascript)
- [React Best Practices](https://react.dev/learn/thinking-in-react)
- [Separation of Concerns](https://en.wikipedia.org/wiki/Separation_of_concerns)

---

## 🔍 코드 리뷰 체크리스트

새로운 코드 작성 시 다음을 확인하세요:

- [ ] **S**: 하나의 책임만 가지는가?
- [ ] **O**: 기존 코드 수정 없이 확장 가능한가?
- [ ] **L**: 동일한 인터페이스를 따르는가?
- [ ] **I**: 필요한 것만 의존하는가?
- [ ] **D**: 구현이 아닌 추상화에 의존하는가?

- [ ] 파일 크기가 200줄 이하인가?
- [ ] 함수/메서드 크기가 30줄 이하인가?
- [ ] Props가 5개 이하인가?
- [ ] 주석이 적절히 작성되었는가?
- [ ] 테스트 가능한 구조인가?

---

**이 가이드를 저장하고 모든 개발에 참고하세요!**

**작성일**: 2025-10-13
**작성자**: Claude Code
**상태**: 진행 중 (Phase 1 완료)
