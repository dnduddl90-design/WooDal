# 학습자료 📚

> 우영달림 가계부 - 학습 가이드 모음

---

## 📋 문서 목록

### ⭐ 필수 문서

| 문서 | 난이도 | 내용 | 소요 시간 |
|------|--------|------|-----------|
| **00-프로젝트-개요.md** | ⭐⭐⭐⭐ | 전체 아키텍처, SOLID 원칙, 폴더 구조 | 1-2시간 |
| **기능-구현-가이드.md** | ⭐⭐⭐ | 아이콘, 고정지출, 예산, 통계 구현 | 3-4시간 |
| **07-버그수정-성능최적화.md** | ⭐⭐⭐ | useCallback, useMemo, 버그 수정 | 1-2시간 |

### 📘 선택 문서

| 문서 | 난이도 | 내용 | 소요 시간 |
|------|--------|------|-----------|
| **인프라-가이드.md** | ⭐⭐⭐ | PWA, Service Worker, Git 자동화 | 2시간 |

---

## 🎯 학습 순서 (권장)

### Week 1: 기초 다지기
1. **00-프로젝트-개요.md** 읽기
   - 전체 구조 파악
   - SOLID 원칙 이해
   - 폴더 구조 암기

2. **프로젝트 실행**
   ```bash
   npm install
   npm start
   ```
   - 실제 앱 둘러보기
   - 기능 하나하나 클릭해보기

### Week 2-3: 핵심 기능 학습
3. **기능-구현-가이드.md** 따라하기
   - 아이콘 커스터마이징
   - 고정지출 자동 등록
   - 예산 관리 시각화
   - 통계 트렌드 분석

4. **코드 직접 수정해보기**
   - 새 카테고리 추가
   - 색상 변경
   - 기능 커스터마이징

### Week 4: 고급 기법
5. **07-버그수정-성능최적화.md**
   - useCallback 최적화
   - useMemo 최적화
   - 성능 측정

### (선택) 배포 준비
6. **인프라-가이드.md**
   - PWA 전환
   - Service Worker
   - Git 자동화

---

## 📖 각 문서 요약

### 00-프로젝트-개요.md
**목적**: 프로젝트 전체를 한눈에 파악

**주요 내용**:
- 아키텍처 계층 구조 (UI → Hooks → Services → Data)
- SOLID 원칙 5가지 (SRP, OCP, LSP, ISP, DIP)
- 폴더별 역할 및 책임
- 데이터 흐름 (거래 추가, 가족 모드 전환)
- 학습 로드맵 (초급 → 중급 → 고급)

**언제 읽을까**: 프로젝트 시작 전 필수

---

### 기능-구현-가이드.md
**목적**: 실제 기능 구현 방법 학습

**주요 내용**:
1. **아이콘 커스터마이징**: Emoji Picker 구현
2. **고정지출 자동 등록**: LocalStorage + 중복 방지
3. **예산 관리 시각화**: 진행률 바 + 색상 코딩
4. **통계 트렌드 분석**: 최근 6개월 데이터 + 그래프

**핵심 패턴**:
- filter + reduce 배열 집계
- 날짜 계산 (월 마지막 날, N개월 전)
- 동적 스타일링 (인라인 style)
- 조건부 렌더링 (&&, 삼항 연산자)

**언제 읽을까**: 기능 추가/수정할 때

---

### 07-버그수정-성능최적화.md
**목적**: 성능 최적화 기법 마스터

**주요 내용**:
- **버그 수정 3건**: 파라미터 누락, 로직 중복, 의존성 배열
- **useCallback**: 함수 메모이제이션
- **useMemo**: 값 메모이제이션
- **성능 측정**: React DevTools Profiler

**Before/After 비교**:
- 렌더링 횟수 감소
- 불필요한 계산 방지
- 메모리 사용량 최적화

**언제 읽을까**: 성능 문제 발견 시 또는 코드 리뷰 전

---

### 인프라-가이드.md
**목적**: 배포 및 자동화 설정

**주요 내용**:
1. **PWA 자동 업데이트**: Service Worker 구현
2. **Git 자동화**: Phase 기반 커밋 전략

**실전 예제**:
- Service Worker 라이프사이클
- skipWaiting() + clients.claim()
- Pre-commit / Post-commit Hook

**언제 읽을까**: 프로덕션 배포 준비 시

---

## 🔍 빠른 검색

### 특정 주제 찾기

**React Hooks**:
- useCallback → `07-버그수정-성능최적화.md`
- useMemo → `07-버그수정-성능최적화.md`
- Custom Hooks → `00-프로젝트-개요.md`

**Firebase**:
- 실시간 리스너 → `00-프로젝트-개요.md`
- CRUD 함수 → `기능-구현-가이드.md`

**날짜 계산**:
- 월 마지막 날 → `기능-구현-가이드.md` (통계 부분)
- N개월 전 → `기능-구현-가이드.md` (통계 부분)

**배열 메서드**:
- filter + reduce → `기능-구현-가이드.md` (예산/통계)
- map + some → `00-프로젝트-개요.md`

**스타일링**:
- 동적 스타일 → `기능-구현-가이드.md` (예산)
- 색상 코딩 → `기능-구현-가이드.md` (예산)
- Tailwind 반응형 → `기능-구현-가이드.md`

---

## 💡 학습 팁

### 1. 실습 위주로
이론만 읽지 말고, 코드를 직접 수정해보세요.

```bash
# 추천 실습
1. 새 카테고리 추가 (constants/categories.js)
2. 버튼 variant 추가 (components/common/Button.js)
3. 새 통계 차트 추가 (pages/StatisticsPage.js)
```

### 2. 작은 단위로
한 번에 모든 문서를 읽지 말고, 필요한 부분만 읽으세요.

### 3. 질문 만들기
문서 읽으면서 "왜?"라는 질문을 계속 던지세요.

**예**:
- "왜 useCallback을 써야 하나?"
- "왜 fixedExpenseId가 필요한가?"
- "왜 Math.max(...array) 문법을 쓰나?"

### 4. 디버깅 연습
일부러 코드를 망가뜨려보고 고쳐보세요.

```javascript
// 실습: 이 코드의 문제점은?
const handleClick = () => {
  console.log(count);  // count가 의존성 배열에 없음
};
useCallback(handleClick, []);
```

---

## 🎓 추가 학습 자료

### 공식 문서
- [React 공식 문서](https://react.dev)
- [Firebase 문서](https://firebase.google.com/docs)
- [Tailwind CSS](https://tailwindcss.com)

### 추천 영상
- [React 성능 최적화](https://www.youtube.com/results?search_query=react+performance+optimization)
- [SOLID 원칙 설명](https://www.youtube.com/results?search_query=solid+principles)

### 블로그
- [Kent C. Dodds - useMemo and useCallback](https://kentcdodds.com/blog/usememo-and-usecallback)
- [React 공식 블로그](https://react.dev/blog)

---

## 🆘 도움이 필요할 때

1. **에러 발생 시**: 콘솔 에러 메시지 전체 복사 → 검색
2. **개념 이해 안 될 때**: 공식 문서 → 유튜브 → 블로그 순서로
3. **성능 문제**: React DevTools Profiler 사용

---

**최종 업데이트**: 2025-10-15
**작성자**: Claude Code
**버전**: 2.0 (통합 및 간소화)
