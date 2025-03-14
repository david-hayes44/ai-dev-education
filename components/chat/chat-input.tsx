"use client"

import * as React from "react"
import { Send, Paperclip, X, Upload, AlertCircle, Beaker } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { FileAttachment } from "@/lib/chat-service"
import { useChat } from "@/contexts/chat-context"
import { 
  validateFile, 
  uploadFile,
  ALLOWED_FILE_TYPES,
  ALLOWED_EXTENSIONS,
  MAX_FILE_SIZE,
  getFirebaseStorageConfig
} from "@/lib/file-storage-service"
import { 
  Alert,
  AlertTitle,
  AlertDescription
} from "@/components/ui/alert"
import { ref } from "firebase/storage"
import { getApps } from "firebase/app"

interface ChatInputProps {
  onSubmit: (content: string, attachments?: FileAttachment[]) => Promise<void>
  isLoading: boolean
  isStreaming?: boolean
  placeholder?: string
  className?: string
}

export function ChatInput({
  onSubmit,
  isLoading,
  isStreaming = false,
  placeholder = "Ask about AI development or MCP...",
  className,
}: ChatInputProps) {
  const { currentSession } = useChat()
  const [content, setContent] = React.useState("")
  const [attachments, setAttachments] = React.useState<FileAttachment[]>([])
  const [error, setError] = React.useState<string | null>(null)
  const [isDragging, setIsDragging] = React.useState(false)
  const [isUploading, setIsUploading] = React.useState(false)
  const [uploadProgress, setUploadProgress] = React.useState<Record<string, number>>({})
  const [dragCounter, setDragCounter] = React.useState(0)
  const [showTestButtons, setShowTestButtons] = React.useState(false)
  
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const dropZoneRef = React.useRef<HTMLDivElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if ((!content.trim() && attachments.length === 0) || isLoading || isStreaming || isUploading) return
    
    try {
      await onSubmit(content.trim(), attachments.length > 0 ? attachments : undefined)
      setContent("")
      setAttachments([])
      
      // Focus the textarea after submission
      setTimeout(() => {
        textareaRef.current?.focus()
      }, 0)
    } catch (error) {
      console.error("Error submitting chat:", error)
    }
  }

  // Handle CMD+Enter or Ctrl+Enter to submit
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      handleSubmit(e)
    }
  }

  // Auto-resize the textarea based on content
  React.useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = "auto"
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`
    }
  }, [content])

  // Process files (both from file input and drag & drop)
  const processFiles = async (files: FileList | File[]) => {
    if (!currentSession) {
      setError("No active session found");
      return;
    }
    
    setError(null);
    setIsUploading(true);
    
    // Debug Firebase configuration
    try {
      const config = getFirebaseStorageConfig();
      console.log("Firebase config check:", config.isConfigured 
        ? "Firebase appears to be configured" 
        : "Firebase configuration is incomplete");
      
      if (!config.isConfigured) {
        setError("Firebase storage is not properly configured. Check your .env.local file for required Firebase variables.");
        setIsUploading(false);
        return;
      }
      
      // Add this additional debug info
      console.log("Storage bucket:", process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET);
      console.log("Using Firebase App:", getApps().length > 0 ? "Yes" : "No");
      
      // Try a direct Firebase storage connectivity test
      import('@/lib/firebase').then(({ storage }) => {
        if (storage) {
          console.log("Firebase storage object successfully imported");
          
          // Test if we can access the storage object
          try {
            const testRef = ref(storage, 'test-connectivity.txt');
            console.log("Storage reference created successfully:", testRef.fullPath);
          } catch (e) {
            console.error("Error creating storage reference:", e);
            setError(`Error creating storage reference: ${e instanceof Error ? e.message : String(e)}`);
          }
        } else {
          console.error("Storage object is undefined");
          setError("Firebase storage object is undefined - initialization likely failed");
        }
      }).catch(err => {
        console.error("Error importing Firebase modules:", err);
        setError(`Error importing Firebase modules: ${err.message}`);
      });
    } catch (e) {
      console.error("Error checking Firebase config:", e);
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
    
    // Upload all files to Firebase Storage
    const uploadPromises = filesToProcess.map(async (file, index) => {
      const tempId = Object.keys(newProgress)[index];
      
      try {
        console.log(`Starting upload for file: ${file.name}`);
        // Upload file to Firebase Storage
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
    const results = await Promise.all(uploadPromises);
    
    // Filter out null results (failed uploads)
    const successfulUploads = results.filter(item => item !== null) as FileAttachment[];
    
    // Add new attachments to the list
    setAttachments(prev => [...prev, ...successfulUploads]);
    setIsUploading(false);
    setUploadProgress({});
  }

  // Handle file upload from input
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    
    processFiles(files)
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Improved drag and drop handlers using a counter approach
  const handleDragIn = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setDragCounter(prev => prev + 1);
    
    if (e.dataTransfer?.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };
  
  const handleDragOut = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setDragCounter(prev => prev - 1);
    
    if (dragCounter <= 1) {
      setIsDragging(false);
    }
  };
  
  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setDragCounter(0);
    setIsDragging(false);
    
    if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  // Setup drag and drop handlers
  React.useEffect(() => {
    const dropZone = dropZoneRef.current;
    if (!dropZone) return;
    
    dropZone.addEventListener('dragenter', handleDragIn);
    dropZone.addEventListener('dragleave', handleDragOut);
    dropZone.addEventListener('dragover', handleDragOver);
    dropZone.addEventListener('drop', handleDrop);
    
    return () => {
      dropZone.removeEventListener('dragenter', handleDragIn);
      dropZone.removeEventListener('dragleave', handleDragOut);
      dropZone.removeEventListener('dragover', handleDragOver);
      dropZone.removeEventListener('drop', handleDrop);
    };
  }, [dragCounter, currentSession]);

  // Remove an attachment
  const removeAttachment = (id: string) => {
    setAttachments(prev => {
      const attachment = prev.find(a => a.id === id)
      
      // If the attachment has a storage reference, we should also delete it from Firebase
      if (attachment?.storageRef) {
        import('@/lib/file-storage-service').then(({ deleteFile }) => {
          deleteFile(attachment.storageRef!).catch(error => {
            console.error("Error deleting file from storage:", error)
          })
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
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  // Mock file upload test function
  const handleTestUpload = (fileType: 'markdown' | 'image' | 'pdf' | 'csv') => {
    if (!currentSession) {
      setError("No active session found");
      return;
    }
    
    let testFile: File;
    
    switch (fileType) {
      case 'markdown':
        testFile = new File(
          ['# Test Markdown File\n\nThis is a test file created for testing the file upload functionality.\n\n- Item 1\n- Item 2'],
          'test-file.md', 
          { type: 'text/markdown' }
        );
        break;
      case 'image':
        // Create a simple 1x1 transparent PNG
        const base64Data = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFdwI3KkTLlQAAAABJRU5ErkJggg==';
        const byteCharacters = atob(base64Data);
        const byteArrays = [];
        for (let i = 0; i < byteCharacters.length; i++) {
          byteArrays.push(byteCharacters.charCodeAt(i));
        }
        const byteArray = new Uint8Array(byteArrays);
        testFile = new File([byteArray], 'test-image.png', { type: 'image/png' });
        break;
      case 'pdf':
        // Simple PDF (not actually valid, but works for testing MIME type)
        testFile = new File(['%PDF-1.4 test PDF content'], 'test-document.pdf', { type: 'application/pdf' });
        break;
      case 'csv':
        testFile = new File(['id,name,email\n1,Test User,test@example.com'], 'test-data.csv', { type: 'text/csv' });
        break;
      default:
        testFile = new File(['Test content'], 'test.txt', { type: 'text/plain' });
    }
    
    processFiles([testFile]);
  };

  // Toggle test mode
  const toggleTestMode = () => {
    setShowTestButtons(!showTestButtons);
  };

  return (
    <div className="border-t bg-background p-0">
      {/* Error alert */}
      {error && (
        <div className="px-4 pt-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}
      
      {/* Test buttons for development */}
      {showTestButtons && (
        <div className="px-4 pt-3 flex flex-wrap gap-2">
          <div className="w-full flex items-center gap-1 mb-1">
            <Beaker className="h-4 w-4 text-amber-500" />
            <span className="text-xs font-medium text-muted-foreground">Test Mode - Upload Mock Files</span>
          </div>
          <Button 
            size="sm" 
            variant="outline" 
            className="text-xs h-8"
            onClick={() => handleTestUpload('markdown')}
            disabled={isLoading || isStreaming || isUploading}
          >
            Test MD File
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="text-xs h-8"
            onClick={() => handleTestUpload('image')}
            disabled={isLoading || isStreaming || isUploading}
          >
            Test Image
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="text-xs h-8"
            onClick={() => handleTestUpload('pdf')}
            disabled={isLoading || isStreaming || isUploading}
          >
            Test PDF
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="text-xs h-8"
            onClick={() => handleTestUpload('csv')}
            disabled={isLoading || isStreaming || isUploading}
          >
            Test CSV
          </Button>
          
          {/* Debug button */}
          <Button 
            size="sm" 
            variant="destructive" 
            className="text-xs h-8 mt-2"
            onClick={() => {
              try {
                const config = getFirebaseStorageConfig();
                setError(`Firebase config: ${JSON.stringify(config)}`);
                
                // Try to access the Firebase app
                import('@/lib/firebase').then(({ storage }) => {
                  if (storage) {
                    setError(`Firebase storage initialized. Configuration appears valid, but uploads may still fail if credentials are invalid.`);
                  } else {
                    setError(`Firebase storage object is undefined. Check your Firebase initialization.`);
                  }
                }).catch(err => {
                  setError(`Error importing Firebase modules: ${err.message}`);
                });
              } catch (e) {
                const error = e as Error;
                setError(`Error checking Firebase config: ${error.message}`);
              }
            }}
          >
            Debug Firebase
          </Button>
        </div>
      )}
      
      {/* Drag & drop zone */}
      <div 
        ref={dropZoneRef}
        className={cn(
          "transition-all duration-200",
          isDragging && "bg-primary/10 border-2 border-dashed border-primary/50 rounded-lg m-4"
        )}
      >
        {/* Drag overlay with instructions */}
        {isDragging && (
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <Upload className="h-8 w-8 mb-2 text-primary" />
            <h3 className="text-lg font-medium">Drop files here</h3>
            <p className="text-sm text-muted-foreground">
              Allowed file types: {formatAllowedFileTypes()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Maximum file size: {formatFileSize(MAX_FILE_SIZE)}
            </p>
          </div>
        )}
      
        {/* Attachment preview area */}
        {attachments.length > 0 && (
          <div className="px-4 py-2 flex flex-wrap gap-2">
            {attachments.map(attachment => (
              <div key={attachment.id} className="relative flex items-center border rounded-md p-2 pr-8 bg-muted/30">
                {attachment.thumbnailUrl ? (
                  <img 
                    src={attachment.thumbnailUrl} 
                    alt={attachment.name} 
                    className="h-8 w-8 object-cover mr-2 rounded"
                  />
                ) : (
                  <div className="h-8 w-8 flex items-center justify-center bg-primary/10 text-primary rounded mr-2">
                    <Paperclip className="h-4 w-4" />
                  </div>
                )}
                <div className="text-sm truncate max-w-[150px]">{attachment.name}</div>
                <button 
                  type="button"
                  onClick={() => removeAttachment(attachment.id)}
                  className="absolute right-1 top-1 h-6 w-6 rounded-full bg-muted hover:bg-muted-foreground/20 flex items-center justify-center"
                  aria-label="Remove attachment"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        
        {/* Upload progress indicators */}
        {isUploading && Object.keys(uploadProgress).length > 0 && (
          <div className="px-4 py-2">
            {Object.entries(uploadProgress).map(([id, progress]) => (
              <div key={id} className="mb-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>Uploading...</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5">
                  <div 
                    className="bg-primary h-1.5 rounded-full" 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <form
          onSubmit={handleSubmit}
          className={cn("flex flex-col gap-2 px-4 pb-4", className)}
        >
          <div className="relative">
            <Textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="min-h-[80px] max-h-[200px] resize-none bg-background pr-14 py-4 text-base rounded-xl border-muted"
              disabled={isLoading || isStreaming || isUploading}
            />
            <div className="absolute right-2 bottom-2 flex gap-2">
              {/* Test mode button - only visible in development */}
              {process.env.NODE_ENV === 'development' && (
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={toggleTestMode}
                  className="h-10 w-10 rounded-full opacity-70 hover:opacity-100"
                  title="Toggle test mode"
                >
                  <Beaker className={cn("h-5 w-5", showTestButtons ? "text-amber-500" : "")} />
                  <span className="sr-only">Test Mode</span>
                </Button>
              )}
              
              {/* File attachment button */}
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-10 w-10 rounded-full opacity-70 hover:opacity-100"
                disabled={isLoading || isStreaming || isUploading}
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip className="h-5 w-5" />
                <span className="sr-only">Add attachment</span>
              </Button>
              
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
                multiple
                accept={Object.keys(ALLOWED_FILE_TYPES).join(',') + ',.md'}
              />
              
              <Button
                type="submit"
                size="icon"
                disabled={(content.trim() === "" && attachments.length === 0) || isLoading || isStreaming || isUploading}
                className="h-10 w-10 shrink-0 rounded-full bg-primary"
              >
                <Send className="h-5 w-5" />
                <span className="sr-only">Send</span>
              </Button>
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground flex justify-between px-1">
            <span>
              {isLoading || isStreaming || isUploading ? 
                isUploading ? "Uploading files..." : "Processing..." : 
                "Press Ctrl+Enter to send • Drag & drop files"
              }
            </span>
            <span className={cn(
              "transition-opacity",
              content.length > 0 || attachments.length > 0 ? "opacity-100" : "opacity-0"
            )}>
              {content.length} characters {attachments.length > 0 && `• ${attachments.length} attachment${attachments.length !== 1 ? 's' : ''}`}
            </span>
          </div>
        </form>
      </div>
    </div>
  )
} 