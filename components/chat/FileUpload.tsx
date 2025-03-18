import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { UploadCloud, X, FileText, Image as ImageIcon, AlertCircle, Link } from 'lucide-react';
import { uploadFile, getFileUrl } from '@/lib/supabase';

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
      // For images or small files, we can use a data URL
      if (fileInfo.type.startsWith('image/') || fileInfo.size < 1024 * 1024) { // < 1MB
        const reader = new FileReader();
        reader.onload = (e) => {
          if (!e.target?.result) return;
          
          // Create a local attachment with data URL
          onFileUploaded({
            path: `local/${fileInfo.name}`,
            url: e.target.result as string,
            name: fileInfo.name,
            size: fileInfo.size,
            type: fileInfo.type
          });
          
          // Reset the form
          resetUpload();
        };
        reader.readAsDataURL(fileInfo);
      } else {
        // For other files, just use a reference to the file name
        onFileUploaded({
          path: `local/${fileInfo.name}`,
          // Use a placeholder URL since we can't upload
          url: '#',
          name: fileInfo.name,
          size: fileInfo.size,
          type: fileInfo.type
        });
        
        // Reset the form
        resetUpload();
      }
    } catch (err) {
      console.error('Error with fallback attachment:', err);
      setError('Failed to attach file locally.');
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
      setDebugInfo(`Starting upload to bucket: attachments, path: ${path}`);

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
        
        if (errorMessage.includes('Unauthorized') || errorMessage.includes('not allowed')) {
          setDebugInfo('Unauthorized: Your account may not have permission to upload files.');
          setError('You do not have permission to upload files. Try the local attachment option.');
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

  return (
    <div className="w-full">
      {error && (
        <div className="mb-2 text-sm text-red-500 bg-red-50 p-2 rounded-md flex items-start gap-2">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      
      {debugInfo && (
        <div className="mb-2 text-xs text-blue-500 bg-blue-50 p-2 rounded-md">
          <div className="font-medium">Debug Info:</div>
          <div>{debugInfo}</div>
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
                className="inline-flex items-center px-3 py-1.5 text-sm rounded-md text-white bg-amber-600 hover:bg-amber-700 disabled:bg-amber-300"
              >
                <Link className="h-4 w-4 mr-1" />
                Attach Locally
              </button>
            )}
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="inline-flex items-center px-3 py-1.5 text-sm rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300"
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
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