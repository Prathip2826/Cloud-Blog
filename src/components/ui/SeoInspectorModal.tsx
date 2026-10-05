import React, { useState } from 'react';
import { Eye, Globe, Share2, FileCode, Check, Copy, X } from 'lucide-react';
import { Post } from '../../types/database';
import { useToast } from './Toast';

interface SeoInspectorModalProps {
  post?: Post | null;
  isOpen: boolean;
  onClose: () => void;
}

export const SeoInspectorModal: React.FC<SeoInspectorModalProps> = ({
  post,
  isOpen,
  onClose,
}) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'og' | 'sitemap' | 'robots'>('og');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://chronicle-blog.vercel.app';
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://chronicle-blog.vercel.app';

  const title = post ? `${post.title} — Chronicle` : 'Chronicle — Cloud-Based Editorial & Blog Platform';
  const description = post
    ? post.excerpt || post.title
    : 'Production-grade cloud-based blog platform with Supabase authentication, PostgreSQL RLS, and dynamic Markdown rendering.';
  const image = post?.cover_image || `${siteUrl}/og-image.jpg`;
  const canonicalUrl = post ? `${siteUrl}/#/blog/${post.slug}` : siteUrl;

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteUrl}/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${siteUrl}/#/explore</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  ${
    post
      ? `<url>
    <loc>${canonicalUrl}</loc>
    <lastmod>${new Date(post.updated_at).toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`
      : ''
  }
</urlset>`;

  const robotsTxt = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /dashboard

Sitemap: ${siteUrl}/sitemap.xml`;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast(`${label} copied to clipboard`, 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-2xl space-y-5 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
            <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
              SEO, Meta Tags & Social Share Inspector
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-neutral-200 dark:border-neutral-800 pb-2">
          <button
            onClick={() => setActiveTab('og')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              activeTab === 'og'
                ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-950'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            Social Card & Meta
          </button>
          <button
            onClick={() => setActiveTab('sitemap')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              activeTab === 'sitemap'
                ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-950'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            sitemap.xml
          </button>
          <button
            onClick={() => setActiveTab('robots')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              activeTab === 'robots'
                ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-950'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            robots.txt
          </button>
        </div>

        {/* Tab 1: Open Graph and Twitter Card */}
        {activeTab === 'og' && (
          <div className="space-y-4">
            <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden bg-neutral-50 dark:bg-neutral-800/40">
              {post?.cover_image && (
                <div className="aspect-16/9 w-full bg-neutral-900 overflow-hidden">
                  <img
                    src={post.cover_image}
                    alt={post.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-4 space-y-1.5">
                <div className="text-[11px] font-mono text-neutral-500 uppercase tracking-wider">
                  chronicle-blog.vercel.app
                </div>
                <div className="text-base font-semibold text-neutral-900 dark:text-neutral-100 line-clamp-2">
                  {title}
                </div>
                <div className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2">
                  {description}
                </div>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="font-semibold text-neutral-700 dark:text-neutral-300">Generated HTML Meta Tags:</div>
              <pre className="p-3 rounded-lg bg-neutral-900 text-neutral-200 font-mono text-[11px] overflow-x-auto leading-relaxed">
{`<title>${title}</title>
<meta name="description" content="${description}" />
<link rel="canonical" href="${canonicalUrl}" />
<meta property="og:title" content="${title}" />
<meta property="og:description" content="${description}" />
<meta property="og:type" content="article" />
<meta property="og:url" content="${canonicalUrl}" />
<meta property="og:image" content="${image}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${title}" />
<meta name="twitter:description" content="${description}" />`}
              </pre>
            </div>
          </div>
        )}

        {/* Tab 2: sitemap.xml */}
        {activeTab === 'sitemap' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-500">Valid XML Sitemap for search engines</span>
              <button
                onClick={() => copyToClipboard(sitemapXml, 'Sitemap XML')}
                className="text-xs text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 flex items-center gap-1 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy XML</span>
              </button>
            </div>
            <pre className="p-3 rounded-lg bg-neutral-900 text-neutral-200 font-mono text-[11px] overflow-x-auto max-h-64 leading-relaxed">
              {sitemapXml}
            </pre>
          </div>
        )}

        {/* Tab 3: robots.txt */}
        {activeTab === 'robots' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-500">Standard Crawler Directives</span>
              <button
                onClick={() => copyToClipboard(robotsTxt, 'robots.txt')}
                className="text-xs text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 flex items-center gap-1 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy robots.txt</span>
              </button>
            </div>
            <pre className="p-3 rounded-lg bg-neutral-900 text-neutral-200 font-mono text-[11px] overflow-x-auto leading-relaxed">
              {robotsTxt}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
