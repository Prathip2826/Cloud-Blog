-- ==============================================================================
-- CHRONICLE BLOG PLATFORM - COMPLETE SUPABASE POSTGRESQL SCHEMA & SECURITY RULES
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT CHECK (role IN ('admin', 'writer', 'reader')) DEFAULT 'writer' NOT NULL,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Idempotent column additions in case table was created with partial schema
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'writer';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW());

-- 3. POSTS TABLE
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  markdown TEXT NOT NULL,
  cover_image TEXT,
  published BOOLEAN DEFAULT false NOT NULL,
  tags TEXT[] DEFAULT '{}'::TEXT[] NOT NULL,
  views INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. COMMENTS TABLE
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. INDEXES FOR HIGH-THROUGHPUT QUERIES
CREATE INDEX IF NOT EXISTS idx_posts_slug ON public.posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_author ON public.posts(author);
CREATE INDEX IF NOT EXISTS idx_posts_published ON public.posts(published);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON public.comments(post_id);

-- 6. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current authenticated user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. PROFILES RLS POLICIES
-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Public profiles are viewable by everyone
CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.profiles FOR SELECT 
  USING (true);

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Authenticated users can update ONLY their own profile
CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE 
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admins can update any profile (e.g. role change)
CREATE POLICY "Admins can update any profile" 
  ON public.profiles FOR UPDATE 
  USING (public.is_admin());

-- 8. POSTS RLS POLICIES
-- Anyone can read published posts
CREATE POLICY "Public can view published posts" 
  ON public.posts FOR SELECT 
  USING (published = true);

-- Writers and admins can read their own drafts
CREATE POLICY "Authors can view all their own posts" 
  ON public.posts FOR SELECT 
  USING (auth.uid() = author);

-- Admins can view all posts (including all drafts)
CREATE POLICY "Admins can view all posts" 
  ON public.posts FOR SELECT 
  USING (public.is_admin());

-- Writers can create posts for themselves
CREATE POLICY "Writers can create posts" 
  ON public.posts FOR INSERT 
  WITH CHECK (
    auth.uid() = author AND
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('writer', 'admin')
    )
  );

-- Writers can update their own posts
CREATE POLICY "Authors can update own posts" 
  ON public.posts FOR UPDATE 
  USING (auth.uid() = author);

-- Admins can update any post
CREATE POLICY "Admins can update any post" 
  ON public.posts FOR UPDATE 
  USING (public.is_admin());

-- Writers can delete their own posts
CREATE POLICY "Authors can delete own posts" 
  ON public.posts FOR DELETE 
  USING (auth.uid() = author);

-- Admins can delete any post
CREATE POLICY "Admins can delete any post" 
  ON public.posts FOR DELETE 
  USING (public.is_admin());

-- 9. COMMENTS RLS POLICIES
-- Anyone can read comments on published posts
CREATE POLICY "Anyone can view comments on published posts" 
  ON public.comments FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.posts 
      WHERE posts.id = comments.post_id AND posts.published = true
    )
  );

-- Authenticated users can create comments
CREATE POLICY "Authenticated users can create comments" 
  ON public.comments FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own comments
CREATE POLICY "Users can update own comments" 
  ON public.comments FOR UPDATE 
  USING (auth.uid() = user_id);

-- Users can delete their own comments
CREATE POLICY "Users can delete own comments" 
  ON public.comments FOR DELETE 
  USING (auth.uid() = user_id);

-- Admins can delete any comment (moderation)
CREATE POLICY "Admins can delete any comment" 
  ON public.comments FOR DELETE 
  USING (public.is_admin());

-- 10. ATOMIC VIEW COUNTER RPC FUNCTION
CREATE OR REPLACE FUNCTION public.increment_post_views(post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.posts
  SET views = views + 1
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. AUTOMATIC PROFILE CREATION TRIGGER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'role', 'writer')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 12. SUPABASE STORAGE BUCKET CREATION & POLICIES
INSERT INTO storage.buckets (id, name, public) 
VALUES ('blog-images', 'blog-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Public can read images in 'blog-images'
CREATE POLICY "Public Read blog-images" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'blog-images');

-- Authenticated users can upload only to their own user folder: blog-images/{user.id}/...
CREATE POLICY "Authenticated users can upload to own folder" 
  ON storage.objects FOR INSERT 
  TO authenticated
  WITH CHECK (
    bucket_id = 'blog-images' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can update files inside their own user folder
CREATE POLICY "Users can update own files in blog-images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'blog-images' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'blog-images' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can delete their own uploaded images
CREATE POLICY "Users Delete Own Images" 
  ON storage.objects FOR DELETE 
  TO authenticated
  USING (
    bucket_id = 'blog-images' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );
