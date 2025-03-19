import { ContentChunk } from './content-indexing-service';
import { Message } from './chat-service';
import { vectorEmbeddingService } from './vector-embedding-service';
import { topicExtractionService } from './topic-extraction-service';

export interface ContentRecommendation {
  id: string;
  title: string;
  content: string;
  source: string;
  relevance: number;
  path?: string;
  section?: string;
}

export interface ResponseRecommendation {
  id: string;
  content: string;
  relevance: number;
  source: string; // e.g., 'historical', 'template', 'generated'
}

/**
 * Service for recommending content based on conversation context
 */
export class ContentRecommendationService {
  // Cache for recommendations to avoid repeated searches
  private recommendationCache: Map<string, ContentRecommendation[]> = new Map();
  
  // Template responses for common scenarios
  private responseTemplates: Record<string, string[]> = {
    greeting: [
      "Hello! How can I help you today?",
      "Hi there! What can I assist you with?",
      "Welcome! What would you like to know?"
    ],
    farewell: [
      "Thanks for chatting! Let me know if you need anything else.",
      "Feel free to come back if you have more questions!",
      "Is there anything else I can help you with before you go?"
    ],
    clarification: [
      "I'm not sure I understand. Could you provide more details?",
      "Could you clarify what you mean by that?",
      "I'd like to help better. Can you elaborate on your question?"
    ],
    error: [
      "I apologize, but I encountered an error. Let's try a different approach.",
      "Something went wrong. Could we try rephrasing the question?",
      "I'm having trouble processing that. Could you try asking in a different way?"
    ]
  };
  
  /**
   * Get content recommendations based on recent messages
   */
  async getContentRecommendations(
    messages: Message[],
    options: { limit?: number; threshold?: number; cacheKey?: string } = {}
  ): Promise<ContentRecommendation[]> {
    const { limit = 3, threshold = 0.6, cacheKey } = options;
    
    // Check cache first if a cache key is provided
    if (cacheKey && this.recommendationCache.has(cacheKey)) {
      return this.recommendationCache.get(cacheKey) || [];
    }
    
    // Need at least one non-system message
    const userMessages = messages.filter(msg => msg.role !== 'system');
    
    if (userMessages.length === 0) {
      return [];
    }
    
    try {
      // Extract the most recent conversation context
      // We'll use up to the last 5 messages for context
      const recentMessages = userMessages.slice(-5);
      const conversationContext = recentMessages.map(msg => msg.content).join(' ');
      
      // Use vector embedding service to find related content
      const searchResults = await vectorEmbeddingService.semanticSearch(conversationContext, limit * 2);
      
      // Convert search results to recommendations
      const recommendations: ContentRecommendation[] = searchResults
        .filter(result => result.score >= threshold)
        .map(result => ({
          id: result.chunk.id,
          title: result.chunk.title,
          content: result.chunk.content,
          source: result.chunk.source,
          relevance: result.score,
          path: result.chunk.path,
          section: result.chunk.section
        }))
        .slice(0, limit);
      
      // Cache the recommendations if a cache key is provided
      if (cacheKey) {
        this.recommendationCache.set(cacheKey, recommendations);
      }
      
      return recommendations;
    } catch (error) {
      console.error('Error getting content recommendations:', error);
      return [];
    }
  }
  
  /**
   * Get response recommendations based on conversation context
   */
  async getResponseRecommendations(
    messages: Message[],
    options: { limit?: number; includeTemplates?: boolean } = {}
  ): Promise<ResponseRecommendation[]> {
    const { limit = 3, includeTemplates = true } = options;
    
    if (messages.length === 0) {
      return [];
    }
    
    try {
      const recommendations: ResponseRecommendation[] = [];
      
      // Get the most recent user message
      const userMessages = messages.filter(msg => msg.role === 'user');
      const lastUserMessage = userMessages[userMessages.length - 1];
      
      if (!lastUserMessage) {
        return [];
      }
      
      // Check for template matches first
      if (includeTemplates) {
        const templateMatches = this.matchResponseTemplates(lastUserMessage.content);
        recommendations.push(...templateMatches);
      }
      
      // Extract topics from the conversation
      const topics = await topicExtractionService.extractTopics(messages);
      
      // Generate recommendations based on topics
      if (topics.length > 0) {
        // Use the top topic to find related content
        const topTopic = topics[0];
        
        // Use semantic search to find content related to the topic
        const searchResults = await vectorEmbeddingService.semanticSearch(topTopic.topic, 5);
        
        // Convert to response recommendations
        const topicRecommendations = searchResults.map(result => ({
          id: `generated-${result.chunk.id}`,
          content: this.generateResponseFromContent(result.chunk, lastUserMessage.content),
          relevance: result.score * 0.8, // Slightly lower relevance for generated responses
          source: 'generated'
        }));
        
        recommendations.push(...topicRecommendations);
      }
      
      // Look for historical assistant responses
      const assistantMessages = messages.filter(msg => msg.role === 'assistant');
      
      if (assistantMessages.length > 0) {
        // Find semantically similar previous exchanges
        const recentContext = messages.slice(-3).map(msg => msg.content).join(' ');
        
        // Create historical recommendations from previous assistant responses
        for (let i = 0; i < Math.min(assistantMessages.length, 5); i++) {
          const msg = assistantMessages[assistantMessages.length - 1 - i]; // Start from most recent
          
          recommendations.push({
            id: `historical-${msg.id}`,
            content: msg.content,
            relevance: 0.7 - (i * 0.1), // Decreasing relevance for older messages
            source: 'historical'
          });
        }
      }
      
      // Sort by relevance and limit
      return recommendations
        .sort((a, b) => b.relevance - a.relevance)
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting response recommendations:', error);
      return [];
    }
  }
  
  /**
   * Match user message against template categories
   */
  private matchResponseTemplates(userMessage: string): ResponseRecommendation[] {
    const lowerMessage = userMessage.toLowerCase();
    const recommendations: ResponseRecommendation[] = [];
    
    // Simple rule-based matching
    if (lowerMessage.match(/^(hi|hello|hey|greetings)/)) {
      // Greeting templates
      this.responseTemplates.greeting.forEach((template, i) => {
        recommendations.push({
          id: `template-greeting-${i}`,
          content: template,
          relevance: 0.9 - (i * 0.1), // First template has highest relevance
          source: 'template'
        });
      });
    } else if (lowerMessage.match(/^(bye|goodbye|thank you|thanks)/)) {
      // Farewell templates
      this.responseTemplates.farewell.forEach((template, i) => {
        recommendations.push({
          id: `template-farewell-${i}`,
          content: template,
          relevance: 0.9 - (i * 0.1),
          source: 'template'
        });
      });
    } else if (lowerMessage.length < 15 || lowerMessage.match(/\?$/)) {
      // Short message or question - might need clarification
      this.responseTemplates.clarification.forEach((template, i) => {
        recommendations.push({
          id: `template-clarification-${i}`,
          content: template,
          relevance: 0.7 - (i * 0.1), // Lower relevance for clarification
          source: 'template'
        });
      });
    }
    
    return recommendations;
  }
  
  /**
   * Generate a response based on content
   */
  private generateResponseFromContent(contentChunk: ContentChunk, userQuery: string): string {
    // Simple template-based response generation
    // In a production system, this would use a more sophisticated approach with an LLM
    
    return `Based on our resources about "${contentChunk.title}", ${contentChunk.content.slice(0, 150)}... 
Would you like me to provide more information about this topic?`;
  }
  
  /**
   * Clear the recommendation cache
   */
  clearCache(): void {
    this.recommendationCache.clear();
  }
}

// Export singleton instance
export const contentRecommendationService = new ContentRecommendationService(); 