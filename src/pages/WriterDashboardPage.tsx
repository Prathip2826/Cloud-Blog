import React, { useState, useEffect } from 'react';
import { Plus, LayoutDashboard, Sparkles, BookOpen } from 'lucide-react';
import { Post } from '../types/database';
import { getPosts, deletePost, createPost } from '../lib/supabase/api';
import { useAuth } from '../lib/auth/AuthContext';
import { DashboardStats } from '../components/dashboard/DashboardStats';
import { PostsTable } from '../components/dashboard/PostsTable';
import { TableRowSkeleton } from '../components/ui/Skeleton';
import { useToast } from '../components/ui/Toast';

interface WriterDashboardPageProps {
  onNavigate: (route: string) => void;
}

export const WriterDashboardPage: React.FC<WriterDashboardPageProps> = ({ onNavigate }) => {
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAuthorPosts = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const authorPosts = await getPosts({
        authorId: user.id,
        publishedOnly: false,
      });
      setPosts(authorPosts);
    } catch (err: any) {
      toast(err.message || 'Failed to load manuscripts', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuthorPosts();
  }, [user]);

  const handleDeletePost = async (id: string) => {
    try {
      await deletePost(id);
      setPosts((prev) => prev.filter((p) => p.id !== id));
      toast('Manuscript deleted', 'success');
    } catch (err: any) {
      toast(err.message || 'Failed to delete manuscript', 'error');
    }
  };

  const handleDuplicatePost = async (post: Post) => {
    if (!user) return;
    try {
      const duplicated = await createPost({
        author: user.id,
        title: `${post.title} (Revision)`,
        slug: `${post.slug}-rev-${Date.now().toString().slice(-4)}`,
        excerpt: post.excerpt,
        markdown: post.markdown,
        cover_image: post.cover_image,
        published: false,
        tags: [...post.tags],
      });
      setPosts((prev) => [duplicated, ...prev]);
      toast('Draft copy generated', 'success');
    } catch (err: any) {
      toast(err.message || 'Failed to duplicate post', 'error');
    }
  };

  const totalPosts = posts.length;
  const publishedPosts = posts.filter((p) => p.published).length;
  const draftPosts = posts.filter((p) => !p.published).length;
  const totalViews = posts.reduce((acc, p) => acc + (p.views || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Top Banner & Breadcrumb */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-neutral-200/90 dark:border-neutral-800/90 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-neutral-500 uppercase tracking-wider mb-1">
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Writer Studio</span>
          </div>
          <h1 className="text-3xl font-serif font-bold text-neutral-950 dark:text-white tracking-tight">
            Welcome, {profile?.display_name || 'Writer'}
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Monitor article performance, manage manuscript revisions, and author technical essays.
          </p>
        </div>

        <button
          onClick={() => onNavigate('/dashboard/posts/new')}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-white rounded-lg transition-colors cursor-pointer shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Manuscript</span>
        </button>
      </div>

      {/* Metrics Cards */}
      <DashboardStats
        totalPosts={totalPosts}
        publishedPosts={publishedPosts}
        draftPosts={draftPosts}
        totalViews={totalViews}
      />

      {/* Publications Section */}
      <section className="space-y-4" aria-label="Manuscripts">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-serif font-bold text-neutral-900 dark:text-neutral-100">
            Author Manuscripts
          </h2>
        </div>

        {loading ? (
          <div className="border border-neutral-200/90 dark:border-neutral-800/90 rounded-xl overflow-hidden bg-white dark:bg-neutral-900/60 p-4">
            <table className="w-full">
              <tbody>
                <TableRowSkeleton columns={5} />
                <TableRowSkeleton columns={5} />
                <TableRowSkeleton columns={5} />
              </tbody>
            </table>
          </div>
        ) : (
          <PostsTable
            posts={posts}
            onEdit={(id) => onNavigate(`/dashboard/posts/${id}/edit`)}
            onDelete={handleDeletePost}
            onDuplicate={handleDuplicatePost}
            onView={(slug) => onNavigate(`/blog/${slug}`)}
            onCreateNew={() => onNavigate('/dashboard/posts/new')}
          />
        )}
      </section>
    </div>
  );
};
