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

export function EnhancedChatProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [chatService, setChatService] = useState<EnhancedChatService | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [sessionsByCategory, setSessionsByCategory] = useState<Record<string, ChatSession[]>>({});
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [currentPage, setCurrentPage] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("google/gemini-2.0-flash-thinking-exp:free");
  const [availableModels, setAvailableModels] = useState<AIModel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [relevantContent, setRelevantContent] = useState<ContentChunk[]>([]);
  const [isSearchingContent, setIsSearchingContent] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>("");
  const { searchContent, results, isSearching } = useContentSearch();
  const [navigationSuggestions, setNavigationSuggestions] = useState<NavigationSuggestion[]>([]);
  const navigation = useNavigation();
  const [totalChunks, setTotalChunks] = useState<number>(1);
  const [currentChunkIndex, setCurrentChunkIndex] = useState<number>(0);
  
  // Track current page
  useEffect(() => {
    if (pathname && chatService) {
      const pageName = pathname.split('/').pop() || 'home';
      chatService.setCurrentPage(pageName);
      setCurrentPage(pageName);
    }
  }, [pathname, chatService]);
  
  // Initialize on client side only
  useEffect(() => {
    // Skip initialization during SSR
    if (typeof window === 'undefined') return;
    
    const initialize = async () => {
      try {
        const { EnhancedChatService } = await import('@/lib/chat-service-enhanced');
        const { AVAILABLE_MODELS } = await import('@/lib/chat-service');
        
        const service = EnhancedChatService.getInstance();
        setChatService(service);
        
        // Initialize service and session state
        const currentSession = service.getCurrentSession();
        if (!currentSession) {
          service.createSession();
        }
        
        setCurrentSession(service.getCurrentSession());
        setSessions(service.getSessions());
        setSessionsByCategory(service.getSessionsByCategory());
        setSelectedModel(service.getSelectedModel());
        setAvailableModels(AVAILABLE_MODELS);
        
        // Set chunking information
        setTotalChunks(service.getTotalChunks());
        setCurrentChunkIndex(service.getCurrentChunkIndex());
        
        // Set current page
        if (pathname) {
          const pageName = pathname.split('/').pop() || 'home';
          service.setCurrentPage(pageName);
          setCurrentPage(pageName);
        }
        
        // If we have a current session, update messages
        if (service.getCurrentSession()) {
          setMessages(service.getCurrentChunk());
        }
        
        setIsInitialized(true);
      } catch (error) {
        console.error('Error initializing enhanced chat service:', error);
      }
    };
    
    initialize();
  }, [pathname]);
  
  // Process navigation intents
  const processNavigationIntents = async (content: string) => {
    const suggestions = await navigation.getNavigationSuggestions(content);
    setNavigationSuggestions(suggestions);
  };
  
  // Send a message
  const sendMessage = useCallback(async (content: string) => {
    if (content.trim() === "" || !chatService) return;
    
    // Add user message to chat
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: Date.now(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);
    setInputValue("");
    
    try {
      // Search for relevant content
      await searchContent(content);
      
      // Process navigation intents
      await processNavigationIntents(content);
      
      // Send message to chat service with content and context
      let response: Message;
      
      try {
        response = await chatService.sendMessage(
          content, 
          {
            relevantContent: results || [],
            currentPage: navigation.currentPage,
            pageTitle: navigation.pageTitle,
            pageDescription: navigation.pageDescription
          }
        );
      } catch (error) {
        // If the chat service throws an error, create an error message
        response = {
          id: Date.now().toString(),
          role: "assistant",
          content: "I'm sorry, I encountered an error communicating with the AI service. Please try again later.",
          timestamp: Date.now(),
          metadata: { type: "error" },
        };
      }
      
      // Update messages with the response
      setMessages((prev) => {
        // If the last message is from the assistant and has the same ID, replace it
        if (prev.length > 0 && prev[prev.length - 1].role === "assistant" && prev[prev.length - 1].id === response.id) {
          return [...prev.slice(0, -1), response];
        }
        // Otherwise, add the new message
        return [...prev, response];
      });
      
      // Update current session and sessions list
      if (chatService.getCurrentSession()) {
        setCurrentSession(chatService.getCurrentSession());
        setSessions(chatService.getSessions());
        setSessionsByCategory(chatService.getSessionsByCategory());
      }
    } catch (error) {
      console.error("Error in chat process:", error);
      
      // Add error message
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: "I'm sorry, I encountered an error. Please try again.",
        timestamp: Date.now(),
        metadata: { type: "error" },
      };
      
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  }, [results, searchContent, navigation, processNavigationIntents, chatService]);
  
  // Streaming message implementation (placeholder)
  const sendStreamingMessage = async (content: string, attachments?: FileAttachment[]) => {
    // For now, this just calls the standard sendMessage function
    // In a future implementation, this could be enhanced to support streaming responses
    await sendMessage(content);
  };
  
  // Create a new chat session
  const createNewSession = useCallback((initialTopic?: string) => {
    if (!chatService) return;
    
    chatService.createSession(initialTopic);
    setCurrentSession(chatService.getCurrentSession());
    setSessions(chatService.getSessions());
    setSessionsByCategory(chatService.getSessionsByCategory());
    setMessages(chatService.getCurrentChunk());
    setTotalChunks(chatService.getTotalChunks());
    setCurrentChunkIndex(chatService.getCurrentChunkIndex());
  }, [chatService]);
  
  // Switch to a different chat session
  const switchToSession = useCallback(async (id: string) => {
    if (!chatService) return;
    
    await chatService.switchSession(id);
    setCurrentSession(chatService.getCurrentSession());
    setSessions(chatService.getSessions());
    setSessionsByCategory(chatService.getSessionsByCategory());
    setMessages(chatService.getCurrentChunk());
    setTotalChunks(chatService.getTotalChunks());
    setCurrentChunkIndex(chatService.getCurrentChunkIndex());
  }, [chatService]);
  
  // Delete a chat session
  const deleteExistingSession = useCallback(async (id: string) => {
    if (!chatService) return;
    
    await chatService.deleteSession(id);
    setCurrentSession(chatService.getCurrentSession());
    setSessions(chatService.getSessions());
    setSessionsByCategory(chatService.getSessionsByCategory());
    setMessages(chatService.getCurrentChunk());
    setTotalChunks(chatService.getTotalChunks());
    setCurrentChunkIndex(chatService.getCurrentChunkIndex());
  }, [chatService]);
  
  // Rename a chat session
  const renameExistingSession = useCallback(async (id: string, title: string) => {
    if (!chatService) return;
    
    await chatService.renameSession(id, title);
    setCurrentSession(chatService.getCurrentSession());
    setSessions(chatService.getSessions());
    setSessionsByCategory(chatService.getSessionsByCategory());
  }, [chatService]);
  
  // Set category for a chat session
  const setCategoryForExistingSession = useCallback(async (id: string, category: string) => {
    if (!chatService) return;
    
    await chatService.setCategoryForSession(id, category);
    setCurrentSession(chatService.getCurrentSession());
    setSessions(chatService.getSessions());
    setSessionsByCategory(chatService.getSessionsByCategory());
  }, [chatService]);
  
  // Set the selected model
  const setModelForChat = useCallback((modelId: string) => {
    if (!chatService) return;
    
    chatService.setModel(modelId);
    setSelectedModel(modelId);
  }, [chatService]);
  
  // Navigate to the next chunk of messages
  const navigateToNextChunk = useCallback(() => {
    if (!chatService) return false;
    
    const success = chatService.navigateToNextChunk();
    if (success) {
      setMessages(chatService.getCurrentChunk());
      setCurrentChunkIndex(chatService.getCurrentChunkIndex());
    }
    return success;
  }, [chatService]);
  
  // Navigate to the previous chunk of messages
  const navigateToPreviousChunk = useCallback(() => {
    if (!chatService) return false;
    
    const success = chatService.navigateToPreviousChunk();
    if (success) {
      setMessages(chatService.getCurrentChunk());
      setCurrentChunkIndex(chatService.getCurrentChunkIndex());
    }
    return success;
  }, [chatService]);
  
  // Reset the chat
  const resetChat = useCallback(() => {
    if (!chatService) return;
    
    createNewSession();
  }, [chatService, createNewSession]);
  
  // Export a conversation
  const exportSession = useCallback(async (format: 'json' | 'text') => {
    if (!chatService || !currentSession) return;
    
    const blob = await chatService.exportSession(format);
    if (!blob) {
      console.error('Failed to export session');
      return;
    }
    
    // Create a download link
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentSession.title.replace(/\s+/g, '_')}_export.${format === 'json' ? 'json' : 'txt'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [chatService, currentSession]);
  
  // Import a conversation
  const importSession = useCallback(async (file: File) => {
    if (!chatService) return;
    
    const sessionId = await chatService.importSession(file);
    if (sessionId) {
      await switchToSession(sessionId);
    }
  }, [chatService, switchToSession]);
  
  // Create the context value
  const contextValue: ChatContextType = {
    sessions,
    sessionsByCategory,
    currentSession,
    isLoading,
    isStreaming,
    currentPage,
    selectedModel,
    availableModels,
    relevantContent,
    isSearchingContent,
    sendMessage,
    sendStreamingMessage,
    createSession: createNewSession,
    switchSession: switchToSession,
    deleteSession: deleteExistingSession,
    renameSession: renameExistingSession,
    setCategoryForSession: setCategoryForExistingSession,
    setCurrentPage,
    setModel: setModelForChat,
    messages,
    isTyping,
    inputValue,
    setInputValue,
    resetChat,
    navigationSuggestions,
    totalChunks,
    currentChunkIndex,
    navigateToNextChunk,
    navigateToPreviousChunk,
    exportSession,
    importSession,
  };
  
  return (
    <EnhancedChatContext.Provider value={contextValue}>
      {children}
    </EnhancedChatContext.Provider>
  );
}

export function useEnhancedChat() {
  const context = useContext(EnhancedChatContext);
  if (context === undefined) {
    throw new Error('useEnhancedChat must be used within an EnhancedChatProvider');
  }
  return context;
} 