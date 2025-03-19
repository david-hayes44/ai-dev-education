# Advanced Content Analysis and Search Features

This document outlines the advanced content analysis and search features implemented to enhance the chat experience.

## Overview

We've implemented a suite of intelligent content analysis and search capabilities that leverage vector embeddings and semantic similarity to provide the following features:

1. **Topic Extraction** - Automatically identify and categorize conversation topics
2. **Semantic Search** - Search conversations by meaning rather than just keywords
3. **Content Recommendations** - Suggest relevant content based on conversation context
4. **Response Recommendations** - Provide intelligent response suggestions

## Architecture

### Core Services

- **VectorEmbeddingService** - Generates and manages vector embeddings for content
- **TopicExtractionService** - Identifies topics in conversation using clustering techniques
- **SemanticSearchService** - Provides semantic search across conversation messages
- **ContentRecommendationService** - Suggests relevant content and responses

### Integration with Enhanced Chat

These services are integrated into the `EnhancedChatService` and exposed through the `useEnhancedChat` hook. This provides a seamless way to access advanced features while maintaining backward compatibility with the existing chat implementation.

## Features in Detail

### Topic Extraction

The topic extraction service analyzes conversation messages to identify prominent topics using these steps:

1. Filter out system messages and short messages
2. Convert messages to vector embeddings
3. Use k-means clustering to group semantically similar messages
4. Extract keywords from each cluster to generate topic labels
5. Rank topics by relevance

Usage example:
```typescript
import { topicExtractionService } from '@/lib/topic-extraction-service';

// Extract topics from a list of messages
const topics = await topicExtractionService.extractTopics(messages);

// Topics include relevance scores and associated message IDs
console.log(topics);
// [
//   { topic: "machine learning, ai, models", relevance: 0.92, messageIds: ["msg1", "msg3"] },
//   { topic: "database, schema, design", relevance: 0.78, messageIds: ["msg2", "msg4"] }
// ]
```

### Semantic Search

The semantic search service enables finding messages by meaning rather than just keywords:

1. Convert the search query to a vector embedding
2. Calculate similarity scores between the query and messages
3. Rank results by relevance
4. Return the most similar messages

Features include:
- **Within-session search** - Search the current conversation
- **Cross-session search** - Search across all conversations
- **Similar message finding** - Find messages similar to a specific message

Usage example:
```typescript
import { semanticSearchService } from '@/lib/semantic-search-service';

// Search within a conversation
const results = await semanticSearchService.searchMessages(
  "deployment issues", 
  messages,
  { limit: 5, threshold: 0.6 }
);

// Search across multiple sessions
const crossSessionResults = await semanticSearchService.searchAcrossSessions(
  "database migration", 
  sessionsWithMessages
);

// Find messages similar to a reference message
const similarMessages = await semanticSearchService.findSimilarMessages(
  "message-id-123",
  messages
);
```

### Content Recommendations

The content recommendation service suggests relevant content based on the conversation context:

1. Analyze recent messages to understand the conversation context
2. Use vector embeddings to find semantically related content
3. Rank content by relevance to the conversation
4. Cache recommendations for performance

Features include:
- **Content recommendations** - Suggest relevant documentation or resources
- **Response recommendations** - Suggest possible responses based on conversation context
- **Template matching** - Match common patterns like greetings or farewells

Usage example:
```typescript
import { contentRecommendationService } from '@/lib/content-recommendation-service';

// Get content recommendations
const contentRecs = await contentRecommendationService.getContentRecommendations(
  messages,
  { limit: 3, cacheKey: 'session-123' }
);

// Get response recommendations
const responseRecs = await contentRecommendationService.getResponseRecommendations(
  messages,
  { includeTemplates: true }
);
```

## UI Components

We've created several UI components to expose these features to users:

- **ConversationSearch** - Dialog for searching within the current conversation
- **ChatMessageCard** - Displays messages with relevance scores in search results
- **TopicList** - Shows extracted topics from the current conversation
- **ContentRecommendationPanel** - Displays content recommendations

## Technical Implementation Notes

### Vector Embeddings

We use the OpenAI Embeddings API to generate vector representations of text. For development without API access, we use a fallback mechanism that creates pseudo-embeddings based on simple text hashing.

### Clustering Algorithm

For topic extraction, we use a simplified k-means algorithm:
1. Initialize clusters with random centroids
2. Assign messages to the nearest cluster
3. Update centroids based on assigned messages
4. Repeat for a fixed number of iterations
5. Find representative messages for each cluster

### Similarity Calculation

Similarity between vectors is calculated using cosine similarity:
```typescript
function cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);
  
  if (normA === 0 || normB === 0) {
    return 0;
  }
  
  return dotProduct / (normA * normB);
}
```

## Future Enhancements

Future improvements could include:
- Integration with more advanced LLM services for better topic labeling
- Real-time topic tracking as conversations evolve
- Personalized content recommendations based on user history
- Multi-language support for semantic search and topic extraction
- Enhanced visualization of conversation topics and relationships

## Getting Started

To use these features in your components:

```tsx
import { useEnhancedChat } from '@/lib/hooks/use-enhanced-chat';

function MyComponent() {
  const { 
    currentTopics, 
    contentRecommendations,
    searchCurrentSession
  } = useEnhancedChat();
  
  // Access topics
  console.log(currentTopics);
  
  // Access content recommendations
  console.log(contentRecommendations);
  
  // Search the current session
  const handleSearch = async (query) => {
    const results = await searchCurrentSession(query);
    console.log(results);
  };
  
  // Component implementation...
}
``` 