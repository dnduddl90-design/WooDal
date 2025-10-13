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
    secondary: 'bg-gray-200 text-gray-700 hover:bg-gray-300',
    danger: 'bg-red-500 text-white hover:bg-red-600',
    success: 'bg-green-500 text-white hover:bg-green-600',
    outline: 'border-2 border-blue-500 text-blue-500 hover:bg-blue-50'
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
