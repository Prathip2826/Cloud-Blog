import React, { useState, useEffect } from 'react';
import {
  Search,
  Sun,
  Moon,
  User,
  LogOut,
  LayoutDashboard,
  Shield,
  PenTool,
  ChevronDown,
  Menu,
  X,
  Compass,
  BookOpen
} from 'lucide-react';
import { useAuth } from '../../lib/auth/AuthContext';

interface NavbarProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenSearch: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRoute,
  onNavigate,
  isDark,
  onToggleTheme,
  onOpenSearch,
}) => {
  const { user, profile, signOut } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close menus on route change
  useEffect(() => {
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
  }, [currentRoute]);

  const isWriter = profile?.role === 'writer' || profile?.role === 'admin';
  const isAdmin = profile?.role === 'admin';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200/80 dark:border-neutral-800/80 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Zone 1: Wordmark */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => onNavigate('/')}
            className="text-xl font-serif font-bold tracking-tight text-neutral-950 dark:text-neutral-50 hover:opacity-85 transition-opacity cursor-pointer focus-visible:ring-2 focus-visible:ring-neutral-900 rounded-sm"
            aria-label="Chronicle Home"
          >
            Chronicle
          </button>
        </div>

        {/* Zone 2: Navigation Links (Clean text links with subtle underlines for desktop) */}
        <nav
          className="hidden md:flex items-center gap-7 text-sm font-medium text-neutral-600 dark:text-neutral-400"
          aria-label="Primary navigation"
        >
          <button
            onClick={() => onNavigate('/')}
            className={`transition-colors hover:text-neutral-950 dark:hover:text-white cursor-pointer py-1 ${
              currentRoute === '/' || currentRoute === ''
                ? 'text-neutral-950 dark:text-white border-b-2 border-neutral-900 dark:border-white font-semibold'
                : 'border-b-2 border-transparent'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => onNavigate('/explore')}
            className={`transition-colors hover:text-neutral-950 dark:hover:text-white cursor-pointer py-1 ${
              currentRoute.startsWith('/explore') && !currentRoute.includes('tag=')
                ? 'text-neutral-950 dark:text-white border-b-2 border-neutral-900 dark:border-white font-semibold'
                : 'border-b-2 border-transparent'
            }`}
          >
            Explore
          </button>
          <button
            onClick={() => onNavigate('/explore?tag=Architecture')}
            className={`transition-colors hover:text-neutral-950 dark:hover:text-white cursor-pointer py-1 ${
              currentRoute.includes('tag=Architecture')
                ? 'text-neutral-950 dark:text-white border-b-2 border-neutral-900 dark:border-white font-semibold'
                : 'border-b-2 border-transparent'
            }`}
          >
            Architecture
          </button>
          <button
            onClick={() => onNavigate('/explore?tag=PostgreSQL')}
            className={`transition-colors hover:text-neutral-950 dark:hover:text-white cursor-pointer py-1 ${
              currentRoute.includes('tag=PostgreSQL')
                ? 'text-neutral-950 dark:text-white border-b-2 border-neutral-900 dark:border-white font-semibold'
                : 'border-b-2 border-transparent'
            }`}
          >
            Systems
          </button>
        </nav>

        {/* Zone 3: Actions (Search, Theme, User Profile / Auth, Mobile Toggle) */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <button
            onClick={onOpenSearch}
            className="p-2 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
            aria-label="Search articles (Cmd+K)"
            title="Search articles"
          >
            <Search className="w-4 h-4" />
          </button>

          <button
            onClick={onToggleTheme}
            className="p-2 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Light mode' : 'Dark mode'}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* User Account / Dropdown (Desktop) */}
          {user ? (
            <div className="relative hidden md:block">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                aria-expanded={userMenuOpen}
                aria-label="User account menu"
                className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors cursor-pointer"
              >
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.display_name}
                    className="w-6 h-6 rounded-full object-cover border border-neutral-200 dark:border-neutral-700"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-neutral-200 dark:bg-neutral-800 text-[11px] font-semibold flex items-center justify-center text-neutral-800 dark:text-neutral-200">
                    {profile?.display_name?.charAt(0) || 'U'}
                  </div>
                )}
                <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200 max-w-[110px] truncate">
                  {profile?.display_name || user.email?.split('@')[0]}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
              </button>

              {userMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xl py-1.5 z-50 animate-in fade-in duration-100">
                    <div className="px-3.5 py-2.5 border-b border-neutral-100 dark:border-neutral-800">
                      <div className="text-xs font-semibold text-neutral-900 dark:text-white truncate">
                        {profile?.display_name}
                      </div>
                      <div className="text-[11px] text-neutral-400 truncate">
                        {user.email}
                      </div>
                      <div className="mt-1.5">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-600 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded">
                          {profile?.role}
                        </span>
                      </div>
                    </div>

                    <div className="py-1">
                      {isWriter && (
                        <button
                          onClick={() => {
                            setUserMenuOpen(false);
                            onNavigate('/dashboard');
                          }}
                          className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-left cursor-pointer"
                        >
                          <LayoutDashboard className="w-3.5 h-3.5" />
                          Writer Dashboard
                        </button>
                      )}

                      {isWriter && (
                        <button
                          onClick={() => {
                            setUserMenuOpen(false);
                            onNavigate('/dashboard/posts/new');
                          }}
                          className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-left cursor-pointer"
                        >
                          <PenTool className="w-3.5 h-3.5" />
                          New Article
                        </button>
                      )}

                      {isAdmin && (
                        <button
                          onClick={() => {
                            setUserMenuOpen(false);
                            onNavigate('/admin');
                          }}
                          className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-purple-700 dark:text-purple-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-left cursor-pointer"
                        >
                          <Shield className="w-3.5 h-3.5" />
                          Admin Console
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          onNavigate('/profile');
                        }}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-left cursor-pointer"
                      >
                        <User className="w-3.5 h-3.5" />
                        Profile Settings
                      </button>
                    </div>

                    <div className="border-t border-neutral-100 dark:border-neutral-800 pt-1">
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          signOut();
                          onNavigate('/');
                        }}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors text-left cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Log out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => onNavigate('/login')}
                className="px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white transition-colors cursor-pointer"
              >
                Sign in
              </button>
              <button
                onClick={() => onNavigate('/signup')}
                className="px-3.5 py-1.5 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-white rounded-lg transition-colors cursor-pointer shadow-xs"
              >
                Get Started
              </button>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-neutral-600 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-4 pt-3 pb-6 space-y-4 animate-in slide-in-from-top-2 duration-150">
          <nav className="flex flex-col space-y-1 text-sm font-medium" aria-label="Mobile navigation">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate('/');
              }}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-900 cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-neutral-400" />
              <span>Home</span>
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate('/explore');
              }}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-900 cursor-pointer"
            >
              <Compass className="w-4 h-4 text-neutral-400" />
              <span>Explore Archive</span>
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate('/explore?tag=Architecture');
              }}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900 cursor-pointer pl-9 text-xs"
            >
              <span>Architecture Essays</span>
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate('/explore?tag=PostgreSQL');
              }}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900 cursor-pointer pl-9 text-xs"
            >
              <span>Database & Systems</span>
            </button>
          </nav>

          <div className="border-t border-neutral-100 dark:border-neutral-850 pt-3">
            {user ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2.5 px-3 py-1">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.display_name}
                      className="w-7 h-7 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-neutral-200 dark:bg-neutral-800 text-xs font-semibold flex items-center justify-center">
                      {profile?.display_name?.charAt(0) || 'U'}
                    </div>
                  )}
                  <div>
                    <div className="text-xs font-semibold text-neutral-900 dark:text-white">
                      {profile?.display_name}
                    </div>
                    <div className="text-[10px] text-neutral-400 font-mono capitalize">
                      {profile?.role} account
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  {isWriter && (
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onNavigate('/dashboard');
                      }}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium border border-neutral-200 dark:border-neutral-800 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-900 cursor-pointer"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5" />
                      <span>Studio</span>
                    </button>
                  )}
                  {isWriter && (
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onNavigate('/dashboard/posts/new');
                      }}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-950 rounded-lg cursor-pointer"
                    >
                      <PenTool className="w-3.5 h-3.5" />
                      <span>New Post</span>
                    </button>
                  )}
                  {isAdmin && (
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onNavigate('/admin');
                      }}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 rounded-lg cursor-pointer"
                    >
                      <Shield className="w-3.5 h-3.5" />
                      <span>Admin</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onNavigate('/profile');
                    }}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium border border-neutral-200 dark:border-neutral-800 rounded-lg cursor-pointer"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Settings</span>
                  </button>
                </div>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    signOut();
                    onNavigate('/');
                  }}
                  className="w-full mt-2 text-center py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg cursor-pointer transition-colors"
                >
                  Log out of Chronicle
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigate('/login');
                  }}
                  className="py-2.5 text-center text-xs font-medium border border-neutral-200 dark:border-neutral-800 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-900 cursor-pointer"
                >
                  Sign in
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigate('/signup');
                  }}
                  className="py-2.5 text-center text-xs font-medium bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:text-neutral-950 rounded-lg cursor-pointer"
                >
                  Create account
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
