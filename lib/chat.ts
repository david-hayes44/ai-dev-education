import { supabase } from './supabase';
import { v4 as uuidv4 } from 'uuid';

export interface Conversation {
  id: string;
  title: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  user_id: string;
  content: string;
  is_ai: boolean;
  created_at: string;
  updated_at: string;
  attachments?: FileAttachment[];
}

export interface FileAttachment {
  id: string;
  message_id: string;
  file_path: string;
  file_name: string;
  file_type: string;
  file_size: number;
  file_url: string;
  created_at: string;
}

/**
 * Creates a new conversation
 */
export async function createConversation(
  userId: string,
  title: string = 'New Conversation'
): Promise<Conversation> {
  const id = uuidv4();
  const now = new Date().toISOString();
  
  const { data, error } = await supabase
    .from('conversations')
    .insert({
      id,
      title,
      created_by: userId,
      created_at: now,
      updated_at: now
    })
    .select()
    .single();
    
  if (error) {
    console.error('Error creating conversation:', error);
    throw error;
  }
  
  return data as Conversation;
}

/**
 * Gets all conversations for a user
 */
export async function getConversations(userId: string): Promise<Conversation[]> {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('created_by', userId)
    .order('updated_at', { ascending: false });
    
  if (error) {
    console.error('Error getting conversations:', error);
    throw error;
  }
  
  return data as Conversation[];
}

/**
 * Gets a single conversation by ID
 */
export async function getConversation(
  conversationId: string,
  userId: string
): Promise<Conversation> {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('id', conversationId)
    .eq('created_by', userId)
    .single();
    
  if (error) {
    console.error('Error getting conversation:', error);
    throw error;
  }
  
  return data as Conversation;
}

/**
 * Updates a conversation title
 */
export async function updateConversationTitle(
  conversationId: string,
  title: string,
  userId: string
): Promise<Conversation> {
  const { data, error } = await supabase
    .from('conversations')
    .update({
      title,
      updated_at: new Date().toISOString()
    })
    .eq('id', conversationId)
    .eq('created_by', userId)
    .select()
    .single();
    
  if (error) {
    console.error('Error updating conversation:', error);
    throw error;
  }
  
  return data as Conversation;
}

/**
 * Deletes a conversation and all its messages
 */
export async function deleteConversation(
  conversationId: string,
  userId: string
): Promise<void> {
  const { error } = await supabase
    .from('conversations')
    .delete()
    .eq('id', conversationId)
    .eq('created_by', userId);
    
  if (error) {
    console.error('Error deleting conversation:', error);
    throw error;
  }
}

/**
 * Adds a message to a conversation
 */
export async function addMessage(
  conversationId: string,
  userId: string,
  content: string,
  isAI: boolean = false,
  attachments?: {
    file_path: string;
    file_name: string;
    file_type: string;
    file_size: number;
    file_url: string;
  }[]
): Promise<Message> {
  // Start a transaction to add the message and attachments
  const id = uuidv4();
  const now = new Date().toISOString();
  
  // First, add the message
  const { data, error } = await supabase
    .from('messages')
    .insert({
      id,
      conversation_id: conversationId,
      user_id: userId,
      content,
      is_ai: isAI,
      created_at: now,
      updated_at: now
    })
    .select()
    .single();
    
  if (error) {
    console.error('Error adding message:', error);
    throw error;
  }
  
  // Update the conversation timestamp
  await supabase
    .from('conversations')
    .update({ updated_at: now })
    .eq('id', conversationId);
  
  // If there are attachments, add them too
  const messageAttachments: FileAttachment[] = [];
  if (attachments && attachments.length > 0) {
    for (const attachment of attachments) {
      const attachmentId = uuidv4();
      const { data: attachmentData, error: attachmentError } = await supabase
        .from('file_attachments')
        .insert({
          id: attachmentId,
          message_id: id,
          file_path: attachment.file_path,
          file_name: attachment.file_name,
          file_type: attachment.file_type,
          file_size: attachment.file_size,
          file_url: attachment.file_url,
          created_at: now
        })
        .select()
        .single();
        
      if (attachmentError) {
        console.error('Error adding attachment:', attachmentError);
        // Don't throw, just log and continue
      } else {
        messageAttachments.push(attachmentData as FileAttachment);
      }
    }
  }
  
  return {
    ...data,
    attachments: messageAttachments.length > 0 ? messageAttachments : undefined
  } as Message;
}

/**
 * Gets all messages for a conversation
 */
export async function getMessages(
  conversationId: string,
  userId: string
): Promise<Message[]> {
  // First, check if the user has access to this conversation
  const { data: conversation, error: conversationError } = await supabase
    .from('conversations')
    .select('*')
    .eq('id', conversationId)
    .eq('created_by', userId)
    .single();
    
  if (conversationError) {
    console.error('Error checking conversation access:', conversationError);
    throw conversationError;
  }
  
  // Then get the messages
  const { data: messages, error: messagesError } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });
    
  if (messagesError) {
    console.error('Error getting messages:', messagesError);
    throw messagesError;
  }
  
  // Get attachments for all messages
  const messageIds = messages.map(m => m.id);
  let attachments: FileAttachment[] = [];
  
  if (messageIds.length > 0) {
    const { data: attachmentsData, error: attachmentsError } = await supabase
      .from('file_attachments')
      .select('*')
      .in('message_id', messageIds);
      
    if (attachmentsError) {
      console.error('Error getting attachments:', attachmentsError);
      // Don't throw, just log and continue
    } else {
      attachments = attachmentsData as FileAttachment[];
    }
  }
  
  // Combine messages with their attachments
  const messagesWithAttachments = messages.map(message => {
    const messageAttachments = attachments.filter(a => a.message_id === message.id);
    return {
      ...message,
      attachments: messageAttachments.length > 0 ? messageAttachments : undefined
    };
  });
  
  return messagesWithAttachments as Message[];
}

/**
 * Sets up a real-time subscription to messages in a conversation
 */
export function subscribeToMessages(
  conversationId: string,
  callback: (message: Message) => void
) {
  // Subscribe to the messages channel
  const subscription = supabase
    .channel('public:messages')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      },
      async (payload) => {
        // When a new message is inserted, get any attachments
        const message = payload.new as Message;
        
        // Get attachments for this message
        const { data: attachments, error: attachmentsError } = await supabase
          .from('file_attachments')
          .select('*')
          .eq('message_id', message.id);
          
        if (attachmentsError) {
          console.error('Error getting attachments for new message:', attachmentsError);
        } else if (attachments && attachments.length > 0) {
          message.attachments = attachments as FileAttachment[];
        }
        
        // Invoke the callback with the message data
        callback(message);
      }
    )
    .subscribe();
  
  // Return a function to unsubscribe
  return () => {
    supabase.removeChannel(subscription);
  };
} 