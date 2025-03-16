-- Schema for Supabase database tables
-- This file contains the SQL commands to create the tables for the chat application

-- Enable Row Level Security (RLS)
-- This ensures that users can only access their own data
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create sessions table
CREATE TABLE IF NOT EXISTS public.sessions (
    id UUID PRIMARY KEY,
    title TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    topic TEXT,
    category TEXT,
    model TEXT,
    user_id UUID
);

-- Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB,
    is_streaming BOOLEAN DEFAULT FALSE
);

-- Create attachments table
CREATE TABLE IF NOT EXISTS public.attachments (
    id UUID PRIMARY KEY,
    message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    size INTEGER NOT NULL,
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    content TEXT,
    storage_ref TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON public.sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_session_id ON public.messages(session_id);
CREATE INDEX IF NOT EXISTS idx_attachments_message_id ON public.attachments(message_id);
CREATE INDEX IF NOT EXISTS idx_sessions_updated_at ON public.sessions(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);

-- Enable Row Level Security
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for sessions
-- For now, we'll use simple policies that allow all operations (we'll refine these later)
CREATE POLICY "Enable all operations for authenticated users" ON public.sessions
    USING (true)
    WITH CHECK (true);

-- Create RLS policies for messages
CREATE POLICY "Enable all operations for authenticated users" ON public.messages
    USING (true)
    WITH CHECK (true);

-- Create RLS policies for attachments
CREATE POLICY "Enable all operations for authenticated users" ON public.attachments
    USING (true)
    WITH CHECK (true);

-- Enable Realtime functionality for these tables
-- This allows the client to subscribe to changes
ALTER PUBLICATION supabase_realtime ADD TABLE public.sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.attachments;

-- Create a Function to create a bucket if it doesn't exist
CREATE OR REPLACE FUNCTION create_bucket_if_not_exists(bucket_name TEXT) 
RETURNS VOID AS $$
DECLARE
    bucket_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM storage.buckets
        WHERE name = bucket_name
    ) INTO bucket_exists;

    IF NOT bucket_exists THEN
        INSERT INTO storage.buckets (id, name)
        VALUES (bucket_name, bucket_name);
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Create storage bucket for chat files
SELECT create_bucket_if_not_exists('chat-files');

-- Set up storage bucket policies
INSERT INTO storage.policies (name, bucket_id, definition)
VALUES
(
    'Allow public read access',
    'chat-files',
    '{"bucket_id":"chat-files","created_at":null,"id":null,"name":null,"owner":null,"updated_at":null,"allowed_mime_types":null,"avif_autodetection":false,"file_size_limit":10485760,"object_ownership":null,"owner_id":null,"path_prefix":null,"public":true,"version":0}'
)
ON CONFLICT (name, bucket_id) DO NOTHING;

-- Enable logging for debugging
ALTER SYSTEM SET log_statement = 'all';
ALTER SYSTEM SET log_min_messages = 'debug';

-- Refresh configurations
SELECT pg_reload_conf(); 