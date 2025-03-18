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
function NavigationContainer({ onClose }: { onClose: () => void }) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isSearching, setIsSearching] = React.useState(false);
  const { currentPage, recommendations, isLoading, search, relatedPaths, pageTitle, pageDescription } = useNavigation();
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
  const handleNavigate = (path: string) => {
    router.push(path);
    onClose();
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
                  onClick={() => handleNavigate(recommendation.path)}
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
  const [isVisible, setIsVisible] = React.useState(false)
  const [isLarge, setIsLarge] = React.useState(false)
  const [width, setWidth] = React.useState(DEFAULT_WIDTH)
  const [height, setHeight] = React.useState(DEFAULT_HEIGHT)
  const [activeTab, setActiveTab] = React.useState<"chat" | "navigation">("chat")
  
  // Store visibility in local storage
  const [storedVisibility, setStoredVisibility] = useLocalStorage("floatingChatVisible", false)
  
  // Set visibility from stored value on mount
  React.useEffect(() => {
    setIsVisible(storedVisibility)
  }, [storedVisibility])
  
  // Toggle chat visibility
  const toggleVisibility = () => {
    const newVisibility = !isVisible
    setIsVisible(newVisibility)
    setStoredVisibility(newVisibility)
  }
  
  // Toggle between normal and large size
  const toggleSize = () => {
    setIsLarge(!isLarge)
    setWidth(!isLarge ? LARGE_WIDTH : DEFAULT_WIDTH)
    setHeight(!isLarge ? LARGE_HEIGHT : DEFAULT_HEIGHT)
  }
  
  // Reset to chat tab when closed
  React.useEffect(() => {
    if (!isVisible) {
      setActiveTab("chat")
    }
  }, [isVisible])
  
  return (
    <>
      {/* Chat button */}
      {!isVisible && (
        <Button
          onClick={toggleVisibility}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
          aria-label="Open chat"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}
      
      {/* Chat panel */}
      {isVisible && (
        <div
          className="fixed bottom-6 right-6 bg-background border rounded-lg shadow-lg overflow-hidden flex flex-col z-50"
          style={{
            width: `${width}px`,
            height: `${height}px`,
            maxHeight: 'calc(100vh - 80px)' // Ensure it doesn't exceed viewport height
          }}
        >
          <ChatProvider>
            <ChatHeader 
              isLarge={isLarge} 
              toggleSize={toggleSize} 
              onClose={toggleVisibility} 
            />
            
            {/* Tab navigation */}
            <div className="flex items-center border-b">
              <button
                onClick={() => setActiveTab("chat")}
                className={cn(
                  "flex-1 py-2 text-sm font-medium text-center transition-colors",
                  activeTab === "chat" 
                    ? "border-b-2 border-primary" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Chat
              </button>
              <button
                onClick={() => setActiveTab("navigation")}
                className={cn(
                  "flex-1 py-2 text-sm font-medium text-center transition-colors",
                  activeTab === "navigation" 
                    ? "border-b-2 border-primary" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Navigation
              </button>
            </div>
            
            {/* Content based on active tab */}
            <div className="flex-1 overflow-auto">
              {activeTab === "chat" ? (
                <ChatContainer />
              ) : (
                <NavigationContainer onClose={() => setActiveTab("chat")} />
              )}
            </div>
          </ChatProvider>
        </div>
      )}
    </>
  )
} 
