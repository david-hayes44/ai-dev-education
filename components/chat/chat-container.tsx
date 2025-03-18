"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { useChat } from "@/contexts/chat-context"
import { useNavigation, NavigationRecommendation as NavigationRecommendationType } from "@/contexts/navigation-context"
import { ChatInput } from "@/components/chat/chat-input"
import ChatMessage from "./chat-message"
import { Loader2, Info, RefreshCw, ArrowRight, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ContentReferences } from "./content-references"
import { NavigationSuggestions } from "./navigation-suggestion"
import { ScrollArea } from "@/components/ui/scroll-area"
import dynamic from "next/dynamic"

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

// Dynamically import NavigationSuggestions to avoid type errors during build
const DynamicNavigationSuggestions = dynamic(
  () => import("./navigation-suggestion").then((mod) => mod.NavigationSuggestions),
  { ssr: false }
);

export default function ChatContainer() {
  const { 
    messages, 
    isTyping, 
    relevantContent, 
    isSearchingContent,
    navigationSuggestions 
  } = useChat();
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] rounded-md border shadow-sm bg-background">
      <ScrollArea className="flex-1 p-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground text-sm">
              Start a conversation with the AI tutor...
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {isTyping && (
              <ChatMessage
                message={{
                  id: "typing",
                  role: "assistant",
                  content: "",
                  timestamp: Date.now(),
                  metadata: { type: "loading" },
                }}
              />
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>
      
      {/* Show relevant content section */}
      {(relevantContent?.length > 0 || isSearchingContent) && (
        <div className="border-t p-2">
          <ContentReferences 
            references={relevantContent || []} 
            isSearching={isSearchingContent} 
          />
        </div>
      )}
      
      {/* Show navigation suggestions when available */}
      {navigationSuggestions.length > 0 && (
        <div className="border-t p-2">
          <NavigationSuggestions suggestions={navigationSuggestions} />
        </div>
      )}
    </div>
  );
}

// Named export for compatibility with existing imports
export { ChatContainer }; 