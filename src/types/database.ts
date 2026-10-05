export type UserRole = 'admin' | 'writer' | 'reader';

export interface Profile {
  id: string;
  display_name: string;
  avatar_url?: string;
  role: UserRole;
  email?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: string;
  author: string;
  title: string;
  slug: string;
  excerpt: string;
  markdown: string;
  cover_image: string;
  published: boolean;
  tags: string[];
  views: number;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  body: string;
  created_at: string;
  profiles?: Profile;
}

export interface AdminStats {
  totalUsers: number;
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  totalComments: number;
  totalViews: number;
}
