'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { Message } from '@/lib/chat-service'
import { semanticSearchService, MessageSearchResult } from '@/lib/semantic-search-service'
import { useEnhancedChat } from '@/lib/hooks/use-enhanced-chat'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { ChatMessageCard } from '@/components/chat-message-card'

interface ConversationSearchProps {
  onSelect?: (messageId: string) => void
  onClose?: () => void
  isOpen: boolean
}

export function ConversationSearch({
  onSelect,
  onClose,
  isOpen
}: ConversationSearchProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<MessageSearchResult[]>([])
  const [selectedResult, setSelectedResult] = useState<string | null>(null)
  const { chatService, searchCurrentSession } = useEnhancedChat()

  // Reset search when the dialog is opened
  useEffect(() => {
    if (isOpen) {
      setSearchTerm('')
      setSearchResults([])
      setSelectedResult(null)
    }
  }, [isOpen])

  // Search as you type with debounce
  useEffect(() => {
    let timer: NodeJS.Timeout
    
    if (searchTerm && searchTerm.trim().length >= 3) {
      setIsSearching(true)
      
      timer = setTimeout(async () => {
        try {
          if (!chatService) {
            setSearchResults([])
            setIsSearching(false)
            return
          }
          
          // Use the searchCurrentSession function from the context
          const results = await searchCurrentSession(searchTerm)
          setSearchResults(results)
        } catch (error) {
          console.error('Error searching conversations:', error)
          setSearchResults([])
        } finally {
          setIsSearching(false)
        }
      }, 500) // 500ms debounce
    } else {
      setSearchResults([])
      setIsSearching(false)
    }
    
    return () => {
      clearTimeout(timer)
    }
  }, [searchTerm, chatService, searchCurrentSession])

  const handleSelect = (messageId: string) => {
    setSelectedResult(messageId)
    onSelect?.(messageId)
    onClose?.()
  }

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose?.()}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Search Conversation</DialogTitle>
          <DialogDescription>
            Search through the current conversation using semantic search.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex w-full items-center space-x-2 my-4">
          <Input
            placeholder="Search for messages..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          {isSearching && <Spinner size="sm" />}
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {searchResults.length === 0 && searchTerm.trim().length >= 3 && !isSearching ? (
            <div className="text-center py-8 text-muted-foreground">
              No matching messages found
            </div>
          ) : (
            <div className="space-y-4">
              {searchResults.map(result => (
                <div
                  key={result.message.id}
                  className={`p-3 rounded-md cursor-pointer transition-colors ${
                    selectedResult === result.message.id
                      ? 'bg-accent'
                      : 'hover:bg-muted'
                  }`}
                  onClick={() => handleSelect(result.message.id)}
                >
                  <ChatMessageCard
                    message={result.message}
                    relevance={result.score}
                    compact
                  />
                </div>
              ))}
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 