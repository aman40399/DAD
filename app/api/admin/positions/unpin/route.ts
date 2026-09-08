import { NextRequest, NextResponse } from 'next/server'
import { getAllArticles, updateArticle } from '@/lib/articles'
import { Article } from '@/types'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { slotNumber } = body || {}
    const slot = Number(slotNumber)

    if (isNaN(slot) || slot < 1 || slot > 15) {
      return NextResponse.json(
        { error: 'Invalid slotNumber (must be 1-15)' },
        { status: 400 }
      )
    }

    const articles = await getAllArticles()
    const occupant = articles.find(
      (a: Article) => (a.homepage_position ?? (a as any).homepagePosition) === slot
    )

    let unpinned = false
    if (occupant) {
      await updateArticle(occupant.id, { homepage_position: null })
      unpinned = true
    }

    return NextResponse.json({ success: true, unpinned, slot })
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to unpin position' },
      { status: 500 }
    )
  }
}
