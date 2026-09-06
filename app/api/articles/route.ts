import { NextResponse } from 'next/server'
import { getAllArticles, createArticle } from '@/lib/articles'
import { generateSlug } from '@/lib/utils'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/authOptions'

export const dynamic = 'force-dynamic'

// Get all articles
export async function GET() {
  try {
    const articles = await getAllArticles()
    return NextResponse.json({ articles })
  } catch (error) {
    console.error('Error fetching articles:', error)
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    )
  }
}

// Create new article
export async function POST(request: Request) {
  try {
    // Check NextAuth authentication via JWT token
    // Use getServerSession to check NextAuth session (matches debug page)
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      title,
      excerpt,
      content,
      author,
      category,
      imageUrl,
      videoUrl,
      featured,
      tags,
      homepagePosition,
      language,
    } = body

    // Validation
    if (!title || !excerpt || !content || !author || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Generate slug from title
    const slug = generateSlug(title)

    // Create article
    const article = await createArticle({
      title,
      slug,
      excerpt,
      content,
      author,
      category,
      imageUrl,
      videoUrl: videoUrl || null,
      featured: featured || false,
      publishedAt: new Date().toISOString(),
      tags: tags || [],
      homepagePosition: homepagePosition ?? 0,
      language: language || 'english',
    })

    if (!article) {
      return NextResponse.json(
        { error: 'Failed to create article' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      article,
    })
  } catch (error) {
    console.error('Error creating article:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
