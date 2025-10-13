import React, { useState } from 'react';
import { Heart, Eye, EyeOff } from 'lucide-react';
import { Button } from '../components/common';

/**
 * 로그인 페이지 컴포넌트
 * SRP: 로그인 UI만 담당
 * DIP: Props를 통해 로그인 핸들러 주입받음
 */
export const LoginPage = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (password === '1234') {
      onLogin();
      setError('');
      setPassword('');
    } else {
      setError('비밀번호가 틀렸습니다. (기본 비밀번호: 1234)');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-pink-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="glass-effect rounded-2xl shadow-2xl p-8 w-full max-w-md animate-scale-up">
        {/* 로고 섹션 */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4 animate-float">
            <span className="text-3xl">👨</span>
            <Heart className="text-red-500" size={24} />
            <span className="text-3xl">👩</span>
          </div>
          <h1 className="text-2xl font-bold gradient-text mb-2">
            우영 ♥ 달림
          </h1>
          <p className="text-gray-600">부부 가계부</p>
        </div>

        {/* 로그인 폼 */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              비밀번호
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="비밀번호를 입력하세요"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {error && (
              <p className="mt-2 text-sm text-red-600 animate-slide-in">
                {error}
              </p>
            )}
          </div>

          <Button
            variant="primary"
            size="lg"
            onClick={handleSubmit}
            className="w-full"
          >
            로그인
          </Button>
        </div>
      </div>
    </div>
  );
};
