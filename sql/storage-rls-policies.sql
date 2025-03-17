-- Enable Row Level Security for storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Enable Row Level Security for storage.buckets
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

-- Policy for attachments bucket - only allow access to own attachments
CREATE POLICY "Users can access own attachments"
  ON storage.objects FOR ALL
  USING (bucket_id = (SELECT id FROM storage.buckets WHERE name = 'attachments')
         AND (auth.uid() = owner));

-- Policy for avatars bucket - users can view all avatars but only upload/modify their own
CREATE POLICY "Users can view all avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = (SELECT id FROM storage.buckets WHERE name = 'avatars'));
  
CREATE POLICY "Users can upload own avatars"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = (SELECT id FROM storage.buckets WHERE name = 'avatars')
              AND (auth.uid() = owner));
              
CREATE POLICY "Users can update own avatars"
  ON storage.objects FOR UPDATE
  USING (bucket_id = (SELECT id FROM storage.buckets WHERE name = 'avatars')
         AND (auth.uid() = owner));
         
CREATE POLICY "Users can delete own avatars"
  ON storage.objects FOR DELETE
  USING (bucket_id = (SELECT id FROM storage.buckets WHERE name = 'avatars')
         AND (auth.uid() = owner));

-- Policy for exports bucket - only allow access to own exports
CREATE POLICY "Users can access own exports"
  ON storage.objects FOR ALL
  USING (bucket_id = (SELECT id FROM storage.buckets WHERE name = 'exports')
         AND (auth.uid() = owner));

-- Allow service role to access all buckets (for admin operations)
CREATE POLICY "Service role has full access to all buckets"
  ON storage.buckets FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to all objects"
  ON storage.objects FOR ALL
  USING (auth.role() = 'service_role');

-- Allow authenticated users to access their own buckets
CREATE POLICY "Users can access their own buckets"
  ON storage.buckets FOR ALL
  USING (owner = auth.uid());

-- Allow public access to public buckets
CREATE POLICY "Public access to public buckets"
  ON storage.buckets FOR SELECT
  USING (public = true);

-- Allow public access to objects in public buckets
CREATE POLICY "Public access to objects in public buckets"
  ON storage.objects FOR SELECT
  USING (bucket_id IN (
    SELECT id FROM storage.buckets WHERE public = true
  )); 