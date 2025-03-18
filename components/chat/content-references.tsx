"use client"

import * as React from "react"
import { useState } from "react"
import { ContentChunk } from "@/lib/content-indexing-service"
import { ExternalLink, ChevronDown, ChevronUp, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface ContentReferencesProps {
  references: ContentChunk[]
  isSearching?: boolean
}

export function ContentReferences({ 
  references, 
  isSearching = false 
}: ContentReferencesProps) {
  const [expanded, setExpanded] = useState(false)
  
  if (references.length === 0 && !isSearching) {
    return null
  }
  
  return (
    <div className="border rounded-md bg-card shadow-sm">
      <div 
        className="flex items-center justify-between p-3 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">
            {isSearching ? (
              <span className="flex items-center gap-2">
                <span className="animate-pulse h-2 w-2 bg-primary rounded-full"></span>
                Searching for relevant content...
              </span>
            ) : (
              `${references.length} content reference${references.length !== 1 ? 's' : ''} found`
            )}
          </h3>
        </div>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          {expanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </div>
      
      {expanded && (
        <div className="p-3 pt-0 border-t">
          {references.length === 0 && isSearching ? (
            <div className="flex items-center justify-center p-4">
              <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <div className="space-y-3">
              {references.map((reference) => (
                <ReferenceCard key={reference.id} reference={reference} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

interface ReferenceCardProps {
  reference: ContentChunk
}

function ReferenceCard({ reference }: ReferenceCardProps) {
  const [contentExpanded, setContentExpanded] = useState(false)
  
  // Truncate content for preview
  const previewContent = reference.content.length > 200
    ? `${reference.content.substring(0, 200)}...`
    : reference.content
    
  return (
    <div className="border rounded-md bg-background p-3">
      <div className="flex justify-between items-start">
        <h4 className="text-sm font-medium">{reference.title}</h4>
        <Link 
          href={reference.path} 
          className="text-xs text-primary hover:underline flex items-center gap-1"
          target="_blank"
        >
          View <ExternalLink className="h-3 w-3" />
        </Link>
      </div>
      
      <div className="text-xs text-muted-foreground mt-1">
        Source: {reference.source}
        {reference.section && ` • Section: ${reference.section}`}
      </div>
      
      <div className="mt-2">
        <div 
          className={cn(
            "text-xs mt-1", 
            !contentExpanded && "line-clamp-3"
          )}
        >
          {reference.content}
        </div>
        
        {reference.content.length > 200 && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs h-6 mt-1 px-2"
            onClick={() => setContentExpanded(!contentExpanded)}
          >
            {contentExpanded ? "Show less" : "Show more"}
          </Button>
        )}
      </div>
    </div>
  )
}

export default ContentReferences 