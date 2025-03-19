'use client'

import { useEnhancedChat } from '@/lib/hooks/use-enhanced-chat'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ExtractedTopic } from '@/lib/topic-extraction-service'

interface TopicDisplayProps {
  onTopicClick?: (topic: ExtractedTopic) => void
  className?: string
}

export function TopicDisplay({ onTopicClick, className }: TopicDisplayProps) {
  const { currentTopics } = useEnhancedChat()
  
  if (!currentTopics || currentTopics.length === 0) {
    return null
  }
  
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Conversation Topics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {currentTopics.map((topic) => (
            <Badge
              key={topic.topic}
              variant="outline"
              className="cursor-pointer hover:bg-accent transition-colors"
              onClick={() => onTopicClick?.(topic)}
            >
              {topic.topic}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 