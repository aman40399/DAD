import { ArticleData } from './PostCard'

interface WorldSectionProps {
  title?: string
  moreUrl?: string
  featuredArticle?: ArticleData & { caption?: string }
  secondaryArticles?: ArticleData[]
}

const DEFAULT_FEATURED = {
  id: 'world-feat',
  title: 'Putin Holds "Substantive" Talks With U.S. Envoys as Ukraine Signals Willingness to Pause Strikes on Moscow',
  category: 'World',
  excerpt:
    'Russian and American officials engaged in what the Kremlin described as frank and substantive discussions, while Ukraine signalled a temporary halt to strikes on the Russian capital.',
  author: 'Nawab Singh',
  date: 'Sep 6, 2026',
  readTime: '3 min read',
  image: 'https://images.unsplash.com/photo-1548345680-f5475ea5df84?w=1000&auto=format&fit=crop&q=80',
  slug: 'putin-talks-us-envoys-ukraine-pause-strikes',
  caption: 'The Kremlin complex seen from across the Moscow River during the high-level diplomatic session | Photo: Reuters / Moscow Bureau',
}

const DEFAULT_SECONDARY: ArticleData[] = [
  {
    id: 'sec-1',
    title: 'U.S. Navy Destroys Three Iranian Oil Tankers in Escalating Gulf Confrontation',
    category: 'World',
    excerpt: 'The U.S. military confirmed the destruction of three Iranian oil tankers in the Persian Gulf, marking a significant escalation in the ongoing conflict between Washington and Tehran.',
    image: 'https://images.unsplash.com/photo-1509299349698-dd22323b5963?w=400&auto=format&fit=crop&q=80',
    slug: 'us-navy-destroys-iranian-oil-tankers-gulf',
  },
  {
    id: 'sec-2',
    title: 'Iran Threatens "Tougher Reprisals" After Claiming Strikes on U.S.-Linked Bases in Kuwait and UAE',
    category: 'World',
    excerpt: 'Tehran says missiles and drones struck American military facilities in the Gulf; Pentagon denies operational damage to any U.S. installation.',
    image: 'https://images.unsplash.com/photo-1597200381847-30ec200eeb9a?w=400&auto=format&fit=crop&q=80',
    slug: 'iran-threatens-reprisals-claims-strikes-kuwait-uae',
  },
  {
    id: 'sec-3',
    title: "Serbia's Ruling Party Nominates President Vučić as Lead Candidate for Snap Parliamentary Election",
    category: 'World',
    excerpt: 'The Serbian Progressive Party backs Aleksandar Vučić to lead its ticket in an election widely seen as a referendum on his decade of political dominance.',
    image: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=400&auto=format&fit=crop&q=80',
    slug: 'serbia-vucic-nominated-parliamentary-election',
  },
  {
    id: 'sec-4',
    title: 'Brussels Greenlights Fifteenth Sanctions Package Targeting Russian Sanctions-Evasion Networks',
    category: 'World',
    excerpt: 'The European Council approves new measures targeting third-country intermediaries, energy export ceilings, and shadow fleet tankers.',
    image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&auto=format&fit=crop&q=80',
    slug: 'eu-fifteenth-sanctions-package-russia',
  },
]

export default function WorldSection({
  title = 'World',
  moreUrl = '/section/world',
  featuredArticle = DEFAULT_FEATURED,
  secondaryArticles = DEFAULT_SECONDARY,
}: WorldSectionProps) {
  return (
    <section className="py-8 border-b border-rule dark:border-dark-rule" aria-labelledby="section-heading">
      {/* Header */}
      <div className="flex items-baseline justify-between pb-2 border-b-2 border-ink dark:border-dark-ink mb-6">
        <h2 id="section-heading" className="font-serif font-black text-2xl sm:text-3xl text-ink dark:text-dark-ink">
          {title}
        </h2>
        <a
          href={moreUrl}
          className="font-sans text-[11px] sm:text-[12px] font-bold tracking-wider uppercase text-accent dark:text-dark-accent hover:underline"
        >
          More in {title} →
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Featured Big Story (7 cols) */}
        <article className="lg:col-span-7 group cursor-pointer">
          <a href={`/article/${featuredArticle.slug || featuredArticle.id}`} className="block no-underline">
            <div className="aspect-[16/10] overflow-hidden bg-paper-subtle dark:bg-dark-subtle border border-rule dark:border-dark-rule mb-3">
              <img
                src={featuredArticle.image}
                alt={featuredArticle.title}
                className="w-full h-full object-cover transition group-hover:scale-102 duration-300"
                loading="lazy"
              />
            </div>

            <span className="font-sans text-[10.5px] font-bold tracking-[0.14em] uppercase text-accent block mb-1">
              {featuredArticle.category}
            </span>

            <h3 className="font-serif font-black text-2xl sm:text-3xl leading-tight text-ink dark:text-dark-ink group-hover:text-accent dark:group-hover:text-dark-accent transition-colors">
              {featuredArticle.title}
            </h3>

            {featuredArticle.excerpt && (
              <p className="font-serif italic text-[15px] sm:text-[16px] text-ink-mute dark:text-dark-mute mt-2.5 leading-relaxed">
                {featuredArticle.excerpt}
              </p>
            )}

            <footer className="font-sans text-[11px] text-ink-mute dark:text-dark-mute uppercase tracking-wider mt-2.5 flex items-center gap-2">
              <span>By <strong className="text-ink dark:text-dark-ink font-semibold">{featuredArticle.author}</strong></span>
              <span className="opacity-40">·</span>
              <time>{featuredArticle.date}</time>
              {featuredArticle.readTime && (
                <>
                  <span className="opacity-40">·</span>
                  <span>{featuredArticle.readTime}</span>
                </>
              )}
            </footer>
          </a>

          {featuredArticle.caption && (
            <p className="font-sans text-[10px] text-ink-mute/70 dark:text-dark-mute/70 mt-3 pt-2 border-t border-rule dark:border-dark-rule italic leading-normal">
              {featuredArticle.caption}
            </p>
          )}
        </article>

        {/* Right Stacked Stories (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {secondaryArticles.map((item) => (
            <article
              key={item.id}
              className="flex gap-4 pb-4 border-b border-rule dark:border-dark-rule last:border-b-0 group cursor-pointer"
            >
              <div className="flex-1 min-w-0">
                <span className="font-sans text-[10px] font-bold tracking-[0.12em] uppercase text-accent block mb-0.5">
                  {item.category}
                </span>
                <a
                  href={`/article/${item.slug || item.id}`}
                  className="font-serif font-bold text-[15px] sm:text-[16px] leading-snug text-ink dark:text-dark-ink group-hover:underline group-hover:decoration-accent/40 block line-clamp-2"
                >
                  {item.title}
                </a>
                {item.excerpt && (
                  <p className="font-serif text-[12.5px] text-ink-mute dark:text-dark-mute line-clamp-2 leading-relaxed mt-1">
                    {item.excerpt}
                  </p>
                )}
              </div>

              {item.image && (
                <a href={`/article/${item.slug || item.id}`} className="shrink-0 block">
                  <img
                    src={item.image}
                    alt=""
                    className="w-20 h-20 sm:w-22 sm:h-22 object-cover border border-rule dark:border-dark-rule transition group-hover:opacity-90"
                    loading="lazy"
                  />
                </a>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
