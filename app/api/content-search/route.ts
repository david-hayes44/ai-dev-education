import { NextRequest, NextResponse } from 'next/server';
import { getIndexingStats, indexAllContent, hybridSearch } from '@/lib/content-indexing-service';
import { ContentChunk } from '@/lib/server-utils';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('query');
  
  // If no query is provided, return an error
  if (!query || query.trim().length === 0) {
    return NextResponse.json(
      { 
        error: 'A search query is required' 
      },
      { status: 400 }
    );
  }
  
  try {
    // Ensure content is indexed
    const stats = await getIndexingStats();
    
    if (!stats.lastIndexed) {
      // Index content if not already indexed
      await indexAllContent();
    }
    
    // Perform hybrid search (combining vector and keyword search)
    const results = await hybridSearch(query, {
      limit: 10,
      threshold: 0.3, // Minimum relevance score
      weightVector: 0.7, // Weight for vector search
      weightKeyword: 0.3, // Weight for keyword search
      useAPI: true // Use OpenRouter API for embeddings if available
    });
    
    return NextResponse.json({
      query,
      results
    });
  } catch (error) {
    console.error('Search error:', error);
    
    return NextResponse.json(
      { 
        error: 'An error occurred during search' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, options } = body;
    
    // If no query is provided, return an error
    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { 
          error: 'A search query is required' 
        },
        { status: 400 }
      );
    }
    
    // Default options
    const searchOptions = {
      limit: options?.limit || 10,
      threshold: options?.threshold || 0.3,
      section: options?.section || undefined,
      useAPI: options?.useAPI !== false, // Default to true
      weightVector: options?.weightVector || 0.7,
      weightKeyword: options?.weightKeyword || 0.3
    };
    
    // Ensure content is indexed
    const stats = await getIndexingStats();
    
    if (!stats.lastIndexed) {
      // Index content if not already indexed
      await indexAllContent();
    }
    
    // Perform hybrid search
    const results = await hybridSearch(
      query, 
      searchOptions
    );
    
    return NextResponse.json({
      query,
      options: searchOptions,
      results
    });
  } catch (error) {
    console.error('Search error:', error);
    
    return NextResponse.json(
      { 
        error: 'An error occurred during search' 
      },
      { status: 500 }
    );
  }
} 