import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { UploadCloud, X, FileText, Image as ImageIcon, AlertCircle, Link, LogIn } from 'lucide-react';
import { uploadFile, getFileUrl } from '@/lib/supabase';
import { Button } from '@/components/ui/button';

interface FileUploadProps {
  onFileUploaded: (fileData: {
    path: string;
    url: string;
    name: string;
    size: number;
    type: string;
  }) => void;
  userId: string;
}

export default function FileUpload({ onFileUploaded, userId }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileInfo, setFileInfo] = useState<File | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const [showFallback, setShowFallback] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAnonymous = userId === 'anonymous';

  useEffect(() => {
    // Clear debug info after 10 seconds
    if (debugInfo) {
      const timer = setTimeout(() => {
        setDebugInfo(null);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [debugInfo]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileInfo(file);
    setError(null);
    setDebugInfo(null);
    setShowFallback(false);

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  // Local fallback for when Supabase storage fails
  const handleFallbackAttachment = () => {
    if (!fileInfo) return;
    
    try {
      setUploading(true);
      
      // For images or small files (< 2MB), we can use a data URL
      if (fileInfo.type.startsWith('image/') || fileInfo.size < 2 * 1024 * 1024) {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (!e.target?.result) {
            setError("Failed to read file");
            setUploading(false);
            return;
          }
          
          // Create a local attachment with data URL
          onFileUploaded({
            path: `local/${Date.now()}-${fileInfo.name}`,
            url: e.target.result as string,
            name: fileInfo.name,
            size: fileInfo.size,
            type: fileInfo.type
          });
          
          // Reset the form
          resetUpload();
          setUploading(false);
        };
        
        reader.onerror = () => {
          setError("Failed to read file");
          setUploading(false);
        };
        
        reader.readAsDataURL(fileInfo);
      } else {
        // For larger files, create a simple reference
        onFileUploaded({
          path: `local/${Date.now()}-${fileInfo.name}`,
          url: `data:${fileInfo.type};name=${encodeURIComponent(fileInfo.name)}`,
          name: fileInfo.name,
          size: fileInfo.size,
          type: fileInfo.type
        });
        
        // Reset the form
        resetUpload();
        setUploading(false);
      }
    } catch (err) {
      console.error('Error with fallback attachment:', err);
      setError('Failed to attach file locally.');
      setUploading(false);
    }
  };

  const handleUpload = async () => {
    if (!fileInfo) return;

    try {
      setUploading(true);
      setProgress(0);
      setError(null);
      setDebugInfo(null);
      setShowFallback(false);

      // Upload to specific folder per user
      const path = `users/${userId}/${Date.now()}-${fileInfo.name.replace(/[^a-zA-Z0-9-_.]/g, '_')}`;
      
      // Handle progress updates
      const onProgressUpdate = (progress: number) => {
        setProgress(Math.round(progress * 100));
      };

      // Verify file size
      if (fileInfo.size > 10 * 1024 * 1024) { // 10MB limit
        throw new Error("File too large. Maximum file size is 10MB.");
      }

      // Log info for debugging
      setDebugInfo(`Starting upload to bucket: attachments, path: ${path}, user: ${userId}`);

      try {
        const result = await uploadFile("attachments", path, fileInfo, onProgressUpdate);
        
        if (!result) {
          throw new Error("Upload failed - no result returned");
        }
        
        setDebugInfo(`Upload successful, generating public URL for: ${result.path || path}`);
        
        // Get the public URL for the file
        const fileUrl = getFileUrl("attachments", result.path || path);
        
        if (!fileUrl) {
          throw new Error("Failed to generate public URL for file");
        }
        
        setDebugInfo(`File uploaded successfully with URL: ${fileUrl}`);
        
        // Send the file data back to the parent component
        onFileUploaded({
          path: result.path || path,
          url: fileUrl,
          name: fileInfo.name,
          size: fileInfo.size,
          type: fileInfo.type
        });
        
        // Reset after successful upload
        resetUpload();
      } catch (uploadError) {
        console.error('Specific upload error:', uploadError);
        
        // Check for common Supabase errors
        const errorMessage = uploadError instanceof Error ? uploadError.message : 'Unknown error';
        
        if (errorMessage.includes('Storage configuration missing')) {
          setDebugInfo('Storage not configured correctly on the server. Please check Supabase setup.');
          setError('Storage not configured correctly. Please try the local attachment option.');
          setShowFallback(true);
          return;
        }
        
        if (errorMessage.includes('need to be logged in') || errorMessage.includes('sign in')) {
          setDebugInfo('Authentication required: You need to be logged in to upload files.');
          setError('You need to be signed in to upload files to cloud storage. Please sign in or use local attachment.');
          setShowFallback(true);
          return;
        }
        
        if (errorMessage.includes('permission') || 
            errorMessage.includes('Unauthorized') || 
            errorMessage.includes('not allowed') || 
            errorMessage.includes('row-level security policy') || 
            errorMessage.includes('violates row-level security')) {
          setDebugInfo(`Security policy error: User ${userId} does not have permission to upload files to storage.`);
          setError('Your account does not have permission to upload files. Please use the "Attach Locally" option instead.');
          setShowFallback(true);
          return;
        }
        
        // For other errors, show fallback option
        setError(`${errorMessage}. You can try attaching the file locally instead.`);
        setShowFallback(true);
        return;
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload file';
      console.error('Upload error:', err);
      setError(errorMessage);
      setDebugInfo(`Error during upload: ${errorMessage}`);
      setShowFallback(true);
    } finally {
      setUploading(false);
    }
  };

  const resetUpload = () => {
    setFileInfo(null);
    setPreview(null);
    setProgress(0);
    setError(null);
    setShowFallback(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const getFileIcon = () => {
    if (!fileInfo) return <UploadCloud className="h-6 w-6" />;
    if (fileInfo.type.startsWith('image/')) return <ImageIcon className="h-6 w-6" />;
    return <FileText className="h-6 w-6" />;
  };

  // Add sign-in handler
  const handleSignIn = () => {
    // Redirect to login page
    window.location.href = '/auth/login';
  };

  return (
    <div className="space-y-4">
      {isAnonymous && (
        <div className="flex items-center bg-orange-50 dark:bg-orange-950/50 text-orange-800 dark:text-orange-300 rounded-md p-2 text-xs gap-2 mb-2">
          <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
          <div>
            <p>Sign in for full file storage capabilities</p>
            <button 
              onClick={handleSignIn}
              className="inline-flex items-center text-orange-600 dark:text-orange-400 hover:underline mt-1 gap-1"
            >
              <LogIn className="h-3 w-3" />
              <span>Sign in</span>
            </button>
          </div>
        </div>
      )}

      {/* Add AI file support information */}
      <div className="text-xs text-muted-foreground mb-2">
        <p className="font-medium mb-1">Supported file types:</p>
        <ul className="list-disc list-inside space-y-0.5">
          <li>Text files (.txt, .md, .csv)</li>
          <li>Code files (.js, .py, .ts, etc.)</li>
          <li>Images (.jpg, .png, .gif)</li>
          <li>PDFs (.pdf) - text extraction only</li>
        </ul>
        <p className="mt-1 text-amber-600 dark:text-amber-400">
          <AlertCircle className="h-3 w-3 inline mr-1" />
          Large files may exceed token limits
        </p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 rounded-md p-2 text-xs flex items-start gap-2">
          <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
          <div>
            <p>{error}</p>
            {showFallback && (
              <Button 
                variant="link" 
                size="sm" 
                className="text-xs p-0 h-auto mt-1 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                onClick={handleFallbackAttachment}
              >
                Use local attachment instead
              </Button>
            )}
          </div>
        </div>
      )}

      {debugInfo && (
        <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded-md p-2 text-xs">
          <p className="font-mono text-[10px] break-all">{debugInfo}</p>
        </div>
      )}

      {fileInfo ? (
        <div className="mb-4 p-3 border rounded-md bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {preview ? (
                <div className="relative h-12 w-12 rounded-md overflow-hidden">
                  <Image
                    src={preview}
                    alt={fileInfo.name}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                getFileIcon()
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {fileInfo.name}
                </p>
                <p className="text-xs text-gray-500">{formatFileSize(fileInfo.size)}</p>
              </div>
            </div>
            <button
              onClick={resetUpload}
              className="text-gray-400 hover:text-gray-500"
              disabled={uploading}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {uploading && (
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">Uploading: {progress}%</p>
            </div>
          )}

          <div className="mt-3 flex justify-end gap-2">
            {showFallback && (
              <button
                onClick={handleFallbackAttachment}
                disabled={uploading}
                className="inline-flex items-center px-3 py-1.5 text-sm rounded-md text-white bg-green-600 hover:bg-green-700 disabled:bg-green-300"
              >
                <Link className="h-4 w-4 mr-1" />
                Attach Locally
              </button>
            )}
            <button
              onClick={handleUpload}
              disabled={uploading || showFallback || (isAnonymous && !userId.includes('admin'))}
              className="inline-flex items-center px-3 py-1.5 text-sm rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300"
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
          
          {!isAnonymous && error && error.includes('not have permission') && (
            <div className="mt-2 text-xs text-gray-600 bg-gray-100 p-2 rounded">
              <p className="font-medium">For administrators:</p>
              <p>To enable cloud uploads, set up proper Row-Level Security (RLS) policies in Supabase:</p>
              <ol className="list-decimal ml-4 mt-1">
                <li>Go to Supabase dashboard → Storage → Policies</li>
                <li>Add a policy for INSERT to authenticated users</li>
                <li>Add condition: <code>auth.uid() = owner</code></li>
              </ol>
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-center w-full">
          <label
            htmlFor="file-upload"
            className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <UploadCloud className="h-6 w-6 text-gray-400" />
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500">
                PDF, docs, images, code files, and more (up to 10MB)
              </p>
            </div>
            <input
              id="file-upload"
              type="file"
              className="hidden"
              onChange={handleFileChange}
              ref={fileInputRef}
              accept="image/*,.pdf,.doc,.docx,.txt,.csv,.json,.js,.ts,.jsx,.tsx,.html,.css,.md,.xml,.yaml,.yml,.py,.java,.rb,.c,.cpp,.h,.hpp,.cs,.go,.php,.sql,.swift"
            />
          </label>
        </div>
      )}
    </div>
  );
} 