import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ChatSession, FileAttachment } from '@/lib/chat-service'
import { Textarea } from '../ui/textarea'
import { Send, Loader2, Upload, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip'
import { validateFile } from '@/lib/supabase-storage-service' // Import from supabase service
import { uploadFile, deleteFile } from '@/lib/supabase-storage-service' // Import from supabase service
import { isSupabaseConfigured } from '@/lib/supabase' // Import Supabase config check
import { useToast } from '@/components/ui/use-toast'
import FileAttachmentItem from './file-attachment-item'

// Test this configuration to ensure it's defined properly
function getSupabaseStorageConfig() {
  return {
    isConfigured: isSupabaseConfigured(),
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  }
}

interface ChatInputProps {
  onSubmit: (content: string, attachments?: FileAttachment[]) => Promise<void>
  isLoading: boolean
  isStreaming?: boolean
  placeholder?: string
  className?: string
  currentSession?: ChatSession | null
}

export function ChatInputSupabase({
  onSubmit,
  isLoading,
  isStreaming = false,
  placeholder = "Ask about AI development or MCP...",
  className,
  currentSession
}: ChatInputProps) {
  const [content, setContent] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { toast } = useToast()
  const [attachments, setAttachments] = useState<FileAttachment[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
  const [isDragging, setIsDragging] = useState(false)
  const [dragCounter, setDragCounter] = useState(0)
  const [showTestMode, setShowTestMode] = useState(false)
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!content.trim() && attachments.length === 0) {
      toast({
        title: "Empty message",
        description: "Please enter a message or attach a file.",
        variant: "destructive"
      })
      return
    }
    
    if (isLoading || isStreaming) return
    
    const trimmedContent = content.trim()
    
    try {
      await onSubmit(trimmedContent, attachments.length > 0 ? attachments : undefined)
      setContent('')
      setAttachments([])
      textareaRef.current?.focus()
    } catch (error) {
      console.error('Error submitting message:', error)
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      })
    }
  }
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }
  
  // Process files (both from file input and drag & drop)
  const processFiles = async (files: FileList | File[]) => {
    if (!currentSession) {
      setError("No active session found");
      return;
    }
    
    setError(null);
    setIsUploading(true);
    
    // Debug Supabase configuration
    try {
      const config = getSupabaseStorageConfig();
      console.log("Supabase config check:", config.isConfigured 
        ? "Supabase appears to be configured" 
        : "Supabase configuration is incomplete");
      
      if (!config.isConfigured) {
        setError("Supabase storage is not properly configured. Check your .env.local file for required Supabase variables.");
        setIsUploading(false);
        return;
      }
      
      // Add this additional debug info
      console.log("Supabase URL:", config.url);
    } catch (e) {
      console.error("Error checking Supabase config:", e);
    }
    
    const filesToProcess = Array.from(files);
    const newProgress: Record<string, number> = {};
    
    for (const file of filesToProcess) {
      // Generate a temporary ID for tracking upload progress
      const tempId = Math.random().toString(36).substring(2, 9);
      newProgress[tempId] = 0;
      
      // Validate file type and size
      const validation = validateFile(file);
      
      if (!validation.valid && validation.error) {
        setError(`${validation.error.message} (File: ${file.name}, Type: ${file.type})`);
        setIsUploading(false);
        return;
      }
      
      console.log(`Preparing to upload: ${file.name}, Size: ${file.size} bytes, Type: ${file.type}`);
    }
    
    // Initialize progress tracking
    setUploadProgress(newProgress);
    
    // Upload all files to Supabase Storage
    const uploadPromises = filesToProcess.map(async (file, index) => {
      const tempId = Object.keys(newProgress)[index];
      
      try {
        console.log(`Starting upload for file: ${file.name}`);
        // Upload file to Supabase Storage
        const fileAttachment = await uploadFile(
          file,
          currentSession.id,
          (progress) => {
            setUploadProgress(prev => ({
              ...prev,
              [tempId]: progress
            }));
          },
          (error) => {
            console.error("Upload error:", error);
            setError(`Error uploading ${file.name}: ${error.message}`);
          }
        );
        
        console.log(`Successfully uploaded: ${file.name}`, fileAttachment);
        return fileAttachment;
      } catch (error) {
        console.error("Error processing file:", error);
        if (error instanceof Error) {
          setError(`Failed to upload ${file.name}: ${error.message}`);
        } else {
          setError(`Failed to upload ${file.name}: Unknown error`);
        }
        return null;
      }
    });
    
    // Wait for all uploads to complete
    try {
      const results = await Promise.all(uploadPromises);
      const successfulUploads = results.filter(Boolean) as FileAttachment[];
      
      if (successfulUploads.length > 0) {
        setAttachments(prev => [...prev, ...successfulUploads]);
        console.log(`Successfully uploaded ${successfulUploads.length} files`);
      } else {
        setError("All file uploads failed. Please try again.");
      }
    } catch (error) {
      console.error("Error uploading files:", error);
      setError("Failed to upload files. Please try again.");
    } finally {
      setIsUploading(false);
      setUploadProgress({});
    }
  };
  
  // Handle file input change
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };
  
  // Drag and drop event handlers
  const handleDragIn = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(prev => prev + 1);
    if (e.dataTransfer?.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);
  
  const handleDragOut = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(prev => prev - 1);
    if (dragCounter <= 1) {
      setIsDragging(false);
    }
  }, [dragCounter]);
  
  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);
  
  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setDragCounter(0);
    
    if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  }, [currentSession]);
  
  // Set up drag and drop event listeners
  useEffect(() => {
    const div = document.getElementById('chat-container');
    if (div) {
      div.addEventListener('dragenter', handleDragIn);
      div.addEventListener('dragleave', handleDragOut);
      div.addEventListener('dragover', handleDragOver);
      div.addEventListener('drop', handleDrop);
      
      return () => {
        div.removeEventListener('dragenter', handleDragIn);
        div.removeEventListener('dragleave', handleDragOut);
        div.removeEventListener('dragover', handleDragOver);
        div.removeEventListener('drop', handleDrop);
      };
    }
  }, [handleDragIn, handleDragOut, handleDragOver, handleDrop]);
  
  // Remove an attachment
  const removeAttachment = (id: string) => {
    setAttachments(prev => {
      const attachment = prev.find(a => a.id === id)
      
      // If the attachment has a storage reference, we should also delete it from Supabase
      if (attachment?.storageRef) {
        deleteFile(attachment.storageRef).catch(error => {
          console.error("Error deleting file from storage:", error)
        })
      }
      
      return prev.filter(a => a.id !== id)
    })
  }
  
  // Format allowed file types for display
  const formatAllowedFileTypes = (): string => {
    const categories = {
      'Documents': ['doc', 'docx', 'md', 'txt', 'pdf'],
      'Spreadsheets': ['xls', 'xlsx', 'csv'],
      'Images': ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']
    }
    
    return Object.entries(categories)
      .map(([category, extensions]) => `${category} (${extensions.join(', ')})`)
      .join(', ')
  }
  
  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    return bytes < 1024 * 1024
      ? `${(bytes / 1024).toFixed(1)} KB`
      : `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }
  
  return (
    <div className={cn("relative mt-auto", className)}>
      {/* Drag overlay */}
      {isDragging && (
        <div className="absolute inset-0 flex items-center justify-center bg-secondary/80 backdrop-blur-sm z-10 rounded-md border-2 border-dashed border-primary">
          <div className="text-center">
            <Upload className="mx-auto h-12 w-12 text-primary" />
            <p className="mt-2 text-lg font-medium">Drop files to upload</p>
            <p className="text-sm text-muted-foreground mt-1">
              Allowed: {formatAllowedFileTypes()}
            </p>
          </div>
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="mb-2 p-3 bg-destructive/15 rounded-md text-destructive text-sm">
          <div className="flex items-start gap-2">
            <X className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Error</p>
              <p>{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Attachments */}
      {attachments.length > 0 && (
        <div className="mb-2 p-3 bg-muted rounded-md">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-sm font-medium">Attachments</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {attachments.map(file => (
              <FileAttachmentItem
                key={file.id}
                id={file.id}
                name={file.name}
                size={file.size}
                type={file.type}
                url={file.url}
                onRemove={() => removeAttachment(file.id)}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Upload progress */}
      {isUploading && Object.keys(uploadProgress).length > 0 && (
        <div className="mb-2 p-3 bg-muted rounded-md">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-sm font-medium">Uploading files...</h4>
          </div>
          {Object.entries(uploadProgress).map(([id, progress]) => (
            <div key={id} className="w-full mb-1 last:mb-0">
              <div className="h-1.5 w-full bg-muted-foreground/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300 ease-in-out" 
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Input form */}
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <Textarea
          ref={textareaRef}
          tabIndex={0}
          placeholder={placeholder}
          value={content}
          onChange={e => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          className="min-h-[60px] w-full resize-none rounded-md border border-input bg-background px-3 py-2 pr-20 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isLoading || isStreaming}
        />
        
        {/* File upload button */}
        <div className="absolute right-14 flex items-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  disabled={isLoading || isStreaming || isUploading || !currentSession}
                  className={cn(
                    "h-8 w-8 rounded-full",
                    !currentSession && "cursor-not-allowed opacity-50"
                  )}
                  onClick={() => {
                    const fileInput = document.getElementById('file-upload') as HTMLInputElement
                    if (fileInput) fileInput.click()
                  }}
                >
                  <Upload className="h-5 w-5" />
                  <span className="sr-only">Upload file</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Upload file (max 10MB)</p>
                <p className="text-xs text-muted-foreground">
                  {formatAllowedFileTypes()}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <input
            id="file-upload"
            type="file"
            className="hidden"
            onChange={handleFileUpload}
            disabled={isLoading || isStreaming || isUploading || !currentSession}
            multiple
          />
        </div>
        
        {/* Submit button */}
        <div className="absolute right-1">
          <Button
            type="submit" 
            size="icon"
            disabled={
              isLoading || 
              isStreaming || 
              (content.trim().length === 0 && attachments.length === 0)
            }
            className="h-8 w-8 rounded-full"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            <span className="sr-only">Send message</span>
          </Button>
        </div>
      </form>
    </div>
  )
} 