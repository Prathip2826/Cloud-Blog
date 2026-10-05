import { getSupabaseClient, isSupabaseConfigured } from './client';

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

export async function uploadBlogImage(
  file: File,
  userId: string,
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

  // If Supabase is configured, upload to live Supabase Storage bucket 'blog-images'
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return { url: '', path: '', error: 'Supabase client unavailable' };
    }

    try {
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const cleanFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `${userId}/${cleanFileName}`;

      onProgress?.(30);

      const { data, error } = await supabase.storage
        .from('blog-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        throw error;
      }

      onProgress?.(80);

      const { data: urlData } = supabase.storage
        .from('blog-images')
        .getPublicUrl(data.path);

      onProgress?.(100);

      return {
        url: urlData.publicUrl,
        path: data.path,
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

  // Fallback demo mode: Convert to data URL and simulate upload progress
  return new Promise((resolve) => {
    let progress = 10;
    onProgress?.(progress);

    const interval = setInterval(() => {
      progress += 25;
      if (progress >= 95) {
        clearInterval(interval);
        const reader = new FileReader();
        reader.onload = (e) => {
          onProgress?.(100);
          const result = e.target?.result as string;
          resolve({
            url: result,
            path: `demo/${file.name}`,
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
    }, 120);
  });
}

export async function deleteBlogImage(path: string): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured() || path.startsWith('demo/')) {
    return { success: true };
  }

  const supabase = getSupabaseClient();
  if (!supabase) return { success: false, error: 'Client unavailable' };

  try {
    const { error } = await supabase.storage.from('blog-images').remove([path]);
    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
