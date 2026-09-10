import { NextResponse } from 'next/server'
import { getAllArticles } from '@/lib/articles'
import { submitToIndexNow, pingSitemaps } from '@/lib/indexnow'

export const dynamic = 'force-dynamic'

export async function POST() {
  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://www.singh.monster').replace(/\/$/, '')

  try {
    const articles = await getAllArticles()
    const published = articles.filter((a) => a.status === 'published' && a.slug)

    const urls: string[] = [
      baseUrl,
      `${baseUrl}/about`,
      `${baseUrl}/contact`,
      `${baseUrl}/editorial-guidelines`,
      `${baseUrl}/fact-checking`,
      `${baseUrl}/corrections`,
      `${baseUrl}/authors`,
      `${baseUrl}/author/dhananjay-singh`,
      `${baseUrl}/privacy`,
      `${baseUrl}/terms`,
      `${baseUrl}/section/world`,
      `${baseUrl}/section/india`,
      `${baseUrl}/section/politics`,
      `${baseUrl}/section/business`,
      `${baseUrl}/section/technology`,
      `${baseUrl}/section/sports`,
      `${baseUrl}/section/opinion`,
      `${baseUrl}/section/economy`,
      `${baseUrl}/section/science`,
    ]

    for (const art of published) {
      urls.push(`${baseUrl}/article/${art.slug}`)
    }

    const [indexNowResults, sitemapResults] = await Promise.all([
      submitToIndexNow(urls),
      pingSitemaps(),
    ])

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      totalUrlsSubmitted: urls.length,
      indexNow: indexNowResults,
      sitemaps: sitemapResults,
    })
  } catch (error: any) {
    console.error('Error pinging search engines:', error)
    return NextResponse.json(
      { error: 'Internal Server Error', message: error?.message || 'Failed to ping engines' },
      { status: 500 }
    )
  }
}
