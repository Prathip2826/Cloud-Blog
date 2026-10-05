import React, { useState, useEffect } from 'react';
import { PostEditor } from '../components/editor/PostEditor';
import { getPostById, updatePost } from '../lib/supabase/api';
import { Post } from '../types/database';
import { useAuth } from '../lib/auth/AuthContext';
import { useToast } from '../components/ui/Toast';

interface EditPostPageProps {
  postId: string;
  onNavigate: (route: string) => void;
}

export const EditPostPage: React.FC<EditPostPageProps> = ({ postId, onNavigate }) => {
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const found = await getPostById(postId);
        if (mounted) {
          if (!found) {
            toast('Article not found', 'error');
            onNavigate('/dashboard');
            return;
          }
          // Permission check: only author or admin can edit
          if (found.author !== user?.id && profile?.role !== 'admin') {
            toast('Unauthorized: You can only edit your own manuscripts', 'error');
            onNavigate('/dashboard');
            return;
          }
          setPost(found);
        }
      } catch (err: any) {
        toast(err.message || 'Failed to load post', 'error');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [postId, user, profile]);

  const handleSave = async (postData: {
    title: string;
    slug: string;
    excerpt: string;
    markdown: string;
    cover_image: string;
    published: boolean;
    tags: string[];
  }) => {
    setIsSaving(true);
    try {
      await updatePost(postId, postData);
      toast('Article updated successfully', 'success');
      onNavigate('/dashboard');
    } catch (err: any) {
      toast(err.message || 'Failed to update article', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-xs font-mono text-neutral-400">
        Loading manuscript for editing...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PostEditor
        initialPost={post}
        onSave={handleSave}
        onCancel={() => onNavigate('/dashboard')}
        isSaving={isSaving}
      />
    </div>
  );
};
