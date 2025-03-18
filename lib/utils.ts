import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import fs from 'fs'
import path from 'path'
import { ContentChunk } from "./content-indexing-service"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Detect file type category from MIME type or filename
 * 
 * @param type MIME type
 * @param filename Optional filename
 * @returns The file type category
 */
export function getFileTypeCategory(type: string, filename?: string): 'image' | 'document' | 'code' | 'data' | 'unknown' {
  // Check MIME type first
  if (type.startsWith('image/')) {
    return 'image';
  }
  
  if (type === 'application/pdf' || 
      type === 'application/msword' || 
      type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      type === 'text/plain' ||
      type === 'application/rtf' ||
      type === 'text/markdown') {
    return 'document';
  }
  
  if (type === 'application/json' || 
      type === 'text/csv' || 
      type === 'application/xml' || 
      type === 'text/xml' ||
      type === 'application/vnd.ms-excel' ||
      type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
    return 'data';
  }
  
  if (type === 'text/javascript' || 
      type === 'application/javascript' ||
      type === 'text/typescript' ||
      type === 'text/html' ||
      type === 'text/css') {
    return 'code';
  }
  
  // If we didn't match by MIME type, try by file extension
  if (filename) {
    const extension = filename.split('.').pop()?.toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(extension || '')) {
      return 'image';
    }
    
    if (['pdf', 'doc', 'docx', 'txt', 'rtf', 'md', 'markdown'].includes(extension || '')) {
      return 'document';
    }
    
    if (['json', 'csv', 'xml', 'xlsx', 'xls'].includes(extension || '')) {
      return 'data';
    }
    
    if (['js', 'ts', 'jsx', 'tsx', 'html', 'css', 'py', 'java', 'rb', 'c', 'cpp', 'cs', 'go', 'php', 'sql', 'swift'].includes(extension || '')) {
      return 'code';
    }
  }
  
  return 'unknown';
}

/**
 * Interface for representing a section of content
 */
export interface ContentSection {
  id: string;
  title: string;
  content: string;
  level: number;
}

/**
 * Extract content metadata from a file path
 * 
 * @param filePath Path to the content file
 * @returns Content metadata object
 */
export function extractContentMetadata(filePath: string): {
  route: string;
  section: string;
  title: string;
  priority: number;
} {
  // Normalize path for consistent processing
  const normalizedPath = filePath.replace(/\\/g, '/');
  
  // Extract route from path (e.g., "/app/mcp/page.tsx" -> "/mcp")
  const routeMatch = normalizedPath.match(/\/app\/(.+?)\/page\.tsx$/);
  const route = routeMatch ? `/${routeMatch[1]}` : '/';
  
  // Extract section from route (e.g., "/mcp/overview" -> "mcp")
  const sectionMatch = route.match(/^\/([^\/]+)/);
  const section = sectionMatch ? sectionMatch[1] : 'general';
  
  // Generate title from route (e.g., "/mcp/overview" -> "MCP Overview")
  let title = '';
  if (route === '/') {
    title = 'Home';
  } else {
    // Get the last part of the route (e.g., "/mcp/overview" -> "overview")
    const lastPart = route.split('/').filter(Boolean).pop() || '';
    
    // Convert to title case (e.g., "overview" -> "Overview")
    title = lastPart
      .split('-')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
    
    // Add section prefix for sub-pages
    if (route.split('/').filter(Boolean).length > 1) {
      const sectionTitle = section.toUpperCase();
      title = `${sectionTitle} ${title}`;
    }
  }
  
  // Determine priority (main pages have higher priority)
  const depth = route.split('/').filter(Boolean).length;
  const priority = Math.max(1, 5 - depth) / 5; // 1.0 for main pages, lower for deeper pages
  
  return {
    route,
    section,
    title,
    priority
  };
}

/**
 * Extract sections from content
 * 
 * @param content Content to extract sections from
 * @returns Array of content sections
 */
export function extractContentSections(content: string): ContentSection[] {
  const sections: ContentSection[] = [];
  
  // Look for h1, h2, h3, h4, h5, h6 headings
  const headingRegex = /<h([1-6])[^>]*>(.*?)<\/h\1>|<([A-Za-z0-9]+) [^>]*id=["']([^"']+)["'][^>]*>(.*?)<\/\3>/g;
  
  // Also look for React component patterns that might indicate sections
  const sectionRegex = /<section[^>]*id=["']([^"']+)["'][^>]*>((?:.|\n)*?)(<\/section>|<h([1-6])[^>]*>)/g;
  
  let match;
  
  // First extract sections from heading elements
  while ((match = headingRegex.exec(content)) !== null) {
    const level = parseInt(match[1], 10) || 2;
    const title = match[2] || match[5] || 'Untitled Section';
    const id = match[4] || title.toLowerCase().replace(/[^\w]+/g, '-');
    
    // Extract content until the next heading of the same or higher level
    let sectionContent = '';
    const startPos = match.index + match[0].length;
    const nextHeadingRegex = new RegExp(`<h([1-${level}])[^>]*>`, 'g');
    nextHeadingRegex.lastIndex = startPos;
    
    const nextMatch = nextHeadingRegex.exec(content);
    if (nextMatch) {
      sectionContent = content.slice(startPos, nextMatch.index);
    } else {
      sectionContent = content.slice(startPos);
    }
    
    sections.push({
      id,
      title,
      content: sectionContent.trim(),
      level
    });
  }
  
  // Then extract sections from section elements
  while ((match = sectionRegex.exec(content)) !== null) {
    const id = match[1];
    const sectionContent = match[2] || '';
    
    // Extract title from the first heading inside the section
    const titleMatch = sectionContent.match(/<h([1-6])[^>]*>(.*?)<\/h\1>/);
    const title = titleMatch ? titleMatch[2] : id.split('-').map(part => 
      part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
    
    // Skip if this id already exists in sections
    if (!sections.some(s => s.id === id)) {
      sections.push({
        id,
        title,
        content: sectionContent.trim(),
        level: titleMatch ? parseInt(titleMatch[1], 10) : 2
      });
    }
  }
  
  return sections;
}

/**
 * Convert a route to a file path
 * 
 * @param route Route to convert
 * @returns File path
 */
export function routeToFilePath(route: string): string {
  if (route === '/') {
    return 'app/page.tsx';
  }
  
  // Handle special routes
  if (route.startsWith('/api/')) {
    return `app${route}.ts`;
  }
  
  // Regular routes
  return `app${route}/page.tsx`;
}

/**
 * Scan content pages for indexing
 * 
 * @param baseDir Base directory to scan from (default: 'app')
 * @returns Array of file paths
 */
export async function scanContentPages(baseDir = 'app'): Promise<string[]> {
  const contentFiles: string[] = [];
  
  // Function to recursively scan directories
  const scanDir = async (dir: string) => {
    const entries = await fs.promises.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        // Skip special directories
        if (entry.name === 'api' || entry.name.startsWith('_')) {
          continue;
        }
        
        // Recursively scan subdirectories
        await scanDir(fullPath);
      } else if (entry.isFile() && entry.name === 'page.tsx') {
        // Found a content page
        contentFiles.push(fullPath);
      }
    }
  };
  
  await scanDir(baseDir);
  return contentFiles;
}

/**
 * Extract content from a Next.js page file
 * 
 * @param filePath Path to the page file
 * @returns Content chunks
 */
export async function extractContentFromPage(filePath: string): Promise<ContentChunk[]> {
  const chunks: ContentChunk[] = [];
  const content = await fs.promises.readFile(filePath, 'utf-8');
  
  // Extract metadata
  const metadata = extractContentMetadata(filePath);
  
  // Create a chunk for the entire page
  const pageId = `page:${metadata.route}`;
  const pageChunk: ContentChunk = {
    id: pageId,
    title: metadata.title,
    content: content,
    path: metadata.route,
    source: metadata.title,
    section: metadata.section,
    keywords: [metadata.section, ...metadata.title.toLowerCase().split(' ')],
    priority: metadata.priority
  };
  chunks.push(pageChunk);
  
  // Extract sections
  const sections = extractContentSections(content);
  
  // Create chunks for each section
  for (const section of sections) {
    const sectionChunk: ContentChunk = {
      id: `section:${metadata.route}:${section.id}`,
      title: `${metadata.title} - ${section.title}`,
      content: section.content,
      path: metadata.route,
      source: metadata.title,
      section: metadata.section,
      keywords: [metadata.section, section.title.toLowerCase()],
      priority: metadata.priority * 0.9, // Slightly lower priority than the page
      sectionId: section.id
    };
    chunks.push(sectionChunk);
  }
  
  return chunks;
}
