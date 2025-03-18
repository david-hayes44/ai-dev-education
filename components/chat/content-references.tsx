"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { BookOpen, ArrowRight, ExternalLink, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"

// Define interface for content reference
export interface ContentReference {
  title: string
  path: string
  sectionId?: string
  excerpt?: string
  relevance?: number // 0-1 indicating how relevant this reference is
}

interface ContentReferencesProps {
  references: ContentReference[]
  maxVisible?: number
}

export function ContentReferences({ 
  references, 
  maxVisible = 3 
}: ContentReferencesProps) {
  const [showAll, setShowAll] = useState(false)
  
  // Filter out duplicates by path
  const uniqueReferences = Array.from(
    new Map(references.map(ref => [`${ref.path}${ref.sectionId || ''}`, ref])).values()
  )
  
  // Sort by relevance if available
  const sortedReferences = [...uniqueReferences].sort((a, b) => 
    (b.relevance || 0.5) - (a.relevance || 0.5)
  )
  
  // Get visible references
  const visibleReferences = showAll 
    ? sortedReferences 
    : sortedReferences.slice(0, maxVisible)
  
  if (references.length === 0) {
    return null
  }
  
  return (
    <div className="content-references border rounded-md p-2 mt-3 mb-1 bg-muted/10">
      <div className="flex items-center gap-1 mb-2 text-xs text-muted-foreground">
        <BookOpen className="h-3 w-3" />
        <span>Content References</span>
      </div>
      
      <div className="space-y-2">
        {visibleReferences.map((reference, index) => (
          <ContentReferenceItem key={index} reference={reference} />
        ))}
      </div>
      
      {sortedReferences.length > maxVisible && (
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-xs w-full mt-2"
          onClick={() => setShowAll(!showAll)}
        >
          {showAll ? "Show Less" : `Show ${sortedReferences.length - maxVisible} More References`}
        </Button>
      )}
    </div>
  )
}

interface ContentReferenceItemProps {
  reference: ContentReference
}

function ContentReferenceItem({ reference }: ContentReferenceItemProps) {
  const { title, path, sectionId, excerpt, relevance } = reference
  const router = useRouter()
  const [isHovered, setIsHovered] = useState(false)
  
  const isExternal = path.startsWith("http")
  const hasHighRelevance = (relevance || 0) > 0.7
  
  // Create the full path with section ID if available
  const fullPath = sectionId ? `${path}#${sectionId}` : path
  
  const handleClick = () => {
    if (isExternal) {
      window.open(fullPath, "_blank")
    } else {
      router.push(fullPath)
    }
  }
  
  return (
    <div 
      className={cn(
        "border rounded-sm p-1.5 text-xs transition-all cursor-pointer relative",
        isHovered ? "bg-accent/10" : "bg-transparent",
        hasHighRelevance ? "border-primary/40" : "border-border"
      )}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex justify-between items-start">
        <h5 className="font-medium line-clamp-1">
          {title}
          {sectionId && (
            <span className="font-normal text-muted-foreground">
              {" → "}
              {sectionId.replace(/-/g, ' ')}
            </span>
          )}
        </h5>
        
        {relevance !== undefined && (
          <span className={cn(
            "px-1 ml-1 rounded-full text-[10px] whitespace-nowrap",
            hasHighRelevance ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
          )}>
            {Math.round(relevance * 100)}%
          </span>
        )}
      </div>
      
      {excerpt && (
        <p className="mt-1 text-muted-foreground line-clamp-1">
          {excerpt}
        </p>
      )}
      
      <div className="flex justify-between items-center mt-1">
        <span className="truncate text-muted-foreground text-[10px] max-w-[180px]">
          {fullPath}
        </span>
        
        {isExternal ? (
          <ExternalLink className="h-3 w-3 text-muted-foreground" />
        ) : (
          <ChevronRight className={cn(
            "h-3 w-3 transition-transform",
            isHovered ? "translate-x-0.5 text-primary" : "text-muted-foreground"
          )} />
        )}
      </div>
    </div>
  )
} 