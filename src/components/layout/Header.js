import React from 'react';
import { LogOut } from 'lucide-react';
import { Button } from '../common';

/**
 * 헤더 컴포넌트
 * SRP: 헤더 UI 렌더링만 담당
 * DIP: Props를 통해 데이터와 핸들러 주입받음
 */
export const Header = ({ user, onLogout }) => {
  if (!user) return null;

  return (
    <header className="glass-effect sticky top-0 z-40 backdrop-blur-md border-b border-white border-opacity-20">
      <div className="flex items-center justify-between px-6 py-4">
        {/* 로고 및 타이틀 */}
        <div className="flex items-center gap-3">
          <div className="text-4xl animate-float">{user.avatar}</div>
          <div>
            <h1 className="text-2xl font-bold gradient-text">
              우영달림 가계부
            </h1>
            <p className="text-sm text-gray-600">
              {user.name}님의 가계부
            </p>
          </div>
        </div>

        {/* 로그아웃 버튼 */}
        <Button
          variant="outline"
          size="sm"
          icon={LogOut}
          onClick={onLogout}
        >
          로그아웃
        </Button>
      </div>
    </header>
  );
};
