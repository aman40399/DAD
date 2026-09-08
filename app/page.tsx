import BreakingTicker from '@/components/meridian/BreakingTicker'
import StockTicker from '@/components/meridian/StockTicker'
import Masthead from '@/components/meridian/Masthead'
import HomeHeroGrid from '@/components/meridian/HomeHeroGrid'
import EditorsPicks from '@/components/meridian/EditorsPicks'
import WorldSection from '@/components/meridian/WorldSection'
import Footer from '@/components/meridian/Footer'
import fs from 'fs'
import path from 'path'
import { getHomepageArticles, getRecentArticles } from '@/lib/articles'
import { mapArticleToPostCard } from '@/lib/meridianData'
import { Article } from '@/types'

export const revalidate = 0
export const dynamic = 'force-dynamic'

export default async function HomePage() {
  let homepageArticles: Article[] = []
  let recentArticles: Article[] = []
  let editorialConfig: any = null

  try {
    const configPath = path.join(process.cwd(), 'data', 'editorialConfig.json')
    if (fs.existsSync(configPath)) {
      editorialConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
    }
  } catch {}

  try {
    homepageArticles = await getHomepageArticles()
    recentArticles = await getRecentArticles(30)
  } catch (error) {
    console.error('Error loading articles in HomePage:', error)
  }

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
    if (p?.id) pinnedIds.add(String(p.id))
  }

  // Auto-flow pool: published articles that are not pinned to any slot
  const unpinnedPool = recentArticles.filter((a) => !pinnedIds.has(String(a.id)))
  let poolIndex = 0
  const getNextUnpinned = (): Article | undefined => {
    return unpinnedPool[poolIndex++]
  }

  // 1. Ticker (Slot 1 or breaking stories)
  const slot1 = getPinned(1) || recentArticles.find((a) => a.is_breaking || a.isBreaking)
  const tickerItems = slot1
    ? [
        { id: String(slot1.id), title: slot1.title, url: `/article/${slot1.slug}` },
        ...recentArticles.slice(0, 4).map((a) => ({ id: String(a.id), title: a.title, url: `/article/${a.slug}` })),
      ]
    : undefined

  // 2. Main Hero Story (Slot 2 or next unpinned)
  const heroArticle = getPinned(2) || getNextUnpinned() || recentArticles[0]
  const heroStory = heroArticle ? mapArticleToPostCard(heroArticle) : undefined

  // 3. Left Rail Stories (Slot 3 and 4)
  const left1 = getPinned(3) || getNextUnpinned() || recentArticles[1]
  const left2 = getPinned(4) || getNextUnpinned() || recentArticles[2]
  const leftStories = [left1, left2].filter(Boolean).map((a) => mapArticleToPostCard(a!))

  // 4. Center Sub-Leads (Slot 5 and 6)
  const sub1 = getPinned(5) || getNextUnpinned() || recentArticles[3]
  const sub2 = getPinned(6) || getNextUnpinned() || recentArticles[4]
  const subLeads = [sub1, sub2].filter(Boolean).map((a) => mapArticleToPostCard(a!))

  // 5. Ranked Stories (Slots 7 to 11)
  const rankedSource: Article[] = []
  for (let s = 7; s <= 11; s++) {
    const art = getPinned(s) || getNextUnpinned()
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
    const art = getPinned(s) || getNextUnpinned()
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
