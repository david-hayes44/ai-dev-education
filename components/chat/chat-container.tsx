"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { useChat } from "@/contexts/chat-context"
import { useNavigation, NavigationRecommendation as NavigationRecommendationType } from "@/contexts/navigation-context"
import { ChatInput } from "@/components/chat/chat-input"
import ChatMessage from "./chat-message"
import { Loader2, Info, RefreshCw, ArrowRight, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ContentReferences } from "./content-references"
import { NavigationSuggestions } from "./navigation-suggestion"
import { ScrollArea } from "@/components/ui/scroll-area"
import dynamic from "next/dynamic"
import { FileAttachment } from "@/lib/chat-service"

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
    navigationSuggestions,
    sendMessage,
    sendStreamingMessage,
    totalChunks,
    currentChunkIndex,
    navigateToNextChunk,
    navigateToPreviousChunk
  } = useChat();
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Handle sending a message
  const handleSendMessage = async (content: string, attachments?: FileAttachment[]) => {
    try {
      if (!content.trim() && (!attachments || attachments.length === 0)) {
        return; // Don't send empty messages
      }
      
      // Show loading state for attachments if any
      if (attachments && attachments.length > 0) {
        // Add a visual indicator that we're processing files
        console.log(`Processing ${attachments.length} attachments before sending message`);
        
        // Validate attachments before sending
        const validAttachments = attachments.filter(att => {
          // Check if URL is accessible for data URLs or regular URLs
          if (att.url && (att.url.startsWith('data:') || att.url.startsWith('http'))) {
            return true;
          }
          console.warn(`Skipping attachment with invalid URL: ${att.name}`);
          return false;
        });
        
        if (validAttachments.length !== attachments.length) {
          console.warn(`Some attachments were invalid and will be skipped`);
        }
        
        // Use streaming message for better user experience
        await sendStreamingMessage(content, validAttachments);
      } else {
        // No attachments, just send the message normally
        await sendStreamingMessage(content);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {totalChunks > 1 && (
        <div className="px-4 py-2 border-b flex items-center justify-between bg-muted/30">
          <div className="text-xs text-muted-foreground">
            Viewing chunk {currentChunkIndex + 1} of {totalChunks}
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2"
              onClick={navigateToPreviousChunk}
              disabled={currentChunkIndex === 0}
            >
              <span className="sr-only">Previous</span>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2"
              onClick={navigateToNextChunk}
              disabled={currentChunkIndex === totalChunks - 1}
            >
              <span className="sr-only">Next</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
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

      {/* Chat input section */}
      <div className="border-t mt-auto">
        <ChatInput 
          onSubmit={handleSendMessage}
          isLoading={isTyping}
          placeholder="Ask about AI development or MCP..."
        />
      </div>
    </div>
  );
}

// Named export for compatibility with existing imports
export { ChatContainer }; 