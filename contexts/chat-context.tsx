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
    const streamTimeout: NodeJS.Timeout = setTimeout(() => {
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
              content: "I'm sorry, the response timed out. Please try again.",
              isStreaming: false,
              metadata: { type: "error" as MessageMetadataType }
            };
          }
          return msg;
        });
        
        // Update local messages and current session
        setMessages(updatedMessages);
      }
    }, 30000);
    
    // Add the user message to the chat
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: Date.now(),
    };
    
    // If there are file attachments, add them to the message
    if (attachments && attachments.length > 0) {
      userMessage.attachments = attachments;
    }
    
    // Add user message to local state and set input value to empty
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    
    try {
      // Reset any previous navigation suggestions
      setNavigationSuggestions([]);
      
      // Search for relevant content if available
      let contentResults: ContentChunk[] = [];
      if (!attachments || attachments.length === 0) {
        // Only perform content search if we're not handling file attachments
        setIsSearchingContent(true);
        try {
          // Search for relevant content
          await searchContent(content);
          contentResults = results || [];
        } catch (err) {
          console.error("Error searching content:", err);
        } finally {
          setIsSearchingContent(false);
        }
      }
      
      // Process message with streaming updates on the client side
      try {
        console.log("Starting AI Tutor chat request...");
        
        // First, create a placeholder for the assistant's response
        const placeholderMessage: Message = {
          id: `msg_${Date.now().toString()}`,
          role: "assistant",
          content: "...",
          timestamp: Date.now(),
          isStreaming: true,
          metadata: { type: "streaming" as MessageMetadataType }
        };
        
        // Add placeholder to messages
        setMessages(prev => [...prev, placeholderMessage]);
        
        // Create an EventSource to receive streaming updates from the server
        console.log("Making fetch request to /api/chat...");
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: content,
            messages: [...messages.filter(m => m.role !== "system"), userMessage]
              .map(({ role, content }) => ({ role, content })),
            context: {
              relevantContent: contentResults,
              currentPage: navigation.currentPage,
              pageTitle: navigation.pageTitle,
              pageDescription: navigation.pageDescription
            }
          })
        });
        
        // Ensure we got a response with the right content type
        console.log("Response received:", response.status, response.headers.get('Content-Type'));
        if (!response.ok || !response.body) {
          throw new Error(`Server error: ${response.status}`);
        }
        
        // Process the streaming response
        console.log("Starting to process response stream...");
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        
        while (true) {
          const { value, done } = await reader.read();
          
          if (done) {
            console.log("Stream complete");
            
            // One final update to ensure the message is marked as not streaming
            setMessages(prev => prev.map(m => 
              m.id === placeholderMessage.id 
                ? { ...m, isStreaming: false } 
                : m
            ));
            
            // Cleanup after streaming is complete
            setIsStreaming(false);
            setIsTyping(false);
            
            break;
          }
          
          // Decode the chunk and handle data events
          const chunk = decoder.decode(value, { stream: true });
          console.log("Stream chunk received:", chunk);
          
          // Process line by line
          const lines = chunk.split('\n\n');
          
          for (const line of lines) {
            if (line.trim() === '' || !line.startsWith('data: ')) continue;
            
            const data = line.slice(6).trim();
            
            if (data === '[DONE]') {
              console.log("Stream done marker received");
              continue;
            }
            
            try {
              // Parse the JSON data from the stream
              console.log("Parsing JSON from stream:", data);
              const parsed = JSON.parse(data);
              
              // Create a properly typed message
              const updatedMessage: Message = {
                ...parsed,
                isStreaming: true,
                content: parsed.content || "",
                metadata: {
                  ...parsed.metadata,
                  type: parsed.metadata?.type as MessageMetadataType
                }
              };
              
              console.log("Updating message content:", updatedMessage.content ? updatedMessage.content.substring(0, 50) + "..." : "(empty content)");
              
              // Update messages with the typed message
              setMessages(prev => prev.map(m => 
                m.id === placeholderMessage.id ? updatedMessage : m
              ));
              
              // If we got navigation suggestions, update them
              if (parsed.metadata?.navigationSuggestions?.length > 0) {
                setNavigationSuggestions(parsed.metadata.navigationSuggestions);
              }
            } catch (error) {
              console.warn("Error parsing streaming response:", error, "Raw data:", data);
            }
          }
        }
        
        // Complete stream handling
        console.log("Streaming response completed");
        
      } catch (error) {
        console.error("Streaming API error:", error);
        
        // Update the last message with an error
        setMessages(prev => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          
          if (lastMessage.role === "assistant") {
            newMessages[newMessages.length - 1] = {
              ...lastMessage,
              content: `I'm sorry, I encountered an error while processing your request. ${error instanceof Error ? error.message : "Please try again."}`,
              isStreaming: false,
              metadata: { type: "error" }
            };
          }
          
          return newMessages;
        });
      }
      
    } catch (error) {
      console.error("Error in chat:", error);
      
      // Add an error message to the chat
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: "assistant",
        content: "I'm sorry, I encountered an error while processing your request. Please try again.",
        timestamp: Date.now(),
        metadata: { type: "error" },
      }]);
    } finally {
      // Always clear the streaming state and timeout
      setIsStreaming(false);
      setIsTyping(false);
      if (streamTimeout) clearTimeout(streamTimeout);
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