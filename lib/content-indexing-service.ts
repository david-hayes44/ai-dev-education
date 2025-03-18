'use server';

/**
 * Content Indexing Service
 * 
 * This service is responsible for generating and managing vector embeddings
 * for content to enable semantic search functionality.
 */

import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import { ContentSection } from './utils';
import { ContentChunk } from './server-utils';

// Re-export ContentChunk interface for backward compatibility
export type { ContentChunk };

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

// Mock content for when real content is not indexed yet
const MOCK_CONTENT = [
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
  },
  // Cursor mock content
  {
    title: 'Using Cursor for AI-Assisted Development',
    path: '/cursor',
    section: 'AI Tools',
    content: 'Cursor is an AI-first code editor designed to enhance developer productivity through built-in AI assistance. It provides features like code completion, refactoring help, and natural language explanations of code.',
    sections: [
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
    ]
  }
];

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
 * Extract metadata from route
 */
function extractMetadataFromRoute(route: string, section: string, title: string): {
  section: string;
  title: string;
  priority: number;
} {
  // Determine priority (main pages have higher priority)
  const depth = route.split('/').filter(Boolean).length;
  const priority = Math.max(1, 5 - depth) / 5; // 1.0 for main pages, lower for deeper pages
  
  return {
    section,
    title,
    priority
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
 * Index all content pages and generate embeddings using mock data
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
    console.log(`Indexing mock content in development mode`);
    
    let chunksCreated = 0;
    let vectorsStored = 0;
    
    // Process mock content
    for (const page of MOCK_CONTENT) {
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
          priority: 0.9, // Slightly lower priority than the page
          sectionId: section.id,
          embedding: useAPI 
            ? await generateOpenRouterEmbedding(section.content)
            : generateSimpleEmbedding(section.content)
        };
        
        contentChunks.push(sectionChunk);
        chunksCreated++;
        vectorsStored++;
      }
      
      console.log(`Indexed ${page.path} - created ${1 + page.sections.length} chunks`);
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