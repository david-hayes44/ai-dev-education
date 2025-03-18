"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, ExternalLink, ChevronRight, Sparkles, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// Enhanced navigation suggestion interface
export interface NavigationSuggestion {
  title: string
  path: string
  description?: string
  summary?: string
  confidence?: number
  sectionId?: string
  isSemanticMatch?: boolean
}

interface NavigationSuggestionProps {
  suggestion: NavigationSuggestion
  onClick?: () => void
  showConfidence?: boolean
  size?: "sm" | "md" | "lg"
}

export function NavigationSuggestion({ 
  suggestion, 
  onClick, 
  showConfidence = true,
  size = "md"
}: NavigationSuggestionProps) {
  const { title, path, description, summary, confidence = 0.5, sectionId, isSemanticMatch } = suggestion
  const router = useRouter()
  const [isHovered, setIsHovered] = useState(false)
  
  const isExternal = path.startsWith("http")
  
  // Format confidence as percentage
  const confidencePercent = Math.round(confidence * 100)
  
  // Determine if this is a high-confidence suggestion
  const isHighConfidence = confidencePercent >= 85
  
  // Handle navigation when clicked
  const handleNavigate = () => {
    if (onClick) {
      onClick()
      return
    }
    
    if (isExternal) {
      window.open(path, "_blank")
    } else {
      if (sectionId) {
        router.push(`${path}#${sectionId}`)
      } else {
        router.push(path)
      }
    }
  }
  
  // Determine size class based on size prop
  const containerClasses = cn(
    "group relative rounded-md border transition-all overflow-hidden",
    isHighConfidence ? "border-primary/20" : "border-border",
    isHovered ? "bg-accent/10" : "bg-card",
    size === "sm" && "p-2",
    size === "md" && "p-3",
    size === "lg" && "p-4"
  )
  
  // Title size based on component size
  const titleClasses = cn(
    "font-medium",
    size === "sm" && "text-xs",
    size === "md" && "text-sm",
    size === "lg" && "text-base"
  )
  
  // Description/summary text size
  const descriptionClasses = cn(
    "text-muted-foreground truncate",
    size === "sm" && "text-xs mt-0.5 line-clamp-1",
    size === "md" && "text-xs mt-1 line-clamp-2",
    size === "lg" && "text-sm mt-1.5 line-clamp-2"
  )
  
  return (
    <div 
      className={containerClasses}
      onClick={handleNavigate}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && handleNavigate()}
    >
      {/* Semantic match indicator */}
      {isSemanticMatch && (
        <div className="absolute right-1 top-1">
          <Sparkles className="h-3 w-3 text-primary/60" />
        </div>
      )}
      
      <div className="flex justify-between items-start gap-2">
        <h4 className={titleClasses}>
          {title}
          {sectionId && " "}
          {sectionId && (
            <span className="text-muted-foreground font-normal">
              #{sectionId}
            </span>
          )}
        </h4>
        
        {showConfidence && (
          <span className={cn(
            "text-xs px-1.5 py-0.5 rounded-full whitespace-nowrap",
            isHighConfidence 
              ? "bg-primary/10 text-primary"
              : "bg-muted text-muted-foreground"
          )}>
            {confidencePercent}%
          </span>
        )}
      </div>
      
      {(description || summary) && (
        <p className={descriptionClasses}>
          {description || summary}
        </p>
      )}
      
      {size !== "sm" && (
        <div className={cn(
          "mt-2 flex justify-between items-center",
          size === "lg" && "mt-3"
        )}>
          <span className="text-xs text-muted-foreground truncate max-w-[140px]">
            {path}
          </span>
          
          <ChevronRight className={cn(
            "text-muted-foreground transition-transform",
            "h-3 w-3",
            isHovered ? "translate-x-0.5" : "translate-x-0",
            isHighConfidence && "text-primary"
          )} />
        </div>
      )}
      
      {/* Focus indicator - shows when keyboard navigating */}
      <div className={cn(
        "absolute inset-0 border-2 border-primary pointer-events-none opacity-0",
        "focus-within:opacity-100"
      )} />
    </div>
  )
}

interface NavigationSuggestionsProps {
  suggestions: NavigationSuggestion[];
}

export function NavigationSuggestions({ suggestions }: NavigationSuggestionsProps) {
  const [expanded, setExpanded] = useState<boolean>(false);
  
  const visibleSuggestions = expanded ? suggestions : suggestions.slice(0, 2);
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium">Navigation Suggestions</h3>
        {suggestions.length > 2 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? 'Show less' : `Show all (${suggestions.length})`}
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {visibleSuggestions.map((suggestion, index) => (
          <NavigationSuggestion key={index} suggestion={suggestion} />
        ))}
      </div>
    </div>
  );
}

export default NavigationSuggestions; 