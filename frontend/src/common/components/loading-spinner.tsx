import { LoaderCircle } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'h-6 w-6',
  md: 'h-10 w-10',
  lg: 'h-16 w-16',
};

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  return <LoaderCircle className={twMerge('animate-spin text-black', sizeClasses[size], className)} />;
}
