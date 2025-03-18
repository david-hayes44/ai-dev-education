/**
 * Content Indexing Service
 * 
 * This service is responsible for generating and managing vector embeddings
 * for content to enable semantic search functionality.
 */

import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

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
 * This is a mock implementation for demonstration
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
  
  // For this implementation, we'll use mock data
  // In a real implementation, we'd scan content files
  const mockPages = [
    { 
      title: 'Introduction to AI-Assisted Development',
      path: '/introduction',
      section: 'Getting Started',
      content: 'AI-assisted development is revolutionizing how developers write code...',
      sections: [
        { id: 'benefits', title: 'Benefits', content: 'Improved productivity and code quality...' },
        { id: 'getting-started', title: 'Getting Started', content: 'To get started with AI-assisted development...' }
      ]
    },
    {
      title: 'Understanding MCP',
      path: '/mcp',
      section: 'Core Concepts',
      content: 'The Model Context Protocol defines how to structure context for AI models...',
      sections: [
        { id: 'core-concepts', title: 'Core Concepts', content: 'MCP is built around several key concepts...' },
        { id: 'implementation', title: 'Implementation', content: 'Implementing MCP in your workflow...' }
      ]
    }
  ];
  
  let chunksCreated = 0;
  let vectorsStored = 0;
  
  // Process each page
  for (const page of mockPages) {
    // Add the main page
    const pageChunk: ContentChunk = {
      id: `page:${page.path}`,
      title: page.title,
      content: page.content,
      path: page.path,
      source: page.title,
      section: page.section,
      keywords: [page.title, page.section],
      priority: 1,
      embedding: useAPI 
        ? await generateOpenRouterEmbedding(page.content)
        : generateSimpleEmbedding(page.content)
    };
    
    contentChunks.push(pageChunk);
    chunksCreated++;
    vectorsStored++;
    
    // Add each section
    for (const section of page.sections) {
      const sectionChunk: ContentChunk = {
        id: `section:${page.path}:${section.id}`,
        title: `${page.title} - ${section.title}`,
        content: section.content,
        path: page.path,
        source: page.title,
        section: page.section,
        keywords: [page.title, section.title],
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
  }
  
  // Update stats
  indexingStats = {
    totalPages: mockPages.length,
    totalChunks: chunksCreated,
    totalVectors: vectorsStored,
    lastIndexed: new Date().toISOString()
  };
  
  // Save the stats
  saveIndexingStats();
  
  return {
    pagesIndexed: mockPages.length,
    chunksCreated,
    vectorsStored
  };
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
  } = {}
): Promise<ContentChunk[]> {
  const { limit = 5, threshold = 0.5, useAPI = true } = options;
  
  if (contentChunks.length === 0) {
    return [];
  }
  
  // Generate embedding for the query
  const queryEmbedding = useAPI 
    ? await generateOpenRouterEmbedding(query) 
    : generateSimpleEmbedding(query);
  
  // Calculate similarity for each chunk
  const results = contentChunks.map(chunk => {
    const similarity = calculateCosineSimilarity(queryEmbedding, chunk.embedding || []);
    return { chunk, similarity };
  });
  
  // Sort by similarity and return top results
  return results
    .filter(result => result.similarity >= threshold)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit)
    .map(result => ({
      ...result.chunk,
      relevance: result.similarity
    }));
} 