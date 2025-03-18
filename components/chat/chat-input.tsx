"use client"

import * as React from "react"
import { Send, Paperclip, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { FileAttachment } from "@/lib/chat-service"
import FileUpload from "./FileUpload"

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
  const [content, setContent] = React.useState("")
  const [showFileUpload, setShowFileUpload] = React.useState(false)
  const [attachments, setAttachments] = React.useState<FileAttachment[]>([])
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if ((!content.trim() && attachments.length === 0) || isLoading || isStreaming) return
    
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

  const handleFileUploaded = (fileData: { path: string; url: string; name: string; size: number; type: string; }) => {
    // Convert to our FileAttachment type by adding an ID
    const attachment: FileAttachment = {
      ...fileData,
      id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    };
    setAttachments(prev => [...prev, attachment]);
    setShowFileUpload(false);
  }

  const removeAttachment = (attachmentId: string) => {
    setAttachments(prev => prev.filter(a => a.id !== attachmentId))
  }

  return (
    <div className="border-t bg-background p-0">
      {/* File attachment area */}
      {(showFileUpload || attachments.length > 0) && (
        <div className="px-4 py-2 border-b">
          {showFileUpload ? (
            <div className="mb-2">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium">Add attachment</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setShowFileUpload(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <FileUpload
                onFileUploaded={handleFileUploaded}
                userId="anonymous"
              />
            </div>
          ) : null}
          
          {attachments.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Attachments</h3>
              <div className="flex flex-wrap gap-2">
                {attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="relative flex items-center gap-2 border rounded-md p-2 bg-muted/50 max-w-[200px]"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{attachment.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {Math.round(attachment.size / 1024)} KB
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 opacity-70 hover:opacity-100"
                      onClick={() => removeAttachment(attachment.id)}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
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
            disabled={isLoading || isStreaming}
          />
          <div className="absolute right-2 bottom-2 flex gap-2">
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-10 w-10 rounded-full opacity-70 hover:opacity-100"
              disabled={isLoading || isStreaming}
              onClick={() => setShowFileUpload(!showFileUpload)}
            >
              <Paperclip className="h-5 w-5" />
              <span className="sr-only">Add attachment</span>
            </Button>
            
            <Button
              type="submit"
              size="icon"
              disabled={(content.trim() === "" && attachments.length === 0) || isLoading || isStreaming}
              className="h-10 w-10 shrink-0 rounded-full bg-primary"
            >
              <Send className="h-5 w-5" />
              <span className="sr-only">Send</span>
            </Button>
          </div>
        </div>
        
        <div className="text-xs text-muted-foreground flex justify-between px-1">
          <span>
            {isLoading || isStreaming ? 
              "Processing..." : 
              "Press Ctrl+Enter to send"
            }
          </span>
          <span className={cn(
            "transition-opacity",
            (content.length > 0 || attachments.length > 0) ? "opacity-100" : "opacity-0"
          )}>
            {attachments.length > 0 && `${attachments.length} attachment${attachments.length > 1 ? 's' : ''}`}
            {content.length > 0 && attachments.length > 0 && " • "}
            {content.length > 0 && `${content.length} characters`}
          </span>
        </div>
      </form>
    </div>
  )
} 