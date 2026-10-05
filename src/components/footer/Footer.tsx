import React from 'react';
import { ArrowUpRight } from 'lucide-react';

interface FooterProps {
  onNavigate: (route: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <span className="text-xl font-serif font-bold text-neutral-900 dark:text-neutral-100">
              Chronicle
            </span>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-xs">
              A high-integrity publishing platform built on PostgreSQL Row Level Security, Supabase Auth, and modern cloud architecture.
            </p>
          </div>

          {/* Editorial Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-neutral-200">
              Publication
            </h4>
            <ul className="space-y-2 text-xs text-neutral-600 dark:text-neutral-400">
              <li>
                <button
                  onClick={() => onNavigate('/')}
                  className="hover:text-neutral-950 dark:hover:text-white transition-colors cursor-pointer"
                >
                  Featured Essays
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/explore')}
                  className="hover:text-neutral-950 dark:hover:text-white transition-colors cursor-pointer"
                >
                  Archive & Search
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/explore?tag=Architecture')}
                  className="hover:text-neutral-950 dark:hover:text-white transition-colors cursor-pointer"
                >
                  System Architecture
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/explore?tag=PostgreSQL')}
                  className="hover:text-neutral-950 dark:hover:text-white transition-colors cursor-pointer"
                >
                  Database Engineering
                </button>
              </li>
            </ul>
          </div>

          {/* Platform & Roles */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-neutral-200">
              Roles & Dashboards
            </h4>
            <ul className="space-y-2 text-xs text-neutral-600 dark:text-neutral-400">
              <li>
                <button
                  onClick={() => onNavigate('/dashboard')}
                  className="hover:text-neutral-950 dark:hover:text-white transition-colors cursor-pointer"
                >
                  Writer Studio
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/dashboard/posts/new')}
                  className="hover:text-neutral-950 dark:hover:text-white transition-colors cursor-pointer"
                >
                  Markdown Editor
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/admin')}
                  className="hover:text-neutral-950 dark:hover:text-white transition-colors cursor-pointer"
                >
                  Admin Governance
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/profile')}
                  className="hover:text-neutral-950 dark:hover:text-white transition-colors cursor-pointer"
                >
                  Account Profile
                </button>
              </li>
            </ul>
          </div>

          {/* Architecture / Deployment Specs */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-neutral-200">
              Deployment & Stack
            </h4>
            <div className="text-xs text-neutral-500 space-y-1.5 leading-relaxed">
              <div>PostgreSQL 15+ with Row Level Security</div>
              <div>Supabase Auth & Storage API</div>
              <div>Vercel Production Edge Ready</div>
              <div>Next.js & React SPA Dual Architecture</div>
            </div>
          </div>
        </div>

        <div className="border-t border-neutral-200 dark:border-neutral-800 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 gap-4">
          <div>
            &copy; {new Date().getFullYear()} Chronicle Publishing Platform. Open source architecture.
          </div>
          <div className="flex items-center gap-6">
            <span>PostgreSQL · Supabase · Vercel</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
