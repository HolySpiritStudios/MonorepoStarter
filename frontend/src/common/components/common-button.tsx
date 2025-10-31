import { ButtonHTMLAttributes, FC } from 'react';
import { FiLoader } from 'react-icons/fi';
import { twMerge } from 'tailwind-merge';

export interface CommonButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const CommonButton: FC<CommonButtonProps> = ({
  children,
  className = '',
  variant = 'primary',
  fullWidth = false,
  size = 'md',
  disabled = false,
  isLoading = false,
  type = 'button',
  ...rest
}) => {
  const baseStyles =
    'relative flex justify-center items-center rounded-2xl font-bold focus:outline-none focus:ring-4 focus:ring-offset-2 transition-all duration-200 hover:scale-105 shadow-lg';

  const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-lg',
    lg: 'px-8 py-4 text-xl',
  };

  const variantStyles = {
    primary: twMerge(
      'border-transparent text-black bg-blue hover:bg-blue-light focus:ring-blue border-0',
      disabled && 'bg-blue/50 hover:bg-blue/50 cursor-not-allowed',
    ),
    secondary: twMerge(
      'bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-200 hover:border-gray-300 focus:ring-blue',
      disabled && 'bg-gray-100 hover:bg-gray-100 cursor-not-allowed border-gray-200',
    ),
    outline: twMerge(
      'border-2 border-blue text-blue bg-transparent hover:bg-blue/10 focus:ring-blue',
      disabled && 'text-blue/50 hover:bg-transparent cursor-not-allowed border-blue/50',
    ),
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={twMerge(baseStyles, sizeStyles[size], variantStyles[variant], widthStyle, className)}
      {...rest}
    >
      {isLoading ? (
        <span className="flex items-center">
          <FiLoader className="mr-2 h-4 w-4 animate-spin" />
        </span>
      ) : (
        children
      )}
    </button>
  );
};
