"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { usePathname } from "next/navigation";
import { ContentChunk } from "@/lib/content-indexing-service";
import { NavigationSuggestion } from "@/components/chat/navigation-suggestion";

// Define the types for navigation recommendation
export interface NavigationRecommendation {
  path: string;
  title: string;
  description?: string;
  summary?: string;
  confidence: number;
}

// Define current page context information
export interface CurrentPageContext {
  path: string;
  title?: string;
  description?: string;
  content?: string;
  keywords?: string[];
  relatedPaths?: string[];
}

// Define the context interface
interface NavigationContextType {
  currentPage: string;
  pageTitle: string;
  pageDescription: string;
  search: (query: string) => Promise<NavigationSuggestion[]>;
  getSiteStructure: () => Promise<{[key: string]: string[]}>;
  getNavigationSuggestions: (content: string) => Promise<NavigationSuggestion[]>;
}

// Create the context
const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

interface NavigationProviderProps {
  children: ReactNode;
}

export function NavigationProvider({ children }: NavigationProviderProps) {
  const pathname = usePathname();
  const [currentPage, setCurrentPage] = useState<string>('');
  const [pageTitle, setPageTitle] = useState<string>('');
  const [pageDescription, setPageDescription] = useState<string>('');
  
  // Update current page info when pathname changes
  useEffect(() => {
    if (pathname) {
      // Extract page name from pathname
      const pageName = pathname.split('/').pop() || 'home';
      setCurrentPage(pageName);
      
      // Get page title and description from metadata
      // In a real implementation, we would extract this from the page's metadata
      const title = pageName.charAt(0).toUpperCase() + pageName.slice(1).replace(/-/g, ' ');
      setPageTitle(title);
      setPageDescription(`Information about ${title}`);
    }
  }, [pathname]);
  
  /**
   * Search for pages matching a query
   */
  const search = async (query: string): Promise<NavigationSuggestion[]> => {
    if (!query.trim()) return [];
    
    try {
      // Use our content search API to find relevant pages
      const response = await fetch(`/api/content-search?query=${encodeURIComponent(query)}&limit=5`);
      
      if (!response.ok) {
        throw new Error(`Search failed with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Convert content chunks to navigation suggestions
      return (data.results || []).map((chunk: ContentChunk) => ({
        title: chunk.title,
        path: chunk.path,
        description: chunk.content.substring(0, 120) + '...',
        confidence: 0.85 // In a real implementation, this would be calculated
      }));
    } catch (err) {
      console.error('Error searching for pages:', err);
      return [];
    }
  };
  
  /**
   * Get the site structure
   */
  const getSiteStructure = async (): Promise<{[key: string]: string[]}> => {
    // In a real implementation, this would be fetched from an API
    // For now, return a hardcoded structure
    return {
      'Introduction': ['/introduction', '/getting-started'],
      'MCP': ['/mcp/overview', '/mcp/protocols', '/mcp/context-management'],
      'Development': ['/development/tools', '/development/workflows', '/development/agents'],
      'Servers': ['/servers/architecture', '/servers/implementation', '/servers/security'],
      'Examples': ['/examples/simple', '/examples/advanced']
    };
  };
  
  /**
   * Extract navigation intents from message content
   */
  const extractNavigationIntent = (content: string): { intent: boolean, topic?: string } => {
    const navigationPatterns = [
      /show me (?:information about|details on|) (.*)/i,
      /where can I find (?:information about|details on|) (.*)/i,
      /take me to (?:the|) (.*?) (?:page|section)/i,
      /I want to learn about (.*)/i,
      /navigate to (.*)/i,
      /go to (.*)/i
    ];
    
    for (const pattern of navigationPatterns) {
      const match = content.match(pattern);
      if (match && match[1]) {
        return { intent: true, topic: match[1].trim() };
      }
    }
    
    return { intent: false };
  };
  
  /**
   * Get navigation suggestions based on user message content
   */
  const getNavigationSuggestions = async (content: string): Promise<NavigationSuggestion[]> => {
    const { intent, topic } = extractNavigationIntent(content);
    
    if (!intent || !topic) {
      return [];
    }
    
    // Search for pages matching the topic
    return await search(topic);
  };
  
  return (
    <NavigationContext.Provider value={{
      currentPage,
      pageTitle,
      pageDescription,
      search,
      getSiteStructure,
      getNavigationSuggestions
    }}>
      {children}
    </NavigationContext.Provider>
  );
}

// Create custom hook for using the context
export function useNavigation() {
  const context = useContext(NavigationContext);
  
  if (context === undefined) {
    throw new Error("useNavigation must be used within a NavigationProvider");
  }
  
  return context;
}

export type { NavigationSuggestion }; 