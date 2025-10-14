import { useState, useEffect } from 'react';

/**
 * 테마 관리 커스텀 훅
 * 라이트/다크/컬러풀 테마를 관리하고 localStorage에 저장
 */
export const useTheme = () => {
  // localStorage에서 테마 불러오기 (기본값: 'light')
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('app-theme');
    return savedTheme || 'light';
  });

  // 테마 변경 시 body 클래스 업데이트 및 localStorage 저장
  useEffect(() => {
    // 기존 테마 클래스 제거
    document.body.classList.remove('dark-theme', 'colorful-theme');

    // 새 테마 클래스 추가 (light는 기본이므로 클래스 불필요)
    if (theme === 'dark') {
      document.body.classList.add('dark-theme');
    } else if (theme === 'colorful') {
      document.body.classList.add('colorful-theme');
    }

    // localStorage에 저장
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  // 테마 변경 함수
  const changeTheme = (newTheme) => {
    if (['light', 'dark', 'colorful'].includes(newTheme)) {
      setTheme(newTheme);
    }
  };

  // 테마 토글 함수 (light <-> dark)
  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return {
    theme,
    changeTheme,
    toggleTheme,
    isDark: theme === 'dark',
    isLight: theme === 'light',
    isColorful: theme === 'colorful'
  };
};
