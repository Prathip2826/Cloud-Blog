import { Profile, Post, Comment } from '../../types/database';
import heroCloudImg from '../../assets/images/hero_cloud_architecture_1791130352186.jpg';
import edgeImg from '../../assets/images/post_edge_computing_1791130363488.jpg';
import typographyImg from '../../assets/images/post_editorial_typography_1791130380254.jpg';
import postgresImg from '../../assets/images/post_postgres_database_1791130393163.jpg';

export const INITIAL_PROFILES: Profile[] = [
  {
    id: 'user-admin-01',
    display_name: 'Dr. Julian Mercer',
    email: 'admin@chronicle.io',
    role: 'admin',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    bio: 'Lead System Architect and Editor-in-Chief at Chronicle. Researching distributed systems and database internals.',
    created_at: '2026-01-10T10:00:00Z',
    updated_at: '2026-01-10T10:00:00Z',
  },
  {
    id: 'user-writer-01',
    display_name: 'Eleanor Vance',
    email: 'eleanor@chronicle.io',
    role: 'writer',
    avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    bio: 'Staff Technical Writer. Writing about edge networks, developer tooling, and modern distributed systems.',
    created_at: '2026-01-15T12:00:00Z',
    updated_at: '2026-01-15T12:00:00Z',
  },
  {
    id: 'user-writer-02',
    display_name: 'Sophia Chen',
    email: 'sophia@chronicle.io',
    role: 'writer',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    bio: 'Frontend Architect & Type Specimen Collector. Obsessed with high-contrast serifs, CSS layouts, and sub-100ms render budgets.',
    created_at: '2026-02-01T09:30:00Z',
    updated_at: '2026-02-01T09:30:00Z',
  },
  {
    id: 'user-reader-01',
    display_name: 'Marcus Brody',
    email: 'marcus@reader.io',
    role: 'reader',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    bio: 'Curious software engineer and daily longform reader.',
    created_at: '2026-02-14T14:20:00Z',
    updated_at: '2026-02-14T14:20:00Z',
  }
];

export const INITIAL_POSTS: Post[] = [
  {
    id: 'post-01',
    author: 'user-writer-01',
    title: 'Designing High-Resilience Cloud Systems: From Edge Routing to Global Consensus',
    slug: 'designing-high-resilience-cloud-systems',
    excerpt: 'An architectural deep dive into constructing partition-tolerant multi-region clusters, failover topologies, and latency budgets for enterprise backbones.',
    cover_image: heroCloudImg,
    published: true,
    tags: ['Architecture', 'Cloud', 'Distributed Systems'],
    views: 1420,
    created_at: '2026-09-18T10:15:00Z',
    updated_at: '2026-09-18T10:15:00Z',
    markdown: `
Modern internet architectures demand near-zero latency while requiring uncompromising durability. When data must survive catastrophic regional datacenter outages, conventional active-passive replication topologies reveal their structural limitations.

## 1. The Geometry of Latency Budgets

Every round trip across transoceanic fiber cables introduces non-negotiable physical constraints imposed by the speed of light in glass: approximately 5 microseconds per kilometer. When evaluating multi-region state coordination, designers must measure latency not in milliseconds, but in algorithmic round trips.

> "A distributed system is one in which the failure of a computer you didn't even know existed can render your own computer unusable." — Leslie Lamport

Consider the standard Raft or Paxos leader election mechanism. Under normal conditions, heartbeat intervals require minimal bandwidth. However, during network splits, unstable quorums cause cascading re-election storms unless bounded by defensive randomized timeouts.

\`\`\`typescript
interface ClusterNode {
  id: string;
  region: 'us-east' | 'eu-west' | 'ap-southeast';
  role: 'leader' | 'follower' | 'candidate';
  term: number;
  lastHeartbeat: number;
}
\`\`\`

## 2. Partition Tolerance & Idempotent Event Logs

Instead of enforcing synchronous distributed transactions across thousands of miles, contemporary systems increasingly rely on append-only event logs combined with idempotent consumer processors.

Key architectural tenets include:

- **State Isolation:** Decouple read replicas from write leaders using change-data capture (CDC) pipelines.
- **Circuit Breakers:** Implement token-bucket rate limiters with jittered exponential backoff.
- **Row-Level Partitioning:** Shard relational records based on geographic locality to bound blast radius.

By adopting these principles, organizations achieve 99.999% service availability without sacrificing transactional correctness.
    `.trim(),
  },
  {
    id: 'post-02',
    author: 'user-admin-01',
    title: 'Zero-Cold-Start Compute at the Network Boundary',
    slug: 'zero-cold-start-compute-network-boundary',
    excerpt: 'How V8 isolate runtimes and WebAssembly sandboxes allow sub-5 millisecond serverless execution at 300+ edge locations worldwide.',
    cover_image: edgeImg,
    published: true,
    tags: ['Edge', 'Performance', 'Serverless'],
    views: 980,
    created_at: '2026-09-24T14:40:00Z',
    updated_at: '2026-09-24T14:40:00Z',
    markdown: `
Traditional container virtualization introduces boot latencies ranging between 300ms to several seconds. For user-facing API gateways and dynamic rendering pipelines, this latency penalty breaks fluid interaction budgets.

## The Isolate Revolution

By leveraging lightweight JavaScript isolate runtimes within a single pre-warmed memory space, initialization times plummet below 5ms. Isolate memory footprints measure in kilobytes rather than the hundreds of megabytes necessitated by full Linux containers.

\`\`\`bash
# Benchmarking isolate cold boot latency
isolate-bench --concurrency=1000 --target=edge-cluster
# Average TTFB: 4.2ms (p99: 8.7ms)
\`\`\`

### Architectural Comparison

1. **Containers:** Full OS kernel virtualization, high memory overhead, seconds to boot.
2. **MicroVMs (Firecracker):** Reduced footprint (~120ms boot), hypervisor isolation.
3. **V8 Isolates:** Process-level sandbox, memory sharing, instantaneous invocation.

Deploying compute directly to Points of Presence (PoPs) adjacent to the user completely transforms dynamic web personalization and edge caching paradigms.
    `.trim(),
  },
  {
    id: 'post-03',
    author: 'user-writer-02',
    title: 'The Typographic Mind: Designing Digital Literature for Maximum Retention',
    slug: 'typographic-mind-digital-literature',
    excerpt: 'Exploring the cognitive science of eye fixation, optical serifs, typographic rhythm, and responsive measure in long-form digital publishing.',
    cover_image: typographyImg,
    published: true,
    tags: ['Design', 'Typography', 'UX'],
    views: 1250,
    created_at: '2026-09-29T08:20:00Z',
    updated_at: '2026-09-29T08:20:00Z',
    markdown: `
Reading on emissive screens induces visual fatigue unless typographers deliberately compensate for subpixel rendering artifacts and cognitive scan patterns.

## The Golden Measure: 65 to 75 Characters

When a column of text is excessively wide, the reader's eye struggles to locate the start of subsequent lines upon carriage return. Conversely, columns that are too narrow disrupt lexical comprehension by forcing erratic saccadic jumps.

> "Typography exists to honor content. A well-crafted page creates an invisible, frictionless conduit between the writer's thought and the reader's comprehension."

### Key Rules for Editorial Excellence

- **Proportionate Leading:** Body text between 16px and 18px demands a line height of 1.75 to 1.85.
- **Optical Serifs:** Variable fonts with optical sizing adjust bracket thickness depending on point size.
- **Tabular Figures:** Never display numeric data in proportional fonts; vertical alignment demands tabular numerals.

By treating typography as an architectural discipline rather than cosmetic decoration, publication platforms foster deep intellectual immersion.
    `.trim(),
  },
  {
    id: 'post-04',
    author: 'user-admin-01',
    title: 'PostgreSQL at Scale: Row Level Security, B-Tree Indexes, and Query Plans',
    slug: 'postgresql-at-scale-rls-indexes',
    excerpt: 'A comprehensive investigation into Postgres index selectivity, EXPLAIN ANALYZE execution trees, and airtight Row Level Security policies.',
    cover_image: postgresImg,
    published: true,
    tags: ['PostgreSQL', 'Database', 'Security'],
    views: 1680,
    created_at: '2026-10-02T16:05:00Z',
    updated_at: '2026-10-02T16:05:00Z',
    markdown: `
PostgreSQL Row Level Security (RLS) is one of the most powerful paradigms for multi-tenant data isolation. When implemented correctly, security guarantees are enforced at the database kernel level rather than relying on application code conventions.

## 1. Crafting Performant RLS Policies

A common pitfall in RLS design is introducing unbounded subqueries inside policy definitions. Each row evaluated by PostgreSQL will execute the policy predicate.

\`\`\`sql
-- Inefficient policy that executes a subquery per candidate row
CREATE POLICY insecure_post_policy ON posts
  FOR SELECT
  USING (
    published = true OR 
    author = (SELECT auth.uid())
  );

-- Highly optimized policy utilizing direct token extraction
CREATE POLICY performant_post_policy ON posts
  FOR SELECT
  USING (
    published = true OR 
    author = auth.uid()
  );
\`\`\`

## 2. Composite B-Tree Indexing for Search and Filtering

When querying published articles ordered by creation timestamp, a compound index avoids expensive sequential disk scans:

\`\`\`sql
CREATE INDEX idx_posts_published_created 
  ON posts (published, created_at DESC) 
  WHERE published = true;
\`\`\`

By utilizing partial indexes, we keep index bloat minimal while ensuring instant query response times even across millions of rows.
    `.trim(),
  },
  {
    id: 'post-05',
    author: 'user-writer-01',
    title: 'The Blueprint for High-Throughput Content Caching',
    slug: 'blueprint-high-throughput-content-caching',
    excerpt: 'Draft strategies for surrogate keys, stale-while-revalidate invalidation, and edge streaming.',
    cover_image: heroCloudImg,
    published: false, // Draft post for writer
    tags: ['Architecture', 'Performance', 'Caching'],
    views: 14,
    created_at: '2026-10-03T11:00:00Z',
    updated_at: '2026-10-03T11:00:00Z',
    markdown: `
*This article is currently an unpublished draft.*

Investigating how cache-tags and surrogate keys permit instantaneous cache purging across edge CDN points of presence without purging the entire origin cache.
    `.trim(),
  }
];

export const INITIAL_COMMENTS: Comment[] = [
  {
    id: 'comment-01',
    post_id: 'post-01',
    user_id: 'user-admin-01',
    body: 'Exceptional breakdown of consensus protocols. The section on bounding election storms with randomized timeouts is particularly critical for cloud engineers.',
    created_at: '2026-09-19T11:20:00Z',
  },
  {
    id: 'comment-02',
    post_id: 'post-01',
    user_id: 'user-reader-01',
    body: 'How does this compare with hybrid logical clocks in databases like CockroachDB or Spanner? Would love to see a follow-up piece covering timestamp synchrony.',
    created_at: '2026-09-20T15:45:00Z',
  },
  {
    id: 'comment-03',
    post_id: 'post-03',
    user_id: 'user-writer-01',
    body: 'The 65-75 character line length rule is truly night and day for reading comfort. Thank you for citing the cognitive eye movement research!',
    created_at: '2026-09-30T10:12:00Z',
  },
  {
    id: 'comment-04',
    post_id: 'post-04',
    user_id: 'user-writer-02',
    body: 'Partial indexes with WHERE clauses are criminally underused in production. Great reminder to check EXPLAIN ANALYZE buffers.',
    created_at: '2026-10-03T08:50:00Z',
  }
];
