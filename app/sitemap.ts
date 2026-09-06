import { MetadataRoute } from 'next'
import { getAllArticles } from '@/lib/articles'

export const revalidate = 3600 // Revalidate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://chhkwa.com'

  // Fetch all published articles
  const articles = await getAllArticles()

  const articleUrls: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${baseUrl}/article/${article.slug}`,
    lastModified: new Date(article.updatedAt || article.publishedAt),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  // Static sections
  const sections = ['world', 'technology', 'business', 'local', 'sports', 'opinion', 'arts', 'science', 'health', 'politics']
  const sectionUrls: MetadataRoute.Sitemap = sections.map((section) => ({
    url: `${baseUrl}/section/${section}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.9,
  }))

  // Get unique authors from articles
  const uniqueAuthors = Array.from(new Set(articles.map(a => a.author).filter(Boolean)))
  const authorUrls: MetadataRoute.Sitemap = uniqueAuthors.map((author) => ({
    url: `${baseUrl}/author/${author.toLowerCase().replace(/\s+/g, '-')}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.6,
  }))

  // Main pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.5,
    },
  ]

  return [
    ...staticPages,
    ...sectionUrls,
    ...authorUrls,
    ...articleUrls,
  ]
}

