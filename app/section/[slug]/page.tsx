import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Masthead from '@/components/meridian/Masthead'
import Footer from '@/components/meridian/Footer'
import PostCard from '@/components/meridian/PostCard'
import NewsletterBox from '@/components/meridian/NewsletterBox'
import BreakingTicker from '@/components/meridian/BreakingTicker'
import StockTicker from '@/components/meridian/StockTicker'
import { getArticlesByCategory, getRecentArticles } from '@/lib/articles'
import { mapArticleToPostCard } from '@/lib/meridianData'

export const dynamic = 'force-dynamic'

const KNOWN_SECTIONS: Record<string, string> = {
  us: 'U.S. News',
  world: 'World',
  politics: 'Politics',
  business: 'Business',
  technology: 'Technology',
  sports: 'Sports',
  opinion: 'Opinion',
  arts: 'Arts & Culture',
  culture: 'Culture',
  style: 'Style',
  weather: 'Weather',
  education: 'Education',
  lifestyle: 'Lifestyle',
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const sectionSlug = params.slug.toLowerCase()
  const sectionTitle = KNOWN_SECTIONS[sectionSlug] || sectionSlug.charAt(0).toUpperCase() + sectionSlug.slice(1)

  return {
    title: `${sectionTitle} — Singh Monster`,
    description: `Comprehensive reporting, investigative journalism, and deep analysis in ${sectionTitle}.`,
  }
}

export default async function SectionPage({
  params,
}: {
  params: { slug: string }
}) {
  const rawSlug = params.slug.toLowerCase()
  const sectionName = KNOWN_SECTIONS[rawSlug] || rawSlug.charAt(0).toUpperCase() + rawSlug.slice(1)

  // Fetch articles matching category
  let articles = await getArticlesByCategory(rawSlug)
  
  // If no direct slug match, check with capitalized name or aliases
  if (articles.length === 0) {
    articles = await getArticlesByCategory(sectionName)
  }
  if (articles.length === 0 && rawSlug === 'us') {
    articles = await getArticlesByCategory('U.S.')
  }

  // Also fetch recent articles for a sidebar/rail
  const recentArticles = await getRecentArticles(6)
  const sidebarStories = recentArticles
    .filter((a) => !articles.some((catArt) => catArt.id === a.id))
    .slice(0, 4)
    .map(mapArticleToPostCard)

  const leadArticle = articles[0]
  const remainingArticles = articles.slice(1)

  const breakingSlot = recentArticles.find(
    (a) =>
      (a.homepage_position ?? (a as any).homepagePosition) === 1 ||
      a.is_breaking ||
      (a as any).isBreaking
  )
  const tickerItems = breakingSlot
    ? [
        { id: String(breakingSlot.id), title: breakingSlot.title, url: `/article/${breakingSlot.slug}` },
        ...recentArticles
          .filter((a) => a.id !== breakingSlot.id)
          .slice(0, 4)
          .map((a) => ({ id: String(a.id), title: a.title, url: `/article/${a.slug}` })),
      ]
    : recentArticles.slice(0, 5).map((a) => ({ id: String(a.id), title: a.title, url: `/article/${a.slug}` }))

  return (
    <div className="min-h-screen bg-paper dark:bg-dark-paper text-ink dark:text-dark-ink transition-colors duration-200 flex flex-col font-sans">
      <BreakingTicker items={tickerItems} />
      <StockTicker />
      <Masthead brandName="Singh Monster" tagline="Sharp reporting. Deep analysis. No agenda but the truth." />

      <main className="flex-1 max-w-[1360px] mx-auto px-4 sm:px-6 py-6 w-full">
        {/* Section Header Banner */}
        <header className="pb-5 mb-8 border-b-2 border-ink dark:border-dark-ink">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-accent font-bold">
                Section // Dispatch
              </span>
              <h1 className="font-serif font-black text-3xl sm:text-5xl uppercase tracking-tight text-ink dark:text-dark-ink mt-1">
                {sectionName}
              </h1>
            </div>
            <span className="text-xs font-mono text-ink-mute dark:text-dark-mute">
              {articles.length} {articles.length === 1 ? 'article' : 'articles'} in section
            </span>
          </div>
        </header>

        {articles.length === 0 ? (
          /* Clean Subtle Empty State with zero emojis and recommended feed */
          <div className="space-y-12">
            <div className="py-14 text-center max-w-lg mx-auto space-y-4 px-4">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-paper-subtle dark:bg-white/[0.04] border border-rule/70 dark:border-white/10 flex items-center justify-center text-ink-mute dark:text-dark-mute shadow-xs">
                <svg className="w-5 h-5 opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
                  <path d="M18 14h-8" />
                  <path d="M15 18h-5" />
                  <path d="M10 6h8v4h-8V6Z" />
                </svg>
              </div>
              <h2 className="font-serif font-black text-2xl text-ink dark:text-dark-ink">
                No Dispatches Filed Yet
              </h2>
              <p className="text-sm text-ink-mute dark:text-dark-mute font-serif leading-relaxed">
                Our correspondents and desk editors have not filed recent dispatches under{' '}
                <strong className="text-ink dark:text-dark-ink font-bold">{sectionName}</strong> today.
                Explore the latest front-page reporting or check back shortly.
              </p>
              <div className="pt-2">
                <a
                  href="/"
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-rule/70 dark:border-white/15 text-xs font-semibold text-ink dark:text-white hover:border-accent dark:hover:border-accent hover:text-accent transition shadow-xs"
                >
                  <span>Return to Front Page</span>
                  <span>→</span>
                </a>
              </div>
            </div>

            {/* Curated Feed Below Empty State so page isn't a dead-end */}
            {recentArticles.length > 0 && (
              <div className="pt-8 border-t border-rule/60 dark:border-dark-rule">
                <div className="flex items-baseline justify-between pb-3 border-b-2 border-ink dark:border-dark-ink mb-6">
                  <h3 className="font-sans font-bold text-xs uppercase tracking-[0.16em] text-accent">
                    Latest Dispatches Across Singh Monster
                  </h3>
                  <span className="text-[11px] font-mono text-ink-mute dark:text-dark-mute">
                    Front-Page Editions
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recentArticles.slice(0, 3).map((article) => (
                    <PostCard
                      key={article.id}
                      post={mapArticleToPostCard(article)}
                      variant="feed"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Section Content Layout */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main Column: Lead Story + Grid */}
            <div className="lg:col-span-8 xl:col-span-9 space-y-10">
              {/* Lead Article */}
              {leadArticle && (
                <div className="pb-8 border-b border-rule dark:border-dark-rule">
                  <PostCard
                    post={mapArticleToPostCard(leadArticle)}
                    variant="hero"
                    showDeck={true}
                    priority={true}
                  />
                </div>
              )}

              {/* Secondary Stories Grid */}
              {remainingArticles.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-accent mb-4">
                    Latest Dispatches & Analyses
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {remainingArticles.map((article) => (
                      <div
                        key={article.id}
                        className="pb-6 border-b sm:border-b-0 sm:border-r last:border-r-0 border-rule dark:border-dark-rule sm:pr-6"
                      >
                        <PostCard
                          post={mapArticleToPostCard(article)}
                          variant="dense-thumb"
                          showDeck={true}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar Rail: Across Singh Monster */}
            <aside className="lg:col-span-4 xl:col-span-3 space-y-6 border-t lg:border-t-0 lg:border-l border-rule dark:border-dark-rule lg:pl-6">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-accent pb-2 border-b border-rule dark:border-dark-rule mb-4">
                  Across Singh Monster
                </h3>
                <div className="space-y-4">
                  {sidebarStories.map((story) => (
                    <PostCard
                      key={story.id}
                      post={story}
                      variant="feed"
                    />
                  ))}
                </div>
              </div>

              {/* Newsletter Callout */}
              <NewsletterBox />
            </aside>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
