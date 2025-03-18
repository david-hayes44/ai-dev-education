"use client"

import * as React from "react"
import { useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { X, MessageCircle, Settings, Maximize2, Minimize2, Search, Compass, ExternalLink, ChevronRight, Info, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChatContainer } from "@/components/chat/chat-container"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { ChatProvider, useChat } from "@/contexts/chat-context"
import { useNavigation, NavigationRecommendation as NavRecommendationType } from "@/contexts/navigation-context"
import { ModelSelector } from "@/components/chat/model-selector"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { NavigationSuggestion } from "@/components/chat/navigation-suggestion"

// Interface for ChatService with only the methods we need
interface ChatServiceInterface {
  isNavigationRequest: (message: string) => boolean;
}

// Inline implementation of NavigationContainer to avoid import issues
function NavigationContainer({ onClose, onNavigate }: { 
  onClose: () => void;
  onNavigate: (path: string, title: string) => void;
}) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isSearching, setIsSearching] = React.useState(false);
  const { currentPage, recommendations, isLoading, search, relatedPaths, pageTitle, pageDescription, navigateTo } = useNavigation();
  const router = useRouter();
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  
  // Focus search input on component mount
  React.useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);
  
  // Perform search when user submits
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      await search(searchQuery);
    } finally {
      setIsSearching(false);
    }
  };
  
  // Navigate to a page and close the navigation panel
  const handleNavigate = (path: string, sectionId?: string, title?: string) => {
    navigateTo(path, sectionId);
    onNavigate(path, title || path.split('/').pop() || 'page');
  };
  
  const relatedPages = relatedPaths || [];
  
  return (
    <div className="flex flex-col h-full">
      {/* Search area */}
      <div className="p-4 border-b">
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            ref={searchInputRef}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for content..."
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading || isSearching}>
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </form>
      </div>
      
      {/* Recommendations area */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading || isSearching ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mb-2"></div>
            <p>Searching...</p>
          </div>
        ) : recommendations.length > 0 ? (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Search Results</h3>
            <div className="grid gap-3">
              {recommendations.map((recommendation) => (
                <RecommendationCard
                  key={recommendation.path}
                  recommendation={recommendation}
                  onClick={() => handleNavigate(recommendation.path, recommendation.sectionId, recommendation.title)}
                />
              ))}
            </div>
          </div>
        ) : searchQuery.trim() && !isLoading ? (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
            <p>No results found for "{searchQuery}"</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Current page information */}
            <div className="space-y-3">
              <h3 className="text-lg font-medium flex items-center">
                <Info className="h-4 w-4 mr-2 text-primary" />
                Current Page
              </h3>
              <div className="bg-accent/10 rounded-lg p-4">
                <h4 className="font-medium">{pageTitle || "Untitled Page"}</h4>
                {pageDescription && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {pageDescription}
                  </p>
                )}
              </div>
            </div>
            
            {/* Related pages */}
            {relatedPages.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-medium flex items-center">
                  <Compass className="h-4 w-4 mr-2 text-primary" />
                  Related Pages
                </h3>
                <div className="grid gap-2">
                  {relatedPages.map((path) => (
                    <button
                      key={path}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/10 transition-colors text-left"
                      onClick={() => handleNavigate(path)}
                    >
                      <span className="truncate">{path.split("/").pop()}</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Prompt to search */}
            {!relatedPages.length && (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Search className="h-12 w-12 text-primary/20 mb-4" />
                <h3 className="text-lg font-medium mb-2">Find Content</h3>
                <p className="text-muted-foreground mb-4 max-w-xs mx-auto">
                  Use the search bar to find relevant content across the site
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function RecommendationCard({ recommendation, onClick }: {
  recommendation: NavigationSuggestion | NavRecommendationType,
  onClick: () => void
}) {
  const { path, title, description, confidence } = recommendation
  const summary = 'summary' in recommendation ? recommendation.summary : undefined
  const isExternal = path.startsWith("http")
  
  // Format confidence as percentage - handle both optional and required confidence
  const confidenceValue = confidence || 0.5  // Default to 0.5 if undefined
  const confidencePercent = Math.round(confidenceValue * 100)
  
  return (
    <div 
      className={cn(
        "rounded-lg border p-4 cursor-pointer hover:bg-accent/10 transition-colors",
        confidencePercent > 80 ? "border-primary/20" : "border-border"
      )}
      onClick={onClick}
    >
      <div className="flex justify-between items-start gap-2 mb-2">
        <h4 className="font-medium">{title}</h4>
        <span className={cn(
          "text-xs px-2 py-1 rounded-full",
          confidencePercent > 80 
            ? "bg-primary/10 text-primary"
            : "bg-muted text-muted-foreground"
        )}>
          {confidencePercent}%
        </span>
      </div>
      
      {(description || summary) && (
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {description || summary}
        </p>
      )}
      
      <div className="flex items-center text-xs text-muted-foreground">
        <span className="truncate">{path}</span>
        {isExternal && <ExternalLink className="h-3 w-3 ml-1 flex-shrink-0" />}
      </div>
      
      <Button 
        variant="ghost" 
        size="sm" 
        className="mt-3 w-full justify-between"
      >
        <span>Go to page</span>
        <ArrowRight className="h-3 w-3 ml-1" />
      </Button>
    </div>
  )
}

// Define larger default sizes with increased comfort
const DEFAULT_WIDTH = 420; // Increased from 350
const DEFAULT_HEIGHT = 750; // Increased to show full chat content
const LARGE_WIDTH = 800;
const LARGE_HEIGHT = 900; // Increased for better visibility

// Must be used within a ChatProvider
function ChatHeader({ isLarge, toggleSize, onClose }: { 
  isLarge: boolean; 
  toggleSize: () => void;
  onClose: () => void;
}) {
  const { selectedModel, setModel } = useChat();
  const [isOpen, setIsOpen] = React.useState(false);
  const { pageTitle, pageDescription } = useNavigation();

  // Show current page in header if available
  const displayTitle = pageTitle || "AI Navigation Assistant";

  return (
    <div className="flex items-center justify-between border-b p-4 h-16">
      <h3 className="font-semibold text-base flex items-center">
        <span className="truncate max-w-[200px]">{displayTitle}</span>
      </h3>
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSize}
          className="h-9 w-9 hover:bg-accent/50"
          aria-label={isLarge ? "Minimize chat" : "Maximize chat"}
        >
          {isLarge ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </Button>
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 hover:bg-accent/50"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-60 p-3" align="end">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Settings</h3>
              <div className="space-y-1">
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Model</span>
                  </div>
                  <ModelSelector 
                    selectedModel={selectedModel}
                    onSelectModel={setModel}
                  />
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-9 w-9 hover:bg-accent/50"
          aria-label="Close chat"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export function FloatingChat() {
  const [isVisible, setIsVisible] = React.useState(false);
  const [isLarge, setIsLarge] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'chat' | 'navigation'>('chat');
  const [size, setSize] = useLocalStorage<{ width: number; height: number }>('chatWindowSize', {
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
  });
  const router = useRouter();
  
  // Define chat service reference to handle chat functionality
  const chatServiceRef = useRef<ChatServiceInterface | null>(null);
  
  // Set up chat service reference on client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      chatServiceRef.current = (window as unknown as { chatService: ChatServiceInterface }).chatService;
    }
  }, []);
  
  // Handle tab switching when navigation intent is detected
  const handleMessageSend = (message: string) => {
    // Check if this is a navigation request
    if (chatServiceRef.current) {
      const isNavRequest = chatServiceRef.current.isNavigationRequest(message);
      if (isNavRequest) {
        // Switch to navigation tab
        setActiveTab('navigation');
      }
    }
  };
  
  // Handle navigation from the navigation container
  const handleNavigationComplete = (path: string, title: string) => {
    setActiveTab('chat');
    router.push(path);
  };
  
  // Handle window resizing
  const handleResize = (newSize: { width: number; height: number }) => {
    if (newSize && typeof newSize.width === 'number' && typeof newSize.height === 'number') {
      setSize(newSize);
    }
  };
  
  // Toggle chat visibility
  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };
  
  // Toggle between normal and large sizes
  const toggleSize = () => {
    if (isLarge) {
      handleResize({ width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT });
    } else {
      handleResize({ width: LARGE_WIDTH, height: LARGE_HEIGHT });
    }
    setIsLarge(!isLarge);
  };
  
  // Close the chat
  const handleClose = () => {
    setIsVisible(false);
  };
  
  // Compute current window size based on whether it's large or normal
  const currentSize = {
    width: isLarge ? LARGE_WIDTH : (size?.width || DEFAULT_WIDTH),
    height: isLarge ? LARGE_HEIGHT : (size?.height || DEFAULT_HEIGHT)
  };
  
  return (
    <>
      {/* Floating chat button */}
      <Button
        size="icon"
        className="fixed bottom-4 right-4 h-14 w-14 rounded-full shadow-lg z-50 hover:scale-105 transition-transform"
        onClick={toggleVisibility}
        aria-label={isVisible ? "Close chat" : "Open chat"}
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
      
      {/* Chat window */}
      {isVisible && (
        <div
          className={cn(
            "fixed bottom-20 right-4 bg-background rounded-lg border shadow-lg overflow-hidden z-50 transition-all",
            isLarge && "right-8 bottom-8"
          )}
          style={{
            width: `${currentSize.width}px`,
            height: `${currentSize.height}px`,
          }}
        >
          {/* Tabs */}
          <div className="flex border-b h-12">
            <button
              className={cn(
                "flex-1 flex justify-center items-center gap-1 text-sm font-medium border-r",
                activeTab === 'chat'
                  ? "bg-background text-foreground"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted/80"
              )}
              onClick={() => setActiveTab('chat')}
            >
              <MessageCircle className="h-4 w-4" />
              <span>Chat</span>
            </button>
            <button
              className={cn(
                "flex-1 flex justify-center items-center gap-1 text-sm font-medium",
                activeTab === 'navigation'
                  ? "bg-background text-foreground"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted/80"
              )}
              onClick={() => setActiveTab('navigation')}
            >
              <Compass className="h-4 w-4" />
              <span>Navigate</span>
            </button>
          </div>
          
          {/* Chat header with controls */}
          <ChatHeader
            isLarge={isLarge}
            toggleSize={toggleSize}
            onClose={handleClose}
          />
          
          {/* Content area */}
          <div className="flex-1 h-[calc(100%-7rem)] overflow-hidden">
            <ChatProvider>
              <div className="h-full">
                {activeTab === 'chat' ? (
                  <ChatContainer onMessageSend={handleMessageSend} />
                ) : (
                  <NavigationContainer onClose={handleClose} onNavigate={handleNavigationComplete} />
                )}
              </div>
            </ChatProvider>
          </div>
        </div>
      )}
    </>
  );
} 
