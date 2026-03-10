# 🚀 Firebase 수동 배포 가이드

**프로젝트**: 우영달림 가계부
**작성일**: 2025-10-21
**대상**: Firebase Hosting 수동 배포 방법

---

## 📋 목차

1. [사전 준비](#사전-준비)
2. [배포 절차](#배포-절차)
3. [배포 확인](#배포-확인)
4. [롤백 방법](#롤백-방법)
5. [문제 해결](#문제-해결)
6. [참고 사항](#참고-사항)

---

## 사전 준비

### 1. 필수 도구 설치 확인

```bash
# Node.js 버전 확인 (18 이상 권장)
node --version

# npm 버전 확인
npm --version

# Firebase CLI 설치 확인
firebase --version
```

### 2. Firebase CLI 설치 (미설치 시)

```bash
# npm으로 전역 설치
npm install -g firebase-tools

# 설치 확인
firebase --version
```

### 3. Firebase 로그인 확인

```bash
# 현재 로그인 상태 확인
firebase login:list

# 로그인되어 있지 않은 경우
firebase login

# 브라우저가 열리면 Google 계정으로 로그인
# "Firebase CLI Login Successful" 메시지 확인
```

---

## 배포 절차

### Step 1: 프로젝트 디렉토리로 이동

```bash
# PowerShell 또는 CMD에서
cd D:\1.Project\test\WooDal

# 현재 위치 확인
pwd
```

### Step 2: 프로덕션 빌드 생성

```bash
# React 앱 빌드 시작
npm run build

# 빌드 성공 메시지 확인
# "The build folder is ready to be deployed." 출력 대기
```

**빌드 결과 확인:**
- `build/` 폴더가 생성됨
- 빌드 크기 정보 확인 (예: `264.08 kB (gzip)`)
- 경고 메시지는 무시 가능 (ESLint 경고)

### Step 3: Firebase 프로젝트 확인

```bash
# 현재 연결된 Firebase 프로젝트 확인
firebase projects:list

# 또는
firebase use
```

**예상 출력:**
```
Current project: woodal-budget (woodal-budget)
```

**프로젝트가 설정되어 있지 않은 경우:**
```bash
# 프로젝트 선택
firebase use woodal-budget

# 또는 대화형으로 선택
firebase use --add
```

### Step 4: 배포 실행

```bash
# Hosting만 배포 (가장 빠름)
firebase deploy --only hosting

# 전체 배포 (Hosting + Database Rules + Functions 등)
firebase deploy
```

**배포 진행 과정:**
```
=== Deploying to 'woodal-budget'...

i  deploying hosting
i  hosting[woodal-budget]: beginning deploy...
i  hosting[woodal-budget]: found 15 files in build
i  hosting: uploading new files [0/4] (0%)
i  hosting: upload complete
✔  hosting[woodal-budget]: file upload complete
i  hosting[woodal-budget]: finalizing version...
✔  hosting[woodal-budget]: version finalized
i  hosting[woodal-budget]: releasing new version...
✔  hosting[woodal-budget]: release complete

✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/woodal-budget/overview
Hosting URL: https://woodal-budget.web.app
```

### Step 5: 배포 완료 확인

배포 성공 시 다음 정보가 표시됩니다:

- **Project Console**: Firebase 콘솔 URL
- **Hosting URL**: 배포된 웹사이트 URL

---

## 배포 확인

### 1. 브라우저에서 확인

```
https://woodal-budget.web.app
```

**확인 사항:**
- ✅ 페이지가 정상적으로 로드되는지
- ✅ 최신 변경사항이 반영되었는지
- ✅ 로그인 기능이 작동하는지
- ✅ 모바일/데스크톱 모두 정상 작동하는지

### 2. Firebase Console에서 확인

1. [Firebase Console](https://console.firebase.google.com) 접속
2. **woodal-budget** 프로젝트 선택
3. 좌측 메뉴에서 **Hosting** 클릭
4. **배포 기록** 탭에서 최신 배포 확인

**확인할 정보:**
- 배포 시간
- 배포한 파일 수
- 배포 상태 (Live)
- 배포 ID

### 3. 개발자 도구로 캐시 확인

브라우저에서 변경사항이 보이지 않는 경우:

**크롬/엣지:**
```
Ctrl + Shift + R (강제 새로고침)
또는
F12 → Network 탭 → Disable cache 체크 → F5
```

**파이어폭스:**
```
Ctrl + Shift + R (강제 새로고침)
또는
Ctrl + F5
```

---

## 롤백 방법

### 방법 1: Firebase Console에서 롤백

1. [Firebase Console](https://console.firebase.google.com) → **woodal-budget**
2. **Hosting** → **배포 기록** 탭
3. 이전 버전 선택 → **롤백** 버튼 클릭
4. 확인 다이얼로그에서 **롤백** 클릭

### 방법 2: CLI로 이전 버전 재배포

```bash
# 배포 기록 확인
firebase hosting:channel:list

# 특정 릴리즈 ID로 롤백 (Firebase Console에서 ID 확인)
firebase hosting:clone SOURCE_SITE_ID:SOURCE_CHANNEL_ID TARGET_SITE_ID:live
```

### 방법 3: Git에서 이전 버전 빌드 후 재배포

```bash
# 이전 커밋으로 체크아웃
git log --oneline -10
git checkout <이전-커밋-해시>

# 빌드 후 배포
npm run build
firebase deploy --only hosting

# 다시 최신 버전으로 돌아오기
git checkout main
```

---

## 문제 해결

### 1. `firebase: command not found`

**원인**: Firebase CLI가 설치되지 않았거나 PATH에 없음

**해결:**
```bash
# Firebase CLI 재설치
npm install -g firebase-tools

# Windows에서 PowerShell 재시작
# 또는 전체 경로로 실행
npx firebase --version
```

### 2. `Error: HTTP Error: 403, The caller does not have permission`

**원인**: Firebase 로그인이 안 되어 있거나 권한 없음

**해결:**
```bash
# 로그아웃 후 재로그인
firebase logout
firebase login

# 프로젝트 권한 확인
firebase projects:list
```

### 3. `Build failed` 에러

**원인**: React 빌드 중 에러 발생

**해결:**
```bash
# node_modules 삭제 후 재설치
rm -rf node_modules package-lock.json
npm install

# 캐시 삭제 후 재빌드
npm cache clean --force
npm run build
```

### 4. 배포 후 변경사항이 안 보임

**원인**: 브라우저 캐시 또는 CDN 캐시

**해결:**
```bash
# 1. 강제 새로고침 (Ctrl + Shift + R)

# 2. 시크릿 모드로 확인

# 3. Firebase 캐시 확인 (firebase.json)
# "headers" 섹션의 cache-control 설정 확인

# 4. 5-10분 후 재확인 (CDN 캐시 갱신 대기)
```

### 5. `hosting.json` 파일 찾을 수 없음

**원인**: `firebase.json` 설정 오류

**해결:**
```bash
# firebase.json 확인
cat firebase.json

# public 폴더가 "build"로 설정되어 있는지 확인
# {
#   "hosting": {
#     "public": "build",
#     ...
#   }
# }

# 필요시 재초기화
firebase init hosting
```

---

## 참고 사항

### 배포 전 체크리스트

- [ ] 코드 변경사항 테스트 완료 (`npm start`로 로컬 확인)
- [ ] ESLint 에러 없음 (경고는 OK)
- [ ] Git 커밋 완료 (선택사항)
- [ ] 환경 변수 설정 확인 (`.env` 파일)
- [ ] Firebase 프로젝트 연결 확인

### 배포 시간

- **빌드 시간**: 약 30초 ~ 1분
- **업로드 시간**: 약 10초 ~ 30초 (파일 크기에 따라)
- **CDN 배포 시간**: 약 5분 ~ 10분 (전세계 반영)

### 배포 비용

- **Firebase Hosting 무료 한도**:
  - 저장소: 10GB
  - 전송량: 360MB/일
  - 빌드: 무제한

- **현재 프로젝트**:
  - 빌드 크기: ~264KB (gzip)
  - 파일 수: 15개
  - 무료 한도 내에서 충분히 사용 가능

### 유용한 명령어

```bash
# 배포 기록 확인
firebase hosting:channel:list

# 로컬에서 프로덕션 빌드 미리보기
npm run build
npx serve -s build
# http://localhost:3000 접속하여 확인

# Firebase 프로젝트 정보 확인
firebase projects:list

# 특정 사이트만 배포
firebase deploy --only hosting:woodal-budget

# 배포 메시지와 함께
firebase deploy --only hosting -m "모바일 UX 개선"

# 배포 취소 (진행 중일 때만)
Ctrl + C
```

### 환경별 배포

```bash
# 개발 환경 (채널 생성)
firebase hosting:channel:deploy preview

# 스테이징 환경
firebase hosting:channel:deploy staging

# 프로덕션 (기본)
firebase deploy --only hosting
```

---

## 자동화 옵션

### GitHub Actions 자동 배포 (선택사항)

`.github/workflows/firebase-hosting.yml` 파일 생성:

```yaml
name: Deploy to Firebase Hosting
on:
  push:
    branches:
      - main
jobs:
  build_and_deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm ci && npm run build
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          channelId: live
          projectId: woodal-budget
```

**주의**: Secrets 설정 필요 (GitHub Repository Settings)

---

## 추가 리소스

- [Firebase Hosting 공식 문서](https://firebase.google.com/docs/hosting)
- [Firebase CLI 레퍼런스](https://firebase.google.com/docs/cli)
- [React 배포 가이드](https://create-react-app.dev/docs/deployment/)
- [Firebase 콘솔](https://console.firebase.google.com)

---

**작성자**: Claude Code
**최종 수정**: 2025-10-21
**프로젝트**: 우영달림 가계부 (WooDal Budget)
