"use client"

import * as React from "react"
import { Send, PaperclipIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

interface ChatInputProps {
  onSubmit: (content: string) => Promise<void>
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
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!content.trim() || isLoading || isStreaming) return
    
    try {
      await onSubmit(content.trim())
      setContent("")
      
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

  return (
    <div className="border-t bg-background p-0">
      {/* Future attachment preview area */}
      <div className="px-4 py-2">
        {/* This will be populated with file previews in the future */}
      </div>
      
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
            {/* Placeholder for future attachment button */}
            {/*
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-10 w-10 rounded-full opacity-70 hover:opacity-100"
              disabled={isLoading || isStreaming}
            >
              <PaperclipIcon className="h-5 w-5" />
              <span className="sr-only">Add attachment</span>
            </Button>
            */}
            
            <Button
              type="submit"
              size="icon"
              disabled={!content.trim() || isLoading || isStreaming}
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
            content.length > 0 ? "opacity-100" : "opacity-0"
          )}>
            {content.length} characters
          </span>
        </div>
      </form>
    </div>
  )
} 