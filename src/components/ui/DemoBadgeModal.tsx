import React, { useState } from 'react';
import { Database, ShieldCheck, Key, Check, Copy, ExternalLink, RefreshCw, X, UserCheck } from 'lucide-react';
import { isSupabaseConfigured, getSupabaseConfig, saveSupabaseConfig, resetSupabaseClient } from '../../lib/supabase/client';
import { useAuth } from '../../lib/auth/AuthContext';
import { useToast } from './Toast';

export const DemoBadgeModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isSupabaseMode, profile, switchDemoUser } = useAuth();
  const { toast } = useToast();
  const config = getSupabaseConfig();

  const [urlInput, setUrlInput] = useState(config.url || '');
  const [keyInput, setKeyInput] = useState(config.anonKey || '');
  const [copiedSql, setCopiedSql] = useState(false);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim() || !keyInput.trim()) {
      saveSupabaseConfig({ url: '', anonKey: '' });
      resetSupabaseClient();
      toast('Cleared live credentials. Switched to Demo Mode.', 'info');
      window.location.reload();
      return;
    }

    if (!urlInput.startsWith('https://')) {
      toast('Supabase URL must start with https://', 'error');
      return;
    }

    saveSupabaseConfig({
      url: urlInput.trim(),
      anonKey: keyInput.trim(),
    });
    resetSupabaseClient();
    toast('Supabase credentials saved! Reloading application...', 'success');
    setTimeout(() => {
      window.location.reload();
    }, 600);
  };

  const handleResetToDemo = () => {
    saveSupabaseConfig({ url: '', anonKey: '' });
    resetSupabaseClient();
    toast('Switched to local Demo Mode', 'info');
    window.location.reload();
  };

  return (
    <>
      {/* Small status indicator in bottom-left */}
      <div className="fixed bottom-4 left-4 z-40">
        <button
          onClick={() => setIsOpen(true)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono border shadow-sm transition-all cursor-pointer ${
            isSupabaseMode
              ? 'bg-emerald-50 border-emerald-300 text-emerald-800 dark:bg-emerald-950/60 dark:border-emerald-800 dark:text-emerald-300 hover:bg-emerald-100'
              : 'bg-neutral-100 border-neutral-300 text-neutral-700 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-300 hover:bg-neutral-200'
          }`}
          title="Click to view backend status and configure live Supabase credentials"
        >
          <span className={`w-2 h-2 rounded-full ${isSupabaseMode ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
          <span>{isSupabaseMode ? 'Supabase Live' : 'Demo Mode'}</span>
          <span className="text-neutral-400">·</span>
          <span className="font-sans font-medium capitalize">{profile?.role || 'Guest'}</span>
        </button>
      </div>

      {/* Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                  <Database className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                    Backend Connection & Roles
                  </h2>
                  <p className="text-xs text-neutral-500">
                    {isSupabaseMode
                      ? 'Connected to live Supabase PostgreSQL database'
                      : 'Running in resilient offline demo mode with mock data'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Role Persona Switcher (Crucial for testing all requirements) */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Switch Test Role Persona (Interactive Preview)
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    switchDemoUser('writer');
                    toast('Switched to Writer persona (Eleanor Vance)', 'success');
                  }}
                  className={`p-3 text-left rounded-lg border text-xs transition-colors cursor-pointer ${
                    profile?.role === 'writer'
                      ? 'border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-950'
                      : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                  }`}
                >
                  <div className="font-semibold">Writer</div>
                  <div className="text-[11px] opacity-80 truncate">Eleanor Vance</div>
                  <div className="text-[10px] opacity-70 mt-1">Writer Dashboard, Drafts, CRUD</div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    switchDemoUser('admin');
                    toast('Switched to Admin persona (Dr. Julian Mercer)', 'success');
                  }}
                  className={`p-3 text-left rounded-lg border text-xs transition-colors cursor-pointer ${
                    profile?.role === 'admin'
                      ? 'border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-950'
                      : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                  }`}
                >
                  <div className="font-semibold">Admin</div>
                  <div className="text-[11px] opacity-80 truncate">Dr. Julian Mercer</div>
                  <div className="text-[10px] opacity-70 mt-1">Admin Panel, Moderate, Users</div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    switchDemoUser('reader');
                    toast('Switched to Reader persona (Marcus Brody)', 'success');
                  }}
                  className={`p-3 text-left rounded-lg border text-xs transition-colors cursor-pointer ${
                    profile?.role === 'reader'
                      ? 'border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-950'
                      : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                  }`}
                >
                  <div className="font-semibold">Reader</div>
                  <div className="text-[11px] opacity-80 truncate">Marcus Brody</div>
                  <div className="text-[10px] opacity-70 mt-1">Read Posts, Add Comments</div>
                </button>
              </div>
            </div>

            {/* Live Supabase Connection Form */}
            <form onSubmit={handleSaveConfig} className="space-y-3 pt-2 border-t border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  Live Supabase Credentials
                </label>
                {isSupabaseMode && (
                  <button
                    type="button"
                    onClick={handleResetToDemo}
                    className="text-xs text-rose-500 hover:underline cursor-pointer"
                  >
                    Reset to Demo Mode
                  </button>
                )}
              </div>

              <div className="space-y-2">
                <div>
                  <label className="block text-xs text-neutral-600 dark:text-neutral-400 mb-1">
                    Supabase Project URL (NEXT_PUBLIC_SUPABASE_URL)
                  </label>
                  <input
                    type="url"
                    placeholder="https://xyzcompany.supabase.co"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 focus:outline-hidden focus:ring-1 focus:ring-neutral-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs text-neutral-600 dark:text-neutral-400 mb-1">
                    Supabase Anon Public Key (NEXT_PUBLIC_SUPABASE_ANON_KEY)
                  </label>
                  <input
                    type="password"
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    value={keyInput}
                    onChange={(e) => setKeyInput(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 focus:outline-hidden focus:ring-1 focus:ring-neutral-900 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-neutral-500">
                  Never requires service-role keys. Anon key is safe for client-side.
                </span>
                <button
                  type="submit"
                  className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-white text-xs font-medium rounded-lg transition-colors cursor-pointer"
                >
                  Save & Connect
                </button>
              </div>
            </form>

            {/* SQL schema quick reference */}
            <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-600 dark:text-neutral-400">
                  PostgreSQL Schema & RLS File: <code className="font-mono text-neutral-900 dark:text-neutral-200">supabase_schema.sql</code>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setCopiedSql(true);
                    toast('Schema filename copied to clipboard', 'info');
                    setTimeout(() => setCopiedSql(false), 2000);
                  }}
                  className="text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200 flex items-center gap-1"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSql ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
