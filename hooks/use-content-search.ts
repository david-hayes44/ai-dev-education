import { useState, useCallback } from 'react';
import { ContentChunk } from '@/lib/content-indexing-service';

export interface UseContentSearchResult {
  searchContent: (query: string) => Promise<ContentChunk[]>;
  results: ContentChunk[] | null;
  isSearching: boolean;
  error: Error | null;
}

/**
 * Hook for searching content and retrieving relevant information
 */
export function useContentSearch(): UseContentSearchResult {
  const [results, setResults] = useState<ContentChunk[] | null>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const searchContent = useCallback(async (query: string): Promise<ContentChunk[]> => {
    if (!query.trim()) {
      setResults(null);
      return [];
    }

    setIsSearching(true);
    setError(null);

    try {
      const response = await fetch(`/api/content-search?query=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        throw new Error(`Search failed with status: ${response.status}`);
      }
      
      const data = await response.json();
      const contentResults = data.results || [];
      
      setResults(contentResults);
      return contentResults;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error during content search');
      setError(error);
      console.error('Error searching content:', error);
      return [];
    } finally {
      setIsSearching(false);
    }
  }, []);

  return {
    searchContent,
    results,
    isSearching,
    error
  };
}

export default useContentSearch; 