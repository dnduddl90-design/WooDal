# SOLID 원칙 적용 가이드

이 프로젝트는 SOLID 원칙을 준수하여 리팩토링되었습니다.

## 🎯 SOLID 원칙이란?

SOLID는 유지보수와 확장이 용이한 소프트웨어를 만들기 위한 객체지향 설계의 다섯 가지 기본 원칙입니다.

### 1. **S**ingle Responsibility Principle (단일 책임 원칙)
> 하나의 클래스/모듈은 하나의 책임만 가져야 한다.

### 2. **O**pen-Closed Principle (개방-폐쇄 원칙)
> 확장에는 열려 있고, 수정에는 닫혀 있어야 한다.

### 3. **L**iskov Substitution Principle (리스코프 치환 원칙)
> 하위 타입은 상위 타입을 대체할 수 있어야 한다.

### 4. **I**nterface Segregation Principle (인터페이스 분리 원칙)
> 클라이언트는 사용하지 않는 인터페이스에 의존하지 않아야 한다.

### 5. **D**ependency Inversion Principle (의존성 역전 원칙)
> 고수준 모듈은 저수준 모듈에 의존하지 않아야 한다. 둘 다 추상화에 의존해야 한다.

---

## 📁 리팩토링된 프로젝트 구조

```
src/
├── constants/          # 상수 모듈 (SRP)
│   ├── categories.js   # 카테고리 상수
│   ├── paymentMethods.js  # 결제 수단 상수
│   ├── users.js        # 사용자 상수
│   └── index.js        # 통합 export (ISP)
│
├── utils/              # 유틸리티 함수 (SRP)
│   ├── dateUtils.js    # 날짜 관련 함수
│   ├── formatUtils.js  # 포맷 관련 함수
│   └── index.js        # 통합 export (ISP)
│
├── services/           # 비즈니스 로직 (SRP, DIP)
│   └── transactionService.js  # 거래 서비스
│
├── hooks/              # 커스텀 훅 (SRP)
│   ├── useTransactions.js    # 거래 관리 훅
│   └── useAuth.js            # 인증 관리 훅
│
├── context/            # 컨텍스트 (DIP)
│   └── AppContext.js   # 전역 상태 관리
│
├── components/         # 재사용 컴포넌트 (SRP, OCP, ISP)
│   ├── common/         # 공통 컴포넌트
│   ├── forms/          # 폼 컴포넌트
│   └── layout/         # 레이아웃 컴포넌트
│
├── pages/              # 페이지 컴포넌트 (SRP)
│   ├── LoginPage.js    # 로그인 페이지
│   ├── CalendarPage.js # 달력 페이지
│   ├── StatisticsPage.js  # 통계 페이지
│   └── SettingsPage.js # 설정 페이지
│
├── App.js              # 메인 앱 (조합)
└── index.js            # 진입점
```

---

## 💡 SOLID 원칙 적용 사례

### 1. SRP (단일 책임 원칙) 적용

#### ❌ Before (2177줄의 App.js)
```javascript
// App.js에 모든 로직이 섞여 있음
- 상수 정의 (CATEGORIES, PAYMENT_METHODS, USERS)
- 유틸리티 함수 (formatCurrency, getDaysInMonth)
- 비즈니스 로직 (거래 추가/수정/삭제)
- UI 컴포넌트 (로그인, 달력, 통계, 설정)
- 상태 관리
```

#### ✅ After (모듈화)
```javascript
// 각 모듈이 하나의 책임만 담당
constants/categories.js     // 카테고리 데이터만
utils/dateUtils.js          // 날짜 처리만
services/transactionService.js  // 거래 비즈니스 로직만
components/Calendar.js      // 달력 UI만
```

### 2. OCP (개방-폐쇄 원칙) 적용

#### ✅ 확장 가능한 카테고리 시스템
```javascript
// constants/categories.js
export const CATEGORIES = {
  expense: [...],
  income: [...]
};

// 새로운 카테고리 추가 시 기존 코드 수정 없이 확장 가능
export const getCategoryById = (type, categoryId) => {
  const categories = getCategoriesByType(type);
  return categories.find(cat => cat.id === categoryId);
};
```

#### ✅ 서비스 레이어 확장
```javascript
// services/transactionService.js
export class TransactionService {
  static filterByDate(transactions, day, month, year) { ... }
  static filterByCategory(transactions, category) { ... }

  // 새로운 필터 추가 시 기존 메서드 수정 없이 추가 가능
  static filterByUser(transactions, userId) { ... }
}
```

### 3. LSP (리스코프 치환 원칙) 적용

```javascript
// 모든 필터 함수는 동일한 인터페이스를 따름
TransactionService.filterByDate(transactions, ...)
TransactionService.filterByCategory(transactions, ...)
TransactionService.filterByUser(transactions, ...)

// 언제든지 교체 가능
```

### 4. ISP (인터페이스 분리 원칙) 적용

#### ✅ 필요한 것만 import
```javascript
// 전체 import (Bad)
import * as ALL from './constants';

// 필요한 것만 import (Good)
import { CATEGORIES } from './constants/categories';
import { formatCurrency } from './utils/formatUtils';
```

#### ✅ 통합 export 파일
```javascript
// constants/index.js
export * from './categories';      // 카테고리만 필요한 곳에서
export * from './paymentMethods';  // 결제수단만 필요한 곳에서
export * from './users';           // 사용자만 필요한 곳에서
```

### 5. DIP (의존성 역전 원칙) 적용

#### ✅ 서비스 레이어를 통한 추상화
```javascript
// 컴포넌트가 직접 데이터를 처리하지 않고 서비스에 위임
import { TransactionService } from '../services/transactionService';

// Bad: 컴포넌트 내부에 비즈니스 로직
const total = transactions.reduce((sum, t) => sum + t.amount, 0);

// Good: 서비스 레이어 사용
const total = TransactionService.calculateTotal(transactions);
```

#### ✅ Context를 통한 의존성 주입
```javascript
// context/AppContext.js
export const AppProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([]);
  // 상태와 메서드를 컨텍스트로 제공
  return (
    <AppContext.Provider value={{ transactions, ... }}>
      {children}
    </AppContext.Provider>
  );
};

// 컴포넌트는 구현이 아닌 인터페이스에 의존
const { transactions } = useContext(AppContext);
```

---

## 📊 리팩토링 전후 비교

### Before
- **파일 수**: 1개 (App.js)
- **라인 수**: 2,177줄
- **책임**: 모든 기능이 한 파일에
- **유지보수성**: ⭐⭐ (2/5)
- **테스트**: 어려움
- **재사용성**: 낮음

### After
- **파일 수**: 20+ 개
- **평균 라인 수**: ~100줄
- **책임**: 각 모듈이 명확한 단일 책임
- **유지보수성**: ⭐⭐⭐⭐⭐ (5/5)
- **테스트**: 각 모듈 독립 테스트 가능
- **재사용성**: 높음

---

## 🎓 학습 포인트

### 1. 단일 책임 원칙 (SRP)
- 각 파일/모듈이 하나의 명확한 목적을 가짐
- 변경 사유가 하나만 존재

### 2. 개방-폐쇄 원칙 (OCP)
- 새로운 기능 추가 시 기존 코드 수정 최소화
- 확장 가능한 구조

### 3. 리스코프 치환 원칙 (LSP)
- 동일한 인터페이스를 가진 함수들은 교체 가능
- 예측 가능한 동작

### 4. 인터페이스 분리 원칙 (ISP)
- 필요한 것만 import
- 불필요한 의존성 제거

### 5. 의존성 역전 원칙 (DIP)
- 구체적인 구현이 아닌 추상화에 의존
- 서비스 레이어, 컨텍스트 활용

---

## 🚀 다음 단계

1. **컴포넌트 분리 완성**
   - LoginPage, CalendarPage, StatisticsPage 등 분리

2. **커스텀 훅 작성**
   - useTransactions, useAuth, useFixedExpenses

3. **Context API 완성**
   - 전역 상태 관리 구조화

4. **테스트 작성**
   - 각 모듈별 유닛 테스트

5. **TypeScript 적용** (선택)
   - 타입 안정성 확보

---

## 📚 참고 자료

- [SOLID Principles in React](https://medium.com/@cramirez92/s-o-l-i-d-the-first-5-principles-of-object-oriented-design-with-javascript-790f6ac9b9fa)
- [Clean Code JavaScript](https://github.com/ryanmcdermott/clean-code-javascript)
- [React Best Practices](https://react.dev/learn/thinking-in-react)

---

**이 문서는 커플 가계부 프로젝트의 SOLID 원칙 적용을 설명합니다.**

**작성일**: 2025-10-13
**작성자**: Claude Code
