interface RecommendedItem {
  name: string
  url: string
  description: string
  badgeText: string
  badgeBg: string
}

const DEFAULT_RECOMMENDED: RecommendedItem[] = [
  {
    name: 'The Atlantic',
    url: 'https://theatlantic.com',
    description: 'The Atlantic covers news, politics, culture, technology, health, and more.',
    badgeText: 'A',
    badgeBg: 'bg-[#d9222a] text-white',
  },
  {
    name: 'The New York Times',
    url: 'https://nytimes.com',
    description: 'Live news, investigations, opinion, photos and video from around the world.',
    badgeText: 'T',
    badgeBg: 'bg-black text-white dark:bg-white dark:text-black font-serif',
  },
]

export default function RecommendedRail({ items = DEFAULT_RECOMMENDED }: { items?: RecommendedItem[] }) {
  return (
    <section className="mt-6 font-sans">
      <header className="flex justify-between items-baseline pb-2 border-b-2 border-ink dark:border-dark-ink mb-3.5">
        <h4 className="font-bold text-[12px] tracking-[0.16em] uppercase text-ink dark:text-dark-ink">
          Recommended
        </h4>
        <a
          href="#"
          className="text-[10px] tracking-wider uppercase text-ink-mute dark:text-dark-mute hover:text-accent dark:hover:text-dark-accent transition"
        >
          See all
        </a>
      </header>

      <div className="space-y-3">
        {items.map((item, idx) => (
          <a
            key={idx}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="grid grid-cols-[36px_1fr] gap-3 pb-3 border-b border-rule dark:border-dark-rule last:border-b-0 hover:text-accent dark:hover:text-dark-accent transition group no-underline"
          >
            <div className={`w-9 h-9 rounded-xs flex items-center justify-center font-bold text-sm select-none shrink-0 ${item.badgeBg}`}>
              {item.badgeText}
            </div>
            <div className="min-w-0">
              <p className="font-serif font-bold text-[14px] leading-snug text-ink dark:text-dark-ink group-hover:text-accent dark:group-hover:text-dark-accent transition">
                {item.name}
              </p>
              <p className="font-serif text-[12px] text-ink-mute dark:text-dark-mute line-clamp-2 leading-relaxed mt-0.5">
                {item.description}
              </p>
            </div>
          </a>
        ))}
      </div>
    </section>
  )
}
