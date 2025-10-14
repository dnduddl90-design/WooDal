import React from 'react';
import {
  Calendar,
  BarChart3,
  Repeat,
  Search,
  Settings
} from 'lucide-react';

/**
 * 사이드바 컴포넌트
 * SRP: 네비게이션 메뉴 렌더링만 담당
 * OCP: menuItems를 통해 확장 가능
 */
export const Sidebar = ({ currentView, onViewChange }) => {
  // 메뉴 아이템 정의 (OCP - 확장 가능)
  const menuItems = [
    { id: 'calendar', icon: Calendar, label: '달력', color: 'text-blue-600' },
    { id: 'statistics', icon: BarChart3, label: '통계', color: 'text-purple-600' },
    { id: 'fixed', icon: Repeat, label: '고정지출', color: 'text-green-600' },
    { id: 'search', icon: Search, label: '검색', color: 'text-orange-600' },
    { id: 'settings', icon: Settings, label: '설정', color: 'text-gray-600' }
  ];

  return (
    <>
      {/* 데스크톱 사이드바 */}
      <aside className="glass-effect w-64 border-r border-white border-opacity-20 flex-shrink-0 hidden md:block">
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg scale-105'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <Icon
                  size={20}
                  className={isActive ? 'text-white' : item.color}
                />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* 모바일 하단 네비게이션 */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 glass-effect border-t border-white border-opacity-20 z-50 safe-area-bottom">
        <div className="flex justify-around items-center px-2 py-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg scale-105'
                    : 'text-gray-700 active:bg-gray-100'
                }`}
              >
                <Icon
                  size={22}
                  className={isActive ? 'text-white' : item.color}
                />
                <span className={`text-xs font-medium ${isActive ? 'text-white' : 'text-gray-600'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
