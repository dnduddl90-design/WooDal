import { useState } from 'react';
import { USERS } from '../constants';

/**
 * 인증 관리 커스텀 훅
 * SRP: 인증 상태 및 로직만 담당
 */
export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  /**
   * 로그인 처리
   */
  const handleLogin = () => {
    // 간단한 인증 (실제로는 서버에서 처리)
    setIsAuthenticated(true);
    setCurrentUser(USERS.user1);
  };

  /**
   * 로그아웃 처리
   */
  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  return {
    isAuthenticated,
    currentUser,
    handleLogin,
    handleLogout
  };
};
