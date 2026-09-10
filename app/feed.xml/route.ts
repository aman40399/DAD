import { NextResponse } from 'next/server'
import { getAllArticles } from '@/lib/articles'

export const dynamic = 'force-dynamic'

function escapeXml(unsafe: string): string {
  return (unsafe || '').replace(/[<>&'"]/g, (c) => {
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

function cleanCdata(text: string): string {
  return (text || '').replace(/]]>/g, ']]]]><![CDATA[>')
}

export async function GET() {
  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://www.singh.monster').replace(/\/$/, '')

  try {
    const articles = await getAllArticles()
    const published = articles.filter((a) => a.status === 'published' && a.slug)

    // Sort newest first
    published.sort((a, b) => {
      const dateA = new Date(a.published_at || a.created_at || 0).getTime()
      const dateB = new Date(b.published_at || b.created_at || 0).getTime()
      return dateB - dateA
    })

    const buildDate = new Date().toUTCString()

    const itemsXml = published.slice(0, 50).map((article) => {
      const pubDate = new Date(article.published_at || article.created_at || new Date()).toUTCString()
      const link = `${baseUrl}/article/${article.slug}`
      const heroImage = article.image_url || article.imageUrl || `${baseUrl}/logo.png`
      const author = article.author || 'Dhananjay Singh'
      const category = article.category || 'News'
      const excerpt = article.excerpt || article.subtitle || ''
      const cleanContent = (article.content || '').replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')

      return `    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${pubDate}</pubDate>
      <dc:creator><![CDATA[${cleanCdata(author)}]]></dc:creator>
      <category><![CDATA[${cleanCdata(category)}]]></category>
      <description><![CDATA[${cleanCdata(excerpt)}]]></description>
      <content:encoded><![CDATA[${cleanCdata(cleanContent)}]]></content:encoded>
      <enclosure url="${escapeXml(heroImage)}" type="image/jpeg" length="0" />
      <media:content url="${escapeXml(heroImage)}" medium="image">
        <media:title><![CDATA[${cleanCdata(article.title)}]]></media:title>
      </media:content>
    </item>`
    }).join('\n')

    const feedXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
     xmlns:atom="http://www.w3.org/2005/Atom"
     xmlns:content="http://purl.org/rss/1.0/modules/content/"
     xmlns:dc="http://purl.org/dc/elements/1.1/"
     xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>Singh Monster</title>
    <link>${baseUrl}</link>
    <description>Sharp reporting. Deep analysis. No agenda but the truth. Discover world news, politics, business, technology, sports, and investigative reporting led by Dhananjay Singh.</description>
    <language>en-US</language>
    <lastBuildDate>${buildDate}</lastBuildDate>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml" />
    <image>
      <url>${baseUrl}/logo.png</url>
      <title>Singh Monster</title>
      <link>${baseUrl}</link>
      <width>144</width>
      <height>144</height>
    </image>
    <copyright>© ${new Date().getFullYear()} Singh Monster. All rights reserved.</copyright>
    <docs>https://www.rssboard.org/rss-specification</docs>
${itemsXml}
  </channel>
</rss>`

    return new NextResponse(feedXml, {
      status: 200,
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=1800, s-maxage=1800, stale-while-revalidate=86400',
      },
    })
  } catch (error) {
    console.error('Error generating RSS feed:', error)
    return new NextResponse('Error generating RSS feed', { status: 500 })
  }
}
