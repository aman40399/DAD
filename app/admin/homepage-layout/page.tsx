'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import { Article } from '@/types'
import { HOMEPAGE_POSITIONS, getPositionBadgeColor } from '@/lib/homepage-positions'
import AdminLayout from '@/components/AdminLayout'

export default function HomepageLayout() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [articles, setArticles] = useState<Article[]>([])
  const [allArticles, setAllArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    // Wait for session status to resolve. If unauthenticated, redirect to login.
    if (status === 'loading') return

    if (status === 'unauthenticated') {
      router.push('/admin')
      return
    }

    // Authenticated -> load homepage articles
    fetchHomepageArticles()
    fetchAllArticles()
  }, [status, router])

  const fetchHomepageArticles = async () => {
    try {
      const response = await fetch('/api/articles/homepage')
      const data = await response.json()
      setArticles(data.articles || [])
    } catch (error) {
      console.error('Error fetching homepage articles:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAllArticles = async () => {
    try {
      const response = await fetch('/api/articles')
      const data = await response.json()
      setAllArticles(data.articles || [])
    } catch (error) {
      console.error('Error fetching all articles:', error)
    }
  }

  const getArticleByPosition = (position: number): Article | undefined => {
    return articles.find(a => a.homepagePosition === position)
  }

  const assignArticle = async (articleId: string, position: number) => {
    setSaving(true)
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
        await fetchHomepageArticles()
        setShowAssignModal(false)
        setSelectedPosition(null)
        setSearchQuery('')
      } else {
        alert('Failed to assign article')
      }
    } catch (error) {
      console.error('Error assigning article:', error)
      alert('Error assigning article')
    } finally {
      setSaving(false)
    }
  }

  const removeFromHomepage = async (articleId: string) => {
    if (!confirm('Remove this article from the homepage?')) return

    setSaving(true)
    try {
      const response = await fetch(`/api/articles/${articleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          homepagePosition: 0, // Archive it
        }),
      })

      if (response.ok) {
        await fetchHomepageArticles()
      } else {
        alert('Failed to remove article')
      }
    } catch (error) {
      console.error('Error removing article:', error)
      alert('Error removing article')
    } finally {
      setSaving(false)
    }
  }

  const openAssignModal = (position: number) => {
    setSelectedPosition(position)
    setShowAssignModal(true)
  }

  const filteredArticles = allArticles.filter(article => {
    const searchLower = searchQuery.toLowerCase()
    return (
      article.title.toLowerCase().includes(searchLower) ||
      article.author.toLowerCase().includes(searchLower) ||
      article.category.toLowerCase().includes(searchLower)
    )
  })

  // Group articles by position for the visual preview
  const breakingNews = getArticleByPosition(1)
  const mainStory = getArticleByPosition(2)
  const secondaryStory = getArticleByPosition(3)
  const tertiaryStory = getArticleByPosition(4)
  const topStories = [5, 6, 7, 8].map(pos => getArticleByPosition(pos)).filter(Boolean) as Article[]
  const opinionPieces = [9, 10, 11].map(pos => getArticleByPosition(pos)).filter(Boolean) as Article[]
  const moreNews = [12, 13, 14, 15, 16, 17, 18, 19, 20].map(pos => getArticleByPosition(pos)).filter(Boolean) as Article[]

  return (
    <AdminLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">Homepage Layout Manager</h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Visual preview - Click on sections to assign articles
          </p>
        </div>

        {saving && (
          <div className="mb-4 p-4 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-lg">
            Saving changes...
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-neutral-600 dark:text-neutral-400 font-sans">Loading homepage layout...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Breaking News Bar - Position 1 */}
            <section className="bg-white dark:bg-neutral-800 border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded-sm p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`px-3 py-1 rounded-sm text-xs font-bold ${getPositionBadgeColor(1)}`}>
                    Position 1
                  </div>
                  <span className="text-sm font-bold">Breaking News Bar</span>
                </div>
                {breakingNews ? (
                  <div className="flex gap-2">
                    <Link
                      href={`/admin/articles/${breakingNews.id}/edit`}
                      className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => removeFromHomepage(breakingNews.id)}
                      className="text-xs text-red-600 hover:text-red-700 font-semibold"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => openAssignModal(1)}
                    className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    + Assign Article
                  </button>
                )}
              </div>
              {breakingNews ? (
                <div className="bg-red-600 text-white py-3 px-6 rounded cursor-pointer hover:bg-red-700 transition-colors">
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-sm uppercase tracking-wider flex-shrink-0">
                      Breaking News
                    </span>
                    <span className="text-sm font-serif flex-1">{breakingNews.title}</span>
                  </div>
                </div>
              ) : (
                <div 
                  onClick={() => openAssignModal(1)}
                  className="bg-neutral-100 dark:bg-neutral-700 py-8 rounded cursor-pointer hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors"
                >
                  <p className="text-center text-neutral-500 dark:text-neutral-400">Click to assign breaking news</p>
                </div>
              )}
            </section>

            {/* Main Grid - Positions 2, 3, 4, 5-8 */}
            <div className="grid grid-cols-12 gap-4 bg-white dark:bg-neutral-800 border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded-sm p-4">
              {/* Left Column - Main Story (Position 2) */}
              <div className="col-span-12 lg:col-span-8 border-r-0 lg:border-r border-neutral-300 dark:border-neutral-700 pr-0 lg:pr-6">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`px-3 py-1 rounded-sm text-xs font-bold ${getPositionBadgeColor(2)}`}>
                      Position 2
                    </div>
                    <span className="text-sm font-bold">Main Story</span>
                  </div>
                  {mainStory ? (
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/articles/${mainStory.id}/edit`}
                        className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => removeFromHomepage(mainStory.id)}
                        className="text-xs text-red-600 hover:text-red-700 font-semibold"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => openAssignModal(2)}
                      className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
                    >
                      + Assign Article
                    </button>
                  )}
                </div>
                {mainStory ? (
                  <article className="mb-8 cursor-pointer hover:opacity-80 transition-opacity">
                    {mainStory.imageUrl && (
                      <div className="relative w-full h-[300px] mb-4 overflow-hidden bg-neutral-200 dark:bg-neutral-800">
                        <Image
                          src={mainStory.imageUrl}
                          alt={mainStory.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <h1 className="text-3xl lg:text-4xl font-serif font-bold leading-tight mb-3">
                      {mainStory.title}
                    </h1>
                    {mainStory.excerpt && (
                      <p className="text-base text-neutral-700 dark:text-neutral-300 font-serif leading-relaxed line-clamp-3">
                        {mainStory.excerpt}
                      </p>
                    )}
                  </article>
                ) : (
                  <div 
                    onClick={() => openAssignModal(2)}
                    className="bg-neutral-100 dark:bg-neutral-700 h-[400px] rounded cursor-pointer hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors flex items-center justify-center"
                  >
                    <p className="text-center text-neutral-500 dark:text-neutral-400">Click to assign main story</p>
                  </div>
                )}

                {/* Secondary Stories - Positions 3 & 4 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-neutral-300 dark:border-neutral-700">
                  {/* Position 3 */}
                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`px-2 py-0.5 rounded-sm text-xs font-bold ${getPositionBadgeColor(3)}`}>
                          Pos 3
                        </div>
                      </div>
                      {secondaryStory ? (
                        <div className="flex gap-2">
                          <Link
                            href={`/admin/articles/${secondaryStory.id}/edit`}
                            className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => removeFromHomepage(secondaryStory.id)}
                            className="text-xs text-red-600 hover:text-red-700 font-semibold"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => openAssignModal(3)}
                          className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
                        >
                          + Assign
                        </button>
                      )}
                    </div>
                    {secondaryStory ? (
                      <article className="cursor-pointer hover:opacity-80 transition-opacity">
                        {secondaryStory.imageUrl && (
                          <div className="relative w-full h-36 mb-3 overflow-hidden bg-neutral-200 dark:bg-neutral-800">
                            <Image
                              src={secondaryStory.imageUrl}
                              alt={secondaryStory.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <h2 className="text-lg font-serif font-bold leading-tight line-clamp-2">
                          {secondaryStory.title}
                        </h2>
                      </article>
                    ) : (
                      <div 
                        onClick={() => openAssignModal(3)}
                        className="bg-neutral-100 dark:bg-neutral-700 h-[200px] rounded cursor-pointer hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors flex items-center justify-center"
                      >
                        <p className="text-center text-neutral-500 dark:text-neutral-400 text-sm">Click to assign</p>
                      </div>
                    )}
                  </div>

                  {/* Position 4 */}
                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`px-2 py-0.5 rounded-sm text-xs font-bold ${getPositionBadgeColor(4)}`}>
                          Pos 4
                        </div>
                      </div>
                      {tertiaryStory ? (
                        <div className="flex gap-2">
                          <Link
                            href={`/admin/articles/${tertiaryStory.id}/edit`}
                            className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => removeFromHomepage(tertiaryStory.id)}
                            className="text-xs text-red-600 hover:text-red-700 font-semibold"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => openAssignModal(4)}
                          className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
                        >
                          + Assign
                        </button>
                      )}
                    </div>
                    {tertiaryStory ? (
                      <article className="cursor-pointer hover:opacity-80 transition-opacity">
                        {tertiaryStory.imageUrl && (
                          <div className="relative w-full h-36 mb-3 overflow-hidden bg-neutral-200 dark:bg-neutral-800">
                            <Image
                              src={tertiaryStory.imageUrl}
                              alt={tertiaryStory.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <h2 className="text-lg font-serif font-bold leading-tight line-clamp-2">
                          {tertiaryStory.title}
                        </h2>
                      </article>
                    ) : (
                      <div 
                        onClick={() => openAssignModal(4)}
                        className="bg-neutral-100 dark:bg-neutral-700 h-[200px] rounded cursor-pointer hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors flex items-center justify-center"
                      >
                        <p className="text-center text-neutral-500 dark:text-neutral-400 text-sm">Click to assign</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column - Top Stories (Positions 5-8) */}
              <div className="col-span-12 lg:col-span-4">
                <div className="mb-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider border-b border-neutral-900 dark:border-neutral-100 pb-2">
                    Top Stories (Positions 5-8)
                  </h3>
                </div>
                <div className="space-y-4">
                  {[5, 6, 7, 8].map(pos => {
                    const article = getArticleByPosition(pos)
                    return (
                      <div key={pos} className="border-b border-neutral-200 dark:border-neutral-700 pb-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className={`px-2 py-0.5 rounded-sm text-xs font-bold ${getPositionBadgeColor(pos)}`}>
                            Pos {pos}
                          </div>
                          {article ? (
                            <div className="flex gap-2">
                              <Link
                                href={`/admin/articles/${article.id}/edit`}
                                className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
                              >
                                Edit
                              </Link>
                              <button
                                onClick={() => removeFromHomepage(article.id)}
                                className="text-xs text-red-600 hover:text-red-700 font-semibold"
                              >
                                Remove
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => openAssignModal(pos)}
                              className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
                            >
                              + Assign
                            </button>
                          )}
                        </div>
                        {article ? (
                          <article className="cursor-pointer hover:opacity-80 transition-opacity">
                            <h4 className="text-sm font-serif font-bold leading-tight line-clamp-2 mb-1">
                              {article.title}
                            </h4>
                            <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2">
                              {article.excerpt || article.category}
                            </p>
                          </article>
                        ) : (
                          <div 
                            onClick={() => openAssignModal(pos)}
                            className="bg-neutral-100 dark:bg-neutral-700 h-16 rounded cursor-pointer hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors flex items-center justify-center"
                          >
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">Click to assign</p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Opinion Section - Positions 9-11 */}
            <section className="bg-white dark:bg-neutral-800 border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded-sm p-4">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider border-b border-neutral-900 dark:border-neutral-100 pb-2">
                  Opinion (Positions 9-11)
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[9, 10, 11].map(pos => {
                  const article = getArticleByPosition(pos)
                  return (
                    <div key={pos}>
                      <div className="mb-3 flex items-center justify-between">
                        <div className={`px-2 py-0.5 rounded-sm text-xs font-bold ${getPositionBadgeColor(pos)}`}>
                          Pos {pos}
                        </div>
                        {article ? (
                          <div className="flex gap-2">
                            <Link
                              href={`/admin/articles/${article.id}/edit`}
                              className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
                            >
                              Edit
                            </Link>
                            <button
                              onClick={() => removeFromHomepage(article.id)}
                              className="text-xs text-red-600 hover:text-red-700 font-semibold"
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => openAssignModal(pos)}
                            className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
                          >
                            + Assign
                          </button>
                        )}
                      </div>
                      {article ? (
                        <article className="cursor-pointer hover:opacity-80 transition-opacity">
                          {article.imageUrl && (
                            <div className="relative w-full h-32 mb-2 overflow-hidden bg-neutral-200 dark:bg-neutral-800">
                              <Image
                                src={article.imageUrl}
                                alt={article.title}
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}
                          <h4 className="text-base font-serif font-bold leading-tight line-clamp-2">
                            {article.title}
                          </h4>
                        </article>
                      ) : (
                        <div 
                          onClick={() => openAssignModal(pos)}
                          className="bg-neutral-100 dark:bg-neutral-700 h-[180px] rounded cursor-pointer hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors flex items-center justify-center"
                        >
                          <p className="text-xs text-neutral-500 dark:text-neutral-400">Click to assign</p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </section>

            {/* More News - Positions 12-20 */}
            <section className="bg-white dark:bg-neutral-800 border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded-sm p-4">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider border-b border-neutral-900 dark:border-neutral-100 pb-2">
                  More News (Positions 12-20)
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[12, 13, 14, 15, 16, 17, 18, 19, 20].map(pos => {
                  const article = getArticleByPosition(pos)
                  return (
                    <div key={pos} className="border border-neutral-200 dark:border-neutral-700 rounded p-3">
                      <div className="mb-2 flex items-center justify-between">
                        <div className={`px-2 py-0.5 rounded-sm text-xs font-bold ${getPositionBadgeColor(pos)}`}>
                          Pos {pos}
                        </div>
                        {article ? (
                          <div className="flex gap-2">
                            <Link
                              href={`/admin/articles/${article.id}/edit`}
                              className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
                            >
                              Edit
                            </Link>
                            <button
                              onClick={() => removeFromHomepage(article.id)}
                              className="text-xs text-red-600 hover:text-red-700 font-semibold"
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => openAssignModal(pos)}
                            className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
                          >
                            + Assign
                          </button>
                        )}
                      </div>
                      {article ? (
                        <article className="cursor-pointer hover:opacity-80 transition-opacity flex gap-2">
                          {article.imageUrl && (
                            <div className="relative w-16 h-16 flex-shrink-0 overflow-hidden bg-neutral-200 dark:bg-neutral-800">
                              <Image
                                src={article.imageUrl}
                                alt={article.title}
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                              {article.category}
                            </span>
                            <h4 className="text-xs font-serif font-bold leading-tight line-clamp-2 mt-1">
                              {article.title}
                            </h4>
                          </div>
                        </article>
                      ) : (
                        <div 
                          onClick={() => openAssignModal(pos)}
                          className="bg-neutral-100 dark:bg-neutral-700 h-20 rounded cursor-pointer hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors flex items-center justify-center"
                        >
                          <p className="text-xs text-neutral-500 dark:text-neutral-400">Click to assign</p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </section>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-sm">
          <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-2 font-playfair">
            How to Use
          </h3>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 font-sans">
            <li>• <strong>Visual Layout:</strong> See exactly how your homepage will look</li>
            <li>• <strong>Click to Assign:</strong> Click "+ Assign" buttons or empty slots to select articles</li>
            <li>• <strong>Edit:</strong> Click "Edit" to modify article content</li>
            <li>• <strong>Remove:</strong> Click "Remove" to clear a position</li>
            <li>• <strong>Live Preview:</strong> Changes reflect immediately on the homepage</li>
          </ul>
        </div>

        {/* Assignment Modal */}
        {showAssignModal && selectedPosition !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-neutral-800 rounded-lg max-w-3xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold font-playfair">
                  Assign Article to Position {selectedPosition}
                </h2>
                <button
                  onClick={() => {
                    setShowAssignModal(false)
                    setSelectedPosition(null)
                    setSearchQuery('')
                  }}
                  className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
                >
                  ✕
                </button>
              </div>
              <input
                type="text"
                placeholder="Search articles by title, author, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-sm focus:ring-2 focus:ring-blue-500 dark:bg-neutral-700 dark:text-white"
              />
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-3">
                {filteredArticles.length === 0 ? (
                  <p className="text-center text-neutral-500 dark:text-neutral-400 py-8">
                    No articles found
                  </p>
                ) : (
                  filteredArticles.map(article => (
                    <div
                      key={article.id}
                      onClick={() => assignArticle(article.id, selectedPosition)}
                      className="flex gap-4 p-4 border border-neutral-200 dark:border-neutral-700 rounded-sm cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
                    >
                      {article.imageUrl && (
                        <div className="relative w-24 h-24 flex-shrink-0 overflow-hidden bg-neutral-200 dark:bg-neutral-800">
                          <Image
                            src={article.imageUrl}
                            alt={article.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded font-semibold">
                            {article.category}
                          </span>
                          {article.homepagePosition && article.homepagePosition > 0 && (
                            <span className="text-xs text-orange-600 dark:text-orange-400">
                              Currently at position {article.homepagePosition}
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold text-sm mb-1 line-clamp-2">
                          {article.title}
                        </h3>
                        <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2">
                          {article.excerpt || 'No excerpt'}
                        </p>
                        <p className="text-xs text-neutral-500 mt-1">
                          By {article.author}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </AdminLayout>
  )
}
