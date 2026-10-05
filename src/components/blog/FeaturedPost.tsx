import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Post } from '../../types/database';

interface FeaturedPostProps {
  post: Post;
  onSelect: (slug: string) => void;
}

export const FeaturedPost: React.FC<FeaturedPostProps> = ({ post, onSelect }) => {
  const wordCount = post.markdown ? post.markdown.trim().split(/\s+/).length : 0;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  const formattedDate = new Date(post.created_at).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div
      onClick={() => onSelect(post.slug)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(post.slug);
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`Featured inquiry: ${post.title}`}
      className="group cursor-pointer border border-neutral-200/90 dark:border-neutral-800/90 rounded-2xl overflow-hidden bg-white dark:bg-neutral-900/40 hover:border-neutral-400 dark:hover:border-neutral-600 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-neutral-900 dark:focus-visible:ring-white focus-visible:outline-hidden"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
        {/* Cover Image Container */}
        <div className="lg:col-span-7 aspect-16/10 lg:aspect-auto overflow-hidden bg-neutral-100 dark:bg-neutral-850 relative min-h-[260px] sm:min-h-[320px]">
          {post.cover_image ? (
            <img
              src={post.cover_image}
              alt={post.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-[1.015] transition-transform duration-300 ease-out"
              loading="eager"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-neutral-200 dark:bg-neutral-800">
              <span className="font-serif text-3xl italic text-neutral-400 font-bold">Featured Inquiry</span>
            </div>
          )}
        </div>

        {/* Content Panel */}
        <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            {/* Zero-Pill Lead */}
            <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
              <span className="font-semibold text-neutral-900 dark:text-neutral-100 tracking-wider uppercase text-[11px]">
                Featured Inquiry
              </span>
              <span aria-hidden="true" className="text-neutral-300 dark:text-neutral-700">·</span>
              {post.tags[0] && <span>{post.tags[0]}</span>}
              <span aria-hidden="true" className="text-neutral-300 dark:text-neutral-700">·</span>
              <span className="font-mono tabular-nums">{readTime} min read</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-neutral-950 dark:text-neutral-50 leading-[1.25] tracking-tight group-hover:text-neutral-700 dark:group-hover:text-neutral-200 transition-colors [text-wrap:balance]">
              {post.title}
            </h2>

            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed font-sans line-clamp-3">
              {post.excerpt || post.markdown.substring(0, 160).replace(/[#*`_]/g, '')}
            </p>
          </div>

          <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {post.profiles?.avatar_url ? (
                <img
                  src={post.profiles.avatar_url}
                  alt=""
                  className="w-8 h-8 rounded-full object-cover ring-1 ring-neutral-200 dark:ring-neutral-700"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-800 text-xs flex items-center justify-center font-bold text-neutral-800 dark:text-neutral-200">
                  {post.profiles?.display_name?.charAt(0) || 'A'}
                </div>
              )}
              <div>
                <div className="text-xs font-semibold text-neutral-900 dark:text-neutral-200">
                  {post.profiles?.display_name || 'Staff Writer'}
                </div>
                <div className="text-[11px] text-neutral-500 font-mono tabular-nums">
                  {formattedDate}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-medium text-neutral-900 dark:text-neutral-100 group-hover:translate-x-1 transition-transform">
              <span>Read inquiry</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
