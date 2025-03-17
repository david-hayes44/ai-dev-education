/**
 * Content Indexing System for AI Navigation Assistant
 * 
 * This module implements a content indexing system for the site content
 * to support the AI Navigation Assistant with context-aware search and navigation.
 */

import fs from 'fs';
import path from 'path';
import { promises as fsPromises } from 'fs';

/**
 * Interface for a site map node that represents a page or content section
 */
export interface SiteMapNode {
  path: string;
  title: string;
  description?: string;
  keywords: string[];
  summary?: string;
  content: string;
  childNodes?: SiteMapNode[];
  relatedPaths?: string[];
  lastUpdated?: Date;
}

/**
 * Interface for content metadata extracted from pages
 */
export interface ContentMetadata {
  title: string;
  description?: string;
  keywords: string[];
  summary?: string;
  lastUpdated?: Date;
}

/**
 * Interface for the entire site content index
 */
export interface SiteContentIndex {
  rootNodes: SiteMapNode[];
  allPaths: string[];
  pathToNodeMap: Map<string, SiteMapNode>;
  keywords: Set<string>;
}

/**
 * Extracts metadata from page content
 */
function extractMetadataFromContent(content: string): ContentMetadata {
  // Default values
  const metadata: ContentMetadata = {
    title: "Untitled Page",
    keywords: [],
  };
  
  // Extract title from content (simple implementation)
  const titleMatch = content.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || content.match(/title: ["'](.+?)["']/);
  if (titleMatch && titleMatch[1]) {
    metadata.title = titleMatch[1].trim();
  }
  
  // Extract description
  const descriptionMatch = content.match(/description: ["'](.+?)["']/);
  if (descriptionMatch && descriptionMatch[1]) {
    metadata.description = descriptionMatch[1].trim();
  }
  
  // Extract keywords (simple implementation)
  const keywordMatches = content.match(/keywords: \[(.*?)\]/);
  if (keywordMatches && keywordMatches[1]) {
    metadata.keywords = keywordMatches[1]
      .split(',')
      .map(keyword => keyword.trim().replace(/['"]/g, ''));
  } else {
    // Generate keywords from content
    const words = content
      .replace(/<[^>]*>/g, ' ') // Remove HTML tags
      .replace(/[^\w\s]/g, ' ') // Remove punctuation
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 3 && !['this', 'that', 'with', 'from'].includes(word));
    
    // Get word frequency
    const wordFreq = words.reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Get top keywords
    metadata.keywords = Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word);
  }
  
  return metadata;
}

/**
 * Processes a single page file to extract content and metadata
 */
export async function processPageFile(filePath: string): Promise<SiteMapNode | null> {
  try {
    const content = await fsPromises.readFile(filePath, 'utf-8');
    const relativePath = filePath
      .replace(/^app/, '') // Remove app prefix
      .replace(/\/page\.tsx$/, '') // Remove page.tsx suffix
      .replace(/\/page\.mdx$/, '') // Remove page.mdx suffix
      .replace(/\/page\.md$/, '') // Remove page.md suffix
      .replace(/^\/+/, ''); // Remove leading slashes
    
    const urlPath = `/${relativePath}`;
    const metadata = extractMetadataFromContent(content);
    
    return {
      path: urlPath,
      title: metadata.title,
      description: metadata.description,
      keywords: metadata.keywords,
      summary: metadata.summary,
      content: content
        .replace(/<[^>]*>/g, ' ') // Remove HTML tags
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim(),
      lastUpdated: metadata.lastUpdated,
    };
  } catch (error) {
    console.error(`Error processing page file ${filePath}:`, error);
    return null;
  }
}

/**
 * Recursively scans directories to find page files
 */
async function scanDirectory(dir: string, basePath = ''): Promise<string[]> {
  const entries = await fsPromises.readdir(dir, { withFileTypes: true });
  
  const files = await Promise.all(
    entries.map(async (entry) => {
      const resolvedPath = path.resolve(dir, entry.name);
      const relativePath = path.join(basePath, entry.name);
      
      if (entry.isDirectory()) {
        // Skip node_modules, .next, and other non-content directories
        if (['node_modules', '.next', '.git', 'public', 'styles'].includes(entry.name)) {
          return [];
        }
        return scanDirectory(resolvedPath, relativePath);
      } else if (
        entry.name === 'page.tsx' ||
        entry.name === 'page.jsx' ||
        entry.name === 'page.md' ||
        entry.name === 'page.mdx'
      ) {
        return [resolvedPath];
      }
      return [];
    })
  );
  
  return files.flat();
}

/**
 * Builds the site map by scanning the app directory for page files
 */
export async function buildSiteMap(): Promise<SiteContentIndex> {
  const appDir = path.join(process.cwd(), 'app');
  const pageFiles = await scanDirectory(appDir);
  
  const nodes: SiteMapNode[] = [];
  const pathToNodeMap = new Map<string, SiteMapNode>();
  const allPaths: string[] = [];
  const keywords = new Set<string>();
  
  // Process all page files and create nodes
  await Promise.all(
    pageFiles.map(async (filePath) => {
      const node = await processPageFile(filePath);
      if (node) {
        nodes.push(node);
        pathToNodeMap.set(node.path, node);
        allPaths.push(node.path);
        
        // Add keywords to set
        node.keywords.forEach(keyword => keywords.add(keyword));
      }
    })
  );
  
  // Build tree structure - identify parent-child relationships
  const rootNodes: SiteMapNode[] = [];
  
  for (const node of nodes) {
    // Check if this is a root node or has a parent
    const pathParts = node.path.split('/').filter(Boolean);
    
    if (pathParts.length === 0 || pathParts[0] === '') {
      // This is the root node (/)
      rootNodes.push(node);
    } else {
      // Check for parent
      let parentPath = '';
      for (let i = 0; i < pathParts.length - 1; i++) {
        parentPath += '/' + pathParts[i];
        
        const parent = pathToNodeMap.get(parentPath);
        if (parent) {
          // Found a parent, add this node as a child
          if (!parent.childNodes) {
            parent.childNodes = [];
          }
          parent.childNodes.push(node);
          break;
        }
      }
      
      // If no parent found, this is a root level node
      if (parentPath === '') {
        rootNodes.push(node);
      }
    }
  }
  
  // Identify related pages based on keyword similarity
  for (const node of nodes) {
    node.relatedPaths = findRelatedPages(node, nodes);
  }
  
  return {
    rootNodes,
    allPaths,
    pathToNodeMap,
    keywords
  };
}

/**
 * Finds related pages based on keyword similarity
 */
function findRelatedPages(node: SiteMapNode, allNodes: SiteMapNode[]): string[] {
  // Skip if no keywords
  if (!node.keywords || node.keywords.length === 0) {
    return [];
  }
  
  // Calculate similarity scores
  const similarities = allNodes
    .filter(otherNode => otherNode.path !== node.path) // Exclude self
    .map(otherNode => {
      // Calculate Jaccard similarity between keyword sets
      const intersection = node.keywords.filter(keyword => 
        otherNode.keywords.includes(keyword)
      ).length;
      
      const union = new Set([...node.keywords, ...otherNode.keywords]).size;
      const similarity = union > 0 ? intersection / union : 0;
      
      return {
        path: otherNode.path,
        similarity
      };
    })
    .filter(item => item.similarity > 0.2) // Only include pages with significant similarity
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 5) // Get top 5 related pages
    .map(item => item.path);
  
  return similarities;
}

/**
 * Gets content from the current page for the AI assistant
 */
export function getCurrentPageContent(path: string, index: SiteContentIndex): string | null {
  const node = index.pathToNodeMap.get(path);
  if (!node) {
    return null;
  }
  
  return node.content;
}

/**
 * Searches for content based on a query
 */
export function searchContent(query: string, index: SiteContentIndex): SiteMapNode[] {
  const normalizedQuery = query.toLowerCase();
  const words = normalizedQuery.split(/\s+/).filter(word => word.length > 2);
  
  // Score each node based on keyword matches
  return Array.from(index.pathToNodeMap.values())
    .map(node => {
      let score = 0;
      
      // Check title match
      if (node.title.toLowerCase().includes(normalizedQuery)) {
        score += 10;
      }
      
      // Check individual word matches in title
      words.forEach(word => {
        if (node.title.toLowerCase().includes(word)) {
          score += 5;
        }
      });
      
      // Check keyword matches
      node.keywords.forEach(keyword => {
        if (normalizedQuery.includes(keyword) || keyword.includes(normalizedQuery)) {
          score += 3;
        }
        
        words.forEach(word => {
          if (keyword.includes(word)) {
            score += 1;
          }
        });
      });
      
      // Check content matches
      if (node.content.toLowerCase().includes(normalizedQuery)) {
        score += 2;
      }
      
      return { node, score };
    })
    .filter(item => item.score > 0) // Only include results with a positive score
    .sort((a, b) => b.score - a.score) // Sort by score descending
    .slice(0, 10) // Return top 10 results
    .map(item => item.node);
}

// Export default singleton pattern for accessing the index
let siteContentIndexPromise: Promise<SiteContentIndex> | null = null;

export function getSiteContentIndex(): Promise<SiteContentIndex> {
  if (!siteContentIndexPromise) {
    siteContentIndexPromise = buildSiteMap();
  }
  
  return siteContentIndexPromise;
} 