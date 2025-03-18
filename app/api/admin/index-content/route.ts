import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { indexAllContent } from '@/lib/content-indexing-service'

export async function POST() {
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
    // Check if Open Router API key is available
    const openRouterApiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY
    const useAPI = !!openRouterApiKey
    
    // Trigger content indexing
    const result = await indexAllContent({ useAPI })
    
    // Revalidate any cached data
    revalidatePath('/admin/content')
    
    return NextResponse.json({
      success: true,
      pagesIndexed: result.pagesIndexed,
      chunksCreated: result.chunksCreated,
      vectorsStored: result.vectorsStored,
      useAPI
    })
  } catch (error) {
    console.error('Error indexing content:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to index content',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 