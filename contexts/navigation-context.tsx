"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { usePathname } from "next/navigation";

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
  currentPage: CurrentPageContext | null;
  recommendations: NavigationRecommendation[];
  isLoading: boolean;
  search: (query: string) => Promise<NavigationRecommendation[]>;
  getCurrentPageContent: () => Promise<CurrentPageContext | null>;
}

// Create the context
const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

// Create provider component
export function NavigationProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [currentPage, setCurrentPage] = useState<CurrentPageContext | null>(null);
  const [recommendations, setRecommendations] = useState<NavigationRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load current page context whenever the pathname changes
  useEffect(() => {
    if (pathname) {
      getCurrentPageContent();
    }
  }, [pathname]);

  // Function to search for content
  const search = useCallback(async (query: string): Promise<NavigationRecommendation[]> => {
    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/content?q=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        throw new Error(`Search request failed: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Map API results to recommendations with confidence score
      const recommendations: NavigationRecommendation[] = data.results.map(
        (result: {
          path: string;
          title: string;
          description?: string;
          summary?: string;
        }, index: number) => ({
          path: result.path,
          title: result.title,
          description: result.description,
          summary: result.summary,
          // Simple confidence score based on position in results array (0.95 to 0.5)
          confidence: Math.max(0.5, 0.95 - index * 0.05),
        })
      );
      
      setRecommendations(recommendations);
      return recommendations;
    } catch (error) {
      console.error("Error searching content:", error);
      setRecommendations([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Function to get current page content
  const getCurrentPageContent = useCallback(async (): Promise<CurrentPageContext | null> => {
    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/content?path=${encodeURIComponent(pathname)}`);
      
      if (!response.ok) {
        // Just silently fail for missing content
        if (response.status === 404) {
          setCurrentPage({
            path: pathname,
          });
          return null;
        }
        
        throw new Error(`Page context request failed: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      const pageContext: CurrentPageContext = {
        path: pathname,
        title: data.title,
        description: data.description,
        content: data.content,
        keywords: data.keywords,
        relatedPaths: data.relatedPaths,
      };
      
      setCurrentPage(pageContext);
      return pageContext;
    } catch (error) {
      console.error("Error getting page context:", error);
      
      // Set minimal page context on error
      setCurrentPage({
        path: pathname,
      });
      
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [pathname]);

  return (
    <NavigationContext.Provider
      value={{
        currentPage,
        recommendations,
        isLoading,
        search,
        getCurrentPageContent,
      }}
    >
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