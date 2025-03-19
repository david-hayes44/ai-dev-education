'use client'

import { useEnhancedChat } from '@/lib/hooks/use-enhanced-chat'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { FileText, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ContentRecommendation } from '@/lib/content-recommendation-service'

interface ContentRecommendationsProps {
  onRecommendationClick?: (recommendation: ContentRecommendation) => void
  className?: string
  limit?: number
}

export function ContentRecommendations({ 
  onRecommendationClick, 
  className,
  limit = 3
}: ContentRecommendationsProps) {
  const { contentRecommendations } = useEnhancedChat()
  
  if (!contentRecommendations || contentRecommendations.length === 0) {
    return null
  }
  
  // Limit the number of recommendations to display
  const recommendations = contentRecommendations.slice(0, limit)
  
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Recommended Content</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="max-h-48">
          <div className="space-y-3">
            {recommendations.map((recommendation) => (
              <div 
                key={recommendation.id}
                className="p-3 border rounded-md hover:bg-accent cursor-pointer transition-colors"
                onClick={() => onRecommendationClick?.(recommendation)}
              >
                <div className="flex items-start gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium">{recommendation.title}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                      {recommendation.content.substring(0, 120)}...
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">
                        {recommendation.source}
                      </span>
                      {recommendation.path && (
                        <Button variant="ghost" size="sm" className="h-7 px-2">
                          <ExternalLink className="h-3.5 w-3.5 mr-1" />
                          <span className="text-xs">View</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
} 