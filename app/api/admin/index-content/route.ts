'use server';

import { NextRequest, NextResponse } from 'next/server'
import { indexAllContent, getIndexingStats } from '@/lib/content-indexing-service'
import { ContentChunk } from '@/lib/server-utils'

/**
 * Admin API endpoint for triggering content indexing
 */
export async function POST(request: NextRequest) {
  try {
    // Simple auth check - basic security measure
    const authHeader = request.headers.get('authorization')
    const apiKey = process.env.ADMIN_API_KEY
    
    if (!apiKey || !authHeader || !authHeader.startsWith('Bearer ') || authHeader.slice(7) !== apiKey) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Get options from request
    const body = await request.json()
    const { useAPI = true } = body
    
    // Trigger content indexing
    const result = await indexAllContent({ useAPI })
    
    return NextResponse.json({
      success: true,
      message: 'Content indexed successfully',
      stats: result
    })
  } catch (error) {
    console.error('Content indexing error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to index content',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * Get indexing stats
 */
export async function GET(request: NextRequest) {
  try {
    // Simple auth check - basic security measure
    const authHeader = request.headers.get('authorization')
    const apiKey = process.env.ADMIN_API_KEY
    
    if (!apiKey || !authHeader || !authHeader.startsWith('Bearer ') || authHeader.slice(7) !== apiKey) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Get indexing stats
    const stats = await getIndexingStats()
    
    return NextResponse.json({
      success: true,
      stats
    })
  } catch (error) {
    console.error('Error getting indexing stats:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to retrieve indexing stats',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 