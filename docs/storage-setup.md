# Supabase Storage Setup Guide

This guide provides instructions for setting up and configuring Supabase Storage for the application.

## Required Storage Buckets

The application requires the following storage buckets:

1. `attachments` - For storing file attachments (private)
2. `avatars` - For storing user profile images (public read, private write)
3. `exports` - For storing exported data (private)

## Automatic Setup

To automatically create the required storage buckets, you need to:

1. Get your Supabase service role key from the Supabase dashboard:
   - Go to https://app.supabase.com
   - Select your project
   - Go to Project Settings > API
   - Copy the "service_role key" (NOT the anon key)

2. Add the service role key to your `.env.local` file:
   ```
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

3. Run the bucket creation script:
   ```
   npm run supabase:create-buckets-api
   ```

## Manual Setup

If you prefer to set up the buckets manually:

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to Storage in the left sidebar
4. Create each of the required buckets:
   - Click "Create Bucket"
   - Enter the bucket name (attachments, avatars, or exports)
   - Set the appropriate public/private setting
   - Click "Create"

## Row Level Security (RLS) Policies

The application uses the following RLS policies for storage:

### Attachments Bucket
- Users can only access their own attachments

### Avatars Bucket
- Users can view all avatars (public read)
- Users can only upload/modify/delete their own avatars

### Exports Bucket
- Users can only access their own exports

To apply these RLS policies, run:
```
npm run supabase:storage-rls
```

## Troubleshooting

If you encounter issues with storage bucket creation:

1. Check that your Supabase service role key is correct
2. Verify that your Supabase project is active
3. Check the Supabase dashboard for any storage-related errors
4. Try creating the buckets manually through the Supabase dashboard

## Storage Usage in the Application

The application uses the following storage paths:

- Avatars: `avatars/{user_id}/profile.{extension}`
- Attachments: `attachments/{user_id}/{file_id}.{extension}`
- Exports: `exports/{user_id}/{export_id}.{extension}`

## Security Recommendations

- Ensure RLS policies are properly configured for each bucket
- Only make buckets public when absolutely necessary
- Use folder structure with user IDs to separate user content
- Set up proper CORS policies if accessing from frontend applications
- Regularly audit storage access patterns 