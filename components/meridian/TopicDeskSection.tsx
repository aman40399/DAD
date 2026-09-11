import Link from 'next/link'
import Image from 'next/image'
import { ArticleData } from './PostCard'

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop&q=80'

interface TopicDeskSectionProps {
  title: string
  kicker?: string
  moreUrl: string
  articles: ArticleData[]
  layout?: 'split' | 'grid'
}

export default function TopicDeskSection({
  title,
  kicker,
  moreUrl,
  articles,
  layout = 'grid',
}: TopicDeskSectionProps) {
  if (!articles || articles.length === 0) return null

  const lead = articles[0]
  const rest = articles.slice(1, 5)

  return (
    <section className="py-8 border-b border-rule dark:border-dark-rule" aria-labelledby={`section-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}>
      {/* Header */}
      <div className="flex items-baseline justify-between pb-2 border-b-2 border-ink dark:border-dark-ink mb-6">
        <div>
          {kicker && (
            <p className="font-sans text-[10px] font-bold tracking-[0.16em] uppercase text-accent mb-0.5">
              {kicker}
            </p>
          )}
          <h2 id={`section-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`} className="font-serif font-black text-2xl sm:text-3xl text-ink dark:text-dark-ink">
            {title}
          </h2>
        </div>
        <Link
          href={moreUrl}
          prefetch={true}
          className="font-sans text-[11px] sm:text-[12px] font-bold tracking-wider uppercase text-accent dark:text-dark-accent hover:underline transition-colors"
        >
          More in {title} →
        </Link>
      </div>

      {layout === 'split' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Lead Article */}
          <article className="lg:col-span-7 group">
            <Link href={`/article/${lead.slug || lead.id}`} prefetch={true} className="block no-underline">
              <div className="relative aspect-[16/10] overflow-hidden bg-paper-subtle dark:bg-dark-subtle border border-rule dark:border-dark-rule mb-3">
                <Image
                  src={lead.image || FALLBACK_IMAGE}
                  alt={lead.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 650px"
                  quality={80}
                  className="object-cover transition group-hover:scale-102 duration-300"
                />
              </div>
              {lead.category && (
                <span className="font-sans text-[10.5px] font-bold tracking-[0.14em] uppercase text-accent block mb-1">
                  {lead.category}
                </span>
              )}
              <h3 className="font-serif font-black text-2xl sm:text-3xl leading-tight text-ink dark:text-dark-ink group-hover:text-accent dark:group-hover:text-dark-accent transition-colors">
                {lead.title}
              </h3>
              {lead.excerpt && (
                <p className="font-serif italic text-[15px] sm:text-[16px] text-ink-mute dark:text-dark-mute mt-2.5 leading-relaxed">
                  {lead.excerpt}
                </p>
              )}
              <footer className="font-sans text-[11px] text-ink-mute dark:text-dark-mute uppercase tracking-wider mt-2.5 flex items-center gap-2">
                {lead.author && <span>By <strong className="text-ink dark:text-dark-ink font-semibold">{lead.author}</strong></span>}
                {lead.author && lead.date && <span className="opacity-40">·</span>}
                {lead.date && <time>{lead.date}</time>}
              </footer>
            </Link>
          </article>

          {/* Secondary Stacked Articles */}
          <div className="lg:col-span-5 space-y-4">
            {rest.map((item) => (
              <article key={item.id} className="flex gap-4 pb-4 border-b border-rule dark:border-dark-rule last:border-b-0 group">
                <div className="flex-1 min-w-0">
                  {item.category && (
                    <span className="font-sans text-[10px] font-bold tracking-[0.12em] uppercase text-accent block mb-0.5">
                      {item.category}
                    </span>
                  )}
                  <Link
                    href={`/article/${item.slug || item.id}`}
                    prefetch={true}
                    className="font-serif font-bold text-[15px] sm:text-[16px] leading-snug text-ink dark:text-dark-ink group-hover:underline group-hover:decoration-accent/40 block line-clamp-2"
                  >
                    {item.title}
                  </Link>
                  {item.excerpt && (
                    <p className="font-serif text-[12.5px] text-ink-mute dark:text-dark-mute line-clamp-2 leading-relaxed mt-1">
                      {item.excerpt}
                    </p>
                  )}
                </div>
                  <Link href={`/article/${item.slug || item.id}`} prefetch={true} className="shrink-0 block relative w-20 h-20 sm:w-22 sm:h-22 overflow-hidden border border-rule dark:border-dark-rule">
                    <Image
                      src={item.image || FALLBACK_IMAGE}
                      alt={item.title}
                      fill
                      sizes="90px"
                      quality={70}
                      className="object-cover transition group-hover:opacity-90"
                    />
                  </Link>
                </article>
            ))}
          </div>
        </div>
      ) : (
        /* Multi-column Grid Layout (3 columns) */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.slice(0, 3).map((item) => (
            <article key={item.id} className="group flex flex-col justify-between pb-4 border-b sm:border-b-0 border-rule dark:border-dark-rule">
              <Link href={`/article/${item.slug || item.id}`} prefetch={true} className="block no-underline">
                <div className="relative aspect-[16/10] overflow-hidden bg-paper-subtle dark:bg-dark-subtle border border-rule dark:border-dark-rule mb-3">
                  <Image
                    src={item.image || FALLBACK_IMAGE}
                    alt={item.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px"
                    quality={75}
                    className="object-cover transition group-hover:scale-102 duration-300"
                  />
                </div>
                {item.category && (
                  <span className="font-sans text-[10px] font-bold tracking-[0.14em] uppercase text-accent block mb-1">
                    {item.category}
                  </span>
                )}
                <h3 className="font-serif font-bold text-lg sm:text-[19px] leading-snug text-ink dark:text-dark-ink group-hover:text-accent dark:group-hover:text-dark-accent transition-colors line-clamp-2">
                  {item.title}
                </h3>
                {item.excerpt && (
                  <p className="font-serif text-xs sm:text-[13px] text-ink-mute dark:text-dark-mute line-clamp-2 leading-relaxed mt-1.5">
                    {item.excerpt}
                  </p>
                )}
                <footer className="font-sans text-[10.5px] text-ink-mute dark:text-dark-mute uppercase tracking-wider mt-2.5 flex items-center gap-2">
                  {item.author && <span>By <strong className="text-ink dark:text-dark-ink font-semibold">{item.author}</strong></span>}
                  {item.author && item.date && <span className="opacity-40">·</span>}
                  {item.date && <time>{item.date}</time>}
                </footer>
              </Link>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
