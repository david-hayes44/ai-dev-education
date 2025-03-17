# Manual RLS Policy Setup for Supabase Storage

This guide provides step-by-step instructions for manually setting up Row Level Security (RLS) policies for Supabase Storage buckets through the Supabase Dashboard.

## Prerequisites

- You've already created the required storage buckets: `attachments`, `avatars`, and `exports`
- You have access to the Supabase Dashboard for your project

## Access the Storage RLS Policies

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **Storage** in the left sidebar
4. Click on the **Policies** tab at the top of the page

## Create RLS Policies for Storage Buckets

### For the `attachments` Bucket:

1. Click on **New Policy**
2. Select policy type: **Create a policy from scratch**
3. For the policy name, enter: **Users can access own attachments**
4. For the bucket: Select **attachments**
5. For allowed operations, select: **All: Select, Insert, Update, Delete**
6. For the policy definition (USING expression), enter:
   ```sql
   (bucket_id = (SELECT id FROM storage.buckets WHERE name = 'attachments'))
   AND (auth.uid() = owner)
   ```
7. Click **Create Policy**

### For the `avatars` Bucket (Public Read Policy):

1. Click on **New Policy**
2. Select policy type: **Create a policy from scratch**
3. For the policy name, enter: **Users can view all avatars**
4. For the bucket: Select **avatars**
5. For allowed operations, select: **Select**
6. For the policy definition (USING expression), enter:
   ```sql
   (bucket_id = (SELECT id FROM storage.buckets WHERE name = 'avatars'))
   ```
7. Click **Create Policy**

### For the `avatars` Bucket (Restricted Write Policy):

1. Click on **New Policy**
2. Select policy type: **Create a policy from scratch**
3. For the policy name, enter: **Users can upload own avatars**
4. For the bucket: Select **avatars**
5. For allowed operations, select: **Insert**
6. For the policy definition (WITH CHECK expression), enter:
   ```sql
   (bucket_id = (SELECT id FROM storage.buckets WHERE name = 'avatars'))
   AND (auth.uid() = owner)
   ```
7. Click **Create Policy**

8. Repeat similar policies for **Update** and **Delete** operations on the `avatars` bucket, using the USING expression instead of WITH CHECK.

### For the `exports` Bucket:

1. Click on **New Policy**
2. Select policy type: **Create a policy from scratch**
3. For the policy name, enter: **Users can access own exports**
4. For the bucket: Select **exports**
5. For allowed operations, select: **All: Select, Insert, Update, Delete**
6. For the policy definition (USING expression), enter:
   ```sql
   (bucket_id = (SELECT id FROM storage.buckets WHERE name = 'exports'))
   AND (auth.uid() = owner)
   ```
7. Click **Create Policy**

### Service Role Access Policy (Optional):

If you need administrative access to all buckets:

1. Click on **New Policy**
2. Select policy type: **Create a policy from scratch**
3. For the policy name, enter: **Service role has full access to all buckets**
4. For the bucket: Select **All buckets**
5. For allowed operations, select: **All: Select, Insert, Update, Delete**
6. For the policy definition (USING expression), enter:
   ```sql
   auth.role() = 'service_role'
   ```
7. Click **Create Policy**

## Verify RLS Policies

After creating all the policies:

1. Navigate to each bucket and click on the **Policies** tab
2. Verify that the appropriate policies are listed for each bucket
3. Test the policies by:
   - Logging in as a regular user and attempting to access files
   - Using the Supabase client in your application with a user token
   - Using the service role key for administrative operations

## Troubleshooting

If your policies aren't working as expected:

1. Check the SQL syntax in your policy definitions
2. Verify that the bucket IDs and names match correctly
3. Ensure that RLS is enabled for the storage.objects and storage.buckets tables
4. Test with specific user IDs to verify permission levels
5. Check the Supabase logs for any RLS-related errors

## Common Policies for Reference

Here are some common RLS policy patterns you might want to use:

### Public Access to All Files in a Bucket:
```sql
bucket_id = (SELECT id FROM storage.buckets WHERE name = 'public-bucket')
```

### Authenticated Users Can Access Public Files:
```sql
auth.role() = 'authenticated' AND bucket_id = (SELECT id FROM storage.buckets WHERE name = 'authenticated-bucket')
```

### User Can Only Access Their Organization's Files:
```sql
bucket_id = (SELECT id FROM storage.buckets WHERE name = 'org-bucket') 
AND
(SELECT org_id FROM profiles WHERE id = auth.uid()) = (SELECT org_id FROM storage.objects WHERE id = objects.id)
``` 