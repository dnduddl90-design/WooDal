import React from 'react';

/**
 * 재사용 가능한 입력 컴포넌트
 * SRP: 입력 필드 렌더링만 담당
 * OCP: type과 variant로 확장 가능
 */
export const Input = ({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  disabled = false,
  required = false,
  error,
  className = '',
  icon: Icon = null,
  ...props
}) => {
  const inputClasses = `w-full px-4 py-2 border rounded-xl transition-all duration-200 ${
    error ? 'border-red-500' : 'border-gray-300'
  } ${disabled ? 'bg-gray-100/50 cursor-not-allowed' : 'bg-white/80 backdrop-blur-sm'} ${className}`;

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <Icon size={20} />
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`${inputClasses} ${Icon ? 'pl-10' : ''}`}
          {...props}
        />
      </div>
      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
    </div>
  );
};
