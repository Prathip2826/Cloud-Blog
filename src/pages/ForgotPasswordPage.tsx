import React, { useState } from 'react';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../lib/auth/AuthContext';
import { useToast } from '../components/ui/Toast';

interface ForgotPasswordPageProps {
  onNavigate: (route: string) => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ onNavigate }) => {
  const { resetPassword } = useAuth();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast('Please enter your email', 'error');
      return;
    }

    setLoading(true);
    const res = await resetPassword(email);
    setLoading(false);

    if (res.error) {
      toast(res.error, 'error');
    } else {
      setSubmitted(true);
      toast('Password reset instructions sent', 'success');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-8">
      <div>
        <button
          onClick={() => onNavigate('/login')}
          className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Sign In</span>
        </button>
      </div>

      <div className="text-center space-y-2">
        <h1 className="text-3xl font-serif font-bold text-neutral-950 dark:text-white">
          Reset Password
        </h1>
        <p className="text-xs text-neutral-500">
          Enter your registered email address to receive password recovery instructions.
        </p>
      </div>

      {submitted ? (
        <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 text-center space-y-3 bg-neutral-50 dark:bg-neutral-900/40">
          <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            Check your inbox
          </h3>
          <p className="text-xs text-neutral-500">
            We have sent password recovery details to <strong>{email}</strong>.
          </p>
          <button
            onClick={() => onNavigate('/login')}
            className="mt-4 px-4 py-2 text-xs font-medium bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 cursor-pointer"
          >
            Return to Login
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Account Email
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
          >
            {loading ? 'Sending Instructions...' : 'Send Recovery Email'}
          </button>
        </form>
      )}
    </div>
  );
};
