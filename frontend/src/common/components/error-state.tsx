import { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryText?: string;
  className?: string;
  fullScreen?: boolean;
  children?: ReactNode;
}

export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
  retryText = 'Retry',
  className,
  fullScreen = false,
  children,
}: ErrorStateProps) {
  const containerClass = twMerge(
    'flex items-center justify-center',
    fullScreen ? 'h-screen w-full' : 'flex-1',
    className,
  );

  return (
    <div className={containerClass}>
      <div className="flex flex-col items-center gap-4 text-center max-w-md p-6">
        <div className="text-destructive text-lg font-semibold">{title}</div>
        <div className="text-sm text-muted-foreground">{message}</div>

        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            {retryText}
          </button>
        )}

        {children}
      </div>
    </div>
  );
}
