import { MetadataRoute } from 'next'
import { getAllArticles } from '@/lib/articles'

export const revalidate = 300 // Revalidate every 5 minutes for news

export default async function newsSitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://chhkwa.com'

  // Fetch all articles
  const articles = await getAllArticles()
  
  // Filter articles from the last 2 days for Google News
  const twoDaysAgo = new Date()
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)
  
  const recentArticles = articles.filter(article => {
    const publishedDate = new Date(article.publishedAt || article.createdAt)
    return publishedDate >= twoDaysAgo
  })

  const articleUrls: MetadataRoute.Sitemap = recentArticles.map((article) => ({
    url: `${baseUrl}/article/${article.slug}`,
    lastModified: new Date(article.publishedAt || article.createdAt),
    changeFrequency: 'always',
    priority: 1.0,
  }))

  return articleUrls
}
