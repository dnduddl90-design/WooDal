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
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-900/10',
    secondary: 'bg-white/80 backdrop-blur-sm text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-md',
    danger: 'bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-900/10',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-900/10',
    outline: 'border border-indigo-200 text-indigo-700 hover:bg-indigo-50 bg-white/60 backdrop-blur-sm',
    ghost: 'text-slate-600 hover:bg-slate-100 bg-transparent'
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
