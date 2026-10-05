import React, { useState, useEffect } from 'react';
import { Search, ArrowUpDown, X, BookOpen } from 'lucide-react';
import { Post } from '../types/database';
import { getPosts } from '../lib/supabase/api';
import { PostCard } from '../components/blog/PostCard';
import { PostCardSkeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';

interface ExplorePageProps {
  onNavigate: (route: string) => void;
  initialTag?: string;
}

const POPULAR_TAGS = [
  'All',
  'Architecture',
  'PostgreSQL',
  'Edge',
  'Design',
  'Typography',
  'Distributed Systems',
  'Performance',
];

export const ExplorePage: React.FC<ExplorePageProps> = ({ onNavigate, initialTag }) => {
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState(initialTag || 'All');
  const [sort, setSort] = useState<'newest' | 'oldest' | 'popular'>('newest');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (initialTag) {
      setSelectedTag(initialTag);
    }
  }, [initialTag]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    const timer = setTimeout(async () => {
      try {
        const fetched = await getPosts({
          publishedOnly: true,
          tag: selectedTag === 'All' ? undefined : selectedTag,
          search: search.trim() || undefined,
          sort,
        });

        if (mounted) {
          setPosts(fetched);
        }
      } catch (err) {
        console.error('Error fetching explore posts:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }, 180);

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [search, selectedTag, sort]);

  const handleResetFilters = () => {
    setSearch('');
    setSelectedTag('All');
    setSort('newest');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Header Statement */}
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-neutral-950 dark:text-white tracking-tight">
          Explore Archive
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-2xl font-serif">
          Browse the complete catalog of technical inquiries, system architecture essays, and database investigations.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-4 p-4 sm:p-5 rounded-2xl border border-neutral-200/90 dark:border-neutral-800/90 bg-white dark:bg-neutral-900/60 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by keywords, titles, or concepts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/80 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-hidden focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white font-sans"
              aria-label="Search articles"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer"
                aria-label="Clear search query"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 shrink-0">
            <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400" />
            <span className="text-xs text-neutral-500 font-mono">Sort:</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as any)}
              className="text-xs py-1.5 px-3 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 focus:outline-hidden cursor-pointer"
              aria-label="Sort publications"
            >
              <option value="newest">Newest First</option>
              <option value="popular">Most Popular</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>

        {/* Tag Filters (Segmented interactive buttons per frontend-design rule) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-neutral-100 dark:border-neutral-800 text-xs" role="tablist">
          <span className="text-[11px] uppercase tracking-wider text-neutral-400 font-mono mr-1 shrink-0">
            Topics:
          </span>
          {POPULAR_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              role="tab"
              aria-selected={selectedTag === tag}
              className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                selectedTag === tag
                  ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-950 shadow-2xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Posts Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <PostCardSkeleton key={i} />
          ))}
        </div>
      ) : posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onSelect={(slug) => onNavigate(`/blog/${slug}`)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={BookOpen}
          title="No publications match your criteria"
          description={`No inquiries found for "${search || selectedTag}". Try modifying your keyword search or resetting category filters.`}
          actionLabel="Clear all filters"
          onAction={handleResetFilters}
        />
      )}
    </div>
  );
};
