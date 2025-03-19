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

async function executeSql(sql) {
  const { error } = await supabase.rpc('pg_execute', { sql });
  if (error) {
    console.error('SQL Error:', error);
    return false;
  }
  return true;
}

async function createChatTables() {
  console.log('Setting up chat tables in Supabase...');
  console.log(`Using Supabase URL: ${supabaseUrl}`);
  
  try {
    // First, check if the pg_execute function exists
    try {
      const { error } = await supabase.rpc('pg_execute', { sql: 'SELECT 1;' });
      if (error) {
        if (error.message.includes('function "pg_execute" does not exist')) {
          console.error('The pg_execute function does not exist in this Supabase instance.');
          console.log('Using direct SQL API instead...');
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.log('Using SQL API instead of RPC...');
    }
    
    // Use the SQL API directly
    console.log('\nExecuting SQL statements to create tables...');
    
    // Enable UUID extension
    console.log('Creating UUID extension...');
    const { error: uuidError } = await supabase.from('_exec_sql').select('*').eq('query', 'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
    
    if (uuidError) {
      // Try the direct SQL method
      console.log('Trying direct SQL API...');
      const { error } = await supabase.sql('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
      if (error) throw error;
    }
    
    // Create chat_sessions table
    console.log('Creating chat_sessions table...');
    await supabase.sql(`
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
    
    // Create chat_messages table
    console.log('Creating chat_messages table...');
    await supabase.sql(`
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
    
    // Create indexes
    console.log('Creating indexes...');
    await supabase.sql(`
      CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
      CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
      CREATE INDEX IF NOT EXISTS idx_chat_sessions_category ON chat_sessions(category);
    `);
    
    // Create function for updated_at timestamp
    console.log('Creating timestamp update function...');
    await supabase.sql(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
         NEW.updated_at = now();
         RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);
    
    // Create trigger for the function
    console.log('Creating update trigger...');
    await supabase.sql(`
      DROP TRIGGER IF EXISTS update_chat_sessions_updated_at ON chat_sessions;
      CREATE TRIGGER update_chat_sessions_updated_at
      BEFORE UPDATE ON chat_sessions
      FOR EACH ROW
      EXECUTE PROCEDURE update_updated_at_column();
    `);
    
    // Enable RLS and create policies
    console.log('Setting up Row Level Security...');
    
    // Enable RLS on tables
    await supabase.sql(`
      ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
      ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
    `);
    
    // Create policies for authenticated users
    console.log('Creating policies for authenticated users...');
    await supabase.sql(`
      CREATE POLICY IF NOT EXISTS "Users can view their own chat sessions"
      ON chat_sessions
      FOR SELECT
      USING (user_id = auth.uid());
    `);
    
    await supabase.sql(`
      CREATE POLICY IF NOT EXISTS "Users can insert their own chat sessions"
      ON chat_sessions
      FOR INSERT
      WITH CHECK (user_id = auth.uid());
    `);
    
    await supabase.sql(`
      CREATE POLICY IF NOT EXISTS "Users can update their own chat sessions"
      ON chat_sessions
      FOR UPDATE
      USING (user_id = auth.uid());
    `);
    
    await supabase.sql(`
      CREATE POLICY IF NOT EXISTS "Users can delete their own chat sessions"
      ON chat_sessions
      FOR DELETE
      USING (user_id = auth.uid());
    `);
    
    // Create policies for chat messages
    console.log('Creating policies for chat messages...');
    await supabase.sql(`
      CREATE POLICY IF NOT EXISTS "Users can view messages in their own sessions"
      ON chat_messages
      FOR SELECT
      USING (
        session_id IN (
          SELECT id FROM chat_sessions 
          WHERE user_id = auth.uid()
        )
      );
    `);
    
    await supabase.sql(`
      CREATE POLICY IF NOT EXISTS "Users can insert messages in their own sessions"
      ON chat_messages
      FOR INSERT
      WITH CHECK (
        session_id IN (
          SELECT id FROM chat_sessions 
          WHERE user_id = auth.uid()
        )
      );
    `);
    
    await supabase.sql(`
      CREATE POLICY IF NOT EXISTS "Users can update messages in their own sessions"
      ON chat_messages
      FOR UPDATE
      USING (
        session_id IN (
          SELECT id FROM chat_sessions 
          WHERE user_id = auth.uid()
        )
      );
    `);
    
    await supabase.sql(`
      CREATE POLICY IF NOT EXISTS "Users can delete messages in their own sessions"
      ON chat_messages
      FOR DELETE
      USING (
        session_id IN (
          SELECT id FROM chat_sessions 
          WHERE user_id = auth.uid()
        )
      );
    `);
    
    // Create policies for anonymous users
    console.log('Creating policies for anonymous users...');
    await supabase.sql(`
      CREATE POLICY IF NOT EXISTS "Anonymous users can access their own sessions"
      ON chat_sessions
      FOR ALL
      USING (user_id IS NULL AND auth.uid() IS NULL);
    `);
    
    await supabase.sql(`
      CREATE POLICY IF NOT EXISTS "Anonymous users can access messages in anonymous sessions"
      ON chat_messages
      FOR ALL
      USING (
        session_id IN (
          SELECT id FROM chat_sessions 
          WHERE user_id IS NULL
        )
      );
    `);
    
    // List tables to verify they were created
    console.log('\nVerifying tables were created...');
    const { data, error } = await supabase.sql(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('chat_sessions', 'chat_messages');
    `);
    
    if (error) {
      throw error;
    }
    
    console.log('Tables created:', data);
    
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
    console.log('\nChat tables setup completed successfully!');
  } catch (error) {
    console.error('Error setting up chat tables:', error);
  }
}

createChatTables().catch(console.error); 