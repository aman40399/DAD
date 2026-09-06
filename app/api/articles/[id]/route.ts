import { NextResponse } from 'next/server'
import { updateArticle, deleteArticle, getArticleById } from '@/lib/articles'
import { supabase } from '@/lib/supabase'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/authOptions'

export const dynamic = 'force-dynamic'

// Get single article
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const article = await getArticleById(params.id)
    
    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ article })
  } catch (error) {
    console.error('Error fetching article:', error)
    return NextResponse.json(
      { error: 'Failed to fetch article' },
      { status: 500 }
    )
  }
}

// Update article
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication with NextAuth
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    // If updating homepagePosition, we need to handle position swapping
    if (body.homepagePosition !== undefined && body.homepagePosition > 0) {
      // First, find any article currently at this position
      const { data: existingArticle } = await supabase
        .from('articles')
        .select('id')
        .eq('homepage_position', body.homepagePosition)
        .neq('id', params.id)
        .single()

      // If there's an existing article, move it to archive (position 0)
      if (existingArticle) {
        await supabase
          .from('articles')
          .update({ homepage_position: 0 })
          .eq('id', existingArticle.id)
      }
    }

    const article = await updateArticle(params.id, body)

    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      article,
    })
  } catch (error) {
    console.error('Error updating article:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Delete article
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication with NextAuth
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const success = await deleteArticle(params.id)

    if (!success) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Article deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting article:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
