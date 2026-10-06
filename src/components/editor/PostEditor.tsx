import React, { useState, useEffect, useRef } from 'react';
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  Table as TableIcon,
  ArrowLeft,
  UploadCloud,
  X,
  Check,
  AlertCircle,
  Eye,
  Columns
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Post } from '../../types/database';
import { uploadBlogImage, getCoverImageUrl } from '../../lib/supabase/storage';
import { useAuth } from '../../lib/auth/AuthContext';
import { useToast } from '../ui/Toast';

interface PostEditorProps {
  initialPost?: Post | null;
  onSave: (postData: {
    title: string;
    slug: string;
    excerpt: string;
    markdown: string;
    cover_image: string;
    published: boolean;
    tags: string[];
  }) => Promise<void>;
  onCancel: () => void;
  isSaving: boolean;
}

export const PostEditor: React.FC<PostEditorProps> = ({
  initialPost,
  onSave,
  onCancel,
  isSaving,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [title, setTitle] = useState(initialPost?.title || '');
  const [slug, setSlug] = useState(initialPost?.slug || '');
  const [isSlugManual, setIsSlugManual] = useState(Boolean(initialPost?.slug));
  const [excerpt, setExcerpt] = useState(initialPost?.excerpt || '');
  const [markdown, setMarkdown] = useState(initialPost?.markdown || '');
  const [coverImage, setCoverImage] = useState(initialPost?.cover_image || '');
  const [previewUrl, setPreviewUrl] = useState(() => getCoverImageUrl(initialPost?.cover_image));
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageError, setImageError] = useState(false);
  const [published, setPublished] = useState(initialPost?.published ?? false);
  const [tags, setTags] = useState<string[]>(initialPost?.tags || []);
  const [tagInput, setTagInput] = useState('');

  const [activeTab, setActiveTab] = useState<'write' | 'preview' | 'split'>('write');
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const tempBlobUrlRef = useRef<string | null>(null);

  // Sync state if initialPost changes (e.g. edit mode re-fetch)
  useEffect(() => {
    if (initialPost) {
      setTitle(initialPost.title || '');
      setSlug(initialPost.slug || '');
      setIsSlugManual(Boolean(initialPost.slug));
      setExcerpt(initialPost.excerpt || '');
      setMarkdown(initialPost.markdown || '');
      setCoverImage(initialPost.cover_image || '');
      setPreviewUrl(getCoverImageUrl(initialPost.cover_image));
      setSelectedFile(null);
      setImageError(false);
      setPublished(initialPost.published ?? false);
      setTags(initialPost.tags || []);
    }
  }, [initialPost]);

  // Revoke any pending object URLs on unmount
  useEffect(() => {
    return () => {
      if (tempBlobUrlRef.current) {
        URL.revokeObjectURL(tempBlobUrlRef.current);
      }
    };
  }, []);

  // Auto-generate slug from title if not manually customized
  useEffect(() => {
    if (!isSlugManual && title) {
      const generated = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setSlug(generated);
    }
  }, [title, isSlugManual]);

  const markDirty = () => {
    if (!isDirty) setIsDirty(true);
  };

  // Keyboard shortcut: Cmd+S / Ctrl+S to save draft
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSaveSubmit(published);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [title, slug, excerpt, markdown, coverImage, published, tags]);

  // Unsaved changes warning on tab close
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // Tag management
  const handleAddTag = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter' && e.key !== ',') return;
    e.preventDefault();
    const clean = tagInput.trim().replace(/^#/, '');
    if (clean && !tags.includes(clean)) {
      setTags([...tags, clean]);
      setTagInput('');
      markDirty();
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
    markDirty();
  };

  // File processing
  const processImageFile = async (file: File) => {
    if (!user) {
      toast('Please sign in to upload images', 'error');
      return;
    }

    // Requirement 4: Immediately show local preview using URL.createObjectURL(file)
    if (tempBlobUrlRef.current) {
      URL.revokeObjectURL(tempBlobUrlRef.current);
    }
    const tempUrl = URL.createObjectURL(file);
    tempBlobUrlRef.current = tempUrl;
    setPreviewUrl(tempUrl);
    setSelectedFile(file);
    setImageError(false);
    setUploadProgress(15);

    try {
      const result = await uploadBlogImage(file, user.id, (prog) => setUploadProgress(prog));

      if (result.error) {
        toast(result.error, 'error');
        setUploadProgress(null);
        if (tempBlobUrlRef.current) {
          URL.revokeObjectURL(tempBlobUrlRef.current);
          tempBlobUrlRef.current = null;
        }
        setPreviewUrl(getCoverImageUrl(coverImage));
        return;
      }

      // Requirement 4: After upload succeeds, replace temporary preview with real Supabase image URL
      if (tempBlobUrlRef.current) {
        URL.revokeObjectURL(tempBlobUrlRef.current);
        tempBlobUrlRef.current = null;
      }

      // Requirement 2 & 3: Store ONLY data.path in form state, keep previewUrl, keep selectedFile
      setCoverImage(result.path);
      setPreviewUrl(result.url);
      setSelectedFile(file);
      setImageError(false);
      setUploadProgress(null);
      markDirty();
      toast('Cover image uploaded successfully', 'success');
    } catch (err: any) {
      console.error('Upload failed:', err);
      toast(err.message || 'Image upload failed', 'error');
      setUploadProgress(null);
      if (tempBlobUrlRef.current) {
        URL.revokeObjectURL(tempBlobUrlRef.current);
        tempBlobUrlRef.current = null;
      }
      setPreviewUrl(getCoverImageUrl(coverImage));
    }
  };

  // Requirement 8: Remove button only removes image from form state, does not auto-delete remote object
  const handleRemoveCoverImage = () => {
    if (tempBlobUrlRef.current) {
      URL.revokeObjectURL(tempBlobUrlRef.current);
      tempBlobUrlRef.current = null;
    }
    setCoverImage('');
    setPreviewUrl('');
    setSelectedFile(null);
    setImageError(false);
    markDirty();
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await processImageFile(file);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      await processImageFile(file);
    }
  };

  // Toolbar formatting helper
  const insertFormatting = (prefix: string, suffix: string = '', defaultText: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = markdown.substring(start, end) || defaultText;
    const replacement = `${prefix}${selected}${suffix}`;

    const newMarkdown = markdown.substring(0, start) + replacement + markdown.substring(end);
    setMarkdown(newMarkdown);
    markDirty();

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
    }, 40);
  };

  // Metrics
  const wordCount = markdown.trim() ? markdown.trim().split(/\s+/).length : 0;
  const characterCount = markdown.length;
  const estimatedReadTime = Math.max(1, Math.ceil(wordCount / 200));

  const handleSaveSubmit = async (publishStatus: boolean) => {
    if (!title.trim()) {
      toast('Please enter an article title', 'error');
      return;
    }
    if (!slug.trim()) {
      toast('Please provide a URL slug', 'error');
      return;
    }
    if (!markdown.trim()) {
      toast('Article content cannot be empty', 'error');
      return;
    }

    try {
      await onSave({
        title: title.trim(),
        slug: slug.trim(),
        excerpt: excerpt.trim() || markdown.substring(0, 150).replace(/[#*`_]/g, ''),
        markdown,
        cover_image: coverImage,
        published: publishStatus,
        tags,
      });
      setIsDirty(false);
    } catch (err: any) {
      toast(err.message || 'Failed to save article', 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-24">
      {/* Top action bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-200/90 dark:border-neutral-800/90 pb-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              if (isDirty && !window.confirm('You have unsaved changes. Discard and leave?')) {
                return;
              }
              onCancel();
            }}
            className="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </button>
          <span className="text-neutral-300 dark:text-neutral-700">|</span>
          <div className="flex items-center gap-1.5 text-[11px] font-mono">
            {isDirty ? (
              <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                Unsaved edits
              </span>
            ) : (
              <span className="text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                <Check className="w-3 h-3 text-emerald-500" />
                Synced
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="hidden sm:flex items-center gap-2 text-xs text-neutral-400 font-mono tabular-nums mr-2">
            <span>{wordCount} words</span>
            <span>·</span>
            <span>{estimatedReadTime} min read</span>
          </div>

          <button
            type="button"
            disabled={isSaving}
            onClick={() => handleSaveSubmit(false)}
            className="px-3.5 py-1.5 text-xs font-medium rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-850 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 transition-colors disabled:opacity-50 cursor-pointer shadow-2xs"
          >
            {isSaving && !published ? 'Saving...' : 'Save Draft'}
          </button>

          <button
            type="button"
            disabled={isSaving}
            onClick={() => handleSaveSubmit(true)}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-white transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
          >
            <Check className="w-3.5 h-3.5" />
            <span>{isSaving && published ? 'Publishing...' : initialPost?.published ? 'Update Article' : 'Publish Article'}</span>
          </button>
        </div>
      </div>

      {/* Post Metadata Inputs */}
      <div className="space-y-4">
        {/* Title */}
        <input
          type="text"
          placeholder="Article title..."
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            markDirty();
          }}
          className="w-full text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-neutral-950 dark:text-neutral-50 placeholder:text-neutral-350 dark:placeholder:text-neutral-600 bg-transparent border-0 focus:outline-hidden focus:ring-0 px-0 leading-tight"
          aria-label="Article title"
        />

        {/* Slug input */}
        <div className="flex items-center gap-1 text-xs text-neutral-500 font-mono">
          <span>/blog/</span>
          <input
            type="text"
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setIsSlugManual(true);
              markDirty();
            }}
            placeholder="custom-slug"
            className="px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800/80 text-neutral-900 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700/80 focus:outline-hidden"
            aria-label="Article URL slug"
          />
        </div>

        {/* Excerpt */}
        <textarea
          rows={2}
          placeholder="Concise thesis or editorial excerpt for publication cards..."
          value={excerpt}
          onChange={(e) => {
            setExcerpt(e.target.value);
            markDirty();
          }}
          className="w-full text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 placeholder:text-neutral-400 bg-neutral-50/80 dark:bg-neutral-900/60 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 focus:outline-hidden focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white leading-relaxed font-sans"
          aria-label="Article excerpt"
        />

        {/* Cover Image Upload Area */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 font-mono">
              Cover Image (Supabase Storage: blog-images)
            </label>
            {(coverImage || previewUrl) && (
              <button
                type="button"
                onClick={handleRemoveCoverImage}
                className="text-[11px] text-rose-500 hover:underline cursor-pointer"
              >
                Remove image
              </button>
            )}
          </div>

          {previewUrl && !imageError ? (
            <div className="relative aspect-16/9 max-w-md rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-800">
              <img
                src={previewUrl}
                alt="Cover preview"
                className="w-full h-full object-cover"
                onError={(event) => {
                  console.error('Cover image failed to load:', {
                    url: previewUrl,
                    coverImage: coverImage,
                  });
                  setImageError(true);
                }}
              />
              {uploadProgress !== null && (
                <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex flex-col items-center justify-center p-4">
                  <div className="text-white text-xs font-mono mb-2">
                    Uploading to storage... {uploadProgress}%
                  </div>
                  <div className="w-full max-w-xs bg-white/20 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-white h-full transition-all duration-150"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors max-w-md ${
                isDragging
                  ? 'border-neutral-900 bg-neutral-100 dark:border-white dark:bg-neutral-800'
                  : 'border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-600 bg-neutral-50/40 dark:bg-neutral-900/30'
              }`}
            >
              <UploadCloud className="w-7 h-7 text-neutral-400 mx-auto mb-1.5" />
              <div className="text-xs font-medium text-neutral-800 dark:text-neutral-200">
                Click or drag & drop to upload cover image
              </div>
              <div className="text-[11px] text-neutral-400 mt-0.5">
                PNG, JPG, WEBP (Max 5MB)
              </div>
              {uploadProgress !== null && (
                <div className="mt-3 w-full bg-neutral-200 dark:bg-neutral-700 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-neutral-900 dark:bg-neutral-100 h-full transition-all duration-150"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleImageFileChange}
            className="hidden"
            aria-label="Upload cover image file"
          />
        </div>

        {/* Tags */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 font-mono">
            Topic Tags
          </label>
          <div className="flex flex-wrap items-center gap-1.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700"
              >
                <span>{tag}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="hover:text-rose-500 cursor-pointer"
                  aria-label={`Remove tag ${tag}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <div className="flex items-center gap-1">
              <input
                type="text"
                placeholder="Add tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                className="text-xs px-2.5 py-1 rounded-md border border-neutral-200 dark:border-neutral-700 bg-transparent focus:outline-hidden focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white w-28"
                aria-label="Add topic tag"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="text-xs px-2.5 py-1 bg-neutral-100 dark:bg-neutral-800 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 cursor-pointer"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Editor Surface */}
      <div className="border border-neutral-200/90 dark:border-neutral-800/90 rounded-xl overflow-hidden bg-white dark:bg-neutral-900 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-2 p-2 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-900/90">
          {/* Formatting tools */}
          <div className="flex items-center gap-1 overflow-x-auto" role="toolbar" aria-label="Markdown formatting tools">
            <button
              type="button"
              onClick={() => insertFormatting('**', '**', 'bold text')}
              className="p-1.5 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded hover:bg-neutral-200/60 dark:hover:bg-neutral-800 cursor-pointer"
              title="Bold (**text**)"
              aria-label="Bold text"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('*', '*', 'italic text')}
              className="p-1.5 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded hover:bg-neutral-200/60 dark:hover:bg-neutral-800 cursor-pointer"
              title="Italic (*text*)"
              aria-label="Italic text"
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('## ', '', 'Section Heading')}
              className="p-1.5 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded hover:bg-neutral-200/60 dark:hover:bg-neutral-800 cursor-pointer font-serif font-bold text-xs"
              title="Heading 2 (## Section)"
              aria-label="Heading 2"
            >
              H2
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('### ', '', 'Sub-section Heading')}
              className="p-1.5 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded hover:bg-neutral-200/60 dark:hover:bg-neutral-800 cursor-pointer font-serif font-bold text-xs"
              title="Heading 3 (### Sub-section)"
              aria-label="Heading 3"
            >
              H3
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('> ', '', 'Thoughtful citation or quote')}
              className="p-1.5 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded hover:bg-neutral-200/60 dark:hover:bg-neutral-800 cursor-pointer"
              title="Blockquote (> quote)"
              aria-label="Blockquote"
            >
              <Quote className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('```typescript\n', '\n```', '// code')}
              className="p-1.5 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded hover:bg-neutral-200/60 dark:hover:bg-neutral-800 cursor-pointer"
              title="Code Block (```)"
              aria-label="Code block"
            >
              <Code className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('- ', '', 'List item')}
              className="p-1.5 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded hover:bg-neutral-200/60 dark:hover:bg-neutral-800 cursor-pointer"
              title="Bullet List (- item)"
              aria-label="Bullet list"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('[', '](https://example.com)', 'hyperlink label')}
              className="p-1.5 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded hover:bg-neutral-200/60 dark:hover:bg-neutral-800 cursor-pointer"
              title="Link [label](url)"
              aria-label="Insert link"
            >
              <LinkIcon className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('| Column 1 | Column 2 |\n| :--- | :--- |\n| Data A | Data B |\n', '', '')}
              className="p-1.5 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded hover:bg-neutral-200/60 dark:hover:bg-neutral-800 cursor-pointer"
              title="Table"
              aria-label="Insert table"
            >
              <TableIcon className="w-4 h-4" />
            </button>
          </div>

          {/* View mode toggle */}
          <div className="flex items-center p-0.5 bg-neutral-200/80 dark:bg-neutral-800 rounded-lg text-xs" role="tablist">
            <button
              type="button"
              onClick={() => setActiveTab('write')}
              role="tab"
              aria-selected={activeTab === 'write'}
              className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                activeTab === 'write'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-2xs'
                  : 'text-neutral-600 dark:text-neutral-400'
              }`}
            >
              Write
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('split')}
              role="tab"
              aria-selected={activeTab === 'split'}
              className={`hidden md:block px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                activeTab === 'split'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-2xs'
                  : 'text-neutral-600 dark:text-neutral-400'
              }`}
            >
              Split View
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              role="tab"
              aria-selected={activeTab === 'preview'}
              className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                activeTab === 'preview'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-2xs'
                  : 'text-neutral-600 dark:text-neutral-400'
              }`}
            >
              Preview
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="min-h-[460px]">
          {activeTab === 'write' && (
            <textarea
              ref={textareaRef}
              rows={22}
              placeholder="Write your longform technical inquiry using standard Markdown..."
              value={markdown}
              onChange={(e) => {
                setMarkdown(e.target.value);
                markDirty();
              }}
              className="w-full h-full p-6 text-sm font-mono leading-relaxed bg-transparent focus:outline-hidden resize-y placeholder:text-neutral-400 text-neutral-900 dark:text-neutral-100"
              aria-label="Markdown manuscript body"
            />
          )}

          {activeTab === 'preview' && (
            <div className="p-8 max-w-[68ch] mx-auto prose-editorial">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {markdown || '*No manuscript text written yet. Switch to the Write tab to begin.*'}
              </ReactMarkdown>
            </div>
          )}

          {activeTab === 'split' && (
            <div className="grid grid-cols-2 divide-x divide-neutral-200 dark:divide-neutral-800 h-[520px]">
              <textarea
                ref={textareaRef}
                placeholder="Write markdown here..."
                value={markdown}
                onChange={(e) => {
                  setMarkdown(e.target.value);
                  markDirty();
                }}
                className="w-full h-full p-4 text-xs font-mono leading-relaxed bg-transparent focus:outline-hidden resize-none overflow-y-auto text-neutral-900 dark:text-neutral-100"
                aria-label="Markdown code split editor"
              />
              <div className="p-6 overflow-y-auto prose-editorial text-sm">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {markdown || '*Live preview appears here...*'}
                </ReactMarkdown>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Status Bar */}
        <div className="px-4 py-2 border-t border-neutral-100 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-900/40 flex items-center justify-between text-[11px] text-neutral-500 font-mono">
          <div className="flex items-center gap-3">
            <span>Markdown + GFM supported</span>
            <span>·</span>
            <span>Shortcut: ⌘S to save</span>
          </div>
          <div className="tabular-nums">
            {characterCount.toLocaleString()} chars · {wordCount.toLocaleString()} words
          </div>
        </div>
      </div>
    </div>
  );
};
