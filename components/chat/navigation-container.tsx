"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useNavigation } from "@/contexts/navigation-context"
import { Search, Compass, ExternalLink, ChevronRight, Info, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface NavigationContainerProps {
  onClose: () => void
}

export function NavigationContainer({ onClose }: NavigationContainerProps) {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [isSearching, setIsSearching] = React.useState(false)
  const { currentPage, recommendations, isLoading, search, relatedPaths, pageTitle, pageDescription } = useNavigation()
  const router = useRouter()
  const searchInputRef = React.useRef<HTMLInputElement>(null)
  
  // Focus search input on component mount
  React.useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [])
  
  // Perform search when user submits
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    
    setIsSearching(true)
    try {
      await search(searchQuery)
    } finally {
      setIsSearching(false)
    }
  }
  
  // Navigate to a page and close the navigation panel
  const handleNavigate = (path: string) => {
    router.push(path)
    onClose()
  }
  
  const relatedPages = relatedPaths || []
  
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

interface RecommendationCardProps {
  recommendation: {
    path: string
    title: string
    description?: string
    summary?: string
    confidence?: number
  }
  onClick: () => void
}

function RecommendationCard({ recommendation, onClick }: RecommendationCardProps) {
  const { path, title, description, summary, confidence } = recommendation
  const isExternal = path.startsWith("http")
  
  // Format confidence as percentage with default value if undefined
  const confidenceValue = confidence || 0.5 // Default to 50% if undefined
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