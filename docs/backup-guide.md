# Firebase 데이터 백업 가이드

## 1. 자동 백업 (Firebase Console)
- Realtime Database → "데이터" 탭 → "내보내기 JSON"
- 주기적으로 수동 백업 권장 (월 1회)

## 2. 코드로 자동 백업 구현 (선택사항)
```javascript
// 관리자 SDK로 백업 스크립트 작성 가능
// 매일/매주 자동 백업을 Cloud Functions로 구현
```

## 3. 데이터 복구
- 백업한 JSON 파일을 Firebase Console에서 "가져오기"로 복원

## 백업 파일 저장 위치
- Google Drive
- 로컬 컴퓨터
- GitHub (private repository)
