'use client'

import Link from 'next/link'
import { useBookmarks } from '@/lib/bookmarks'

export interface ArticleData {
  id: string
  title: string
  slug?: string
  excerpt?: string
  image?: string
  category?: string
  subCategory?: string
  author?: string
  date?: string
  readTime?: string
  isVideo?: boolean
  isMemberOnly?: boolean
  rank?: string
}

interface PostCardProps {
  article?: ArticleData
  post?: ArticleData
  variant?: 'hero' | 'dense-thumb' | 'feed' | 'ranked'
  showDeck?: boolean
  priority?: boolean
}

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop&q=80'

function safeFormatDate(rawDate?: string): string {
  if (!rawDate) return ''
  try {
    const parsed = new Date(rawDate)
    if (isNaN(parsed.getTime())) return rawDate
    return parsed.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return rawDate || ''
  }
}

export default function PostCard({
  article: propArticle,
  post: propPost,
  variant = 'feed',
  showDeck = true,
  priority = false,
}: PostCardProps) {
  const article = propArticle || propPost

  // Defensive null guard
  if (!article) {
    return null
  }

  const { isBookmarked, toggleBookmark } = useBookmarks()
  const bookmarked = article.id ? isBookmarked(article.id) : false
  const articleUrl = article.slug ? `/article/${article.slug}` : '#'
  const formattedDate = safeFormatDate(article.date)

  // 1. HERO VARIANT (Center of Broadsheet)
  if (variant === 'hero') {
    return (
      <article className="group" data-component="post-card" data-variant="hero">
        <Link href={articleUrl} prefetch={true} className="block no-underline">
          {article.category && (
            <p className="font-sans text-[11px] font-bold tracking-[0.14em] uppercase text-accent mb-1.5">
              {article.category}
            </p>
          )}
          <h2 className="font-serif font-black text-3xl sm:text-4xl lg:text-[40px] leading-[1.05] tracking-tight text-ink dark:text-dark-ink group-hover:text-accent dark:group-hover:text-dark-accent transition-colors break-words">
            {article.title}
          </h2>
          {showDeck && article.excerpt && (
            <p className="font-serif italic text-base sm:text-xl text-ink-mute dark:text-dark-mute leading-relaxed mt-2.5 break-words line-clamp-3">
              {article.excerpt}
            </p>
          )}
        </Link>

        {article.image && (
          <figure className="mt-4 mb-3 m-0">
            <Link
              href={articleUrl}
              prefetch={true}
              className="relative block aspect-[16/10] overflow-hidden border border-rule dark:border-dark-rule bg-paper-subtle dark:bg-dark-subtle"
            >
              <img
                src={article.image}
                alt={article.title || 'Broadsheet dispatch'}
                className="w-full h-full object-cover transition duration-300 group-hover:scale-102"
                loading={priority ? 'eager' : 'lazy'}
                onError={(e) => {
                  if (e.currentTarget.src !== FALLBACK_IMAGE) {
                    e.currentTarget.src = FALLBACK_IMAGE
                  }
                }}
              />
              {article.isVideo && (
                <span className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-black/60 flex items-center justify-center text-white backdrop-blur-xs">
                  <svg className="w-5 h-5 fill-current ml-0.5" viewBox="0 0 24 24">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                </span>
              )}
            </Link>
          </figure>
        )}

        <footer className="flex items-center justify-between font-sans text-[11px] text-ink-mute dark:text-dark-mute tracking-wider uppercase pt-2">
          <div className="flex flex-wrap items-center gap-x-2">
            {article.author && (
              <span>
                By <strong className="text-ink dark:text-dark-ink font-bold">{article.author}</strong>
              </span>
            )}
            {formattedDate && (
              <>
                <span className="opacity-40">·</span>
                <time>{formattedDate}</time>
              </>
            )}
            {article.readTime && (
              <>
                <span className="opacity-40">·</span>
                <span>{article.readTime}</span>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              toggleBookmark({
                id: article.id,
                title: article.title,
                url: articleUrl,
                image: article.image,
                author: article.author,
                date: article.date,
              })
            }}
            className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-150 cursor-pointer shrink-0 ${
              bookmarked
                ? 'bg-accent/10 text-accent border border-accent/40 shadow-xs'
                : 'text-ink-mute/70 dark:text-dark-mute/70 hover:text-ink dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 border border-rule/50 dark:border-white/10'
            }`}
            aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark article'}
            title={bookmarked ? 'Saved in reading list' : 'Bookmark article'}
          >
            <svg
              className="w-3.5 h-3.5"
              viewBox="0 0 12 14"
              fill={bookmarked ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M1 1h10v12L6 9.5 1 13z" />
            </svg>
          </button>
        </footer>
      </article>
    )
  }

  // 2. DENSE THUMB VARIANT (Left Rail of Broadsheet)
  if (variant === 'dense-thumb') {
    return (
      <article
        className="group pb-5 border-b border-rule dark:border-dark-rule"
        data-component="post-card"
        data-variant="dense-thumb"
      >
        <Link href={articleUrl} prefetch={true} className="block no-underline">
          {article.image && (
            <div className="relative aspect-[16/10] overflow-hidden border border-rule dark:border-dark-rule bg-paper-subtle dark:bg-dark-subtle mb-2.5">
              <img
                src={article.image}
                alt={article.title || 'Broadsheet dispatch'}
                className="w-full h-full object-cover transition group-hover:scale-103 duration-300"
                loading="lazy"
                onError={(e) => {
                  if (e.currentTarget.src !== FALLBACK_IMAGE) {
                    e.currentTarget.src = FALLBACK_IMAGE
                  }
                }}
              />
              {article.isVideo && (
                <span className="absolute inset-0 m-auto w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-white">
                  <svg className="w-3.5 h-3.5 fill-current ml-0.5" viewBox="0 0 24 24">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                </span>
              )}
            </div>
          )}

          {article.category && (
            <p className="font-sans text-[10.5px] font-bold tracking-[0.14em] uppercase text-accent mb-1">
              {article.category}
              {article.isMemberOnly && (
                <span className="text-ink-mute dark:text-dark-mute ml-1">· Free members</span>
              )}
            </p>
          )}

          <h3 className="font-serif font-bold text-[17px] leading-[1.2] text-ink dark:text-dark-ink group-hover:text-accent dark:group-hover:text-dark-accent transition-colors break-words line-clamp-2">
            {article.title}
          </h3>

          <footer className="flex items-center gap-x-2 mt-2 font-sans text-[10.5px] text-ink-mute dark:text-dark-mute tracking-wider uppercase">
            {article.author && (
              <span>
                By <strong className="text-ink dark:text-dark-ink font-semibold">{article.author}</strong>
              </span>
            )}
            {article.author && formattedDate && <span>·</span>}
            {formattedDate && <time dateTime={article.date}>{formattedDate}</time>}
          </footer>
        </Link>
      </article>
    )
  }

  // 3. RANKED VARIANT (Trending Rail)
  if (variant === 'ranked') {
    return (
      <article
        className="flex items-start gap-4 pb-4 border-b border-rule/70 dark:border-dark-rule/70 last:border-0 group"
        data-component="post-card"
        data-variant="ranked"
      >
        <span className="font-mono font-bold text-2xl text-ink dark:text-dark-ink leading-none select-none">
          {article.rank || '01'}
        </span>
        <div>
          {article.category && (
            <p className="font-sans text-[10.5px] font-bold tracking-[0.12em] uppercase text-accent mb-0.5">
              {article.category}
            </p>
          )}
          <Link
            href={articleUrl}
            prefetch={true}
            className="font-serif font-bold text-[15px] leading-snug text-ink dark:text-dark-ink group-hover:underline group-hover:decoration-accent/50 group-hover:decoration-2 block break-words"
          >
            {article.title}
          </Link>
        </div>
      </article>
    )
  }

  // 4. FEED / SUB-LEAD VARIANT
  return (
    <article className="group" data-component="post-card" data-variant="feed">
      <Link href={articleUrl} prefetch={true} className="block no-underline">
        {article.image && (
          <div className="relative aspect-[16/10] overflow-hidden border border-rule dark:border-dark-rule bg-paper-subtle dark:bg-dark-subtle mb-2.5">
            <img
              src={article.image}
              alt={article.title || 'Broadsheet dispatch'}
              className="w-full h-full object-cover transition group-hover:scale-103 duration-300"
              loading="lazy"
              onError={(e) => {
                if (e.currentTarget.src !== FALLBACK_IMAGE) {
                  e.currentTarget.src = FALLBACK_IMAGE
                }
              }}
            />
            {article.isVideo && (
              <span className="absolute inset-0 m-auto w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-white">
                <svg className="w-3.5 h-3.5 fill-current ml-0.5" viewBox="0 0 24 24">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              </span>
            )}
          </div>
        )}

        {article.category && (
          <p className="font-sans text-[10px] sm:text-[11px] font-bold tracking-[0.12em] uppercase text-accent mb-1">
            {article.category}
          </p>
        )}

        <h3 className="font-serif font-bold text-base sm:text-[18px] leading-snug text-ink dark:text-dark-ink group-hover:text-accent dark:group-hover:text-dark-accent transition-colors break-words line-clamp-2">
          {article.title}
        </h3>

        {showDeck && article.excerpt && (
          <p className="font-serif text-sm text-ink-mute dark:text-dark-mute line-clamp-2 mt-1.5 leading-relaxed break-words">
            {article.excerpt}
          </p>
        )}

        <footer className="flex items-center gap-x-2 mt-2 font-sans text-[10px] sm:text-[11px] text-ink-mute dark:text-dark-mute tracking-wider uppercase">
          {article.author && (
            <span>
              By <strong className="text-ink dark:text-dark-ink font-semibold">{article.author}</strong>
            </span>
          )}
          {formattedDate && (
            <>
              <span className="opacity-40">·</span>
              <time>{formattedDate}</time>
            </>
          )}
        </footer>
      </Link>
    </article>
  )
}
