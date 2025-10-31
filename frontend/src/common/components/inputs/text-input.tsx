import { ChangeEvent, FC } from 'react';
import { FiX } from 'react-icons/fi';
import { twMerge } from 'tailwind-merge';

export interface TextInputProps {
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
}

export const TextInput: FC<TextInputProps> = ({
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
}) => {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
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
          type="text"
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
            onClear && value ? 'pr-12' : '',
          )}
        />
        {onClear && value && (
          <button
            type="button"
            onClick={onClear}
            className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-blue transition-colors duration-200"
            aria-label="Clear input"
          >
            <FiX className="h-6 w-6" />
          </button>
        )}
      </div>
      {error && <p className="mt-2 text-sm font-medium text-red-600">{error}</p>}
    </div>
  );
};
