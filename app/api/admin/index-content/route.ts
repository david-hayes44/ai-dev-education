import { NextRequest, NextResponse } from 'next/server'
import { contentIndexingService } from '@/lib/content-indexing-service'

// Admin endpoint to trigger content indexing
export async function POST(req: NextRequest) {
  try {
    // Basic auth check - in a real app, replace with proper auth
    const authHeader = req.headers.get('authorization')
    if (!process.env.ADMIN_API_KEY || !authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const token = authHeader.split(' ')[1]
    if (token !== process.env.ADMIN_API_KEY) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 403 })
    }
    
    // Get indexing options from request body
    const body = await req.json()
    const { useAPI = true, forceRefresh = false } = body
    
    // Check if we need to force a refresh
    if (!forceRefresh) {
      const stats = await contentIndexingService.getIndexingStats()
      
      // If content was indexed in the last hour, skip re-indexing
      if (stats.lastIndexed) {
        const lastIndexTime = new Date(stats.lastIndexed).getTime()
        const oneHourAgo = Date.now() - (60 * 60 * 1000)
        
        if (lastIndexTime > oneHourAgo) {
          return NextResponse.json({
            message: 'Content was indexed recently. Use forceRefresh=true to force re-indexing.',
            lastIndexed: stats.lastIndexed,
            stats
          })
        }
      }
    }
    
    // Trigger content indexing
    console.log('Starting content indexing with API:', useAPI)
    const result = await contentIndexingService.indexAllContent({ useAPI })
    
    return NextResponse.json({
      message: 'Content indexed successfully',
      result
    })
  } catch (error) {
    console.error('Error indexing content:', error)
    return NextResponse.json(
      { error: 'Failed to index content', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// Get current indexing stats
export async function GET(req: NextRequest) {
  try {
    // Basic auth check - in a real app, replace with proper auth
    const authHeader = req.headers.get('authorization')
    if (!process.env.ADMIN_API_KEY || !authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const token = authHeader.split(' ')[1]
    if (token !== process.env.ADMIN_API_KEY) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 403 })
    }
    
    // Get current indexing stats
    const stats = await contentIndexingService.getIndexingStats()
    
    return NextResponse.json({
      stats,
      lastIndexed: stats.lastIndexed 
        ? new Date(stats.lastIndexed).toLocaleString() 
        : 'Never',
      status: stats.lastIndexed ? 'Indexed' : 'Not indexed'
    })
  } catch (error) {
    console.error('Error getting indexing stats:', error)
    return NextResponse.json(
      { error: 'Failed to get indexing stats' },
      { status: 500 }
    )
  }
} 