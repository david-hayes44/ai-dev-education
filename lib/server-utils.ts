'use server';

/**
 * Server-side utilities for content processing
 * This file contains functions that require Node.js file system access
 */

import fs from 'fs';
import path from 'path';

// Interface for content sections
export interface ContentSection {
  id: string;
  title: string;
  content: string;
  level: number;
}

// Interface for content chunks
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

/**
 * Extract metadata from a content file path
 */
export function extractContentMetadata(filePath: string) {
  // Normalize path
  const normalizedPath = filePath.replace(/\\/g, '/');
  
  // Extract route from file path
  // e.g., 'app/getting-started/page.tsx' -> '/getting-started'
  const routeMatch = normalizedPath.match(/app\/(.*?)\/page\.tsx?$/);
  const route = routeMatch ? `/${routeMatch[1]}` : '/';
  
  // Determine section from directory structure
  // First directory after 'app' becomes the section
  const pathParts = normalizedPath.split('/');
  const appIndex = pathParts.indexOf('app');
  const section = appIndex >= 0 && appIndex + 1 < pathParts.length 
    ? pathParts[appIndex + 1].replace(/-/g, ' ').replace(/^\w/, c => c.toUpperCase())
    : 'General';
  
  // Derive title from route
  const lastPathPart = route.split('/').filter(Boolean).pop() || 'Home';
  const title = lastPathPart.replace(/-/g, ' ').replace(/^\w/, c => c.toUpperCase());
  
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
 * Extract content sections from the provided content
 */
export function extractContentSections(content: string): ContentSection[] {
  const sections: ContentSection[] = [];
  
  // Regex patterns for extracting headings and sections
  const headingRegex = /<h([1-6])[^>]*?id=["']([^"']+)["'][^>]*?>(.*?)<\/h\1>|<h([1-6])[^>]*?>(.*?)<\/h\4>/g;
  const sectionRegex = /<section[^>]*?id=["']([^"']+)["'][^>]*?>([\s\S]*?)<\/section>/g;
  
  // Look for headings
  let headingMatch;
  while ((headingMatch = headingRegex.exec(content)) !== null) {
    const level = parseInt(headingMatch[1] || headingMatch[4]);
    const id = headingMatch[2] || `section-${sections.length + 1}`;
    const title = headingMatch[3] || headingMatch[5];
    
    // Extract content until the next heading of same or higher level
    const startPos = headingMatch.index + headingMatch[0].length;
    let endPos = content.length;
    
    // Find the next heading of same or higher level
    const nextHeadingRegex = new RegExp(`<h([1-${level}])[^>]*?>`, 'g');
    nextHeadingRegex.lastIndex = startPos;
    const nextHeading = nextHeadingRegex.exec(content);
    if (nextHeading) {
      endPos = nextHeading.index;
    }
    
    const sectionContent = content.substring(startPos, endPos).trim();
    
    sections.push({
      id,
      title,
      content: sectionContent,
      level
    });
  }
  
  // Look for explicit sections
  let sectionMatch;
  while ((sectionMatch = sectionRegex.exec(content)) !== null) {
    const id = sectionMatch[1];
    const sectionContent = sectionMatch[2];
    
    // Check if this section has a heading
    const sectionHeadingRegex = /<h([1-6])[^>]*?>(.*?)<\/h\1>/;
    const headingMatch = sectionContent.match(sectionHeadingRegex);
    
    const title = headingMatch ? headingMatch[2] : `Section ${id}`;
    const level = headingMatch ? parseInt(headingMatch[1]) : 2;
    
    sections.push({
      id,
      title,
      content: sectionContent,
      level
    });
  }
  
  // If no sections are found, create a default one with the whole content
  if (sections.length === 0 && content.trim().length > 0) {
    sections.push({
      id: 'main',
      title: 'Main Content',
      content,
      level: 1
    });
  }
  
  return sections;
}

/**
 * Convert a route to a file path
 */
export function routeToFilePath(route: string): string {
  // Normalize route
  const normalizedRoute = route === '/' ? 'index' : route.replace(/^\//, '');
  
  // Map to file path
  return path.join(process.cwd(), 'app', normalizedRoute, 'page.tsx');
}

/**
 * Scan for content pages in the given directory
 */
export function scanContentPages(baseDir = 'app'): string[] {
  const contentFiles: string[] = [];
  const basePath = path.join(process.cwd(), baseDir);
  
  // Skip certain directories that don't contain user-facing content
  const ignoreDirs = ['api', 'auth', 'admin', 'node_modules', '.next'];
  
  function scanDir(dirPath: string) {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const entryPath = path.join(dirPath, entry.name);
      
      if (entry.isDirectory()) {
        // Skip ignored directories
        if (!ignoreDirs.includes(entry.name)) {
          scanDir(entryPath);
        }
      } else if (entry.isFile() && /page\.tsx?$/.test(entry.name)) {
        contentFiles.push(entryPath);
      }
    }
  }
  
  scanDir(basePath);
  return contentFiles;
}

/**
 * Extract content from a page file
 */
export function extractContentFromPage(filePath: string): ContentChunk[] {
  // Read the file
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  
  // Extract metadata
  const metadata = extractContentMetadata(filePath);
  
  // Extract JSX content
  // This is a simple approach - a more robust solution would use an AST parser
  const jsxContentRegex = /<div[^>]*?className=["'].*?content.*?["'][^>]*?>([\s\S]*?)<\/div>/g;
  const contentMatches: string[] = [];
  let match;
  
  while ((match = jsxContentRegex.exec(fileContent)) !== null) {
    contentMatches.push(match[1]);
  }
  
  // If no content div found, look for any meaningful content
  if (contentMatches.length === 0) {
    // Look for paragraphs, headings, or sections
    const elementRegex = /<(p|h[1-6]|section)[^>]*?>([\s\S]*?)<\/\1>/g;
    while ((match = elementRegex.exec(fileContent)) !== null) {
      contentMatches.push(match[0]);
    }
  }
  
  // If still no content, try to get all content in the return statement
  if (contentMatches.length === 0) {
    const returnRegex = /return\s*\(\s*([\s\S]*?)\s*\);/;
    const returnMatch = fileContent.match(returnRegex);
    if (returnMatch) {
      contentMatches.push(returnMatch[1]);
    }
  }
  
  // Join all content matches
  const pageContent = contentMatches.join('\n\n');
  
  // Extract sections from content
  const sections = extractContentSections(pageContent);
  
  // Create chunks
  const chunks: ContentChunk[] = [];
  
  // Add main chunk for the whole page
  chunks.push({
    id: `page:${metadata.route}`,
    title: metadata.title,
    content: pageContent,
    path: metadata.route,
    source: metadata.title,
    section: metadata.section,
    keywords: [metadata.title, metadata.section],
    priority: metadata.priority
  });
  
  // Add chunks for each section
  sections.forEach(section => {
    chunks.push({
      id: `section:${metadata.route}:${section.id}`,
      title: `${metadata.title} - ${section.title}`,
      content: section.content,
      path: metadata.route,
      source: metadata.title,
      section: metadata.section,
      keywords: [metadata.title, section.title, metadata.section],
      priority: metadata.priority * 0.9, // Slightly lower priority
      sectionId: section.id
    });
  });
  
  return chunks;
}

/**
 * Save data to a file
 */
export function saveToDataFile(filename: string, data: Record<string, unknown>): void {
  try {
    const dataDir = path.join(process.cwd(), '.data');
    
    // Create data directory if it doesn't exist
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // Write data to file
    fs.writeFileSync(
      path.join(dataDir, filename),
      JSON.stringify(data, null, 2)
    );
  } catch (error) {
    console.error(`Failed to save data to file '${filename}':`, error);
  }
}

/**
 * Read data from a file
 */
export function readFromDataFile<T>(filename: string, defaultValue: T): T {
  try {
    const filePath = path.join(process.cwd(), '.data', filename);
    
    if (fs.existsSync(filePath)) {
      const rawData = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(rawData);
    }
  } catch (error) {
    console.error(`Failed to read data from file '${filename}':`, error);
  }
  
  return defaultValue;
} 