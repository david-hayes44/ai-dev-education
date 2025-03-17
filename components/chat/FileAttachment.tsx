import Image from 'next/image';
import { FileText, Download, Image as ImageIcon } from 'lucide-react';

interface FileAttachmentProps {
  file: {
    url: string;
    name: string;
    type: string;
    size?: number;
  };
  onDownload?: () => void;
}

export default function FileAttachment({ file, onDownload }: FileAttachmentProps) {
  const isImage = file.type.startsWith('image/');
  
  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const handleDownload = () => {
    // Use the callback if provided, otherwise open URL directly
    if (onDownload) {
      onDownload();
    } else {
      window.open(file.url, '_blank');
    }
  };
  
  return (
    <div className="max-w-xs sm:max-w-sm md:max-w-md border rounded-lg overflow-hidden bg-white shadow-sm">
      {isImage ? (
        <div className="relative w-full" style={{ height: '200px' }}>
          <Image 
            src={file.url} 
            alt={file.name || 'Image attachment'} 
            fill
            className="object-cover"
          />
        </div>
      ) : (
        <div className="py-4 px-3 flex items-center">
          <div className="bg-gray-100 p-3 rounded-lg mr-3">
            <FileText className="h-6 w-6 text-gray-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {file.name || 'File attachment'}
            </p>
            {file.size && <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>}
          </div>
        </div>
      )}
      
      <div className="px-3 py-2 bg-gray-50 flex justify-between items-center">
        <span className="text-xs text-gray-500 truncate">
          {file.name || (isImage ? 'Image' : 'File')}
        </span>
        
        <button
          onClick={handleDownload}
          className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          <Download className="h-3.5 w-3.5" />
          {isImage ? 'View' : 'Download'}
        </button>
      </div>
    </div>
  );
} 