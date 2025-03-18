import { createClient } from '@supabase/supabase-js';
import type { FileObject } from '@supabase/storage-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables. Check your .env.local file.');
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseKey || '',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    global: {
      fetch: fetch.bind(globalThis),
    },
  }
);

// Storage configuration
export const STORAGE_BUCKET = 'attachments';
export const AVATARS_BUCKET = 'avatars';
export const EXPORTS_BUCKET = 'exports';

// Define storage buckets to be used in the application
export const STORAGE_BUCKETS = [
  STORAGE_BUCKET,
  AVATARS_BUCKET,
  EXPORTS_BUCKET
];

// Create all storage buckets when initializing the app
export async function initializeStorageBuckets(): Promise<void> {
  try {
    for (const bucket of STORAGE_BUCKETS) {
      await createBucketIfNotExists(bucket);
    }
    console.log('Storage buckets initialized successfully');
  } catch (error: unknown) {
    console.error('Error initializing storage buckets:', error);
  }
}

// Storage functions

// Define more specific types for Supabase file responses
export interface SupabaseFileResponse {
  id?: string;
  name?: string;
  bucket_id?: string;
  owner?: string;
  path?: string;
  fullPath?: string;
  size?: number;
  created_at?: string;
  updated_at?: string;
  last_accessed_at?: string;
  [key: string]: string | number | boolean | undefined;
}

/**
 * Get a secure path for storing user-specific files
 * This creates a path starting with the user ID to enforce ownership via path structure
 * @param userId The user's ID
 * @param fileName The name of the file
 * @param prefix Optional additional path prefix after the user ID
 */
export function getSecureFilePath(userId: string, fileName: string, prefix?: string): string {
  const securePath = prefix 
    ? `${userId}/${prefix}/${fileName}`
    : `${userId}/${fileName}`;
  
  return securePath;
}

/**
 * Get a secure path for storing message attachments
 * @param messageId The message ID
 * @param fileName The name of the file
 */
export function getAttachmentPath(messageId: string, fileName: string): string {
  return `${messageId}/${fileName}`;
}

/**
 * Upload a file to Supabase Storage
 * @param bucket The storage bucket name
 * @param path The path to store the file (including filename)
 * @param file The file to upload
 * @param onProgress Optional progress callback
 */
export async function uploadFile(
  bucket: string,
  path: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<SupabaseFileResponse | null> {
  try {
    // Create an upload event handler that works with the progress callback
    const options: {
      cacheControl: string;
      upsert: boolean;
      onUploadProgress?: (progressEvent: { loaded: number; total: number }) => void;
    } = {
      cacheControl: '3600',
      upsert: true,
    };
    
    // Add progress tracking if a callback is provided
    if (onProgress) {
      options.onUploadProgress = (progressEvent: { loaded: number; total: number }) => {
        if (progressEvent.total > 0) {
          const progress = progressEvent.loaded / progressEvent.total;
          onProgress(progress);
        }
      };
    }

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, options);

    if (error) {
      console.error('Error uploading file:', error.message);
      return null;
    }

    return data as SupabaseFileResponse;
  } catch (error) {
    console.error('Error uploading file:', error);
    return null;
  }
}

/**
 * Get a public URL for a file in Supabase Storage
 * @param bucket The storage bucket name
 * @param path The path to the file (including filename)
 */
export function getFileUrl(bucket: string, path: string): string {
  if (!bucket || !path) {
    console.error('Invalid bucket or path provided to getFileUrl', { bucket, path });
    return '';
  }
  
  try {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    
    if (!data || !data.publicUrl) {
      console.error('Failed to generate public URL', { bucket, path, data });
      return '';
    }
    
    return data.publicUrl;
  } catch (error) {
    console.error('Error generating public URL:', error);
    // Fallback to constructing URL manually (not ideal but helps in some cases)
    if (supabaseUrl) {
      return `${supabaseUrl}/storage/v1/object/public/${bucket}/${encodeURIComponent(path)}`;
    }
    return '';
  }
}

/**
 * Download a file from Supabase Storage
 * @param bucket The storage bucket name
 * @param path The path to the file (including filename)
 */
export async function downloadFile(bucket: string, path: string): Promise<Blob | null> {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .download(path);

    if (error || !data) {
      console.error('Error downloading file:', error?.message);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error downloading file:', error);
    return null;
  }
}

/**
 * List files in a directory in Supabase Storage
 * @param bucket The storage bucket name
 * @param path The directory path
 */
export async function listFiles(bucket: string, path?: string): Promise<FileObject[] | null> {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(path || '');

    if (error) {
      console.error('Error listing files:', error.message);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error listing files:', error);
    return null;
  }
}

/**
 * Delete a file from Supabase Storage
 * @param bucket The storage bucket name
 * @param path The path to the file (including filename)
 */
export async function deleteFile(bucket: string, path: string): Promise<boolean> {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      console.error('Error deleting file:', error.message);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
}

/**
 * Create a bucket in Supabase Storage if it doesn't exist
 * @param bucket The storage bucket name
 */
export async function createBucketIfNotExists(bucket: string): Promise<boolean> {
  try {
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError.message);
      return false;
    }
    
    const bucketExists = buckets.some((b: {name: string}) => b.name === bucket);
    
    if (!bucketExists) {
      const { error } = await supabase.storage.createBucket(bucket, {
        public: bucket === AVATARS_BUCKET, // Only avatars bucket should be public
        fileSizeLimit: bucket === EXPORTS_BUCKET ? 50000000 : 5000000, // 50MB for exports, 5MB for others
      });
      
      if (error) {
        console.error('Error creating bucket:', error.message);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error creating bucket:', error);
    return false;
  }
} 