import BreakingTicker from '@/components/meridian/BreakingTicker'
import StockTicker from '@/components/meridian/StockTicker'
import Masthead from '@/components/meridian/Masthead'
import HomeHeroGrid from '@/components/meridian/HomeHeroGrid'
import EditorsPicks from '@/components/meridian/EditorsPicks'
import WorldSection from '@/components/meridian/WorldSection'
import Footer from '@/components/meridian/Footer'
import { getHomepageArticles, getRecentArticles } from '@/lib/articles'
import { mapArticleToPostCard } from '@/lib/meridianData'
import { Article } from '@/types'
import { cloudGet, CLOUD_KEYS } from '@/lib/backend/cloudStore'

export const revalidate = 0
export const dynamic = 'force-dynamic'

export default async function HomePage() {
  let homepageArticles: Article[] = []
  let recentArticles: Article[] = []
  let editorialConfig: any = null

  try {
    editorialConfig = await cloudGet(CLOUD_KEYS.EDITORIAL_CONFIG)
  } catch {}

  try {
    const [hp, rec] = await Promise.all([
      getHomepageArticles(),
      getRecentArticles(30),
    ])
    homepageArticles = hp
    recentArticles = rec
  } catch (error) {
    console.error('Error loading articles in HomePage:', error)
  }

  // Helper to distinguish dummy seed placeholder articles from real user-published articles
  const isSeed = (a?: Article) => Boolean(a?.id && String(a.id).startsWith('n-'))

  // Helper to find pinned article for a slot
  const getPinned = (pos: number): Article | undefined => {
    return (
      homepageArticles.find((a) => (a.homepage_position ?? a.homepagePosition) === pos) ||
      recentArticles.find((a) => (a.homepage_position ?? a.homepagePosition) === pos)
    )
  }

  // Set of IDs that are explicitly pinned so auto-flow doesn't duplicate them
  const pinnedIds = new Set<string>()
  for (let i = 1; i <= 15; i++) {
    const p = getPinned(i)
    if (p?.id && !isSeed(p)) pinnedIds.add(String(p.id))
  }

  // Real published articles that are unpinned or fresh
  const realUnpinned = recentArticles.filter((a) => !isSeed(a) && !pinnedIds.has(String(a.id)))
  // Remaining pool of all unpinned articles
  const genericUnpinned = recentArticles.filter((a) => isSeed(a) && !pinnedIds.has(String(a.id)))

  let realIndex = 0
  let genericIndex = 0

  const getNextStory = (slotPos: number): Article | undefined => {
    const pinned = getPinned(slotPos)
    // If pinned story is a real user article, always prioritize it
    if (pinned && !isSeed(pinned)) return pinned
    // If we have an unpinned real user article, let it take precedence over dummy seed pins
    if (realIndex < realUnpinned.length) {
      return realUnpinned[realIndex++]
    }
    // Otherwise keep the seed pinned article if available
    if (pinned) return pinned
    // Fallback to next generic unpinned story
    return genericUnpinned[genericIndex++]
  }

  // 1. Ticker (Slot 1 or breaking stories or newest real story)
  const slot1 =
    recentArticles.find((a) => a.is_breaking || a.isBreaking) ||
    (realUnpinned[0] ? realUnpinned[0] : getPinned(1)) ||
    recentArticles[0]

  const tickerItems = recentArticles.length > 0
    ? [
        ...(slot1 ? [{ id: String(slot1.id), title: slot1.title, url: `/article/${slot1.slug}` }] : []),
        ...recentArticles
          .filter((a) => a.id !== slot1?.id)
          .slice(0, 5)
          .map((a) => ({ id: String(a.id), title: a.title, url: `/article/${a.slug}` })),
      ]
    : undefined

  // 2. Main Hero Story (Slot 2 or fresh story)
  const heroArticle = getNextStory(2) || recentArticles[0]
  const heroStory = heroArticle ? mapArticleToPostCard(heroArticle) : undefined

  // 3. Left Rail Stories (Slot 3 and 4)
  const left1 = getNextStory(3) || recentArticles[1]
  const left2 = getNextStory(4) || recentArticles[2]
  const leftStories = [left1, left2].filter(Boolean).map((a) => mapArticleToPostCard(a!))

  // 4. Center Sub-Leads (Slot 5 and 6)
  const sub1 = getNextStory(5) || recentArticles[3]
  const sub2 = getNextStory(6) || recentArticles[4]
  const subLeads = [sub1, sub2].filter(Boolean).map((a) => mapArticleToPostCard(a!))

  // 5. Ranked Stories (Slots 7 to 11)
  const rankedSource: Article[] = []
  for (let s = 7; s <= 11; s++) {
    const art = getNextStory(s)
    if (art) rankedSource.push(art)
  }

  const rankedStories =
    rankedSource.length > 0
      ? rankedSource.map((a, idx) => ({
          ...mapArticleToPostCard(a),
          rank: String(idx + 6).padStart(2, '0'),
        }))
      : undefined

  // 6. Editor's Picks (Slots 12 to 15)
  const picksSource: Article[] = []
  for (let s = 12; s <= 15; s++) {
    const art = getNextStory(s)
    if (art) picksSource.push(art)
  }
  const editorPicks = picksSource.length > 0 ? picksSource.map((a) => mapArticleToPostCard(a)) : undefined

  // 7. World Category Section from live dispatches
  const worldArticles = recentArticles.filter(
    (a) => a.category?.toLowerCase() === 'world' || a.category?.toLowerCase() === 'international'
  )
  const worldFeatured = worldArticles[0]
    ? {
        ...mapArticleToPostCard(worldArticles[0]),
        caption: worldArticles[0].image_caption || worldArticles[0].imageCaption || undefined,
      }
    : undefined
  const worldSecondary =
    worldArticles.length > 1
      ? worldArticles.slice(1, 5).map((a) => mapArticleToPostCard(a))
      : undefined

  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000').replace(/\/$/, '')

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'NewsMediaOrganization',
    'name': 'Singh Monster',
    'url': baseUrl,
    'logo': `${baseUrl}/authr.png`,
    'publishingPrinciples': `${baseUrl}/about`,
    'founder': {
      '@type': 'Person',
      'name': 'Dhananjay Singh',
      'jobTitle': 'Admin & Editor-in-Chief',
    },
    'sameAs': [
      'https://twitter.com/SinghMonster',
      'https://www.linkedin.com/company/singhmonster',
    ],
  }

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'name': 'Singh Monster',
    'url': baseUrl,
    'potentialAction': {
      '@type': 'SearchAction',
      'target': `${baseUrl}/?search={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <div className="min-h-screen bg-paper dark:bg-dark-paper text-ink dark:text-dark-ink transition-colors duration-200">
      {/* Search Engine Organization & WebSite Schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />

      {/* 1. Live Breaking News Ticker & Live Indian Stock Ticker */}
      <BreakingTicker items={tickerItems} />
      <StockTicker />

      {/* 2. Editorial Masthead with flourishes and navigation */}
      <Masthead brandName="Singh Monster" tagline="Sharp reporting. Deep analysis. No agenda but the truth." />


      {/* 3. Main Broadsheet Container */}
      <main className="max-w-[1360px] mx-auto px-4 sm:px-6">
        {/* 3-Column Broadsheet Hero Grid */}
        <HomeHeroGrid
          heroStory={heroStory}
          leftStories={leftStories.length > 0 ? leftStories : undefined}
          subLeads={subLeads.length > 0 ? subLeads : undefined}
          rankedStories={rankedStories}
          editorsNote={editorialConfig?.editorsNote}
          recommendedItems={editorialConfig?.recommendedItems}
        />

        {/* 4. Editor's Picks 4-Card Carousel */}
        <EditorsPicks articles={editorPicks} />

        {/* 5. World Category Section with Split Layout */}
        <WorldSection
          title="World"
          moreUrl="/section/world"
          featuredArticle={worldFeatured}
          secondaryArticles={worldSecondary}
        />
      </main>

      {/* 6. Newspaper Broadsheet Footer */}
      <Footer brandName="Singh Monster" />
    </div>
  )
}
