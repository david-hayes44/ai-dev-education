# Firebase to Supabase Migration Guide

This guide outlines the steps to migrate from Firebase to Supabase in the AI Dev Education platform. The migration includes storage, database, and authentication services.

## Prerequisites

1. **Supabase Account**: Create a free account at [supabase.com](https://supabase.com).
2. **Supabase Project**: Create a new Supabase project.
3. **API Keys**: Get your Supabase URL and anon key from the project settings.

## Step 1: Environment Setup

1. Add the following variables to your `.env.local` file:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

2. Ensure you have the required dependencies installed:

```bash
npm install @supabase/supabase-js uuid
npm install -D tsx
```

## Step 2: Create Database Schema

1. Log in to your Supabase dashboard
2. Navigate to the SQL Editor
3. Create a new query and paste the contents of `scripts/supabase-schema.sql`
4. Execute the query to create the necessary tables, indexes, and policies

Alternatively, you can use the Supabase CLI to apply the migrations:

```bash
supabase db push
```

## Step 3: Test the Connection

Run the test script to verify the connection to Supabase:

```bash
npm run supabase:test
```

This script will:
- Test the connection to your Supabase instance
- Verify that storage buckets are properly configured
- Test basic database operations

## Step 4: Migrate Data (Optional)

If you have existing data in Firebase that you want to migrate:

1. First, run a dry run to check what would be migrated:

```bash
npm run supabase:migrate:dry
```

2. If the dry run looks good, run the actual migration:

```bash
npm run supabase:migrate
```

Note: The migration script handles:
- Chat sessions
- Chat messages
- File attachments

## Step 5: Switch to Supabase Services

The codebase has been set up to work with both Firebase and Supabase in parallel. You can choose which service to use by updating imports in your components:

### For Storage:
```typescript
// Use Firebase Storage
import { uploadFile, deleteFile } from '../lib/file-storage-service';

// Use Supabase Storage
import { uploadFile, deleteFile } from '../lib/supabase-storage-service';
```

### For Database:
```typescript
// Use Firebase Firestore
import { ChatService } from '../lib/chat-service';

// Use Supabase Database
import { 
  createChatSession, 
  getChatSessions, 
  addChatMessage 
} from '../lib/supabase-chat-service';
```

## PostgreSQL vs. Firestore: Key Differences

### 1. Data Model

**Firestore**:
- Document-based NoSQL database
- Hierarchical structure
- Documents within collections

**PostgreSQL (Supabase)**:
- Relational database
- Tables with columns and rows
- Relationships through foreign keys

### 2. Querying

**Firestore**:
- Limited query capabilities
- No joins between collections
- Better for simple document retrieval

**PostgreSQL (Supabase)**:
- Full SQL support
- Complex joins and subqueries
- Better for relational data and analytics

### 3. Real-time Features

**Firestore**:
- Built-in real-time listeners

**PostgreSQL (Supabase)**:
- Realtime functionality through PostgreSQL's LISTEN/NOTIFY
- Publication/subscription model

## Row Level Security (RLS)

Supabase uses PostgreSQL's Row Level Security to control access to data. Key concepts:

1. **Policies**: Rules that determine who can access which rows
2. **JWT Authentication**: Seamless integration with Supabase Auth
3. **Claims**: Custom claims can be added to JWTs for more granular permissions

Example policy (already set up in schema):

```sql
CREATE POLICY "Users can only access their own data"
ON public.sessions
FOR ALL
USING (auth.uid() = user_id);
```

## Best Practices

1. **Use Transactions**: PostgreSQL supports transactions for atomic operations
2. **Normalize Data**: Take advantage of PostgreSQL's relational capabilities
3. **Indexing**: Create indexes for frequently queried columns
4. **Secure Policies**: Always implement strict RLS policies
5. **Error Handling**: Handle database errors gracefully in client code

## Troubleshooting

### Common Issues:

1. **Connection Errors**:
   - Check your NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
   - Verify network connectivity to Supabase

2. **Permission Errors**:
   - Review your RLS policies
   - Check if you're authenticated properly

3. **Schema Errors**:
   - Ensure all tables and columns match what the code expects
   - Look for missing indexes or constraints

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript) 