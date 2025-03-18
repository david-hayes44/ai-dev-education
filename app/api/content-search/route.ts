import { NextRequest, NextResponse } from 'next/server';
import { contentIndexingService } from '@/lib/content-indexing-service';

export async function GET(req: NextRequest) {
  try {
    // Parse search query from URL
    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get('query');
    const limit = parseInt(searchParams.get('limit') || '5', 10);
    
    if (!query) {
      return NextResponse.json(
        { error: 'Missing query parameter' },
        { status: 400 }
      );
    }
    
    // Ensure content is indexed
    if (!contentIndexingService.isIndexed) {
      await contentIndexingService.indexContent();
    }
    
    // Search for content chunks matching the query
    const results = contentIndexingService.search(query, limit);
    
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
    const { query, limit = 5, section } = body;
    
    if (!query) {
      return NextResponse.json(
        { error: 'Missing query parameter' },
        { status: 400 }
      );
    }
    
    // Ensure content is indexed
    if (!contentIndexingService.isIndexed) {
      await contentIndexingService.indexContent();
    }
    
    // Search for content chunks matching the query
    let results = contentIndexingService.search(query, limit);
    
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