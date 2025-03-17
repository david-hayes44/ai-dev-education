-- Enable the necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create storage schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS storage;

-- Create storage buckets 
-- This can only be run by a superuser or someone with the right privileges
-- Make sure your connection uses the right credentials

-- Function to create storage bucket if it doesn't exist
CREATE OR REPLACE FUNCTION create_storage_bucket(bucket_name TEXT, is_public BOOLEAN DEFAULT FALSE)
RETURNS TEXT AS $$
DECLARE
  bucket_id UUID;
BEGIN
  -- Check if bucket already exists
  SELECT id INTO bucket_id FROM storage.buckets WHERE name = bucket_name;
  
  IF bucket_id IS NULL THEN
    -- Create the bucket
    INSERT INTO storage.buckets (id, name, public)
    VALUES (uuid_generate_v4(), bucket_name, is_public)
    RETURNING id INTO bucket_id;
    
    -- Create policy to allow public access if bucket is public
    IF is_public THEN
      EXECUTE format('
        CREATE POLICY "Public Access %s" ON storage.objects
        FOR SELECT
        USING (bucket_id = ''%s''::uuid);
      ', bucket_name, bucket_id);
    END IF;
    
    RETURN 'Bucket ' || bucket_name || ' created successfully.';
  ELSE
    RETURN 'Bucket ' || bucket_name || ' already exists.';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create the required buckets
SELECT create_storage_bucket('attachments', false);
SELECT create_storage_bucket('avatars', false);
SELECT create_storage_bucket('exports', false);

-- Create RLS policies for authenticated users
-- Policy for attachments bucket - only allow access to own attachments
CREATE POLICY IF NOT EXISTS "Users can access own attachments"
  ON storage.objects FOR ALL
  USING (bucket_id = (SELECT id FROM storage.buckets WHERE name = 'attachments')
         AND (auth.uid() = owner));

-- Policy for avatars bucket - users can view all avatars but only upload/modify their own
CREATE POLICY IF NOT EXISTS "Users can view all avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = (SELECT id FROM storage.buckets WHERE name = 'avatars'));
  
CREATE POLICY IF NOT EXISTS "Users can upload own avatars"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = (SELECT id FROM storage.buckets WHERE name = 'avatars')
              AND (auth.uid() = owner));
              
CREATE POLICY IF NOT EXISTS "Users can update own avatars"
  ON storage.objects FOR UPDATE
  USING (bucket_id = (SELECT id FROM storage.buckets WHERE name = 'avatars')
         AND (auth.uid() = owner));
         
CREATE POLICY IF NOT EXISTS "Users can delete own avatars"
  ON storage.objects FOR DELETE
  USING (bucket_id = (SELECT id FROM storage.buckets WHERE name = 'avatars')
         AND (auth.uid() = owner));

-- Policy for exports bucket - only allow access to own exports
CREATE POLICY IF NOT EXISTS "Users can access own exports"
  ON storage.objects FOR ALL
  USING (bucket_id = (SELECT id FROM storage.buckets WHERE name = 'exports')
         AND (auth.uid() = owner)); 