import { twMerge } from 'tailwind-merge';

interface ProgressIndicatorProps {
  progress: number;
  title?: string;
  showPercentage?: boolean;
  className?: string;
  barClassName?: string;
}

export function ProgressIndicator({
  progress,
  title,
  showPercentage = true,
  className,
  barClassName,
}: ProgressIndicatorProps) {
  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <div className={twMerge('flex flex-col items-center gap-4 w-full max-w-sm px-6', className)}>
      {title && <div className="text-lg font-semibold text-black">{title}</div>}

      <div className="w-full bg-gray-500 rounded-full h-2 overflow-hidden">
        <div className={twMerge('h-full bg-white', barClassName)} style={{ width: `${clampedProgress}%` }} />
      </div>

      {showPercentage && <div className="text-sm text-black">{Math.round(clampedProgress)}%</div>}
    </div>
  );
}
