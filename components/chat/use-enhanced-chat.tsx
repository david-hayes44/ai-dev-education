"use client"

import { useEnhancedChat } from "@/lib/hooks/use-enhanced-chat"
import { useChat as useOriginalChat } from "@/contexts/chat-context"

/**
 * This is a compatibility layer to bridge between the original chat system and the enhanced chat system.
 * It provides a similar interface to useChat() but with additional capabilities from the enhanced system.
 */
export function useChat() {
  // Get both the original chat and enhanced chat contexts
  const originalChat = useOriginalChat()
  const enhancedChat = useEnhancedChat()
  
  // Return a merged context with both functionality sets
  return {
    ...originalChat,
    
    // Enhanced features
    currentTopics: enhancedChat.currentTopics,
    contentRecommendations: enhancedChat.contentRecommendations,
    responseRecommendations: enhancedChat.responseRecommendations,
    searchCurrentSession: enhancedChat.searchCurrentSession,
    searchAllSessions: enhancedChat.searchAllSessions,
    findSimilarMessages: enhancedChat.findSimilarMessages
  }
} 