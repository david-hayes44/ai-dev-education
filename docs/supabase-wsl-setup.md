# Supabase WSL Setup Guide

This document explains how to set up Supabase integration with Windows Subsystem for Linux (WSL) for this project.

## Prerequisites

1. WSL installed with Ubuntu (or another Linux distribution)
2. Supabase project created with:
   - Storage bucket named "chat-files"
   - Proper storage policies for file operations

## Setup Steps

### 1. Create Supabase Configuration in WSL

```bash
# Create Supabase config directory
mkdir -p ~/.supabase

# Create config.json file
cat > ~/.supabase/config.json << EOF
{
  "project_id": "YOUR_PROJECT_ID",
  "api_url": "YOUR_SUPABASE_URL",
  "api_key": "YOUR_SUPABASE_ANON_KEY"
}
EOF
```

Replace the placeholders with your actual Supabase information from `.env.local`.

### 2. Set Up Cursor MCP Integration

Create or edit `.cursor/mcp.json` in your project root:

```json
{
  "mcpServers": {
    "supabase": {
      "command": "wsl",
      "args": ["npx", "-y", "@modelcontextprotocol/server-postgres", "YOUR_POSTGRES_CONNECTION_STRING"]
    }
  }
}
```

Replace `YOUR_POSTGRES_CONNECTION_STRING` with your actual PostgreSQL connection string.

### 3. Environment Variables

Ensure your `.env.local` file contains these Supabase variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Testing Your Setup

1. Check if the Supabase client initializes properly in your app
2. Navigate to `/supabase-direct-storage-test` to test storage operations
3. Verify that files can be uploaded and downloaded

## Troubleshooting

### CORS Issues
If you encounter CORS issues, check:
- Storage bucket policies (SELECT, INSERT, UPDATE, DELETE)
- Browser console for detailed error messages

### Connection Issues
If Supabase client fails to initialize:
- Verify environment variables are set correctly
- Check WSL configuration in `~/.supabase/config.json`
- Ensure PostgreSQL connection string is correct in `.cursor/mcp.json`

### File Upload Problems
If file uploads fail:
- Check storage bucket exists and has correct policies
- Verify you have the right permissions in Supabase
- Check for detailed errors in console logs

## Current Status

The project has:
- Storage bucket "chat-files" created with proper policies
- Enhanced error logging for troubleshooting
- Direct bucket/policy creation capability
- Server-side and client-side storage test pages 