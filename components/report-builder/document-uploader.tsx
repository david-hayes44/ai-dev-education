import { useState, useRef } from 'react';
import { UploadCloud, X, FileText, Image as ImageIcon, File, CheckCircle } from 'lucide-react';
import { UploadedDocument } from './types';

interface DocumentUploaderProps {
  onDocumentUploaded: (document: UploadedDocument) => void;
  onDocumentRemoved: (documentId: string) => void;
  uploadedDocuments: UploadedDocument[];
}

export default function DocumentUploader({ 
  onDocumentUploaded, 
  onDocumentRemoved,
  uploadedDocuments
}: DocumentUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [activeFiles, setActiveFiles] = useState<File[]>([]);
  const [currentFileIndex, setCurrentFileIndex] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File types we accept
  const acceptedFileTypes = "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/csv,application/json,text/markdown,text/html,image/*";
  
  // File size limit (50MB)
  const MAX_FILE_SIZE = 50 * 1024 * 1024;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const filesArray = Array.from(e.target.files);
    setActiveFiles(filesArray);
    setCurrentFileIndex(0);
    setError(null);
    
    // Begin processing the first file
    processFiles(filesArray);
  };
  
  // Handle file drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files);
      setActiveFiles(filesArray);
      setCurrentFileIndex(0);
      setError(null);
      processFiles(filesArray);
    }
  };
  
  // Prevent default behavior when file is dragged over
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  // Set dragging state when file enters the drop zone
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  // Remove dragging state when file leaves the drop zone
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const processFiles = async (files: File[]) => {
    if (files.length === 0) return;
    
    setUploading(true);
    setProgress(0);
    
    // Process files one at a time
    for (let i = 0; i < files.length; i++) {
      setCurrentFileIndex(i);
      const file = files[i];
      
      try {
        // Verify file size
        if (file.size > MAX_FILE_SIZE) {
          throw new Error(`File "${file.name}" exceeds the 50MB size limit.`);
        }
        
        // Update progress for the current file
        setProgress(0);
        
        // Simulate progress
        let currentProgress = 0;
        const progressInterval = setInterval(() => {
          currentProgress += 5;
          setProgress(Math.min(currentProgress, 90));
          if (currentProgress >= 90) clearInterval(progressInterval);
        }, 100);
        
        // Process the file depending on type
        let textContent = '';
        
        if (file.type.startsWith('image/')) {
          // For images, we'd normally use OCR on the server-side
          // Here we'll just make a placeholder
          textContent = `[Image content from ${file.name}]`;
        } else if (file.type === 'application/pdf') {
          // In a real app, we'd use a PDF parser on the server
          textContent = `[PDF content from ${file.name}]`;
        } else if (file.type.includes('word')) {
          // In a real app, we'd use a DOCX parser on the server
          textContent = `[Document content from ${file.name}]`;
        } else {
          // For text-based files, we can read them directly
          textContent = await file.text();
        }
        
        // Create a summary (in a real app, this would be done with AI)
        const summary = textContent.length > 100 
          ? textContent.substring(0, 100) + '...' 
          : textContent;
        
        // Clear the progress interval
        clearInterval(progressInterval);
        setProgress(100);
        
        // Create a URL for the file (in a real app this would be a server URL or blob URL)
        const url = URL.createObjectURL(file);
        
        // Create a document ID
        const documentId = `doc-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        
        // Create the document object
        const document: UploadedDocument = {
          id: documentId,
          name: file.name,
          type: file.type,
          size: file.size,
          textContent,
          summary,
          url,
          timestamp: Date.now()
        };
        
        // Send it to the parent component
        onDocumentUploaded(document);
        
        // Short delay before processing next file for better UI feedback
        if (i < files.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } catch (err) {
        console.error(`Error processing file "${file.name}":`, err);
        setError(err instanceof Error ? err.message : `Failed to process file "${file.name}". Please try again.`);
        // Continue with the next file after error
      }
    }
    
    // Reset the form when all files are processed
    setActiveFiles([]);
    setUploading(false);
    setProgress(0);
    setCurrentFileIndex(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const triggerFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Render icon based on file type
  const getDocumentIcon = (type: string) => {
    if (type.startsWith('image/')) {
      return <ImageIcon className="h-8 w-8 text-blue-500" />;
    }
    if (type === 'application/pdf') {
      return <FileText className="h-8 w-8 text-red-500" />;
    }
    if (type.includes('word')) {
      return <FileText className="h-8 w-8 text-blue-700" />;
    }
    return <File className="h-8 w-8 text-gray-500" />;
  };

  return (
    <div className="document-uploader">
      {/* Display uploaded documents */}
      {uploadedDocuments.length > 0 && (
        <div className="mb-5">
          <div className="space-y-2">
            {uploadedDocuments.map(doc => (
              <div key={doc.id} className="flex items-center justify-between p-3 border rounded-md bg-white text-sm hover:bg-slate-50 transition-colors">
                <div className="flex items-center space-x-3 overflow-hidden">
                  {getDocumentIcon(doc.type)}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate">{doc.name}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-2">
                      <span>{formatFileSize(doc.size)}</span>
                      <span className="inline-flex items-center text-green-600">
                        <CheckCircle className="h-3 w-3 mr-1" /> Processed
                      </span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onDocumentRemoved(doc.id)}
                  className="ml-2 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200"
                  aria-label="Remove document"
                  title="Remove document"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Current upload progress */}
      {activeFiles.length > 0 && (
        <div className="mb-4 p-4 border rounded-md bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getDocumentIcon(activeFiles[currentFileIndex].type)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">
                  {activeFiles[currentFileIndex].name}
                </p>
                <p className="text-xs text-slate-500">
                  {formatFileSize(activeFiles[currentFileIndex].size)} 
                  {activeFiles.length > 1 && ` • File ${currentFileIndex + 1} of ${activeFiles.length}`}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setActiveFiles([]);
                setUploading(false);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200"
              disabled={uploading}
              title="Cancel upload"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {uploading && (
            <div className="mt-3">
              <div className="w-full bg-slate-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-1.5">
                <p className="text-xs text-slate-500">Processing: {progress}%</p>
                <p className="text-xs text-slate-500">
                  {progress < 100 ? 'Analyzing document...' : 'Complete!'}
                </p>
              </div>
            </div>
          )}

          {error && (
            <p className="mt-2 text-xs text-red-500 bg-red-50 p-2 rounded">{error}</p>
          )}
        </div>
      )}
      
      {/* Upload button with drag and drop */}
      {activeFiles.length === 0 && (
        <div 
          onClick={triggerFileUpload}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          className={`flex flex-col items-center justify-center w-full h-36 border-2 ${
            isDragging 
              ? 'border-blue-500 bg-blue-100' 
              : 'border-blue-300 bg-blue-50 hover:bg-blue-100'
          } border-dashed rounded-lg cursor-pointer transition-colors`}
        >
          <div className="flex flex-col items-center justify-center p-6">
            <UploadCloud className={`h-10 w-10 ${isDragging ? 'text-blue-600' : 'text-blue-500'} mb-3`} />
            <p className="mb-2 text-sm font-medium text-blue-600">
              <span className="font-bold">{isDragging ? 'Drop files here' : 'Click to upload'}</span>{!isDragging && ' or drag and drop'}
            </p>
            <p className="text-xs text-slate-500 text-center">
              Upload PDFs, Word documents, text files, images, or other file types to generate your report
            </p>
            <p className="text-xs text-slate-400 mt-2">
              Maximum file size: 50MB per file
            </p>
          </div>
          <input
            id="file-upload"
            type="file"
            className="hidden"
            onChange={handleFileChange}
            ref={fileInputRef}
            accept={acceptedFileTypes}
            multiple
          />
        </div>
      )}
    </div>
  );
} 