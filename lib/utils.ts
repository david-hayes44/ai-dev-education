import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Utility for merging class names with Tailwind CSS
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
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
 * Get file type category based on MIME type or filename
 * This is safe to use on both client and server
 */
export function getFileTypeCategory(
  mimeType?: string,
  filename?: string
): 'image' | 'document' | 'data' | 'code' | 'unknown' {
  // Default to unknown if no info provided
  if (!mimeType && !filename) return 'unknown';
  
  // Check MIME type first if available
  if (mimeType) {
    // Images
    if (mimeType.startsWith('image/')) return 'image';
    
    // Documents
    if (
      mimeType.includes('pdf') ||
      mimeType.includes('word') ||
      mimeType.includes('excel') ||
      mimeType.includes('powerpoint') ||
      mimeType.includes('text/plain') ||
      mimeType.includes('text/html') ||
      mimeType.includes('text/rtf')
    ) return 'document';
    
    // Data files
    if (
      mimeType.includes('json') ||
      mimeType.includes('xml') ||
      mimeType.includes('csv')
    ) return 'data';
    
    // Code files
    if (
      mimeType.includes('javascript') ||
      mimeType.includes('typescript') ||
      mimeType.includes('python') ||
      mimeType.includes('java') ||
      mimeType.includes('text/x-') || // Many code MIME types use this prefix
      mimeType.includes('application/x-') // Many code MIME types use this prefix
    ) return 'code';
  }
  
  // Check filename extension as fallback
  if (filename) {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    
    // Images
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp', 'ico'].includes(ext)) {
      return 'image';
    }
    
    // Documents
    if (['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt', 'xls', 'xlsx', 'ppt', 'pptx', 'html', 'htm'].includes(ext)) {
      return 'document';
    }
    
    // Data files
    if (['json', 'xml', 'csv', 'yaml', 'yml', 'toml'].includes(ext)) {
      return 'data';
    }
    
    // Code files
    if ([
      'js', 'ts', 'jsx', 'tsx',  // JavaScript/TypeScript
      'py', 'python',            // Python
      'java', 'class',           // Java
      'c', 'cpp', 'h', 'hpp',    // C/C++
      'rb',                      // Ruby
      'php',                     // PHP
      'go',                      // Go
      'rs',                      // Rust
      'css', 'scss', 'sass',     // CSS
      'html', 'htm',             // HTML (could be document or code)
      'sh', 'bash', 'zsh',       // Shell
      'sql',                     // SQL
      'md', 'markdown',          // Markdown
      'swift',                   // Swift
      'kt', 'kts',               // Kotlin
      'dart',                    // Dart
      'ex', 'exs',               // Elixir
      'cs',                      // C#
      'fs',                      // F#
      'hs',                      // Haskell
      'pl'                       // Perl
    ].includes(ext)) {
      return 'code';
    }
  }
  
  // Default to unknown if no match found
  return 'unknown';
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
