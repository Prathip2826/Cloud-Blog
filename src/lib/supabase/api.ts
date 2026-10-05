import { Post, Profile, Comment, AdminStats, UserRole } from '../../types/database';
import { getSupabaseClient, isSupabaseConfigured } from './client';
import { INITIAL_POSTS, INITIAL_PROFILES, INITIAL_COMMENTS } from './mockData';

const MOCK_STORAGE_KEYS = {
  POSTS: 'chronicle_mock_posts',
  PROFILES: 'chronicle_mock_profiles',
  COMMENTS: 'chronicle_mock_comments',
};

// Local storage helpers for seamless Demo Mode persistence
function getStoredMock<T>(key: string, defaultVal: T): T {
  if (typeof window === 'undefined') return defaultVal;
  const raw = localStorage.getItem(key);
  if (!raw) {
    localStorage.setItem(key, JSON.stringify(defaultVal));
    return defaultVal;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return defaultVal;
  }
}

function setStoredMock<T>(key: string, val: T): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(val));
}

// Fallback query helpers
function getFallbackPosts(options: GetPostsOptions = {}): Post[] {
  const { publishedOnly = true, authorId, tag, search, sort = 'newest', limit } = options;
  let posts = getStoredMock<Post[]>(MOCK_STORAGE_KEYS.POSTS, INITIAL_POSTS);
  const profiles = getStoredMock<Profile[]>(MOCK_STORAGE_KEYS.PROFILES, INITIAL_PROFILES);

  posts = posts.map((p) => ({
    ...p,
    profiles: profiles.find((pr) => pr.id === p.author),
  }));

  if (publishedOnly) {
    posts = posts.filter((p) => p.published);
  }
  if (authorId) {
    posts = posts.filter((p) => p.author === authorId);
  }
  if (tag) {
    posts = posts.filter((p) => p.tags.map((t) => t.toLowerCase()).includes(tag.toLowerCase()));
  }
  if (search) {
    const q = search.toLowerCase();
    posts = posts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        p.markdown.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  if (sort === 'popular') {
    posts.sort((a, b) => b.views - a.views);
  } else if (sort === 'oldest') {
    posts.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  } else {
    posts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  if (limit) {
    posts = posts.slice(0, limit);
  }

  return posts;
}

function getFallbackPostBySlug(slug: string): Post | null {
  const posts = getStoredMock<Post[]>(MOCK_STORAGE_KEYS.POSTS, INITIAL_POSTS);
  const profiles = getStoredMock<Profile[]>(MOCK_STORAGE_KEYS.PROFILES, INITIAL_PROFILES);
  const post = posts.find((p) => p.slug === slug);
  if (!post) return null;

  return {
    ...post,
    profiles: profiles.find((pr) => pr.id === post.author),
  };
}

// -------------------------------------------------------------
// POSTS API
// -------------------------------------------------------------

export interface GetPostsOptions {
  publishedOnly?: boolean;
  authorId?: string;
  tag?: string;
  search?: string;
  sort?: 'newest' | 'oldest' | 'popular';
  limit?: number;
}

export async function getPosts(options: GetPostsOptions = {}): Promise<Post[]> {
  const { publishedOnly = true, authorId, tag, search, sort = 'newest', limit } = options;

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (!supabase) return getFallbackPosts(options);

    try {
      let query = supabase.from('posts').select('*, profiles(*)');

      if (publishedOnly) {
        query = query.eq('published', true);
      }
      if (authorId) {
        query = query.eq('author', authorId);
      }
      if (tag) {
        query = query.contains('tags', [tag]);
      }
      if (search) {
        query = query.or(`title.ilike.%${search}%,excerpt.ilike.%${search}%,markdown.ilike.%${search}%`);
      }

      if (sort === 'popular') {
        query = query.order('views', { ascending: false });
      } else if (sort === 'oldest') {
        query = query.order('created_at', { ascending: true });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;
      if (error) {
        console.warn('Supabase getPosts notice (database schema may need initialization via supabase_schema.sql):', error.message);
        return getFallbackPosts(options);
      }
      if (data && data.length > 0) {
        return data as Post[];
      }
      // If table exists but is brand new with 0 posts, show fallback posts on public home/explore
      if (publishedOnly && (!data || data.length === 0) && !authorId && !search) {
        return getFallbackPosts(options);
      }
      return (data as Post[]) || [];
    } catch (err: any) {
      console.warn('Supabase query error, falling back:', err.message);
      return getFallbackPosts(options);
    }
  }

  // Demo Fallback
  return getFallbackPosts(options);
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (!supabase) return getFallbackPostBySlug(slug);

    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*, profiles(*)')
        .eq('slug', slug)
        .single();

      if (!error && data) {
        return data as Post;
      }
    } catch {
      // ignore
    }
    return getFallbackPostBySlug(slug);
  }

  return getFallbackPostBySlug(slug);
}

export async function getPostById(id: string): Promise<Post | null> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from('posts')
      .select('*, profiles(*)')
      .eq('id', id)
      .single();

    if (error) return null;
    return data as Post;
  }

  // Demo Fallback
  const posts = getStoredMock<Post[]>(MOCK_STORAGE_KEYS.POSTS, INITIAL_POSTS);
  const profiles = getStoredMock<Profile[]>(MOCK_STORAGE_KEYS.PROFILES, INITIAL_PROFILES);
  const post = posts.find((p) => p.id === id);
  if (!post) return null;

  return {
    ...post,
    profiles: profiles.find((pr) => pr.id === post.author),
  };
}

export async function createPost(postData: Omit<Post, 'id' | 'created_at' | 'updated_at' | 'views'>): Promise<Post> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error('Supabase not connected');

    const cleanPayload = {
      author: postData.author,
      title: postData.title,
      slug: postData.slug,
      excerpt: postData.excerpt || '',
      markdown: postData.markdown,
      cover_image: postData.cover_image || '',
      published: postData.published || false,
      tags: postData.tags || [],
    };

    const { data, error } = await supabase
      .from('posts')
      .insert(cleanPayload)
      .select('*, profiles(*)')
      .single();

    if (error) throw error;
    return data as Post;
  }

  // Demo Fallback
  const posts = getStoredMock<Post[]>(MOCK_STORAGE_KEYS.POSTS, INITIAL_POSTS);
  const profiles = getStoredMock<Profile[]>(MOCK_STORAGE_KEYS.PROFILES, INITIAL_PROFILES);
  const authorProfile = profiles.find((pr) => pr.id === postData.author);

  const newPost: Post = {
    ...postData,
    id: `post-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    views: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    profiles: authorProfile,
  };

  posts.unshift(newPost);
  setStoredMock(MOCK_STORAGE_KEYS.POSTS, posts);
  return newPost;
}

export async function updatePost(id: string, updates: Partial<Post>): Promise<Post> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error('Supabase not connected');

    const { data, error } = await supabase
      .from('posts')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*, profiles(*)')
      .single();

    if (error) throw error;
    return data as Post;
  }

  // Demo Fallback
  const posts = getStoredMock<Post[]>(MOCK_STORAGE_KEYS.POSTS, INITIAL_POSTS);
  const profiles = getStoredMock<Profile[]>(MOCK_STORAGE_KEYS.PROFILES, INITIAL_PROFILES);
  const index = posts.findIndex((p) => p.id === id);
  if (index === -1) throw new Error('Post not found');

  const updated: Post = {
    ...posts[index],
    ...updates,
    updated_at: new Date().toISOString(),
  };
  updated.profiles = profiles.find((pr) => pr.id === updated.author);

  posts[index] = updated;
  setStoredMock(MOCK_STORAGE_KEYS.POSTS, posts);
  return updated;
}

export async function deletePost(id: string): Promise<boolean> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error('Supabase not connected');

    const { error } = await supabase.from('posts').delete().eq('id', id);
    if (error) throw error;
    return true;
  }

  // Demo Fallback
  let posts = getStoredMock<Post[]>(MOCK_STORAGE_KEYS.POSTS, INITIAL_POSTS);
  posts = posts.filter((p) => p.id !== id);
  setStoredMock(MOCK_STORAGE_KEYS.POSTS, posts);
  return true;
}

export async function incrementPostViews(id: string): Promise<void> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    try {
      // In Supabase, if an rpc function is configured:
      await supabase.rpc('increment_post_views', { post_id: id });
    } catch {
      // Fallback: direct update if RPC is missing
      const { data } = await supabase.from('posts').select('views').eq('id', id).single();
      if (data) {
        await supabase.from('posts').update({ views: (data.views || 0) + 1 }).eq('id', id);
      }
    }
    return;
  }

  // Demo Fallback
  const posts = getStoredMock<Post[]>(MOCK_STORAGE_KEYS.POSTS, INITIAL_POSTS);
  const post = posts.find((p) => p.id === id);
  if (post) {
    post.views = (post.views || 0) + 1;
    setStoredMock(MOCK_STORAGE_KEYS.POSTS, posts);
  }
}

// -------------------------------------------------------------
// COMMENTS API
// -------------------------------------------------------------

export async function getComments(postId: string): Promise<Comment[]> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('comments')
      .select('*, profiles(*)')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Supabase getComments error:', error);
      return [];
    }
    return data as Comment[];
  }

  // Demo Fallback
  const comments = getStoredMock<Comment[]>(MOCK_STORAGE_KEYS.COMMENTS, INITIAL_COMMENTS);
  const profiles = getStoredMock<Profile[]>(MOCK_STORAGE_KEYS.PROFILES, INITIAL_PROFILES);

  return comments
    .filter((c) => c.post_id === postId)
    .map((c) => ({
      ...c,
      profiles: profiles.find((pr) => pr.id === c.user_id),
    }))
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
}

export async function createComment(postId: string, userId: string, body: string): Promise<Comment> {
  if (!body.trim()) throw new Error('Comment cannot be empty');

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error('Supabase not connected');

    const { data, error } = await supabase
      .from('comments')
      .insert({
        post_id: postId,
        user_id: userId,
        body: body.trim(),
      })
      .select('*, profiles(*)')
      .single();

    if (error) throw error;
    return data as Comment;
  }

  // Demo Fallback
  const comments = getStoredMock<Comment[]>(MOCK_STORAGE_KEYS.COMMENTS, INITIAL_COMMENTS);
  const profiles = getStoredMock<Profile[]>(MOCK_STORAGE_KEYS.PROFILES, INITIAL_PROFILES);
  const userProfile = profiles.find((p) => p.id === userId);

  const newComment: Comment = {
    id: `comment-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    post_id: postId,
    user_id: userId,
    body: body.trim(),
    created_at: new Date().toISOString(),
    profiles: userProfile,
  };

  comments.push(newComment);
  setStoredMock(MOCK_STORAGE_KEYS.COMMENTS, comments);
  return newComment;
}

export async function deleteComment(commentId: string): Promise<boolean> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error('Supabase not connected');

    const { error } = await supabase.from('comments').delete().eq('id', commentId);
    if (error) throw error;
    return true;
  }

  // Demo Fallback
  let comments = getStoredMock<Comment[]>(MOCK_STORAGE_KEYS.COMMENTS, INITIAL_COMMENTS);
  comments = comments.filter((c) => c.id !== commentId);
  setStoredMock(MOCK_STORAGE_KEYS.COMMENTS, comments);
  return true;
}

// -------------------------------------------------------------
// PROFILES & USER MANAGEMENT API
// -------------------------------------------------------------

export async function getProfile(userId: string): Promise<Profile | null> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (!supabase) return null;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Supabase getProfile error:', error.message);
        return null;
      }

      if (data) {
        return data as Profile;
      }

      // If user profile record does not exist in public.profiles yet, initialize it
      const { data: authData } = await supabase.auth.getUser();
      if (authData?.user && authData.user.id === userId) {
        const defaultProfile = {
          id: userId,
          display_name: authData.user.user_metadata?.display_name || authData.user.email?.split('@')[0] || 'Author',
          avatar_url: authData.user.user_metadata?.avatar_url || null,
          role: authData.user.user_metadata?.role || 'writer',
          updated_at: new Date().toISOString(),
        };

        const { data: created, error: insertError } = await supabase
          .from('profiles')
          .insert(defaultProfile)
          .select()
          .maybeSingle();

        if (!insertError && created) {
          return created as Profile;
        }
      }

      return null;
    } catch (err: any) {
      console.error('Supabase getProfile exception:', err);
      return null;
    }
  }

  // Demo Fallback
  const profiles = getStoredMock<Profile[]>(MOCK_STORAGE_KEYS.PROFILES, INITIAL_PROFILES);
  return profiles.find((p) => p.id === userId) || null;
}

export async function updateProfile(userId: string, data: Partial<Profile>): Promise<Profile> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error('Supabase not connected');

    // Check if profile exists first
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle();

    if (!existing) {
      const insertData = {
        id: userId,
        display_name: data.display_name?.trim() || 'Author',
        avatar_url: data.avatar_url?.trim() || null,
        bio: data.bio?.trim() || null,
        role: data.role || 'writer',
        updated_at: new Date().toISOString(),
      };
      const { data: created, error: insertError } = await supabase
        .from('profiles')
        .insert(insertData)
        .select()
        .single();

      if (insertError) {
        console.error('Error inserting profile in Supabase:', insertError);
        throw insertError;
      }
      return created as Profile;
    }

    const { data: updated, error } = await supabase
      .from('profiles')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile in Supabase:', error);
      throw error;
    }
    return updated as Profile;
  }

  // Demo Fallback
  const profiles = getStoredMock<Profile[]>(MOCK_STORAGE_KEYS.PROFILES, INITIAL_PROFILES);
  const idx = profiles.findIndex((p) => p.id === userId);
  if (idx === -1) {
    const newProf: Profile = {
      id: userId,
      display_name: data.display_name || 'Anonymous User',
      role: data.role || 'reader',
      avatar_url: data.avatar_url,
      bio: data.bio,
      email: data.email,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    profiles.push(newProf);
    setStoredMock(MOCK_STORAGE_KEYS.PROFILES, profiles);
    return newProf;
  }

  profiles[idx] = {
    ...profiles[idx],
    ...data,
    updated_at: new Date().toISOString(),
  };
  setStoredMock(MOCK_STORAGE_KEYS.PROFILES, profiles);
  return profiles[idx];
}

export async function getAllUsers(): Promise<Profile[]> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Profile[];
  }

  return getStoredMock<Profile[]>(MOCK_STORAGE_KEYS.PROFILES, INITIAL_PROFILES);
}

export async function updateUserRole(userId: string, role: UserRole): Promise<void> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error('Supabase not connected');

    const { error } = await supabase
      .from('profiles')
      .update({ role, updated_at: new Date().toISOString() })
      .eq('id', userId);

    if (error) throw error;
    return;
  }

  const profiles = getStoredMock<Profile[]>(MOCK_STORAGE_KEYS.PROFILES, INITIAL_PROFILES);
  const user = profiles.find((p) => p.id === userId);
  if (user) {
    user.role = role;
    user.updated_at = new Date().toISOString();
    setStoredMock(MOCK_STORAGE_KEYS.PROFILES, profiles);
  }
}

export async function getAdminStats(): Promise<AdminStats> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error('Supabase not connected');

    const [usersRes, postsRes, commentsRes] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('posts').select('published, views'),
      supabase.from('comments').select('id', { count: 'exact', head: true }),
    ]);

    const posts = postsRes.data || [];
    const publishedPosts = posts.filter((p) => p.published).length;
    const draftPosts = posts.filter((p) => !p.published).length;
    const totalViews = posts.reduce((sum, p) => sum + (p.views || 0), 0);

    return {
      totalUsers: usersRes.count || 0,
      totalPosts: posts.length,
      publishedPosts,
      draftPosts,
      totalComments: commentsRes.count || 0,
      totalViews,
    };
  }

  // Demo Fallback
  const profiles = getStoredMock<Profile[]>(MOCK_STORAGE_KEYS.PROFILES, INITIAL_PROFILES);
  const posts = getStoredMock<Post[]>(MOCK_STORAGE_KEYS.POSTS, INITIAL_POSTS);
  const comments = getStoredMock<Comment[]>(MOCK_STORAGE_KEYS.COMMENTS, INITIAL_COMMENTS);

  const publishedPosts = posts.filter((p) => p.published).length;
  const draftPosts = posts.filter((p) => !p.published).length;
  const totalViews = posts.reduce((acc, p) => acc + (p.views || 0), 0);

  return {
    totalUsers: profiles.length,
    totalPosts: posts.length,
    publishedPosts,
    draftPosts,
    totalComments: comments.length,
    totalViews,
  };
}
