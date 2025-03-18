"use client"

import * as React from "react"
import { forwardRef, useImperativeHandle } from "react"
import { Send, Paperclip, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { FileAttachment } from "@/lib/chat-service"
import FileUpload from "./FileUpload"
import { useAuthContext } from '@/components/providers/auth-provider'

interface ChatInputProps {
  onSubmit: (content: string, attachments?: FileAttachment[]) => Promise<void>
  isLoading: boolean
  isStreaming?: boolean
  placeholder?: string
  className?: string
}

// Create the component first without export
const ChatInputComponent = forwardRef<HTMLTextAreaElement, ChatInputProps>(({
  onSubmit,
  isLoading,
  isStreaming = false,
  placeholder = "Ask about AI development or MCP...",
  className,
}, ref) => {
  const [content, setContent] = React.useState("")
  const [showFileUpload, setShowFileUpload] = React.useState(false)
  const [attachments, setAttachments] = React.useState<FileAttachment[]>([])
  // Use an internal ref and forward it
  const internalRef = React.useRef<HTMLTextAreaElement>(null)
  
  // Forward the internal ref to the parent component
  useImperativeHandle(ref, () => internalRef.current as HTMLTextAreaElement);
  
  const { user } = useAuthContext();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if ((!content.trim() && attachments.length === 0) || isLoading || isStreaming) return
    
    try {
      await onSubmit(content.trim(), attachments.length > 0 ? attachments : undefined)
      setContent("")
      setAttachments([])
      
      // Focus the textarea after submission
      setTimeout(() => {
        internalRef.current?.focus()
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
    const textarea = internalRef.current
    if (textarea) {
      textarea.style.height = "auto"
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`
    }
  }, [content])

  const handleFileUploaded = (fileData: {
    path: string;
    url: string;
    name: string;
    size: number;
    type: string;
  }) => {
    console.log('File uploaded:', fileData);
    
    if (!fileData.url) {
      console.error('File upload missing URL data');
      return;
    }
    
    // Create a new attachment from the uploaded file
    const attachment: FileAttachment = {
      id: `attachment-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      name: fileData.name,
      type: fileData.type,
      url: fileData.url,
      path: fileData.path,
      size: fileData.size
    };
    
    // Add to the existing file attachments
    setAttachments(prev => [...prev, attachment]);
    
    // Hide the file upload interface
    setShowFileUpload(false);
  };

  const removeAttachment = (attachmentId: string) => {
    setAttachments(prev => prev.filter(a => a.id !== attachmentId))
  }

  return (
    <div className={cn("rounded-lg border bg-card", className)}>
      {/* File upload UI */}
      {showFileUpload && (
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold">Add file</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowFileUpload(false)}
              aria-label="Close file upload"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <FileUpload 
            onFileUploaded={handleFileUploaded} 
            userId={user?.id || 'anonymous'}
          />
        </div>
      )}
      
      {/* Attachments list */}
      {attachments.length > 0 && (
        <div className="p-2 flex flex-wrap gap-2 border-b">
          {attachments.map(file => (
            <div 
              key={file.id} 
              className="flex items-center gap-1.5 py-0.5 pl-2 pr-1 rounded-full bg-muted text-xs max-w-[200px]"
            >
              <span className="truncate">{file.name}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 rounded-full"
                onClick={() => removeAttachment(file.id)}
                aria-label={`Remove ${file.name}`}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
      
      {/* Input area */}
      <form onSubmit={handleSubmit} className="flex items-end p-2 gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setShowFileUpload(!showFileUpload)}
          className="shrink-0"
          disabled={isLoading || isStreaming}
          aria-label="Attach file"
        >
          <Paperclip className="h-5 w-5" />
        </Button>
        <Textarea
          ref={internalRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isLoading || isStreaming}
          className="min-h-10 resize-none"
          rows={content.split("\n").length > 3 ? content.split("\n").length : 1}
        />
        <Button 
          type="submit" 
          size="icon" 
          disabled={isLoading || isStreaming || !content.trim()}
          aria-label="Send message"
        >
          <Send className="h-5 w-5" />
        </Button>
      </form>
    </div>
  )
})

// Set display name
ChatInputComponent.displayName = "ChatInput" 

// Export as a named export
export const ChatInput = ChatInputComponent 