import { ChangeEvent, FC, useState } from 'react';
import { FiEye, FiEyeOff, FiX } from 'react-icons/fi';
import { twMerge } from 'tailwind-merge';

export interface PasswordInputProps {
  id?: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
  onClear?: () => void;
  showPasswordToggle?: boolean;
}

export const PasswordInput: FC<PasswordInputProps> = ({
  id,
  name,
  value,
  onChange,
  placeholder = '',
  label,
  error,
  disabled = false,
  className = '',
  onClear,
  showPasswordToggle = true,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={twMerge('w-full', className)}>
      {label && (
        <label htmlFor={id} className="mb-2 block text-lg font-bold text-gray-900">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={id}
          name={name}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          className={twMerge(
            'w-full rounded-2xl border-2 px-6 py-4 text-lg font-medium shadow-sm focus:outline-none focus:ring-4 focus:ring-offset-0 transition-all duration-200',
            error
              ? 'border-red-400 focus:ring-red-200 bg-red-50'
              : 'border-gray-300 focus:ring-blue/20 focus:border-blue',
            disabled ? 'cursor-not-allowed bg-gray-100 text-gray-500' : 'bg-white text-gray-800 placeholder-gray-400',
            showPasswordToggle || (onClear && value) ? 'pr-16' : '',
          )}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-4 space-x-2">
          {onClear && value && (
            <button
              type="button"
              onClick={onClear}
              className="text-gray-400 hover:text-blue transition-colors duration-200"
              aria-label="Clear input"
            >
              <FiX className="h-6 w-6" />
            </button>
          )}
          {showPasswordToggle && (
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="text-gray-400 hover:text-blue transition-colors duration-200"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <FiEyeOff className="h-6 w-6" /> : <FiEye className="h-6 w-6" />}
            </button>
          )}
        </div>
      </div>
      {error && <p className="mt-2 text-sm font-medium text-red-600">{error}</p>}
    </div>
  );
};
