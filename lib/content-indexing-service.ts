import { promises as fs } from 'fs';
import path from 'path';
import matter from 'gray-matter';

/**
 * Interface for content chunks extracted from pages
 * These will be used for semantic search and content retrieval
 */
export interface ContentChunk {
  id: string;
  title: string;
  content: string;
  source: string;
  path: string;
  section: string;
  keywords: string[];
  priority: number;
}

/**
 * Interface for page metadata
 */
export interface PageMetadata {
  title: string;
  description: string;
  section?: string;
  tags?: string[];
  priority?: number;
}

/**
 * Content Indexing Service
 * Responsible for scanning and indexing content from the site pages
 */
export class ContentIndexingService {
  private static instance: ContentIndexingService;
  private contentChunks: ContentChunk[] = [];
  private _isIndexed: boolean = false;
  
  private constructor() {}
  
  /**
   * Get singleton instance
   */
  public static getInstance(): ContentIndexingService {
    if (!ContentIndexingService.instance) {
      ContentIndexingService.instance = new ContentIndexingService();
    }
    return ContentIndexingService.instance;
  }
  
  /**
   * Check if content has been indexed
   */
  public get isIndexed(): boolean {
    return this._isIndexed;
  }
  
  /**
   * Index all content pages in the app directory
   */
  public async indexContent(): Promise<void> {
    if (this._isIndexed) return;
    
    try {
      // In a production environment, we would want to precompute this
      // and possibly store it in a database or JSON file
      
      // Start with the app directory which contains our pages
      const pagesDir = path.join(process.cwd(), 'app');
      
      // Index MDX/TSX files recursively
      await this.indexDirectory(pagesDir, '');
      
      console.log(`Indexed ${this.contentChunks.length} content chunks from site pages`);
      this._isIndexed = true;
    } catch (error) {
      console.error('Error indexing content:', error);
      throw new Error('Failed to index content');
    }
  }
  
  /**
   * Recursively index files in a directory
   */
  private async indexDirectory(dirPath: string, relativePath: string): Promise<void> {
    // Read directory contents
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      const entryRelativePath = path.join(relativePath, entry.name);
      
      if (entry.isDirectory()) {
        // Skip node_modules, .next, and other non-content directories
        if (['node_modules', '.next', 'api', 'public', 'styles'].includes(entry.name)) {
          continue;
        }
        
        // Recursively index subdirectories
        await this.indexDirectory(fullPath, entryRelativePath);
      } else {
        // Only process page.tsx, page.mdx, or page.md files
        if (entry.name === 'page.tsx' || entry.name === 'page.mdx' || entry.name === 'page.md') {
          await this.indexFile(fullPath, relativePath);
        }
      }
    }
  }
  
  /**
   * Index a single file
   */
  private async indexFile(filePath: string, relativePath: string): Promise<void> {
    try {
      // Read file content
      const fileContent = await fs.readFile(filePath, 'utf-8');
      
      // Extract content based on file type
      if (filePath.endsWith('.mdx') || filePath.endsWith('.md')) {
        await this.processMdxFile(fileContent, relativePath, filePath);
      } else if (filePath.endsWith('.tsx')) {
        await this.processTsxFile(fileContent, relativePath, filePath);
      }
    } catch (error) {
      console.error(`Error processing file ${filePath}:`, error);
    }
  }
  
  /**
   * Process MDX/MD file content
   */
  private async processMdxFile(content: string, relativePath: string, filePath: string): Promise<void> {
    try {
      // Parse frontmatter
      const { data, content: mdxContent } = matter(content);
      
      // Extract metadata
      const metadata: PageMetadata = {
        title: data.title || this.generateTitleFromPath(relativePath),
        description: data.description || '',
        section: data.section || this.getSectionFromPath(relativePath),
        tags: data.tags || [],
        priority: data.priority || 1,
      };
      
      // Create content chunks from the MDX content
      // This is a simple approach - in a real implementation, we would
      // parse the MDX properly and extract chunks based on headings
      this.chunksFromMdxContent(mdxContent, metadata, relativePath, filePath);
    } catch (error) {
      console.error(`Error processing MDX/MD file ${filePath}:`, error);
    }
  }
  
  /**
   * Process TSX file content
   */
  private async processTsxFile(content: string, relativePath: string, filePath: string): Promise<void> {
    try {
      // Extract metadata from exported metadata object if it exists
      const metadataMatch = content.match(/export const metadata[^{]*{([^}]*)}/);
      let title = this.generateTitleFromPath(relativePath);
      let description = '';
      
      if (metadataMatch && metadataMatch[1]) {
        const metadataContent = metadataMatch[1];
        
        // Extract title
        const titleMatch = metadataContent.match(/title:\s*["'](.*?)["']/);
        if (titleMatch && titleMatch[1]) {
          title = titleMatch[1];
        }
        
        // Extract description
        const descriptionMatch = metadataContent.match(/description:\s*["'](.*?)["']/);
        if (descriptionMatch && descriptionMatch[1]) {
          description = descriptionMatch[1];
        }
      }
      
      // Create metadata object
      const metadata: PageMetadata = {
        title,
        description,
        section: this.getSectionFromPath(relativePath),
        tags: [], // We'd need to extract tags from TSX files if they exist
        priority: 1,
      };
      
      // Extract content from JSX
      this.chunksFromTsxContent(content, metadata, relativePath, filePath);
    } catch (error) {
      console.error(`Error processing TSX file ${filePath}:`, error);
    }
  }
  
  /**
   * Extract content chunks from MDX content
   */
  private chunksFromMdxContent(
    content: string, 
    metadata: PageMetadata, 
    relativePath: string,
    filePath: string
  ): void {
    // Split content by headings
    const headingRegex = /^(#{1,6})\s+(.+)$/gm;
    const sections = content.split(headingRegex);
    
    if (sections.length <= 1) {
      // No headings found, treat the entire content as one chunk
      this.addContentChunk({
        id: `${relativePath}-main`,
        title: metadata.title,
        content: content.trim(),
        source: metadata.title,
        path: this.pathToUrl(relativePath),
        section: metadata.section || '',
        keywords: metadata.tags || [],
        priority: metadata.priority || 1,
      });
      return;
    }
    
    // Process each section
    for (let i = 1; i < sections.length; i += 3) {
      if (i + 2 >= sections.length) continue;
      
      const headingLevel = sections[i].length; // Number of # characters
      const headingText = sections[i + 1].trim();
      const sectionContent = sections[i + 2].trim();
      
      // Only add non-empty sections
      if (sectionContent) {
        this.addContentChunk({
          id: `${relativePath}-${headingText.toLowerCase().replace(/\W+/g, '-')}`,
          title: headingText,
          content: sectionContent,
          source: metadata.title,
          path: this.pathToUrl(relativePath),
          section: metadata.section || '',
          keywords: metadata.tags || [],
          priority: metadata.priority || 1,
        });
      }
    }
  }
  
  /**
   * Extract content chunks from TSX content
   */
  private chunksFromTsxContent(
    content: string, 
    metadata: PageMetadata, 
    relativePath: string,
    filePath: string
  ): void {
    // This is a simplified approach - in a real implementation,
    // we would parse the TSX properly and extract text content
    
    // Extract text from paragraph tags
    const paragraphRegex = /<p[^>]*>([\s\S]*?)<\/p>/g;
    const paragraphs: string[] = [];
    let match;
    
    while ((match = paragraphRegex.exec(content)) !== null) {
      if (match[1]) {
        // Clean up HTML tags
        const cleanText = match[1].replace(/<[^>]+>/g, '');
        paragraphs.push(cleanText);
      }
    }
    
    // Extract text from headings
    const headingRegex = /<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/g;
    const headings: string[] = [];
    
    while ((match = headingRegex.exec(content)) !== null) {
      if (match[1]) {
        // Clean up HTML tags
        const cleanText = match[1].replace(/<[^>]+>/g, '');
        headings.push(cleanText);
      }
    }
    
    // Combine extracted content
    const extractedContent = [...headings, ...paragraphs].join(' ');
    
    if (extractedContent) {
      this.addContentChunk({
        id: `${relativePath}-main`,
        title: metadata.title,
        content: extractedContent,
        source: metadata.title,
        path: this.pathToUrl(relativePath),
        section: metadata.section || '',
        keywords: metadata.tags || [],
        priority: metadata.priority || 1,
      });
    }
  }
  
  /**
   * Add a content chunk to the index
   */
  private addContentChunk(chunk: ContentChunk): void {
    this.contentChunks.push(chunk);
  }
  
  /**
   * Generate a title from a path
   */
  private generateTitleFromPath(relativePath: string): string {
    // Get the last part of the path and convert to title case
    const pathParts = relativePath.split(path.sep);
    const lastPart = pathParts[pathParts.length - 1] || pathParts[pathParts.length - 2] || '';
    
    return lastPart
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  
  /**
   * Get section from path
   */
  private getSectionFromPath(relativePath: string): string {
    const pathParts = relativePath.split(path.sep);
    // Use the first non-empty directory as the section
    for (const part of pathParts) {
      if (part && part !== '.' && part !== '..') {
        return part
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      }
    }
    return 'General';
  }
  
  /**
   * Convert a file path to a URL
   */
  private pathToUrl(relativePath: string): string {
    const urlPath = relativePath.replace(/\\/g, '/');
    return `/${urlPath}`;
  }
  
  /**
   * Search for content chunks matching a query
   */
  public search(query: string, limit: number = 5): ContentChunk[] {
    // In a real implementation, we would use a vector database or
    // text search library like Fuse.js to implement this properly
    
    // For this MVP, we'll use a simple keyword matching approach
    const normalizedQuery = query.toLowerCase();
    const queryWords = normalizedQuery.split(/\s+/).filter(word => word.length > 2);
    
    // Score each chunk based on matching keywords
    const scoredChunks = this.contentChunks.map(chunk => {
      const chunkText = `${chunk.title} ${chunk.content}`.toLowerCase();
      
      let score = 0;
      for (const word of queryWords) {
        if (chunkText.includes(word)) {
          score += 1;
          
          // Boost score for title matches
          if (chunk.title.toLowerCase().includes(word)) {
            score += 2;
          }
          
          // Boost score for exact keyword matches
          if (chunk.keywords.some(kw => kw.toLowerCase().includes(word))) {
            score += 3;
          }
        }
      }
      
      // Adjust score by priority
      score *= chunk.priority;
      
      return { chunk, score };
    });
    
    // Sort by score and return top matches
    return scoredChunks
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.chunk);
  }
  
  /**
   * Get all indexed chunks
   */
  public getAllChunks(): ContentChunk[] {
    return [...this.contentChunks];
  }
  
  /**
   * Get all sections
   */
  public getSections(): string[] {
    const sections = new Set<string>();
    for (const chunk of this.contentChunks) {
      if (chunk.section) {
        sections.add(chunk.section);
      }
    }
    return Array.from(sections);
  }
}

// Export singleton instance
export const contentIndexingService = ContentIndexingService.getInstance(); 