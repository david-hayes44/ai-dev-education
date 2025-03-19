-- Enable UUID extension for generating UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Chat sessions table
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

-- Chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb,
  attachments JSONB DEFAULT '[]'::jsonb
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_category ON chat_sessions(category);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger to automatically update the updated_at column
DROP TRIGGER IF EXISTS update_chat_sessions_updated_at ON chat_sessions;
CREATE TRIGGER update_chat_sessions_updated_at
BEFORE UPDATE ON chat_sessions
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for chat_sessions
CREATE POLICY "Users can view their own chat sessions"
ON chat_sessions
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own chat sessions"
ON chat_sessions
FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own chat sessions"
ON chat_sessions
FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own chat sessions"
ON chat_sessions
FOR DELETE
USING (user_id = auth.uid());

-- Create policies for chat_messages
CREATE POLICY "Users can view messages in their own sessions"
ON chat_messages
FOR SELECT
USING (
  session_id IN (
    SELECT id FROM chat_sessions 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert messages in their own sessions"
ON chat_messages
FOR INSERT
WITH CHECK (
  session_id IN (
    SELECT id FROM chat_sessions 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update messages in their own sessions"
ON chat_messages
FOR UPDATE
USING (
  session_id IN (
    SELECT id FROM chat_sessions 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete messages in their own sessions"
ON chat_messages
FOR DELETE
USING (
  session_id IN (
    SELECT id FROM chat_sessions 
    WHERE user_id = auth.uid()
  )
);

-- Create policy for anonymous access
CREATE POLICY "Anonymous users can access their own sessions"
ON chat_sessions
FOR ALL
USING (user_id IS NULL AND auth.uid() IS NULL);

CREATE POLICY "Anonymous users can access messages in anonymous sessions"
ON chat_messages
FOR ALL
USING (
  session_id IN (
    SELECT id FROM chat_sessions 
    WHERE user_id IS NULL
  )
); 