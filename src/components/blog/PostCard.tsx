import React from 'react';
import { Post } from '../../types/database';
import { ArrowUpRight } from 'lucide-react';

interface PostCardProps {
  post: Post;
  onSelect: (slug: string) => void;
  priority?: boolean;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onSelect, priority = false }) => {
  // Reading time estimate (approx 200 words/min)
  const wordCount = post.markdown ? post.markdown.trim().split(/\s+/).length : 0;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  const formattedDate = new Date(post.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <article
      onClick={() => onSelect(post.slug)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(post.slug);
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`Read article: ${post.title}`}
      className="group cursor-pointer flex flex-col justify-between border border-neutral-200/90 dark:border-neutral-800/90 rounded-xl overflow-hidden bg-white dark:bg-neutral-900/40 hover:border-neutral-400 dark:hover:border-neutral-600 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-neutral-900 dark:focus-visible:ring-white focus-visible:outline-hidden"
    >
      <div>
        {/* Cover image container */}
        <div className="aspect-16/10 w-full overflow-hidden bg-neutral-100 dark:bg-neutral-850 relative">
          {post.cover_image ? (
            <img
              src={post.cover_image}
              alt={post.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300 ease-out"
              loading={priority ? 'eager' : 'lazy'}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center p-6 bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-900 dark:to-neutral-800 text-neutral-400">
              <span className="font-serif text-xl italic font-semibold text-neutral-500">
                {post.title.charAt(0)}
              </span>
            </div>
          )}
          {!post.published && (
            <div className="absolute top-3 left-3 bg-neutral-900/95 text-amber-300 text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded shadow-xs">
              Draft
            </div>
          )}
        </div>

        {/* Content body */}
        <div className="p-5 sm:p-6 space-y-3">
          {/* Zero-Pill Metadata Line */}
          <div className="flex items-center gap-2 text-[11px] text-neutral-500 dark:text-neutral-400">
            {post.tags.length > 0 && (
              <span className="font-semibold text-neutral-700 dark:text-neutral-300 tracking-wide uppercase">
                {post.tags[0]}
              </span>
            )}
            {post.tags.length > 0 && <span aria-hidden="true" className="text-neutral-300 dark:text-neutral-600">·</span>}
            <span className="font-mono tabular-nums">{readTime} min read</span>
          </div>

          <h3 className="text-lg sm:text-[1.18rem] font-serif font-bold text-neutral-950 dark:text-neutral-50 group-hover:text-neutral-700 dark:group-hover:text-neutral-200 transition-colors line-clamp-2 leading-[1.35] tracking-tight">
            {post.title}
          </h3>

          <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2 leading-relaxed font-sans">
            {post.excerpt || post.markdown.substring(0, 130).replace(/[#*`_]/g, '')}
          </p>
        </div>
      </div>

      {/* Author and Date Footer */}
      <div className="px-5 sm:px-6 pb-5 pt-3 flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 border-t border-neutral-100 dark:border-neutral-800/80">
        <div className="flex items-center gap-2.5">
          {post.profiles?.avatar_url ? (
            <img
              src={post.profiles.avatar_url}
              alt=""
              className="w-5 h-5 rounded-full object-cover ring-1 ring-neutral-200 dark:ring-neutral-700"
            />
          ) : (
            <div className="w-5 h-5 rounded-full bg-neutral-200 dark:bg-neutral-800 text-[10px] flex items-center justify-center font-semibold text-neutral-800 dark:text-neutral-200">
              {post.profiles?.display_name?.charAt(0) || 'A'}
            </div>
          )}
          <span className="font-medium text-neutral-800 dark:text-neutral-200 truncate max-w-[130px]">
            {post.profiles?.display_name || 'Staff Writer'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 font-mono text-[11px] tabular-nums text-neutral-500">
          <span>{formattedDate}</span>
          <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-neutral-900 dark:text-white" />
        </div>
      </div>
    </article>
  );
};
