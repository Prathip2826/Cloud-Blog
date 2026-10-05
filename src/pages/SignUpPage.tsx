import React, { useState } from 'react';
import { UserPlus, Mail, Lock, User, Shield } from 'lucide-react';
import { useAuth } from '../lib/auth/AuthContext';
import { useToast } from '../components/ui/Toast';
import { UserRole } from '../types/database';

interface SignUpPageProps {
  onNavigate: (route: string) => void;
}

export const SignUpPage: React.FC<SignUpPageProps> = ({ onNavigate }) => {
  const { signUp } = useAuth();
  const { toast } = useToast();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('writer');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !displayName) {
      toast('Please fill in all required fields', 'error');
      return;
    }

    if (password.length < 6) {
      toast('Password must be at least 6 characters long', 'error');
      return;
    }

    setLoading(true);
    const result = await signUp(email, password, displayName, role);
    setLoading(false);

    if (result.error) {
      toast(result.error, 'error');
    } else {
      toast('Account created successfully!', 'success');
      if (role === 'writer' || role === 'admin') {
        onNavigate('/dashboard');
      } else {
        onNavigate('/');
      }
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-serif font-bold text-neutral-950 dark:text-white">
          Create an Account
        </h1>
        <p className="text-xs text-neutral-500">
          Join the Chronicle publishing community as a writer or reader.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Full Name or Pen Name
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Eleanor Vance"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:outline-hidden focus:ring-1 focus:ring-neutral-900"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              placeholder="eleanor@chronicle.io"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:outline-hidden focus:ring-1 focus:ring-neutral-900"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Password (Min 6 Characters)
          </label>
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

        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Account Role
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setRole('writer')}
              className={`p-3 rounded-lg border text-left text-xs transition-colors cursor-pointer ${
                role === 'writer'
                  ? 'border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-950'
                  : 'border-neutral-200 dark:border-neutral-700'
              }`}
            >
              <div className="font-semibold">Writer</div>
              <div className="text-[11px] opacity-75 mt-0.5">Author articles & drafts</div>
            </button>

            <button
              type="button"
              onClick={() => setRole('reader')}
              className={`p-3 rounded-lg border text-left text-xs transition-colors cursor-pointer ${
                role === 'reader'
                  ? 'border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-950'
                  : 'border-neutral-200 dark:border-neutral-700'
              }`}
            >
              <div className="font-semibold">Reader</div>
              <div className="text-[11px] opacity-75 mt-0.5">Read & participate</div>
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
        >
          {loading ? 'Creating Profile...' : 'Complete Registration'}
        </button>
      </form>

      <div className="text-center text-xs text-neutral-500">
        Already have an account?{' '}
        <button
          onClick={() => onNavigate('/login')}
          className="font-medium text-neutral-900 dark:text-neutral-200 hover:underline cursor-pointer"
        >
          Sign in
        </button>
      </div>
    </div>
  );
};
