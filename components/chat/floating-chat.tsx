"use client"

import * as React from "react"
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
            <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-accent/50">
              <Settings className="h-4 w-4" />
              <span className="sr-only">Settings</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-60 p-4">
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Model</h4>
              <ModelSelector 
                selectedModel={selectedModel} 
                onSelectModel={setModel} 
              />
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
  );
}

// Main component that renders the floating chat UI
export function FloatingChat() {
  const [isMinimized, setIsMinimized] = React.useState(true);
  const [isLarge, setIsLarge] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'chat' | 'navigation'>('chat');
  const [size, setSize] = useLocalStorage({
    key: "floating-chat-size",
    defaultValue: { width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT },
  });
  const chatService = React.useMemo(() => typeof window !== 'undefined' ? (window as any).chatService : null, []);
  
  // Handle tab switching when navigation intent is detected
  const handleMessageSend = (message: string) => {
    // Check if this is a navigation request
    if (chatService && chatService.isNavigationRequest(message)) {
      // Switch to navigation tab
      setActiveTab('navigation');
    }
  };
  
  // Switch to chat tab with a message about successful navigation
  const handleNavigationComplete = (path: string, title: string) => {
    setActiveTab('chat');
    
    // Optionally, send a system message to chat indicating successful navigation
    if (chatService) {
      const systemMessage = `I've taken you to the "${title}" page. Let me know if you need more help or have questions about this topic.`;
      // Send or display a success message
    }
  };
  
  const toggleVisibility = () => {
    setIsMinimized(!isMinimized);
  };
  
  const toggleSize = () => {
    const newIsLarge = !isLarge;
    setIsLarge(newIsLarge);
    
    setSize({
      width: newIsLarge ? LARGE_WIDTH : DEFAULT_WIDTH,
      height: newIsLarge ? LARGE_HEIGHT : DEFAULT_HEIGHT,
    });
  };
  
  const handleClose = () => {
    setIsMinimized(true);
  };
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isMinimized ? (
        <Button
          onClick={toggleVisibility}
          className="h-12 w-12 rounded-full shadow-lg bg-primary hover:bg-primary/90"
          aria-label="Open chat"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      ) : (
        <div
          className="bg-background border rounded-lg shadow-xl overflow-hidden flex flex-col transition-all duration-200 ease-in-out"
          style={{
            width: `${size.width}px`,
            height: `${size.height}px`,
          }}
        >
          <ChatProvider>
            {/* Header */}
            <div className="border-b p-3 flex items-center justify-between">
              <div className="flex gap-2">
                <Button
                  variant={activeTab === 'chat' ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab('chat')}
                  className="h-8"
                >
                  <MessageCircle className="h-4 w-4 mr-1" />
                  Chat
                </Button>
                <Button
                  variant={activeTab === 'navigation' ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab('navigation')}
                  className="h-8"
                >
                  <Compass className="h-4 w-4 mr-1" />
                  Navigate
                </Button>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleSize}
                  className="h-8 w-8"
                  aria-label={isLarge ? "Minimize chat" : "Maximize chat"}
                >
                  {isLarge ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClose}
                  className="h-8 w-8"
                  aria-label="Close chat"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Content */}
            <div className="flex-1 overflow-hidden">
              {activeTab === 'chat' ? (
                <ChatContainer onMessageSend={handleMessageSend} />
              ) : (
                <NavigationContainer onClose={handleClose} onNavigate={handleNavigationComplete} />
              )}
            </div>
          </ChatProvider>
        </div>
      )}
    </div>
  );
} 
