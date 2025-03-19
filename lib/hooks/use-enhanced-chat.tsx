'use client'

import { 
  createContext, 
  useContext, 
  useEffect, 
  useState, 
  ReactNode 
} from 'react'
import { EnhancedChatService } from '../chat-service-enhanced'
import { Message, ChatSession } from '../chat-service'
import { topicExtractionService, ExtractedTopic } from '../topic-extraction-service'
import { semanticSearchService, MessageSearchResult } from '../semantic-search-service'
import { contentRecommendationService, ContentRecommendation, ResponseRecommendation } from '../content-recommendation-service'

interface EnhancedChatContextProps {
  chatService: EnhancedChatService | null
  isLoading: boolean
  currentTopics: ExtractedTopic[]
  contentRecommendations: ContentRecommendation[]
  responseRecommendations: ResponseRecommendation[]
  searchCurrentSession: (query: string, limit?: number) => Promise<MessageSearchResult[]>
  searchAllSessions: (query: string, limit?: number) => Promise<MessageSearchResult[]>
  findSimilarMessages: (messageId: string, limit?: number) => Promise<MessageSearchResult[]>
}

const EnhancedChatContext = createContext<EnhancedChatContextProps>({
  chatService: null,
  isLoading: true,
  currentTopics: [],
  contentRecommendations: [],
  responseRecommendations: [],
  searchCurrentSession: async () => [],
  searchAllSessions: async () => [],
  findSimilarMessages: async () => []
})

export function useEnhancedChat() {
  return useContext(EnhancedChatContext)
}

interface EnhancedChatProviderProps {
  children: ReactNode
  apiKey?: string
  initialMessages?: Message[]
  id?: string
}

export function EnhancedChatProvider({
  children,
  apiKey,
  initialMessages,
  id
}: EnhancedChatProviderProps) {
  const [chatService, setChatService] = useState<EnhancedChatService | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentTopics, setCurrentTopics] = useState<ExtractedTopic[]>([])
  const [contentRecommendations, setContentRecommendations] = useState<ContentRecommendation[]>([])
  const [responseRecommendations, setResponseRecommendations] = useState<ResponseRecommendation[]>([])
  
  // Initialize the chat service
  useEffect(() => {
    const initChatService = async () => {
      try {
        setIsLoading(true)
        
        // Create a new chat service instance
        const service = new EnhancedChatService({
          apiKey,
          initialMessages,
          id
        })
        
        await service.init()
        setChatService(service)
        
        // Listen for messages to update topics and recommendations
        service.on('message', async (message: Message, session: ChatSession) => {
          await updateTopicsAndRecommendations(session.messages)
        })
        
        // If there are initial messages, update topics and recommendations
        if (initialMessages && initialMessages.length > 0) {
          await updateTopicsAndRecommendations(initialMessages)
        }
      } catch (error) {
        console.error('Error initializing enhanced chat service:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    initChatService()
    
    return () => {
      // Clean up any listeners or resources
      if (chatService) {
        chatService.removeAllListeners()
      }
    }
  }, [apiKey, id])
  
  // Update topics and recommendations when messages change
  const updateTopicsAndRecommendations = async (messages: Message[]) => {
    try {
      // Extract topics from the messages
      const topics = await topicExtractionService.extractTopics(messages)
      setCurrentTopics(topics)
      
      // Get content recommendations
      const contentRecs = await contentRecommendationService.getContentRecommendations(messages)
      setContentRecommendations(contentRecs)
      
      // Get response recommendations
      const responseRecs = await contentRecommendationService.getResponseRecommendations(messages)
      setResponseRecommendations(responseRecs)
    } catch (error) {
      console.error('Error updating topics and recommendations:', error)
    }
  }
  
  // Search the current session for messages
  const searchCurrentSession = async (query: string, limit = 5): Promise<MessageSearchResult[]> => {
    if (!chatService) return []
    
    const currentSession = chatService.getCurrentSession()
    if (!currentSession) return []
    
    return semanticSearchService.searchMessages(query, currentSession.messages, { limit })
  }
  
  // Search across all sessions
  const searchAllSessions = async (query: string, limit = 10): Promise<MessageSearchResult[]> => {
    if (!chatService) return []
    
    // Get all sessions
    const sessions = chatService.getSessions()
    const sessionsWithMessages = sessions.map(session => ({
      sessionId: session.id,
      messages: session.messages
    }))
    
    return semanticSearchService.searchAcrossSessions(query, sessionsWithMessages, { limit })
  }
  
  // Find similar messages to a specific message
  const findSimilarMessages = async (messageId: string, limit = 3): Promise<MessageSearchResult[]> => {
    if (!chatService) return []
    
    const currentSession = chatService.getCurrentSession()
    if (!currentSession) return []
    
    return semanticSearchService.findSimilarMessages(messageId, currentSession.messages, { limit })
  }
  
  return (
    <EnhancedChatContext.Provider
      value={{
        chatService,
        isLoading,
        currentTopics,
        contentRecommendations,
        responseRecommendations,
        searchCurrentSession,
        searchAllSessions,
        findSimilarMessages
      }}
    >
      {children}
    </EnhancedChatContext.Provider>
  )
} 