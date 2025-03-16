'use client';

import { useState } from 'react';
import { Paperclip, X } from 'lucide-react';

export type FileAttachmentProps = {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  onRemove?: (id: string) => void;
}

export default function FileAttachmentItem({ 
  id, 
  name, 
  size, 
  type, 
  url, 
  onRemove 
}: FileAttachmentProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  const formattedSize = size < 1024 * 1024 
    ? `${Math.round(size / 1024)} KB` 
    : `${(size / (1024 * 1024)).toFixed(1)} MB`;
  
  const handleRemove = () => {
    if (onRemove) {
      setIsLoading(true);
      onRemove(id);
    }
  };
  
  return (
    <div className="flex items-center p-2 rounded-md border border-gray-200 bg-gray-50 mb-2">
      <Paperclip className="h-4 w-4 text-gray-500 mr-2" />
      <div className="flex-1 min-w-0">
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-blue-600 hover:underline text-sm font-medium truncate block"
        >
          {name}
        </a>
        <p className="text-xs text-gray-500">{formattedSize}</p>
      </div>
      {onRemove && (
        <button 
          onClick={handleRemove}
          className="ml-2 text-gray-500 hover:text-red-500"
          disabled={isLoading}
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
} 