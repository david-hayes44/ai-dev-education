import { NextRequest, NextResponse } from 'next/server';
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { initializeApp, getApps } from 'firebase/app';
import { 
  MAX_FILE_SIZE, 
  ALLOWED_FILE_TYPES, 
  ALLOWED_EXTENSIONS,
  validateFile,
  getFileExtension
} from '@/lib/file-storage-service';

// Initialize Firebase if not already initialized
const getFirebaseApp = () => {
  if (getApps().length > 0) return getApps()[0];
  
  return initializeApp({
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  });
};

// Enhanced helper function to validate file type
function isAllowedFileType(contentType: string, filename: string): boolean {
  // Check by MIME type first
  if (Object.keys(ALLOWED_FILE_TYPES).includes(contentType)) {
    return true;
  }
  
  // If MIME type check failed, check by file extension
  const extension = getFileExtension(filename);
  const isValidExtension = ALLOWED_EXTENSIONS.includes(extension);
  
  // Special case for Markdown files which might be detected as text/plain
  const isMarkdown = extension === '.md';
  const isTextPlain = contentType === 'text/plain';
  
  return isValidExtension || (isMarkdown && isTextPlain);
}

export async function POST(request: NextRequest) {
  try {
    // Extract the multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const sessionId = formData.get('sessionId') as string;
    
    // Validate presence of required fields
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    
    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }
    
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { 
          error: `File size exceeds the maximum allowed limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB` 
        }, 
        { status: 400 }
      );
    }
    
    // Validate file type using the enhanced validation
    if (!isAllowedFileType(file.type, file.name)) {
      const extension = getFileExtension(file.name);
      return NextResponse.json(
        { error: `File type not allowed: ${file.type} (${extension})` }, 
        { status: 400 }
      );
    }
    
    // Initialize Firebase Storage
    const firebaseApp = getFirebaseApp();
    const storage = getStorage(firebaseApp);
    
    // Create a safe filename with timestamp
    const timestamp = Date.now();
    const safeFileName = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    
    // Reference to the file location in Firebase Storage
    const storageRef = ref(storage, `attachments/${sessionId}/${safeFileName}`);
    
    // Convert the file to an ArrayBuffer for upload
    const buffer = await file.arrayBuffer();
    
    // Upload the file to Firebase Storage
    const uploadTask = await uploadBytesResumable(storageRef, new Uint8Array(buffer), {
      contentType: file.type,
    });
    
    // Get the download URL
    const downloadURL = await getDownloadURL(uploadTask.ref);
    
    // Return the file information
    return NextResponse.json({
      success: true,
      file: {
        id: timestamp.toString(),
        name: file.name,
        type: file.type,
        size: file.size,
        url: downloadURL,
        storageRef: `attachments/${sessionId}/${safeFileName}`,
      }
    });
  } catch (error) {
    console.error('Error handling file upload:', error);
    
    // Return a generic error to the client
    return NextResponse.json(
      { error: 'Failed to upload file' }, 
      { status: 500 }
    );
  }
}

// Add a DELETE endpoint for deleting files
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const storageRef = searchParams.get('ref');
    
    if (!storageRef) {
      return NextResponse.json({ error: 'Storage reference is required' }, { status: 400 });
    }
    
    // Initialize Firebase Storage
    const firebaseApp = getFirebaseApp();
    const storage = getStorage(firebaseApp);
    
    // Create a reference to the file
    const fileRef = ref(storage, storageRef);
    
    // Delete the file
    await deleteObject(fileRef);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting file:', error);
    
    return NextResponse.json(
      { error: 'Failed to delete file' }, 
      { status: 500 }
    );
  }
} 