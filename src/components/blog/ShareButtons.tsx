import React, { useState } from 'react';
import { Share2, Twitter, Linkedin, Link2, Check, Globe } from 'lucide-react';
import { Post } from '../../types/database';
import { useToast } from '../ui/Toast';

interface ShareButtonsProps {
  post: Post;
  onOpenSeoInspector?: () => void;
}

export const ShareButtons: React.FC<ShareButtonsProps> = ({ post, onOpenSeoInspector }) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const url = typeof window !== 'undefined' ? window.location.href : '';
  const title = post.title;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast('Article URL copied to clipboard', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      title
    )}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, '_blank', 'noopener,noreferrer');
  };

  const handleShareLinkedin = () => {
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
      url
    )}`;
    window.open(linkedinUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="flex items-center gap-2 py-4 border-y border-neutral-200 dark:border-neutral-800">
      <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mr-2">
        Share
      </span>

      <button
        onClick={handleCopyLink}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-800 transition-colors cursor-pointer"
        title="Copy article link"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Link2 className="w-3.5 h-3.5" />}
        <span>{copied ? 'Copied' : 'Copy Link'}</span>
      </button>

      <button
        onClick={handleShareTwitter}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-800 transition-colors cursor-pointer"
        title="Share on X / Twitter"
      >
        <Twitter className="w-3.5 h-3.5" />
        <span>Post</span>
      </button>

      <button
        onClick={handleShareLinkedin}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-800 transition-colors cursor-pointer"
        title="Share on LinkedIn"
      >
        <Linkedin className="w-3.5 h-3.5" />
        <span>Share</span>
      </button>

      {onOpenSeoInspector && (
        <button
          onClick={onOpenSeoInspector}
          className="ml-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
          title="Inspect Open Graph, SEO, and Sitemap"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>SEO & Metadata</span>
        </button>
      )}
    </div>
  );
};
