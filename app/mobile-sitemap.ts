import { MetadataRoute } from 'next'
import { getAllArticles } from '@/lib/articles'

export const revalidate = 3600 // Revalidate every hour

// Mobile-optimized sitemap with additional priority for mobile-first indexing
export default async function mobileSitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://chhkwa.com'

  // Fetch all published articles
  const articles = await getAllArticles()

  // Mobile-optimized article URLs - prioritize recent and popular content
  const articleUrls: MetadataRoute.Sitemap = articles.map((article, index) => ({
    url: `${baseUrl}/article/${article.slug}`,
    lastModified: new Date(article.updatedAt || article.publishedAt),
    changeFrequency: index < 10 ? 'hourly' : 'weekly', // Recent articles change more frequently
    priority: index < 5 ? 1.0 : index < 20 ? 0.9 : 0.8, // Higher priority for recent
  }))

  // Mobile-optimized section pages
  const sections = ['world', 'technology', 'business', 'local', 'sports', 'opinion', 'arts', 'science', 'health', 'politics']
  const sectionUrls: MetadataRoute.Sitemap = sections.map((section) => ({
    url: `${baseUrl}/section/${section}`,
    lastModified: new Date(),
    changeFrequency: 'hourly',
    priority: 0.95,
  }))

  // Homepage with highest priority
  const homepage: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 1.0,
    },
  ]

  return [
    ...homepage,
    ...sectionUrls,
    ...articleUrls,
  ]
}
