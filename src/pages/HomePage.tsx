import React, { useState, useEffect } from 'react';
import { ArrowRight, TrendingUp } from 'lucide-react';
import { Post } from '../types/database';
import { getPosts } from '../lib/supabase/api';
import { FeaturedPost } from '../components/blog/FeaturedPost';
import { PostCard } from '../components/blog/PostCard';
import { PostCardSkeleton, Skeleton } from '../components/ui/Skeleton';
import { useToast } from '../components/ui/Toast';

interface HomePageProps {
  onNavigate: (route: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const [featuredPost, setFeaturedPost] = useState<Post | null>(null);
  const [latestPosts, setLatestPosts] = useState<Post[]>([]);
  const [popularPosts, setPopularPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [emailInput, setEmailInput] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      setLoading(true);
      try {
        const [latest, popular] = await Promise.all([
          getPosts({ publishedOnly: true, sort: 'newest', limit: 7 }),
          getPosts({ publishedOnly: true, sort: 'popular', limit: 4 }),
        ]);

        if (mounted) {
          if (latest.length > 0) {
            setFeaturedPost(latest[0]);
            setLatestPosts(latest.slice(1, 7));
          }
          setPopularPosts(popular);
        }
      } catch (err) {
        console.error('Error loading home data:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    toast(`Subscribed ${emailInput} to the weekly Chronicle Dispatch.`, 'success');
    setEmailInput('');
  };

  return (
    <div className="space-y-16 sm:space-y-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14">
      {/* Editorial Hero Statement */}
      <section className="text-center max-w-3xl mx-auto space-y-4 pt-2 sm:pt-6">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-neutral-500 font-mono">
          <span>Vol. IV</span>
          <span aria-hidden="true">·</span>
          <span>Distributed Systems & Fine Software</span>
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-neutral-950 dark:text-white tracking-tight leading-[1.12] [text-wrap:balance]">
          Inquiries in Cloud Systems & Software Architecture
        </h1>
        <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-300 leading-relaxed font-serif max-w-2xl mx-auto">
          An open editorial publication exploring high-concurrency protocols, PostgreSQL storage internals, edge compute sandboxes, and modern typography.
        </p>

        <div className="flex items-center justify-center gap-3 pt-3">
          <button
            onClick={() => onNavigate('/explore')}
            className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-white text-xs font-medium rounded-lg transition-colors cursor-pointer shadow-xs"
          >
            Explore All Essays
          </button>
          <button
            onClick={() => onNavigate('/dashboard/posts/new')}
            className="px-5 py-2.5 border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 text-xs font-medium rounded-lg transition-colors cursor-pointer"
          >
            Write Manuscript
          </button>
        </div>
      </section>

      {/* Featured Inquiry Section */}
      {loading ? (
        <div className="border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 sm:p-10 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <Skeleton className="lg:col-span-7 aspect-16/10 rounded-xl" />
            <div className="lg:col-span-5 space-y-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-6 w-44 mt-6" />
            </div>
          </div>
        </div>
      ) : featuredPost ? (
        <section className="space-y-4" aria-label="Featured inquiry">
          <FeaturedPost
            post={featuredPost}
            onSelect={(slug) => onNavigate(`/blog/${slug}`)}
          />
        </section>
      ) : null}

      {/* Main Grid: Latest Essays & Popular Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Latest Essays (8 Columns) */}
        <section className="lg:col-span-8 space-y-8" aria-label="Latest publications">
          <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
            <h2 className="text-xl font-serif font-bold text-neutral-900 dark:text-neutral-100">
              Latest Publications
            </h2>
            <button
              onClick={() => onNavigate('/explore')}
              className="text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <span>View archive</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => <PostCardSkeleton key={i} />)
              : latestPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onSelect={(slug) => onNavigate(`/blog/${slug}`)}
                  />
                ))}
          </div>
        </section>

        {/* Popular Essays & Curated Dispatch (4 Columns) */}
        <aside className="lg:col-span-4 space-y-10" aria-label="Readership trends">
          {/* Popular Ranked List */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-3">
              <TrendingUp className="w-4 h-4 text-neutral-500" />
              <h3 className="text-base font-serif font-bold text-neutral-900 dark:text-neutral-100">
                Most Read Inquiries
              </h3>
            </div>

            <div className="divide-y divide-neutral-100 dark:divide-neutral-800/80">
              {loading
                ? Array.from({ length: 3 }).map((_, idx) => (
                    <div key={idx} className="py-3.5 space-y-2">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-5 w-full" />
                    </div>
                  ))
                : popularPosts.map((post, idx) => (
                    <article
                      key={post.id}
                      onClick={() => onNavigate(`/blog/${post.slug}`)}
                      className="py-3.5 group cursor-pointer flex items-start gap-4"
                    >
                      <span className="font-serif text-2xl font-bold text-neutral-300 dark:text-neutral-700 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors tabular-nums">
                        0{idx + 1}
                      </span>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-[11px] text-neutral-400 font-mono">
                          <span>{post.tags[0] || 'System'}</span>
                          <span aria-hidden="true">·</span>
                          <span className="tabular-nums">{post.views.toLocaleString()} reads</span>
                        </div>
                        <h4 className="text-xs font-serif font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-neutral-700 dark:group-hover:text-white transition-colors line-clamp-2 leading-snug">
                          {post.title}
                        </h4>
                      </div>
                    </article>
                  ))}
            </div>
          </div>

          {/* Curated Dispatch Callout */}
          <div className="p-6 rounded-2xl border border-neutral-200/90 dark:border-neutral-800/90 bg-neutral-100/60 dark:bg-neutral-900/40 space-y-4">
            <div className="space-y-1.5">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 font-mono">
                The Chronicle Dispatch
              </div>
              <h4 className="text-base font-serif font-bold text-neutral-900 dark:text-neutral-100">
                Weekly Curated Engineering
              </h4>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed font-sans">
                Receive thoughtful essays on distributed consensus, edge sandboxes, and modern PostgreSQL directly to your inbox.
              </p>
            </div>

            <form onSubmit={handleSubscribe} className="space-y-2">
              <input
                type="email"
                placeholder="colleague@domain.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:outline-hidden focus:ring-1 focus:ring-neutral-900"
                aria-label="Email address for Chronicle newsletter"
              />
              <button
                type="submit"
                className="w-full py-2 bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-white text-xs font-medium rounded-lg transition-colors cursor-pointer shadow-2xs"
              >
                Join 18,000+ Engineers
              </button>
            </form>
          </div>
        </aside>
      </div>
    </div>
  );
};
