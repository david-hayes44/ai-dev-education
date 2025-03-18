import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

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
