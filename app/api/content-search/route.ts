import { NextRequest, NextResponse } from 'next/server';
import { semanticSearch, keywordSearch, hybridSearch, contentIndexingService } from '@/lib/content-indexing-service';

export async function GET(req: NextRequest) {
  try {
    // Parse search query from URL
    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get('query');
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : 5;
    const section = searchParams.get('section') || undefined;
    const mode = searchParams.get('mode') || 'hybrid'; // 'hybrid', 'semantic', or 'keyword'
    
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
    
    // Perform search with the query based on mode
    let results;
    
    switch (mode) {
      case 'semantic':
        results = await semanticSearch(query, { 
          limit,
          section
        });
        break;
      case 'keyword':
        results = await keywordSearch(query, { 
          limit,
          section
        });
        break;
      case 'hybrid':
      default:
        results = await hybridSearch(query, { 
          limit,
          section
        });
        break;
    }
    
    return NextResponse.json({
      query,
      mode,
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

// Also handle POST requests for more complex search parameters
export async function POST(req: NextRequest) {
  try {
    // Parse search parameters from request body
    const body = await req.json();
    const { 
      query, 
      limit = 5, 
      section, 
      threshold = 0.5,
      mode = 'hybrid',
      weightVector = 0.7,
      weightKeyword = 0.3,
      boostFields = {
        title: 0.2,
        keywords: 0.1,
        priority: 0.05
      }
    } = body;
    
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
    
    // Perform search based on mode
    let results;
    
    switch (mode) {
      case 'semantic':
        results = await semanticSearch(query, { 
          limit, 
          threshold,
          section,
          boostFields
        });
        break;
      case 'keyword':
        results = await keywordSearch(query, { 
          limit, 
          threshold,
          section
        });
        break;
      case 'hybrid':
      default:
        results = await hybridSearch(query, { 
          limit, 
          threshold,
          section,
          weightVector,
          weightKeyword
        });
        break;
    }
    
    return NextResponse.json({
      query,
      mode,
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