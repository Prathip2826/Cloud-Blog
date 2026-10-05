import React, { useState, useEffect } from 'react';
import { AuthProvider } from './lib/auth/AuthContext';
import { ToastProvider } from './components/ui/Toast';
import { Navbar } from './components/navbar/Navbar';
import { Footer } from './components/footer/Footer';
import { SearchModal } from './components/blog/SearchModal';
import { DemoBadgeModal } from './components/ui/DemoBadgeModal';

// Pages
import { HomePage } from './pages/HomePage';
import { ExplorePage } from './pages/ExplorePage';
import { BlogPostPage } from './pages/BlogPostPage';
import { WriterDashboardPage } from './pages/WriterDashboardPage';
import { NewPostPage } from './pages/NewPostPage';
import { EditPostPage } from './pages/EditPostPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { LoginPage } from './pages/LoginPage';
import { SignUpPage } from './pages/SignUpPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ProfilePage } from './pages/ProfilePage';

export function AppContent() {
  // Simple client-side path/hash routing
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace(/^#/, '');
      return hash || window.location.pathname || '/';
    }
    return '/';
  });

  // Dark mode state
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('chronicle_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Sync dark mode class
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('chronicle_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('chronicle_theme', 'light');
    }
  }, [isDark]);

  // Sync hash routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#/, '');
      setCurrentRoute(hash || '/');
      window.scrollTo(0, 0);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (route: string) => {
    if (route.startsWith('/')) {
      window.location.hash = route;
      setCurrentRoute(route);
      window.scrollTo(0, 0);
    }
  };

  // Route matching
  const renderRoute = () => {
    const path = currentRoute.split('?')[0];

    // Home
    if (path === '/' || path === '') {
      return <HomePage onNavigate={navigate} />;
    }

    // Explore / Archive
    if (path.startsWith('/explore')) {
      // Parse optional query param ?tag=...
      const query = currentRoute.includes('?') ? new URLSearchParams(currentRoute.split('?')[1]) : null;
      const initialTag = query?.get('tag') || undefined;
      return <ExplorePage onNavigate={navigate} initialTag={initialTag} />;
    }

    // Blog Post Detail: /blog/:slug
    if (path.startsWith('/blog/')) {
      const slug = path.replace('/blog/', '');
      return <BlogPostPage slug={slug} onNavigate={navigate} />;
    }

    // Writer Dashboard: /dashboard
    if (path === '/dashboard' || path === '/dashboard/posts') {
      return <WriterDashboardPage onNavigate={navigate} />;
    }

    // New Post: /dashboard/posts/new
    if (path === '/dashboard/posts/new') {
      return <NewPostPage onNavigate={navigate} />;
    }

    // Edit Post: /dashboard/posts/:id/edit
    if (path.startsWith('/dashboard/posts/') && path.endsWith('/edit')) {
      const parts = path.split('/');
      const postId = parts[3];
      return <EditPostPage postId={postId} onNavigate={navigate} />;
    }

    // Admin Console: /admin
    if (path === '/admin') {
      return <AdminDashboardPage onNavigate={navigate} />;
    }

    // Auth Routes
    if (path === '/login') {
      return <LoginPage onNavigate={navigate} />;
    }
    if (path === '/signup') {
      return <SignUpPage onNavigate={navigate} />;
    }
    if (path === '/forgot-password') {
      return <ForgotPasswordPage onNavigate={navigate} />;
    }
    if (path === '/profile') {
      return <ProfilePage onNavigate={navigate} />;
    }

    // Fallback 404
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="text-2xl font-serif font-bold text-neutral-900 dark:text-neutral-100">
          Page Not Found (404)
        </h2>
        <p className="text-xs text-neutral-500">
          The requested page <code className="font-mono">{path}</code> does not exist in the publication index.
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 text-xs font-medium bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 cursor-pointer"
        >
          Return to Chronicle
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100 transition-colors">
      {/* Top 3-Zone Navigation */}
      <Navbar
        currentRoute={currentRoute}
        onNavigate={navigate}
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      {/* Main Viewport */}
      <main className="flex-1">
        {renderRoute()}
      </main>

      {/* Footer */}
      <Footer onNavigate={navigate} />

      {/* Global Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectPost={(slug) => navigate(`/blog/${slug}`)}
      />

      {/* Demo Mode / Supabase Status Badge and Config Modal */}
      <DemoBadgeModal />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
}
