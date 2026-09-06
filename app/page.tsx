import Image from 'next/image'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ScrollToTop from '@/components/ScrollToTop'
import TopStoriesScroll from '@/components/TopStoriesScroll'
import { getHomepageArticles, getRecentArticles } from '@/lib/articles'
import { getTimeAgo } from '@/lib/utils'
import { Article } from '@/types'

export const revalidate = 0
export const dynamic = 'force-dynamic'

export default async function Home() {
  const homepageArticles = await getHomepageArticles()
  const recentArticles = await getRecentArticles(20)
  
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
      <Header />
      
      <main className="max-w-[1280px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        {/* Breaking News Bar */}
        {breakingNews && (
          <div className="bg-red-600 text-white py-2 sm:py-2.5 px-3 sm:px-5 my-3 sm:my-4 -mx-3 sm:-mx-4 md:mx-0 md:rounded-sm">
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="font-bold text-[10px] sm:text-xs uppercase tracking-widest flex-shrink-0 border-r border-red-400 pr-2 sm:pr-3">
                Breaking
              </span>
              <Link 
                href={`/article/${breakingNews.slug}`}
                className="text-xs sm:text-sm font-serif hover:underline flex-1 line-clamp-1"
              >
                {breakingNews.title}
              </Link>
            </div>
          </div>
        )}

        {/* Main Grid - Enhanced NYT Style */}
        <div className="grid grid-cols-12 gap-4 sm:gap-6 lg:gap-8 py-4 sm:py-6 md:py-8 border-b-2 border-neutral-900 dark:border-neutral-100">
          {/* Left Column - Main Story */}
          <div className="col-span-12 lg:col-span-8 lg:border-r lg:border-neutral-300 dark:lg:border-neutral-700 lg:pr-8">
            {mainStory && (
              <article className="mb-6 sm:mb-8 md:mb-10">
                {mainStory.imageUrl && (
                  <Link href={`/article/${mainStory.slug}`} className="block mb-3 sm:mb-4">
                    <div className="relative w-full aspect-[16/10] overflow-hidden bg-neutral-200 dark:bg-neutral-800 group rounded-sm">
                      <Image
                        src={mainStory.imageUrl}
                        alt={mainStory.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        priority
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 66vw, 800px"
                        quality={85}
                      />
                    </div>
                  </Link>
                )}
                <div className="space-y-2 sm:space-y-3">
                  <Link href={`/section/${mainStory.category.toLowerCase()}`}>
                    <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 hover:underline">
                      {mainStory.category}
                    </span>
                  </Link>
                  <Link href={`/article/${mainStory.slug}`}>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold leading-[1.1] tracking-tight hover:text-neutral-600 dark:hover:text-neutral-400 transition-colors">
                      {mainStory.title}
                    </h1>
                  </Link>
                  {mainStory.excerpt && (
                    <p className="text-sm sm:text-base md:text-lg text-neutral-700 dark:text-neutral-300 font-serif leading-relaxed line-clamp-3 sm:line-clamp-none">
                      {mainStory.excerpt}
                    </p>
                  )}
                  <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-neutral-500 dark:text-neutral-400 pt-2 border-t border-neutral-200 dark:border-neutral-700">
                    <Link 
                      href={`/author/${mainStory.author.toLowerCase().replace(/\s+/g, '-')}`}
                      className="font-semibold hover:underline"
                    >
                      By {mainStory.author}
                    </Link>
                    <span>•</span>
                    <time className="font-serif">{getTimeAgo(mainStory.publishedAt)}</time>
                  </div>
                </div>
              </article>
            )}

            {/* Secondary Stories - Horizontal Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 pt-8 border-t border-neutral-200 dark:border-neutral-700">
              {secondaryStory && (
                <article className="space-y-3">
                  {secondaryStory.imageUrl && (
                    <Link href={`/article/${secondaryStory.slug}`} className="block">
                      <div className="relative w-full aspect-[16/9] overflow-hidden bg-neutral-200 dark:bg-neutral-800 group">
                        <Image
                          src={secondaryStory.imageUrl}
                          alt={secondaryStory.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          priority
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 400px"
                          quality={80}
                        />
                      </div>
                    </Link>
                  )}
                  <Link href={`/section/${secondaryStory.category.toLowerCase()}`}>
                    <span className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 hover:underline">
                      {secondaryStory.category}
                    </span>
                  </Link>
                  <Link href={`/article/${secondaryStory.slug}`}>
                    <h2 className="text-xl md:text-2xl font-serif font-bold leading-tight hover:text-neutral-600 dark:hover:text-neutral-400">
                      {secondaryStory.title}
                    </h2>
                  </Link>
                  {secondaryStory.excerpt && (
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed line-clamp-2 font-serif">
                      {secondaryStory.excerpt}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                    <span className="font-semibold">{secondaryStory.author}</span>
                    <span>•</span>
                    <time className="font-serif">{getTimeAgo(secondaryStory.publishedAt)}</time>
                  </div>
                </article>
              )}
              
              {tertiaryStory && (
                <article className="space-y-3">
                  {tertiaryStory.imageUrl && (
                    <Link href={`/article/${tertiaryStory.slug}`} className="block">
                      <div className="relative w-full aspect-[16/9] overflow-hidden bg-neutral-200 dark:bg-neutral-800 group">
                        <Image
                          src={tertiaryStory.imageUrl}
                          alt={tertiaryStory.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          priority
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 400px"
                          quality={80}
                        />
                      </div>
                    </Link>
                  )}
                  <Link href={`/section/${tertiaryStory.category.toLowerCase()}`}>
                    <span className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 hover:underline">
                      {tertiaryStory.category}
                    </span>
                  </Link>
                  <Link href={`/article/${tertiaryStory.slug}`}>
                    <h2 className="text-xl md:text-2xl font-serif font-bold leading-tight hover:text-neutral-600 dark:hover:text-neutral-400">
                      {tertiaryStory.title}
                    </h2>
                  </Link>
                  {tertiaryStory.excerpt && (
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed line-clamp-2 font-serif">
                      {tertiaryStory.excerpt}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                    <span className="font-semibold">{tertiaryStory.author}</span>
                    <span>•</span>
                    <time className="font-serif">{getTimeAgo(tertiaryStory.publishedAt)}</time>
                  </div>
                </article>
              )}
            </div>
          </div>

          {/* Right Column - Top Stories */}
          <div className="col-span-12 lg:col-span-4">
            <div className="sticky top-4">
              <h3 className="text-xs font-bold uppercase tracking-widest border-b-2 border-neutral-900 dark:border-neutral-100 pb-2 mb-6">
                Editor's Picks
              </h3>
              <div className="space-y-6">
                {(topStories.length > 0 ? topStories : allArticles.slice(0, 6)).map((article, index) => (
                  <article key={article.id} className="flex gap-4 pb-6 border-b border-neutral-200 dark:border-neutral-700 last:border-b-0">
                    <span className="text-3xl font-serif font-bold text-neutral-300 dark:text-neutral-600 flex-shrink-0 leading-none">
                      {index + 1}
                    </span>
                    <div className="flex-1 space-y-2">
                      <Link href={`/article/${article.slug}`}>
                        <h4 className="font-serif font-bold text-base leading-tight hover:text-neutral-600 dark:hover:text-neutral-400 line-clamp-3">
                          {article.title}
                        </h4>
                      </Link>
                      <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                        <span className="font-semibold">{article.author}</span>
                        <span>•</span>
                        <time className="font-serif">{getTimeAgo(article.publishedAt)}</time>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Opinion Section */}
        {(opinionPieces.length > 0 || allArticles.length > 5) && (
          <section className="py-10 border-b border-neutral-200 dark:border-neutral-700">
            <h3 className="text-xs font-bold uppercase tracking-widest border-b-2 border-neutral-900 dark:border-neutral-100 pb-2 mb-8">
              Opinion
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {(opinionPieces.length > 0 ? opinionPieces : allArticles.slice(5, 8)).map((article) => (
                <article key={article.id} className="space-y-3">
                  {article.imageUrl && (
                    <Link href={`/article/${article.slug}`} className="block">
                      <div className="relative w-full aspect-[4/3] overflow-hidden bg-neutral-200 dark:bg-neutral-800 group">
                        <Image
                          src={article.imageUrl}
                          alt={article.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 33vw, 350px"
                          quality={75}
                        />
                      </div>
                    </Link>
                  )}
                  <Link href={`/article/${article.slug}`}>
                    <h4 className="font-serif font-bold text-xl leading-tight hover:text-neutral-600 dark:hover:text-neutral-400">
                      {article.title}
                    </h4>
                  </Link>
                  <Link 
                    href={`/author/${article.author.toLowerCase().replace(/\s+/g, '-')}`}
                    className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:underline"
                  >
                    By {article.author}
                  </Link>
                  {article.excerpt && (
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-3 font-serif leading-relaxed">
                      {article.excerpt}
                    </p>
                  )}
                </article>
              ))}
            </div>
          </section>
        )}

        {/* World News Section */}
        <section className="py-10 border-b border-neutral-200 dark:border-neutral-700">
          <h3 className="text-xs font-bold uppercase tracking-widest border-b-2 border-neutral-900 dark:border-neutral-100 pb-2 mb-8">
            World
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {allArticles.slice(8, 11).map((article) => (
              <article key={article.id} className="space-y-3">
                {article.imageUrl && (
                  <Link href={`/article/${article.slug}`} className="block">
                    <div className="relative w-full aspect-[16/9] overflow-hidden bg-neutral-200 dark:bg-neutral-800 group">
                      <Image
                        src={article.imageUrl}
                        alt={article.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 33vw, 400px"
                        quality={75}
                      />
                    </div>
                  </Link>
                )}
                <Link href={`/article/${article.slug}`}>
                  <h4 className="font-serif font-bold text-lg md:text-xl leading-tight hover:text-neutral-600 dark:hover:text-neutral-400">
                    {article.title}
                  </h4>
                </Link>
                {article.excerpt && (
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2 font-serif leading-relaxed">
                    {article.excerpt}
                  </p>
                )}
                <div className="flex items-center gap-2 text-xs text-neutral-500">
                  <time className="font-serif">{getTimeAgo(article.publishedAt)}</time>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Business Section */}
        <section className="py-10 border-b border-neutral-200 dark:border-neutral-700">
          <h3 className="text-xs font-bold uppercase tracking-widest border-b-2 border-neutral-900 dark:border-neutral-100 pb-2 mb-8">
            Business
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {allArticles.slice(11, 15).map((article) => (
              <article key={article.id} className="flex gap-5">
                {article.imageUrl && (
                  <Link href={`/article/${article.slug}`} className="flex-shrink-0">
                    <div className="relative w-36 h-36 overflow-hidden bg-neutral-200 dark:bg-neutral-800 group">
                      <Image
                        src={article.imageUrl}
                        alt={article.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                        sizes="144px"
                        quality={70}
                      />
                    </div>
                  </Link>
                )}
                <div className="flex-1 space-y-2">
                  <Link href={`/section/${article.category.toLowerCase()}`}>
                    <span className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 hover:underline">
                      {article.category}
                    </span>
                  </Link>
                  <Link href={`/article/${article.slug}`}>
                    <h4 className="font-serif font-bold text-base md:text-lg leading-tight hover:text-neutral-600 dark:hover:text-neutral-400">
                      {article.title}
                    </h4>
                  </Link>
                  {article.excerpt && (
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2 font-serif">
                      {article.excerpt}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-xs text-neutral-500">
                    <time className="font-serif">{getTimeAgo(article.publishedAt)}</time>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* More News - List Style */}
        {(moreNews.length > 0 || allArticles.length > 10) && (
          <section className="py-10 border-b border-neutral-200 dark:border-neutral-700">
            <h3 className="text-xs font-bold uppercase tracking-widest border-b-2 border-neutral-900 dark:border-neutral-100 pb-2 mb-8">
              More News
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-8">
              {(moreNews.length > 0 ? moreNews : allArticles.slice(10, 30)).map((article) => (
                <article key={article.id} className="flex gap-4 pb-8 border-b border-neutral-200 dark:border-neutral-700">
                  {article.imageUrl && (
                    <Link href={`/article/${article.slug}`} className="flex-shrink-0">
                      <div className="relative w-28 h-28 overflow-hidden bg-neutral-200 dark:bg-neutral-800 group">
                        <Image
                          src={article.imageUrl}
                          alt={article.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                          sizes="112px"
                          quality={70}
                        />
                      </div>
                    </Link>
                  )}
                  <div className="flex-1 min-w-0 space-y-2">
                    <Link href={`/section/${article.category.toLowerCase()}`}>
                      <span className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 hover:underline block">
                        {article.category}
                      </span>
                    </Link>
                    <Link href={`/article/${article.slug}`}>
                      <h4 className="font-serif font-bold text-sm md:text-base leading-tight hover:text-neutral-600 dark:hover:text-neutral-400 line-clamp-3">
                        {article.title}
                      </h4>
                    </Link>
                    <div className="flex items-center gap-2 text-xs text-neutral-500">
                      <time className="font-serif">{getTimeAgo(article.publishedAt)}</time>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Technology Section */}
        <section className="py-10 border-b border-neutral-200 dark:border-neutral-700">
          <h3 className="text-xs font-bold uppercase tracking-widest border-b-2 border-neutral-900 dark:border-neutral-100 pb-2 mb-8">
            Technology
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {allArticles.slice(30, 34).map((article) => (
              <article key={article.id} className="space-y-3">
                {article.imageUrl && (
                  <Link href={`/article/${article.slug}`} className="block">
                    <div className="relative w-full aspect-[4/3] overflow-hidden bg-neutral-200 dark:bg-neutral-800 group">
                      <Image
                        src={article.imageUrl}
                        alt={article.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 25vw, 300px"
                        quality={70}
                      />
                    </div>
                  </Link>
                )}
                <Link href={`/article/${article.slug}`}>
                  <h4 className="font-serif font-bold text-sm md:text-base leading-tight hover:text-neutral-600 dark:hover:text-neutral-400 line-clamp-3">
                    {article.title}
                  </h4>
                </Link>
                <div className="flex items-center gap-2 text-xs text-neutral-500">
                  <time className="font-serif">{getTimeAgo(article.publishedAt)}</time>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Sports Section */}
        <section className="py-10 border-b border-neutral-200 dark:border-neutral-700">
          <h3 className="text-xs font-bold uppercase tracking-widest border-b-2 border-neutral-900 dark:border-neutral-100 pb-2 mb-8">
            Sports
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {allArticles.slice(34, 37).map((article) => (
              <article key={article.id} className="space-y-3">
                {article.imageUrl && (
                  <Link href={`/article/${article.slug}`} className="block">
                    <div className="relative w-full aspect-[16/9] overflow-hidden bg-neutral-200 dark:bg-neutral-800 group">
                      <Image
                        src={article.imageUrl}
                        alt={article.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 33vw, 400px"
                        quality={70}
                      />
                    </div>
                  </Link>
                )}
                <Link href={`/article/${article.slug}`}>
                  <h4 className="font-serif font-bold text-base md:text-lg leading-tight hover:text-neutral-600 dark:hover:text-neutral-400">
                    {article.title}
                  </h4>
                </Link>
                {article.excerpt && (
                  <p className="text-xs md:text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2 font-serif leading-relaxed">
                    {article.excerpt}
                  </p>
                )}
                <div className="flex items-center gap-2 text-xs text-neutral-500">
                  <time className="font-serif">{getTimeAgo(article.publishedAt)}</time>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Arts & Culture Section */}
        <section className="py-10">
          <h3 className="text-xs font-bold uppercase tracking-widest border-b-2 border-neutral-900 dark:border-neutral-100 pb-2 mb-8">
            Arts & Culture
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {allArticles.slice(37, 41).map((article) => (
              <article key={article.id} className="space-y-3">
                {article.imageUrl && (
                  <Link href={`/article/${article.slug}`} className="block">
                    <div className="relative w-full aspect-[3/4] overflow-hidden bg-neutral-200 dark:bg-neutral-800 group">
                      <Image
                        src={article.imageUrl}
                        alt={article.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 300px"
                        quality={70}
                      />
                    </div>
                  </Link>
                )}
                <Link href={`/article/${article.slug}`}>
                  <h4 className="font-serif font-bold text-sm md:text-base leading-tight hover:text-neutral-600 dark:hover:text-neutral-400 line-clamp-2">
                    {article.title}
                  </h4>
                </Link>
                <div className="flex items-center gap-2 text-xs text-neutral-500">
                  <time className="font-serif">{getTimeAgo(article.publishedAt)}</time>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      <Footer />
      <ScrollToTop />
    </div>
  )
}
