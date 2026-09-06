import { NextResponse } from 'next/server'
import { getHomepageArticles } from '@/lib/articles'

export const dynamic = 'force-dynamic' // Disable caching
export const revalidate = 0 // Always fetch fresh data

// Get all homepage articles (positions 1-20)
export async function GET() {
  try {
    const articles = await getHomepageArticles()
    
    return NextResponse.json(
      { articles },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    )
  } catch (error) {
    console.error('Error fetching homepage articles:', error)
    return NextResponse.json(
      { error: 'Failed to fetch homepage articles' },
      { status: 500 }
    )
  }
}
