'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Article } from '@/types'
import { HOMEPAGE_POSITIONS, getPositionInfo, getPositionBadgeColor } from '@/lib/homepage-positions'

export default function AssignArticle() {
  const router = useRouter()
  const params = useParams()
  const { data: session, status } = useSession()
  const position = parseInt(params.position as string)
  const posInfo = getPositionInfo(position)

  const [articles, setArticles] = useState<Article[]>([])
  const [currentArticle, setCurrentArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)
  const [assigning, setAssigning] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    if (status === 'loading') return
    if (status === 'unauthenticated') {
      router.push('/admin')
      return
    }
    fetchArchivedArticles()
    fetchCurrentAssigned()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, router, params.position])

  // Removed legacy checkAuth, now using useSession for authentication

  const fetchArchivedArticles = async () => {
    try {
      const response = await fetch('/api/articles')
      const data = await response.json()
      
      // Filter only archived articles (homepagePosition = 0 or null)
      const archived = (data.articles || []).filter(
        (article: Article) => !article.homepagePosition || article.homepagePosition === 0
      )
      setArticles(archived)
    } catch (error) {
      console.error('Error fetching articles:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCurrentAssigned = async () => {
    try {
      const res = await fetch(`/api/articles/homepage`)
      const data = await res.json()
      const article = (data.articles || []).find((a: Article) => a.homepagePosition === position)
      setCurrentArticle(article || null)
    } catch (err) {
      console.error('Error fetching current assigned article', err)
    }
  }

  const handleAssign = async (articleId: string) => {
    if (!confirm(`Assign this article to Position ${position}?`)) return

    setAssigning(true)
    try {
      const response = await fetch(`/api/articles/${articleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          homepagePosition: position,
        }),
      })

      if (response.ok) {
        // Force refresh the router cache
        router.refresh()
        // Redirect to homepage layout
        router.push('/admin/homepage-layout')
        // Also force a page reload to clear all caches
        setTimeout(() => {
          window.location.href = '/admin/homepage-layout'
        }, 100)
      } else {
        alert('Failed to assign article')
      }
    } catch (error) {
      console.error('Error assigning article:', error)
      alert('Error assigning article')
    } finally {
      setAssigning(false)
    }
  }

  const categories = Array.from(new Set(articles.map(a => a.category)))
  
  const filteredArticles = articles.filter(article => {
    const matchesSearch = searchQuery === '' || 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  if (!posInfo) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Invalid Position</h1>
          <Link href="/admin/homepage-layout" className="text-blue-600 hover:text-blue-700">
            ← Back to Homepage Layout
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      {/* Header */}
      <header className="bg-white dark:bg-neutral-800 shadow-sm border-b border-neutral-200 dark:border-neutral-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-black font-playfair">Assign Article to Position {position}</h1>
              <div className="flex items-center gap-2 mt-2">
                <span className={`px-3 py-1 rounded-sm text-xs font-bold ${getPositionBadgeColor(position)}`}>
                  {posInfo.name}
                </span>
                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                  {posInfo.description}
                </span>
              </div>
            </div>
            <Link
              href="/admin/homepage-layout"
              className="text-sm text-blue-600 hover:text-blue-700 font-sans font-semibold"
            >
              ← Cancel
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="mb-6 bg-white dark:bg-neutral-800 p-4 rounded-sm border border-neutral-200 dark:border-neutral-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Search Articles
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title or excerpt..."
                className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white rounded-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Filter by Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white rounded-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 text-sm text-neutral-600 dark:text-neutral-400">
            Showing {filteredArticles.length} of {articles.length} archived articles
          </div>
        </div>

        {/* Current Assigned Article */}
        {currentArticle && (
          <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 p-6 rounded-sm border-2 border-blue-500 dark:border-blue-600">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-black text-blue-900 dark:text-blue-100 uppercase tracking-wider">
                ⚠️ Currently Assigned to Position {position}
              </span>
            </div>
            <div className="flex items-start gap-4">
              {currentArticle.imageUrl && (
                <div className="w-48 h-32 overflow-hidden rounded-sm flex-shrink-0 border-2 border-blue-300 dark:border-blue-700">
                  <img 
                    src={currentArticle.imageUrl} 
                    alt={currentArticle.title} 
                    className="w-full h-full object-cover" 
                  />
                </div>
              )}
              <div className="flex-1">
                <div className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1">
                  {currentArticle.category} • by {currentArticle.author}
                </div>
                <h4 className="font-black text-lg text-gray-900 dark:text-white mb-2 font-playfair">
                  {currentArticle.title}
                </h4>
                {currentArticle.excerpt && (
                  <p className="text-sm text-neutral-700 dark:text-neutral-300 mb-3 line-clamp-2">
                    {currentArticle.excerpt}
                  </p>
                )}
                <div className="flex gap-3 items-center">
                  <Link 
                    href={`/admin/articles/${currentArticle.id}/edit`} 
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline"
                  >
                    ✏️ Edit Article
                  </Link>
                  <Link 
                    href={`/article/${currentArticle.slug}`} 
                    target="_blank"
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline"
                  >
                    👁️ Preview
                  </Link>
                </div>
              </div>
            </div>
            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-sm">
              <p className="text-xs text-yellow-800 dark:text-yellow-200 font-semibold">
                ℹ️ Note: Assigning a new article will replace the current article. The replaced article will be moved to the archive.
              </p>
            </div>
          </div>
        )}

        {!currentArticle && (
          <div className="mb-6 bg-green-50 dark:bg-green-900/20 p-4 rounded-sm border border-green-300 dark:border-green-700">
            <p className="text-sm text-green-800 dark:text-green-200 font-semibold">
              ✓ Position {position} is currently empty. Select an article below to assign to this position.
            </p>
          </div>
        )}

        {/* Articles Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-neutral-600 dark:text-neutral-400 font-sans">Loading articles...</p>
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-neutral-800 rounded-sm border border-neutral-200 dark:border-neutral-700">
            <p className="text-neutral-600 dark:text-neutral-400 font-sans mb-4">
              {searchQuery || selectedCategory !== 'all' 
                ? 'No articles match your filters' 
                : 'No archived articles available'
              }
            </p>
            <Link
              href="/admin/articles/new"
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              Create New Article →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredArticles.map((article) => (
              <div
                key={article.id}
                className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-sm p-4 hover:border-blue-500 dark:hover:border-blue-500 transition-all"
              >
                {/* Article Preview */}
                {article.imageUrl && (
                  <div className="mb-3 h-40 bg-neutral-200 dark:bg-neutral-700 rounded-sm overflow-hidden">
                    <img 
                      src={article.imageUrl} 
                      alt={article.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded font-semibold">
                      {article.category}
                    </span>
                    <span className="text-xs text-neutral-500">
                      by {article.author}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-2 mb-2">
                    {article.title}
                  </h3>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-3">
                    {article.excerpt}
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-700">
                  <button
                    onClick={() => handleAssign(article.id)}
                    disabled={assigning}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-sm transition-colors disabled:opacity-50"
                  >
                    {assigning ? 'Assigning...' : 'Assign to Position'}
                  </button>
                  <Link
                    href={`/article/${article.slug}`}
                    target="_blank"
                    className="px-3 py-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400"
                    title="Preview article"
                  >
                    👁️
                  </Link>
                  <Link
                    href={`/admin/articles/${article.id}/edit`}
                    className="px-3 py-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400"
                    title="Edit article"
                  >
                    ✏️
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
