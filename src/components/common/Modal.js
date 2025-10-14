import React from 'react';
import { X } from 'lucide-react';

/**
 * 재사용 가능한 모달 컴포넌트
 * SRP: 모달 렌더링만 담당
 * OCP: size로 확장 가능
 */
export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true
}) => {
  if (!isOpen) return null;

  // size별 스타일 (OCP - 확장 가능)
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-full mx-4'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 modal-backdrop animate-fade-in">
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      <div className={`relative bg-white rounded-xl sm:rounded-2xl shadow-2xl ${sizeClasses[size]} w-full animate-scale-up glass-effect`}>
        {/* 헤더 */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
            {title && (
              <h2 className="text-lg sm:text-2xl font-bold text-gray-800 gradient-text">
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="sm:w-6 sm:h-6 text-gray-600" />
              </button>
            )}
          </div>
        )}

        {/* 내용 */}
        <div className="p-4 sm:p-6 max-h-[calc(100vh-120px)] sm:max-h-[calc(100vh-200px)] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};
