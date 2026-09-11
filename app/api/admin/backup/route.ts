import { NextRequest, NextResponse } from 'next/server'
import { getAllArticles, invalidateArticleCache } from '@/lib/articles'
import { saveArticlesToR2, loadArticlesFromR2 } from '@/lib/r2Storage'
import { localStore } from '@/lib/localStore'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/backup
 * Download current complete snapshot of all articles
 */
export async function GET() {
  try {
    const articles = await getAllArticles()
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `singh-monster-articles-backup-${timestamp}.json`

    return new NextResponse(JSON.stringify(articles, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store, max-age=0',
      },
    })
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to create backup', message: error.message }, { status: 500 })
  }
}

/**
 * POST /api/admin/backup
 * Restore or overwrite articles from a JSON backup
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    if (!Array.isArray(body) || body.length === 0) {
      return NextResponse.json({ error: 'Invalid backup format. Expected a non-empty array of articles.' }, { status: 400 })
    }

    // Save directly to R2
    await saveArticlesToR2(body)
    localStore.setAll(body)
    invalidateArticleCache()

    return NextResponse.json({
      success: true,
      message: `Successfully restored ${body.length} articles to Cloudflare R2 and memory store.`,
      count: body.length,
    })
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to restore backup', message: error.message }, { status: 500 })
  }
}
