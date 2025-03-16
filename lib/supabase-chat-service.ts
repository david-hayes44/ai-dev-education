import { supabase } from './supabase';
import { ChatSession, Message, FileAttachment, MessageMetadata } from './chat-service';
import { v4 as uuidv4 } from 'uuid';

/**
 * Interface for the sessions table in Supabase
 */
interface DbChatSession {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  topic?: string;
  category?: string;
  model?: string;
  user_id?: string;
}

/**
 * Interface for the messages table in Supabase
 */
interface DbChatMessage {
  id: string;
  session_id: string;
  role: string;
  content: string;
  created_at: string;
  metadata?: MessageMetadata;
  is_streaming?: boolean;
}

/**
 * Interface for the attachments table in Supabase
 */
interface DbFileAttachment {
  id: string;
  message_id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  thumbnail_url?: string;
  content?: string;
  storage_ref?: string;
  created_at: string;
}

/**
 * Create a new chat session in the database
 */
export async function createChatSession(
  title: string,
  topic?: string,
  category?: string,
  model?: string
): Promise<string> {
  const sessionId = uuidv4();
  
  const { error } = await supabase
    .from('sessions')
    .insert({
      id: sessionId,
      title,
      topic,
      category,
      model,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  
  if (error) {
    console.error('Error creating chat session:', error);
    throw error;
  }
  
  return sessionId;
}

/**
 * Get all chat sessions for the current user
 */
export async function getChatSessions(): Promise<ChatSession[]> {
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .order('updated_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching chat sessions:', error);
    throw error;
  }
  
  // We need to also fetch messages for each session
  const sessions: ChatSession[] = await Promise.all(
    (data || []).map(async (session: DbChatSession) => {
      const messages = await getChatMessages(session.id);
      
      return {
        id: session.id,
        title: session.title,
        createdAt: new Date(session.created_at).getTime(),
        updatedAt: new Date(session.updated_at).getTime(),
        messages,
        topic: session.topic,
        category: session.category,
        model: session.model
      };
    })
  );
  
  return sessions;
}

/**
 * Get a specific chat session by ID
 */
export async function getChatSession(sessionId: string): Promise<ChatSession | null> {
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', sessionId)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      // Record not found
      return null;
    }
    console.error('Error fetching chat session:', error);
    throw error;
  }
  
  if (!data) {
    return null;
  }
  
  const messages = await getChatMessages(sessionId);
  
  const session: ChatSession = {
    id: data.id,
    title: data.title,
    createdAt: new Date(data.created_at).getTime(),
    updatedAt: new Date(data.updated_at).getTime(),
    messages,
    topic: data.topic,
    category: data.category,
    model: data.model
  };
  
  return session;
}

/**
 * Update a chat session's metadata
 */
export async function updateChatSession(
  sessionId: string,
  updates: {
    title?: string;
    topic?: string;
    category?: string;
    model?: string;
  }
): Promise<void> {
  const { error } = await supabase
    .from('sessions')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', sessionId);
  
  if (error) {
    console.error('Error updating chat session:', error);
    throw error;
  }
}

/**
 * Delete a chat session and all related messages and attachments
 */
export async function deleteChatSession(sessionId: string): Promise<void> {
  // First, get all messages in the session
  const { data: messages, error: messagesError } = await supabase
    .from('messages')
    .select('id')
    .eq('session_id', sessionId);
  
  if (messagesError) {
    console.error('Error fetching messages for deletion:', messagesError);
    throw messagesError;
  }
  
  // Start a transaction to delete everything
  // Note: Supabase doesn't directly support transactions through the JS client,
  // but we can use RLS and cascade deletes in the database schema
  const { error } = await supabase
    .from('sessions')
    .delete()
    .eq('id', sessionId);
  
  if (error) {
    console.error('Error deleting chat session:', error);
    throw error;
  }
}

/**
 * Get all messages for a specific chat session
 */
export async function getChatMessages(sessionId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });
  
  if (error) {
    console.error('Error fetching chat messages:', error);
    throw error;
  }
  
  // We need to also fetch attachments for each message
  const messages: Message[] = await Promise.all(
    (data || []).map(async (message: DbChatMessage) => {
      const attachments = await getMessageAttachments(message.id);
      
      return {
        id: message.id,
        role: message.role as "user" | "assistant" | "system",
        content: message.content,
        timestamp: new Date(message.created_at).getTime(),
        metadata: message.metadata,
        isStreaming: message.is_streaming,
        attachments
      };
    })
  );
  
  return messages;
}

/**
 * Add a new message to a chat session
 */
export async function addChatMessage(
  sessionId: string,
  message: {
    role: "user" | "assistant" | "system";
    content: string;
    metadata?: MessageMetadata;
    isStreaming?: boolean;
    attachments?: FileAttachment[];
  }
): Promise<Message> {
  const messageId = uuidv4();
  
  // First, insert the message
  const { error } = await supabase
    .from('messages')
    .insert({
      id: messageId,
      session_id: sessionId,
      role: message.role,
      content: message.content,
      metadata: message.metadata,
      is_streaming: message.isStreaming,
      created_at: new Date().toISOString()
    });
  
  if (error) {
    console.error('Error adding chat message:', error);
    throw error;
  }
  
  // Then, update the session's updated_at timestamp
  await supabase
    .from('sessions')
    .update({
      updated_at: new Date().toISOString()
    })
    .eq('id', sessionId);
  
  // Finally, add any attachments
  let attachments: FileAttachment[] = [];
  if (message.attachments && message.attachments.length > 0) {
    await Promise.all(
      message.attachments.map(async (attachment) => {
        await addMessageAttachment(messageId, attachment);
      })
    );
    
    attachments = message.attachments;
  }
  
  const newMessage: Message = {
    id: messageId,
    role: message.role,
    content: message.content,
    timestamp: new Date().getTime(),
    metadata: message.metadata,
    isStreaming: message.isStreaming,
    attachments
  };
  
  return newMessage;
}

/**
 * Update an existing message
 */
export async function updateChatMessage(
  messageId: string,
  updates: {
    content?: string;
    metadata?: MessageMetadata;
    isStreaming?: boolean;
  }
): Promise<void> {
  const { error } = await supabase
    .from('messages')
    .update(updates)
    .eq('id', messageId);
  
  if (error) {
    console.error('Error updating chat message:', error);
    throw error;
  }
}

/**
 * Get all attachments for a specific message
 */
export async function getMessageAttachments(messageId: string): Promise<FileAttachment[]> {
  const { data, error } = await supabase
    .from('attachments')
    .select('*')
    .eq('message_id', messageId)
    .order('created_at', { ascending: true });
  
  if (error) {
    console.error('Error fetching message attachments:', error);
    throw error;
  }
  
  const attachments: FileAttachment[] = (data || []).map((attachment: DbFileAttachment) => ({
    id: attachment.id,
    name: attachment.name,
    type: attachment.type,
    size: attachment.size,
    url: attachment.url,
    thumbnailUrl: attachment.thumbnail_url,
    content: attachment.content,
    storageRef: attachment.storage_ref
  }));
  
  return attachments;
}

/**
 * Add an attachment to a message
 */
export async function addMessageAttachment(
  messageId: string,
  attachment: FileAttachment
): Promise<void> {
  const { error } = await supabase
    .from('attachments')
    .insert({
      id: attachment.id,
      message_id: messageId,
      name: attachment.name,
      type: attachment.type,
      size: attachment.size,
      url: attachment.url,
      thumbnail_url: attachment.thumbnailUrl,
      content: attachment.content,
      storage_ref: attachment.storageRef,
      created_at: new Date().toISOString()
    });
  
  if (error) {
    console.error('Error adding message attachment:', error);
    throw error;
  }
}

/**
 * Subscribe to changes in a chat session's messages
 */
export function subscribeToChatMessages(
  sessionId: string,
  callback: (message: Message) => void
) {
  const subscription = supabase
    .channel(`messages-${sessionId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `session_id=eq.${sessionId}`
      },
      async (payload) => {
        // When a new message is inserted, we need to fetch its attachments
        const message = payload.new as DbChatMessage;
        const attachments = await getMessageAttachments(message.id);
        
        const newMessage: Message = {
          id: message.id,
          role: message.role as "user" | "assistant" | "system",
          content: message.content,
          timestamp: new Date(message.created_at).getTime(),
          metadata: message.metadata,
          isStreaming: message.is_streaming,
          attachments
        };
        
        callback(newMessage);
      }
    )
    .subscribe();
  
  // Return a cleanup function
  return () => {
    supabase.removeChannel(subscription);
  };
}

/**
 * Subscribe to changes in a chat session's messages (updates only)
 */
export function subscribeToMessageUpdates(
  sessionId: string,
  callback: (message: Message) => void
) {
  const subscription = supabase
    .channel(`message-updates-${sessionId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages',
        filter: `session_id=eq.${sessionId}`
      },
      async (payload) => {
        // When a message is updated, we need to fetch its attachments
        const message = payload.new as DbChatMessage;
        const attachments = await getMessageAttachments(message.id);
        
        const updatedMessage: Message = {
          id: message.id,
          role: message.role as "user" | "assistant" | "system",
          content: message.content,
          timestamp: new Date(message.created_at).getTime(),
          metadata: message.metadata,
          isStreaming: message.is_streaming,
          attachments
        };
        
        callback(updatedMessage);
      }
    )
    .subscribe();
  
  // Return a cleanup function
  return () => {
    supabase.removeChannel(subscription);
  };
} 