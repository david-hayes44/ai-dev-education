/**
 * Vector Embedding Service
 * 
 * This service handles generating and storing vector embeddings for content chunks,
 * enabling semantic search across the platform content.
 */

import { ContentChunk, semanticSearch, contentIndexingService } from './content-indexing-service';

// Sample content chunks for testing when no actual content is available
const SAMPLE_CONTENT_CHUNKS: ContentChunk[] = [
  {
    id: 'sample-1',
    title: 'Introduction to AI',
    content: 'Artificial Intelligence is transforming how we work and live.',
    path: '/introduction',
    source: 'Introduction Page',
    section: 'Getting Started',
    keywords: ['AI', 'introduction'],
    priority: 1
  },
  {
    id: 'sample-2',
    title: 'Model Context Protocol',
    content: 'MCP is a standard for structuring context for AI models.',
    path: '/mcp',
    source: 'MCP Page',
    section: 'Core Concepts',
    keywords: ['MCP', 'context'],
    priority: 1
  }
];

// Interface for a vector-embedded content chunk
export interface EmbeddedContentChunk extends ContentChunk {
  embedding: number[];
}

export interface SearchResult {
  chunk: ContentChunk;
  score: number;
}

/**
 * Vector Embedding Service
 * Responsible for generating, storing, and searching vector embeddings of content
 */
export class VectorEmbeddingService {
  private static instance: VectorEmbeddingService;
  private embeddedChunks: EmbeddedContentChunk[] = [];
  private _isInitialized: boolean = false;
  
  // OpenAI API configuration
  private apiKey: string | undefined;
  private openAIEndpoint = 'https://api.openai.com/v1/embeddings';
  private modelName = 'text-embedding-3-small';
  
  private constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;
  }
  
  /**
   * Get singleton instance
   */
  public static getInstance(): VectorEmbeddingService {
    if (!VectorEmbeddingService.instance) {
      VectorEmbeddingService.instance = new VectorEmbeddingService();
    }
    return VectorEmbeddingService.instance;
  }
  
  /**
   * Check if embeddings have been generated
   */
  public get isInitialized(): boolean {
    return this._isInitialized;
  }
  
  /**
   * Initialize the service by generating embeddings for all content chunks
   */
  public async initialize(): Promise<void> {
    if (this._isInitialized) return;
    
    try {
      // Ensure content is indexed
      const indexingStats = await contentIndexingService.getIndexingStats();
      if (!indexingStats.lastIndexed) {
        await contentIndexingService.indexAllContent();
      }
      
      // Get content chunks using semanticSearch with an empty query
      // This will return all indexed content or sample content if nothing is indexed
      const contentChunks = await semanticSearch('', { limit: 100, threshold: 0 })
        .catch(() => SAMPLE_CONTENT_CHUNKS);
      
      // Check if OpenAI API key is available
      if (!this.apiKey) {
        console.warn('API key not available. Using fallback similarity search.');
        // Create dummy embeddings (for demo/development purposes)
        this.embeddedChunks = contentChunks.map((chunk: ContentChunk) => ({
          ...chunk,
          embedding: this.createDummyEmbedding(chunk.content),
        }));
      } else {
        // Generate real embeddings with API
        console.log(`Generating embeddings for ${contentChunks.length} content chunks...`);
        this.embeddedChunks = await this.generateEmbeddings(contentChunks);
      }
      
      this._isInitialized = true;
      console.log(`Vector embedding service initialized with ${this.embeddedChunks.length} chunks`);
    } catch (error) {
      console.error('Failed to initialize vector embedding service:', error);
      
      // Use sample data as fallback
      this.embeddedChunks = SAMPLE_CONTENT_CHUNKS.map(chunk => ({
        ...chunk,
        embedding: this.createDummyEmbedding(chunk.content),
      }));
      
      this._isInitialized = true;
    }
  }
  
  /**
   * Generate embeddings for a list of content chunks
   */
  private async generateEmbeddings(chunks: ContentChunk[]): Promise<EmbeddedContentChunk[]> {
    const embeddedChunks: EmbeddedContentChunk[] = [];
    
    // Process in batches to avoid rate limits
    const batchSize = 20;
    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(async (chunk) => {
          try {
            const embedding = await this.getEmbedding(chunk.content);
            return {
              ...chunk,
              embedding,
            };
          } catch (error) {
            console.error(`Error generating embedding for chunk ${chunk.id}:`, error);
            return {
              ...chunk,
              embedding: this.createDummyEmbedding(chunk.content),
            };
          }
        })
      );
      
      embeddedChunks.push(...batchResults);
    }
    
    return embeddedChunks;
  }
  
  /**
   * Get embedding for a single text using OpenAI API
   */
  private async getEmbedding(text: string): Promise<number[]> {
    if (!this.apiKey) {
      return this.createDummyEmbedding(text);
    }
    
    try {
      const response = await fetch(this.openAIEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.modelName,
          input: text.slice(0, 8000), // Limit to 8K characters to stay within token limits
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(`OpenAI API Error: ${error.error?.message || response.statusText}`);
      }
      
      const data = await response.json();
      return data.data[0].embedding;
    } catch (error) {
      console.error('Error getting embedding from OpenAI:', error);
      return this.createDummyEmbedding(text);
    }
  }
  
  /**
   * Create a dummy embedding for development purposes
   * This is used when OpenAI API is not available
   */
  private createDummyEmbedding(text: string): number[] {
    // Create a simple hash-based pseudo-embedding
    // This is NOT for production use, just for development when API isn't available
    const vectorSize = 64;
    const embedding = new Array(vectorSize).fill(0);
    
    // Simple hashing algorithm to create pseudo-embeddings
    const words = text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/);
    words.forEach((word, i) => {
      const hash = this.simpleHash(word) % vectorSize;
      embedding[hash] += 1;
    });
    
    // Normalize
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return embedding.map(val => val / (magnitude || 1));
  }
  
  /**
   * Simple hash function for dummy embeddings
   */
  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }
  
  /**
   * Calculate cosine similarity between two vectors
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Vectors must have the same dimensions');
    }
    
    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      magnitudeA += a[i] * a[i];
      magnitudeB += b[i] * b[i];
    }
    
    magnitudeA = Math.sqrt(magnitudeA);
    magnitudeB = Math.sqrt(magnitudeB);
    
    if (magnitudeA === 0 || magnitudeB === 0) {
      return 0;
    }
    
    return dotProduct / (magnitudeA * magnitudeB);
  }
  
  /**
   * Perform semantic search on the embedded content
   */
  public async semanticSearch(query: string, limit: number = 5): Promise<SearchResult[]> {
    if (!this._isInitialized) {
      await this.initialize();
    }
    
    try {
      // Get query embedding
      const queryEmbedding = await this.getEmbedding(query);
      
      // Calculate similarity scores
      const results: SearchResult[] = this.embeddedChunks.map(chunk => ({
        chunk: chunk,
        score: this.cosineSimilarity(queryEmbedding, chunk.embedding)
      }));
      
      // Sort by similarity score
      results.sort((a, b) => b.score - a.score);
      
      // Return top results
      return results.slice(0, limit);
    } catch (error) {
      console.error('Error in semantic search:', error);
      throw new Error('Failed to perform semantic search');
    }
  }
  
  /**
   * Get related content based on a reference chunk
   */
  public getRelatedContent(chunkId: string, limit: number = 3): SearchResult[] {
    // Find the reference chunk
    const referenceChunk = this.embeddedChunks.find(chunk => chunk.id === chunkId);
    
    if (!referenceChunk) {
      return [];
    }
    
    // Calculate similarity scores
    const results: SearchResult[] = this.embeddedChunks
      .filter(chunk => chunk.id !== chunkId) // Exclude the reference chunk
      .map(chunk => ({
        chunk: chunk,
        score: this.cosineSimilarity(referenceChunk.embedding, chunk.embedding)
      }));
    
    // Sort by similarity score
    results.sort((a, b) => b.score - a.score);
    
    // Return top results
    return results.slice(0, limit);
  }
}

// Create and export singleton instance
export const vectorEmbeddingService = VectorEmbeddingService.getInstance(); 