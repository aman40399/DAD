import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Metadata } from 'next'
import { getArticleBySlug, getRecentArticles } from '@/lib/articles'
import { formatDate, extractYouTubeVideoId } from '@/lib/utils'
import YouTubeEmbed from '@/components/YouTubeEmbed'
import { ArticleSchema, BreadcrumbSchema } from '@/components/StructuredData'

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const article = await getArticleBySlug(params.slug)
  
  if (!article) {
    return {
      title: 'Article Not Found',
    }
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const articleUrl = `${baseUrl}/article/${article.slug}`

  return {
    title: article.title,
    description: article.excerpt || article.content.substring(0, 160).replace(/<[^>]*>/g, ''),
    keywords: article.tags || [],
    authors: [{ name: article.author }],
    openGraph: {
      type: 'article',
      url: articleUrl,
      title: article.title,
      description: article.excerpt || article.content.substring(0, 160).replace(/<[^>]*>/g, ''),
      images: article.imageUrl ? [
        {
          url: article.imageUrl,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ] : [],
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      authors: [article.author],
      section: article.category,
      tags: article.tags || [],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt || article.content.substring(0, 160).replace(/<[^>]*>/g, ''),
      images: article.imageUrl ? [article.imageUrl] : [],
      creator: '@chhkwa',
    },
    alternates: {
      canonical: articleUrl,
    },
    robots: {
      index: true,
      follow: true,
      nocache: false,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    other: {
      'article:published_time': article.publishedAt,
      'article:modified_time': article.updatedAt,
      'article:author': article.author,
      'article:section': article.category,
      'article:tag': article.tags?.join(', ') || '',
      'og:type': 'article',
      'og:site_name': 'Chhkwa',
      'news_keywords': article.tags?.join(', ') || article.category,
      'mobile-web-app-capable': 'yes',
    },
  }
}

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const article = await getArticleBySlug(params.slug)
  
  if (!article) {
    notFound()
  }

  const relatedArticles = await getRecentArticles(4)
  const filteredRelated = relatedArticles.filter(a => a.id !== article.id).slice(0, 3)

  // Breadcrumb data
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const breadcrumbItems = [
    { name: 'Home', url: baseUrl },
    { name: article.category, url: `${baseUrl}/section/${article.category.toLowerCase()}` },
    { name: article.title, url: `${baseUrl}/article/${article.slug}` }
  ]

  return (
    <>
      <ArticleSchema article={article} url={baseUrl} />
      <BreadcrumbSchema items={breadcrumbItems} />
      <main className="min-h-screen bg-white dark:bg-neutral-900">
      <article className="max-w-4xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm text-neutral-600 dark:text-neutral-400">
            <li>
              <Link href="/" className="hover:text-neutral-900 dark:hover:text-white">
                Home
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link href={`/section/${article.category.toLowerCase()}`} className="hover:text-neutral-900 dark:hover:text-white">
                {article.category}
              </Link>
            </li>
            <li>/</li>
            <li className="text-neutral-900 dark:text-white font-semibold truncate">
              {article.title}
            </li>
          </ol>
        </nav>

        {/* Category Badge */}
        <div className="mb-4">
          <Link
            href={`/section/${article.category.toLowerCase()}`}
            className="inline-block text-xs font-bold uppercase tracking-wider text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            {article.category}
          </Link>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-black font-playfair mb-4 text-neutral-900 dark:text-white leading-tight">
          {article.title}
        </h1>

        {/* Excerpt */}
        {article.excerpt && (
          <p className="text-xl text-neutral-700 dark:text-neutral-300 font-body mb-6 leading-relaxed">
            {article.excerpt}
          </p>
        )}

        {/* Meta Information */}
        <div className="flex items-center gap-4 pb-6 mb-6 border-b border-neutral-200 dark:border-neutral-700">
          <Link
            href={`/author/${article.author.toLowerCase().replace(/\s+/g, '-')}`}
            className="text-sm font-semibold text-neutral-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
          >
            By {article.author}
          </Link>
          <span className="text-neutral-400">•</span>
          <time className="text-sm text-neutral-600 dark:text-neutral-400">
            {formatDate(article.publishedAt)}
          </time>
        </div>

        {/* Featured Image */}
        {article.imageUrl && (
          <div className="mb-8 -mx-4 md:mx-0">
            <div className="relative w-full aspect-video md:aspect-[16/9] overflow-hidden">
              <Image
                src={article.imageUrl}
                alt={article.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        )}

        {/* YouTube Video */}
        {article.videoUrl && extractYouTubeVideoId(article.videoUrl) && (
          <div className="mb-8">
            <YouTubeEmbed 
              videoId={extractYouTubeVideoId(article.videoUrl)!} 
              title={article.title}
            />
          </div>
        )}

        {/* Article Content */}
        <div 
          className="mb-12 quill-content"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="mb-12 pb-8 border-b border-neutral-200 dark:border-neutral-700">
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 text-sm bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Author Info */}
        <div className="mb-12 p-6 bg-neutral-50 dark:bg-neutral-800 border-l-4 border-blue-600">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-neutral-300 dark:bg-neutral-600 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-neutral-600 dark:text-neutral-300">
                  {article.author.charAt(0)}
                </span>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold font-playfair mb-2">
                <Link
                  href={`/author/${article.author.toLowerCase().replace(/\s+/g, '-')}`}
                  className="text-neutral-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                >
                  {article.author}
                </Link>
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 font-sans italic mb-2">
                Professional Content Writer, Researcher & Visionary Storyteller
              </p>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 font-sans mb-3">
                "तरक्की को चाहिए नया नज़रिया—और यह नज़रिया शब्दों से शुरू होता है।"
              </p>
              <Link
                href={`/author/${article.author.toLowerCase().replace(/\s+/g, '-')}`}
                className="inline-block mt-2 text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                More from {article.author} →
              </Link>
            </div>
          </div>
        </div>
      </article>

      {/* Related Articles */}
      {filteredRelated.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-12 border-t-4 border-black dark:border-white">
          <h2 className="text-3xl font-black font-playfair mb-8">More Stories</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {filteredRelated.map((relatedArticle) => (
              <article key={relatedArticle.id} className="group">
                {relatedArticle.imageUrl && (
                  <Link href={`/article/${relatedArticle.slug}`}>
                    <div className="relative w-full aspect-video mb-4 overflow-hidden">
                      <Image
                        src={relatedArticle.imageUrl}
                        alt={relatedArticle.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </Link>
                )}
                <div className="mb-2">
                  <Link
                    href={`/section/${relatedArticle.category.toLowerCase()}`}
                    className="text-xs font-bold uppercase tracking-wider text-blue-600 hover:text-blue-700"
                  >
                    {relatedArticle.category}
                  </Link>
                </div>
                <h3 className="text-xl font-bold font-playfair mb-2">
                  <Link
                    href={`/article/${relatedArticle.slug}`}
                    className="text-neutral-900 dark:text-white hover:text-neutral-600 dark:hover:text-neutral-300"
                  >
                    {relatedArticle.title}
                  </Link>
                </h3>
                {relatedArticle.excerpt && (
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 font-sans line-clamp-3">
                    {relatedArticle.excerpt}
                  </p>
                )}
              </article>
            ))}
          </div>
        </section>
      )}
    </main>
    </>
  )
}
