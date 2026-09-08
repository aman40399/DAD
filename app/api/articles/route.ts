import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import {
  getAllArticles,
  createArticle,
  generateUniqueArticleSlug,
  isSlugTaken,
  invalidateArticleCache,
} from '@/lib/articles'
import { generateSlug, resolveSlugCollision } from '@/lib/utils'
import {
  validateCreateArticle,
  formatArticleResponse,
} from '@/lib/validation'

export const dynamic = 'force-dynamic'

/**
 * GET /api/articles
 * Filter articles by status (all, published, draft, archived), category, search query, limit, offset
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl

    const statusParam = searchParams.get('status')
    const categoryParam = searchParams.get('category')
    const queryParam = searchParams.get('search') || searchParams.get('q')
    const featuredParam = searchParams.get('featured')
    const isBreakingParam = searchParams.get('is_breaking') || searchParams.get('isBreaking')
    const positionParam = searchParams.get('homepage_position') || searchParams.get('homepagePosition')

    const limitParam = parseInt(searchParams.get('limit') || '10', 10)
    const limit = isNaN(limitParam) ? 10 : Math.min(Math.max(1, limitParam), 100)

    const offsetParam = searchParams.get('offset')
    const pageParam = searchParams.get('page')
    let offset = 0
    if (offsetParam !== null) {
      const parsedOffset = parseInt(offsetParam, 10)
      offset = isNaN(parsedOffset) ? 0 : Math.max(0, parsedOffset)
    } else if (pageParam !== null) {
      const parsedPage = parseInt(pageParam, 10)
      const page = isNaN(parsedPage) ? 1 : Math.max(1, parsedPage)
      offset = (page - 1) * limit
    }

    const all = await getAllArticles()
    let filtered = all

    // Status filtering: 'all' returns all, otherwise filter by status
    if (statusParam && statusParam !== 'all') {
      filtered = filtered.filter(a => (a.status || 'draft') === statusParam)
    }

    // Category filter (case-insensitive)
    if (categoryParam) {
      const catLower = categoryParam.toLowerCase()
      filtered = filtered.filter(a => a.category?.toLowerCase() === catLower)
    }

    // Search query
    if (queryParam) {
      const qLower = queryParam.toLowerCase()
      filtered = filtered.filter(a =>
        a.title?.toLowerCase().includes(qLower) ||
        (a.subtitle && a.subtitle.toLowerCase().includes(qLower)) ||
        a.excerpt?.toLowerCase().includes(qLower) ||
        a.content?.toLowerCase().includes(qLower) ||
        a.author?.toLowerCase().includes(qLower) ||
        (Array.isArray(a.tags) && a.tags.some(t => t.toLowerCase().includes(qLower)))
      )
    }

    // Featured filter
    if (featuredParam !== null) {
      const isFeat = featuredParam === 'true'
      filtered = filtered.filter(a => Boolean(a.featured) === isFeat)
    }

    // Breaking filter
    if (isBreakingParam !== null) {
      const isBrk = isBreakingParam === 'true'
      filtered = filtered.filter(a => Boolean((a as any).is_breaking ?? (a as any).isBreaking) === isBrk)
    }

    // Homepage position filter
    if (positionParam !== null) {
      const posNum = parseInt(positionParam, 10)
      if (!isNaN(posNum)) {
        filtered = filtered.filter(a => ((a as any).homepage_position ?? (a as any).homepagePosition) === posNum)
      }
    }

    const total = filtered.length
    const paginated = filtered.slice(offset, offset + limit)
    const formatted = paginated.map(formatArticleResponse)

    return NextResponse.json({
      articles: formatted,
      total,
      limit,
      offset,
      page: Math.floor(offset / limit) + 1,
      totalPages: Math.ceil(total / limit) || 1,
    }, {
      headers: {
        'Cache-Control': 'no-store, max-age=0, must-revalidate',
      },
    })
  } catch (error: any) {
    console.error('Error in GET /api/articles:', error)
    return NextResponse.json(
      { error: 'Internal Server Error', message: error?.message || 'Failed to fetch articles' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/articles
 * Create article with input validation, unique transliterated slug generation, and persistence
 */
export async function POST(request: NextRequest) {
  try {
    let body: any
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Invalid JSON payload in request body' },
        { status: 400 }
      )
    }

    // Validate payload
    const validation = validateCreateArticle(body)
    if (!validation.isValid || !validation.data) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          message: 'Required fields are missing or invalid',
          details: validation.errors,
        },
        { status: 400 }
      )
    }

    const data = validation.data

    // Generate collision-resistant unique slug with Devanagari transliteration
    let uniqueSlug: string
    if (data.slug) {
      const baseSlug = generateSlug(data.slug) || 'story'
      uniqueSlug = await resolveSlugCollision(baseSlug, (s) => isSlugTaken(s))
    } else {
      uniqueSlug = await generateUniqueArticleSlug(data.title)
    }

    // Prepare create input
    const newArticleInput: any = {
      title: data.title,
      slug: uniqueSlug,
      subtitle: data.subtitle || '',
      excerpt: data.excerpt,
      content: data.content,
      author: 'Dhananjay Singh',
      category: data.category,
      imageUrl: data.image_url,
      image_url: data.image_url,
      imageCaption: data.image_caption || '',
      image_caption: data.image_caption || '',
      videoUrl: data.video_url || null,
      video_url: data.video_url || null,
      featured: data.featured,
      isBreaking: data.is_breaking,
      is_breaking: data.is_breaking,
      status: data.status,
      homepagePosition: data.homepage_position,
      homepage_position: data.homepage_position,
      publishedAt: data.status === 'published' ? (data.published_at || new Date().toISOString()) : null,
      published_at: data.status === 'published' ? (data.published_at || new Date().toISOString()) : null,
      tags: data.tags,
      language: data.language,
    }

    const created = await createArticle(newArticleInput)
    if (!created) {
      return NextResponse.json(
        { error: 'Internal Server Error', message: 'Failed to create article in storage' },
        { status: 500 }
      )
    }

    const formatted = formatArticleResponse(created)

    // Revalidate public pages and feeds
    try {
      invalidateArticleCache()
      revalidatePath('/', 'page')
      if (created.slug) revalidatePath(`/article/${created.slug}`, 'page')
      if (created.category) revalidatePath(`/section/${created.category.toLowerCase()}`, 'page')
      revalidatePath('/admin', 'page')
      revalidatePath('/admin/slots', 'page')
    } catch {}

    return NextResponse.json(
      {
        success: true,
        article: formatted,
        ...formatted,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Error in POST /api/articles:', error)
    return NextResponse.json(
      { error: 'Internal Server Error', message: error?.message || 'Failed to create article' },
      { status: 500 }
    )
  }
}
