-- Row Level Security Policies for Supabase
-- Ensures data security and isolation between users

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Profiles Table Policies
-- Users can view their own profile
CREATE POLICY "Users can view their own profile" 
ON profiles FOR SELECT 
USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = id);

-- Users cannot delete their profile (handled by cascade on auth.users)
-- No explicit DELETE policy needed

-- Conversations Table Policies
-- Users can view their own conversations
CREATE POLICY "Users can view their own conversations" 
ON conversations FOR SELECT 
USING (auth.uid() = user_id);

-- Users can insert their own conversations
CREATE POLICY "Users can create their own conversations" 
ON conversations FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can update their own conversations
CREATE POLICY "Users can update their own conversations" 
ON conversations FOR UPDATE 
USING (auth.uid() = user_id);

-- Users can delete their own conversations
CREATE POLICY "Users can delete their own conversations" 
ON conversations FOR DELETE 
USING (auth.uid() = user_id);

-- Messages Table Policies
-- Users can view messages in their conversations
CREATE POLICY "Users can view messages in their conversations" 
ON messages FOR SELECT 
USING (
    auth.uid() = user_id 
    OR 
    auth.uid() IN (
        SELECT user_id FROM conversations 
        WHERE conversations.id = messages.conversation_id
    )
);

-- Users can create messages in their conversations
CREATE POLICY "Users can create messages in their conversations" 
ON messages FOR INSERT 
WITH CHECK (
    auth.uid() = user_id 
    OR 
    auth.uid() IN (
        SELECT user_id FROM conversations 
        WHERE conversations.id = messages.conversation_id
    )
);

-- Users can only update their own messages
CREATE POLICY "Users can update their own messages" 
ON messages FOR UPDATE 
USING (auth.uid() = user_id);

-- Users can only delete their own messages
CREATE POLICY "Users can delete their own messages" 
ON messages FOR DELETE 
USING (auth.uid() = user_id);

-- Attachments Table Policies
-- Users can view attachments in their messages
CREATE POLICY "Users can view attachments in their messages" 
ON attachments FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM messages 
        WHERE messages.id = attachments.message_id
        AND (
            messages.user_id = auth.uid() 
            OR 
            messages.conversation_id IN (
                SELECT id FROM conversations 
                WHERE user_id = auth.uid()
            )
        )
    )
);

-- Users can create attachments for their messages
CREATE POLICY "Users can create attachments for their messages" 
ON attachments FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM messages 
        WHERE messages.id = attachments.message_id
        AND (
            messages.user_id = auth.uid() 
            OR 
            messages.conversation_id IN (
                SELECT id FROM conversations 
                WHERE user_id = auth.uid()
            )
        )
    )
);

-- Users can delete attachments from their messages
CREATE POLICY "Users can delete attachments from their messages" 
ON attachments FOR DELETE 
USING (
    EXISTS (
        SELECT 1 FROM messages 
        WHERE messages.id = attachments.message_id
        AND messages.user_id = auth.uid()
    )
);

-- Sessions Table Policies
-- Users can view their own sessions
CREATE POLICY "Users can view their own sessions" 
ON sessions FOR SELECT 
USING (auth.uid() = user_id);

-- Users can create their own sessions
CREATE POLICY "Users can create their own sessions" 
ON sessions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can update their own sessions
CREATE POLICY "Users can update their own sessions" 
ON sessions FOR UPDATE 
USING (auth.uid() = user_id);

-- Users can delete their own sessions
CREATE POLICY "Users can delete their own sessions" 
ON sessions FOR DELETE 
USING (auth.uid() = user_id);

-- For admins (can be implemented later if needed)
-- CREATE POLICY "Admins can view all data" ON [table] FOR SELECT USING (auth.uid() IN (SELECT id FROM admins)); 