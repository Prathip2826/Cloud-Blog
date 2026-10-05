import React from 'react';
import { BookOpen, CheckCircle2, FileEdit, Eye } from 'lucide-react';

interface DashboardStatsProps {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  totalViews: number;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  totalPosts,
  publishedPosts,
  draftPosts,
  totalViews,
}) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* Total Articles */}
      <div className="p-4 sm:p-5 rounded-xl border border-neutral-200/90 dark:border-neutral-800/90 bg-white dark:bg-neutral-900/40 shadow-2xs">
        <div className="flex items-center justify-between text-neutral-500 mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-mono">
            Total Articles
          </span>
          <BookOpen className="w-4 h-4 text-neutral-400" />
        </div>
        <div className="text-2xl sm:text-3xl font-serif font-bold text-neutral-950 dark:text-neutral-50 tabular-nums">
          {totalPosts}
        </div>
        <div className="text-[11px] text-neutral-500 mt-1">Authored manuscripts</div>
      </div>

      {/* Published */}
      <div className="p-4 sm:p-5 rounded-xl border border-neutral-200/90 dark:border-neutral-800/90 bg-white dark:bg-neutral-900/40 shadow-2xs">
        <div className="flex items-center justify-between text-neutral-500 mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-mono">
            Published
          </span>
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="text-2xl sm:text-3xl font-serif font-bold text-neutral-950 dark:text-neutral-50 tabular-nums">
          {publishedPosts}
        </div>
        <div className="text-[11px] text-neutral-500 mt-1">Live to all readers</div>
      </div>

      {/* Drafts */}
      <div className="p-4 sm:p-5 rounded-xl border border-neutral-200/90 dark:border-neutral-800/90 bg-white dark:bg-neutral-900/40 shadow-2xs">
        <div className="flex items-center justify-between text-neutral-500 mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-mono">
            Drafts
          </span>
          <FileEdit className="w-4 h-4 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="text-2xl sm:text-3xl font-serif font-bold text-neutral-950 dark:text-neutral-50 tabular-nums">
          {draftPosts}
        </div>
        <div className="text-[11px] text-neutral-500 mt-1">Unpublished revisions</div>
      </div>

      {/* Total Views */}
      <div className="p-4 sm:p-5 rounded-xl border border-neutral-200/90 dark:border-neutral-800/90 bg-white dark:bg-neutral-900/40 shadow-2xs">
        <div className="flex items-center justify-between text-neutral-500 mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-mono">
            Readership
          </span>
          <Eye className="w-4 h-4 text-sky-600 dark:text-sky-400" />
        </div>
        <div className="text-2xl sm:text-3xl font-serif font-bold text-neutral-950 dark:text-neutral-50 tabular-nums">
          {totalViews.toLocaleString()}
        </div>
        <div className="text-[11px] text-neutral-500 mt-1">Cumulative views</div>
      </div>
    </div>
  );
};
