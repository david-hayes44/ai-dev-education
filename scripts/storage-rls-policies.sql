-- Storage RLS policies for Supabase
-- These policies ensure proper access control for storage buckets

-- Note: These policies should be applied AFTER creating the buckets in the Supabase dashboard

-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

---------------------------------------------
-- Policies for 'attachments' bucket
---------------------------------------------

-- Allow authenticated users to read attachments related to their conversations
CREATE POLICY "Users can view attachments in their conversations"
ON storage.objects FOR SELECT
USING (
  auth.role() = 'authenticated' AND 
  bucket_id = 'attachments' AND
  EXISTS (
    SELECT 1 FROM messages m
    JOIN conversations c ON m.conversation_id = c.id
    WHERE 
      -- The first part of the path should be the message ID
      -- Example path: message_123/file.jpg
      SPLIT_PART(name, '/', 1) = m.id::text 
      AND c.user_id = auth.uid()
  )
);

-- Allow authenticated users to upload attachments
CREATE POLICY "Users can upload attachments"
ON storage.objects FOR INSERT
WITH CHECK (
  auth.role() = 'authenticated' AND
  bucket_id = 'attachments' AND
  -- Advanced applications might want to validate that the path starts with a valid message ID
  -- that belongs to the user, but for simplicity we'll just check authentication
  (LENGTH(name) > 0)
);

-- Allow users to delete their own attachments
CREATE POLICY "Users can delete their own attachments"
ON storage.objects FOR DELETE
USING (
  auth.role() = 'authenticated' AND
  bucket_id = 'attachments' AND
  EXISTS (
    SELECT 1 FROM messages m
    JOIN conversations c ON m.conversation_id = c.id
    WHERE 
      SPLIT_PART(name, '/', 1) = m.id::text
      AND c.user_id = auth.uid()
  )
);

---------------------------------------------
-- Policies for 'avatars' bucket
---------------------------------------------

-- Allow anyone to read avatar images
CREATE POLICY "Public read access for avatars"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'avatars'
);

-- Allow authenticated users to upload their own avatar
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  auth.role() = 'authenticated' AND
  bucket_id = 'avatars' AND
  SPLIT_PART(name, '/', 1) = auth.uid()::text
);

-- Allow users to update their own avatar
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (
  auth.role() = 'authenticated' AND
  bucket_id = 'avatars' AND
  SPLIT_PART(name, '/', 1) = auth.uid()::text
);

-- Allow users to delete their own avatar
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (
  auth.role() = 'authenticated' AND
  bucket_id = 'avatars' AND
  SPLIT_PART(name, '/', 1) = auth.uid()::text
);

---------------------------------------------
-- Policies for 'exports' bucket
---------------------------------------------

-- Allow authenticated users to download their exports
CREATE POLICY "Users can view their own exports"
ON storage.objects FOR SELECT
USING (
  auth.role() = 'authenticated' AND
  bucket_id = 'exports' AND
  SPLIT_PART(name, '/', 1) = auth.uid()::text
);

-- Allow authenticated users to create exports
CREATE POLICY "Users can create their own exports"
ON storage.objects FOR INSERT
WITH CHECK (
  auth.role() = 'authenticated' AND
  bucket_id = 'exports' AND
  SPLIT_PART(name, '/', 1) = auth.uid()::text
);

-- Allow users to delete their own exports
CREATE POLICY "Users can delete their own exports"
ON storage.objects FOR DELETE
USING (
  auth.role() = 'authenticated' AND
  bucket_id = 'exports' AND
  SPLIT_PART(name, '/', 1) = auth.uid()::text
);

-- Note on security:
-- 1. All bucket access is scoped to authenticated users except for avatar reading
-- 2. Resource ownership is enforced through folder structure (user ID as first segment)
-- 3. For attachments, we validate against the database to ensure proper access controls
-- 4. Consider adding scheduled cleanup for exports older than a certain time 