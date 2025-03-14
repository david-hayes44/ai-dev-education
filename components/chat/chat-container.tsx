"use client"

import * as React from "react"
import { useChat } from "@/contexts/chat-context"
import { ChatInput } from "@/components/chat/chat-input"
import { ChatMessage } from "@/components/chat/chat-message"
import { Loader2, Info } from "lucide-react"

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

  const handleSubmit = async (content: string) => {
    // Use streaming message by default
    await sendStreamingMessage(content)
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
            <h3 className="mb-2 text-lg font-medium">How can I help you today?</h3>
            <p className="max-w-sm text-sm text-muted-foreground">
              Ask me about AI development, MCP concepts, or navigate to specific sections of the site.
            </p>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-border">
            {currentSession.messages.map((message) => {
              // Skip the system message
              if (message.role === "system") return null;
              
              // If message is streaming, show typing indicator
              if (message.isStreaming && message.role === "assistant") {
                return (
                  <div key={message.id} className="flex gap-2 bg-accent/10">
                    <ChatMessage
                      key={message.id}
                      type="assistant"
                      content={message.content}
                      metadata={message.metadata}
                    />
                    {mounted && (
                      <div className="typing-indicator flex items-end pb-2 pr-4">
                        <div className="dot"></div>
                        <div className="dot"></div>
                        <div className="dot"></div>
                      </div>
                    )}
                  </div>
                );
              }
              
              return (
                <ChatMessage
                  key={message.id}
                  type={message.role === "user" ? "user" : "assistant"}
                  content={message.content}
                  metadata={message.metadata}
                />
              );
            })}
            <div ref={chatEndRef} className="h-4" />
          </div>
        )}
      </div>
      
      <ChatInput 
        onSubmit={handleSubmit} 
        isLoading={isLoading} 
        isStreaming={isStreaming}
        placeholder="Ask about AI development, MCP, or navigate the site..."
      />
      
      {/* Add styles for typing indicator */}
      {mounted && (
        <style jsx global>{`
          .typing-indicator {
            display: flex;
            align-items: center;
          }
          
          .dot {
            height: 6px;
            width: 6px;
            margin: 0 2px;
            background-color: var(--accent);
            border-radius: 50%;
            animation: pulse 1.5s infinite ease-in-out;
          }
          
          .dot:nth-child(1) {
            animation-delay: 0s;
          }
          
          .dot:nth-child(2) {
            animation-delay: 0.2s;
          }
          
          .dot:nth-child(3) {
            animation-delay: 0.4s;
          }
          
          @keyframes pulse {
            0%, 50%, 100% {
              transform: scale(1);
              opacity: 0.5;
            }
            25% {
              transform: scale(1.5);
              opacity: 1;
            }
          }
          
          /* Add custom scrollbar styling */
          .scrollbar-thin {
            scrollbar-width: thin;
          }
          
          .scrollbar-thumb-slate-200 {
            scrollbar-color: #e2e8f0 transparent;
          }
          
          .dark .scrollbar-thumb-slate-700 {
            scrollbar-color: #334155 transparent;
          }
          
          .scrollbar-track-transparent::-webkit-scrollbar {
            width: 6px;
          }
          
          .scrollbar-thumb-slate-200::-webkit-scrollbar-thumb {
            background-color: #e2e8f0;
            border-radius: 3px;
          }
          
          .dark .scrollbar-thumb-slate-700::-webkit-scrollbar-thumb {
            background-color: #334155;
          }
          
          .scrollbar-track-transparent::-webkit-scrollbar-track {
            background-color: transparent;
          }
        `}</style>
      )}
    </div>
  )
} 