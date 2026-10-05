import React, { useState, useEffect } from 'react';
import { User, Mail, Shield, Save, ArrowLeft, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { useAuth } from '../lib/auth/AuthContext';
import { useToast } from '../components/ui/Toast';
import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase/client';
import { Profile } from '../types/database';

interface ProfilePageProps {
  onNavigate: (route: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigate }) => {
  const { user, profile, syncProfile } = useAuth();
  const { toast } = useToast();

  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 1. Profile Settings must load the current user's profile from: public.profiles
  // 2. The profile must be identified using: auth.uid() = profiles.id
  useEffect(() => {
    let isMounted = true;

    async function fetchUserProfile() {
      setLoading(true);
      setErrorMessage(null);

      try {
        if (isSupabaseConfigured()) {
          const supabase = getSupabaseClient();
          if (!supabase) {
            throw new Error('Supabase client is not available');
          }

          // Identify current authenticated user via supabase.auth.getUser()
          const {
            data: { user: authUser },
            error: authError,
          } = await supabase.auth.getUser();

          if (authError || !authUser) {
            console.warn('User not authenticated in Supabase:', authError);
            if (isMounted) setLoading(false);
            return;
          }

          // Load from public.profiles where auth.uid() = profiles.id
          const { data: dbProfile, error: dbError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authUser.id)
            .maybeSingle();

          if (dbError) {
            console.error('Error fetching profile from public.profiles:', dbError);
            if (isMounted) setErrorMessage(`Database read notice: ${dbError.message}`);
          }

          if (dbProfile && isMounted) {
            setDisplayName(dbProfile.display_name || '');
            setAvatarUrl(dbProfile.avatar_url || '');
            setBio(dbProfile.bio || '');
            syncProfile(dbProfile);
          } else if (!dbProfile && isMounted) {
            // Profile row does not exist yet; auto-initialize in public.profiles
            const defaultName =
              authUser.user_metadata?.display_name ||
              authUser.email?.split('@')[0] ||
              'Author';
            const initialRole = authUser.user_metadata?.role || 'writer';

            const { data: created, error: insertError } = await supabase
              .from('profiles')
              .insert({
                id: authUser.id,
                display_name: defaultName,
                avatar_url: authUser.user_metadata?.avatar_url || null,
                role: initialRole,
                updated_at: new Date().toISOString(),
              })
              .select()
              .maybeSingle();

            if (!insertError && created && isMounted) {
              setDisplayName(created.display_name || '');
              setAvatarUrl(created.avatar_url || '');
              setBio(created.bio || '');
              syncProfile(created);
            } else if (isMounted) {
              setDisplayName(defaultName);
            }
          }
        } else if (profile && isMounted) {
          // Demo fallback
          setDisplayName(profile.display_name || '');
          setAvatarUrl(profile.avatar_url || '');
          setBio(profile.bio || '');
        }
      } catch (err: any) {
        console.error('Unexpected error loading profile:', err);
        if (isMounted) setErrorMessage(err.message || 'Failed to load profile');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchUserProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  if (!user && !loading) {
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

  // 3. When the user changes their display name and clicks Save:
  // - Validate the input
  // - Update public.profiles.display_name
  // - Use the currently authenticated Supabase user's ID
  // - Show a success toast only after the database update succeeds
  // - Refresh/re-fetch the profile after saving
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedName = displayName.trim();
    if (!trimmedName) {
      toast('Display name cannot be empty', 'error');
      return;
    }

    setSaving(true);

    try {
      if (isSupabaseConfigured()) {
        const supabase = getSupabaseClient();
        if (!supabase) {
          throw new Error('Supabase client not initialized');
        }

        // 4. Exact code pattern required:
        const {
          data: { user: authUser },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !authUser) {
          throw new Error('User not authenticated');
        }

        // Check whether profile row exists first to handle insert vs update
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', authUser.id)
          .maybeSingle();

        if (!existingProfile) {
          // If row doesn't exist yet, insert with display_name
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: authUser.id,
              display_name: trimmedName,
              avatar_url: avatarUrl.trim() || null,
              bio: bio.trim() || null,
              role: profile?.role || 'writer',
              updated_at: new Date().toISOString(),
            });

          if (insertError) {
            console.error('Failed to create profile in Supabase:', insertError);
            throw insertError;
          }
        } else {
          // Execute update on public.profiles identified by auth.uid() = profiles.id
          const { error: updateError } = await supabase
            .from('profiles')
            .update({
              display_name: trimmedName,
              avatar_url: avatarUrl.trim() || null,
              bio: bio.trim() || null,
              updated_at: new Date().toISOString(),
            })
            .eq('id', authUser.id);

          if (updateError) {
            console.error('Failed to update profile in Supabase:', updateError);
            throw updateError;
          }
        }

        // 8. After saving, refresh/re-fetch the profile from Supabase so refreshing keeps the new name
        const { data: refreshedProfile, error: fetchError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();

        if (fetchError) {
          console.error('Failed to re-fetch profile after save:', fetchError);
          throw fetchError;
        }

        // 10 & 11. Sync profile immediately with AuthContext to prevent race conditions
        // and ensure Navbar, Dashboard, Profile page, comments use persisted data
        if (refreshedProfile) {
          syncProfile(refreshedProfile);
          setDisplayName(refreshedProfile.display_name);
          setAvatarUrl(refreshedProfile.avatar_url || '');
          setBio(refreshedProfile.bio || '');
        }

        // 3. Show success toast only after database update succeeds
        toast('Profile display name persisted to Supabase successfully', 'success');
      } else {
        // Demo mode fallback
        if (profile) {
          const updated: Profile = {
            ...profile,
            display_name: trimmedName,
            avatar_url: avatarUrl.trim() || undefined,
            bio: bio.trim() || undefined,
            updated_at: new Date().toISOString(),
          };
          syncProfile(updated);
          toast('Profile updated successfully (Demo mode)', 'success');
        }
      }
    } catch (err: any) {
      // 9. If the update fails: Do not show fake success message. Display actual error & log detailed error.
      console.error('Profile update failed:', err);
      const msg = err.message || 'Failed to update profile in database';
      setErrorMessage(msg);
      toast(`Save failed: ${msg}`, 'error');
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
          Manage your public byline, avatar representation, and author credentials stored in Supabase PostgreSQL.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 flex items-start gap-3 text-rose-800 dark:text-rose-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
          <div className="space-y-1">
            <span className="font-semibold">Update Notice:</span>
            <p>{errorMessage}</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-neutral-500 dark:text-neutral-400 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-neutral-400" />
          <span className="text-xs">Loading profile from Supabase...</span>
        </div>
      ) : (
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
              <div className="w-16 h-16 rounded-full bg-neutral-200 dark:bg-neutral-800 text-xl font-serif font-bold flex items-center justify-center text-neutral-800 dark:text-neutral-200">
                {displayName.charAt(0) || 'U'}
              </div>
            )}
            <div className="space-y-1">
              <div className="font-serif font-bold text-lg text-neutral-900 dark:text-neutral-100">
                {displayName || 'Anonymous'}
              </div>
              <div className="text-xs text-neutral-500 font-mono">
                {user?.email}
              </div>
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded">
                  Role: {profile?.role || 'writer'}
                </span>
                <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                  Supabase RLS Active
                </span>
              </div>
            </div>
          </div>

          {/* Inputs */}
          <div className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="display-name" className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Display Byline / Name
              </label>
              <input
                id="display-name"
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Elena Rostova"
                className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white transition-colors"
              />
              <span className="text-[11px] text-neutral-400">
                This name is stored in public.profiles.display_name and rendered on all your articles and comments.
              </span>
            </div>

            <div className="space-y-1">
              <label htmlFor="avatar-url" className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Avatar Image URL
              </label>
              <input
                id="avatar-url"
                type="url"
                placeholder="https://images.unsplash.com/photo-..."
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white font-mono transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="bio-input" className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Author Biography
              </label>
              <textarea
                id="bio-input"
                rows={3}
                placeholder="Brief professional statement displayed on articles you publish..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white transition-colors"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-white text-xs font-medium rounded-lg transition-colors cursor-pointer shadow-sm disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Persisting to Supabase...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Profile Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

