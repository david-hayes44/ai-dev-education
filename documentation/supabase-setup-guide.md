# Supabase Setup Guide

This guide will walk you through setting up your Supabase project from scratch, with a focus on moving from Firebase to Supabase for the AI Dev Education platform.

## Step 1: Create a Supabase Account and Project

1. Go to [supabase.com](https://supabase.com) and sign up for an account
2. Once logged in, click "New Project" from the dashboard
3. Fill in the project details:
   - **Name**: "ai-dev-education" (or any name you prefer)
   - **Database Password**: Create a strong password (save this somewhere secure)
   - **Region**: Choose the region closest to your users
   - **Pricing Plan**: Start with the free tier

   ![Supabase New Project](https://supabase.com/docs/img/getting-started-with-nextjs/quickstart-dashboard.png)

4. Click "Create new project" and wait for the project to be created (usually takes 1-2 minutes)

## Step 2: Get Your API Keys

1. Once your project is created, navigate to the project dashboard
2. Go to Project Settings → API
3. You'll find two key pieces of information:
   - **Project URL**: This is your `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key**: This is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`

   ![Supabase API Keys](https://supabase.com/docs/img/supabase-js-v2.png)

4. Add these to your `.env.local` file:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

## Step 3: Create the Database Schema

1. In the Supabase dashboard, navigate to the "SQL Editor" section
2. Click "New Query"
3. Copy and paste the contents of our `scripts/supabase-schema.sql` file
4. Click "Run" to execute the SQL commands

   ![Supabase SQL Editor](https://supabase.com/docs/img/sql-query-editor.png)

5. You should see a success message indicating the queries were executed

## Step 4: Verify Your Tables

1. Navigate to the "Table Editor" section in the Supabase dashboard
2. You should see your newly created tables:
   - `sessions`
   - `messages`
   - `attachments`
3. Click on each table to verify the structure matches our schema

## Step 5: Set Up Storage

1. Navigate to the "Storage" section in the Supabase dashboard
2. You should see a bucket called "chat-files" (created by our SQL script)
3. If not, click "New Bucket", enter "chat-files" as the name, and make sure "Public" is unchecked

## Step 6: Test the Connection

Now that everything is set up, let's test the connection:

```bash
npm run supabase:test
```

This script will:
- Test the connection to your Supabase instance
- Verify that the "chat-files" storage bucket exists
- Test basic database operations by creating and deleting a test session

If everything is set up correctly, you should see success messages like:
- "✅ Successfully connected to Supabase"
- "✅ Successfully created test session"
- "✅ Successfully deleted test session"

## Understanding PostgreSQL vs Firestore

### Data Model Differences

**Firebase Firestore** is a NoSQL document database:
- Documents contain fields mapped to values
- Documents are stored in collections
- Hierarchical data with subcollections
- No schema enforcement

**Supabase PostgreSQL** is a relational database:
- Data stored in tables with rows and columns
- Tables have defined schemas
- Relationships between tables via foreign keys
- Strong typing and constraints

### Query Differences

**Firebase Firestore**:
```javascript
// Get all messages for a session in Firebase
const messagesRef = collection(db, `sessions/${sessionId}/messages`);
const messagesSnapshot = await getDocs(messagesRef);
const messages = messagesSnapshot.docs.map(doc => doc.data());
```

**Supabase PostgreSQL**:
```javascript
// Get all messages for a session in Supabase
const { data: messages, error } = await supabase
  .from('messages')
  .select('*')
  .eq('session_id', sessionId)
  .order('created_at', { ascending: true });
```

### Realtime Features

**Firebase Firestore**:
```javascript
// Subscribe to messages in Firebase
const unsubscribe = onSnapshot(
  collection(db, `sessions/${sessionId}/messages`), 
  (snapshot) => {
    const messages = snapshot.docs.map(doc => doc.data());
    // Update UI
  }
);
```

**Supabase PostgreSQL**:
```javascript
// Subscribe to messages in Supabase
const subscription = supabase
  .channel(`messages-${sessionId}`)
  .on('postgres_changes', 
    { event: 'INSERT', schema: 'public', table: 'messages', filter: `session_id=eq.${sessionId}` },
    (payload) => {
      const newMessage = payload.new;
      // Update UI
    }
  )
  .subscribe();
```

## Next Steps

Now that your Supabase infrastructure is set up:

1. **Update Environment Variables**: Make sure your `.env.local` file has the correct Supabase credentials
2. **Run the Migration Script**: If you have existing Firebase data, use our migration script
3. **Update Your Components**: Start switching components to use Supabase services

Remember, you can switch services gradually by changing your imports:

```javascript
// Use Firebase Storage
import { uploadFile } from '../lib/file-storage-service';

// Use Supabase Storage
import { uploadFile } from '../lib/supabase-storage-service';
```

For any issues, check the troubleshooting section in our migration guide or Supabase's official documentation. 