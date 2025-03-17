"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useChat } from "@/contexts/chat-context"
import { useNavigation, NavigationRecommendation as NavigationRecommendationType } from "@/contexts/navigation-context"
import { ChatInput } from "@/components/chat/chat-input"
import { ChatMessage } from "@/components/chat/chat-message"
import { Loader2, Info, RefreshCw, ArrowRight, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// Temporary inline implementation to avoid import issues
function NavigationRecommendation({ recommendation }: { recommendation: NavigationRecommendationType }) {
  const { path, title, description, summary, confidence } = recommendation
  const router = useRouter()
  const isExternal = path.startsWith("http")
  
  // Format confidence as percentage
  const confidencePercent = Math.round(confidence * 100)
  
  const handleNavigate = () => {
    if (isExternal) {
      window.open(path, "_blank")
    } else {
      router.push(path)
    }
  }
  
  return (
    <div className="rounded-md border border-border bg-card p-3 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-medium text-sm">{title}</h4>
        {confidence > 0 && (
          <span className={cn(
            "text-xs px-1.5 py-0.5 rounded-full",
            confidencePercent > 80 
              ? "bg-primary/10 text-primary"
              : "bg-muted text-muted-foreground"
          )}>
            {confidencePercent}%
          </span>
        )}
      </div>
      
      {(description || summary) && (
        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
          {description || summary}
        </p>
      )}
      
      <div className="mt-2 flex justify-between items-center">
        <span className="text-xs text-muted-foreground truncate max-w-[140px]">
          {path}
        </span>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-7 px-2"
          onClick={handleNavigate}
        >
          {isExternal ? (
            <>
              <span className="text-xs">Open</span>
              <ExternalLink className="h-3 w-3 ml-1" />
            </>
          ) : (
            <>
              <span className="text-xs">Go</span>
              <ArrowRight className="h-3 w-3 ml-1" />
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

export function ChatContainer() {
  const { currentSession, isLoading, isStreaming, sendStreamingMessage } = useChat()
  const { search, currentPage } = useNavigation()
  const chatEndRef = React.useRef<HTMLDivElement>(null)
  const messagesContainerRef = React.useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = React.useState(false)
  const [showRecommendations, setShowRecommendations] = React.useState(false)
  const [recommendations, setRecommendations] = React.useState<{
    query: string;
    items: NavigationRecommendationType[];
  } | null>(null)
  const [isSearching, setIsSearching] = React.useState(false)

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

  // Handle searching for content based on user query
  const searchContent = async (query: string) => {
    setIsSearching(true)
    try {
      const results = await search(query)
      if (results && results.length > 0) {
        setRecommendations({
          query,
          items: results
        })
        setShowRecommendations(true)
      } else {
        setRecommendations(null)
      }
    } catch (error) {
      console.error("Error searching content:", error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleSubmit = async (content: string) => {
    // Hide recommendations when user sends a message
    setShowRecommendations(false)
    
    // Check if message is a navigation command
    if (content.toLowerCase().includes("find") || 
        content.toLowerCase().includes("search") ||
        content.toLowerCase().includes("looking for") ||
        content.toLowerCase().includes("where is") ||
        content.toLowerCase().includes("how do i get to")) {
      // Extract the search query - remove command words
      const queryWords = content
        .replace(/find|search|looking for|where is|how do i get to/gi, "")
        .trim()
      
      if (queryWords) {
        // Search for content first
        await searchContent(queryWords)
        
        // Also send to the chat for context
        await sendStreamingMessage(content)
      } else {
        await sendStreamingMessage(content)
      }
    } else {
      // Regular message handling
      await sendStreamingMessage(content)
    }
    
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
            
            {/* Show search recommendations if available */}
            {showRecommendations && recommendations && recommendations.items.length > 0 && (
              <div className="p-4 bg-accent/5">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium">Content matches for "{recommendations.query}"</h4>
                  <button 
                    className="text-xs flex items-center text-muted-foreground hover:text-foreground"
                    onClick={() => setShowRecommendations(false)}
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Hide
                  </button>
                </div>
                <div className="grid gap-2 mt-2">
                  {recommendations.items.slice(0, 3).map((item) => (
                    <NavigationRecommendation 
                      key={item.path}
                      recommendation={item}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {/* Loading indicator for content search */}
            {isSearching && (
              <div className="flex items-center justify-center p-4">
                <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full mr-2"></div>
                <p className="text-sm text-muted-foreground">Searching content...</p>
              </div>
            )}
            
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