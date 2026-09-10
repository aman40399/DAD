import { MetadataRoute } from 'next'
import { getAllArticles } from '@/lib/articles'

export const revalidate = 1800 // Revalidate every 30 minutes

const SECTIONS = [
  'world',
  'india',
  'politics',
  'business',
  'technology',
  'tech',
  'sports',
  'opinion',
  'economy',
  'science',
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

  const entries: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 1.0,
    },
  ]

  // Add E-E-A-T high-authority trust and policy pages
  for (const page of TRUST_PAGES) {
    entries.push({
      url: `${baseUrl}${page.path}`,
      lastModified: new Date(),
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    })
  }

  // Add category section pages
  for (const section of SECTIONS) {
    entries.push({
      url: `${baseUrl}/section/${section}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    })
  }

  // Add all published articles
  try {
    const articles = await getAllArticles()
    const published = articles.filter((a) => a.status === 'published' && a.slug)

    for (const article of published) {
      const rawDate = article.updated_at || article.published_at || article.created_at || (article as any).updatedAt || (article as any).publishedAt
      let lastMod = new Date()
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
  } catch (err) {
    console.error('Error generating dynamic sitemap articles:', err)
  }

  return entries
}


