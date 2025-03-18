"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ContentChunk } from "@/lib/content-indexing-service";
import { NavigationSuggestion } from "@/components/chat/navigation-suggestion";

// Define the types for navigation recommendation
export interface NavigationRecommendation {
  path: string;
  title: string;
  description?: string;
  summary?: string;
  confidence: number;
  sectionId?: string; // Added section ID for deep linking
}

// Define current page context information
export interface CurrentPageContext {
  path: string;
  title?: string;
  description?: string;
  content?: string;
  keywords?: string[];
  relatedPaths?: string[];
  sections?: PageSection[]; // Added sections for section-level navigation
}

// Define page section structure
export interface PageSection {
  id: string;
  title: string;
  content: string;
  anchor: string;
}

// Define the context interface
interface NavigationContextType {
  currentPage: string;
  pageTitle: string;
  pageDescription: string;
  recommendations: NavigationSuggestion[];
  relatedPaths: string[];
  isLoading: boolean;
  search: (query: string) => Promise<NavigationSuggestion[]>;
  getSiteStructure: () => Promise<{[key: string]: string[]}>;
  getNavigationSuggestions: (content: string) => Promise<NavigationSuggestion[]>;
  navigateTo: (path: string, sectionId?: string) => void;
  getPageSections: (path: string) => Promise<PageSection[]>;
  detectNavigationIntent: (content: string) => Promise<{
    isNavigation: boolean;
    path?: string;
    sectionId?: string;
    confidence: number;
  }>;
}

// Create the context
const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

interface NavigationProviderProps {
  children: ReactNode;
}

// Mock page sections data for demo purposes
// In a real implementation, this would come from content indexing
const PAGE_SECTIONS: Record<string, PageSection[]> = {
  '/mcp/overview': [
    { id: 'introduction', title: 'Introduction to MCP', content: 'MCP overview content', anchor: 'introduction' },
    { id: 'key-concepts', title: 'Key Concepts', content: 'Key concepts of MCP', anchor: 'key-concepts' },
    { id: 'architecture', title: 'Architecture', content: 'MCP architecture', anchor: 'architecture' }
  ],
  '/introduction': [
    { id: 'getting-started', title: 'Getting Started', content: 'Introduction content', anchor: 'getting-started' },
    { id: 'benefits', title: 'Benefits of AI-Assisted Development', content: 'Benefits content', anchor: 'benefits' }
  ],
  '/servers/architecture': [
    { id: 'overview', title: 'Server Architecture Overview', content: 'Overview content', anchor: 'overview' },
    { id: 'components', title: 'Core Components', content: 'Components content', anchor: 'components' }
  ]
};

// Topic to path mapping for natural language navigation
const TOPIC_TO_PATH_MAPPING: Record<string, {path: string, sectionId?: string}> = {
  'mcp': { path: '/mcp/overview' },
  'model context protocol': { path: '/mcp/overview' },
  'context protocol': { path: '/mcp/overview' },
  'mcp architecture': { path: '/mcp/overview', sectionId: 'architecture' },
  'getting started': { path: '/introduction', sectionId: 'getting-started' },
  'introduction': { path: '/introduction' },
  'servers': { path: '/servers/architecture' },
  'server architecture': { path: '/servers/architecture' },
  'server components': { path: '/servers/architecture', sectionId: 'components' },
  'key concepts': { path: '/mcp/overview', sectionId: 'key-concepts' },
  'ai assisted development': { path: '/introduction', sectionId: 'benefits' }
};

export function NavigationProvider({ children }: NavigationProviderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState<string>('');
  const [pageTitle, setPageTitle] = useState<string>('');
  const [pageDescription, setPageDescription] = useState<string>('');
  const [recommendations, setRecommendations] = useState<NavigationSuggestion[]>([]);
  const [relatedPaths, setRelatedPaths] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
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
      
      // Set related paths based on the current page
      // This is a simplified implementation - would normally fetch from an API
      const getRelatedPaths = async () => {
        const siteStructure = await getSiteStructure();
        // Find current section
        let currentSection = '';
        let paths: string[] = [];
        
        for (const [section, sectionPaths] of Object.entries(siteStructure)) {
          if (sectionPaths.some(path => path.includes(pageName))) {
            currentSection = section;
            paths = sectionPaths.filter(path => !path.includes(pageName));
            break;
          }
        }
        
        // If no specific section found, provide some default related paths
        if (paths.length === 0) {
          paths = ['/introduction', '/mcp/overview', '/servers/architecture'];
        }
        
        setRelatedPaths(paths);
      };
      
      getRelatedPaths();
    }
  }, [pathname]);
  
  /**
   * Search for pages matching a query
   */
  const search = async (query: string): Promise<NavigationSuggestion[]> => {
    if (!query.trim()) return [];
    
    setIsLoading(true);
    
    try {
      // Use our content search API to find relevant pages
      const response = await fetch(`/api/content-search?query=${encodeURIComponent(query)}&limit=5`);
      
      if (!response.ok) {
        throw new Error(`Search failed with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Convert content chunks to navigation suggestions
      const results = (data.results || []).map((chunk: ContentChunk) => ({
        title: chunk.title,
        path: chunk.path,
        description: chunk.content.substring(0, 120) + '...',
        confidence: 0.85, // In a real implementation, this would be calculated
        sectionId: chunk.section.toLowerCase().replace(/\s+/g, '-') // Add section ID for deep linking
      }));
      
      setRecommendations(results);
      return results;
    } catch (err) {
      console.error('Error searching for pages:', err);
      return [];
    } finally {
      setIsLoading(false);
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
   * Get sections for a specific page
   */
  const getPageSections = async (path: string): Promise<PageSection[]> => {
    // In a real implementation, this would fetch from an API or content index
    return PAGE_SECTIONS[path] || [];
  };
  
  /**
   * Navigate to a specific page and optionally a section within that page
   */
  const navigateTo = (path: string, sectionId?: string) => {
    if (sectionId) {
      router.push(`${path}#${sectionId}`);
    } else {
      router.push(path);
    }
  };
  
  /**
   * Enhanced navigation intent detection
   * Detects if a message is asking for navigation and where to navigate to
   */
  const detectNavigationIntent = async (content: string): Promise<{
    isNavigation: boolean;
    path?: string;
    sectionId?: string;
    confidence: number;
  }> => {
    const lowerContent = content.toLowerCase();
    
    // Check for explicit navigation intents
    const navigationPatterns = [
      /show me (?:information about|details on|) (.*)/i,
      /where can I find (?:information about|details on|) (.*)/i,
      /take me to (?:the|) (.*?) (?:page|section)/i,
      /I want to learn about (.*)/i,
      /navigate to (.*)/i,
      /go to (.*)/i,
      /how do I get to (.*)/i,
      /can you show (.*)/i,
      /link to (.*)/i,
      /bring up (.*)/i
    ];
    
    // Check each pattern for a match
    for (const pattern of navigationPatterns) {
      const match = content.match(pattern);
      if (match && match[1]) {
        const topic = match[1].trim().toLowerCase();
        
        // Check direct mappings first
        for (const [key, value] of Object.entries(TOPIC_TO_PATH_MAPPING)) {
          if (topic === key || topic.includes(key)) {
            return {
              isNavigation: true,
              path: value.path,
              sectionId: value.sectionId,
              confidence: 0.9
            };
          }
        }
        
        // If no direct match, search for related content
        const searchResults = await search(topic);
        if (searchResults.length > 0) {
          const bestMatch = searchResults[0];
          return {
            isNavigation: true,
            path: bestMatch.path,
            sectionId: bestMatch.sectionId,
            confidence: bestMatch.confidence || 0.7
          };
        }
      }
    }
    
    // Fall back to fuzzy matching for implicit navigation requests
    if (
      lowerContent.includes('find') ||
      lowerContent.includes('where') ||
      lowerContent.includes('show') ||
      lowerContent.includes('page for')
    ) {
      // Extract potential topics from the message
      const words = lowerContent.split(/\s+/);
      
      // Look for significant words that might be topics
      for (const word of words) {
        if (word.length > 3 && !['find', 'where', 'show', 'page', 'about', 'the', 'and', 'for'].includes(word)) {
          // Search for this potential topic
          const searchResults = await search(word);
          if (searchResults.length > 0) {
            const bestMatch = searchResults[0];
            return {
              isNavigation: true,
              path: bestMatch.path,
              sectionId: bestMatch.sectionId,
              confidence: 0.6 // Lower confidence for fuzzy matching
            };
          }
        }
      }
    }
    
    return { isNavigation: false, confidence: 0 };
  };
  
  /**
   * Get navigation suggestions based on user message content
   */
  const getNavigationSuggestions = async (content: string): Promise<NavigationSuggestion[]> => {
    const navigationIntent = await detectNavigationIntent(content);
    
    if (!navigationIntent.isNavigation) {
      return [];
    }
    
    // If we have a direct navigation path, just return that
    if (navigationIntent.path) {
      // Get the page title from the path
      const pathSegments = navigationIntent.path.split('/');
      const pageName = pathSegments[pathSegments.length - 1] || 'home';
      const title = pageName.charAt(0).toUpperCase() + pageName.slice(1).replace(/-/g, ' ');
      
      // Get section title if available
      let sectionTitle = '';
      if (navigationIntent.sectionId) {
        const sections = await getPageSections(navigationIntent.path);
        const section = sections.find(s => s.id === navigationIntent.sectionId);
        if (section) {
          sectionTitle = section.title;
        }
      }
      
      const suggestion: NavigationSuggestion = {
        title: sectionTitle ? `${title} - ${sectionTitle}` : title,
        path: navigationIntent.path,
        description: `Navigate to ${sectionTitle || title} page`,
        confidence: navigationIntent.confidence,
        sectionId: navigationIntent.sectionId
      };
      
      return [suggestion];
    }
    
    // Otherwise search for related content
    const words = content.split(/\s+/);
    const significantWords = words.filter(word => 
      word.length > 3 && !['find', 'where', 'show', 'page', 'about', 'the', 'and'].includes(word.toLowerCase())
    );
    
    if (significantWords.length > 0) {
      return await search(significantWords.join(' '));
    }
    
    return [];
  };
  
  return (
    <NavigationContext.Provider value={{
      currentPage,
      pageTitle,
      pageDescription,
      recommendations,
      relatedPaths,
      isLoading,
      search,
      getSiteStructure,
      getNavigationSuggestions,
      navigateTo,
      getPageSections,
      detectNavigationIntent
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