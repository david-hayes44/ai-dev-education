-- Performance optimization indexes for Supabase schema
-- Run this script after the initial migration to add additional indexes

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at);

-- Conversations indexes (already has user_id index)
CREATE INDEX IF NOT EXISTS idx_conversations_title ON conversations(title);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at);

-- Messages indexes (already has conversation_id and created_at indexes)
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_is_ai ON messages(is_ai);
CREATE INDEX IF NOT EXISTS idx_messages_content_trgm ON messages USING gin (content gin_trgm_ops);

-- Attachments indexes (already has message_id index)
CREATE INDEX IF NOT EXISTS idx_attachments_type ON attachments(type);
CREATE INDEX IF NOT EXISTS idx_attachments_created_at ON attachments(created_at);

-- Sessions indexes (already has user_id index)
CREATE INDEX IF NOT EXISTS idx_sessions_title ON sessions(title);
CREATE INDEX IF NOT EXISTS idx_sessions_metadata ON sessions USING gin (metadata);

-- Trigger gin trgm extension if needed - the content text search index requires it
CREATE EXTENSION IF NOT EXISTS pg_trgm;

/* 
Index usage guidance:
- idx_messages_content_trgm: Use for full text search in message content
- idx_profiles_email: Use for user lookups by email address
- idx_messages_is_ai: Use when filtering AI vs. user messages 
- type indexes: Use when filtering by specific types (e.g., file attachments)
- metadata: Use when searching JSON fields
*/ 