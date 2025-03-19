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

async function testSupabaseTables() {
  console.log('Testing Supabase tables...');
  console.log(`Using Supabase URL: ${supabaseUrl}`);
  
  try {
    // Test connection
    const { data: versionData, error: versionError } = await supabase.rpc('version');
    
    if (versionError) {
      if (versionError.message.includes('function "version" does not exist')) {
        console.log('Connected to Supabase successfully, but "version" function is not available.');
      } else {
        throw versionError;
      }
    } else {
      console.log('Connected to Supabase successfully!');
      console.log('Version:', versionData);
    }
    
    // Check for existing tables
    console.log('\nChecking for existing tables...');
    
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .order('table_name');
    
    if (tablesError) {
      throw tablesError;
    }
    
    console.log('Existing tables in schema "public":', 
      tables.length ? tables.map(t => t.table_name).join(', ') : 'None');
    
    // Check if we already have the chat tables
    const chatTables = tables.filter(t => 
      t.table_name === 'chat_sessions' || t.table_name === 'chat_messages'
    );
    
    if (chatTables.length === 2) {
      console.log('\nChat tables already exist!');
    } else {
      console.log('\nNeed to create chat tables...');
      
      // Create the tables using raw SQL commands
      // We'll use the SQL API to execute queries
      
      // First, create the chat_sessions table
      console.log('Creating chat_sessions table...');
      const { error: createSessionsError } = await supabase.query(`
        CREATE TABLE IF NOT EXISTS chat_sessions (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID,
          title TEXT NOT NULL,
          topic TEXT,
          category TEXT,
          model TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
      `);
      
      if (createSessionsError) {
        throw createSessionsError;
      }
      
      // Then create the chat_messages table
      console.log('Creating chat_messages table...');
      const { error: createMessagesError } = await supabase.query(`
        CREATE TABLE IF NOT EXISTS chat_messages (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
          role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
          content TEXT NOT NULL,
          timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
          metadata JSONB DEFAULT '{}'::jsonb,
          attachments JSONB DEFAULT '[]'::jsonb
        );
      `);
      
      if (createMessagesError) {
        throw createMessagesError;
      }
      
      // Create indexes for better query performance
      console.log('Creating indexes...');
      const { error: indexError } = await supabase.query(`
        CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
        CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
        CREATE INDEX IF NOT EXISTS idx_chat_sessions_category ON chat_sessions(category);
      `);
      
      if (indexError) {
        throw indexError;
      }
      
      console.log('Tables and indexes created successfully!');
    }
    
    // Insert a test record
    console.log('\nInserting a test session...');
    const { data: session, error: sessionError } = await supabase
      .from('chat_sessions')
      .insert({
        title: 'Test Session',
        user_id: null
      })
      .select()
      .single();
    
    if (sessionError) {
      throw sessionError;
    }
    
    console.log('Test session created:', session);
    
    // Insert a test message
    console.log('\nInserting a test message...');
    const { data: message, error: messageError } = await supabase
      .from('chat_messages')
      .insert({
        session_id: session.id,
        role: 'user',
        content: 'Hello, this is a test message',
        timestamp: new Date().toISOString(),
        metadata: { type: 'test' }
      })
      .select()
      .single();
    
    if (messageError) {
      throw messageError;
    }
    
    console.log('Test message created:', message);
    
    // Clean up the test data
    console.log('\nCleaning up test data...');
    const { error: deleteError } = await supabase
      .from('chat_sessions')
      .delete()
      .eq('id', session.id);
    
    if (deleteError) {
      throw deleteError;
    }
    
    console.log('Test data cleaned up successfully!');
    console.log('\nSupabase tables test completed successfully!');
  } catch (error) {
    console.error('Error:', error);
  }
}

testSupabaseTables().catch(console.error); 