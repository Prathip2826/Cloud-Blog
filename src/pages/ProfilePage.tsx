import React, { useState, useEffect } from 'react';
import { User, Mail, Shield, Save, Check, ArrowLeft } from 'lucide-react';
import { useAuth } from '../lib/auth/AuthContext';
import { useToast } from '../components/ui/Toast';

interface ProfilePageProps {
  onNavigate: (route: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigate }) => {
  const { user, profile, updateCurrentUserProfile } = useAuth();
  const { toast } = useToast();

  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
      setAvatarUrl(profile.avatar_url || '');
      setBio(profile.bio || '');
    }
  }, [profile]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="text-xl font-serif font-bold text-neutral-900 dark:text-neutral-100">
          Sign In Required
        </h2>
        <p className="text-xs text-neutral-500">
          Please sign in to view and customize your Chronicle profile.
        </p>
        <button
          onClick={() => onNavigate('/login')}
          className="px-4 py-2 text-xs font-medium bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 cursor-pointer"
        >
          Sign in
        </button>
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      toast('Display name cannot be empty', 'error');
      return;
    }

    setSaving(true);
    try {
      await updateCurrentUserProfile({
        display_name: displayName.trim(),
        avatar_url: avatarUrl.trim(),
        bio: bio.trim(),
      });
      toast('Profile updated successfully', 'success');
    } catch (err: any) {
      toast(err.message || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div>
        <button
          onClick={() => onNavigate(-1 as any)}
          className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>
      </div>

      <div className="border-b border-neutral-200 dark:border-neutral-800 pb-4">
        <h1 className="text-3xl font-serif font-bold text-neutral-950 dark:text-white">
          Profile Settings
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          Manage your public byline, avatar representation, and account credentials.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* User Card Preview */}
        <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 flex items-center gap-4">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName}
              className="w-16 h-16 rounded-full object-cover border border-neutral-200 dark:border-neutral-700"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-neutral-200 dark:bg-neutral-800 text-xl font-serif font-bold flex items-center justify-center">
              {displayName.charAt(0) || 'U'}
            </div>
          )}
          <div className="space-y-1">
            <div className="font-serif font-bold text-lg text-neutral-900 dark:text-neutral-100">
              {displayName || 'Anonymous'}
            </div>
            <div className="text-xs text-neutral-500 font-mono">
              {user.email}
            </div>
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded">
                Role: {profile?.role}
              </span>
            </div>
          </div>
        </div>

        {/* Inputs */}
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Display Byline / Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:outline-hidden focus:ring-1 focus:ring-neutral-900"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Avatar Image URL
            </label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/photo-..."
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:outline-hidden focus:ring-1 focus:ring-neutral-900 font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Author Biography
            </label>
            <textarea
              rows={3}
              placeholder="Brief professional statement displayed on articles you publish..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:outline-hidden focus:ring-1 focus:ring-neutral-900"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-white text-xs font-medium rounded-lg transition-colors cursor-pointer shadow-sm disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving changes...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
