import { getSupabaseClient, isSupabaseConfigured, getSupabaseConfig } from './client';
import heroCloudImg from '../../assets/images/hero_cloud_architecture_1791130352186.jpg';
import edgeImg from '../../assets/images/post_edge_computing_1791130363488.jpg';
import typoImg from '../../assets/images/post_editorial_typography_1791130380254.jpg';
import postgresImg from '../../assets/images/post_postgres_database_1791130393163.jpg';

export interface UploadProgressCallback {
  (progress: number): void;
}

export interface UploadResult {
  url: string;
  path: string;
  error?: string;
}

const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const BUCKET_NAME = 'blog-images';

/**
 * Map of bundled editorial images to resolve local seed assets and legacy paths
 */
export const LOCAL_ASSET_IMAGES: Record<string, string> = {
  hero_cloud_architecture_1791130352186: heroCloudImg,
  post_edge_computing_1791130363488: edgeImg,
  post_editorial_typography_1791130380254: typoImg,
  post_postgres_database_1791130393163: postgresImg,
  '/src/assets/images/hero_cloud_architecture_1791130352186.jpg': heroCloudImg,
  'src/assets/images/hero_cloud_architecture_1791130352186.jpg': heroCloudImg,
  '/src/assets/images/post_edge_computing_1791130363488.jpg': edgeImg,
  'src/assets/images/post_edge_computing_1791130363488.jpg': edgeImg,
  '/src/assets/images/post_editorial_typography_1791130380254.jpg': typoImg,
  'src/assets/images/post_editorial_typography_1791130380254.jpg': typoImg,
  '/src/assets/images/post_postgres_database_1791130393163.jpg': postgresImg,
  'src/assets/images/post_postgres_database_1791130393163.jpg': postgresImg,
};

/**
 * Reusable helper to generate the public URL for any cover_image path.
 * Handles storage paths (e.g. "userId/uuid.webp"), existing full URLs (http/https/data),
 * empty/null values, bundled editorial assets, and offline demo fallbacks.
 */
export function getCoverImageUrl(value?: string | null): string {
  if (
    !value ||
    typeof value !== 'string' ||
    value === '[object File]' ||
    value === 'undefined' ||
    value === 'null'
  ) {
    return '';
  }

  const trimmed = value.trim();
  if (!trimmed) return '';

  // 1. If already an absolute or inline URL
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:')
  ) {
    return trimmed;
  }

  // 2. If active local blob URL during editor preview
  if (trimmed.startsWith('blob:')) {
    return trimmed;
  }

  // 3. Exact match in bundled local assets
  if (LOCAL_ASSET_IMAGES[trimmed]) {
    return LOCAL_ASSET_IMAGES[trimmed];
  }

  // 4. Substring match for known bundled asset filenames or keys
  for (const [key, assetUrl] of Object.entries(LOCAL_ASSET_IMAGES)) {
    if (trimmed.includes(key) || key.includes(trimmed)) {
      return assetUrl;
    }
  }

  // 5. If it's a local Vite / static assets path
  if (
    trimmed.startsWith('/src/') ||
    trimmed.startsWith('src/') ||
    trimmed.startsWith('/assets/') ||
    trimmed.startsWith('assets/') ||
    trimmed.startsWith('/@') ||
    trimmed.startsWith('./assets/')
  ) {
    return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  }

  // 6. Supabase Storage path: ${userId}/${uuid}.${fileExt}
  const cleanPath = trimmed.replace(/^blog-images\//, '').replace(/^\/+/, '');

  // If demo path (starts with demo/)
  if (cleanPath.startsWith('demo/')) {
    return '';
  }

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(cleanPath);
      if (data?.publicUrl) {
        return data.publicUrl;
      }
    }

    // Direct URL fallback if client is initializing
    const config = getSupabaseConfig();
    if (config.url) {
      return `${config.url}/storage/v1/object/public/${BUCKET_NAME}/${cleanPath}`;
    }
  }

  return cleanPath;
}

// Backward-compatible alias for existing imports
export const getPublicImageUrl = getCoverImageUrl;

/**
 * Uploads a cover image file to Supabase Storage bucket 'blog-images'
 * using standard unique path: ${userId}/${crypto.randomUUID()}.${fileExt}
 */
export async function uploadBlogImage(
  file: File,
  userId?: string,
  onProgress?: UploadProgressCallback
): Promise<UploadResult> {
  // Validate file type
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      url: '',
      path: '',
      error: 'Invalid file format. Only PNG, JPG, JPEG, and WEBP images are supported.',
    };
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      url: '',
      path: '',
      error: 'File size exceeds 5MB limit. Please compress your image.',
    };
  }

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return { url: '', path: '', error: 'Supabase client unavailable' };
    }

    try {
      // Step 4: Get authenticated user
      const {
        data: { user: authUser },
        error: authError,
      } = await supabase.auth.getUser();

      const activeUserId = authUser?.id || userId;
      if (!activeUserId) {
        throw new Error('Please log in first before uploading images.');
      }

      onProgress?.(25);

      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const uniqueId =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const filePath = `${activeUserId}/${uniqueId}.${fileExt}`;

      // Upload to Supabase Storage
      const { data: uploadResponse, error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type,
        });

      if (uploadError) {
        console.error('Supabase storage upload error:', uploadError);
        throw uploadError;
      }

      onProgress?.(80);

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);

      const imageUrl = publicUrlData?.publicUrl || '';

      // Requirement 10: Useful console logging
      console.log('Cover image storage path:', filePath);
      console.log('Cover image URL:', imageUrl);
      console.log('Upload response:', uploadResponse);

      onProgress?.(100);

      return {
        url: imageUrl,
        path: filePath,
      };
    } catch (err: any) {
      console.error('Supabase storage upload error:', err);
      return {
        url: '',
        path: '',
        error: err.message || 'Failed to upload image to Supabase Storage.',
      };
    }
  }

  // Fallback demo mode (e.g. preview mode without live credentials)
  return new Promise((resolve) => {
    let progress = 10;
    onProgress?.(progress);

    const interval = setInterval(() => {
      progress += 30;
      if (progress >= 95) {
        clearInterval(interval);
        const reader = new FileReader();
        reader.onload = (e) => {
          onProgress?.(100);
          const result = e.target?.result as string;
          const fakePath = `demo/${Date.now()}-${file.name}`;
          console.log('Cover image storage path (demo):', fakePath);
          console.log('Cover image URL (demo):', result.substring(0, 50) + '...');
          resolve({
            url: result,
            path: result, // in offline demo, data URL serves as persistent local path
          });
        };
        reader.onerror = () => {
          resolve({
            url: '',
            path: '',
            error: 'Failed to read file locally.',
          });
        };
        reader.readAsDataURL(file);
      } else {
        onProgress?.(progress);
      }
    }, 100);
  });
}

export async function deleteBlogImage(path: string): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured() || path.startsWith('data:') || path.startsWith('http')) {
    return { success: true };
  }

  const supabase = getSupabaseClient();
  if (!supabase) return { success: false, error: 'Client unavailable' };

  try {
    const cleanPath = path.replace(/^blog-images\//, '');
    const { error } = await supabase.storage.from(BUCKET_NAME).remove([cleanPath]);
    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
