# Enhanced Chat Service with Supabase Persistence

This document explains how to set up and use the enhanced chat service with Supabase persistence for the AI Dev Education platform.

## Features

- **Server-side message persistence** with Supabase
- **Conversation import/export** functionality
- **Local storage fallback** for offline use
- **Seamless integration** with the existing chat UI

## Setup

### 1. Supabase Setup

First, you need to set up the required tables in your Supabase project:

1. Create a Supabase project at [app.supabase.com](https://app.supabase.com) if you haven't already
2. Navigate to the SQL Editor in your Supabase project
3. Run the SQL commands in `supabase-chat-tables.sql` to create the necessary tables and policies

Alternatively, you can use the Model Context Protocol (MCP) to connect to Supabase:

1. Configure MCP in your AI tool (e.g., Cursor)
2. Create a `.cursor/mcp.json` file with your Supabase connection
3. Use the PostgreSQL MCP server to execute the SQL commands

### 2. Environment Variables

Make sure your `.env.local` file has the following variables:

```
# Supabase Project Settings
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

You can find these values in your Supabase project settings under API.

### 3. Migrate Existing Data (Optional)

If you have existing chat data in localStorage, you can migrate it to Supabase:

```bash
npm run migrate:chats
```

This will transfer all existing chat sessions to your Supabase database.

## Usage

The enhanced chat service is a drop-in replacement for the original chat service:

1. The application has been updated to use `EnhancedChatProvider` instead of `ChatProvider`
2. A compatibility layer is in place so existing components still work
3. New functionality (import/export) is accessible through the UI

### Chat UI Components

The `ConversationActions` component provides UI elements for importing and exporting conversations:

```tsx
<ConversationActions />
```

This component is already integrated into the chat header.

### Enhanced Chat Context

If you need to use the chat functionality in a new component, you can use the enhanced chat context:

```tsx
import { useEnhancedChat } from "@/contexts/enhanced-chat-context"

function MyComponent() {
  const { messages, sendMessage, exportSession, importSession } = useEnhancedChat()
  
  // Your component logic here
}
```

### Compatibility Layer

For compatibility with existing components, we provide a drop-in replacement for the original `useChat` hook:

```tsx
import { useChat } from "@/components/chat/use-enhanced-chat"

function ExistingComponent() {
  const { messages, sendMessage } = useChat()
  
  // Your component logic here
}
```

## Architecture

The enhanced chat service uses the following components:

1. `EnhancedChatService` - Core service that manages chat functionality and persistence
2. `ChatStorage` - Interface for Supabase database operations
3. `ConversationIO` - Utility for importing and exporting conversations
4. `EnhancedChatContext` - React context for providing chat functionality to components
5. `ConversationActions` - UI components for import/export functionality

## Troubleshooting

### Database Connection Issues

If you experience issues connecting to the database, check:

1. Your Supabase URL and API keys in `.env.local`
2. Your network connection
3. The Supabase console for any service disruptions

### Missing Tables

If the application cannot find the tables:

1. Verify that the SQL commands in `supabase-chat-tables.sql` ran successfully
2. Check the Database section in your Supabase project for the tables
3. Ensure your API keys have the necessary permissions

### Local Storage Conflicts

If you notice conflicts between localStorage and database data:

1. Clear your browser's localStorage
2. Refresh the page to load data from the database
3. If needed, run the migration script again with `npm run migrate:chats`

## Next Steps

Future enhancements to consider:

1. **User Authentication** - Associate chat sessions with authenticated users
2. **Real-time Collaboration** - Enable real-time sharing of chat sessions
3. **Advanced Content Analysis** - Implement topic extraction and semantic search
4. **PDF Export** - Add support for exporting conversations as PDF documents 