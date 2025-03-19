import { createClient } from '@supabase/supabase-js';

// Supabase connection parameters
const supabaseUrl = 'https://mbabelguxbendvcawgnu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1iYWJlbGd1eGJlbmR2Y2F3Z251Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTE0ODc1MzUsImV4cCI6MjAyNzA2MzUzNX0.6_HH0iKBEeIk_YmwBHjzyQhCG9vWMmFCuL2p8dU6wDA';

console.log('Creating Supabase client...');
const supabase = createClient(supabaseUrl, supabaseKey);

async function testSupabase() {
  console.log('Testing Supabase connection...');

  try {
    // Test the connection with a simple query
    const { data: versionData, error: versionError } = await supabase.rpc('version');
    
    if (versionError) {
      throw versionError;
    }
    
    console.log('Connected to Supabase!');
    console.log('Version:', versionData);

    // Create tables using SQL query
    console.log('\nCreating chat tables...');
    
    // Try to create the chat_sessions table
    const { error: sessionsError } = await supabase.rpc('exec', { 
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
      console.error('Error creating chat_sessions table:', sessionsError);
    } else {
      console.log('chat_sessions table created or exists');
    }
    
    // Try to create the chat_messages table
    const { error: messagesError } = await supabase.rpc('exec', { 
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
      console.error('Error creating chat_messages table:', messagesError);
    } else {
      console.log('chat_messages table created or exists');
    }
    
    // List all tables to verify
    const { data: tablesData, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['chat_sessions', 'chat_messages']);
    
    if (tablesError) {
      console.error('Error listing tables:', tablesError);
    } else {
      console.log('\nTables in database:', tablesData.map(t => t.table_name));
    }
    
    console.log('Supabase test completed successfully!');
  } catch (error) {
    console.error('Error testing Supabase:', error);
  }
}

testSupabase().catch(err => {
  console.error('Unhandled error:', err);
}); 