import PostCard, { ArticleData } from './PostCard'
import EditorsNote from './EditorsNote'
import RecommendedRail from './RecommendedRail'
import NewsletterBox from './NewsletterBox'
import SponsorBox from './SponsorBox'

interface HomeHeroGridProps {
  heroStory?: ArticleData
  subLeads?: ArticleData[]
  leftStories?: ArticleData[]
  rankedStories?: ArticleData[]
  editorsNote?: { quote: string; author: string }
  recommendedItems?: Array<{ name: string; url: string; description: string; badgeText: string; badgeBg: string }>
}

const DEFAULT_HERO: ArticleData = {
  id: 'hero-1',
  title: "Mount Anak Krakatau Erupts, Forcing Closure of Jakarta's Main Airport and Disrupting Dozens of Flights",
  category: 'World',
  excerpt:
    "A powerful eruption of Mount Anak Krakatau has shut down Jakarta's primary international airport, stranding thousands of passengers and disrupting regional air travel across Southeast Asia.",
  author: 'Priya Sharma',
  date: 'Sep 6, 2026',
  readTime: '3 min read',
  isVideo: false,
  image: 'https://images.unsplash.com/photo-1462332420958-a05d1e002413?w=1200&auto=format&fit=crop&q=80',
  slug: 'mount-anak-krakatau-erupts-jakarta-airport-closed',
}

const DEFAULT_SUB_LEADS: ArticleData[] = [
  {
    id: 'sub-1',
    title: 'Building Collapse in New Delhi Kills One, Dozens Feared Trapped Under Rubble',
    category: 'India',
    excerpt: 'A four-storey residential building in New Delhi collapsed on Sunday morning, killing at least one person and leaving dozens of residents feared trapped beneath the debris.',
    author: 'Ankit Joshi',
    date: 'Sep 6, 2026',
    image: 'https://images.unsplash.com/photo-1567521464027-f127ff144326?w=600&auto=format&fit=crop&q=80',
    slug: 'building-collapse-new-delhi-dozens-trapped',
  },
  {
    id: 'sub-2',
    title: 'Wildfires Rage Across the United States With Over 118 New Blazes Reported Nationwide',
    category: 'Environment',
    excerpt: 'The United States is battling a devastating wildfire season with over 118 new fires reported across the country and more than 16,500 personnel committed to containment efforts.',
    author: 'Daniel Park',
    date: 'Sep 6, 2026',
    image: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=600&auto=format&fit=crop&q=80',
    slug: 'us-wildfires-118-new-fires-nationwide',
  },
]

const DEFAULT_LEFT_STORIES: ArticleData[] = [
  {
    id: 'left-1',
    title: 'U.S. Navy Destroys Three Iranian Oil Tankers in Escalating Gulf Confrontation',
    category: 'World',
    author: 'Rahul Verma',
    date: 'Sep 6, 2026',
    isVideo: false,
    image: 'https://pub-f105b5c2551040e1b44a90da84ffa541.r2.dev/news/1788848336699-us-navy-destroyer-patrol-b112sx.jpg',
    slug: 'us-navy-destroys-iranian-oil-tankers-gulf',
  },
  {
    id: 'left-2',
    title: 'South Korea Hits Record $709 Billion in Cumulative Exports, Surpassing Annual Best',
    category: 'Economy',
    author: 'Seema Negi',
    date: 'Sep 6, 2026',
    image: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=600&auto=format&fit=crop&q=80',
    slug: 'south-korea-record-exports-709-billion',
  },
]

const DEFAULT_RANKED_STORIES: ArticleData[] = [
  {
    id: 'rank-06',
    rank: '06',
    title: 'WHO Launches Global Mpox Vaccine Stockpile Initiative for Equitable Access',
    category: 'Health',
    slug: 'who-launches-global-mpox-vaccine-stockpile',
  },
  {
    id: 'rank-07',
    rank: '07',
    title: 'Global Trade Hits New Highs but Least-Developed Countries Fall Further Behind in Digital Exports',
    category: 'Economy',
    slug: 'global-trade-highs-ldc-digital-gap-widens',
  },
  {
    id: 'rank-08',
    rank: '08',
    title: 'Iran Threatens "Tougher Reprisals" After Claiming Strikes on U.S.-Linked Bases in Kuwait and UAE',
    category: 'World',
    slug: 'iran-threatens-reprisals-claims-strikes-kuwait-uae',
  },
  {
    id: 'rank-09',
    rank: '09',
    title: "Serbia's Ruling Party Nominates President Vučić as Lead Candidate for Snap Parliamentary Election",
    category: 'World',
    slug: 'serbia-vucic-nominated-parliamentary-election',
  },
  {
    id: 'rank-10',
    rank: '10',
    title: 'Gaza Ceasefire Violations Continue as Localised Efforts Underway to Restore Power Infrastructure',
    category: 'World',
    slug: 'gaza-ceasefire-violations-power-restoration',
  },
]

export default function HomeHeroGrid({
  heroStory = DEFAULT_HERO,
  subLeads = DEFAULT_SUB_LEADS,
  leftStories = DEFAULT_LEFT_STORIES,
  rankedStories = DEFAULT_RANKED_STORIES,
  editorsNote,
  recommendedItems,
}: HomeHeroGridProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 xl:gap-8 pt-7 pb-8 border-b border-rule dark:border-dark-rule">
      {/* 1. LEFT COLUMN (Secondary stories, Editor note, Recommended) */}
      <aside
        className="order-2 lg:order-1 lg:col-span-3 space-y-6 lg:border-r border-rule dark:border-dark-rule lg:pr-6 xl:pr-8"
        aria-label="Secondary stories"
      >
        <div className="space-y-5">
          {leftStories.map((story) => (
            <PostCard key={story.id} article={story} variant="dense-thumb" />
          ))}
        </div>

        <EditorsNote quote={editorsNote?.quote} author={editorsNote?.author} />

        <RecommendedRail items={recommendedItems} />
      </aside>

      {/* 2. CENTER COLUMN (Lead hero story & sub-leads) */}
      <section
        className="order-1 lg:order-2 lg:col-span-6 lg:border-r border-rule dark:border-dark-rule lg:pr-6 xl:pr-8"
        aria-label="Lead story"
      >
        <PostCard article={heroStory} variant="hero" />

        {/* Section Divider */}
        <hr className="border-0 h-[3px] bg-ink dark:bg-dark-ink my-7" />

        {/* Sub-leads (2 columns) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {subLeads.map((story) => (
            <PostCard key={story.id} article={story} variant="feed" />
          ))}
        </div>
      </section>

      {/* 3. RIGHT COLUMN (Ranked More to Read & Sticky CTA) */}
      <aside className="order-3 lg:col-span-3 space-y-6" aria-label="More to read">
        <div>
          <header className="flex justify-between items-baseline pb-2.5 border-b-2 border-ink dark:border-dark-ink mb-4">
            <h3 className="font-sans font-bold text-[12.5px] tracking-[0.16em] uppercase text-ink dark:text-dark-ink">
              More To Read
            </h3>
          </header>

          <div className="space-y-3.5">
            {rankedStories.map((story) => (
              <PostCard key={story.id} article={story} variant="ranked" />
            ))}
          </div>
        </div>

        {/* Sticky Container for Newsletter & Sponsor */}
        <div className="lg:sticky lg:top-6 space-y-6">
          <NewsletterBox />
          <SponsorBox />
        </div>
      </aside>
    </div>
  )
}
