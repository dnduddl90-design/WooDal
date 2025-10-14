import React, { useState } from 'react';
import { Heart, LogIn } from 'lucide-react';
import { Button } from '../components/common';
import { signInWithGoogle } from '../firebase';

/**
 * 로그인 페이지 컴포넌트
 * Firebase Google 인증 사용
 * SRP: 로그인 UI만 담당
 * DIP: Props를 통해 로그인 핸들러 주입받음
 */
export const LoginPage = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError('');
      const user = await signInWithGoogle();
      console.log('✅ Google 로그인 성공:', user.email);
      onLogin(user);
    } catch (error) {
      console.error('❌ Google 로그인 실패:', error);
      setError('로그인에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
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

        {/* 로그인 안내 */}
        <div className="mb-6 text-center">
          <p className="text-gray-600 text-sm">
            Google 계정으로 로그인하여<br />
            우영/달림 부부 가계부를 사용하세요
          </p>
        </div>

        {/* Google 로그인 버튼 */}
        <div className="space-y-4">
          <Button
            variant="primary"
            size="lg"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>로그인 중...</span>
              </>
            ) : (
              <>
                <LogIn size={20} />
                <span>Google 계정으로 로그인</span>
              </>
            )}
          </Button>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm animate-slide-in">
              {error}
            </div>
          )}
        </div>

        {/* 안내 문구 */}
        <div className="mt-6 text-center text-xs text-gray-500">
          <p>🔒 안전한 Firebase 인증을 사용합니다</p>
          <p className="mt-1">로그인하면 실시간 동기화가 가능합니다</p>
        </div>
      </div>
    </div>
  );
};
