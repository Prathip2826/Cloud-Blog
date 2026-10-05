# Chronicle — Cloud-Based Editorial & Blog Platform

A production-grade, cloud-based editorial publication platform designed for high performance, uncompromising security, and typographic elegance.

Architecture:
- **Frontend / Client**: React 19 + TypeScript + Tailwind CSS (App Router & Vite compatible)
- **Authentication**: Supabase Auth (Session management, user roles, password reset, protected dashboards)
- **Database**: Supabase PostgreSQL with strict Row Level Security (RLS) policies
- **Media Storage**: Supabase Storage (`blog-images` bucket with MIME & size validation)
- **Rendering**: Safe dynamic Markdown with GFM, syntax formatting, and custom typography
- **Deployment**: Vercel-ready with zero-config edge hosting

---

## 1. Threat Summary Table & Security Model

In accordance with OWASP Top 10 Web and Top 10 LLM standards, Chronicle enforces defensive barriers across all architectural tiers:

| Threat Zone | Identified Vector | Defense / Countermeasure |
| :--- | :--- | :--- |
| **Input Surfaces** | Malicious Markdown payloads, XSS via user comments or post body | ReactMarkdown element sanitization, strict unrendered HTML omission, and escaping. |
| **Storage / Uploads** | Arbitrary file upload, executable scripts disguised as images | MIME type whitelist (`image/png`, `jpeg`, `webp`), 5MB client and storage guard, isolated bucket paths. |
| **Database & RLS** | Privilege escalation, horizontal tenant data tampering | PostgreSQL Row Level Security (RLS) with `auth.uid() = author` checks and `is_admin()` definer functions. |
| **Authentication** | Session hijacking, client-side role manipulation | JWT validation via Supabase Auth, database-enforced roles in `public.profiles`, anon key isolation. |
| **API & Secrets** | Service-role key leaks in client bundle | Only `anon_key` exposed to client; administrative operations rely strictly on authenticated RLS rules. |

---

## 2. PostgreSQL Database Schema & Security Rules

All database schemas, table references, cascading constraints, indexes, triggers, and RLS policies are consolidated in `supabase_schema.sql`.

### Core Tables:
1. `profiles`: User profiles linked to `auth.users(id)` via ON DELETE CASCADE with roles (`admin`, `writer`, `reader`).
2. `posts`: Longform manuscripts with unique slugs, markdown bodies, author UUIDs, publication status, view counters, and tags.
3. `comments`: Discussion threads linked to posts and user profiles.

### RLS Policies:
- **Public**: Anyone can read published posts (`published = true`) and comments on published posts.
- **Writers**: Can create posts for themselves (`auth.uid() = author`), read their own drafts, update their own posts, and delete their own posts.
- **Readers**: Can participate by posting comments under published articles and updating/deleting their own comments.
- **Admins**: Can moderate all posts, delete inappropriate comments, and reassign user roles.

---

## 3. Quick Start & Local Setup

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure Environment Variables
Copy `.env.local.example` to `.env.local`:
```bash
cp .env.local.example .env.local
```

Populate with your Supabase project credentials (available in your Supabase Dashboard under **Project Settings -> API**):
```env
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

*(Note: If environment variables are omitted, Chronicle automatically boots in **Demo Mode** with persistent local mock data and role-switching for instant testing.)*

### Step 3: Run Database Schema on Supabase
1. Open your Supabase Dashboard -> **SQL Editor**.
2. Paste the contents of `supabase_schema.sql`.
3. Click **Run**. This provisions all tables, foreign keys, triggers, indexes, and RLS policies.

### Step 4: Configure Supabase Storage
1. Go to **Storage** -> Verify the `blog-images` bucket exists.
2. Confirm bucket is set to **Public** for image CDN delivery.

### Step 5: Start Local Development
```bash
npm run dev
```
The server will boot on `http://localhost:3000`.

---

## 4. Production Build & Vercel Deployment

### Build Command:
```bash
npm run build
```

### Vercel Deployment:
1. Push your repository to GitHub.
2. Import project in Vercel.
3. In Vercel Project Settings -> **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Click **Deploy**.

---

## 5. Functional Walkthrough & Test Suite Specification

This test matrix outlines verifiable end-to-end user journeys:

### Test Case 1: Authentication & Role Differentiation
- **Step 1**: Click "Sign in" in navbar.
- **Step 2**: Sign in or use the quick-switch button to select **Writer** (Eleanor Vance).
- **Step 3**: Verify navbar displays writer controls: "Writer Dashboard" and "New Article".
- **Step 4**: Switch to **Reader** persona (Marcus Brody).
- **Step 5**: Verify writer-exclusive actions are hidden; only public reading and comments are permitted.

### Test Case 2: Article Creation & Markdown Live Preview
- **Step 1**: Navigate to `/dashboard/posts/new`.
- **Step 2**: Enter title "Edge Function Latency Optimization". Notice slug auto-generates to `edge-function-latency-optimization`.
- **Step 3**: Upload a cover image. Observe upload progress bar.
- **Step 4**: Add tags `Performance`, `Edge`.
- **Step 5**: Write Markdown in the editor. Toggle "Split View" to verify live editorial preview.
- **Step 6**: Click "Save Draft". Confirm draft appears in Writer Dashboard with status "Draft".

### Test Case 3: Public Reading & View Count Increment
- **Step 1**: From home page or explore page, click an article card.
- **Step 2**: Confirm dynamic route `/blog/[slug]` loads with cover image, author byline, reading time, and table of contents.
- **Step 3**: Refresh the page and verify the view counter increments.

### Test Case 4: Discussion & Optimistic Comments
- **Step 1**: Scroll to the "Discussion" section of any article.
- **Step 2**: Enter a comment and submit. Observe optimistic UI insertion into the thread.
- **Step 3**: Click the delete icon on your own comment; confirm deletion modal triggers and comment is removed.

### Test Case 5: Admin Moderation Console
- **Step 1**: Switch to **Admin** persona (Dr. Julian Mercer).
- **Step 2**: Navigate to `/admin`.
- **Step 3**: Inspect aggregate metrics (total users, live articles, drafts, discussions, views).
- **Step 4**: In "Member Governance", change a user's role to "Admin" or "Writer"; confirm confirmation modal works.
- **Step 5**: In "Article Moderation", toggle publication status of any article or delete inappropriate content.

### Test Case 6: SEO & Social Share Inspector
- **Step 1**: On any article page, click "SEO & Metadata" in the share bar.
- **Step 2**: Inspect generated OpenGraph card preview, Twitter Card tags, `sitemap.xml`, and `robots.txt`.
