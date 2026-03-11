/**
 * Firebase 설정 및 초기화
 *
 * 이 파일은 Firebase와의 연결을 설정합니다.
 * .env 파일의 환경 변수를 사용하여 안전하게 설정을 관리합니다.
 */

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

// Firebase 설정 객체
// 환경 변수(.env 파일)에서 값을 가져옵니다
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Firebase 설정 값 검증
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error('❌ Firebase 설정 오류: .env 파일을 확인하세요!');
  console.error('환경 변수가 제대로 로드되지 않았습니다.');
}

// Firebase 앱 초기화
const app = initializeApp(firebaseConfig);

// 인증 서비스 초기화
export const auth = getAuth(app);

// Google 로그인 Provider
export const googleProvider = new GoogleAuthProvider();

// Realtime Database 초기화
export const database = getDatabase(app);
