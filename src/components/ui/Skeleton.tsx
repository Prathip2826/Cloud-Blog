import React from 'react';

export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div
    className={`bg-neutral-200/70 dark:bg-neutral-800/60 animate-pulse rounded-md ${className}`}
    aria-hidden="true"
  />
);

export const PostCardSkeleton: React.FC = () => (
  <div className="flex flex-col border border-neutral-200/80 dark:border-neutral-800/80 rounded-xl overflow-hidden bg-white dark:bg-neutral-900/40 p-0">
    <Skeleton className="aspect-16/10 w-full rounded-none" />
    <div className="p-5 space-y-3">
      <div className="flex items-center gap-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-20" />
      </div>
      <Skeleton className="h-6 w-5/6" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-4/6" />
      <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="w-5 h-5 rounded-full" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  </div>
);

export const TableRowSkeleton: React.FC<{ columns?: number }> = ({ columns = 5 }) => (
  <tr className="border-b border-neutral-100 dark:border-neutral-800/80">
    {Array.from({ length: columns }).map((_, i) => (
      <td key={i} className="py-3.5 px-4">
        <Skeleton className={`h-4 ${i === 0 ? 'w-48' : i === columns - 1 ? 'w-16 ml-auto' : 'w-24'}`} />
      </td>
    ))}
  </tr>
);
