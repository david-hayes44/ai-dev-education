"use client"

import React, { useState } from "react"
import { Message, FileAttachment } from "@/lib/chat-service"
import { Avatar } from "@/components/ui/avatar"
import { User, Bot, Paperclip, X, Download } from "lucide-react"
import { cn } from "@/lib/utils"
import ReactMarkdown from "react-markdown"
import FileAttachmentComponent from "./FileAttachment"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

export interface ChatMessageProps {
  message: Message
  className?: string
}

export default function ChatMessage({ message, className }: ChatMessageProps) {
  const isUser = message.role === "user"
  const isLoading = message.metadata?.type === "loading"
  const isError = message.metadata?.type === "error"
  const isStreaming = message.isStreaming
  const hasAttachments = message.attachments && message.attachments.length > 0
  const [selectedAttachment, setSelectedAttachment] = useState<FileAttachment | null>(null)

  // Function to extract attachment references from markdown content
  const extractAttachmentRefs = (content: string): {
    text: string,
    attachments: { name: string, type: string }[]
  } => {
    const attachmentRegex = /\[Attachment: (.+) \((.+)\)\]/g;
    const attachments: { name: string, type: string }[] = [];
    let match;
    
    // Find all attachment references
    while ((match = attachmentRegex.exec(content)) !== null) {
      attachments.push({
        name: match[1],
        type: match[2]
      });
    }
    
    // Remove attachment references from text
    const cleanedText = content.replace(/\n\n\[Attachment:.+\]/g, '');
    
    return {
      text: cleanedText,
      attachments
    };
  };
  
  // Process content for attachment references (temporary approach)
  const { text, attachments } = extractAttachmentRefs(message.content);
  const displayAttachments = message.attachments || 
    (attachments.length > 0 ? attachments.map((a, i) => ({
      id: `extracted-${i}`,
      name: a.name,
      type: a.type,
      url: '#',
      path: '',
      size: 0,
    })) : []);
    
  const handleAttachmentClick = (attachment: FileAttachment) => {
    // If it's a real attachment with URL, open it
    if (attachment.url && attachment.url !== '#') {
      // Check if it's a data URL (local attachment)
      if (attachment.url.startsWith('data:')) {
        // For data URLs (local attachments), show in the modal
        setSelectedAttachment(attachment);
      } else if (attachment.type.startsWith('image/')) {
        // For remote images, show in the modal
        setSelectedAttachment(attachment);
      } else {
        // For other files, open in a new tab
        window.open(attachment.url, '_blank');
      }
    }
  };

  return (
    <>
      <div
        className={cn(
          "flex gap-3 p-4",
          isUser ? "bg-muted/50" : "bg-background",
          className
        )}
      >
        <Avatar className={cn("h-8 w-8", isUser ? "bg-primary" : "bg-muted")}>
          {isUser ? (
            <User className="h-4 w-4 text-primary-foreground" />
          ) : (
            <Bot className="h-4 w-4" />
          )}
        </Avatar>

        <div className="flex-1 space-y-2">
          <div className="text-sm font-medium flex items-center gap-2">
            {isUser ? "You" : "AI Tutor"}
            {isStreaming && (
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-primary/10 text-primary animate-pulse">
                Streaming...
              </span>
            )}
            {displayAttachments.length > 0 && (
              <span className="text-xs flex items-center gap-1 text-muted-foreground">
                <Paperclip className="h-3 w-3" />
                {displayAttachments.length} attachment{displayAttachments.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
          
          <div className="chat-message-content">
            {isLoading ? (
              <div className="flex items-center space-x-1">
                <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground delay-0" />
                <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground delay-150" />
                <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground delay-300" />
              </div>
            ) : isError ? (
              <div className="text-destructive">{message.content}</div>
            ) : (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown
                  components={{
                    pre: ({ node, ...props }) => (
                      <div className="overflow-auto rounded-md border my-2 bg-muted p-2">
                        <pre {...props} />
                      </div>
                    ),
                    code: ({ node, className, children, ...props }) => (
                      <code className={cn("rounded-md px-1 py-0.5 bg-muted", className)} {...props}>
                        {children}
                      </code>
                    ),
                  }}
                >
                  {text}
                </ReactMarkdown>
                {isStreaming && (
                  <div className="mt-1 inline-flex h-3 w-3 animate-pulse rounded-full bg-primary/40"></div>
                )}
                
                {/* Display attachments */}
                {displayAttachments.length > 0 && (
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {displayAttachments.map((attachment) => (
                      <div 
                        key={attachment.id} 
                        className="max-w-[280px] cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => handleAttachmentClick(attachment)}
                      >
                        {attachment.url !== '#' ? (
                          <FileAttachmentComponent
                            file={{
                              url: attachment.url,
                              name: attachment.name,
                              type: attachment.type,
                              size: attachment.size
                            }}
                            onDownload={() => handleAttachmentClick(attachment)}
                          />
                        ) : (
                          <div 
                            className="border rounded-md p-2 bg-muted/20 flex items-center gap-2 text-xs"
                          >
                            <Paperclip className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="font-medium truncate max-w-[150px]">
                              {attachment.name}
                            </span>
                            <span className="text-muted-foreground">
                              ({attachment.type.split('/').pop()})
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Image preview dialog */}
      <Dialog open={selectedAttachment !== null} onOpenChange={(open) => !open && setSelectedAttachment(null)}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader className="flex justify-between items-center">
            <DialogTitle className="text-base">{selectedAttachment?.name}</DialogTitle>
            <button onClick={() => setSelectedAttachment(null)}>
              <X className="h-4 w-4" />
            </button>
          </DialogHeader>
          {selectedAttachment?.type.startsWith('image/') && (
            <div className="flex justify-center items-center p-4">
              <img 
                src={selectedAttachment.url} 
                alt={selectedAttachment.name}
                className="max-h-[70vh] max-w-full object-contain"
              />
            </div>
          )}
          <div className="flex justify-end">
            <a 
              href={selectedAttachment?.url} 
              download={selectedAttachment?.name}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <Download className="h-3.5 w-3.5" />
              Download Original
            </a>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

// For backwards compatibility with existing imports
export { ChatMessage } 