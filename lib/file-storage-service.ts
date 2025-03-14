import { storage } from './firebase';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject, getMetadata, getStorage } from 'firebase/storage';
import { FileAttachment } from './chat-service';
import { getApps } from 'firebase/app';

// Define maximum file size - 10MB
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

// Define allowed file types
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

// Add this debug function
export function getFirebaseStorageConfig() {
  const bucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  
  return {
    isConfigured: !!(bucket && apiKey && projectId),
    bucket,
    projectId,
    apiKeyFirstChar: apiKey ? apiKey.substring(0, 1) : undefined,
    apiKeyLength: apiKey ? apiKey.length : 0
  };
}

/**
 * Gets file extension from a filename
 */
export function getFileExtension(filename: string): string {
  return filename.substring(filename.lastIndexOf('.')).toLowerCase();
}

/**
 * Validates if a file meets the size and type restrictions
 */
export function validateFile(file: File): { valid: boolean; error?: FileValidationError } {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    const error = new Error(`File size exceeds maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`) as FileValidationError;
    error.code = 'file-too-large';
    return { valid: false, error };
  }
  
  // Check file type - first by MIME type
  const isValidMimeType = Object.keys(ALLOWED_FILE_TYPES).includes(file.type);
  
  // If MIME type check failed, check by file extension
  if (!isValidMimeType) {
    const extension = getFileExtension(file.name);
    const isValidExtension = ALLOWED_EXTENSIONS.includes(extension);
    
    // Special case for Markdown files which might be detected as text/plain
    const isMarkdown = extension === '.md';
    const isTextPlain = file.type === 'text/plain';
    
    if (!isValidExtension && !(isMarkdown && isTextPlain)) {
      const error = new Error(`File type not allowed: ${file.type} (${extension})`) as FileValidationError;
      error.code = 'file-type-not-allowed';
      return { valid: false, error };
    }
  }
  
  return { valid: true };
}

/**
 * Gets the file extension from mime type for storage purposes
 */
export function getExtensionFromMimeType(mimeType: string): string {
  return ALLOWED_FILE_TYPES[mimeType as keyof typeof ALLOWED_FILE_TYPES]?.split(',')[0] || '';
}

/**
 * Uploads a file to Firebase Storage
 */
export async function uploadFile(
  file: File,
  sessionId: string,
  onProgress?: (progress: number) => void,
  onError?: (error: Error) => void
): Promise<FileAttachment> {
  try {
    // Validate file first
    const validation = validateFile(file);
    if (!validation.valid && validation.error) {
      if (onError) onError(validation.error);
      throw validation.error;
    }
    
    // Get current timestamp for unique ID
    const timestamp = Date.now();
    const uniqueId = `${timestamp}-${Math.random().toString(36).substring(2, 9)}`;
    
    // Check if Firebase is initialized
    if (getApps().length === 0) {
      console.error("Firebase not available");
      throw new Error("Firebase storage is not initialized. Check your Firebase configuration.");
    }
    
    // Log storage config (for debugging)
    console.log("Firebase storage config:", getFirebaseStorageConfig());
    
    // Get file extension
    const fileExtension = getFileExtension(file.name);
    
    // Create a storage reference - using the imported storage instance directly
    const storageRef = ref(storage, `uploads/${sessionId}/${uniqueId}.${fileExtension}`);
    
    // Try to do a quick check if storage is accessible
    try {
      const testRef = ref(storage, '.verify-access');
      await getMetadata(testRef).catch(error => {
        if (error.code === 'storage/object-not-found') {
          // This is expected, just testing connectivity
          console.log("Firebase storage connection test passed");
        } else {
          console.warn("Firebase storage connection test warning:", error.code, error.message);
        }
      });
    } catch (error) {
      console.warn("Firebase storage connectivity test error:", error);
    }
    
    console.log(`Starting upload for ${file.name} (${formatBytes(file.size)}) to ${storageRef.fullPath}`);
    
    // Log additional details for debugging
    console.log("Storage bucket:", process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET);
    console.log("Upload path:", storageRef.fullPath);
    
    // Upload the file with progress tracking
    const uploadTask = uploadBytesResumable(storageRef, file);
    
    // Track progress
    uploadTask.on('state_changed', 
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log(`Upload progress: ${progress.toFixed(1)}%`);
        onProgress?.(progress);
      }, 
      (error) => {
        // Handle unsuccessful uploads
        console.error("Upload error:", error.code, error.message, error);
        onError?.(error);
      }
    );
    
    // Wait for the upload to complete
    const snapshot = await uploadTask;
    console.log("Upload completed successfully");
    
    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    // Create thumbnail URL for image files
    let thumbnailUrl: string | undefined;
    if (file.type.startsWith('image/')) {
      thumbnailUrl = downloadURL;
    }
    
    // Return file attachment details
    return {
      id: uniqueId,
      name: file.name,
      type: file.type,
      size: file.size,
      url: downloadURL,
      thumbnailUrl,
      storageRef: storageRef.fullPath
    };
  } catch (error) {
    console.error("Error in uploadFile:", error);
    onError?.(error instanceof Error ? error : new Error(String(error)));
    throw error;
  }
}

// Helper function to format bytes
function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Reads the content of a text file
 */
async function readFileContent(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result.toString());
      } else {
        reject(new Error('Failed to read file content'));
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

/**
 * Deletes a file from Firebase Storage
 */
export async function deleteFile(storageRef: string): Promise<void> {
  try {
    const fileRef = ref(storage, storageRef);
    await deleteObject(fileRef);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
}

/**
 * Updates the FileAttachment interface from chat-service.ts to include the Firebase storage reference
 */
declare module './chat-service' {
  interface FileAttachment {
    storageRef?: string;
  }
} 