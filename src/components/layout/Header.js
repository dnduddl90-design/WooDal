import React, { useState } from 'react';
import { LogOut, Bell, Check, X } from 'lucide-react';
import { Button } from '../common';

/**
 * 헤더 컴포넌트
 * SRP: 헤더 UI 렌더링만 담당
 * DIP: Props를 통해 데이터와 핸들러 주입받음
 */
export const Header = ({
  user,
  onLogout,
  pendingInvitations = [],
  onAcceptInvitation,
  onRejectInvitation
}) => {
  const [showInvitations, setShowInvitations] = useState(false);

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

        {/* 우측 버튼들 */}
        <div className="flex items-center gap-3">
          {/* 초대 알림 */}
          {pendingInvitations.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setShowInvitations(!showInvitations)}
                className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <Bell size={24} className="text-blue-600" />
                <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                  {pendingInvitations.length}
                </span>
              </button>

              {/* 초대 드롭다운 */}
              {showInvitations && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 animate-fade-in">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="font-bold text-gray-800">가족 초대 ({pendingInvitations.length})</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {pendingInvitations.map((invitation) => (
                      <div key={invitation.id} className="p-4 border-b border-gray-100 hover:bg-gray-50">
                        <div className="mb-3">
                          <p className="font-medium text-gray-900">{invitation.familyName}</p>
                          <p className="text-sm text-gray-600 mt-1">
                            {invitation.inviterName}님이 초대했습니다
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(invitation.createdAt).toLocaleString('ko-KR')}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="success"
                            size="sm"
                            icon={Check}
                            onClick={() => {
                              onAcceptInvitation(invitation.id);
                              setShowInvitations(false);
                            }}
                            className="flex-1"
                          >
                            수락
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            icon={X}
                            onClick={() => {
                              onRejectInvitation(invitation.id);
                            }}
                            className="flex-1"
                          >
                            거절
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

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
      </div>

      {/* 오버레이 */}
      {showInvitations && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowInvitations(false)}
        />
      )}
    </header>
  );
};
