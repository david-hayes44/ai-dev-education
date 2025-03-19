import { createClient } from '@supabase/supabase-js';
import { Message, ChatSession, FileAttachment } from './chat-service';

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create Supabase client
const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

/**
 * ChatStorage provides methods for persisting chat data to Supabase
 */
export class ChatStorage {
  /**
   * Creates a new chat session
   * @param session Chat session data
   * @returns Session ID if successful
   */
  async createSession(session: Omit<ChatSession, 'id' | 'createdAt' | 'updatedAt'>): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .insert({
          title: session.title,
          topic: session.topic,
          category: session.category,
          model: session.model,
          user_id: null, // For now, we're not using authentication
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating session:', error);
        return null;
      }
      
      return data.id;
    } catch (error) {
      console.error('Error in createSession:', error);
      return null;
    }
  }
  
  /**
   * Gets a chat session by ID
   * @param sessionId Session ID
   * @returns Chat session if found
   */
  async getSession(sessionId: string): Promise<ChatSession | null> {
    try {
      const { data: session, error: sessionError } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();
      
      if (sessionError) {
        console.error('Error getting session:', sessionError);
        return null;
      }
      
      // Get messages for this session
      const { data: messages, error: messagesError } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('timestamp', { ascending: true });
      
      if (messagesError) {
        console.error('Error getting messages:', messagesError);
        return null;
      }
      
      // Convert to our application format
      return {
        id: session.id,
        title: session.title,
        topic: session.topic,
        category: session.category,
        model: session.model,
        createdAt: new Date(session.created_at).getTime(),
        updatedAt: new Date(session.updated_at).getTime(),
        messages: messages.map(msg => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          timestamp: new Date(msg.timestamp).getTime(),
          metadata: msg.metadata,
          attachments: msg.attachments
        }))
      };
    } catch (error) {
      console.error('Error in getSession:', error);
      return null;
    }
  }
  
  /**
   * Gets all chat sessions
   * @returns Array of chat sessions
   */
  async getAllSessions(): Promise<ChatSession[]> {
    try {
      const { data: sessions, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .order('updated_at', { ascending: false });
      
      if (error) {
        console.error('Error getting sessions:', error);
        return [];
      }
      
      // We need to get messages for each session, but this could be expensive
      // Consider whether you want to load messages on-demand instead
      const result: ChatSession[] = [];
      
      for (const session of sessions) {
        const { data: messages, error: messagesError } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('session_id', session.id)
          .order('timestamp', { ascending: true });
        
        if (messagesError) {
          console.error(`Error getting messages for session ${session.id}:`, messagesError);
          continue;
        }
        
        result.push({
          id: session.id,
          title: session.title,
          topic: session.topic || undefined,
          category: session.category || undefined,
          model: session.model || undefined,
          createdAt: new Date(session.created_at).getTime(),
          updatedAt: new Date(session.updated_at).getTime(),
          messages: messages.map(msg => ({
            id: msg.id,
            role: msg.role,
            content: msg.content,
            timestamp: new Date(msg.timestamp).getTime(),
            metadata: msg.metadata || {},
            attachments: msg.attachments || []
          }))
        });
      }
      
      return result;
    } catch (error) {
      console.error('Error in getAllSessions:', error);
      return [];
    }
  }
  
  /**
   * Gets sessions by category
   * @param category Category name
   * @returns Array of chat sessions in the category
   */
  async getSessionsByCategory(category: string): Promise<ChatSession[]> {
    try {
      const { data: sessions, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('category', category)
        .order('updated_at', { ascending: false });
      
      if (error) {
        console.error('Error getting sessions by category:', error);
        return [];
      }
      
      // Convert to our application format (without messages for efficiency)
      return sessions.map(session => ({
        id: session.id,
        title: session.title,
        topic: session.topic || undefined,
        category: session.category || undefined,
        model: session.model || undefined,
        createdAt: new Date(session.created_at).getTime(),
        updatedAt: new Date(session.updated_at).getTime(),
        messages: [] // Messages loaded on demand
      }));
    } catch (error) {
      console.error('Error in getSessionsByCategory:', error);
      return [];
    }
  }
  
  /**
   * Updates a chat session
   * @param sessionId Session ID
   * @param updates Fields to update
   * @returns Success status
   */
  async updateSession(sessionId: string, updates: Partial<ChatSession>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('chat_sessions')
        .update({
          title: updates.title,
          topic: updates.topic,
          category: updates.category,
          model: updates.model
        })
        .eq('id', sessionId);
      
      if (error) {
        console.error('Error updating session:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error in updateSession:', error);
      return false;
    }
  }
  
  /**
   * Deletes a chat session
   * @param sessionId Session ID
   * @returns Success status
   */
  async deleteSession(sessionId: string): Promise<boolean> {
    try {
      // The child messages will be deleted automatically due to the CASCADE constraint
      const { error } = await supabase
        .from('chat_sessions')
        .delete()
        .eq('id', sessionId);
      
      if (error) {
        console.error('Error deleting session:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error in deleteSession:', error);
      return false;
    }
  }
  
  /**
   * Adds a message to a chat session
   * @param sessionId Session ID
   * @param message Message to add
   * @returns Message ID if successful
   */
  async addMessage(sessionId: string, message: Omit<Message, 'id'>): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          session_id: sessionId,
          role: message.role,
          content: message.content,
          timestamp: new Date(message.timestamp).toISOString(),
          metadata: message.metadata || {},
          attachments: message.attachments || []
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error adding message:', error);
        return null;
      }
      
      // Update the session's updated_at timestamp
      await supabase
        .from('chat_sessions')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', sessionId);
      
      return data.id;
    } catch (error) {
      console.error('Error in addMessage:', error);
      return null;
    }
  }
  
  /**
   * Gets messages for a chat session
   * @param sessionId Session ID
   * @returns Array of messages
   */
  async getMessages(sessionId: string): Promise<Message[]> {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('timestamp', { ascending: true });
      
      if (error) {
        console.error('Error getting messages:', error);
        return [];
      }
      
      return data.map(msg => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: new Date(msg.timestamp).getTime(),
        metadata: msg.metadata || {},
        attachments: msg.attachments || []
      }));
    } catch (error) {
      console.error('Error in getMessages:', error);
      return [];
    }
  }
  
  /**
   * Updates a message
   * @param messageId Message ID
   * @param updates Fields to update
   * @returns Success status
   */
  async updateMessage(messageId: string, updates: Partial<Message>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('chat_messages')
        .update({
          content: updates.content,
          metadata: updates.metadata
        })
        .eq('id', messageId);
      
      if (error) {
        console.error('Error updating message:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error in updateMessage:', error);
      return false;
    }
  }
  
  /**
   * Deletes a message
   * @param messageId Message ID
   * @returns Success status
   */
  async deleteMessage(messageId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('chat_messages')
        .delete()
        .eq('id', messageId);
      
      if (error) {
        console.error('Error deleting message:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error in deleteMessage:', error);
      return false;
    }
  }
}

// Export singleton instance
export const chatStorage = new ChatStorage(); 