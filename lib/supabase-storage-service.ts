import { supabase } from './supabase';
import { FileAttachment } from './chat-service';
import { v4 as uuidv4 } from 'uuid';

// Define maximum file size - 10MB
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

// Define allowed file types (same as in the Firebase service)
export const ALLOWED_FILE_TYPES = {
  // Document types
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'text/markdown': '.md',
  'text/plain': '.txt',
  'application/pdf': '.pdf',
  
  // Spreadsheet types
  'application/vnd.ms-excel': '.xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
  'text/csv': '.csv',
  
  // Image types
  'image/jpeg': '.jpg,.jpeg',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/webp': '.webp',
  'image/svg+xml': '.svg',
};

// Define allowed file extensions
export const ALLOWED_EXTENSIONS = [
  // Document types
  '.doc', '.docx', '.md', '.txt', '.pdf',
  // Spreadsheet types
  '.xls', '.xlsx', '.csv',
  // Image types
  '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'
];

export interface UploadProgressCallback {
  (progress: number): void;
}

export interface UploadErrorCallback {
  (error: Error): void;
}

export interface FileValidationError extends Error {
  code: 'file-too-large' | 'file-type-not-allowed';
}

/**
 * Get the file extension from a filename
 */
export function getFileExtension(filename: string): string {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 1).toLowerCase();
}

/**
 * Validate a file against size and type restrictions
 */
export function validateFile(file: File): { valid: boolean; error?: FileValidationError } {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    const error = new Error(`File is too large. Maximum size is ${formatBytes(MAX_FILE_SIZE)}.`) as FileValidationError;
    error.code = 'file-too-large';
    return { valid: false, error };
  }

  // Check file type
  const fileExtension = `.${getFileExtension(file.name)}`;
  const mimeTypeAllowed = Object.keys(ALLOWED_FILE_TYPES).includes(file.type);
  const extensionAllowed = ALLOWED_EXTENSIONS.includes(fileExtension);

  if (!mimeTypeAllowed && !extensionAllowed) {
    const allowedExtensions = ALLOWED_EXTENSIONS.join(', ');
    const error = new Error(`File type not allowed. Allowed file types are: ${allowedExtensions}`) as FileValidationError;
    error.code = 'file-type-not-allowed';
    return { valid: false, error };
  }

  return { valid: true };
}

/**
 * Get the extension from a MIME type
 */
export function getExtensionFromMimeType(mimeType: string): string {
  return ALLOWED_FILE_TYPES[mimeType as keyof typeof ALLOWED_FILE_TYPES] || '';
}

/**
 * Upload a file to Supabase Storage
 */
export async function uploadFile(
  file: File,
  sessionId: string,
  onProgress?: (progress: number) => void,
  onError?: (error: Error) => void
): Promise<FileAttachment> {
  try {
    // Debug info
    console.log('Starting upload process', {
      fileInfo: {
        name: file.name,
        size: file.size,
        type: file.type
      },
      sessionId,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 10) + '...',
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    });

    // Validate the file
    const validation = validateFile(file);
    if (!validation.valid && validation.error) {
      console.error('File validation failed:', validation.error);
      if (onError) onError(validation.error);
      throw validation.error;
    }

    // Create a unique file ID
    const fileId = uuidv4();
    
    // Create a clean filename (remove special characters, spaces, etc.)
    const fileExtension = getFileExtension(file.name);
    const cleanFileName = `${fileId}.${fileExtension}`;
    
    // Create the storage path
    const filePath = `chat-attachments/${sessionId}/${cleanFileName}`;
    
    console.log('Preparing to upload to Supabase:', {
      bucket: 'chat-files',
      filePath,
      fileSize: file.size
    });
    
    // Upload the file to Supabase Storage
    const { data, error } = await supabase.storage
      .from('chat-files')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });
    
    if (error) {
      console.error('Error uploading file to Supabase:', error);
      if (onError) onError(new Error(`Error uploading file: ${error.message}`));
      throw error;
    }

    console.log('Upload successful, getting public URL');
    
    // Get the public URL for the file
    const { data: { publicUrl } } = supabase.storage
      .from('chat-files')
      .getPublicUrl(filePath);

    // Extract and store file content for text-based files if needed
    let fileContent: string | undefined;
    if (file.type.startsWith('text/') || 
        file.type === 'application/json' || 
        file.name.endsWith('.md')) {
      fileContent = await readFileContent(file);
    }

    // Create the file attachment object
    const attachment: FileAttachment = {
      id: fileId,
      name: file.name,
      type: file.type,
      size: file.size,
      url: publicUrl,
      storageRef: filePath,
      content: fileContent
    };
    
    // Signal upload complete
    if (onProgress) onProgress(100);
    
    return attachment;
  } catch (error) {
    console.error('Error in uploadFile:', error);
    if (onError && error instanceof Error) onError(error);
    throw error;
  }
}

/**
 * Format bytes to a human-readable string
 */
function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Read the content of a text file
 */
async function readFileContent(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      if (event.target?.result) {
        resolve(event.target.result as string);
      } else {
        reject(new Error('Failed to read file content'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };
    
    reader.readAsText(file);
  });
}

/**
 * Delete a file from Supabase Storage
 */
export async function deleteFile(storageRef: string): Promise<void> {
  try {
    const { error } = await supabase.storage
      .from('chat-files')
      .remove([storageRef]);
    
    if (error) {
      console.error('Error deleting file from Supabase:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in deleteFile:', error);
    throw error;
  }
} 