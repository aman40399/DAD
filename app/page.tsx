import BreakingTicker from '@/components/meridian/BreakingTicker'
import StockTicker from '@/components/meridian/StockTicker'
import Masthead from '@/components/meridian/Masthead'
import HomeHeroGrid from '@/components/meridian/HomeHeroGrid'
import EditorsPicks from '@/components/meridian/EditorsPicks'
import TopicDeskSection from '@/components/meridian/TopicDeskSection'
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
      getRecentArticles(50),
    ])
    homepageArticles = hp || []
    recentArticles = rec || []
  } catch (error) {
    console.error('Error loading articles in HomePage:', error)
  }

  // Combine and deduplicate articles by ID
  const allArticles = [...homepageArticles, ...recentArticles]
  const seenIds = new Set<string>()
  const uniqueArticles: Article[] = []
  for (const a of allArticles) {
    const idStr = String(a.id || (a as any)._id || '')
    if (idStr && !seenIds.has(idStr)) {
      seenIds.add(idStr)
      uniqueArticles.push(a)
    }
  }

  // Exact pinned slots (1-15) as configured in /admin/slots
  const pinnedMap = new Map<number, Article>()
  const pinnedIds = new Set<string>()

  for (const a of uniqueArticles) {
    const pos = a.homepage_position ?? (a as any).homepagePosition
    if (typeof pos === 'number' && pos >= 1 && pos <= 15) {
      if (!pinnedMap.has(pos)) {
        pinnedMap.set(pos, a)
        pinnedIds.add(String(a.id || (a as any)._id))
      }
    }
  }

  // Pool of published, unpinned articles ordered chronologically (newest first)
  const unpinnedPool = uniqueArticles
    .filter((a) => (a.status === 'published' || !a.status) && !pinnedIds.has(String(a.id || (a as any)._id)))
    .sort((a, b) => {
      const tA = new Date(a.published_at || (a as any).publishedAt || (a as any).date || 0).getTime()
      const tB = new Date(b.published_at || (b as any).publishedAt || (b as any).date || 0).getTime()
      return tB - tA
    })

  // 1:1 Slot Resolver matching /admin/slots blueprint
  const slotAssignments = new Map<number, Article>()
  let unpinnedIdx = 0

  for (let s = 1; s <= 15; s++) {
    if (pinnedMap.has(s)) {
      slotAssignments.set(s, pinnedMap.get(s)!)
    } else if (unpinnedIdx < unpinnedPool.length) {
      slotAssignments.set(s, unpinnedPool[unpinnedIdx++])
    }
  }

  // 1. Breaking Ticker (Slot 1 or breaking stories or newest published story)
  const slot1Article =
    slotAssignments.get(1) ||
    uniqueArticles.find((a) => a.is_breaking || (a as any).isBreaking) ||
    uniqueArticles[0]

  const tickerItems = uniqueArticles.length > 0
    ? [
        ...(slot1Article ? [{ id: String(slot1Article.id), title: slot1Article.title, url: `/article/${slot1Article.slug}` }] : []),
        ...uniqueArticles
          .filter((a) => a.id !== slot1Article?.id)
          .slice(0, 5)
          .map((a) => ({ id: String(a.id), title: a.title, url: `/article/${a.slug}` })),
      ]
    : undefined

  // 2. Main Hero Story (Slot 2 or fresh article)
  const heroArticle = slotAssignments.get(2) || uniqueArticles[0]
  const heroStory = heroArticle ? mapArticleToPostCard(heroArticle) : undefined

  // 3. Left Rail Stories (Slot 3 & 4)
  const leftArticles = [slotAssignments.get(3), slotAssignments.get(4)].filter(Boolean) as Article[]
  const leftStories = leftArticles.map((a) => mapArticleToPostCard(a))

  // 4. Center Sub-Leads (Slot 5 & 6)
  const subLeadArticles = [slotAssignments.get(5), slotAssignments.get(6)].filter(Boolean) as Article[]
  const subLeads = subLeadArticles.map((a) => mapArticleToPostCard(a))

  // 5. Ranked Stories (Slots 7 to 11)
  const rankedSource: Article[] = []
  for (let s = 7; s <= 11; s++) {
    const art = slotAssignments.get(s)
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
    const art = slotAssignments.get(s)
    if (art) picksSource.push(art)
  }
  const editorPicks = picksSource.length > 0 ? picksSource.map((a) => mapArticleToPostCard(a)) : undefined

  // Curated Reporting Topic Desks helper
  const getBeatArticles = (matcher: RegExp) => {
    return uniqueArticles
      .filter((a) => {
        const cat = (a.category || '').toLowerCase()
        const sub = ((a as any).sub_category || (a as any).subCategory || '').toLowerCase()
        return matcher.test(cat) || matcher.test(sub)
      })
      .map((a) => ({
        ...mapArticleToPostCard(a),
        caption: (a as any).image_caption || (a as any).imageCaption || undefined,
      }))
  }

  const worldArticles = getBeatArticles(/world|international|foreign|diplomacy|global/i)
  const economyArticles = getBeatArticles(/economy|market|business|finance|trade/i)
  const techArticles = getBeatArticles(/tech|technology|science|ai|cyber/i)
  const indiaArticles = getBeatArticles(/india|national|delhi|bharat/i)
  const envArticles = getBeatArticles(/environment|climate|planet|earth|weather|wildfire/i)

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

        {/* 4. Editor's Picks */}
        {editorPicks && editorPicks.length > 0 && (
          <EditorsPicks articles={editorPicks} />
        )}

        {/* 5. World & Geopolitics Desk (Split Lead Layout) */}
        {worldArticles.length > 0 && (
          <TopicDeskSection
            title="World & Geopolitics"
            kicker="Global Dispatches"
            moreUrl="/section/world"
            layout="split"
            articles={worldArticles}
          />
        )}

        {/* 6. Economy & Markets Desk (Grid Layout) */}
        {economyArticles.length > 0 && (
          <TopicDeskSection
            title="Economy & Markets"
            kicker="Financial Intelligence"
            moreUrl="/section/economy"
            layout="grid"
            articles={economyArticles}
          />
        )}

        {/* 7. India & Domestic Desk (if articles exist) */}
        {indiaArticles.length > 0 && (
          <TopicDeskSection
            title="India & Domestic Affairs"
            kicker="National Beat"
            moreUrl="/section/india"
            layout="grid"
            articles={indiaArticles}
          />
        )}

        {/* 8. Technology & Innovation Desk (if articles exist) */}
        {techArticles.length > 0 && (
          <TopicDeskSection
            title="Technology & Innovation"
            kicker="The Next Frontier"
            moreUrl="/section/technology"
            layout="grid"
            articles={techArticles}
          />
        )}

        {/* 9. Environment & Climate Desk (if articles exist) */}
        {envArticles.length > 0 && (
          <TopicDeskSection
            title="Environment & Climate"
            kicker="Earth Dispatches"
            moreUrl="/section/environment"
            layout="grid"
            articles={envArticles}
          />
        )}
      </main>

      {/* 10. Newspaper Broadsheet Footer */}
      <Footer brandName="Singh Monster" />
    </div>
  )
}
