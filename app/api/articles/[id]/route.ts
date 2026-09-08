import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import {
  getArticleById,
  getArticleBySlug,
  updateArticle,
  deleteArticle,
  isSlugTaken,
  generateUniqueArticleSlug,
  invalidateArticleCache,
} from '@/lib/articles'
import { generateSlug, resolveSlugCollision } from '@/lib/utils'
import {
  validateUpdateArticle,
  formatArticleResponse,
} from '@/lib/validation'

export const dynamic = 'force-dynamic'

/**
 * Helper to look up an article by ID or slug
 */
async function findArticle(idOrSlug: string) {
  let article = await getArticleById(idOrSlug)
  if (!article) {
    article = await getArticleBySlug(idOrSlug)
  }
  return article
}

/**
 * GET /api/articles/[id]
 * Fetch single article by ID or slug, enforcing draft gating for public reader
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing article identifier' },
        { status: 400 }
      )
    }

    const article = await findArticle(id)
    if (!article) {
      return NextResponse.json(
        { error: 'Article not found', message: `Article '${id}' does not exist` },
        { status: 404 }
      )
    }

    // Draft gating check: unpublished drafts require ?preview=true or admin authentication
    const isDraft = (article.status || 'draft') === 'draft'
    const isPreview = request.nextUrl.searchParams.get('preview') === 'true'
    const hasAuth = Boolean(
      request.headers.get('authorization') ||
      request.cookies.get('admin_session')?.value
    )

    if (isDraft && !isPreview && !hasAuth) {
      return NextResponse.json(
        { error: 'Article not found', message: 'Article is unpublished' },
        { status: 404 }
      )
    }

    const formatted = formatArticleResponse(article)
    return NextResponse.json({
      article: formatted,
      ...formatted,
    })
  } catch (error: any) {
    console.error('Error in GET /api/articles/[id]:', error)
    return NextResponse.json(
      { error: 'Internal Server Error', message: error?.message || 'Failed to fetch article' },
      { status: 500 }
    )
  }
}

/**
 * PUT / PATCH /api/articles/[id]
 * Update article fields, regenerate transliterated slug if title changed, toggle status
 */
async function handleUpdate(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing article identifier' },
        { status: 400 }
      )
    }

    const existing = await findArticle(id)
    if (!existing) {
      return NextResponse.json(
        { error: 'Article not found', message: `Article '${id}' does not exist` },
        { status: 404 }
      )
    }

    let body: any
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Invalid JSON payload in request body' },
        { status: 400 }
      )
    }

    const validation = validateUpdateArticle(body)
    if (!validation.isValid || !validation.data) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          message: 'Invalid update payload',
          details: validation.errors,
        },
        { status: 400 }
      )
    }

    const data = validation.data
    const updates: any = {}

    // Title & Slug handling with collision resolution
    if (data.title !== undefined) {
      updates.title = data.title
      if (data.slug === undefined && data.title !== existing.title) {
        updates.slug = await generateUniqueArticleSlug(data.title, existing.id)
      }
    }

    if (data.slug !== undefined) {
      const baseSlug = generateSlug(data.slug) || 'story'
      updates.slug = await resolveSlugCollision(baseSlug, (s) => isSlugTaken(s, existing.id))
    }

    // Other core fields
    if (data.subtitle !== undefined) updates.subtitle = data.subtitle
    if (data.excerpt !== undefined) updates.excerpt = data.excerpt
    if (data.content !== undefined) updates.content = data.content
    updates.author = 'Dhananjay Singh'
    if (data.category !== undefined) updates.category = data.category
    if (data.image_url !== undefined) {
      updates.imageUrl = data.image_url
      updates.image_url = data.image_url
    }
    if (data.image_caption !== undefined) {
      updates.imageCaption = data.image_caption
      updates.image_caption = data.image_caption
    }
    if (data.video_url !== undefined) {
      updates.videoUrl = data.video_url
      updates.video_url = data.video_url
    }
    if (data.featured !== undefined) updates.featured = data.featured
    if (data.is_breaking !== undefined) {
      updates.isBreaking = data.is_breaking
      updates.is_breaking = data.is_breaking
    }
    if (data.homepage_position !== undefined) {
      updates.homepagePosition = data.homepage_position
      updates.homepage_position = data.homepage_position
    }
    if (data.tags !== undefined) updates.tags = data.tags
    if (data.language !== undefined) updates.language = data.language

    // Status transition & published_at semantics
    if (data.status !== undefined) {
      updates.status = data.status
      if (data.status === 'published') {
        const existingPub = (existing as any).published_at || (existing as any).publishedAt
        if (!existingPub && !data.published_at) {
          const now = new Date().toISOString()
          updates.publishedAt = now
          updates.published_at = now
        } else if (data.published_at) {
          updates.publishedAt = data.published_at
          updates.published_at = data.published_at
        }
      } else if (data.status === 'draft') {
        // Reset pinned position when unpublishing/drafting
        updates.homepagePosition = null
        updates.homepage_position = null
      }
    } else if (data.published_at !== undefined) {
      updates.publishedAt = data.published_at
      updates.published_at = data.published_at
    }

    updates.updatedAt = new Date().toISOString()
    updates.updated_at = new Date().toISOString()

    const updated = await updateArticle(existing.id, updates)
    if (!updated) {
      return NextResponse.json(
        { error: 'Internal Server Error', message: 'Failed to update article in storage' },
        { status: 500 }
      )
    }

    const formatted = formatArticleResponse(updated)

    // Revalidate public pages and feeds
    try {
      invalidateArticleCache()
      revalidatePath('/', 'page')
      if (existing.slug) revalidatePath(`/article/${existing.slug}`, 'page')
      if (updated.slug) revalidatePath(`/article/${updated.slug}`, 'page')
      if (updated.category) revalidatePath(`/section/${updated.category.toLowerCase()}`, 'page')
      revalidatePath('/admin', 'page')
      revalidatePath('/admin/slots', 'page')
    } catch {}

    return NextResponse.json({
      success: true,
      article: formatted,
      ...formatted,
    })
  } catch (error: any) {
    console.error('Error in PUT/PATCH /api/articles/[id]:', error)
    return NextResponse.json(
      { error: 'Internal Server Error', message: error?.message || 'Failed to update article' },
      { status: 500 }
    )
  }
}

export const PUT = handleUpdate
export const PATCH = handleUpdate

/**
 * DELETE /api/articles/[id]
 * Delete article record
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing article identifier' },
        { status: 400 }
      )
    }

    const existing = await findArticle(id)
    if (!existing) {
      return NextResponse.json(
        { error: 'Article not found', message: `Article '${id}' does not exist` },
        { status: 404 }
      )
    }

    const deleted = await deleteArticle(existing.id)
    if (!deleted) {
      return NextResponse.json(
        { error: 'Internal Server Error', message: 'Failed to delete article' },
        { status: 500 }
      )
    }

    try {
      invalidateArticleCache()
      revalidatePath('/', 'page')
      if (existing.slug) revalidatePath(`/article/${existing.slug}`, 'page')
      if (existing.category) revalidatePath(`/section/${existing.category.toLowerCase()}`, 'page')
      revalidatePath('/admin', 'page')
      revalidatePath('/admin/slots', 'page')
    } catch {}

    return NextResponse.json({
      success: true,
      message: 'Article deleted successfully',
      id: existing.id,
    })
  } catch (error: any) {
    console.error('Error in DELETE /api/articles/[id]:', error)
    return NextResponse.json(
      { error: 'Internal Server Error', message: error?.message || 'Failed to delete article' },
      { status: 500 }
    )
  }
}
