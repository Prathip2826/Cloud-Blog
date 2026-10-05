import React, { useState } from 'react';
import { LogIn, ArrowRight, ShieldCheck, Mail, Lock } from 'lucide-react';
import { useAuth } from '../lib/auth/AuthContext';
import { useToast } from '../components/ui/Toast';

interface LoginPageProps {
  onNavigate: (route: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { signIn, switchDemoUser, isSupabaseMode } = useAuth();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast('Please enter your email', 'error');
      return;
    }

    setLoading(true);
    const result = await signIn(email, password);
    setLoading(false);

    if (result.error) {
      toast(result.error, 'error');
    } else {
      toast('Welcome back to Chronicle', 'success');
      onNavigate('/dashboard');
    }
  };

  const handleQuickDemoLogin = (role: string) => {
    switchDemoUser(role);
    toast(`Logged in as ${role}`, 'success');
    if (role === 'admin') onNavigate('/admin');
    else if (role === 'writer') onNavigate('/dashboard');
    else onNavigate('/');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-serif font-bold text-neutral-950 dark:text-white">
          Sign In to Chronicle
        </h1>
        <p className="text-xs text-neutral-500">
          Access your author dashboard, draft manuscripts, and join discussions.
        </p>
      </div>

      {/* Demo Quick-Login Bar (Only in Demo Mode) */}
      {!isSupabaseMode && (
        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-900/60 space-y-2">
          <div className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider font-mono">
            Demo Mode Quick-Switch
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('writer')}
              className="py-1.5 px-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded text-xs hover:border-neutral-400 font-medium cursor-pointer"
            >
              Writer Login
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('admin')}
              className="py-1.5 px-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded text-xs hover:border-neutral-400 font-medium cursor-pointer"
            >
              Admin Login
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('reader')}
              className="py-1.5 px-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded text-xs hover:border-neutral-400 font-medium cursor-pointer"
            >
              Reader Login
            </button>
          </div>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              placeholder="writer@chronicle.io"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:outline-hidden focus:ring-1 focus:ring-neutral-900"
            />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Password
            </label>
            <button
              type="button"
              onClick={() => onNavigate('/forgot-password')}
              className="text-[11px] text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:outline-hidden focus:ring-1 focus:ring-neutral-900"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
        >
          {loading ? 'Authenticating...' : 'Sign In'}
        </button>
      </form>

      <div className="text-center text-xs text-neutral-500">
        Don't have an account?{' '}
        <button
          onClick={() => onNavigate('/signup')}
          className="font-medium text-neutral-900 dark:text-neutral-200 hover:underline cursor-pointer"
        >
          Create an account
        </button>
      </div>
    </div>
  );
};
