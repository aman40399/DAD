import { NextResponse } from 'next/server'
import { getAllArticles } from '@/lib/articles'

export const dynamic = 'force-dynamic'

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;'
      case '>': return '&gt;'
      case '&': return '&amp;'
      case '\'': return '&apos;'
      case '"': return '&quot;'
      default: return c
    }
  })
}

export async function GET() {
  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://www.singh.monster').replace(/\/$/, '')

  try {
    const articles = await getAllArticles()
    const published = articles.filter((a) => a.status === 'published' && a.slug)

    // Sort descending by publication date
    published.sort((a, b) => {
      const dateA = new Date(a.published_at || a.created_at || 0).getTime()
      const dateB = new Date(b.published_at || b.created_at || 0).getTime()
      return dateB - dateA
    })

    // Google News sitemaps prioritize articles from the last 48 hours to 7 days
    const now = Date.now()
    const recentNews = published.filter((a) => {
      const d = new Date(a.published_at || a.created_at || '').getTime()
      return !isNaN(d) && now - d < 7 * 24 * 60 * 60 * 1000 // Last 7 days
    })

    const targetArticles = recentNews.length > 0 ? recentNews : published.slice(0, 50)

    const xmlItems = targetArticles.map((article) => {
      const pubDate = new Date(article.published_at || article.created_at || new Date()).toISOString()
      const keywords = (article.tags || []).concat([article.category, 'Singh Monster']).join(', ')

      // Determine correct ISO 639-1 language code
      const isHindi =
        article.language === 'hindi' ||
        /[\u0900-\u097F]/.test(article.title || '') ||
        /[\u0900-\u097F]/.test(article.excerpt || '')
      const langCode = isHindi ? 'hi' : 'en'

      return `  <url>
    <loc>${baseUrl}/article/${encodeURIComponent(article.slug)}</loc>
    <news:news>
      <news:publication>
        <news:name>Singh Monster</news:name>
        <news:language>${langCode}</news:language>
      </news:publication>
      <news:publication_date>${pubDate}</news:publication_date>
      <news:title>${escapeXml(article.title)}</news:title>
      <news:keywords>${escapeXml(keywords)}</news:keywords>
    </news:news>
  </url>`
    }).join('\n')

    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${xmlItems}
</urlset>`

    return new NextResponse(sitemapXml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=1800, s-maxage=1800, stale-while-revalidate=86400',
      },
    })
  } catch (error) {
    console.error('Error generating Google News sitemap:', error)
    return new NextResponse('Error generating sitemap', { status: 500 })
  }
}
