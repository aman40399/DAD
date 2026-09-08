import { NextRequest, NextResponse } from 'next/server'
import { getAllArticles, getArticleById, updateArticle } from '@/lib/articles'
import { Article } from '@/types'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { articleId, slotNumber } = body || {}
    const slot = Number(slotNumber)

    if (!articleId || isNaN(slot) || slot < 1 || slot > 15) {
      return NextResponse.json(
        { error: 'Invalid slotNumber (must be 1-15) or missing articleId' },
        { status: 400 }
      )
    }

    const article = await getArticleById(String(articleId))
    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    // If another article occupies this slot, release it first
    const articles = await getAllArticles()
    const occupant = articles.find(
      (a: Article) => (a.homepage_position ?? (a as any).homepagePosition) === slot && a.id !== String(articleId)
    )
    if (occupant) {
      await updateArticle(occupant.id, { homepage_position: null })
    }

    // Pin the target article
    const updated = await updateArticle(String(articleId), { homepage_position: slot })

    return NextResponse.json({ success: true, slot, articleId, article: updated })
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to pin position' },
      { status: 500 }
    )
  }
}
