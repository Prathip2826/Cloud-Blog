import React, { useState } from 'react';
import { Search, Plus, Edit2, Trash2, Copy, ExternalLink, X, FileText, CheckCircle2, Clock } from 'lucide-react';
import { Post } from '../../types/database';
import { ConfirmModal } from '../ui/ConfirmModal';
import { EmptyState } from '../ui/EmptyState';

interface PostsTableProps {
  posts: Post[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => Promise<void>;
  onDuplicate: (post: Post) => Promise<void>;
  onView: (slug: string) => void;
  onCreateNew: () => void;
}

export const PostsTable: React.FC<PostsTableProps> = ({
  posts,
  onEdit,
  onDelete,
  onDuplicate,
  onView,
  onCreateNew,
}) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredPosts = posts.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;

    if (filter === 'published') return p.published;
    if (filter === 'draft') return !p.published;
    return true;
  });

  const handleConfirmDelete = async () => {
    if (!postToDelete) return;
    setIsDeleting(true);
    try {
      await onDelete(postToDelete.id);
    } finally {
      setIsDeleting(false);
      setPostToDelete(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search manuscripts by title or slug..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 focus:outline-hidden focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white placeholder:text-neutral-400 font-sans"
              aria-label="Filter manuscripts"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Segmented Filter */}
          <div className="flex items-center p-1 bg-neutral-100 dark:bg-neutral-800/80 rounded-lg text-xs shrink-0" role="tablist">
            <button
              onClick={() => setFilter('all')}
              role="tab"
              aria-selected={filter === 'all'}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                filter === 'all'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-2xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
              }`}
            >
              All ({posts.length})
            </button>
            <button
              onClick={() => setFilter('published')}
              role="tab"
              aria-selected={filter === 'published'}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                filter === 'published'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-2xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
              }`}
            >
              Live
            </button>
            <button
              onClick={() => setFilter('draft')}
              role="tab"
              aria-selected={filter === 'draft'}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                filter === 'draft'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-2xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
              }`}
            >
              Drafts
            </button>
          </div>
        </div>

        <button
          onClick={onCreateNew}
          className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-medium bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-white rounded-lg transition-colors cursor-pointer shrink-0 shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Write Manuscript</span>
        </button>
      </div>

      {/* Table Container */}
      <div className="border border-neutral-200/90 dark:border-neutral-800/90 rounded-xl overflow-hidden bg-white dark:bg-neutral-900/60 shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/75 dark:bg-neutral-900/90 text-neutral-500 font-mono">
                <th className="py-3 px-4 font-medium uppercase tracking-wider">Manuscript Title</th>
                <th className="py-3 px-4 font-medium uppercase tracking-wider">Status</th>
                <th className="py-3 px-4 font-medium uppercase tracking-wider text-right">Views</th>
                <th className="py-3 px-4 font-medium uppercase tracking-wider">Last Modified</th>
                <th className="py-3 px-4 font-medium uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/80">
              {filteredPosts.length > 0 ? (
                filteredPosts.map((post) => {
                  const formattedDate = new Date(post.updated_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  });

                  return (
                    <tr
                      key={post.id}
                      className="hover:bg-neutral-50/60 dark:hover:bg-neutral-850/50 transition-colors group"
                    >
                      <td className="py-3.5 px-4 max-w-sm">
                        <div className="font-serif font-bold text-neutral-900 dark:text-neutral-100 truncate text-[13px]">
                          {post.title}
                        </div>
                        <div className="text-[11px] font-mono text-neutral-400 dark:text-neutral-500 truncate mt-0.5">
                          /blog/{post.slug}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {post.published ? (
                          <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-700 dark:text-emerald-400 font-mono">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Live
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-[11px] text-amber-700 dark:text-amber-400 font-mono">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            Draft
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono tabular-nums text-neutral-600 dark:text-neutral-400 whitespace-nowrap">
                        {post.views.toLocaleString()}
                      </td>

                      <td className="py-3.5 px-4 font-mono tabular-nums text-neutral-500 whitespace-nowrap">
                        {formattedDate}
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          {post.published && (
                            <button
                              onClick={() => onView(post.slug)}
                              className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                              title="View published article"
                              aria-label={`View ${post.title}`}
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            onClick={() => onDuplicate(post)}
                            className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                            title="Duplicate manuscript as draft"
                            aria-label={`Duplicate ${post.title}`}
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => onEdit(post.id)}
                            className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                            title="Edit manuscript"
                            aria-label={`Edit ${post.title}`}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setPostToDelete(post)}
                            className="p-1.5 text-neutral-500 hover:text-rose-600 dark:text-neutral-400 dark:hover:text-rose-400 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                            title="Delete manuscript"
                            aria-label={`Delete ${post.title}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-12">
                    <EmptyState
                      icon={FileText}
                      title="No manuscripts found"
                      description={
                        posts.length === 0
                          ? 'You have not written any articles yet. Create your first draft to begin publishing.'
                          : `No publications match "${search}". Try clearing your search query or switching filters.`
                      }
                      actionLabel={posts.length === 0 ? 'Create First Article' : 'Clear Filter'}
                      onAction={posts.length === 0 ? onCreateNew : () => { setSearch(''); setFilter('all'); }}
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(postToDelete)}
        title="Delete Publication"
        message={`Are you sure you want to permanently delete "${postToDelete?.title}"? All readers, discussions, and metrics will be irreversibly removed.`}
        confirmLabel={isDeleting ? 'Deleting...' : 'Delete Article'}
        isDestructive
        onConfirm={handleConfirmDelete}
        onCancel={() => setPostToDelete(null)}
      />
    </div>
  );
};
