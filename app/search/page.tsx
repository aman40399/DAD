'use client'

import { useState, useEffect, useMemo, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Masthead from '@/components/meridian/Masthead'
import Footer from '@/components/meridian/Footer'
import PostCard from '@/components/meridian/PostCard'
import { Article } from '@/types'
import { mapArticleToPostCard } from '@/lib/meridianData'

const CATEGORIES = [
  'All',
  'Politics',
  'World',
  'Business',
  'Technology',
  'Sports',
  'Opinion',
  'Arts',
]

function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialQuery = searchParams.get('q') || ''

  const [query, setQuery] = useState(initialQuery)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadArticles() {
      try {
        setLoading(true)
        const res = await fetch('/api/articles?limit=50')
        if (res.ok) {
          const data = await res.json()
          setArticles(data.articles || [])
        }
      } catch (err) {
        console.error('Failed to load articles for search:', err)
      } finally {
        setLoading(false)
      }
    }
    loadArticles()
  }, [])

  // Keep query in sync with URL search param
  useEffect(() => {
    const currentQ = searchParams.get('q')
    if (currentQ !== null && currentQ !== query) {
      setQuery(currentQ)
    }
  }, [searchParams])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
    } else {
      router.push('/search')
    }
  }

  // Filtered stories
  const filteredArticles = useMemo(() => {
    const q = query.toLowerCase().trim()

    return articles.filter((article) => {
      if (article.status !== 'published') return false

      if (selectedCategory !== 'All') {
        if (article.category.toLowerCase() !== selectedCategory.toLowerCase()) {
          return false
        }
      }

      if (!q) return true

      const inTitle = article.title.toLowerCase().includes(q)
      const inSubtitle = (article.subtitle || article.excerpt || '').toLowerCase().includes(q)
      const inContent = (article.content || '').toLowerCase().includes(q)
      const inAuthor = (article.author || '').toLowerCase().includes(q)
      const inTags = (article.tags || []).some((t) => t.toLowerCase().includes(q))
      const inCategory = (article.category || '').toLowerCase().includes(q)

      return inTitle || inSubtitle || inContent || inAuthor || inTags || inCategory
    })
  }, [articles, query, selectedCategory])

  return (
    <main className="flex-1 max-w-[1360px] mx-auto px-4 sm:px-6 py-8 w-full">
      {/* Header */}
      <div className="max-w-3xl mx-auto text-center mb-8">
        <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-accent font-bold">
          Singh Monster Archives
        </span>
        <h1 className="font-serif font-black text-3xl sm:text-5xl uppercase tracking-tight text-ink dark:text-dark-ink mt-1 mb-4">
          Search Dispatches
        </h1>
        <p className="text-sm font-serif italic text-ink-mute dark:text-dark-mute">
          Explore current breaking stories, investigative features, and historical reporting across every desk.
        </p>

        {/* Search Input Bar */}
        <form onSubmit={handleSearchSubmit} className="mt-6 flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by topic, headline, journalist, or keyword…"
              className="w-full pl-10 pr-4 py-3 bg-paper-subtle dark:bg-dark-subtle border border-rule dark:border-dark-rule font-sans text-sm text-ink dark:text-dark-ink placeholder:text-ink-mute focus:outline-none focus:border-accent"
              autoFocus
            />
            <svg
              className="w-4 h-4 absolute left-3.5 top-3.5 text-ink-mute"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-3 top-3 text-xs text-ink-mute hover:text-ink cursor-pointer"
                title="Clear"
              >
                ✕
              </button>
            )}
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-accent hover:bg-accent/90 text-white font-bold uppercase tracking-wider text-xs transition shadow-xs"
          >
            Search
          </button>
        </form>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 text-xs font-sans uppercase tracking-wider transition rounded-xs cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-ink dark:bg-dark-ink text-paper dark:text-dark-paper font-bold'
                  : 'bg-paper-subtle dark:bg-dark-subtle text-ink-mute dark:text-dark-mute hover:text-ink dark:hover:text-dark-ink border border-rule dark:border-dark-rule'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results Section */}
      <div className="border-t border-rule dark:border-dark-rule pt-6">
        <div className="flex items-center justify-between mb-6">
          <span className="text-xs font-mono uppercase tracking-wider text-ink-mute dark:text-dark-mute">
            {loading ? (
              'Searching broadsheet archives…'
            ) : (
              <>
                Showing <strong>{filteredArticles.length}</strong>{' '}
                {filteredArticles.length === 1 ? 'story' : 'stories'}
                {query ? ` matching "${query}"` : ''}
                {selectedCategory !== 'All' ? ` in ${selectedCategory}` : ''}
              </>
            )}
          </span>
        </div>

        {loading ? (
          <div className="py-20 text-center text-sm font-mono text-ink-mute">
            Retrieving stories from the archive...
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="py-20 text-center space-y-3 max-w-md mx-auto">
            <div className="w-12 h-12 mx-auto rounded-full bg-paper-subtle dark:bg-dark-subtle border border-rule dark:border-dark-rule flex items-center justify-center text-ink-mute">
              🔍
            </div>
            <h3 className="font-serif font-black text-xl text-ink dark:text-dark-ink">
              No Matches Found
            </h3>
            <p className="text-xs font-serif italic text-ink-mute dark:text-dark-mute">
              We couldn't find any published stories matching your query. Try searching with alternative keywords or clearing category filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredArticles.map((article) => (
              <div
                key={article.id}
                className="pb-6 border-b border-rule dark:border-dark-rule"
              >
                <PostCard
                  post={mapArticleToPostCard(article)}
                  variant="dense-thumb"
                  showDeck={true}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-paper dark:bg-dark-paper text-ink dark:text-dark-ink transition-colors duration-200 flex flex-col font-sans">
      <Masthead brandName="Singh Monster" tagline="Sharp reporting. Deep analysis. No agenda but the truth." />
      <Suspense fallback={<div className="p-12 text-center text-sm font-mono">Loading Search...</div>}>
        <SearchContent />
      </Suspense>
      <Footer />
    </div>
  )
}
