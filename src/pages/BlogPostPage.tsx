import React, { useState, useEffect } from 'react';
import { ArrowLeft, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Post } from '../types/database';
import { getPostBySlug, getPosts, incrementPostViews } from '../lib/supabase/api';
import { getCoverImageUrl } from '../lib/supabase/storage';
import { ShareButtons } from '../components/blog/ShareButtons';
import { CommentSection } from '../components/comments/CommentSection';
import { SeoInspectorModal } from '../components/ui/SeoInspectorModal';
import { PostCard } from '../components/blog/PostCard';
import { Skeleton } from '../components/ui/Skeleton';
import { ErrorState } from '../components/ui/ErrorState';

interface BlogPostPageProps {
  slug: string;
  onNavigate: (route: string) => void;
}

export const BlogPostPage: React.FC<BlogPostPageProps> = ({ slug, onNavigate }) => {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [isSeoModalOpen, setIsSeoModalOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [coverError, setCoverError] = useState(false);

  // Scroll progress indicator
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = Math.min(100, Math.max(0, (window.scrollY / totalHeight) * 100));
        setScrollProgress(progress);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    let mounted = true;
    async function loadPostData() {
      setLoading(true);
      try {
        const found = await getPostBySlug(slug);
        if (mounted) {
          setPost(found);
          if (found) {
            incrementPostViews(found.id);
            document.title = `${found.title} — Chronicle`;
          }
        }

        const published = await getPosts({ publishedOnly: true });
        if (mounted) setAllPosts(published);
      } catch (err) {
        console.error('Error fetching blog post:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    setCoverError(false);
    loadPostData();

    return () => {
      mounted = false;
      document.title = 'Chronicle — Cloud-Based Editorial & Blog Platform';
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8 animate-pulse">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-12 w-4/5" />
        <Skeleton className="h-6 w-full" />
        <div className="flex items-center gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
          <Skeleton className="w-10 h-10 rounded-full" />
          <div className="space-y-1.5 flex-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
        <Skeleton className="aspect-16/9 w-full rounded-2xl" />
        <div className="space-y-4 pt-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-11/12" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-md mx-auto px-4 py-20">
        <ErrorState
          title="Publication Not Found"
          message="The requested manuscript does not exist or may have been unlisted."
          retryLabel="Return to Archive"
          onRetry={() => onNavigate('/explore')}
        />
      </div>
    );
  }

  const wordCount = post.markdown.trim().split(/\s+/).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));
  const formattedDate = new Date(post.created_at).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const tocHeadings = post.markdown
    .split('\n')
    .filter((line) => line.startsWith('## '))
    .map((line) => line.replace(/^##\s+/, '').trim());

  const currentIndex = allPosts.findIndex((p) => p.slug === post.slug);
  const prevPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;
  const nextPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;

  const relatedPosts = allPosts
    .filter((p) => p.id !== post.id && p.tags.some((t) => post.tags.includes(t)))
    .slice(0, 2);

  return (
    <>
      {/* Sticky reading progress bar at top */}
      <div
        className="fixed top-16 left-0 right-0 h-0.5 bg-neutral-900 dark:bg-white z-40 transition-all duration-75 pointer-events-none"
        style={{ width: `${scrollProgress}%` }}
        aria-hidden="true"
      />

      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10 sm:space-y-12">
        {/* Navigation back button */}
        <div>
          <button
            onClick={() => onNavigate('/explore')}
            className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Archive Index</span>
          </button>
        </div>

        {/* Article Header & Typography Hero */}
        <header className="space-y-5">
          {/* Zero-Pill Metadata Lead */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 font-mono">
            {post.tags[0] && (
              <span className="font-semibold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider text-[11px]">
                {post.tags[0]}
              </span>
            )}
            {post.tags[0] && <span aria-hidden="true" className="text-neutral-300 dark:text-neutral-700">·</span>}
            <span className="tabular-nums">{formattedDate}</span>
            <span aria-hidden="true" className="text-neutral-300 dark:text-neutral-700">·</span>
            <span className="tabular-nums">{readTime} min read</span>
            <span aria-hidden="true" className="text-neutral-300 dark:text-neutral-700">·</span>
            <span className="tabular-nums flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              {(post.views || 0) + 1} views
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-serif font-bold text-neutral-950 dark:text-neutral-50 tracking-tight leading-[1.18] [text-wrap:balance]">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="text-base sm:text-lg font-serif text-neutral-600 dark:text-neutral-300 leading-relaxed max-w-2xl">
              {post.excerpt}
            </p>
          )}

          {/* Author Byline */}
          <div className="flex items-center gap-3 pt-4 border-t border-neutral-200/80 dark:border-neutral-800/80">
            {post.profiles?.avatar_url ? (
              <img
                src={post.profiles.avatar_url}
                alt=""
                className="w-10 h-10 rounded-full object-cover ring-1 ring-neutral-200 dark:ring-neutral-700"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-neutral-200 dark:bg-neutral-800 text-sm font-semibold flex items-center justify-center font-serif text-neutral-800 dark:text-neutral-200">
                {post.profiles?.display_name?.charAt(0) || 'A'}
              </div>
            )}
            <div>
              <div className="text-xs sm:text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                {post.profiles?.display_name || 'Staff Writer'}
              </div>
              <div className="text-[11px] text-neutral-500 line-clamp-1 font-sans">
                {post.profiles?.bio || 'Technical Writer and System Researcher at Chronicle.'}
              </div>
            </div>
          </div>
        </header>

        {/* Cover Image */}
        {getCoverImageUrl(post.cover_image) && !coverError && (
          <div className="aspect-16/9 w-full rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-850 shadow-2xs">
            <img
              src={getCoverImageUrl(post.cover_image)}
              alt={post.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              onError={(event) => {
                console.error('Cover image failed to load:', {
                  url: getCoverImageUrl(post.cover_image),
                  coverImage: post.cover_image,
                });
                setCoverError(true);
              }}
            />
          </div>
        )}

        {/* Table of Contents */}
        {tocHeadings.length > 1 && (
          <nav
            aria-label="Table of contents"
            className="p-5 sm:p-6 rounded-xl border border-neutral-200/90 dark:border-neutral-800/90 bg-neutral-50/70 dark:bg-neutral-900/30 space-y-2.5"
          >
            <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 font-mono">
              Table of Contents
            </div>
            <ul className="space-y-1.5 text-xs text-neutral-700 dark:text-neutral-300">
              {tocHeadings.map((heading, i) => (
                <li key={i} className="flex items-baseline gap-2">
                  <span className="text-neutral-400 font-mono text-[11px] tabular-nums">0{i + 1}.</span>
                  <span className="font-medium">{heading}</span>
                </li>
              ))}
            </ul>
          </nav>
        )}

        {/* Main Body Markdown Content */}
        <div className="prose-editorial max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {post.markdown}
          </ReactMarkdown>
        </div>

        {/* Tags List */}
        <div className="flex flex-wrap items-center gap-1.5 pt-4">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mr-2 font-mono">
            Filed:
          </span>
          {post.tags.map((t) => (
            <button
              key={t}
              onClick={() => onNavigate(`/explore?tag=${t}`)}
              className="px-2.5 py-1 rounded-md text-xs bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
            >
              {t}
            </button>
          ))}
        </div>

        {/* Share Buttons and SEO Inspector */}
        <ShareButtons
          post={post}
          onOpenSeoInspector={() => setIsSeoModalOpen(true)}
        />

        {/* Previous / Next Article Navigation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-b border-neutral-200 dark:border-neutral-800 pb-8">
          {prevPost ? (
            <button
              onClick={() => onNavigate(`/blog/${prevPost.slug}`)}
              className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 text-left hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors cursor-pointer space-y-1 group"
            >
              <div className="text-[11px] text-neutral-400 flex items-center gap-1 font-mono">
                <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                <span>Previous Publication</span>
              </div>
              <div className="text-xs font-serif font-bold text-neutral-900 dark:text-neutral-100 line-clamp-1">
                {prevPost.title}
              </div>
            </button>
          ) : (
            <div />
          )}

          {nextPost && (
            <button
              onClick={() => onNavigate(`/blog/${nextPost.slug}`)}
              className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 text-right hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors cursor-pointer space-y-1 sm:col-start-2 group"
            >
              <div className="text-[11px] text-neutral-400 flex items-center justify-end gap-1 font-mono">
                <span>Next Publication</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <div className="text-xs font-serif font-bold text-neutral-900 dark:text-neutral-100 line-clamp-1">
                {nextPost.title}
              </div>
            </button>
          )}
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="space-y-4 pt-2">
            <h3 className="text-base font-serif font-bold text-neutral-900 dark:text-neutral-100">
              Related Inquiries
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {relatedPosts.map((rel) => (
                <PostCard
                  key={rel.id}
                  post={rel}
                  onSelect={(s) => onNavigate(`/blog/${s}`)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Comments Section */}
        <CommentSection
          postId={post.id}
          onNavigateLogin={() => onNavigate('/login')}
        />

        {/* SEO & Open Graph Inspector Modal */}
        <SeoInspectorModal
          post={post}
          isOpen={isSeoModalOpen}
          onClose={() => setIsSeoModalOpen(false)}
        />
      </article>
    </>
  );
};
