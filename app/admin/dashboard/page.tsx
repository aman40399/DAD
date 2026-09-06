'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Article } from '@/types'
import { getTimeAgo } from '@/lib/utils'
import { getPositionName, getPositionBadgeColor } from '@/lib/homepage-positions'
import AdminLayout from '@/components/AdminLayout'

export default function AdminDashboard() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  // Calculate stats
  const stats = useMemo(() => {
    const total = articles.length
    const published = articles.filter(a => a.homepagePosition && a.homepagePosition > 0).length
    const archived = articles.filter(a => a.homepagePosition === 0).length
    const categorySet = new Set(articles.map(a => a.category))
    const categories = categorySet.size
    const today = new Date().toDateString()
    const todayArticles = articles.filter(a => new Date(a.createdAt).toDateString() === today).length

    return { total, published, archived, categories, todayArticles }
  }, [articles])

  useEffect(() => {
    // Wait for session status to resolve. If unauthenticated, redirect to login.
    if (status === 'loading') return

    if (status === 'unauthenticated') {
      router.push('/admin')
      return
    }

    // Authenticated -> load articles
    fetchArticles()
  }, [status, router])

  const fetchArticles = async () => {
    try {
      const response = await fetch('/api/articles')
      const data = await response.json()
      setArticles(data.articles || [])
    } catch (error) {
      console.error('Error fetching articles:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this article?')) {
      return
    }

    setDeleting(id)
    try {
      const response = await fetch(`/api/articles/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setArticles(articles.filter(article => article.id !== id))
      } else {
        alert('Failed to delete article')
      }
    } catch (error) {
      console.error('Error deleting article:', error)
      alert('Error deleting article')
    } finally {
      setDeleting(null)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/admin')
      router.refresh()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const recentArticles = articles.slice(0, 5)

  return (
    <AdminLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
            Welcome back, {session?.user?.name || 'Admin'}!
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Here's what's happening with your site today.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Articles */}
          <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <span className="text-xs font-semibold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded">
                +{stats.todayArticles} today
              </span>
            </div>
            <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-1">
              {stats.total}
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">Total Articles</p>
          </div>

          {/* Published */}
          <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-1">
              {stats.published}
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">Published on Homepage</p>
          </div>

          {/* Archived */}
          <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-1">
              {stats.archived}
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">Archived Articles</p>
          </div>

          {/* Categories */}
          <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-1">
              {stats.categories}
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">Active Categories</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Link
            href="/admin/articles/new"
            className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-lg">Create New Article</h3>
                <p className="text-sm text-blue-100">Start writing your next story</p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/homepage-layout"
            className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white hover:from-purple-600 hover:to-purple-700 transition-all transform hover:scale-105"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-lg">Homepage Layout</h3>
                <p className="text-sm text-purple-100">Manage featured content</p>
              </div>
            </div>
          </Link>

          <Link
            href="/"
            target="_blank"
            className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-105"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-lg">View Site</h3>
                <p className="text-sm text-green-100">See your live website</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Articles & All Articles */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden">
              <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
                <h2 className="font-bold text-lg text-neutral-900 dark:text-white">Recent Activity</h2>
              </div>
              <div className="p-4">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : recentArticles.length === 0 ? (
                  <p className="text-center text-neutral-500 dark:text-neutral-400 py-8 text-sm">
                    No articles yet
                  </p>
                ) : (
                  <div className="space-y-4">
                    {recentArticles.map((article) => (
                      <div key={article.id} className="flex gap-3">
                        <div className="flex-shrink-0">
                          {article.imageUrl ? (
                            <img
                              src={article.imageUrl}
                              alt={article.title}
                              className="w-12 h-12 rounded object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center">
                              <svg className="w-6 h-6 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/admin/articles/${article.id}/edit`}
                            className="text-sm font-semibold text-neutral-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 line-clamp-2"
                          >
                            {article.title}
                          </Link>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-neutral-500 dark:text-neutral-400">
                              {getTimeAgo(article.createdAt)}
                            </span>
                            <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded">
                              {article.category}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* All Articles Table */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden">
              <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                <h2 className="font-bold text-lg text-neutral-900 dark:text-white">All Articles</h2>
                <span className="text-sm text-neutral-500 dark:text-neutral-400">
                  {articles.length} total
                </span>
              </div>
              <div className="overflow-x-auto">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : articles.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                      No articles yet. Create your first article!
                    </p>
                    <Link
                      href="/admin/articles/new"
                      className="inline-block px-6 py-3 bg-blue-600 text-white font-bold text-sm rounded-sm hover:bg-blue-700 transition-colors"
                    >
                      + Create Article
                    </Link>
                  </div>
                ) : (
                  <div className="max-h-[600px] overflow-y-auto">
                    <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-800">
                      <thead className="bg-neutral-50 dark:bg-neutral-800/50 sticky top-0 z-10">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                            Title
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-3 py-2 text-right text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800 bg-white dark:bg-neutral-900">
                        {articles.map((article) => (
                          <tr key={article.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                            <td className="px-3 py-2">
                              <div className="flex items-center gap-2">
                                {article.imageUrl && (
                                  <img
                                    src={article.imageUrl}
                                    alt={article.title}
                                    className="w-8 h-8 rounded object-cover flex-shrink-0"
                                  />
                                )}
                                <div className="min-w-0 max-w-xs">
                                  <div className="text-sm font-semibold text-neutral-900 dark:text-white truncate">
                                    {article.title}
                                  </div>
                                  <div className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                                    {article.category}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap">
                              <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded ${getPositionBadgeColor(article.homepagePosition)}`}>
                                {article.homepagePosition !== null && article.homepagePosition > 0 ? `Pos ${article.homepagePosition}` : article.homepagePosition === 0 ? 'Archived' : 'Draft'}
                              </span>
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-xs text-neutral-500 dark:text-neutral-400">
                              {getTimeAgo(article.publishedAt)}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-right text-xs font-medium">
                              <div className="flex justify-end gap-3">
                                <Link
                                  href={`/article/${article.slug}`}
                                  className="text-blue-600 hover:text-blue-900 dark:hover:text-blue-400 hover:underline"
                                  target="_blank"
                                  title="View Article"
                                >
                                  View
                                </Link>
                                <Link
                                  href={`/admin/articles/${article.id}/edit`}
                                  className="text-indigo-600 hover:text-indigo-900 dark:hover:text-indigo-400 hover:underline"
                                  title="Edit Article"
                                >
                                  Edit
                                </Link>
                                <button
                                  onClick={() => handleDelete(article.id)}
                                  disabled={deleting === article.id}
                                  className="text-red-600 hover:text-red-900 dark:hover:text-red-400 disabled:opacity-50 hover:underline"
                                  title="Delete Article"
                                >
                                  {deleting === article.id ? '...' : 'Delete'}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
