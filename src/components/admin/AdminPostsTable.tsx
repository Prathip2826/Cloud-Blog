import React, { useState } from 'react';
import { Search, Trash2, ExternalLink, Eye, CheckCircle, Clock } from 'lucide-react';
import { Post } from '../../types/database';
import { ConfirmModal } from '../ui/ConfirmModal';

interface AdminPostsTableProps {
  posts: Post[];
  onDeletePost: (postId: string) => Promise<void>;
  onTogglePublish: (post: Post) => Promise<void>;
  onViewPost: (slug: string) => void;
}

export const AdminPostsTable: React.FC<AdminPostsTableProps> = ({
  posts,
  onDeletePost,
  onTogglePublish,
  onViewPost,
}) => {
  const [search, setSearch] = useState('');
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredPosts = posts.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      p.slug.toLowerCase().includes(q) ||
      (p.profiles?.display_name && p.profiles.display_name.toLowerCase().includes(q))
    );
  });

  const confirmDelete = async () => {
    if (!postToDelete) return;
    setIsDeleting(true);
    try {
      await onDeletePost(postToDelete.id);
    } finally {
      setIsDeleting(false);
      setPostToDelete(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Header */}
      <div className="flex items-center justify-between">
        <div className="relative w-72">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search all publications..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 focus:outline-hidden focus:ring-1 focus:ring-neutral-900 placeholder:text-neutral-400"
          />
        </div>
        <span className="text-xs text-neutral-500 font-mono tabular-nums">
          {filteredPosts.length} total platform posts
        </span>
      </div>

      {/* Table */}
      <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden bg-white dark:bg-neutral-900/60 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/90 text-neutral-500 font-mono">
                <th className="py-3 px-4 font-medium uppercase tracking-wider">Article Title</th>
                <th className="py-3 px-4 font-medium uppercase tracking-wider">Author</th>
                <th className="py-3 px-4 font-medium uppercase tracking-wider">Status</th>
                <th className="py-3 px-4 font-medium uppercase tracking-wider text-right">Views</th>
                <th className="py-3 px-4 font-medium uppercase tracking-wider text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/80">
              {filteredPosts.map((p) => (
                <tr key={p.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/40 transition-colors">
                  <td className="py-3 px-4 max-w-sm">
                    <div className="font-serif font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                      {p.title}
                    </div>
                    <div className="text-[11px] font-mono text-neutral-400 truncate">
                      /blog/{p.slug}
                    </div>
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-neutral-800 dark:text-neutral-200">
                        {p.profiles?.display_name || 'Author'}
                      </span>
                    </div>
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap">
                    <button
                      onClick={() => onTogglePublish(p)}
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono cursor-pointer transition-colors ${
                        p.published
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 hover:bg-emerald-100'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 hover:bg-amber-100'
                      }`}
                      title="Click to toggle publish status"
                    >
                      {p.published ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      <span>{p.published ? 'Published' : 'Draft'}</span>
                    </button>
                  </td>

                  <td className="py-3 px-4 text-right font-mono tabular-nums text-neutral-600 dark:text-neutral-400 whitespace-nowrap">
                    {p.views.toLocaleString()}
                  </td>

                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      {p.published && (
                        <button
                          onClick={() => onViewPost(p.slug)}
                          className="p-1.5 text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                          title="View live article"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => setPostToDelete(p)}
                        className="p-1.5 text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                        title="Delete article (Admin Moderation)"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(postToDelete)}
        title="Admin Moderation: Delete Article"
        message={`Are you sure you want to remove "${postToDelete?.title}" by ${postToDelete?.profiles?.display_name}? This action is irreversible.`}
        confirmLabel={isDeleting ? 'Deleting...' : 'Delete Inappropriate Content'}
        isDestructive
        onConfirm={confirmDelete}
        onCancel={() => setPostToDelete(null)}
      />
    </div>
  );
};
