import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Masthead from '@/components/meridian/Masthead'
import Footer from '@/components/meridian/Footer'
import PostCard from '@/components/meridian/PostCard'
import ArticleHeroImage from '@/components/meridian/ArticleHeroImage'
import { getArticleBySlug, getArticleById, getRecentArticles } from '@/lib/articles'
import { mapArticleToPostCard } from '@/lib/meridianData'
import ReadingProgressBar from '@/components/meridian/ReadingProgressBar'
import BreakingTicker from '@/components/meridian/BreakingTicker'
import StockTicker from '@/components/meridian/StockTicker'
import ArticleAudioPlayer from '@/components/meridian/ArticleAudioPlayer'
import ArticleShareBar from '@/components/meridian/ArticleShareBar'

export const revalidate = 60

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: { slug: string }
  searchParams?: { preview?: string }
}): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(params)
  const rawSlug = Array.isArray(resolvedParams?.slug) ? resolvedParams.slug[0] : resolvedParams?.slug
  const cleanSlug = rawSlug ? decodeURIComponent(rawSlug).trim() : ''

  const article = cleanSlug
    ? (await getArticleBySlug(cleanSlug)) || (await getArticleById(cleanSlug))
    : null

  if (!article || (article.status !== 'published' && searchParams?.preview !== 'true')) {
    return { title: 'Story Not Found — Singh Monster' }
  }

  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://www.singh.monster').replace(/\/$/, '')
  const pageUrl = `${baseUrl}/article/${article.slug}`
  const heroImage = article.image_url || article.imageUrl || `${baseUrl}/authr.png`
  const rawPub = article.published_at || article.created_at || (article as any).publishedAt || (article as any).createdAt
  const rawMod = article.updated_at || article.updatedAt || rawPub
  const pubDate = rawPub ? new Date(rawPub).toISOString() : new Date().toISOString()
  const modDate = rawMod ? new Date(rawMod).toISOString() : pubDate
  const description = article.excerpt || article.subtitle || article.content.replace(/<[^>]*>/g, '').slice(0, 160)
  const tags = article.tags && article.tags.length > 0 ? article.tags : [article.category, 'India', 'World News', 'Singh Monster']

  return {
    title: `${article.title} | Singh Monster`,
    description,
    keywords: [...tags, 'Singh Monster', 'Dhananjay Singh', article.category, 'Breaking News', 'Investigative Journalism'],
    authors: [{ name: article.author || 'Dhananjay Singh', url: baseUrl }],
    creator: article.author || 'Dhananjay Singh',
    publisher: 'Singh Monster',
    alternates: {
      canonical: pageUrl,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      type: 'article',
      url: pageUrl,
      title: article.title,
      description,
      siteName: 'Singh Monster',
      publishedTime: pubDate,
      modifiedTime: modDate,
      authors: [article.author || 'Dhananjay Singh'],
      section: article.category,
      tags,
      images: [
        {
          url: heroImage,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description,
      creator: '@SinghMonster',
      site: '@SinghMonster',
      images: [heroImage],
    },
    other: {
      'news_keywords': tags.join(', '),
      'article:author': article.author || 'Dhananjay Singh',
      'article:section': article.category,
      'article:published_time': pubDate,
      'article:modified_time': modDate,
    },
  }
}


export default async function ArticlePage({
  params,
  searchParams,
}: {
  params: { slug: string }
  searchParams?: { preview?: string }
}) {
  const resolvedParams = await Promise.resolve(params)
  const rawSlug = Array.isArray(resolvedParams?.slug) ? resolvedParams.slug[0] : resolvedParams?.slug
  const cleanSlug = rawSlug ? decodeURIComponent(rawSlug).trim() : ''

  let article = cleanSlug ? await getArticleBySlug(cleanSlug) : null
  if (!article && cleanSlug) {
    article = await getArticleById(cleanSlug)
  }

  if (!article || (article.status !== 'published' && searchParams?.preview !== 'true')) {
    notFound()
  }

  const recent = await getRecentArticles(8)
  const relatedStories = recent
    .filter((a) => a.slug !== article.slug)
    .slice(0, 3)
    .map((a) => mapArticleToPostCard(a))

  const breakingSlot = recent.find(
    (a) =>
      (a.homepage_position ?? (a as any).homepagePosition) === 1 ||
      a.is_breaking ||
      (a as any).isBreaking
  )
  const tickerItems = breakingSlot
    ? [
        { id: String(breakingSlot.id), title: breakingSlot.title, url: `/article/${breakingSlot.slug}` },
        ...recent
          .filter((a) => a.id !== breakingSlot.id)
          .slice(0, 4)
          .map((a) => ({ id: String(a.id), title: a.title, url: `/article/${a.slug}` })),
      ]
    : recent.slice(0, 5).map((a) => ({ id: String(a.id), title: a.title, url: `/article/${a.slug}` }))

  const heroImage = article.image_url || article.imageUrl
  const heroCaption = article.image_caption || article.imageCaption

  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://www.singh.monster').replace(/\/$/, '')
  const pageUrl = `${baseUrl}/article/${article.slug}`
  const rawPub = article.published_at || article.created_at || (article as any).publishedAt || (article as any).createdAt
  const rawMod = article.updated_at || article.updatedAt || rawPub
  const pubDate = rawPub ? new Date(rawPub).toISOString() : new Date().toISOString()
  const modDate = rawMod ? new Date(rawMod).toISOString() : pubDate
  const description = article.excerpt || article.subtitle || article.content.replace(/<[^>]*>/g, '').slice(0, 160)
  const tags = article.tags && article.tags.length > 0 ? article.tags : [article.category, 'Singh Monster']
  const isHindi =
    article.language === 'hindi' ||
    /[\u0900-\u097F]/.test(article.title || '') ||
    /[\u0900-\u097F]/.test(article.excerpt || '')

  // Schema.org NewsArticle & Breadcrumbs structured data
  const jsonLdNewsArticle = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': pageUrl,
    },
    'headline': article.title,
    'alternativeHeadline': article.subtitle || undefined,
    'image': [heroImage || `${baseUrl}/authr.png`],
    'datePublished': pubDate,
    'dateModified': modDate,
    'author': {
      '@type': 'Person',
      'name': 'Dhananjay Singh',
      'jobTitle': 'Founder & Editor-in-Chief',
      'image': `${baseUrl}/authr.png`,
      'url': `${baseUrl}/author/dhananjay-singh`,
      'sameAs': [
        'https://twitter.com/SinghMonster',
        'https://www.linkedin.com/company/singhmonster',
      ],
    },
    'publisher': {
      '@type': 'NewsMediaOrganization',
      'name': 'Singh Monster',
      'url': baseUrl,
      'publishingPrinciples': `${baseUrl}/editorial-guidelines`,
      'logo': {
        '@type': 'ImageObject',
        'url': `${baseUrl}/logo.png`,
        'width': 512,
        'height': 512,
      },
    },
    'description': description,
    'articleBody': article.content.replace(/<[^>]*>/g, ' ').slice(0, 5000),
    'articleSection': article.category,
    'keywords': tags.join(', '),
    'inLanguage': isHindi ? 'hi' : 'en-US',
    'isAccessibleForFree': true,
    'speakable': {
      '@type': 'SpeakableSpecification',
      'cssSelector': ['h1', 'article p:first-of-type'],
    },
  }

  const jsonLdBreadcrumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'Home',
        'item': baseUrl,
      },
      {
        '@type': 'ListItem',
        'position': 2,
        'name': article.category,
        'item': `${baseUrl}/section/${article.category.toLowerCase()}`,
      },
      {
        '@type': 'ListItem',
        'position': 3,
        'name': article.title,
        'item': pageUrl,
      },
    ],
  }

  return (
    <div className="min-h-screen bg-paper dark:bg-dark-paper text-ink dark:text-dark-ink transition-colors duration-200 flex flex-col font-sans pb-24 md:pb-0">
      {/* Schema.org NewsArticle & BreadcrumbList structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdNewsArticle) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumbs) }}
      />

      <ReadingProgressBar />
      <BreakingTicker items={tickerItems} />
      <StockTicker />
      <Masthead brandName="Singh Monster" tagline="Sharp reporting. Deep analysis. No agenda but the truth." />


      <main className="flex-1 max-w-[980px] mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full">
        <article className="space-y-6">
          {/* Category & Kicker */}
          <div className="flex items-center gap-2">
            <a
              href={`/section/${article.category.toLowerCase()}`}
              className="text-xs font-bold uppercase tracking-[0.16em] text-accent hover:underline"
            >
              {article.category}
            </a>
            {article.is_breaking && (
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-red-600 text-white uppercase tracking-wider rounded-xs">
                Breaking
              </span>
            )}
          </div>

          {/* Headline */}
          <h1 className="font-serif font-black text-3xl sm:text-4xl md:text-5xl leading-[1.08] tracking-tight text-ink dark:text-dark-ink">
            {article.title}
          </h1>

          {/* Deck / Subtitle */}
          {(article.subtitle || article.excerpt) && (
            <p className="font-serif italic text-lg sm:text-2xl leading-relaxed text-ink-mute dark:text-dark-mute">
              {article.subtitle || article.excerpt}
            </p>
          )}

          {/* Audio Narration Player */}
          <div className="pt-1">
            <ArticleAudioPlayer
              title={article.title}
              content={article.content}
              language={article.language}
            />
          </div>

          {/* Byline & Metadata Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 pb-4 border-y border-rule dark:border-dark-rule text-xs text-ink-mute dark:text-dark-mute">
            <div className="flex items-center gap-3.5">
              <a
                href="/author/dhananjay-singh"
                className="group relative w-11 h-11 rounded-full overflow-hidden border-2 border-accent/40 dark:border-dark-accent/40 shrink-0 shadow-xs bg-paper-subtle dark:bg-dark-subtle hover:border-accent transition"
                title="View author profile"
              >
                <img
                  src="/authr.png"
                  alt={article.author}
                  className="w-full h-full object-cover group-hover:scale-105 transition"
                />
              </a>
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <a
                    href="/author/dhananjay-singh"
                    className="font-sans text-ink dark:text-dark-ink font-bold text-[13px] hover:text-accent dark:hover:text-dark-accent transition"
                  >
                    {article.author || 'Dhananjay Singh'}
                  </a>
                  <span className="px-2 py-0.5 bg-accent text-white dark:bg-dark-accent text-[9.5px] font-mono uppercase tracking-wider rounded-xs font-bold shadow-xs">
                    Admin
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-ink-mute dark:text-dark-mute">
                  <time>
                    {(() => {
                      try {
                        const raw = article.published_at || article.created_at || (article as any).publishedAt || (article as any).createdAt
                        const d = raw ? new Date(raw) : new Date()
                        return isNaN(d.getTime())
                          ? 'Recent'
                          : d.toLocaleDateString('en-US', {
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric',
                            })
                      } catch {
                        return 'Recent'
                      }
                    })()}
                  </time>
                  <span className="opacity-40">·</span>
                  <span>{(() => {
                    const plainText = (article.content || '').replace(/<[^>]*>/g, ' ').replace(/[#*_`~>-]/g, ' ')
                    const words = plainText.trim().split(/\s+/).filter((w) => w.length > 0)
                    const minutes = words.length === 0 ? 1 : Math.max(1, Math.ceil(words.length / 200))
                    return `${minutes} min read`
                  })()}</span>
                </div>
              </div>
            </div>

            {/* Complete Working Share Bar */}
            <ArticleShareBar title={article.title} url={pageUrl} />
          </div>

          {/* Main Cropped Featured Hero Image */}
          {heroImage && (
            <ArticleHeroImage
              src={heroImage}
              alt={article.title}
              caption={heroCaption}
            />
          )}

          {/* Article Long-form Body with Full Word/HTML/Markdown Support */}
          {(() => {
            const rawContent = article.content || ''
            const sanitizeLink = (url: string) => {
              const trimmed = (url || '').trim()
              if (/^\s*(javascript|vbscript|data):/i.test(trimmed)) {
                return '#'
              }
              return trimmed.replace(/"/g, '&quot;')
            }

            // Sanitize scripts, active plugins, unquoted and quoted handlers, and javascript: URIs
            // Safely preserves legitimate embedded video iframes (YouTube, Vimeo) while blocking untrusted or script iframes
            let sanitized = rawContent
              .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
              .replace(/<iframe\b([^>]*)>([\s\S]*?)<\/iframe>/gi, (_match, attrs) => {
                const srcMatch = attrs.match(/\bsrc=(?:["']([^"']+)["']|([^\s>]+))/i)
                if (!srcMatch) return ''
                const src = (srcMatch[1] || srcMatch[2] || '').trim()
                const isTrustedVideo = /^https?:\/\/(www\.)?(youtube\.com\/embed\/|youtube-nocookie\.com\/embed\/|player\.vimeo\.com\/video\/)/i.test(src)
                if (!isTrustedVideo) return ''
                const cleanAttrs = attrs.replace(/\son\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
                return `<iframe ${cleanAttrs} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`
              })
              .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
              .replace(/<embed\b[^>]*>/gi, '')
              .replace(/\son\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
              .replace(/\bhref\s*=\s*(?:"\s*javascript:[^"]*"|'\s*javascript:[^']*'|\s*javascript:[^\s>]+)/gi, 'href="#"')
              .replace(/\bsrc\s*=\s*(?:"\s*javascript:[^"]*"|'\s*javascript:[^']*'|\s*javascript:[^\s>]+)/gi, 'src=""')

            // Defensive deduplication: if heroImage is already rendered at the top of the article,
            // strip any trailing figure(s) from the end of the body content that duplicate the heroImage
            if (heroImage) {
              const escapedHero = heroImage.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
              const trailingHeroPattern = new RegExp(
                `(?:\\s*<figure[^>]*>[\\s\\S]*?<img[^>]*${escapedHero}[^>]*>[\\s\\S]*?<\\/figure>(?:\\s*<p><br><\\/p>)*\\s*)+$`,
                'gi'
              )
              sanitized = sanitized.replace(trailingHeroPattern, '').trim()
            }

            const isHtml = /<[a-z][\s\S]*>/i.test(sanitized)

            if (isHtml) {
              // Ensure lead paragraph contains drop-cap styling only for non-Hindi (Latin) articles
              let formattedHtml = sanitized
              if (!isHindi && !formattedHtml.includes('drop-cap') && !formattedHtml.includes('first-letter:')) {
                formattedHtml = formattedHtml.replace(
                  /<p\b([^>]*)>/i,
                  '<p$1 class="drop-cap first-letter:text-5xl first-letter:font-serif first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:leading-none first-letter:text-ink dark:first-letter:text-dark-ink">'
                )
              }
              return (
                <div
                  className="article-content-body max-w-none pt-4 text-ink dark:text-dark-ink"
                  dangerouslySetInnerHTML={{ __html: formattedHtml }}
                />
              )
            }

            // Fallback for markdown-authored content
            let leadRendered = false
            const paragraphs = sanitized.split(/\n\s*\n/)

            return (
              <div className="article-content-body max-w-none pt-4 text-ink dark:text-dark-ink space-y-6">
                {paragraphs.map((p, index) => {
                  const trimmed = p.trim()
                  if (!trimmed) return null

                  if (trimmed.startsWith('## ')) {
                    return <h2 key={index}>{trimmed.replace(/^##\s+/, '')}</h2>
                  }
                  if (trimmed.startsWith('### ')) {
                    return <h3 key={index}>{trimmed.replace(/^###\s+/, '')}</h3>
                  }
                  if (trimmed.startsWith('#### ')) {
                    return <h4 key={index}>{trimmed.replace(/^####\s+/, '')}</h4>
                  }
                  if (trimmed.startsWith('> ')) {
                    return <blockquote key={index}>&ldquo;{trimmed.replace(/^>\s*/, '')}&rdquo;</blockquote>
                  }

                  const imgMatch = trimmed.match(/!\[(.*?)\]\((.*?)\)/)
                  if (imgMatch) {
                    const alt = imgMatch[1]
                    const src = imgMatch[2]
                    return (
                      <figure key={index}>
                        <img src={src} alt={alt || 'Illustration'} />
                        {alt && <figcaption>{alt}</figcaption>}
                      </figure>
                    )
                  }

                  const formattedHtml = trimmed
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em>$1</em>')
                    .replace(/\[(.*?)\]\((.*?)\)/g, (match, linkText, linkHref) => {
                      return `<a href="${sanitizeLink(linkHref)}" target="_blank" rel="noopener noreferrer">${linkText}</a>`
                    })

                  const isLead = !leadRendered
                  leadRendered = true

                  return (
                    <p
                      key={index}
                      className={
                        isLead && !isHindi
                          ? 'drop-cap first-letter:text-5xl first-letter:font-serif first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:leading-none first-letter:text-ink dark:first-letter:text-dark-ink leading-relaxed'
                          : 'leading-relaxed'
                      }
                      dangerouslySetInnerHTML={{ __html: formattedHtml }}
                    />
                  )
                })}
              </div>
            )
          })()}

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="pt-6 border-t border-rule dark:border-dark-rule flex flex-wrap items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-bold text-ink-mute mr-1">Filed Under:</span>
              {article.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 text-xs font-sans bg-paper-subtle dark:bg-dark-subtle border border-rule dark:border-dark-rule text-ink dark:text-dark-ink rounded-xs uppercase tracking-wider"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Bottom Share & Engagement Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-4 border-y border-rule dark:border-dark-rule my-6">
            <span className="font-serif italic text-xs text-ink-mute dark:text-dark-mute">
              Found this dispatch informative? Share it with your network:
            </span>
            <ArticleShareBar title={article.title} url={pageUrl} />
          </div>

          {/* Author Box */}
          <div className="p-6 bg-paper-subtle dark:bg-dark-subtle border border-rule dark:border-dark-rule rounded-sm mt-8 flex flex-col sm:flex-row gap-5 items-start sm:items-center">
            <a
              href="/author/dhananjay-singh"
              className="group relative w-16 h-16 rounded-full overflow-hidden border-2 border-accent shrink-0 shadow-md bg-paper-subtle dark:bg-dark-subtle hover:border-accent/80 transition"
              title="View author profile"
            >
              <img
                src="/authr.png"
                alt={article.author}
                className="w-full h-full object-cover group-hover:scale-105 transition"
              />
            </a>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-[10px] uppercase tracking-widest font-bold text-accent">Reported by</p>
                <span className="w-1 h-1 rounded-full bg-accent" />
                <span className="text-[10px] font-mono text-ink-mute dark:text-dark-mute uppercase tracking-wider">Singh Monster Newsroom</span>
                <span className="px-1.5 py-0.5 bg-accent/20 text-accent text-[9px] font-mono font-bold uppercase tracking-wider rounded-xs">Verified Editor</span>
              </div>
              <h4 className="font-serif font-bold text-xl text-ink dark:text-dark-ink mt-0.5">
                <a href="/author/dhananjay-singh" className="hover:text-accent dark:hover:text-dark-accent transition">
                  {article.author || 'Dhananjay Singh'}
                </a>
              </h4>
              <p className="text-xs text-ink-mute dark:text-dark-mute mt-1.5 leading-relaxed">
                Founder &amp; Editor-in-Chief at Singh Monster. Directing global geopolitical dispatches, macroeconomic analysis, telecommunications &amp; 6G developments, and investigative journalism.
              </p>
              <div className="mt-3 flex items-center gap-3 text-xs">
                <a
                  href="/author/dhananjay-singh"
                  className="inline-flex items-center gap-1 font-semibold text-accent dark:text-dark-accent hover:underline text-[11px]"
                >
                  <span>View Full Profile &amp; Archive</span>
                  <span>→</span>
                </a>
              </div>
            </div>
          </div>
        </article>

        {/* Related Stories */}
        {relatedStories.length > 0 && (
          <section className="mt-16 pt-8 border-t-2 border-ink dark:border-dark-ink">
            <h3 className="font-serif font-black text-2xl text-ink dark:text-dark-ink mb-6">
              More In {article.category}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {relatedStories.map((story) => (
                <PostCard key={story.id} article={story} variant="feed" />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer brandName="Singh Monster" />
    </div>
  )
}
