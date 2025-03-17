"use client"

import { useRouter } from "next/navigation"
import { ArrowRight, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { NavigationRecommendation as NavigationRecommendationType } from "@/contexts/navigation-context"

interface NavigationRecommendationProps {
  recommendation: NavigationRecommendationType
}

export function NavigationRecommendation({ recommendation }: NavigationRecommendationProps) {
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