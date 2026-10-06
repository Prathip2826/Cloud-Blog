import React, { useState, useEffect } from 'react';
import { Search, X, ArrowRight, Tag, BookOpen, Image as ImageIcon } from 'lucide-react';
import { Post } from '../../types/database';
import { getPosts } from '../../lib/supabase/api';
import { getCoverImageUrl } from '../../lib/supabase/storage';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPost: (slug: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectPost,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);

  // Debounced search
  useEffect(() => {
    if (!isOpen) return;

    if (!query.trim()) {
      // show recent posts
      getPosts({ publishedOnly: true, limit: 5 }).then(setResults);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const posts = await getPosts({
          publishedOnly: true,
          search: query.trim(),
        });
        setResults(posts);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[75vh]">
        {/* Input Header */}
        <div className="flex items-center px-4 py-3.5 border-b border-neutral-200 dark:border-neutral-800 gap-3">
          <Search className="w-5 h-5 text-neutral-400 shrink-0" />
          <input
            type="text"
            placeholder="Search articles by title, tags, or content..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-hidden"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="text-[10px] font-mono text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded border border-neutral-200 dark:border-neutral-700">
            ESC
          </span>
        </div>

        {/* Quick Tag Pills */}
        <div className="px-4 py-2.5 bg-neutral-50 dark:bg-neutral-900/80 border-b border-neutral-100 dark:border-neutral-800/60 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-[11px] uppercase tracking-wider text-neutral-400 shrink-0">Tags:</span>
          {['Architecture', 'Edge', 'PostgreSQL', 'Design', 'Distributed Systems'].map((t) => (
            <button
              key={t}
              onClick={() => setQuery(t)}
              className="px-2.5 py-1 rounded-md text-[11px] bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-500 text-neutral-700 dark:text-neutral-300 shrink-0 transition-colors cursor-pointer"
            >
              {t}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-3 space-y-1 flex-1">
          {loading ? (
            <div className="py-12 text-center text-xs text-neutral-400">Searching publications...</div>
          ) : results.length > 0 ? (
            results.map((post) => {
              const coverUrl = getCoverImageUrl(post.cover_image);

              return (
                <div
                  key={post.id}
                  onClick={() => {
                    onSelectPost(post.slug);
                    onClose();
                  }}
                  className="group flex items-center justify-between p-3 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800/60 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3 pr-4 min-w-0">
                    {coverUrl && (
                      <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-700/80">
                        <img
                          src={coverUrl}
                          alt=""
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.error('Cover image failed to load:', {
                              url: coverUrl,
                              coverImage: post.cover_image,
                            });
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 text-[11px] text-neutral-400 font-mono">
                        <span>{post.tags[0] || 'Article'}</span>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums">
                          {new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <h4 className="text-sm font-serif font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-neutral-700 dark:group-hover:text-white transition-colors truncate">
                        {post.title}
                      </h4>
                      <p className="text-xs text-neutral-500 line-clamp-1">
                        {post.excerpt || post.markdown.substring(0, 100)}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white shrink-0 group-hover:translate-x-0.5 transition-all" />
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center space-y-2">
              <BookOpen className="w-8 h-8 text-neutral-400 mx-auto stroke-1" />
              <div className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                No articles found
              </div>
              <p className="text-xs text-neutral-500 max-w-xs mx-auto">
                No publication matches "{query}". Try adjusting keywords or selecting an architecture tag above.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
