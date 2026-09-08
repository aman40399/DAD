import { Article } from '@/types'
import { ArticleData } from '@/components/meridian/PostCard'
import { formatDate } from '@/lib/utils'

export function mapArticleToPostCard(article: Article): ArticleData {
  return {
    id: String(article.id),
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt,
    image: article.imageUrl || (article as any).image_url || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop&q=80',
    category: article.category || 'News',
    author: article.author || 'Dhananjay Singh',
    date: article.publishedAt
      ? new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : 'Recent',
    readTime: (article as any).readingTime ? `${(article as any).readingTime} min read` : '2 min read',
    isVideo: Boolean(article.videoUrl),
    rank: (article as any).rank,
  }
}
