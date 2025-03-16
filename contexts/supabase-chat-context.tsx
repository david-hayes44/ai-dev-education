"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ChatSession, Message, AIModel, FileAttachment, AVAILABLE_MODELS } from '@/lib/chat-service';
import { usePathname } from 'next/navigation';
import { 
  createChatSession, 
  getChatSessions, 
  getChatSession,
  deleteChatSession,
  updateChatSession,
  addChatMessage,
  subscribeToChatMessages,
  subscribeToMessageUpdates
} from '@/lib/supabase-chat-service';
import { useToast } from '@/components/ui/use-toast';

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
  createSession: (initialTopic?: string) => Promise<void>;
  switchSession: (id: string) => Promise<void>;
  deleteSession: (id: string) => Promise<void>;
  renameSession: (id: string, title: string) => Promise<void>;
  setCategoryForSession: (id: string, category: string) => Promise<void>;
  setCurrentPage: (page: string) => void;
  setModel: (modelId: string) => void;
}

const SupabaseChatContext = createContext<ChatContextType | undefined>(undefined);

export function SupabaseChatProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { toast } = useToast();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [sessionsByCategory, setSessionsByCategory] = useState<Record<string, ChatSession[]>>({});
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [currentPage, setCurrentPage] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("anthropic/claude-3.7-sonnet:beta");
  const [availableModels, setAvailableModels] = useState<AIModel[]>(AVAILABLE_MODELS);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Track current page
  useEffect(() => {
    if (pathname) {
      const pageName = pathname.split('/').pop() || 'home';
      setCurrentPage(pageName);
    }
  }, [pathname]);
  
  // Group sessions by category
  const updateSessionsByCategory = (sessionsList: ChatSession[]) => {
    const categorized: Record<string, ChatSession[]> = {};
    
    // Add uncategorized key
    categorized['uncategorized'] = [];
    
    sessionsList.forEach(session => {
      const category = session.category?.toLowerCase() || 'uncategorized';
      
      if (!categorized[category]) {
        categorized[category] = [];
      }
      
      categorized[category].push(session);
    });
    
    setSessionsByCategory(categorized);
  };
  
  // Initialize - load sessions from Supabase
  useEffect(() => {
    const loadSessions = async () => {
      try {
        const allSessions = await getChatSessions();
        setSessions(allSessions);
        updateSessionsByCategory(allSessions);
        
        // If we have sessions but no current session, set the first one
        if (allSessions.length > 0 && !currentSession) {
          setCurrentSession(allSessions[0]);
        }
        
        // If no sessions exist, create one
        if (allSessions.length === 0) {
          createSession();
        }
        
        setIsInitialized(true);
      } catch (error) {
        console.error('Error loading chat sessions:', error);
        toast({
          title: "Error",
          description: "Failed to load chat sessions. Please try again.",
          variant: "destructive"
        });
      }
    };
    
    loadSessions();
  }, []);
  
  // Set up realtime subscriptions for the current session
  useEffect(() => {
    if (!currentSession) return;
    
    // Subscribe to new messages in the current session
    const messageSubscription = subscribeToChatMessages(
      currentSession.id,
      (newMessage) => {
        setCurrentSession(prevSession => {
          if (!prevSession) return null;
          
          const updatedMessages = [
            ...prevSession.messages.filter(m => m.id !== newMessage.id),
            newMessage
          ].sort((a, b) => a.timestamp - b.timestamp);
          
          return {
            ...prevSession,
            messages: updatedMessages
          };
        });
      }
    );
    
    // Subscribe to updates to existing messages
    const updateSubscription = subscribeToMessageUpdates(
      currentSession.id,
      (updatedMessage) => {
        setCurrentSession(prevSession => {
          if (!prevSession) return null;
          
          const updatedMessages = prevSession.messages.map(message =>
            message.id === updatedMessage.id ? updatedMessage : message
          );
          
          return {
            ...prevSession,
            messages: updatedMessages
          };
        });
      }
    );
    
    // Clean up subscriptions
    return () => {
      messageSubscription();
      updateSubscription();
    };
  }, [currentSession?.id]);
  
  const sendMessage = async (content: string, attachments?: FileAttachment[]) => {
    if (!currentSession) {
      console.error('No active session');
      return;
    }
    
    setIsLoading(true);
    try {
      // Add the user message
      const userMessage: Message = await addChatMessage(currentSession.id, {
        role: "user",
        content,
        attachments
      });
      
      // Create the assistant message with streaming flag
      const assistantMessageId = await addChatMessage(currentSession.id, {
        role: "assistant",
        content: "",
        isStreaming: true
      });
      
      // Refresh the current session to get the latest messages
      const updatedSession = await getChatSession(currentSession.id);
      if (updatedSession) {
        setCurrentSession(updatedSession);
      }
      
      // Refresh the sessions list
      const allSessions = await getChatSessions();
      setSessions(allSessions);
      updateSessionsByCategory(allSessions);
      
      // Send the message to the AI service and stream the response
      // This would normally call your AI service
      // For now, just simulate a response
      setTimeout(async () => {
        await addChatMessage(currentSession.id, {
          role: "assistant",
          content: "This is a simulated response from the AI using Supabase storage and database.",
          isStreaming: false
        });
        
        // Refresh the current session
        const finalSession = await getChatSession(currentSession.id);
        if (finalSession) {
          setCurrentSession(finalSession);
        }
      }, 1000);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const sendStreamingMessage = async (content: string, attachments?: FileAttachment[]) => {
    if (!currentSession) {
      console.error('No active session');
      return;
    }
    
    setIsStreaming(true);
    try {
      // Similar to sendMessage but with streaming support
      // This is a simplified version - in a real implementation 
      // you would connect to your streaming API
      await sendMessage(content, attachments);
    } catch (error) {
      console.error('Error sending streaming message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsStreaming(false);
    }
  };
  
  const createSession = async (initialTopic?: string) => {
    try {
      const sessionId = await createChatSession(
        "New Chat",
        initialTopic,
        undefined,
        selectedModel
      );
      
      const newSession = await getChatSession(sessionId);
      if (newSession) {
        setCurrentSession(newSession);
        
        // Refresh the sessions list
        const allSessions = await getChatSessions();
        setSessions(allSessions);
        updateSessionsByCategory(allSessions);
      }
    } catch (error) {
      console.error('Error creating chat session:', error);
      toast({
        title: "Error",
        description: "Failed to create new chat. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const switchSession = async (id: string) => {
    try {
      const session = await getChatSession(id);
      if (session) {
        setCurrentSession(session);
      }
    } catch (error) {
      console.error('Error switching session:', error);
      toast({
        title: "Error",
        description: "Failed to switch chat. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const deleteSession = async (id: string) => {
    try {
      await deleteChatSession(id);
      
      // If we deleted the current session, select another one
      if (currentSession?.id === id) {
        const remainingSessions = sessions.filter(s => s.id !== id);
        if (remainingSessions.length > 0) {
          setCurrentSession(remainingSessions[0]);
        } else {
          // Create a new session if there are none left
          await createSession();
        }
      }
      
      // Refresh the sessions list
      const allSessions = await getChatSessions();
      setSessions(allSessions);
      updateSessionsByCategory(allSessions);
    } catch (error) {
      console.error('Error deleting session:', error);
      toast({
        title: "Error",
        description: "Failed to delete chat. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const renameSession = async (id: string, title: string) => {
    try {
      await updateChatSession(id, { title });
      
      // Update current session if it's the one being renamed
      if (currentSession?.id === id) {
        setCurrentSession(prev => prev ? { ...prev, title } : null);
      }
      
      // Refresh the sessions list
      const allSessions = await getChatSessions();
      setSessions(allSessions);
      updateSessionsByCategory(allSessions);
    } catch (error) {
      console.error('Error renaming session:', error);
      toast({
        title: "Error",
        description: "Failed to rename chat. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const setCategoryForSession = async (id: string, category: string) => {
    try {
      await updateChatSession(id, { category });
      
      // Update current session if it's the one being categorized
      if (currentSession?.id === id) {
        setCurrentSession(prev => prev ? { ...prev, category } : null);
      }
      
      // Refresh the sessions list
      const allSessions = await getChatSessions();
      setSessions(allSessions);
      updateSessionsByCategory(allSessions);
    } catch (error) {
      console.error('Error setting category:', error);
      toast({
        title: "Error",
        description: "Failed to update category. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleSetCurrentPage = (page: string) => {
    setCurrentPage(page);
  };
  
  const handleSetModel = (modelId: string) => {
    setSelectedModel(modelId);
    
    // Save model preference for the current session
    if (currentSession) {
      updateChatSession(currentSession.id, { model: modelId })
        .catch(error => {
          console.error('Error updating model preference:', error);
        });
    }
  };
  
  return (
    <SupabaseChatContext.Provider
      value={{
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
        setModel: handleSetModel,
      }}
    >
      {children}
    </SupabaseChatContext.Provider>
  );
}

export function useSupabaseChat() {
  const context = useContext(SupabaseChatContext);
  if (context === undefined) {
    throw new Error('useSupabaseChat must be used within a SupabaseChatProvider');
  }
  return context;
} 