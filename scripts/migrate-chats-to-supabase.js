// This script migrates chat data from localStorage to Supabase
// Run it once to populate the database with existing chat sessions

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validate environment variables
if (!supabaseUrl) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set in .env.local');
}

if (!supabaseServiceKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set in .env.local');
}

// Create Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Migrate chat sessions from localStorage to Supabase
 */
async function migrateChatSessions() {
  console.log('Starting migration of chat sessions to Supabase...');
  
  try {
    // Get chat sessions from localStorage - this part would typically be run in the browser
    // For demonstration, we'll use a hardcoded sample or load from a file
    const sampleSessions = getSampleSessions();
    
    console.log(`Found ${Object.keys(sampleSessions).length} sessions to migrate`);
    
    // Migrate each session
    for (const sessionId in sampleSessions) {
      const session = sampleSessions[sessionId];
      await migrateSession(session);
    }
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Error during migration:', error);
  }
}

/**
 * Migrate a single session to Supabase
 */
async function migrateSession(session) {
  console.log(`Migrating session: ${session.title} (${session.id})`);
  
  try {
    // Check if the session already exists
    const { data: existingSession, error: checkError } = await supabase
      .from('chat_sessions')
      .select('id')
      .eq('id', session.id)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found" which is expected
      throw checkError;
    }
    
    if (existingSession) {
      console.log(`Session ${session.id} already exists, skipping...`);
      return;
    }
    
    // Insert the session
    const { error: sessionError } = await supabase
      .from('chat_sessions')
      .insert({
        id: session.id,
        title: session.title,
        topic: session.topic,
        category: session.category,
        model: session.model,
        created_at: new Date(session.createdAt).toISOString(),
        updated_at: new Date(session.updatedAt).toISOString(),
        user_id: null // No user ID for now
      });
    
    if (sessionError) {
      throw sessionError;
    }
    
    console.log(`Session ${session.id} created successfully`);
    
    // Insert messages
    for (const message of session.messages) {
      const { error: messageError } = await supabase
        .from('chat_messages')
        .insert({
          id: message.id,
          session_id: session.id,
          role: message.role,
          content: message.content,
          timestamp: new Date(message.timestamp).toISOString(),
          metadata: message.metadata || {},
          attachments: message.attachments || []
        });
      
      if (messageError) {
        console.error(`Error inserting message ${message.id}:`, messageError);
        // Continue with other messages
      }
    }
    
    console.log(`Added ${session.messages.length} messages to session ${session.id}`);
  } catch (error) {
    console.error(`Error migrating session ${session.id}:`, error);
  }
}

/**
 * Get sample sessions for demonstration
 * In a real migration, this would read from localStorage or a file
 */
function getSampleSessions() {
  // Placeholder - this would be replaced with actual localStorage data
  return {
    "sample-session-1": {
      id: "sample-session-1",
      title: "Introduction to MCP",
      messages: [
        {
          id: "msg1",
          role: "system",
          content: "You are an AI assistant for the AI Development Education website.",
          timestamp: Date.now() - 60000
        },
        {
          id: "msg2",
          role: "user",
          content: "What is MCP?",
          timestamp: Date.now() - 50000
        },
        {
          id: "msg3",
          role: "assistant",
          content: "MCP (Model Context Protocol) is a standardized approach for managing context in AI-assisted development workflows.",
          timestamp: Date.now() - 40000
        }
      ],
      createdAt: Date.now() - 60000,
      updatedAt: Date.now() - 40000
    }
  };
}

// Run the migration
migrateChatSessions().catch(console.error); 