import React, { useState } from 'react';
import { PostEditor } from '../components/editor/PostEditor';
import { createPost } from '../lib/supabase/api';
import { useAuth } from '../lib/auth/AuthContext';
import { useToast } from '../components/ui/Toast';

interface NewPostPageProps {
  onNavigate: (route: string) => void;
}

export const NewPostPage: React.FC<NewPostPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (postData: {
    title: string;
    slug: string;
    excerpt: string;
    markdown: string;
    cover_image: string;
    published: boolean;
    tags: string[];
  }) => {
    if (!user) {
      toast('You must be signed in to create an article', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const created = await createPost({
        ...postData,
        author: user.id,
      });

      toast(
        created.published
          ? 'Article published to live readers!'
          : 'Draft manuscript saved successfully',
        'success'
      );
      onNavigate('/dashboard');
    } catch (err: any) {
      toast(err.message || 'Failed to create article', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PostEditor
        onSave={handleSave}
        onCancel={() => onNavigate('/dashboard')}
        isSaving={isSaving}
      />
    </div>
  );
};
