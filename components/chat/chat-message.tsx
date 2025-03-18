"use client"

import React from "react"
import { Message } from "@/lib/chat-service"
import { Avatar } from "@/components/ui/avatar"
import { User, Bot } from "lucide-react"
import { cn } from "@/lib/utils"
import ReactMarkdown from "react-markdown"

export interface ChatMessageProps {
  message: Message
  className?: string
}

export default function ChatMessage({ message, className }: ChatMessageProps) {
  const isUser = message.role === "user"
  const isLoading = message.metadata?.type === "loading"
  const isError = message.metadata?.type === "error"

  return (
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
        <div className="text-sm font-medium">
          {isUser ? "You" : "AI Tutor"}
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
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// For backwards compatibility with existing imports
export { ChatMessage } 