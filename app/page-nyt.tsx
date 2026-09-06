import Image from 'next/image'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Splash from '@/components/Splash'
import { getHomepageArticles, getRecentArticles } from '@/lib/articles'
import { getTimeAgo } from '@/lib/utils'
import { Article } from '@/types'

export const revalidate = 0
export const dynamic = 'force-dynamic'

export default async function Home() {
  const homepageArticles = await getHomepageArticles()
  const recentArticles = await getRecentArticles(10)
  
  const getByPosition = (pos: number): Article | undefined => {
    return homepageArticles.find(a => a.homepagePosition === pos)
  }
  
  // NYT-style layout positions
  const breakingNews = getByPosition(1)
  const mainStory = getByPosition(2) || homepageArticles[0]
  const secondaryStory = getByPosition(3)
  const tertiaryStory = getByPosition(4)
  
  const topStories = [
    getByPosition(5), 
    getByPosition(6), 
    getByPosition(7), 
    getByPosition(8)
  ].filter(Boolean) as Article[]
  
  const opinionPieces = [
    getByPosition(9), 
    getByPosition(10), 
    getByPosition(11)
  ].filter(Boolean) as Article[]
  
  const moreNews = [
    getByPosition(12),
    getByPosition(13),
    getByPosition(14),
    getByPosition(15),
    getByPosition(16),
    getByPosition(17),
    getByPosition(18),
    getByPosition(19),
    getByPosition(20)
  ].filter(Boolean) as Article[]
  
  const allArticles = [...homepageArticles, ...recentArticles].slice(0, 20)

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900">
      <Splash />
      <Header />
      
      <main className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-8">
        {/* Breaking News Bar */}
        {breakingNews && (
          <div className="border-t-4 border-red-600 py-2 my-4">
            <div className="flex items-center gap-3">
              <span className="text-red-600 font-bold text-xs uppercase tracking-wider">
                Breaking News
              </span>
              <Link 
                href={`/article/${breakingNews.slug}`}
                className="text-sm font-serif hover:underline"
              >
                {breakingNews.title}
              </Link>
            </div>
          </div>
        )}

        {/* Main Grid - NYT Style */}
        <div className="grid grid-cols-12 gap-4 py-6 border-b border-neutral-300 dark:border-neutral-700">
          {/* Left Column - Main Story */}
          <div className="col-span-12 lg:col-span-8 border-r-0 lg:border-r border-neutral-300 dark:border-neutral-700 pr-0 lg:pr-6">
            {mainStory && (
              <article className="mb-8">
                {mainStory.imageUrl && (
                  <Link href={`/article/${mainStory.slug}`}>
                    <div className="relative w-full h-[400px] mb-4 overflow-hidden">
                      <Image
                        src={mainStory.imageUrl}
                        alt={mainStory.title}
                        fill
                        className="object-cover hover:opacity-90 transition-opacity"
                        priority
                      />
                    </div>
                  </Link>
                )}
                <Link href={`/article/${mainStory.slug}`}>
                  <h1 className="text-4xl lg:text-5xl font-serif font-bold leading-tight mb-3 hover:text-neutral-600 dark:hover:text-neutral-400 transition-colors">
                    {mainStory.title}
                  </h1>
                </Link>
                {mainStory.excerpt && (
                  <p className="text-lg text-neutral-700 dark:text-neutral-300 font-serif leading-relaxed mb-3">
                    {mainStory.excerpt}
                  </p>
                )}
                <div className="flex items-center gap-2 text-xs text-neutral-500">
                  <Link 
                    href={`/author/${mainStory.author.toLowerCase().replace(/\s+/g, '-')}`}
                    className="hover:underline font-sans"
                  >
                    {mainStory.author}
                  </Link>
                  <span>•</span>
                  <time>{getTimeAgo(mainStory.publishedAt)}</time>
                </div>
              </article>
            )}

            {/* Secondary Stories - Horizontal Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-neutral-300 dark:border-neutral-700">
              {secondaryStory && (
                <article>
                  {secondaryStory.imageUrl && (
                    <Link href={`/article/${secondaryStory.slug}`}>
                      <div className="relative w-full h-48 mb-3 overflow-hidden">
                        <Image
                          src={secondaryStory.imageUrl}
                          alt={secondaryStory.title}
                          fill
                          className="object-cover hover:opacity-90 transition-opacity"
                        />
                      </div>
                    </Link>
                  )}
                  <Link href={`/article/${secondaryStory.slug}`}>
                    <h2 className="text-xl font-serif font-bold leading-tight mb-2 hover:text-neutral-600 dark:hover:text-neutral-400">
                      {secondaryStory.title}
                    </h2>
                  </Link>
                  {secondaryStory.excerpt && (
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed line-clamp-3">
                      {secondaryStory.excerpt}
                    </p>
                  )}
                </article>
              )}
              
              {tertiaryStory && (
                <article>
                  {tertiaryStory.imageUrl && (
                    <Link href={`/article/${tertiaryStory.slug}`}>
                      <div className="relative w-full h-48 mb-3 overflow-hidden">
                        <Image
                          src={tertiaryStory.imageUrl}
                          alt={tertiaryStory.title}
                          fill
                          className="object-cover hover:opacity-90 transition-opacity"
                        />
                      </div>
                    </Link>
                  )}
                  <Link href={`/article/${tertiaryStory.slug}`}>
                    <h2 className="text-xl font-serif font-bold leading-tight mb-2 hover:text-neutral-600 dark:hover:text-neutral-400">
                      {tertiaryStory.title}
                    </h2>
                  </Link>
                  {tertiaryStory.excerpt && (
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed line-clamp-3">
                      {tertiaryStory.excerpt}
                    </p>
                  )}
                </article>
              )}
            </div>
          </div>

          {/* Right Column - Top Stories */}
          <div className="col-span-12 lg:col-span-4">
            <div className="sticky top-4">
              <h3 className="text-xs font-bold uppercase tracking-wider border-b border-neutral-900 dark:border-neutral-100 pb-2 mb-4">
                Top Stories
              </h3>
              <div className="space-y-4">
                {topStories.length > 0 ? (
                  topStories.map((article, idx) => (
                    <article key={article.id} className="pb-4 border-b border-neutral-200 dark:border-neutral-700 last:border-0">
                      <Link href={`/article/${article.slug}`}>
                        <h4 className="font-serif font-bold text-base leading-tight mb-2 hover:text-neutral-600 dark:hover:text-neutral-400">
                          {article.title}
                        </h4>
                      </Link>
                      {article.excerpt && (
                        <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2 mb-2">
                          {article.excerpt}
                        </p>
                      )}
                      <span className="text-xs text-neutral-500 font-sans">
                        {getTimeAgo(article.publishedAt)}
                      </span>
                    </article>
                  ))
                ) : (
                  allArticles.slice(0, 4).map((article, idx) => (
                    <article key={article.id} className="pb-4 border-b border-neutral-200 dark:border-neutral-700 last:border-0">
                      <Link href={`/article/${article.slug}`}>
                        <h4 className="font-serif font-bold text-base leading-tight mb-2 hover:text-neutral-600 dark:hover:text-neutral-400">
                          {article.title}
                        </h4>
                      </Link>
                      {article.excerpt && (
                        <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2 mb-2">
                          {article.excerpt}
                        </p>
                      )}
                      <span className="text-xs text-neutral-500 font-sans">
                        {getTimeAgo(article.publishedAt)}
                      </span>
                    </article>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Opinion Section */}
        {(opinionPieces.length > 0 || allArticles.length > 5) && (
          <section className="py-8 border-b border-neutral-300 dark:border-neutral-700">
            <h3 className="text-xs font-bold uppercase tracking-wider border-b border-neutral-900 dark:border-neutral-100 pb-2 mb-6">
              Opinion
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(opinionPieces.length > 0 ? opinionPieces : allArticles.slice(5, 8)).map((article) => (
                <article key={article.id}>
                  <Link href={`/article/${article.slug}`}>
                    <h4 className="font-serif font-bold text-lg leading-tight mb-2 hover:text-neutral-600 dark:hover:text-neutral-400">
                      {article.title}
                    </h4>
                  </Link>
                  <Link 
                    href={`/author/${article.author.toLowerCase().replace(/\s+/g, '-')}`}
                    className="text-xs text-neutral-500 hover:underline font-sans block mb-2"
                  >
                    By {article.author}
                  </Link>
                  {article.excerpt && (
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-3">
                      {article.excerpt}
                    </p>
                  )}
                </article>
              ))}
            </div>
          </section>
        )}

        {/* More News - List Style */}
        {(moreNews.length > 0 || allArticles.length > 10) && (
          <section className="py-8">
            <h3 className="text-xs font-bold uppercase tracking-wider border-b border-neutral-900 dark:border-neutral-100 pb-2 mb-6">
              More News
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
              {(moreNews.length > 0 ? moreNews : allArticles.slice(10, 19)).map((article) => (
                <article key={article.id} className="flex gap-4 pb-6 border-b border-neutral-200 dark:border-neutral-700">
                  {article.imageUrl && (
                    <Link href={`/article/${article.slug}`} className="flex-shrink-0">
                      <div className="relative w-24 h-24 overflow-hidden">
                        <Image
                          src={article.imageUrl}
                          alt={article.title}
                          fill
                          className="object-cover hover:opacity-90 transition-opacity"
                        />
                      </div>
                    </Link>
                  )}
                  <div className="flex-1 min-w-0">
                    <Link href={`/section/${article.category.toLowerCase()}`}>
                      <span className="text-xs font-bold uppercase tracking-wider text-blue-600 hover:underline">
                        {article.category}
                      </span>
                    </Link>
                    <Link href={`/article/${article.slug}`}>
                      <h4 className="font-serif font-bold text-sm leading-tight mt-1 mb-1 hover:text-neutral-600 dark:hover:text-neutral-400 line-clamp-3">
                        {article.title}
                      </h4>
                    </Link>
                    <span className="text-xs text-neutral-500">
                      {getTimeAgo(article.publishedAt)}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  )
}
