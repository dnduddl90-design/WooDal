import React from 'react';

/**
 * 재사용 가능한 버튼 컴포넌트
 * SRP: 버튼 렌더링만 담당
 * OCP: variant와 size로 확장 가능
 */
export const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  icon: Icon = null,
  ...props
}) => {
  // 기본 스타일
  const baseClasses = 'btn-animate rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2';

  // variant별 스타일 (OCP - 확장 가능)
  const variantClasses = {
    primary: 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-lg',
    secondary: 'bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white/90 border border-gray-200 shadow-md',
    danger: 'bg-gradient-to-r from-red-500 to-pink-600 text-white hover:from-red-600 hover:to-pink-700 shadow-lg',
    success: 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 shadow-lg',
    outline: 'border-2 border-purple-500 text-purple-600 hover:bg-purple-50 bg-white/50 backdrop-blur-sm'
  };

  // size별 스타일 (OCP - 확장 가능)
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className} ${
    disabled ? 'opacity-50 cursor-not-allowed' : ''
  }`;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={classes}
      {...props}
    >
      {Icon && <Icon size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20} />}
      {children}
    </button>
  );
};
