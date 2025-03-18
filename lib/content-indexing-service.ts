/**
 * Content Indexing Service
 * 
 * This service is responsible for generating and managing vector embeddings
 * for content to enable semantic search functionality.
 */

import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import { 
  scanContentPages, 
  extractContentFromPage,
  extractContentMetadata
} from './utils';

// Interface for content chunks that will be indexed and searched
export interface ContentChunk {
  id: string;          // Unique identifier
  title: string;       // Title of the content
  content: string;     // The actual text content 
  path: string;        // URL path to the content
  source: string;      // Source of the content (e.g., page title)
  section: string;     // Section the content belongs to
  keywords: string[];  // Keywords for the content
  priority: number;    // Priority/importance of the content
  embedding?: number[];// Vector embedding for semantic search
  relevance?: number;  // Search relevance score (0-1)
  sectionId?: string;  // Optional section identifier for deep linking
}

// Interface for indexing statistics
export interface IndexingStats {
  totalPages: number;
  totalChunks: number;
  totalVectors: number;
  lastIndexed: string | null;
}

// In-memory storage for content chunks and stats
let contentChunks: ContentChunk[] = [];
let indexingStats: IndexingStats = {
  totalPages: 0,
  totalChunks: 0,
  totalVectors: 0,
  lastIndexed: null
};

/**
 * Generate embeddings using Open Router API
 * Open Router can proxy requests to various models including those with embedding capabilities
 */
async function generateOpenRouterEmbedding(content: string): Promise<number[]> {
  const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY;
  
  if (!apiKey) {
    console.warn('Open Router API key not found. Using fallback similarity algorithm.');
    return generateSimpleEmbedding(content);
  }
  
  try {
    // OpenRouter uses OpenAI-compatible endpoint for embeddings
    const response = await fetch('https://openrouter.ai/api/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
        'X-Title': 'AI Education Platform'
      },
      body: JSON.stringify({
        model: 'openai/text-embedding-ada-002',  // Using OpenAI compatible model through OpenRouter
        input: content
      })
    });
    
    if (!response.ok) {
      throw new Error(`Open Router API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json() as { 
      data: Array<{ embedding: number[] }> 
    };
    
    return data.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding with Open Router:', error);
    console.log('Falling back to simple embedding algorithm');
    return generateSimpleEmbedding(content);
  }
}

/**
 * Generate a simple vector embedding for content
 * This is a fallback algorithm when API is not available
 */
function generateSimpleEmbedding(content: string): number[] {
  // Count word frequencies
  const words = content.toLowerCase().split(/\W+/).filter(Boolean);
  const wordFreq: Record<string, number> = {};
  
  words.forEach(word => {
    wordFreq[word] = (wordFreq[word] || 0) + 1;
  });
  
  // Create a simple 100-dimension vector
  const dimensions = 100;
  const embedding = new Array(dimensions).fill(0);
  
  Object.entries(wordFreq).forEach(([word, freq]) => {
    const hashCode = word.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    
    const index = Math.abs(hashCode) % dimensions;
    embedding[index] += freq;
  });
  
  // Normalize the vector
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  return embedding.map(val => val / (magnitude || 1));
}

/**
 * Calculate cosine similarity between two vectors
 */
function calculateCosineSimilarity(a: number[], b: number[]): number {
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
 * Index all content pages and generate embeddings
 */
export async function indexAllContent({ 
  useAPI = true 
}: { 
  useAPI?: boolean 
} = {}): Promise<{
  pagesIndexed: number;
  chunksCreated: number;
  vectorsStored: number;
}> {
  // Reset content chunks
  contentChunks = [];
  
  try {
    // Scan for actual content pages instead of using mock data
    const contentFiles = await scanContentPages();
    console.log(`Found ${contentFiles.length} content pages to index`);
    
    let chunksCreated = 0;
    let vectorsStored = 0;
    
    // Process each file
    for (const filePath of contentFiles) {
      // Extract chunks from this page
      const pageChunks = await extractContentFromPage(filePath);
      
      // Generate embeddings for each chunk
      for (const chunk of pageChunks) {
        chunk.embedding = useAPI 
          ? await generateOpenRouterEmbedding(chunk.content)
          : generateSimpleEmbedding(chunk.content);
          
        // Add to the chunks array
        contentChunks.push(chunk);
        chunksCreated++;
        vectorsStored++;
      }
      
      console.log(`Indexed ${filePath} - created ${pageChunks.length} chunks`);
    }
    
    // Add mock cursor content until we have a real page for it
    if (!contentChunks.some(chunk => chunk.path === '/cursor')) {
      const cursorPage = {
        id: `page:/cursor`,
        title: 'Using Cursor for AI-Assisted Development',
        content: 'Cursor is an AI-first code editor designed to enhance developer productivity through built-in AI assistance. It provides features like code completion, refactoring help, and natural language explanations of code.',
        path: '/cursor',
        source: 'Using Cursor for AI-Assisted Development',
        section: 'AI Tools',
        keywords: ['cursor', 'code editor', 'ai', 'development', 'ide', 'tool'],
        priority: 1
      };
      
      const cursorContent = `
        Cursor is an intelligent code editor with built-in AI capabilities that helps developers write, understand, and transform code efficiently.
        
        Key features of Cursor include:
        
        1. AI-Powered Code Completion - Write code faster with context-aware suggestions
        2. Natural Language Commands - Ask questions about your code in plain English
        3. Code Explanation - Get detailed explanations of complex code segments
        4. Refactoring Assistance - Intelligent help with code restructuring
        5. Error Resolution - Get help fixing bugs and resolving errors
        
        Keyboard shortcuts in Cursor:
        - Ctrl+Enter (Cmd+Enter on Mac): Send a message to the AI assistant
        - Ctrl+K: Open command palette
        - Ctrl+/ (Cmd+/ on Mac): Toggle comment
        
        Getting Started with Cursor:
        1. Download and install Cursor from cursor.so
        2. Open your project or create a new one
        3. Use Ctrl+Enter to interact with the AI assistant
        4. Ask questions about your code or request code generation
      `;
      
      // Create the main page chunk
      const cursorPageChunk: ContentChunk = {
        ...cursorPage,
        embedding: useAPI 
          ? await generateOpenRouterEmbedding(cursorPage.content)
          : generateSimpleEmbedding(cursorPage.content)
      };
      
      contentChunks.push(cursorPageChunk);
      chunksCreated++;
      vectorsStored++;
      
      // Add detailed sections for Cursor
      const cursorSections = [
        {
          id: 'features',
          title: 'Key Features',
          content: `Cursor offers a range of AI-powered features:
            - Intelligent code completion that understands context
            - Natural language interface for code generation
            - Built-in AI chat for answering coding questions
            - Code refactoring suggestions
            - Explanation of complex code blocks
            - Automatic bug fixing assistance`
        },
        {
          id: 'shortcuts',
          title: 'Keyboard Shortcuts',
          content: `Cursor keyboard shortcuts:
            - Ctrl+Enter (Cmd+Enter on Mac): Send a message to the AI assistant
            - Ctrl+K: Open command palette
            - Ctrl+/ (Cmd+/ on Mac): Toggle comment
            - Ctrl+Space: Trigger AI code completion
            - Ctrl+Shift+A: Ask AI about selected code`
        },
        {
          id: 'getting-started',
          title: 'Getting Started',
          content: `To get started with Cursor:
            1. Download Cursor from cursor.so
            2. Install and open the application
            3. Open an existing project or create a new one
            4. Use Ctrl+Enter to activate the AI assistant
            5. Begin asking questions or requesting code generation`
        }
      ];
      
      // Add each section for Cursor
      for (const section of cursorSections) {
        const sectionChunk: ContentChunk = {
          id: `section:/cursor:${section.id}`,
          title: `Using Cursor - ${section.title}`,
          content: section.content,
          path: '/cursor',
          source: 'Using Cursor for AI-Assisted Development',
          section: 'AI Tools',
          keywords: ['cursor', 'code editor', section.title.toLowerCase()],
          priority: 1,
          sectionId: section.id,
          embedding: useAPI 
            ? await generateOpenRouterEmbedding(section.content)
            : generateSimpleEmbedding(section.content)
        };
        
        contentChunks.push(sectionChunk);
        chunksCreated++;
        vectorsStored++;
      }
      
      console.log('Added mock Cursor content with 4 chunks');
    }
    
    // Update stats
    const contentPages = new Set(contentChunks.map(chunk => chunk.path)).size;
    
    indexingStats = {
      totalPages: contentPages,
      totalChunks: chunksCreated,
      totalVectors: vectorsStored,
      lastIndexed: new Date().toISOString()
    };
    
    // Save the stats
    saveIndexingStats();
    
    return {
      pagesIndexed: contentPages,
      chunksCreated,
      vectorsStored
    };
  } catch (error) {
    console.error('Error indexing content:', error);
    throw error;
  }
}

/**
 * Save indexing stats to a file
 */
function saveIndexingStats() {
  try {
    const dataDir = path.join(process.cwd(), '.data');
    
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    fs.writeFileSync(
      path.join(dataDir, 'indexing-stats.json'),
      JSON.stringify(indexingStats)
    );
  } catch (error) {
    console.error('Failed to save indexing stats:', error);
  }
}

/**
 * Get indexing statistics
 */
export async function getIndexingStats(): Promise<IndexingStats> {
  try {
    const statsPath = path.join(process.cwd(), '.data', 'indexing-stats.json');
    
    if (fs.existsSync(statsPath)) {
      const rawData = fs.readFileSync(statsPath, 'utf-8');
      return JSON.parse(rawData);
    }
  } catch (error) {
    console.error('Failed to read indexing stats:', error);
  }
  
  return indexingStats;
}

/**
 * Perform a semantic search on indexed content
 */
export async function semanticSearch(
  query: string,
  options: {
    limit?: number;
    threshold?: number;
    useAPI?: boolean;
    section?: string;
    boostFields?: {
      title?: number;
      keywords?: number;
      priority?: number;
    };
  } = {}
): Promise<ContentChunk[]> {
  const { 
    limit = 5, 
    threshold = 0.5, 
    useAPI = true,
    section,
    boostFields = {
      title: 0.2,
      keywords: 0.1,
      priority: 0.05
    } 
  } = options;
  
  if (contentChunks.length === 0) {
    return [];
  }
  
  // Generate embedding for the query
  const queryEmbedding = useAPI 
    ? await generateOpenRouterEmbedding(query) 
    : generateSimpleEmbedding(query);
  
  // Calculate improved relevance score for each chunk
  const results = contentChunks
    // Filter by section if provided
    .filter(chunk => !section || chunk.section === section)
    .map(chunk => {
      // Base score from vector similarity
      const vectorSimilarity = calculateCosineSimilarity(queryEmbedding, chunk.embedding || []);
      
      // Calculate additional relevance signals
      let finalScore = vectorSimilarity;
      
      // Boost for title matches
      if (boostFields.title && 
          chunk.title.toLowerCase().includes(query.toLowerCase())) {
        finalScore += boostFields.title;
      }
      
      // Boost for keyword matches
      if (boostFields.keywords) {
        const keywordMatch = chunk.keywords.some(keyword => 
          query.toLowerCase().includes(keyword.toLowerCase()) || 
          keyword.toLowerCase().includes(query.toLowerCase())
        );
        
        if (keywordMatch) {
          finalScore += boostFields.keywords;
        }
      }
      
      // Boost based on content priority
      if (boostFields.priority) {
        finalScore += chunk.priority * boostFields.priority;
      }
      
      // Cap at 1.0
      finalScore = Math.min(finalScore, 1.0);
      
      return { chunk, similarity: finalScore };
    });
  
  // Sort by relevance score and return top results
  return results
    .filter(result => result.similarity >= threshold)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit)
    .map(result => ({
      ...result.chunk,
      relevance: result.similarity
    }));
}

/**
 * Perform a keyword search on indexed content
 */
export async function keywordSearch(
  query: string,
  options: {
    limit?: number;
    threshold?: number;
    section?: string;
  } = {}
): Promise<ContentChunk[]> {
  const { limit = 5, threshold = 0.3, section } = options;
  
  if (contentChunks.length === 0) {
    return [];
  }
  
  // Break query into keywords
  const keywords = query.toLowerCase().split(/\W+/).filter(k => k.length > 2);
  
  // Calculate keyword match score for each chunk
  const results = contentChunks
    // Filter by section if provided
    .filter(chunk => !section || chunk.section === section)
    .map(chunk => {
      // Calculate what percentage of keywords are found in the content
      const contentText = chunk.content.toLowerCase();
      const titleText = chunk.title.toLowerCase();
      
      let matchCount = 0;
      for (const keyword of keywords) {
        if (contentText.includes(keyword) || titleText.includes(keyword)) {
          matchCount++;
        }
      }
      
      // Calculate match percentage (0 to 1)
      const matchScore = keywords.length > 0 
        ? matchCount / keywords.length 
        : 0;
        
      // Boost exact title matches significantly
      let finalScore = matchScore;
      if (titleText.includes(query.toLowerCase())) {
        finalScore += 0.3;
      }
      
      // Boost by priority
      finalScore += chunk.priority * 0.05;
      
      // Cap at 1.0
      finalScore = Math.min(finalScore, 1.0);
      
      return { chunk, similarity: finalScore };
    });
  
  // Sort by match score and return top results
  return results
    .filter(result => result.similarity >= threshold)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit)
    .map(result => ({
      ...result.chunk,
      relevance: result.similarity
    }));
}

/**
 * Hybrid search combining semantic and keyword search
 */
export async function hybridSearch(
  query: string,
  options: {
    limit?: number;
    threshold?: number;
    useAPI?: boolean;
    section?: string;
    weightVector?: number;
    weightKeyword?: number;
  } = {}
): Promise<ContentChunk[]> {
  const { 
    limit = 5, 
    threshold = 0.3, 
    useAPI = true,
    section,
    weightVector = 0.7,
    weightKeyword = 0.3
  } = options;
  
  // Get semantic search results
  const semanticResults = await semanticSearch(query, { 
    limit: limit * 2,
    threshold: threshold / 2, // Lower threshold to get more candidates
    useAPI,
    section
  });
  
  // Get keyword search results
  const keywordResults = await keywordSearch(query, {
    limit: limit * 2,
    threshold: threshold / 2, // Lower threshold to get more candidates
    section
  });
  
  // Create a map of all results by ID
  const resultsMap = new Map<string, ContentChunk>();
  
  // Process semantic results
  semanticResults.forEach(chunk => {
    const id = chunk.id;
    const existingChunk = resultsMap.get(id);
    
    if (existingChunk) {
      // If already exists, use weighted average of scores
      existingChunk.relevance = (
        (existingChunk.relevance || 0) + 
        weightVector * (chunk.relevance || 0)
      );
    } else {
      // Otherwise add with weighted score
      resultsMap.set(id, {
        ...chunk,
        relevance: weightVector * (chunk.relevance || 0)
      });
    }
  });
  
  // Process keyword results
  keywordResults.forEach(chunk => {
    const id = chunk.id;
    const existingChunk = resultsMap.get(id);
    
    if (existingChunk) {
      // If already exists, add weighted keyword score
      existingChunk.relevance = (
        (existingChunk.relevance || 0) + 
        weightKeyword * (chunk.relevance || 0)
      );
    } else {
      // Otherwise add with weighted score
      resultsMap.set(id, {
        ...chunk,
        relevance: weightKeyword * (chunk.relevance || 0)
      });
    }
  });
  
  // Convert map to array, filter, sort and limit
  return Array.from(resultsMap.values())
    .filter(chunk => (chunk.relevance || 0) >= threshold)
    .sort((a, b) => (b.relevance || 0) - (a.relevance || 0))
    .slice(0, limit);
}

/**
 * ContentIndexingService class to manage content indexing and searching
 */
export class ContentIndexingService {
  private contentChunks: ContentChunk[] = [];
  private indexingStats: IndexingStats = {
    totalPages: 0,
    totalChunks: 0,
    totalVectors: 0,
    lastIndexed: null
  };

  constructor() {
    // Initialize with default values
    this.loadIndexingStats();
  }

  /**
   * Index all content pages and generate embeddings
   */
  async indexAllContent({ 
    useAPI = true 
  }: { 
    useAPI?: boolean 
  } = {}): Promise<{
    pagesIndexed: number;
    chunksCreated: number;
    vectorsStored: number;
  }> {
    // Use the existing implementation
    return indexAllContent({ useAPI });
  }

  /**
   * Get current indexing statistics
   */
  async getIndexingStats(): Promise<IndexingStats> {
    return getIndexingStats();
  }

  /**
   * Perform semantic search across indexed content
   */
  async semanticSearch(
    query: string,
    options: {
      limit?: number;
      threshold?: number;
      useAPI?: boolean;
      section?: string;
      boostFields?: {
        title?: number;
        keywords?: number;
        priority?: number;
      };
    } = {}
  ): Promise<ContentChunk[]> {
    return semanticSearch(query, options);
  }
  
  /**
   * Perform keyword search across indexed content
   */
  async keywordSearch(
    query: string,
    options: {
      limit?: number;
      threshold?: number;
      section?: string;
    } = {}
  ): Promise<ContentChunk[]> {
    return keywordSearch(query, options);
  }
  
  /**
   * Perform hybrid search combining semantic and keyword search
   */
  async hybridSearch(
    query: string,
    options: {
      limit?: number;
      threshold?: number;
      useAPI?: boolean;
      section?: string;
      weightVector?: number;
      weightKeyword?: number;
    } = {}
  ): Promise<ContentChunk[]> {
    return hybridSearch(query, options);
  }

  /**
   * Load indexing stats from storage (if available)
   */
  private loadIndexingStats(): void {
    // This would typically load from a persistent store
  }
}

// Export a singleton instance
export const contentIndexingService = new ContentIndexingService(); 