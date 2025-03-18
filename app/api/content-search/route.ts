import { NextRequest, NextResponse } from 'next/server';
import { semanticSearch, contentIndexingService } from '@/lib/content-indexing-service';

export async function GET(req: NextRequest) {
  try {
    // Parse search query from URL
    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get('query');
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : 5;
    
    if (!query) {
      return NextResponse.json(
        { error: 'Missing query parameter' },
        { status: 400 }
      );
    }
    
    // Ensure content is indexed
    const indexingStats = await contentIndexingService.getIndexingStats();
    if (!indexingStats.lastIndexed) {
      await contentIndexingService.indexAllContent();
    }
    
    // Perform semantic search with the query
    const results = await semanticSearch(query, { limit });
    
    return NextResponse.json({
      query,
      results
    });
  } catch (error) {
    console.error('Content search error:', error);
    return NextResponse.json(
      { error: 'Failed to search content' },
      { status: 500 }
    );
  }
}

// Also handle POST requests for more complex search parameters
export async function POST(req: NextRequest) {
  try {
    // Parse search parameters from request body
    const body = await req.json();
    const { query, limit = 5, section, threshold = 0.5 } = body;
    
    if (!query) {
      return NextResponse.json(
        { error: 'Missing query parameter' },
        { status: 400 }
      );
    }
    
    // Ensure content is indexed
    const indexingStats = await contentIndexingService.getIndexingStats();
    if (!indexingStats.lastIndexed) {
      await contentIndexingService.indexAllContent();
    }
    
    // Perform semantic search with the query
    let results = await semanticSearch(query, { limit, threshold });
    
    // Filter by section if provided
    if (section) {
      results = results.filter(chunk => chunk.section === section);
    }
    
    return NextResponse.json({
      query,
      section,
      results
    });
  } catch (error) {
    console.error('Content search error:', error);
    return NextResponse.json(
      { error: 'Failed to search content' },
      { status: 500 }
    );
  }
} 