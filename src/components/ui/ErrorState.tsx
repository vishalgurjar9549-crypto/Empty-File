import { AlertCircle } from 'lucide-react';
import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  fullHeight?: boolean;
}

export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
  retryLabel = 'Try Again',
  fullHeight = false,
}: ErrorStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center ${
        fullHeight ? 'min-h-screen' : 'py-12'
      } px-4`}
    >
      {/* Error Icon */}
      <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-6">
        <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
      </div>

      {/* Error Message */}
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 text-center">
        {title}
      </h3>

      <p className="text-slate-600 dark:text-slate-400 text-center max-w-sm mb-6 leading-relaxed">
        {message}
      </p>

      {/* Retry Button */}
      {onRetry && (
        <Button variant="primary" size="md" onClick={onRetry}>
          {retryLabel}
        </Button>
      )}
    </div>
  );
}
