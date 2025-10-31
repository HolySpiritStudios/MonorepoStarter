import { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

import { LoadingSpinner } from './loading-spinner';

interface LoadingStateProps {
  message?: string;
  className?: string;
  spinnerSize?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
  children?: ReactNode;
}

export function LoadingState({
  message = 'Loading...',
  className,
  spinnerSize = 'md',
  fullScreen = false,
  children,
}: LoadingStateProps) {
  const containerClass = twMerge(
    'flex items-center justify-center',
    fullScreen ? 'h-screen w-full' : 'flex-1',
    className,
  );

  return (
    <div className={containerClass}>
      <div className="flex flex-col items-center gap-4 text-center">
        <LoadingSpinner size={spinnerSize} />
        {message && <div className="text-black">{message}</div>}
        {children}
      </div>
    </div>
  );
}
