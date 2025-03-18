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
   * Enhanced search method that uses semantic search API
   */
  const search = async (query: string): Promise<NavigationSuggestion[]> => {
    if (!query.trim()) return [];
    
    setIsLoading(true);
    
    try {
      // First try semantic search for better results
      const semanticResponse = await fetch(`/api/semantic-search?query=${encodeURIComponent(query)}&limit=5`);
      
      let results: NavigationSuggestion[] = [];
      
      if (semanticResponse.ok) {
        const semanticData = await semanticResponse.json();
        
        // Convert search results to navigation suggestions
        results = (semanticData.results || []).map((result: any) => ({
          title: result.title,
          path: result.path,
          description: result.content?.substring(0, 120) + '...',
          confidence: result.score || 0.7, // Use the similarity score as confidence
          sectionId: result.section?.toLowerCase().replace(/\s+/g, '-')
        }));
      } else {
        // Fallback to regular content search if semantic search fails
        console.warn('Semantic search failed, falling back to regular search');
        const response = await fetch(`/api/content-search?query=${encodeURIComponent(query)}&limit=5`);
        
        if (response.ok) {
          const data = await response.json();
          
          // Convert content chunks to navigation suggestions
          results = (data.results || []).map((chunk: any) => ({
            title: chunk.title,
            path: chunk.path,
            description: chunk.content?.substring(0, 120) + '...',
            confidence: 0.6, // Lower confidence for regular search
            sectionId: chunk.section?.toLowerCase().replace(/\s+/g, '-')
          }));
        }
      }
      
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
   * Enhanced navigation intent detection with better pattern matching and topic extraction
   */
  const detectNavigationIntent = async (content: string): Promise<{
    isNavigation: boolean;
    path?: string;
    sectionId?: string;
    confidence: number;
  }> => {
    const lowerContent = content.toLowerCase();
    
    // Enhanced patterns for more natural language detection
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
      /bring up (.*)/i,
      /find (.*) in the documentation/i,
      /what does (.*) mean/i,
      /explain (.*) to me/i,
      /tell me about (.*)/i,
      /search for (.*)/i,
      /looking for (.*)/i
    ];
    
    // Check each pattern for a match
    for (const pattern of navigationPatterns) {
      const match = content.match(pattern);
      if (match && match[1]) {
        const topic = match[1].trim().toLowerCase();
        
        // First check if we have a direct mapping for this topic
        if (TOPIC_TO_PATH_MAPPING[topic]) {
          return {
            isNavigation: true,
            path: TOPIC_TO_PATH_MAPPING[topic].path,
            sectionId: TOPIC_TO_PATH_MAPPING[topic].sectionId,
            confidence: 0.95 // High confidence for direct mapping
          };
        }
        
        // If no direct mapping, use semantic search to find the best page
        try {
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
        } catch (error) {
          console.error('Error during semantic search for navigation intent:', error);
        }
      }
    }
    
    // No explicit navigation intent detected
    // Check for implicit navigation by performing a semantic search on the entire message
    // This handles cases where users ask questions that don't match our patterns
    if (lowerContent.length > 5) {
      try {
        const searchResults = await search(content);
        
        if (searchResults.length > 0) {
          const bestMatch = searchResults[0];
          
          // Only consider this navigation if the confidence is high enough
          if (bestMatch.confidence && bestMatch.confidence > 0.75) {
            return {
              isNavigation: true,
              path: bestMatch.path,
              sectionId: bestMatch.sectionId,
              confidence: bestMatch.confidence * 0.8 // Slightly lower confidence for implicit navigation
            };
          }
        }
      } catch (error) {
        console.error('Error during semantic search for implicit navigation:', error);
      }
    }
    
    return {
      isNavigation: false,
      confidence: 0
    };
  };
  
  /**
   * Enhanced method to get navigation suggestions from content
   */
  const getNavigationSuggestions = async (content: string): Promise<NavigationSuggestion[]> => {
    // Extract potential navigation topics from message
    const potentialTopics: string[] = [];
    
    // Check for explicit topic mentions
    const topicPatterns = [
      /about ([\w\s]+)/gi,
      /learn (?:about|more about) ([\w\s]+)/gi,
      /understand ([\w\s]+)/gi,
      /help with ([\w\s]+)/gi,
      /information on ([\w\s]+)/gi,
      /details about ([\w\s]+)/gi
    ];
    
    // Extract all potential topics
    for (const pattern of topicPatterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        if (match[1] && match[1].trim().length > 3) {
          potentialTopics.push(match[1].trim().toLowerCase());
        }
      }
    }
    
    // Add any direct keywords mentioned that match our known topics
    Object.keys(TOPIC_TO_PATH_MAPPING).forEach(topic => {
      if (content.toLowerCase().includes(topic)) {
        potentialTopics.push(topic);
      }
    });
    
    // If we found potential topics, search for them
    if (potentialTopics.length > 0) {
      try {
        // Remove duplicates and limit to top 3 topics
        const uniqueTopics = [...new Set(potentialTopics)].slice(0, 3);
        
        // Get search results for each topic
        const results = await Promise.all(
          uniqueTopics.map(async (topic) => {
            const searchResults = await search(topic);
            return {
              topic,
              results: searchResults
            };
          })
        );
        
        // Flatten and sort by confidence
        const allSuggestions: NavigationSuggestion[] = results
          .flatMap(r => r.results)
          .sort((a, b) => (b.confidence || 0) - (a.confidence || 0));
        
        // Remove duplicates by path
        const uniqueResults: NavigationSuggestion[] = [];
        const seenPaths = new Set<string>();
        
        for (const suggestion of allSuggestions) {
          const pathWithSection = `${suggestion.path}#${suggestion.sectionId || ''}`;
          if (!seenPaths.has(pathWithSection)) {
            seenPaths.add(pathWithSection);
            uniqueResults.push(suggestion);
          }
        }
        
        return uniqueResults.slice(0, 3); // Limit to top 3 suggestions
      } catch (error) {
        console.error('Error generating navigation suggestions:', error);
      }
    }
    
    // If no topics found or search failed, perform a semantic search on the entire message
    try {
      const results = await search(content);
      return results.slice(0, 2); // Limit to top 2 for full-message search
    } catch (error) {
      console.error('Error in fallback search for navigation suggestions:', error);
      return [];
    }
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