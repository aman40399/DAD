import { MetadataRoute } from 'next'
import { getAllArticles } from '@/lib/articles'

export const revalidate = 1800 // Revalidate every 30 minutes

const SECTIONS = [
  'world',
  'india',
  'politics',
  'economy',
  'business',
  'technology',
  'tech',
  'environment',
  'health',
  'science',
  'opinion',
  'us',
  'sports',
  'arts',
  'culture',
  'lifestyle',
  'video',
]

const TRUST_PAGES = [
  { path: '/about', priority: 0.9, changeFrequency: 'weekly' as const },
  { path: '/editorial-guidelines', priority: 0.85, changeFrequency: 'monthly' as const },
  { path: '/fact-checking', priority: 0.85, changeFrequency: 'monthly' as const },
  { path: '/corrections', priority: 0.85, changeFrequency: 'monthly' as const },
  { path: '/contact', priority: 0.85, changeFrequency: 'monthly' as const },
  { path: '/authors', priority: 0.85, changeFrequency: 'weekly' as const },
  { path: '/author/dhananjay-singh', priority: 0.85, changeFrequency: 'weekly' as const },
  { path: '/privacy', priority: 0.6, changeFrequency: 'monthly' as const },
  { path: '/privacy-policy', priority: 0.6, changeFrequency: 'monthly' as const },
  { path: '/terms', priority: 0.6, changeFrequency: 'monthly' as const },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://www.singh.monster').replace(/\/$/, '')

  // Load published articles first to derive authentic freshness timestamps
  let published: any[] = []
  try {
    const articles = await getAllArticles()
    published = (articles || []).filter((a) => a.status === 'published' && a.slug)
  } catch (err) {
    console.error('Error loading articles for sitemap:', err)
  }

  // Find latest publication/update date across all articles
  let newestArticleDate = new Date('2026-09-10T00:00:00.000Z')
  for (const a of published) {
    const raw = a.updated_at || a.published_at || a.created_at
    if (raw) {
      const d = new Date(raw)
      if (!isNaN(d.getTime()) && d > newestArticleDate) {
        newestArticleDate = d
      }
    }
  }

  // Stable baseline date for editorial policies and static pages
  const staticTrustDate = new Date('2026-09-10T12:00:00.000Z')

  const entries: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: newestArticleDate,
      changeFrequency: 'hourly',
      priority: 1.0,
    },
  ]

  // Add E-E-A-T high-authority trust and policy pages with stable dates
  for (const page of TRUST_PAGES) {
    entries.push({
      url: `${baseUrl}${page.path}`,
      lastModified: staticTrustDate,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    })
  }

  // Add category section pages with latest article date in each category
  for (const section of SECTIONS) {
    const secArticles = published.filter(
      (a) => (a.category || '').toLowerCase() === section.toLowerCase()
    )
    let secDate = staticTrustDate
    if (secArticles.length > 0) {
      const secRaw = secArticles[0].updated_at || secArticles[0].published_at || secArticles[0].created_at
      if (secRaw) {
        const d = new Date(secRaw)
        if (!isNaN(d.getTime())) secDate = d
      }
    }

    entries.push({
      url: `${baseUrl}/section/${section}`,
      lastModified: secDate,
      changeFrequency: 'daily',
      priority: 0.8,
    })
  }

  // Add all published articles
  for (const article of published) {
    const rawDate = article.updated_at || article.published_at || article.created_at || (article as any).updatedAt || (article as any).publishedAt
    let lastMod = staticTrustDate
    if (rawDate) {
      const d = new Date(rawDate)
      if (!isNaN(d.getTime())) lastMod = d
    }

    entries.push({
      url: `${baseUrl}/article/${encodeURIComponent(article.slug)}`,
      lastModified: lastMod,
      changeFrequency: article.is_breaking ? 'hourly' : 'daily',
      priority: article.is_breaking ? 0.95 : 0.85,
    })
  }

  return entries
}


