import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message,
  onRetry,
  retryLabel = 'Retry',
}) => {
  return (
    <div className="py-12 px-6 text-center max-w-md mx-auto border border-rose-200/80 dark:border-rose-900/40 rounded-2xl bg-rose-50/40 dark:bg-rose-950/10 space-y-4">
      <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
        <AlertCircle className="w-5 h-5 stroke-2" />
      </div>

      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-rose-900 dark:text-rose-200">
          {title}
        </h3>
        <p className="text-xs text-rose-700/80 dark:text-rose-300/70 leading-relaxed">
          {message}
        </p>
      </div>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-rose-800 dark:text-rose-200 bg-rose-100 hover:bg-rose-200 dark:bg-rose-900/50 dark:hover:bg-rose-900/70 rounded-lg transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{retryLabel}</span>
        </button>
      )}
    </div>
  );
};
