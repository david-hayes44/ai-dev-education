# Advanced Content Analysis Features Setup Guide

This guide provides an overview of how to set up and test the advanced content analysis features that have been implemented.

## What Has Been Implemented

1. **Topic Extraction Service**
   - Extracts topics from conversations using vector embeddings and clustering
   - Automatically identifies key themes in user conversations
   - Implemented in `lib/topic-extraction-service.ts`

2. **Semantic Search Service**
   - Enables searching conversations by meaning rather than just keywords
   - Supports within-session and cross-session search
   - Implemented in `lib/semantic-search-service.ts`

3. **Content Recommendation Service**
   - Suggests relevant content based on conversation context
   - Implemented template matching for common conversation patterns
   - Implemented in `lib/content-recommendation-service.ts`

4. **UI Components**
   - `ConversationSearch` component for semantic search through conversations
   - `TopicDisplay` component to show extracted topics
   - `ContentRecommendations` component to display recommended content
   - All integrated with the existing chat UI

5. **EnhancedChatProvider**
   - A context provider that enhances the existing chat functionality
   - Exposes advanced features via a React hook (`useEnhancedChat`)
   - Implemented in `lib/hooks/use-enhanced-chat.tsx`

## Setup Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set Environment Variables**
   Ensure the following environment variables are set in your `.env.local` file:
   ```
   OPENAI_API_KEY=your_openai_api_key
   NEXT_PUBLIC_OPENROUTER_API_KEY=your_openrouter_api_key
   ```
   One of these is required for the vector embedding service to work properly.

3. **Database Setup for Supabase**
   The enhanced chat service requires Supabase tables for persistence. Execute the SQL from `supabase-chat-tables.sql` in your Supabase instance.

4. **Run the Application**
   ```bash
   npm run dev
   ```

## Testing Instructions

### Testing Topic Extraction

1. Start a new conversation in the chat interface
2. Send several messages on a specific topic (e.g., "Tell me about machine learning")
3. Continue the conversation with follow-up questions
4. Click on the "Topics" tab in the preferences panel
5. Verify that relevant topics are being extracted and displayed

### Testing Semantic Search

1. Start a conversation with several messages on different topics
2. Click the search icon in the chat interface
3. Enter a search query related to one of the topics
4. Verify that semantically relevant messages are returned in the results
5. Click on a search result to navigate to that message in the conversation

### Testing Content Recommendations

1. Start a conversation about a specific topic related to the site content
2. Continue the conversation with several messages
3. Click on the "Content" tab in the preferences panel
4. Verify that relevant content recommendations are displayed based on the conversation

## Known Limitations

1. The vector embedding service falls back to a simple hashing mechanism if no OpenAI API key is available, which results in less accurate embeddings.
2. Topic extraction requires at least 3 substantial messages to generate meaningful topics.
3. The content recommendation service currently works with a limited set of content that's available in the system.

## Troubleshooting

If you encounter issues with the advanced features:

1. Check browser console for errors
2. Verify that API keys are correctly set
3. Ensure Supabase connection is working properly
4. Try refreshing the page to reinitialize the services

## Deployment Checklist

Before deploying to production:

- [ ] Test all features thoroughly
- [ ] Optimize vector embedding generation for performance
- [ ] Configure proper error handling for production
- [ ] Set up monitoring for API usage
- [ ] Document all APIs and components for the team 