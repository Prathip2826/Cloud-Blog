import React, { useState, useEffect } from 'react';
import { Shield } from 'lucide-react';
import { AdminStats, Profile, Post, UserRole } from '../types/database';
import { getAdminStats, getAllUsers, updateUserRole, getPosts, deletePost, updatePost } from '../lib/supabase/api';
import { useAuth } from '../lib/auth/AuthContext';
import { AdminUsersTable } from '../components/admin/AdminUsersTable';
import { AdminPostsTable } from '../components/admin/AdminPostsTable';
import { TableRowSkeleton } from '../components/ui/Skeleton';
import { ErrorState } from '../components/ui/ErrorState';
import { useToast } from '../components/ui/Toast';

interface AdminDashboardPageProps {
  onNavigate: (route: string) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ onNavigate }) => {
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<'users' | 'posts'>('users');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<Profile[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = profile?.role === 'admin';

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [fetchedStats, fetchedUsers, fetchedPosts] = await Promise.all([
        getAdminStats(),
        getAllUsers(),
        getPosts({ publishedOnly: false }),
      ]);
      setStats(fetchedStats);
      setUsers(fetchedUsers);
      setPosts(fetchedPosts);
    } catch (err: any) {
      toast(err.message || 'Failed to load platform data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadAdminData();
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-20">
        <ErrorState
          title="Administrator Access Restricted"
          message={`You are currently authenticated as "${profile?.display_name || 'Member'}" with role: ${profile?.role || 'reader'}. Governance tools are reserved for platform administrators.`}
          retryLabel="Return to Chronicle"
          onRetry={() => onNavigate('/')}
        />
      </div>
    );
  }

  const handleUpdateRole = async (userId: string, newRole: UserRole) => {
    try {
      await updateUserRole(userId, newRole);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
      toast(`User role updated to ${newRole}`, 'success');
    } catch (err: any) {
      toast(err.message || 'Failed to update user role', 'error');
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await deletePost(postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      toast('Publication deleted permanently by administrator', 'success');
    } catch (err: any) {
      toast(err.message || 'Failed to delete post', 'error');
    }
  };

  const handleTogglePublish = async (post: Post) => {
    try {
      const updated = await updatePost(post.id, { published: !post.published });
      setPosts((prev) => prev.map((p) => (p.id === post.id ? updated : p)));
      toast(
        updated.published
          ? 'Article is now published to public readers'
          : 'Article reverted to draft manuscript',
        'success'
      );
    } catch (err: any) {
      toast(err.message || 'Failed to toggle status', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Admin Header */}
      <div className="border-b border-neutral-200/90 dark:border-neutral-800/90 pb-6">
        <div className="flex items-center gap-2 text-xs font-mono text-purple-700 dark:text-purple-400 uppercase tracking-wider mb-1">
          <Shield className="w-3.5 h-3.5" />
          <span>Platform Governance</span>
        </div>
        <h1 className="text-3xl font-serif font-bold text-neutral-950 dark:text-white tracking-tight">
          Admin Console
        </h1>
        <p className="text-xs text-neutral-500 mt-0.5">
          Manage member accounts, review publication standards, and oversee platform performance.
        </p>
      </div>

      {/* Aggregate Stats Grid */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
          <div className="p-4 rounded-xl border border-neutral-200/90 dark:border-neutral-800/90 bg-white dark:bg-neutral-900/60 shadow-2xs">
            <div className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider font-mono">
              Total Members
            </div>
            <div className="text-xl font-bold font-mono tabular-nums text-neutral-900 dark:text-neutral-100 mt-1">
              {stats.totalUsers}
            </div>
          </div>

          <div className="p-4 rounded-xl border border-neutral-200/90 dark:border-neutral-800/90 bg-white dark:bg-neutral-900/60 shadow-2xs">
            <div className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider font-mono">
              Total Posts
            </div>
            <div className="text-xl font-bold font-mono tabular-nums text-neutral-900 dark:text-neutral-100 mt-1">
              {stats.totalPosts}
            </div>
          </div>

          <div className="p-4 rounded-xl border border-neutral-200/90 dark:border-neutral-800/90 bg-white dark:bg-neutral-900/60 shadow-2xs">
            <div className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider font-mono">
              Live Articles
            </div>
            <div className="text-xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400 mt-1">
              {stats.publishedPosts}
            </div>
          </div>

          <div className="p-4 rounded-xl border border-neutral-200/90 dark:border-neutral-800/90 bg-white dark:bg-neutral-900/60 shadow-2xs">
            <div className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider font-mono">
              Drafts
            </div>
            <div className="text-xl font-bold font-mono tabular-nums text-amber-600 dark:text-amber-400 mt-1">
              {stats.draftPosts}
            </div>
          </div>

          <div className="p-4 rounded-xl border border-neutral-200/90 dark:border-neutral-800/90 bg-white dark:bg-neutral-900/60 shadow-2xs">
            <div className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider font-mono">
              Discussions
            </div>
            <div className="text-xl font-bold font-mono tabular-nums text-neutral-900 dark:text-neutral-100 mt-1">
              {stats.totalComments}
            </div>
          </div>

          <div className="p-4 rounded-xl border border-neutral-200/90 dark:border-neutral-800/90 bg-white dark:bg-neutral-900/60 shadow-2xs">
            <div className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider font-mono">
              Readership
            </div>
            <div className="text-xl font-bold font-mono tabular-nums text-sky-600 dark:text-sky-400 mt-1">
              {stats.totalViews.toLocaleString()}
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-neutral-200 dark:border-neutral-800" role="tablist">
        <button
          onClick={() => setActiveTab('users')}
          role="tab"
          aria-selected={activeTab === 'users'}
          className={`pb-3 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer border-b-2 -mb-px ${
            activeTab === 'users'
              ? 'border-neutral-900 text-neutral-950 dark:border-white dark:text-white'
              : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
          }`}
        >
          Member Governance ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('posts')}
          role="tab"
          aria-selected={activeTab === 'posts'}
          className={`pb-3 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer border-b-2 -mb-px ${
            activeTab === 'posts'
              ? 'border-neutral-900 text-neutral-950 dark:border-white dark:text-white'
              : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
          }`}
        >
          Article Moderation ({posts.length})
        </button>
      </div>

      {/* Tab Panels */}
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
      ) : activeTab === 'users' ? (
        <AdminUsersTable
          users={users}
          currentUserId={user?.id}
          onUpdateRole={handleUpdateRole}
        />
      ) : (
        <AdminPostsTable
          posts={posts}
          onDeletePost={handleDeletePost}
          onTogglePublish={handleTogglePublish}
          onViewPost={(slug) => onNavigate(`/blog/${slug}`)}
        />
      )}
    </div>
  );
};
