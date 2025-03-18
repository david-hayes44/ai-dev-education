import { NextRequest, NextResponse } from 'next/server';
import { vectorEmbeddingService } from '@/lib/vector-embedding-service';

/**
 * Semantic search API endpoint
 * Performs vector-based semantic search across content
 */
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
    
    // Ensure vector embedding service is initialized
    if (!vectorEmbeddingService.isInitialized) {
      try {
        await vectorEmbeddingService.initialize();
      } catch (error) {
        console.error('Error initializing vector embedding service:', error);
        return NextResponse.json(
          { error: 'Failed to initialize vector embedding service' },
          { status: 500 }
        );
      }
    }
    
    // Perform semantic search
    const results = await vectorEmbeddingService.semanticSearch(query, limit);
    
    return NextResponse.json({
      query,
      results: results.map(result => ({
        ...result.chunk,
        score: result.score,
        // Remove the embedding from the response to reduce payload size
        embedding: undefined
      }))
    });
  } catch (error) {
    console.error('Semantic search error:', error);
    return NextResponse.json(
      { error: 'Failed to perform semantic search' },
      { status: 500 }
    );
  }
}

/**
 * API endpoint for retrieving related content
 */
export async function POST(req: NextRequest) {
  try {
    // Parse parameters from request body
    const body = await req.json();
    const { chunkId, limit = 3 } = body;
    
    if (!chunkId) {
      return NextResponse.json(
        { error: 'Missing chunkId parameter' },
        { status: 400 }
      );
    }
    
    // Ensure vector embedding service is initialized
    if (!vectorEmbeddingService.isInitialized) {
      try {
        await vectorEmbeddingService.initialize();
      } catch (error) {
        console.error('Error initializing vector embedding service:', error);
        return NextResponse.json(
          { error: 'Failed to initialize vector embedding service' },
          { status: 500 }
        );
      }
    }
    
    // Get related content
    const results = vectorEmbeddingService.getRelatedContent(chunkId, limit);
    
    return NextResponse.json({
      chunkId,
      results: results.map(result => ({
        ...result.chunk,
        score: result.score,
        // Remove the embedding from the response to reduce payload size
        embedding: undefined
      }))
    });
  } catch (error) {
    console.error('Related content error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve related content' },
      { status: 500 }
    );
  }
} 