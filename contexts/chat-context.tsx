"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ChatService, Message, ChatSession, AIModel, FileAttachment } from '@/lib/chat-service';
import { usePathname } from 'next/navigation';

interface ChatContextType {
  sessions: ChatSession[];
  sessionsByCategory: Record<string, ChatSession[]>;
  currentSession: ChatSession | null;
  isLoading: boolean;
  isStreaming: boolean;
  currentPage: string;
  selectedModel: string;
  availableModels: AIModel[];
  sendMessage: (content: string, attachments?: FileAttachment[]) => Promise<void>;
  sendStreamingMessage: (content: string, attachments?: FileAttachment[]) => Promise<void>;
  createSession: (initialTopic?: string) => void;
  switchSession: (id: string) => void;
  deleteSession: (id: string) => void;
  renameSession: (id: string, title: string) => void;
  setCategoryForSession: (id: string, category: string) => void;
  setCurrentPage: (page: string) => void;
  setModel: (modelId: string) => void;
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
      
      // Set current page
      if (pathname) {
        const pageName = pathname.split('/').pop() || 'home';
        service.setCurrentPage(pageName);
        setCurrentPage(pageName);
      }
      
      setIsInitialized(true);
    });
  }, [pathname]);
  
  const sendMessage = async (content: string, attachments?: FileAttachment[]) => {
    if (!chatService) return;
    
    setIsLoading(true);
    try {
      await chatService.sendMessage(content, attachments);
      setCurrentSession(chatService.getCurrentSession());
      setSessions(chatService.getSessions());
      setSessionsByCategory(chatService.getSessionsByCategory());
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // New function to send streaming messages
  const sendStreamingMessage = async (content: string, attachments?: FileAttachment[]) => {
    if (!chatService) return;
    
    setIsStreaming(true);
    try {
      // Create a placeholder for the assistant's response
      chatService.createAssistantMessagePlaceholder(content, attachments);
      setCurrentSession(chatService.getCurrentSession());
      
      // Start streaming
      await chatService.sendStreamingMessage(content, (partialMessage) => {
        // Update the current session with the partial response to display in real-time
        setCurrentSession(chatService.getCurrentSession());
      });
      
      // Update sessions after streaming is complete
      setSessions(chatService.getSessions());
      setSessionsByCategory(chatService.getSessionsByCategory());
    } catch (error) {
      console.error('Error sending streaming message:', error);
      // Ensure the error is shown to the user
      chatService.updateAssistantMessageWithError(error);
      setCurrentSession(chatService.getCurrentSession());
    } finally {
      setIsStreaming(false);
    }
  };
  
  const createSession = (initialTopic?: string) => {
    if (!chatService) return;
    
    chatService.createSession(initialTopic);
    setCurrentSession(chatService.getCurrentSession());
    setSessions(chatService.getSessions());
    setSessionsByCategory(chatService.getSessionsByCategory());
  };
  
  const switchSession = (id: string) => {
    if (!chatService) return;
    
    chatService.setCurrentSession(id);
    setCurrentSession(chatService.getCurrentSession());
  };
  
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
    sendMessage,
    sendStreamingMessage,
    createSession,
    switchSession,
    deleteSession,
    renameSession,
    setCategoryForSession,
    setCurrentPage: handleSetCurrentPage,
    setModel: handleSetModel
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