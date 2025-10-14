/**
 * Firebase Authentication 서비스
 *
 * Google 로그인, 로그아웃 등의 인증 관련 기능을 제공합니다.
 */

import {
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth, googleProvider } from './config';

/**
 * Google 계정으로 로그인
 * @returns {Promise<User>} Firebase User 객체
 */
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Google 로그인 실패:', error);
    throw error;
  }
};

/**
 * 로그아웃
 */
export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('로그아웃 실패:', error);
    throw error;
  }
};

/**
 * 인증 상태 변경 리스너
 * @param {Function} callback - 인증 상태 변경 시 호출될 함수
 * @returns {Function} 리스너 해제 함수
 */
export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

/**
 * 현재 로그인된 사용자 가져오기
 * @returns {User|null} Firebase User 객체 또는 null
 */
export const getCurrentUser = () => {
  return auth.currentUser;
};
