'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/AdminLayout'
import Image from 'next/image'

interface TrendingArticle {
  title: string
  description: string
  content: string
  url: string
  imageUrl: string
  source: string
  author: string
  publishedAt: string
}

export default function TrendingNewsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [articles, setArticles] = useState<TrendingArticle[]>([])
  const [loading, setLoading] = useState(false)
  const [totalResults, setTotalResults] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  const [language, setLanguage] = useState('en')
  const [category, setCategory] = useState('')

  useEffect(() => {
    if (status === 'loading') return
    if (status === 'unauthenticated') {
      router.push('/admin')
      return
    }
    fetchTrendingNews()
  }, [status, page, language, category])

  const fetchTrendingNews = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        language,
        pageSize: pageSize.toString(),
        page: page.toString()
      })
      
      if (category) params.append('category', category)

      const response = await fetch(`/api/trending-news?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setArticles(data.articles)
        setTotalResults(data.totalResults)
      } else {
        console.error('Failed to fetch trending news:', data.error)
        alert('Failed to fetch trending news: ' + (data.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error fetching trending news:', error)
      alert('Error fetching trending news')
    } finally {
      setLoading(false)
    }
  }

  const importAsArticle = (article: TrendingArticle) => {
    // Store the article data in localStorage to pre-fill the new article form
    const articleData = {
      title: article.title,
      excerpt: article.description || '',
      content: `<p>${article.content || article.description || ''}</p>`,
      imageUrl: article.imageUrl || '',
      author: article.author || article.source,
      source: article.source,
      originalUrl: article.url
    }
    
    localStorage.setItem('importedArticle', JSON.stringify(articleData))
    router.push('/admin/articles/new')
  }

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'business', label: 'Business' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'general', label: 'General' },
    { value: 'health', label: 'Health' },
    { value: 'science', label: 'Science' },
    { value: 'sports', label: 'Sports' },
    { value: 'technology', label: 'Technology' }
  ]

  const languages = [
    { value: 'en', label: 'English' },
    { value: 'hi', label: 'Hindi' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' }
  ]

  if (status === 'loading') {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            📰 Trending News
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Browse trending news from around the world and import them as articles
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Language Filter */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Language
              </label>
              <select
                value={language}
                onChange={(e) => {
                  setLanguage(e.target.value)
                  setPage(1)
                }}
                className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-sm focus:ring-2 focus:ring-blue-500 dark:bg-neutral-700 dark:text-white"
              >
                {languages.map(lang => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value)
                  setPage(1)
                }}
                className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-sm focus:ring-2 focus:ring-blue-500 dark:bg-neutral-700 dark:text-white"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Refresh Button */}
            <div className="flex items-end">
              <button
                onClick={() => fetchTrendingNews()}
                disabled={loading}
                className="w-full px-6 py-2 bg-blue-600 text-white rounded-sm hover:bg-blue-700 disabled:bg-gray-400 font-bold"
              >
                {loading ? 'Loading...' : '🔄 Refresh'}
              </button>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            Found <strong>{totalResults}</strong> trending articles
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Fetching trending news...</p>
          </div>
        )}

        {/* Articles Grid */}
        {!loading && articles.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article, index) => (
              <div
                key={index}
                className="bg-white dark:bg-neutral-800 rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
              >
                {/* Image */}
                {article.imageUrl && (
                  <div className="relative h-48 bg-gray-200 dark:bg-neutral-700">
                    <Image
                      src={article.imageUrl}
                      alt={article.title}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                      }}
                    />
                  </div>
                )}

                {/* Content */}
                <div className="p-4">
                  {/* Source & Date */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase">
                      {article.source}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(article.publishedAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                    {article.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                    {article.description}
                  </p>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => importAsArticle(article)}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-sm hover:bg-green-700 text-sm font-bold"
                    >
                      📝 Import
                    </button>
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-sm hover:bg-gray-700 text-sm font-bold text-center"
                    >
                      🔗 View
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && articles.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              No trending news found. Try changing filters.
            </p>
          </div>
        )}

        {/* Pagination */}
        {!loading && articles.length > 0 && (
          <div className="mt-8 flex justify-center gap-4">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-6 py-2 bg-blue-600 text-white rounded-sm hover:bg-blue-700 disabled:bg-gray-400 font-bold"
            >
              ← Previous
            </button>
            <span className="px-6 py-2 bg-gray-200 dark:bg-neutral-700 rounded-sm font-bold">
              Page {page}
            </span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={articles.length < pageSize}
              className="px-6 py-2 bg-blue-600 text-white rounded-sm hover:bg-blue-700 disabled:bg-gray-400 font-bold"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
