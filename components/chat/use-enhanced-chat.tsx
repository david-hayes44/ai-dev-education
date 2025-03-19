"use client"

import { useEnhancedChat } from "@/contexts/enhanced-chat-context"

/**
 * This is a drop-in replacement for the useChat hook.
 * It uses the enhanced chat context under the hood, but provides
 * the same interface as the original useChat hook for compatibility.
 */
export function useChat() {
  return useEnhancedChat()
} 