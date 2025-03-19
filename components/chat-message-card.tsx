'use client'

import { Message } from '@/lib/chat-service'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface ChatMessageCardProps {
  message: Message
  relevance?: number
  compact?: boolean
  onClick?: () => void
  className?: string
}

export function ChatMessageCard({
  message,
  relevance,
  compact = false,
  onClick,
  className
}: ChatMessageCardProps) {
  // Format the message timestamp
  const formattedTime = message.timestamp
    ? new Date(message.timestamp).toLocaleString()
    : ''
  
  // Format the relevance score as a percentage if provided
  const relevancePercentage = relevance !== undefined
    ? Math.round(relevance * 100)
    : null
  
  // Truncate content for compact view
  const content = compact && message.content.length > 150
    ? `${message.content.slice(0, 150)}...`
    : message.content
  
  return (
    <div
      className={cn(
        'rounded-lg border p-3',
        message.role === 'user' ? 'bg-muted' : 'bg-card',
        onClick && 'cursor-pointer hover:shadow-sm transition-shadow',
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <Badge variant={message.role === 'user' ? 'outline' : 'default'}>
            {message.role}
          </Badge>
          
          {relevancePercentage !== null && (
            <Badge variant="secondary" className="ml-2">
              {relevancePercentage}% match
            </Badge>
          )}
        </div>
        
        {formattedTime && (
          <span className="text-xs text-muted-foreground">
            {formattedTime}
          </span>
        )}
      </div>
      
      <div className={cn(
        'prose prose-sm dark:prose-invert max-w-none',
        compact && 'line-clamp-2'
      )}>
        {content}
      </div>
    </div>
  )
} 