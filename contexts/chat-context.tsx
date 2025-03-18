"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { ChatService, Message, ChatSession, AIModel, FileAttachment } from '@/lib/chat-service';
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
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [chatService, setChatService] = useState<ChatService | null>(null);
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
    
    import('@/lib/chat-service').then(({ ChatService, AVAILABLE_MODELS }) => {
      const service = ChatService.getInstance();
      setChatService(service);
      
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
      
      setIsInitialized(true);
    });
  }, [pathname]);
  
  /**
   * Fetch relevant content based on the user message
   */
  const fetchRelevantContent = async (message: string): Promise<ContentChunk[]> => {
    if (!message.trim()) return [];
    
    setIsSearchingContent(true);
    try {
      const response = await fetch(`/api/content-search?query=${encodeURIComponent(message)}&limit=3`);
      
      if (!response.ok) {
        console.error(`Content search failed with status: ${response.status}`);
        return [];
      }
      
      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('Error fetching relevant content:', error);
      return [];
    } finally {
      setIsSearchingContent(false);
    }
  };
  
  const processNavigationIntents = async (content: string) => {
    const suggestions = await navigation.getNavigationSuggestions(content);
    setNavigationSuggestions(suggestions);
  };
  
  const sendMessage = useCallback(async (content: string) => {
    if (content.trim() === "") return;
    
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
        if (!chatService) {
          throw new Error("Chat service not initialized");
        }
        
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
      
      setMessages((prev) => [...prev, response]);
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
  
  // Update the streaming message function
  const sendStreamingMessage = async (content: string, attachments?: FileAttachment[]) => {
    if (!chatService) {
      console.error("Chat service not initialized");
      return;
    }
    
    setIsStreaming(true);
    setIsTyping(true);
    try {
      // Log attachment info for debugging
      if (attachments && attachments.length > 0) {
        console.log(`Processing message with ${attachments.length} attachments:`, 
          attachments.map(a => ({ name: a.name, type: a.type, size: a.size })));
        
        // Add client-side validation for token estimation
        const estimatedTokens = attachments.reduce((acc, file) => {
          // Roughly estimate tokens based on file size and type
          let tokenEstimate = 0;
          
          if (file.type.startsWith('image/')) {
            // Images are usually described in a few hundred tokens
            tokenEstimate = 1000;
          } else if (file.type.includes('text') || 
                    file.name.match(/\.(txt|md|json|csv|js|py|html|css|tsx?)$/i)) {
            // Text files: ~4 chars per token, add 20% overhead
            tokenEstimate = Math.ceil((file.size / 4) * 1.2);
          } else if (file.name.match(/\.(pdf|doc|docx)$/i)) {
            // Documents: more overhead due to formatting
            tokenEstimate = Math.ceil((file.size / 3) * 1.5);
          } else {
            // Generic binary files
            tokenEstimate = 500; // Placeholder for metadata description
          }
          
          return acc + tokenEstimate;
        }, 0);
        
        const userQueryTokens = Math.ceil(content.length / 4);
        const totalEstimatedTokens = estimatedTokens + userQueryTokens;
        
        console.log(`Estimated tokens: ~${totalEstimatedTokens} (${userQueryTokens} from query, ${estimatedTokens} from attachments)`);
        
        // Warn if approaching token limits (16K is a common limit)
        if (totalEstimatedTokens > 12000) {
          console.warn('Warning: Approaching token limits with this file. The model may struggle to process it completely.');
        }
      }
      
      // Fetch relevant content first
      const contentResults = await fetchRelevantContent(content);
      setRelevantContent(contentResults);
      
      // Process navigation intents
      await processNavigationIntents(content);
      
      // Create a placeholder for the assistant's response with attachments
      chatService.createAssistantMessagePlaceholder(content, attachments);
      setCurrentSession(chatService.getCurrentSession());
      
      // Start streaming with the enriched context
      await chatService.sendStreamingMessage(content, contentResults, (partialMessage) => {
        // Update the current session with the partial response to display in real-time
        setCurrentSession(chatService.getCurrentSession());
        
        // Make sure messages are updated in the current component state
        setMessages(chatService.getCurrentChunk());
        
        // Check if streaming is complete based on the message state
        if (!partialMessage.isStreaming) {
          setIsStreaming(false);
        }
      });
      
      // Update sessions after streaming is complete
      setSessions(chatService.getSessions());
      setSessionsByCategory(chatService.getSessionsByCategory());
      
      // Update chunking information
      setTotalChunks(chatService.getTotalChunks());
      setCurrentChunkIndex(chatService.getCurrentChunkIndex());
      
      // Ensure messages state is synchronized with chatService
      setMessages(chatService.getCurrentChunk());
      
      // Make sure streaming is set to false when complete
      setIsStreaming(false);
    } catch (error) {
      // Make sure streaming is set to false on error
      setIsStreaming(false);
      console.error('Error sending streaming message:', error);
      // Format the error message for display
      let errorMessage = "I encountered an error processing your request.";
      
      if (error instanceof Error) {
        console.error('Error details:', error.message);
        
        if (attachments && attachments.length > 0) {
          if (error.message.toLowerCase().includes('token') || 
              error.message.toLowerCase().includes('limit')) {
            errorMessage = "The file you uploaded is too large for the AI to process. Please try with a smaller file or extract the key information.";
          } else if (error.message.toLowerCase().includes('url') || 
                    error.message.toLowerCase().includes('access')) {
            errorMessage = "There was a problem accessing your uploaded file. The URL might be invalid or the file format isn't supported.";
          }
        }
      }
      
      // Create a custom error message
      const errorResponseMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: errorMessage,
        timestamp: Date.now(),
        metadata: { type: "error" }
      };
      
      // Add it to the messages
      setMessages(prev => [...prev, errorResponseMessage]);
      
      // Ensure the error is shown to the user
      chatService.updateAssistantMessageWithError(error);
      setCurrentSession(chatService.getCurrentSession());
      
      // Also update messages state to show the error
      setMessages(chatService.getCurrentChunk());
    } finally {
      setIsTyping(false);
    }
  };
  
  const createSession = useCallback((initialTopic?: string) => {
    if (!chatService) return;
    
    chatService.createSession(initialTopic);
    setCurrentSession(chatService.getCurrentSession());
    setSessions(chatService.getSessions());
    setSessionsByCategory(chatService.getSessionsByCategory());
    setTotalChunks(chatService.getTotalChunks());
    setCurrentChunkIndex(chatService.getCurrentChunkIndex());
  }, [chatService]);
  
  const switchSession = useCallback((id: string) => {
    if (!chatService) return;
    
    chatService.setCurrentSession(id);
    setCurrentSession(chatService.getCurrentSession());
    setTotalChunks(chatService.getTotalChunks());
    setCurrentChunkIndex(chatService.getCurrentChunkIndex());
  }, [chatService]);
  
  const deleteSession = (id: string) => {
    if (!chatService) return;
    
    chatService.deleteSession(id);
    setCurrentSession(chatService.getCurrentSession());
    setSessions(chatService.getSessions());
    setSessionsByCategory(chatService.getSessionsByCategory());
  };
  
  const renameSession = (id: string, title: string) => {
    if (!chatService) return;
    
    chatService.renameSession(id, title);
    setCurrentSession(chatService.getCurrentSession());
    setSessions(chatService.getSessions());
    setSessionsByCategory(chatService.getSessionsByCategory());
  };
  
  const setCategoryForSession = (id: string, category: string) => {
    if (!chatService) return;
    
    chatService.setCategoryForSession(id, category);
    setSessions(chatService.getSessions());
    setSessionsByCategory(chatService.getSessionsByCategory());
  };
  
  const handleSetCurrentPage = (page: string) => {
    if (!chatService) return;
    
    chatService.setCurrentPage(page);
    setCurrentPage(page);
  };
  
  const handleSetModel = (modelId: string) => {
    if (!chatService) return;
    
    if (chatService.setModel(modelId)) {
      setSelectedModel(modelId);
    }
  };
  
  const resetChat = useCallback(() => {
    if (!chatService) return;
    
    chatService.resetChat();
    setCurrentSession(chatService.getCurrentSession());
    setTotalChunks(chatService.getTotalChunks());
    setCurrentChunkIndex(chatService.getCurrentChunkIndex());
    setNavigationSuggestions([]);
  }, [chatService]);
  
  // Add chunk navigation functions
  const navigateToNextChunk = useCallback(() => {
    if (!chatService) return false;
    
    const success = chatService.nextChunk();
    if (success) {
      setCurrentSession(chatService.getCurrentSession());
      setCurrentChunkIndex(chatService.getCurrentChunkIndex());
      return true;
    }
    return false;
  }, [chatService]);
  
  const navigateToPreviousChunk = useCallback(() => {
    if (!chatService) return false;
    
    const success = chatService.previousChunk();
    if (success) {
      setCurrentSession(chatService.getCurrentSession());
      setCurrentChunkIndex(chatService.getCurrentChunkIndex());
      return true;
    }
    return false;
  }, [chatService]);
  
  // Provide default values during SSR to prevent hydration mismatches
  const contextValue = {
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
    createSession,
    switchSession,
    deleteSession,
    renameSession,
    setCategoryForSession,
    setCurrentPage: handleSetCurrentPage,
    setModel: handleSetModel,
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
  };
  
  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
} 