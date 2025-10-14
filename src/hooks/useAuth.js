import { useState, useEffect } from 'react';
import { onAuthChange, logout as firebaseLogout } from '../firebase';

/**
 * 인증 관리 커스텀 훅 (Firebase 사용)
 * SRP: 인증 상태 및 로직만 담당
 */
export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * Firebase 인증 상태 변경 감지
   */
  useEffect(() => {
    const unsubscribe = onAuthChange((firebaseUser) => {
      if (firebaseUser) {
        // Firebase User를 앱에서 사용할 형태로 변환
        // 기존 LocalStorage 데이터와 호환되도록 user1 ID 유지

        // Google 이름에서 이메일 제거하고 실제 이름만 추출
        let displayName = firebaseUser.displayName || firebaseUser.email.split('@')[0];

        // 이메일 형식이면 @앞부분만 사용
        if (displayName.includes('@')) {
          displayName = displayName.split('@')[0];
        }

        const user = {
          id: 'user1', // 기존 LocalStorage 데이터 호환을 위해 고정
          firebaseId: firebaseUser.uid, // Firebase UID는 별도 저장
          email: firebaseUser.email,
          name: displayName, // 깔끔한 이름만 표시
          avatar: '👨', // 고정 아바타 (나중에 커스터마이징 가능)
          role: 'admin' // 로그인한 사람은 관리자로 설정
        };
        setCurrentUser(user);
        setIsAuthenticated(true);
        console.log('✅ 인증 상태 변경: 로그인됨', user.email);
        console.log('👤 사용자 정보:', user);
      } else {
        setCurrentUser(null);
        setIsAuthenticated(false);
        console.log('✅ 인증 상태 변경: 로그아웃됨');
      }
      setLoading(false);
    });

    // 클린업: 컴포넌트 언마운트 시 리스너 제거
    return () => unsubscribe();
  }, []);

  /**
   * 로그인 처리
   * LoginPage에서 Google 로그인 후 호출
   */
  const handleLogin = (firebaseUser) => {
    // Firebase 인증 리스너가 자동으로 처리하므로 여기서는 아무것도 안 해도 됨
    console.log('✅ 로그인 성공:', firebaseUser.email);
  };

  /**
   * 로그아웃 처리
   */
  const handleLogout = async () => {
    try {
      await firebaseLogout();
      console.log('✅ 로그아웃 성공');
    } catch (error) {
      console.error('❌ 로그아웃 실패:', error);
    }
  };

  return {
    isAuthenticated,
    currentUser,
    loading,
    handleLogin,
    handleLogout
  };
};
