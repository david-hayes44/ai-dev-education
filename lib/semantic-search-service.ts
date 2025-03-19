import { Message } from './chat-service';
import { vectorEmbeddingService } from './vector-embedding-service';

export interface MessageSearchResult {
  message: Message;
  score: number;
  sessionId?: string;
}

/**
 * Service for performing semantic searches on chat messages
 */
export class SemanticSearchService {
  /**
   * Search for messages by semantic similarity
   */
  async searchMessages(
    query: string, 
    messages: Message[], 
    options: { limit?: number; threshold?: number; sessionId?: string } = {}
  ): Promise<MessageSearchResult[]> {
    const { 
      limit = 5, 
      threshold = 0.5,
      sessionId 
    } = options;
    
    if (!query || query.trim().length === 0 || messages.length === 0) {
      return [];
    }
    
    try {
      // Filter out system messages
      const userMessages = messages.filter(msg => msg.role !== 'system');
      
      if (userMessages.length === 0) {
        return [];
      }
      
      // Use the vector embedding service to perform the semantic search
      // Since we're using the content as the query, we'll get matches by similarity
      const results: MessageSearchResult[] = [];
      
      // Process in chunks to avoid overwhelming the API
      const chunkSize = 10;
      for (let i = 0; i < userMessages.length; i += chunkSize) {
        const chunk = userMessages.slice(i, i + chunkSize);
        
        // Create a combined search to find the most relevant content
        // We'll search for each message's content and then match back to the original
        const searchPromises = chunk.map(async (msg) => {
          try {
            const searchResult = await vectorEmbeddingService.semanticSearch(msg.content);
            if (searchResult.length > 0) {
              // Compare the query to this message using the search results as a proxy for similarity
              const querySearchResult = await vectorEmbeddingService.semanticSearch(query);
              
              if (querySearchResult.length > 0) {
                // Calculate a similarity score between the message and the query
                const msgScores = searchResult.map(r => r.score);
                const queryScores = querySearchResult.map(r => r.score);
                
                // Average the scores as a proxy for similarity
                const avgMsgScore = msgScores.reduce((a, b) => a + b, 0) / msgScores.length;
                const avgQueryScore = queryScores.reduce((a, b) => a + b, 0) / queryScores.length;
                
                // Simplified similarity metric
                const similarity = (avgMsgScore + avgQueryScore) / 2;
                
                results.push({
                  message: msg,
                  score: similarity,
                  sessionId
                });
              }
            }
          } catch (error) {
            console.error('Error searching message:', error);
            // Continue with other messages
          }
        });
        
        await Promise.all(searchPromises);
      }
      
      // Sort by relevance and apply threshold
      const filteredResults = results
        .filter(result => result.score >= threshold)
        .sort((a, b) => b.score - a.score);
      
      // Return top results limited by the limit parameter
      return filteredResults.slice(0, limit);
    } catch (error) {
      console.error('Error performing semantic search on messages:', error);
      return [];
    }
  }
  
  /**
   * Search across multiple chat sessions
   */
  async searchAcrossSessions(
    query: string,
    sessionsWithMessages: { sessionId: string; messages: Message[] }[],
    options: { limit?: number; threshold?: number } = {}
  ): Promise<MessageSearchResult[]> {
    const { limit = 10, threshold = 0.5 } = options;
    
    if (!query || query.trim().length === 0 || sessionsWithMessages.length === 0) {
      return [];
    }
    
    try {
      const allResults: MessageSearchResult[] = [];
      
      // Search each session
      const searchPromises = sessionsWithMessages.map(async ({ sessionId, messages }) => {
        const sessionResults = await this.searchMessages(query, messages, {
          threshold,
          sessionId
        });
        
        allResults.push(...sessionResults);
      });
      
      await Promise.all(searchPromises);
      
      // Sort all results by relevance
      allResults.sort((a, b) => b.score - a.score);
      
      // Return top results
      return allResults.slice(0, limit);
    } catch (error) {
      console.error('Error searching across sessions:', error);
      return [];
    }
  }
  
  /**
   * Find similar messages within a conversation
   */
  async findSimilarMessages(
    referenceMessageId: string,
    messages: Message[],
    options: { limit?: number; threshold?: number } = {}
  ): Promise<MessageSearchResult[]> {
    const { limit = 3, threshold = 0.6 } = options;
    
    // Find the reference message
    const referenceMessage = messages.find(msg => msg.id === referenceMessageId);
    
    if (!referenceMessage) {
      return [];
    }
    
    // Use the reference message's content as the search query
    return this.searchMessages(
      referenceMessage.content,
      messages.filter(msg => msg.id !== referenceMessageId), // Exclude the reference message
      { limit, threshold }
    );
  }
}

// Export singleton instance
export const semanticSearchService = new SemanticSearchService(); 