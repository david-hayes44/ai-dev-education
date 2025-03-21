import { createClient } from '@supabase/supabase-js';
import type { FileObject } from '@supabase/storage-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Add better error handling and diagnostics
if (!supabaseUrl) {
  console.error('ERROR: Missing NEXT_PUBLIC_SUPABASE_URL environment variable. Check your .env.local file.');
  throw new Error('Missing Supabase URL. Please set NEXT_PUBLIC_SUPABASE_URL in .env.local');
}

if (!supabaseKey) {
  console.error('ERROR: Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable. Check your .env.local file.');
  throw new Error('Missing Supabase key. Please set NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
}

// Log the initialization - not the full keys for security
console.log(`Initializing Supabase client with URL: ${supabaseUrl.substring(0, 15)}... and key: ${supabaseKey.substring(0, 5)}...`);

export const supabase = createClient(
  supabaseUrl,
  supabaseKey,
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

// Test connection on initialization
(async function testConnection() {
  try {
    // Simple query to test connection
    const { data, error } = await supabase.from('reports').select('count');
    
    if (error) {
      console.error('ERROR: Failed to connect to Supabase:', error.message);
      console.error('This might be causing the application to crash or refresh.');
      console.error('Check your Supabase URL, key, and ensure the reports table exists.');
    } else {
      console.log('Supabase connection test successful:', data);
    }
  } catch (err) {
    console.error('ERROR: Exception during Supabase connection test:', err);
    console.error('This might be causing the application to crash or refresh.');
  }
})();

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
    // Validate inputs
    if (!bucket || !path || !file) {
      console.error('Invalid parameters for uploadFile', { bucket, path, fileExists: !!file });
      throw new Error('Missing required parameters for file upload');
    }
    
    // Check if Supabase is properly initialized
    if (!supabaseUrl || !supabaseKey || !supabase) {
      console.error('Supabase not properly initialized');
      throw new Error('Storage configuration missing. Please check environment variables.');
    }
    
    // Get current user session to verify authentication
    const { data: sessionData } = await supabase.auth.getSession();
    const isAuthenticated = !!sessionData?.session?.user;
    
    console.log(`Attempting to upload file to ${bucket}/${path}`, { 
      fileSize: file.size, 
      fileType: file.type,
      authenticated: isAuthenticated,
      userId: sessionData?.session?.user?.id || 'anonymous'
    });

    // Create bucket if it doesn't exist
    await createBucketIfNotExists(bucket);

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

    // Perform the upload
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, options);

    if (error) {
      console.error('Supabase storage error:', error);
      
      // Check for RLS policy errors
      if (error.message.includes('row-level security') || 
          error.message.includes('policy')) {
        if (!isAuthenticated) {
          throw new Error('You need to be logged in to upload files. Please sign in and try again.');
        } else {
          throw new Error('Your account does not have permission to upload files to this storage bucket.');
        }
      }
      
      throw new Error(`Storage error: ${error.message}`);
    }

    if (!data) {
      console.error('No data returned from Supabase upload, but no error either');
      throw new Error('No data returned from storage upload');
    }

    console.log('File uploaded successfully', data);
    
    // Add the path to the response if it's missing
    const response = {
      ...data,
      path: data.path || path
    };

    return response as SupabaseFileResponse;
  } catch (error) {
    console.error('Error in uploadFile function:', error);
    // Rethrow the error with a descriptive message
    throw new Error(`Failed to upload: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
      console.log(`Creating bucket: ${bucket}`);
      const { error } = await supabase.storage.createBucket(bucket, {
        public: bucket === AVATARS_BUCKET, // Only avatars bucket should be public
        fileSizeLimit: bucket === EXPORTS_BUCKET ? 50000000 : 10000000, // 50MB for exports, 10MB for others
      });
      
      if (error) {
        console.error('Error creating bucket:', error.message);
        return false;
      }
      
      // Add RLS policies for the bucket
      // These are SQL policies - they would actually need to be applied in Supabase dashboard or via migration
      console.log(`Setting up RLS policies for bucket ${bucket}`);
      
      // Note: This is for documentation purposes, as RLS policies need to be set up
      // in the Supabase dashboard or via database migrations
      const sqlPolicies = [
        // Allow authenticated users to upload files
        `CREATE POLICY "Allow authenticated uploads" ON storage.objects
         FOR INSERT TO authenticated USING (
           bucket_id = '${bucket}' AND
           auth.uid() = owner
         );`,
         
        // Allow users to access their own files
        `CREATE POLICY "Allow access to own files" ON storage.objects
         FOR SELECT TO authenticated USING (
           bucket_id = '${bucket}' AND
           auth.uid() = owner
         );`
      ];
      
      console.log("SQL policies that need to be set up manually:", sqlPolicies);
    }
    
    return true;
  } catch (error) {
    console.error('Error creating bucket:', error);
    return false;
  }
} 