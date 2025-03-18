import { NextResponse } from 'next/server'
import { getIndexingStats } from '@/lib/content-indexing-service'

export async function GET() {
  // Only allow in development or with proper authentication in production
  if (process.env.NODE_ENV === 'production') {
    const isAuthorized = false // TODO: Implement proper admin auth check
    
    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      )
    }
  }
  
  try {
    // Get content indexing stats
    const stats = await getIndexingStats()
    
    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching indexing stats:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch indexing stats',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 