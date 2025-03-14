"use client"

import * as React from "react"
import { useChat } from "@/contexts/chat-context"
import { ChatInput } from "@/components/chat/chat-input"
import { ChatMessage } from "@/components/chat/chat-message"
import { Loader2, Info } from "lucide-react"
import { FileAttachment } from "@/lib/chat-service"

export function ChatContainer() {
  const { currentSession, isLoading, isStreaming, sendStreamingMessage } = useChat()
  const chatEndRef = React.useRef<HTMLDivElement>(null)
  const messagesContainerRef = React.useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = React.useState(false)

  // Set mounted state after hydration
  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Prevent scroll events from propagating to parent elements
  React.useEffect(() => {
    const messagesContainer = messagesContainerRef.current;
    if (!messagesContainer) return;

    const handleWheel = (e: WheelEvent) => {
      const { deltaY, currentTarget } = e;
      const container = currentTarget as HTMLDivElement;
      const { scrollTop, scrollHeight, clientHeight } = container;

      // Check if scroll should be handled by the container
      if (
        (deltaY > 0 && scrollTop + clientHeight < scrollHeight) || // Scrolling down and not at bottom
        (deltaY < 0 && scrollTop > 0) // Scrolling up and not at top
      ) {
        e.stopPropagation();
      }
    };

    messagesContainer.addEventListener('wheel', handleWheel);
    return () => messagesContainer.removeEventListener('wheel', handleWheel);
  }, [mounted]);

  const scrollToBottom = (behavior: "auto" | "smooth" = "smooth") => {
    if (messagesContainerRef.current) {
      const { scrollHeight, clientHeight } = messagesContainerRef.current;
      const maxScrollTop = scrollHeight - clientHeight;
      messagesContainerRef.current.scrollTo({
        top: maxScrollTop,
        behavior,
      });
    }
  }

  React.useEffect(() => {
    if (mounted && currentSession?.messages) {
      scrollToBottom("auto")
    }
  }, [mounted, currentSession?.messages])

  const handleSubmit = async (content: string, attachments?: FileAttachment[]) => {
    // Use streaming message by default
    await sendStreamingMessage(content, attachments)
    scrollToBottom()
  }

  // Return a simpler loading state during SSR and hydration
  if (!mounted) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Loading chat...</p>
      </div>
    )
  }

  if (!currentSession) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Loading chat...</p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col rounded-lg bg-background">
      <div className="p-5 border-b flex flex-col gap-1.5">
        <h2 className="text-lg font-semibold">{currentSession.title}</h2>
        <p className="text-sm text-muted-foreground flex items-center gap-1.5">
          <Info className="h-4 w-4" />
          Ask questions about AI-Dev and MCP concepts
        </p>
      </div>
      
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent will-change-scroll"
      >
        {currentSession.messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center p-8 text-center">
            <div className="rounded-full bg-primary/10 p-3 mb-4">
              <Info className="h-6 w-6 text-primary" />
            </div>
            <p className="mb-1 font-medium">No messages yet</p>
            <p className="text-sm text-muted-foreground">
              Start a conversation with the AI assistant to learn about AI-Dev and MCP.
            </p>
          </div>
        ) : (
          currentSession.messages.map((message, index) => {
            // Skip system messages
            if (message.role === "system") return null
            
            return (
              <ChatMessage 
                key={message.id}
                type={message.role === "user" ? "user" : "assistant"}
                content={message.content}
                metadata={message.metadata}
                attachments={message.attachments}
              />
            )
          })
        )}
        
        {isStreaming && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}
        
        <div ref={chatEndRef} />
      </div>
      
      <ChatInput 
        onSubmit={handleSubmit}
        isLoading={isLoading}
        isStreaming={isStreaming}
      />
    </div>
  )
} 