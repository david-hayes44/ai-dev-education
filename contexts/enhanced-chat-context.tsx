/**
 * NOTE: This version is temporarily disabled to avoid conflicts with lib/hooks/use-enhanced-chat.tsx
 * Use the provider from lib/hooks/use-enhanced-chat.tsx instead.
 */

"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { EnhancedChatService } from '@/lib/chat-service-enhanced';
import { Message, ChatSession, AIModel, FileAttachment, MessageMetadataType } from '@/lib/chat-service';
import { usePathname } from 'next/navigation';
import { ContentChunk } from '@/lib/content-indexing-service';
import { useContentSearch } from "@/hooks/use-content-search";
import { useNavigation, type NavigationSuggestion } from "@/contexts/navigation-context";

interface ChatContextType {
  sessions: ChatSession[];
  sessionsByCategory: Record<string, ChatSession[]>;
  currentSession: ChatSession | null;
  isLoading: boolean;
  isStreaming: boolean;
  currentPage: string;
  selectedModel: string;
  availableModels: AIModel[];
  relevantContent: ContentChunk[];
  isSearchingContent: boolean;
  sendMessage: (content: string) => Promise<void>;
  sendStreamingMessage: (content: string, attachments?: FileAttachment[]) => Promise<void>;
  createSession: (initialTopic?: string) => void;
  switchSession: (id: string) => void;
  deleteSession: (id: string) => void;
  renameSession: (id: string, title: string) => void;
  setCategoryForSession: (id: string, category: string) => void;
  setCurrentPage: (page: string) => void;
  setModel: (modelId: string) => void;
  messages: Message[];
  isTyping: boolean;
  inputValue: string;
  setInputValue: (value: string) => void;
  resetChat: () => void;
  navigationSuggestions: NavigationSuggestion[];
  totalChunks: number;
  currentChunkIndex: number;
  navigateToNextChunk: () => boolean;
  navigateToPreviousChunk: () => boolean;
  exportSession: (format: 'json' | 'text') => Promise<void>;
  importSession: (file: File) => Promise<void>;
}

const EnhancedChatContext = createContext<ChatContextType | undefined>(undefined);

// Temporarily disabled to avoid conflicts
export function _DisabledEnhancedChatProvider({ children }: { children: ReactNode }) {
  // Original implementation...
  return <>{children}</>  // Just pass children through for now
}

// Use a placeholder function that warns about the conflict
export function useEnhancedChat() {
  console.warn('Using deprecated enhanced chat context from contexts/enhanced-chat-context.tsx. Use the version from lib/hooks/use-enhanced-chat.tsx instead.');
  return useContext(EnhancedChatContext);
} 