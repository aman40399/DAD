import { NextResponse } from 'next/server'
import { getAllArticles } from '@/lib/articles'
import { Article } from '@/types'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const articles = await getAllArticles()
    const slots = []
    
    for (let i = 1; i <= 15; i++) {
      const article = articles.find(
        (a: Article) => (a.homepage_position ?? (a as any).homepagePosition) === i
      )
      slots.push({
        slot: i,
        name: i === 1 ? 'Breaking Ticker' : i === 2 ? 'Lead Hero Story' : `Slot ${i}`,
        article: article ? { id: article.id, title: article.title, slug: article.slug } : null,
        isPinned: Boolean(article),
      })
    }

    return NextResponse.json({ slots, success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch positions' },
      { status: 500 }
    )
  }
}
