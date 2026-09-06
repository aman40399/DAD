import { NextResponse } from 'next/server'
import { swapArticlePositions } from '@/lib/articles'
import { cookies } from 'next/headers'

// Swap positions of two articles
export async function POST(request: Request) {
  try {
    // Check authentication
    const session = cookies().get('admin_session')
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { id1, id2 } = body

    if (!id1 || !id2) {
      return NextResponse.json(
        { error: 'Both article IDs are required' },
        { status: 400 }
      )
    }

    const success = await swapArticlePositions(id1, id2)

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to swap positions' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Positions swapped successfully',
    })
  } catch (error) {
    console.error('Error swapping positions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
