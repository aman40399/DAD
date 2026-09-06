import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import Image from 'next/image'
import { getAllArticles } from '@/lib/articles'
import { getTimeAgo } from '@/lib/utils'

export const revalidate = 60

export default async function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const query = searchParams.q?.toLowerCase() || ''
  const allArticles = await getAllArticles()
  
  // Filter articles based on search query
  const filteredArticles = query
    ? allArticles.filter(
        (article) =>
          article.title.toLowerCase().includes(query) ||
          article.excerpt?.toLowerCase().includes(query) ||
          article.content.toLowerCase().includes(query) ||
          article.author.toLowerCase().includes(query) ||
          article.category.toLowerCase().includes(query)
      )
    : []

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-white dark:bg-background-dark">
      <div className="layout-container flex h-full grow flex-col">
        <div className="flex flex-1 justify-center">
          <div className="layout-content-container flex flex-col w-full flex-1">
            <Header />

            <main className="px-4 md:px-10 lg:px-20 max-w-[1400px] mx-auto w-full py-8">
              {/* Search Header */}
              <div className="border-b-4 border-black dark:border-white pb-6 mb-8">
                <h1 className="text-primary dark:text-neutral-50 text-4xl md:text-5xl font-black font-body leading-tight mb-3">
                  Search Results
                </h1>
                {query ? (
                  <p className="text-neutral-600 dark:text-neutral-400 text-lg font-body">
                    Found <strong>{filteredArticles.length}</strong> results for "{query}"
                  </p>
                ) : (
                  <p className="text-neutral-600 dark:text-neutral-400 text-lg font-body">
                    Enter a search query to find articles
                  </p>
                )}
              </div>

              {/* Search Form */}
              <form method="GET" action="/search" className="mb-8">
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="q"
                    defaultValue={query}
                    placeholder="Search articles, authors, categories..."
                    className="flex-1 px-4 py-3 border-2 border-neutral-300 dark:border-neutral-600 rounded-sm bg-white dark:bg-neutral-800 text-primary dark:text-neutral-50 focus:outline-none focus:ring-2 focus:ring-blue-600 font-sans"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="px-6 py-3 bg-blue-600 text-white font-bold rounded-sm hover:bg-blue-700 transition-colors"
                  >
                    Search
                  </button>
                </div>
              </form>

              {/* Search Results */}
              {query && (
                <div className="space-y-6">
                  {filteredArticles.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-neutral-600 dark:text-neutral-400 text-lg font-body mb-4">
                        No articles found matching your search.
                      </p>
                      <p className="text-neutral-500 dark:text-neutral-500 text-sm font-sans mb-6">
                        Try different keywords or browse our sections
                      </p>
                      <Link href="/" className="text-blue-600 hover:underline font-sans font-semibold">
                        Back to Home →
                      </Link>
                    </div>
                  ) : (
                    filteredArticles.map((article) => (
                      <article
                        key={article.id}
                        className="border-b border-neutral-200 dark:border-neutral-700 pb-6 hover:bg-neutral-50 dark:hover:bg-neutral-900 p-4 -mx-4 transition-colors"
                      >
                        <div className="flex flex-col md:flex-row gap-4">
                          {article.imageUrl && (
                            <Link href={`/article/${article.slug}`} className="flex-shrink-0">
                              <div className="relative w-full md:w-48 aspect-video overflow-hidden">
                                <Image
                                  src={article.imageUrl}
                                  alt={article.title}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            </Link>
                          )}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Link href={`/section/${article.category.toLowerCase()}`}>
                                <span className="text-xs font-sans font-bold text-blue-600 uppercase tracking-wider hover:underline">
                                  {article.category}
                                </span>
                              </Link>
                              <span className="text-neutral-400">•</span>
                              <span className="text-xs text-neutral-500 font-sans">
                                {getTimeAgo(article.publishedAt)}
                              </span>
                            </div>
                            <Link href={`/article/${article.slug}`}>
                              <h2 className="text-primary dark:text-neutral-50 text-xl md:text-2xl font-bold font-body leading-tight hover:underline mb-2">
                                {article.title}
                              </h2>
                            </Link>
                            {article.excerpt && (
                              <p className="text-neutral-600 dark:text-neutral-400 text-sm font-body leading-relaxed mb-2 line-clamp-2">
                                {article.excerpt}
                              </p>
                            )}
                            <Link
                              href={`/author/${article.author.toLowerCase().replace(/\s+/g, '-')}`}
                              className="text-sm text-neutral-500 hover:underline font-sans"
                            >
                              By {article.author}
                            </Link>
                          </div>
                        </div>
                      </article>
                    ))
                  )}
                </div>
              )}
            </main>

            <Footer />
          </div>
        </div>
      </div>
    </div>
  )
}
