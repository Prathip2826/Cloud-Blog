import React, { useState, useEffect } from 'react';
import { MessageSquare, Trash2, Send, CornerDownRight } from 'lucide-react';
import { Comment } from '../../types/database';
import { getComments, createComment, deleteComment } from '../../lib/supabase/api';
import { useAuth } from '../../lib/auth/AuthContext';
import { useToast } from '../ui/Toast';
import { ConfirmModal } from '../ui/ConfirmModal';
import { EmptyState } from '../ui/EmptyState';

interface CommentSectionProps {
  postId: string;
  onNavigateLogin: () => void;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ postId, onNavigateLogin }) => {
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputBody, setInputBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);

  const isAdmin = profile?.role === 'admin';

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const data = await getComments(postId);
        if (mounted) setComments(data);
      } catch (err) {
        console.error('Error fetching comments:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [postId]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!user) {
      onNavigateLogin();
      return;
    }

    if (!inputBody.trim()) {
      toast('Comment cannot be empty', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const created = await createComment(postId, user.id, inputBody.trim());
      setComments((prev) => [...prev, created]);
      setInputBody('');
      toast('Response posted to discussion', 'success');
    } catch (err: any) {
      toast(err.message || 'Failed to post comment', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleConfirmDelete = async () => {
    if (!commentToDelete) return;

    try {
      await deleteComment(commentToDelete);
      setComments((prev) => prev.filter((c) => c.id !== commentToDelete));
      toast('Comment removed', 'success');
    } catch (err: any) {
      toast(err.message || 'Failed to delete comment', 'error');
    } finally {
      setCommentToDelete(null);
    }
  };

  return (
    <section className="mt-14 pt-10 border-t border-neutral-200/90 dark:border-neutral-800/90 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-neutral-500" />
          <h3 className="text-lg font-serif font-bold text-neutral-900 dark:text-neutral-100">
            Discussion ({comments.length})
          </h3>
        </div>
        <span className="text-[11px] font-mono text-neutral-400">
          Markdown supported
        </span>
      </div>

      {/* Add Comment Form */}
      {user ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex items-start gap-3">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt=""
                className="w-7 h-7 rounded-full object-cover mt-1 shrink-0 ring-1 ring-neutral-200 dark:ring-neutral-700"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-neutral-200 dark:bg-neutral-800 text-xs font-semibold flex items-center justify-center mt-1 shrink-0">
                {profile?.display_name?.charAt(0) || 'U'}
              </div>
            )}
            <div className="flex-1">
              <textarea
                rows={3}
                placeholder="Contribute to this discussion (⌘+Enter to submit)..."
                value={inputBody}
                onChange={(e) => setInputBody(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full p-3 text-xs sm:text-sm rounded-xl border border-neutral-200/90 dark:border-neutral-800/90 bg-white dark:bg-neutral-900/50 focus:outline-hidden focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white placeholder:text-neutral-400 font-sans leading-relaxed"
                aria-label="Discussion response"
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-[11px] text-neutral-400">
                  Responding as <strong className="text-neutral-700 dark:text-neutral-300 font-medium">{profile?.display_name}</strong>
                </span>
                <button
                  type="submit"
                  disabled={submitting || !inputBody.trim()}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-white rounded-lg transition-colors disabled:opacity-40 cursor-pointer shadow-2xs"
                >
                  <Send className="w-3 h-3" />
                  <span>{submitting ? 'Posting...' : 'Post response'}</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="p-6 rounded-xl border border-dashed border-neutral-300 dark:border-neutral-800 text-center space-y-3 bg-neutral-50/50 dark:bg-neutral-900/30">
          <div className="text-xs sm:text-sm font-medium text-neutral-800 dark:text-neutral-200">
            Join the technical inquiry discussion
          </div>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            Readers, engineers, and fellows are invited to share observations and critiques.
          </p>
          <button
            onClick={onNavigateLogin}
            className="px-4 py-2 text-xs font-medium bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white rounded-lg transition-colors cursor-pointer shadow-2xs"
          >
            Sign in to participate
          </button>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-3 pt-2">
        {loading ? (
          <div className="py-6 text-center text-xs text-neutral-400 font-mono">
            Loading discussion...
          </div>
        ) : comments.length > 0 ? (
          comments.map((comment) => {
            const isOwner = user?.id === comment.user_id;
            const canDelete = isOwner || isAdmin;
            const formattedDate = new Date(comment.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });

            return (
              <div
                key={comment.id}
                className="p-4 rounded-xl border border-neutral-100 dark:border-neutral-800/80 bg-white dark:bg-neutral-900/40 space-y-2 transition-colors hover:border-neutral-200 dark:hover:border-neutral-750"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {comment.profiles?.avatar_url ? (
                      <img
                        src={comment.profiles.avatar_url}
                        alt=""
                        className="w-5 h-5 rounded-full object-cover ring-1 ring-neutral-200 dark:ring-neutral-700"
                      />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-neutral-200 dark:bg-neutral-800 text-[10px] font-semibold flex items-center justify-center text-neutral-800 dark:text-neutral-200">
                        {comment.profiles?.display_name?.charAt(0) || 'U'}
                      </div>
                    )}
                    <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                      {comment.profiles?.display_name || 'Reader'}
                    </span>
                    {comment.profiles?.role === 'admin' && (
                      <span className="text-[10px] font-mono text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-1.5 py-0.2 rounded">
                        Admin
                      </span>
                    )}
                    {comment.profiles?.role === 'writer' && (
                      <span className="text-[10px] font-mono text-neutral-600 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.2 rounded">
                        Writer
                      </span>
                    )}
                    <span className="text-[11px] text-neutral-400 font-mono tabular-nums">
                      · {formattedDate}
                    </span>
                  </div>

                  {canDelete && (
                    <button
                      onClick={() => setCommentToDelete(comment.id)}
                      className="text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 p-1 transition-colors cursor-pointer"
                      title={isAdmin && !isOwner ? 'Admin moderation: delete response' : 'Delete response'}
                      aria-label="Delete comment"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <p className="text-xs sm:text-[13px] text-neutral-700 dark:text-neutral-300 leading-relaxed pl-7 font-sans whitespace-pre-wrap">
                  {comment.body}
                </p>
              </div>
            );
          })
        ) : (
          <EmptyState
            icon={MessageSquare}
            title="No responses yet"
            description="Be the first to spark a conversation or offer an architectural critique."
          />
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(commentToDelete)}
        title="Delete Response"
        message="Are you sure you want to permanently delete this response? This action cannot be undone."
        confirmLabel="Delete"
        isDestructive
        onConfirm={handleConfirmDelete}
        onCancel={() => setCommentToDelete(null)}
      />
    </section>
  );
};
