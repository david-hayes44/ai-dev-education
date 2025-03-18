import { useState, useRef } from 'react';
import Image from 'next/image';
import { UploadCloud, X, FileText, Image as ImageIcon } from 'lucide-react';
import { uploadFile } from '@/lib/supabase';

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileInfo(file);
    setError(null);

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

  const handleUpload = async () => {
    if (!fileInfo) return;

    try {
      setUploading(true);
      setProgress(0);
      setError(null);

      // Upload to specific folder per user
      const path = `users/${userId}/${fileInfo.name}`;
      
      // Handle progress updates
      const onProgressUpdate = (progress: number) => {
        setProgress(progress);
      };

      const result = await uploadFile("attachments", path, fileInfo, onProgressUpdate);
      if (result) {
        onFileUploaded({
          path: result.path || path,
          url: result.fullPath || `attachments/${path}`,
          name: fileInfo.name,
          size: fileInfo.size,
          type: fileInfo.type
        });
      }
      
      // Reset after successful upload
      resetUpload();
    } catch (err: unknown) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const resetUpload = () => {
    setFileInfo(null);
    setPreview(null);
    setProgress(0);
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
        <div className="mb-2 text-sm text-red-500 bg-red-50 p-2 rounded-md">
          {error}
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

          <div className="mt-3 flex justify-end">
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