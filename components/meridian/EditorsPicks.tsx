'use client'

import { useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArticleData } from './PostCard'


interface EditorsPicksProps {
  articles?: ArticleData[]
}

const DEFAULT_PICKS: ArticleData[] = [
  {
    id: 'ep-1',
    title: 'EU Lawmakers Finalise AI Act Enforcement Mechanism After Two Years of Debate',
    category: 'Technology',
    author: 'Imogen Hart',
    readTime: '3 min read',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&auto=format&fit=crop&q=80',
    slug: 'eu-ai-act-enforcement-mechanism-finalised',
  },
  {
    id: 'ep-2',
    title: 'Lebanon Military Operations Continue to Pose Civilian Risk Amid Fragile Political Transition',
    category: 'World',
    author: 'Priya Sharma',
    readTime: '3 min read',
    image: 'https://images.unsplash.com/photo-1569077382689-5ebf9e367b78?w=600&auto=format&fit=crop&q=80',
    slug: 'lebanon-military-operations-civilian-risk',
  },
  {
    id: 'ep-3',
    title: 'Brent Crude Surges Past $95 as Gulf Tensions and Supply Disruptions Rattle Energy Markets',
    category: 'Economy',
    author: 'Daniel Park',
    readTime: '2 min read',
    image: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=600&auto=format&fit=crop&q=80',
    slug: 'brent-crude-surges-95-gulf-tensions',
  },
  {
    id: 'ep-4',
    title: 'Brussels Greenlights Fifteenth Sanctions Package Targeting Russian Sanctions-Evasion Networks',
    category: 'World',
    author: 'Sofia Almeida',
    readTime: '3 min read',
    image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&auto=format&fit=crop&q=80',
    slug: 'eu-fifteenth-sanctions-package-russia',
  },
]

export default function EditorsPicks({ articles = DEFAULT_PICKS }: EditorsPicksProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  return (
    <section className="py-8 border-b border-rule dark:border-dark-rule" aria-labelledby="editors-picks-title">
      <div className="flex items-end justify-between mb-4">
        <div>
          <h2 id="editors-picks-title" className="font-serif font-black text-2xl sm:text-3xl text-ink dark:text-dark-ink leading-tight">
            Editor's Picks
          </h2>
          <p className="font-serif italic text-xs sm:text-[13px] text-ink-mute dark:text-dark-mute mt-0.5">
            Hand-picked stories from the newsroom
          </p>
        </div>

        {/* Carousel controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => scroll('left')}
            className="w-7 h-7 border border-rule dark:border-dark-rule flex items-center justify-center text-xs text-ink dark:text-dark-ink hover:bg-paper-subtle dark:hover:bg-dark-subtle transition cursor-pointer"
            aria-label="Previous stories"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => scroll('right')}
            className="w-7 h-7 border border-rule dark:border-dark-rule flex items-center justify-center text-xs text-ink dark:text-dark-ink hover:bg-paper-subtle dark:hover:bg-dark-subtle transition cursor-pointer"
            aria-label="Next stories"
          >
            ›
          </button>
        </div>
      </div>

      {/* 4 Cards Grid / Scrollable on mobile */}
      <div
        ref={scrollRef}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 overflow-x-auto scrollbar-none"
      >
        {articles.map((item) => (
          <article key={item.id} className="group cursor-pointer">
            <Link href={`/article/${item.slug || item.id}`} prefetch={true} className="block no-underline">
              <div className="relative aspect-[16/10] overflow-hidden bg-paper-subtle dark:bg-dark-subtle border border-rule dark:border-dark-rule mb-2.5">
                <Image
                  src={item.image || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop&q=80'}
                  alt={item.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  quality={75}
                  className="object-cover transition group-hover:scale-103 duration-300"
                />
              </div>

              <span className="font-sans text-[10px] sm:text-[10.5px] font-bold tracking-[0.14em] uppercase text-accent block mb-1">
                {item.category}
              </span>

              <h3 className="font-serif font-bold text-[15px] sm:text-[16px] leading-snug text-ink dark:text-dark-ink group-hover:text-accent dark:group-hover:text-dark-accent transition-colors line-clamp-3">
                {item.title}
              </h3>

              <footer className="mt-2 font-sans text-[10.5px] text-ink-mute dark:text-dark-mute uppercase tracking-wider flex items-center gap-1.5">
                <span>By {item.author}</span>
                {item.readTime && (
                  <>
                    <span className="opacity-40">·</span>
                    <span>{item.readTime}</span>
                  </>
                )}
              </footer>
            </Link>
          </article>
        ))}
      </div>
    </section>
  )
}
