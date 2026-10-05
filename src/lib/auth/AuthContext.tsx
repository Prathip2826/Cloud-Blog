import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { Profile, UserRole } from '../../types/database';
import { getSupabaseClient, isSupabaseConfigured } from '../supabase/client';
import { getProfile, updateProfile } from '../supabase/api';
import { INITIAL_PROFILES } from '../supabase/mockData';

interface AuthContextType {
  user: { id: string; email?: string } | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  isSupabaseMode: boolean;
  signIn: (email: string, password?: string) => Promise<{ error?: string }>;
  signUp: (email: string, password?: string, displayName?: string, role?: UserRole) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: string; success?: boolean }>;
  updateCurrentUserProfile: (data: Partial<Profile>) => Promise<Profile | null>;
  switchDemoUser: (roleOrId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_ACTIVE_USER_KEY = 'chronicle_demo_active_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const isSupabase = isSupabaseConfigured();

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      if (isSupabase) {
        const supabase = getSupabaseClient();
        if (!supabase) {
          setLoading(false);
          return;
        }

        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session && mounted) {
            setSession(session);
            setUser({ id: session.user.id, email: session.user.email });
            const prof = await getProfile(session.user.id);
            if (prof && mounted) setProfile(prof);
          }
        } catch (err) {
          console.error('Error fetching initial session:', err);
        }

        const { data: authListener } = supabase.auth.onAuthStateChange(
          async (event, currentSession) => {
            if (!mounted) return;
            setSession(currentSession);
            if (currentSession?.user) {
              setUser({ id: currentSession.user.id, email: currentSession.user.email });
              const prof = await getProfile(currentSession.user.id);
              if (mounted) setProfile(prof);
            } else {
              setUser(null);
              setProfile(null);
            }
          }
        );

        setLoading(false);
        return () => {
          authListener.subscription.unsubscribe();
        };
      } else {
        // Demo Mode Initialization
        const storedUserId = localStorage.getItem(DEMO_ACTIVE_USER_KEY) || 'user-writer-01';
        const found = INITIAL_PROFILES.find((p) => p.id === storedUserId) || INITIAL_PROFILES[1];
        setUser({ id: found.id, email: found.email });
        setProfile(found);
        setLoading(false);
      }
    }

    initAuth();

    return () => {
      mounted = false;
    };
  }, [isSupabase]);

  // Sign In
  const signIn = async (email: string, password?: string): Promise<{ error?: string }> => {
    if (isSupabase) {
      const supabase = getSupabaseClient();
      if (!supabase) return { error: 'Supabase client not initialized' };

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password || '',
      });

      if (error) {
        return { error: error.message };
      }

      if (data.user) {
        setUser({ id: data.user.id, email: data.user.email });
        const prof = await getProfile(data.user.id);
        setProfile(prof);
      }
      return {};
    }

    // Demo Mode Sign In
    const found = INITIAL_PROFILES.find(
      (p) => p.email?.toLowerCase() === email.trim().toLowerCase()
    );
    if (found) {
      setUser({ id: found.id, email: found.email });
      setProfile(found);
      localStorage.setItem(DEMO_ACTIVE_USER_KEY, found.id);
      return {};
    }

    // Default to writer if generic demo login
    const defaultUser = INITIAL_PROFILES[1];
    setUser({ id: defaultUser.id, email: email.trim() });
    setProfile(defaultUser);
    localStorage.setItem(DEMO_ACTIVE_USER_KEY, defaultUser.id);
    return {};
  };

  // Sign Up
  const signUp = async (
    email: string,
    password?: string,
    displayName?: string,
    role: UserRole = 'writer'
  ): Promise<{ error?: string }> => {
    if (isSupabase) {
      const supabase = getSupabaseClient();
      if (!supabase) return { error: 'Supabase client not initialized' };

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password || '',
        options: {
          data: {
            display_name: displayName || email.split('@')[0],
            role,
          },
        },
      });

      if (error) {
        return { error: error.message };
      }

      if (data.user) {
        setUser({ id: data.user.id, email: data.user.email });
        // Create initial profile row
        const newProf = await updateProfile(data.user.id, {
          id: data.user.id,
          display_name: displayName || email.split('@')[0],
          role,
          email: data.user.email,
        });
        setProfile(newProf);
      }
      return {};
    }

    // Demo Mode Sign Up
    const newId = `user-${Date.now()}`;
    const newProf: Profile = {
      id: newId,
      display_name: displayName || email.split('@')[0],
      email: email.trim(),
      role,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setUser({ id: newId, email: email.trim() });
    setProfile(newProf);
    localStorage.setItem(DEMO_ACTIVE_USER_KEY, newId);
    return {};
  };

  // Sign Out
  const signOut = async (): Promise<void> => {
    if (isSupabase) {
      const supabase = getSupabaseClient();
      if (supabase) {
        await supabase.auth.signOut();
      }
    }
    setUser(null);
    setProfile(null);
    setSession(null);
    localStorage.removeItem(DEMO_ACTIVE_USER_KEY);
  };

  // Reset Password
  const resetPassword = async (email: string): Promise<{ error?: string; success?: boolean }> => {
    if (isSupabase) {
      const supabase = getSupabaseClient();
      if (!supabase) return { error: 'Supabase client not available' };
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
      if (error) return { error: error.message };
      return { success: true };
    }
    return { success: true };
  };

  // Update Profile
  const updateCurrentUserProfile = async (data: Partial<Profile>): Promise<Profile | null> => {
    if (!user) return null;
    const updated = await updateProfile(user.id, data);
    setProfile(updated);
    return updated;
  };

  // Switch demo persona (Reader, Writer, Admin)
  const switchDemoUser = (roleOrId: string) => {
    const target =
      INITIAL_PROFILES.find((p) => p.role === roleOrId) ||
      INITIAL_PROFILES.find((p) => p.id === roleOrId) ||
      INITIAL_PROFILES[0];

    setUser({ id: target.id, email: target.email });
    setProfile(target);
    localStorage.setItem(DEMO_ACTIVE_USER_KEY, target.id);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        isSupabaseMode: isSupabase,
        signIn,
        signUp,
        signOut,
        resetPassword,
        updateCurrentUserProfile,
        switchDemoUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
