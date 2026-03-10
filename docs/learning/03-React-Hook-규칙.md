# React Hook 규칙과 에러 해결

## 📚 학습 목표
- React Hook의 핵심 규칙 이해하기
- Hook 순서가 중요한 이유 알기
- 실무에서 흔한 Hook 에러 해결하기

---

## 1. React Hook이란?

React Hook은 함수 컴포넌트에서 state와 생명주기 기능을 사용할 수 있게 해주는 함수입니다.

**대표적인 Hook들**:
- `useState` - 상태 관리
- `useEffect` - 부수 효과 처리
- `useContext` - 컨텍스트 사용
- `useCallback` - 함수 메모이제이션
- `useMemo` - 값 메모이제이션

---

## 2. Hook의 두 가지 규칙

### 규칙 1: 최상위에서만 Hook 호출하기

Hook은 **항상 컴포넌트 함수의 최상위**에서 호출해야 합니다.

#### ❌ 잘못된 예시

```javascript
function MyComponent() {
  // Early return이 먼저 있으면
  if (!user) {
    return <div>로그인 필요</div>;
  }

  // Hook이 조건부로 실행됨 - 에러!
  const [count, setCount] = useState(0);
  useEffect(() => {
    console.log('마운트됨');
  }, []);

  return <div>{count}</div>;
}
```

**에러 메시지**:
```
React Hook "useState" is called conditionally.
React Hooks must be called in the exact same order in every component render.
```

#### ✅ 올바른 예시

```javascript
function MyComponent() {
  // Hook을 먼저 호출
  const [count, setCount] = useState(0);

  useEffect(() => {
    console.log('마운트됨');
  }, []);

  // 조건부 렌더링은 Hook 이후에
  if (!user) {
    return <div>로그인 필요</div>;
  }

  return <div>{count}</div>;
}
```

---

### 규칙 2: React 함수 컴포넌트에서만 Hook 호출하기

Hook은 다음 두 곳에서만 호출 가능:
1. **함수 컴포넌트** 내부
2. **커스텀 Hook** 내부

#### ❌ 잘못된 예시

```javascript
// 일반 JavaScript 함수에서 Hook 사용 - 에러!
function calculateTotal() {
  const [total, setTotal] = useState(0); // 🚫
  return total;
}
```

#### ✅ 올바른 예시

```javascript
// 커스텀 Hook으로 만들기
function useTotal() {
  const [total, setTotal] = useState(0);
  return [total, setTotal];
}

// 컴포넌트에서 사용
function MyComponent() {
  const [total, setTotal] = useTotal();
  return <div>{total}</div>;
}
```

---

## 3. 왜 Hook 순서가 중요한가?

React는 **Hook 호출 순서**로 각 Hook의 상태를 추적합니다.

### 내부 동작 원리

```javascript
function MyComponent() {
  const [name, setName] = useState('Alice');     // 첫 번째 Hook
  const [age, setAge] = useState(25);            // 두 번째 Hook
  const [email, setEmail] = useState('a@b.com'); // 세 번째 Hook
}
```

React 내부에서는 이렇게 저장:
```javascript
// 렌더링 1
hooks[0] = { state: 'Alice' }
hooks[1] = { state: 25 }
hooks[2] = { state: 'a@b.com' }

// 렌더링 2 (순서가 같아야 함!)
hooks[0] = { state: 'Bob' }      // name 업데이트
hooks[1] = { state: 26 }         // age 업데이트
hooks[2] = { state: 'b@c.com' }  // email 업데이트
```

### 순서가 바뀌면?

```javascript
function MyComponent() {
  if (condition) {
    const [name, setName] = useState('Alice'); // 조건부 실행
  }
  const [age, setAge] = useState(25);
  const [email, setEmail] = useState('a@b.com');
}
```

```javascript
// 렌더링 1 (condition = true)
hooks[0] = { state: 'Alice' }    // name
hooks[1] = { state: 25 }         // age
hooks[2] = { state: 'a@b.com' }  // email

// 렌더링 2 (condition = false)
hooks[0] = { state: 25 }         // age가 0번 인덱스로!
hooks[1] = { state: 'a@b.com' }  // email이 1번 인덱스로!
hooks[2] = undefined             // 버그!
```

**결과**: 상태가 완전히 꼬여버립니다! 🐛

---

## 4. 실전 예제: 실제 프로젝트에서 겪은 버그

### 문제 상황

```javascript
// src/App.js (문제 코드)
function App() {
  // ... 많은 코드 ...

  // 로딩 중이면 early return
  if (authLoading || transactionsLoading) {
    return <LoadingSpinner />;
  }

  // 로그인 안 했으면 early return
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // ❌ 여기서 Hook 사용 - 에러!
  const [forceShow, setForceShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setForceShow(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  return <div>메인 화면</div>;
}
```

**에러**:
```
Line 474:37: React Hook "useState" is called conditionally
Line 475:3: React Hook "useEffect" is called conditionally
```

### 해결 방법

```javascript
// src/App.js (수정 후)
function App() {
  // ✅ Hook을 최상위로 이동
  const [forceShow, setForceShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setForceShow(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  // ... 많은 코드 ...

  // Early return은 Hook 이후에
  if (authLoading || transactionsLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return <div>메인 화면</div>;
}
```

---

## 5. 흔한 Hook 에러 패턴과 해결법

### 패턴 1: 조건문 안에서 Hook 사용

```javascript
// ❌ 잘못된 코드
function UserProfile() {
  if (isLoggedIn) {
    const [user, setUser] = useState(null); // 🚫
  }
}

// ✅ 올바른 코드
function UserProfile() {
  const [user, setUser] = useState(null);

  if (!isLoggedIn) {
    return <LoginPrompt />;
  }

  return <div>{user?.name}</div>;
}
```

### 패턴 2: 반복문 안에서 Hook 사용

```javascript
// ❌ 잘못된 코드
function ItemList({ items }) {
  return items.map(item => {
    const [selected, setSelected] = useState(false); // 🚫
    return <Item key={item.id} />;
  });
}

// ✅ 올바른 코드 - 별도 컴포넌트로 분리
function Item({ item }) {
  const [selected, setSelected] = useState(false);
  return <div>{item.name}</div>;
}

function ItemList({ items }) {
  return items.map(item => (
    <Item key={item.id} item={item} />
  ));
}
```

### 패턴 3: 이벤트 핸들러에서 Hook 사용

```javascript
// ❌ 잘못된 코드
function MyButton() {
  const handleClick = () => {
    const [count, setCount] = useState(0); // 🚫
    setCount(count + 1);
  };

  return <button onClick={handleClick}>클릭</button>;
}

// ✅ 올바른 코드
function MyButton() {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    setCount(count + 1);
  };

  return <button onClick={handleClick}>클릭 {count}</button>;
}
```

---

## 6. ESLint로 Hook 규칙 자동 검사

### 설치 방법

```bash
npm install eslint-plugin-react-hooks --save-dev
```

### `.eslintrc.json` 설정

```json
{
  "plugins": ["react-hooks"],
  "rules": {
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn"
  }
}
```

### 효과

- Hook 규칙 위반 시 즉시 에러 표시
- 의존성 배열 누락 시 경고
- 개발 중 실시간으로 문제 발견

---

## 7. 디버깅 팁

### 에러 메시지 읽기

```
React Hook "useState" is called conditionally.
React Hooks must be called in the exact same order in every component render.
```

**해석**:
1. "conditionally" → 조건부로 호출되고 있음
2. "exact same order" → 순서가 바뀌었음

**해결**:
1. Hook 호출 위치 확인
2. 조건문, 반복문, early return 찾기
3. Hook을 최상위로 이동

### 코드 검색으로 찾기

```javascript
// Hook 키워드로 검색
- useState
- useEffect
- useContext
- use로 시작하는 모든 함수

// 조건부 실행 패턴 검색
- if (...) {
- for (...) {
- while (...) {
- map(...) {
```

---

## 8. 실습 문제

### 문제 1: 에러 찾기

다음 코드의 문제점을 찾아보세요.

```javascript
function TodoList({ items }) {
  if (items.length === 0) {
    return <div>할 일이 없습니다</div>;
  }

  const [filter, setFilter] = useState('all');

  return (
    <div>
      <FilterButton onClick={() => setFilter('all')} />
      {items.map(item => <TodoItem key={item.id} item={item} />)}
    </div>
  );
}
```

<details>
<summary>정답 보기</summary>

**문제**: `useState`가 조건부로 실행됩니다. `items.length === 0`일 때는 Hook이 호출되지 않아요.

**해결**:
```javascript
function TodoList({ items }) {
  const [filter, setFilter] = useState('all'); // Hook을 먼저!

  if (items.length === 0) {
    return <div>할 일이 없습니다</div>;
  }

  return (
    <div>
      <FilterButton onClick={() => setFilter('all')} />
      {items.map(item => <TodoItem key={item.id} item={item} />)}
    </div>
  );
}
```
</details>

---

## 9. 요약

### 핵심 규칙
1. ✅ Hook은 **항상 컴포넌트 최상위**에서 호출
2. ✅ Hook은 **React 함수 컴포넌트나 커스텀 Hook**에서만 호출
3. ✅ Hook 호출 **순서는 항상 동일**해야 함

### 금지 사항
- ❌ 조건문 안에서 Hook 호출
- ❌ 반복문 안에서 Hook 호출
- ❌ Early return 이후에 Hook 호출
- ❌ 일반 함수에서 Hook 호출
- ❌ 이벤트 핸들러에서 Hook 호출

### 개발 팁
- ESLint 플러그인 사용하기
- 에러 메시지 꼼꼼히 읽기
- Hook은 항상 컴포넌트 상단에 모아두기

---

## 10. 참고 자료

- [React 공식 문서 - Hook의 규칙](https://react.dev/reference/rules/rules-of-hooks)
- [eslint-plugin-react-hooks](https://www.npmjs.com/package/eslint-plugin-react-hooks)
- 개발일지.md - Phase 11 참고

---

**작성일**: 2025-10-16
**난이도**: ⭐⭐☆☆☆ (초급)
**소요 시간**: 약 30분
