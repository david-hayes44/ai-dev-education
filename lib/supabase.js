import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Define storage buckets
export const STORAGE_BUCKETS = {
  CHAT_ATTACHMENTS: 'chat-attachments',
  USER_UPLOADS: 'user-uploads',
  CONTENT_ASSETS: 'content-assets'
};

// Check if the required environment variables are set
if (!supabaseUrl) {
  console.warn('NEXT_PUBLIC_SUPABASE_URL is not set in environment variables');
}

if (!supabaseAnonKey) {
  console.warn('NEXT_PUBLIC_SUPABASE_ANON_KEY is not set in environment variables');
}

// Create and export the Supabase client with anonymous key (for client-side)
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

// Create a function to get a Supabase client with service role key (for server-side)
export const getServiceClient = () => {
  if (!supabaseServiceKey) {
    console.warn('SUPABASE_SERVICE_ROLE_KEY is not set in environment variables');
    return null;
  }
  
  return createClient(supabaseUrl || '', supabaseServiceKey);
};

// File upload utility
export const uploadFile = async (bucket, filePath, file, options = {}) => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
        ...options
      });
      
    if (error) {
      throw error;
    }
    
    return { data };
  } catch (error) {
    console.error('Error uploading file:', error);
    return { error };
  }
};

// Get file URL utility
export const getFileUrl = (bucket, filePath) => {
  try {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);
      
    return data?.publicUrl || '';
  } catch (error) {
    console.error('Error getting file URL:', error);
    return '';
  }
};

// Create a utility function to create or get tables
export const ensureChatTables = async () => {
  const serviceClient = getServiceClient();
  if (!serviceClient) {
    throw new Error('Service client not available, cannot create tables');
  }
  
  try {
    // Create chat_sessions table
    const { error: sessionsError } = await serviceClient.rpc('exec', { 
      query: `
        CREATE TABLE IF NOT EXISTS chat_sessions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID,
          title TEXT NOT NULL,
          topic TEXT,
          category TEXT,
          model TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
      `
    });
    
    if (sessionsError) {
      throw sessionsError;
    }
    
    // Create chat_messages table
    const { error: messagesError } = await serviceClient.rpc('exec', { 
      query: `
        CREATE TABLE IF NOT EXISTS chat_messages (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
          role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
          content TEXT NOT NULL,
          timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
          metadata JSONB DEFAULT '{}'::jsonb,
          attachments JSONB DEFAULT '[]'::jsonb
        );
      `
    });
    
    if (messagesError) {
      throw messagesError;
    }
    
    return true;
  } catch (error) {
    console.error('Error creating chat tables:', error);
    throw error;
  }
}; 