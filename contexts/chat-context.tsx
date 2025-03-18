"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { ChatService, Message, ChatSession, AIModel, FileAttachment, MessageMetadataType } from '@/lib/chat-service';
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
    
    // Check if we're already streaming - don't allow a new streaming request
    if (isStreaming) {
      console.warn("Already processing a streaming message, please wait");
      // Create a visual indication that the request was ignored due to ongoing streaming
      if (typeof window !== 'undefined') {
        // Flash the chat input to indicate the request was ignored
        const chatInputElement = document.querySelector('.chat-input-container');
        if (chatInputElement) {
          chatInputElement.classList.add('flash-warning');
          setTimeout(() => {
            chatInputElement.classList.remove('flash-warning');
          }, 1000);
        }
      }
      return;
    }
    
    // Set streaming state immediately to prevent double clicks
    setIsStreaming(true);
    setIsTyping(true);
    
    // Create a timeout to reset the streaming state if it takes too long
    let streamTimeout: NodeJS.Timeout | null = setTimeout(() => {
      // If this executes, the streaming didn't complete properly
      console.warn("Streaming request timed out after 30 seconds");
      setIsStreaming(false);
      setIsTyping(false);
      
      // Find and update any messages stuck in loading state
      if (currentSession) {
        const updatedMessages = currentSession.messages.map(msg => {
          if (msg.isStreaming || (msg.metadata?.type === "loading")) {
            return {
              ...msg,
              isStreaming: false,
              content: msg.content || "I'm sorry, I was unable to generate a response. Please try again.",
              metadata: { type: "error" as MessageMetadataType }
            };
          }
          return msg;
        });
        
        // Update session with fixed messages
        if (chatService) {
          // Replace the current session's messages and update state
          chatService.resetChat(); // Reset the current chat first
          
          // Then manually set our messages in the current context
          setMessages(updatedMessages);
          
          // Refresh the session from the chat service
          setCurrentSession(chatService.getCurrentSession());
        }
      }
      
      // Reset the timeout reference
      streamTimeout = null;
    }, 30000); // 30 second timeout
    
    // Define a cleanup function for the streaming state
    const cleanupStreaming = () => {
      // Clear the timeout if it's still active
      if (streamTimeout) {
        clearTimeout(streamTimeout);
        streamTimeout = null;
      }
      
      // Reset UI state
      setIsStreaming(false);
      setIsTyping(false);
    };
    
    try {
      // Log attachment info for debugging
      if (attachments && attachments.length > 0) {
        console.log(`Processing message with ${attachments.length} attachments:`, 
          attachments.map(a => ({ name: a.name, type: a.type, size: a.size })));
        
        // Check for image attachments and add a default prompt if the content is empty
        const hasImageAttachments = attachments.some(file => file.type.startsWith('image/'));
        if (hasImageAttachments && !content.trim()) {
          // If the user just uploaded an image without text, use a default prompt
          content = "Please describe this image for me.";
        }
        
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
      
      // Generate a unique ID for this streaming request to track it
      const streamingRequestId = `req-${Date.now()}`;
      
      // Fetch relevant content first
      const contentResults = await fetchRelevantContent(content);
      setRelevantContent(contentResults);
      
      // Process navigation intents
      await processNavigationIntents(content);
      
      // Before creating a new message, update the current session to get the latest state
      const latestSession = chatService.getCurrentSession();
      setCurrentSession(latestSession);
      
      // Check again if we're still streaming (could have changed during async operations)
      if (isStreaming && latestSession?.messages.some(m => m.isStreaming)) {
        console.warn("Another streaming operation started during preparation");
        cleanupStreaming();
        return;
      }
      
      // Create a placeholder for the assistant's response with attachments
      const assistantPlaceholder = chatService.createAssistantMessagePlaceholder(content, attachments);
      setCurrentSession(chatService.getCurrentSession());
      
      // Track the message ID to avoid duplicates
      const messageId = assistantPlaceholder.id;
      
      // Start streaming with the enriched context
      await chatService.sendStreamingMessage(content, contentResults, (partialMessage) => {
        // Check if this is the right message (to avoid updating the wrong message)
        if (partialMessage.id === messageId) {
          setMessages(chatService.getCurrentChunk());
          
          // Check if streaming has ended
          if (!partialMessage.isStreaming) {
            cleanupStreaming();
          }
        }
      }, attachments);
      
      setMessages(chatService.getCurrentChunk());
      
      // Remember to clear the timeout when streaming completes successfully
      cleanupStreaming();
    } catch (error) {
      console.error("Error in streaming message:", error);
      
      // Make sure we clean up properly even on error
      cleanupStreaming();
      
      // Find and update any messages stuck in loading state
      if (currentSession) {
        const updatedMessages = currentSession.messages.map(msg => {
          if (msg.isStreaming || (msg.metadata?.type === "loading")) {
            return {
              ...msg,
              isStreaming: false,
              content: "I'm sorry, I encountered an error while generating a response. Please try again.",
              metadata: { type: "error" as MessageMetadataType }
            };
          }
          return msg;
        });
        
        // Update session with fixed messages
        if (chatService) {
          // Use the chat service to update the assistant message with an error
          chatService.updateAssistantMessageWithError(new Error("Streaming response error"));
          
          // Refresh our UI state from the chat service
          setMessages(chatService.getCurrentChunk());
          setCurrentSession(chatService.getCurrentSession());
        }
      }
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
  
  // Add useEffect to ensure cleanup of streaming operations on unmount or session change
  useEffect(() => {
    // Store current session for cleanup
    const sessionBeforeUnmount = currentSession;
    
    // Return cleanup function
    return () => {
      // Check if there was a streaming operation in progress and the session changed
      if (isStreaming && sessionBeforeUnmount && sessionBeforeUnmount.id !== currentSession?.id) {
        console.log("Cleaning up streaming operation due to session change or unmount");
        setIsStreaming(false);
        setIsTyping(false);
        
        // If chatService is available, update any streaming messages to error state
        if (chatService && sessionBeforeUnmount) {
          const messagesWithErrors = sessionBeforeUnmount.messages.map(msg => {
            if (msg.isStreaming || msg.metadata?.type === "loading") {
              return {
                ...msg,
                isStreaming: false,
                content: "Streaming was interrupted.",
                metadata: { type: "error" as MessageMetadataType }
              };
            }
            return msg;
          });
          
          // Force update
          chatService.updateAssistantMessageWithError(new Error("Component unmounted during streaming"));
        }
      }
    };
  }, [currentSession, isStreaming, chatService]);
  
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