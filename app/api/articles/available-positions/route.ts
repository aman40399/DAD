import { NextResponse } from 'next/server'
import { getAvailablePositions } from '@/lib/articles'

export const dynamic = 'force-dynamic'

// Get available (unassigned) homepage positions
export async function GET() {
  try {
    const positions = await getAvailablePositions()
    
    return NextResponse.json({ positions })
  } catch (error) {
    console.error('Error fetching available positions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch available positions' },
      { status: 500 }
    )
  }
}
