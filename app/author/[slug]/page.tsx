import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Masthead from '@/components/meridian/Masthead'
import Footer from '@/components/meridian/Footer'
import Link from 'next/link'
import { getAllArticles } from '@/lib/articles'

export const dynamic = 'force-dynamic'

const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://www.singh.monster').replace(/\/$/, '')

const AUTHORS: Record<string, {
  name: string
  jobTitle: string
  location: string
  bio: string
  extendedBio: string
  beats: string[]
  social: { twitter?: string; linkedin?: string; email?: string }
}> = {
  'dhananjay-singh': {
    name: 'Dhananjay Singh',
    jobTitle: 'Founder & Editor-in-Chief',
    location: 'Ballia, Uttar Pradesh, India',
    bio: 'Journalist and tech analyst specializing in telecommunications, 6G infrastructure, Indian economic policy, and global affairs.',
    extendedBio:
      'Dhananjay Singh is the founder and editorial lead of Singh Monster. Hailing from Ballia, Uttar Pradesh, he founded Singh Monster with the mission of demystifying complex global technologies, geopolitical alliances, and economic data into accessible, insightful reporting for readers across India and worldwide.',
    beats: ['Telecommunications & 6G', 'Geopolitics', 'National Affairs', 'Technology Policy', 'Indian Economy'],
    social: {
      twitter: 'https://twitter.com/SinghMonster',
      linkedin: 'https://www.linkedin.com/company/singhmonster',
      email: 'editor@singh.monster',
    },
  },
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(params)
  const slug = (resolvedParams?.slug || '').toLowerCase().trim()
  const author = AUTHORS[slug] || AUTHORS['dhananjay-singh']

  const pageUrl = `${baseUrl}/author/${slug}`

  return {
    title: `${author.name} — Editor-in-Chief & Author Profile | Singh Monster`,
    description: `${author.name}, ${author.jobTitle} at Singh Monster. ${author.bio}`,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: `${author.name} — Author Profile | Singh Monster`,
      description: author.bio,
      url: pageUrl,
      type: 'profile',
      images: [
        {
          url: `${baseUrl}/authr.png`,
          width: 800,
          height: 800,
          alt: author.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${author.name} — Author Profile`,
      description: author.bio,
      images: [`${baseUrl}/authr.png`],
    },
  }
}

export default async function AuthorProfilePage({
  params,
}: {
  params: { slug: string }
}) {
  const resolvedParams = await Promise.resolve(params)
  const slug = (resolvedParams?.slug || '').toLowerCase().trim()
  const author = AUTHORS[slug] || AUTHORS['dhananjay-singh']

  if (!author && slug !== 'dhananjay-singh') {
    notFound()
  }

  // Fetch articles authored by this journalist
  const all = await getAllArticles()
  const articles = all.filter(
    (a) =>
      a.status === 'published' &&
      (a.author?.toLowerCase().includes('dhananjay') || !a.author || a.author === 'Singh Monster')
  )

  const jsonLdPerson = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    'dateCreated': '2026-09-01T00:00:00Z',
    'dateModified': new Date().toISOString(),
    'mainEntity': {
      '@type': 'Person',
      'name': author.name,
      'jobTitle': author.jobTitle,
      'description': author.bio,
      'image': `${baseUrl}/authr.png`,
      'url': `${baseUrl}/author/${slug}`,
      'homeLocation': {
        '@type': 'Place',
        'name': author.location,
      },
      'knowsAbout': author.beats,
      'worksFor': {
        '@type': 'NewsMediaOrganization',
        'name': 'Singh Monster',
        'url': baseUrl,
      },
      'sameAs': [
        author.social.twitter,
        author.social.linkedin,
      ].filter(Boolean),
    },
  }

  return (
    <div className="min-h-screen flex flex-col bg-paper dark:bg-dark-paper text-ink dark:text-dark-ink transition-colors font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdPerson) }}
      />
      <Masthead brandName="Singh Monster" tagline="Sharp reporting. Deep analysis. No agenda but the truth." />

      <main className="flex-1 max-w-[1080px] w-full mx-auto px-4 sm:px-6 py-10 sm:py-14">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center justify-between border-b border-rule dark:border-dark-rule pb-3 mb-8 font-mono text-[11px] uppercase tracking-widest text-ink-mute dark:text-dark-mute">
          <div className="flex items-center gap-2">
            <Link href="/" className="hover:text-accent transition">
              Home
            </Link>
            <span>/</span>
            <Link href="/authors" className="hover:text-accent transition">
              Authors
            </Link>
            <span>/</span>
            <span className="text-ink dark:text-dark-ink font-semibold">{author.name}</span>
          </div>
          <span>Staff Correspondent Registry</span>
        </div>

        {/* Journalist Bio Header Card */}
        <div className="bg-paper-subtle dark:bg-dark-subtle border border-rule dark:border-dark-rule rounded-2xl p-6 sm:p-10 mb-12">
          <div className="flex flex-col sm:flex-row gap-8 items-start">
            <img
              src="/authr.png"
              alt={author.name}
              className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl object-cover border border-rule dark:border-dark-rule shrink-0 shadow-md"
            />
            <div className="flex-1">
              <span className="font-mono text-xs uppercase tracking-widest text-accent font-bold block mb-1">
                {author.jobTitle}
              </span>
              <h1 className="font-serif font-black text-3xl sm:text-4xl md:text-5xl text-ink dark:text-dark-ink mb-3">
                {author.name}
              </h1>
              <p className="font-mono text-xs text-ink-mute dark:text-dark-mute mb-4 flex items-center gap-2">
                <svg className="w-3.5 h-3.5 opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {author.location}
              </p>
              <p className="font-serif text-sm sm:text-base leading-relaxed text-ink/90 dark:text-dark-ink/90 mb-6">
                {author.extendedBio}
              </p>

              {/* Beats Tag Pills */}
              <div className="flex flex-wrap items-center gap-2 mb-6">
                <span className="font-mono text-[11px] uppercase tracking-wider text-ink-mute dark:text-dark-mute mr-1">
                  Beats:
                </span>
                {author.beats.map((beat) => (
                  <span
                    key={beat}
                    className="px-2.5 py-0.5 rounded-full border border-rule dark:border-dark-rule bg-paper dark:bg-dark-paper text-[11px] font-sans font-medium text-ink-mute dark:text-dark-mute"
                  >
                    {beat}
                  </span>
                ))}
              </div>

              {/* Social / Contact Links */}
              <div className="flex items-center gap-4 text-xs font-mono">
                {author.social.email && (
                  <a
                    href={`mailto:${author.social.email}`}
                    className="text-accent hover:underline font-bold"
                  >
                    {author.social.email}
                  </a>
                )}
                {author.social.twitter && (
                  <>
                    <span>·</span>
                    <a
                      href={author.social.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-ink dark:text-dark-ink hover:text-accent underline"
                    >
                      Twitter / X
                    </a>
                  </>
                )}
                {author.social.linkedin && (
                  <>
                    <span>·</span>
                    <a
                      href={author.social.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-ink dark:text-dark-ink hover:text-accent underline"
                    >
                      LinkedIn
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Published Dispatches Section */}
        <section>
          <div className="flex items-baseline justify-between border-b-2 border-ink dark:border-dark-ink pb-3 mb-8">
            <h2 className="font-serif font-black text-2xl uppercase tracking-tight text-ink dark:text-dark-ink">
              Filed Dispatches & Investigations
            </h2>
            <span className="font-mono text-xs text-ink-mute dark:text-dark-mute">
              {articles.length} stories published
            </span>
          </div>

          <div className="space-y-6">
            {articles.map((article) => (
              <article
                key={article.id}
                className="group border-b border-rule dark:border-dark-rule pb-6 last:border-b-0 flex flex-col sm:flex-row gap-5 items-start justify-between"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-accent font-bold">
                      {article.category}
                    </span>
                    <span className="opacity-40">·</span>
                    <time className="font-mono text-[11px] text-ink-mute dark:text-dark-mute">
                      {article.published_at ? new Date(article.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                    </time>
                  </div>
                  <Link
                    href={`/article/${article.slug}`}
                    className="font-serif font-bold text-lg sm:text-xl text-ink dark:text-dark-ink group-hover:text-accent transition block leading-snug mb-2"
                  >
                    {article.title}
                  </Link>
                  {article.excerpt && (
                    <p className="font-serif text-xs sm:text-sm text-ink-mute dark:text-dark-mute line-clamp-2 leading-relaxed">
                      {article.excerpt}
                    </p>
                  )}
                </div>

                {(article.image_url || article.imageUrl) && (
                  <Link
                    href={`/article/${article.slug}`}
                    className="shrink-0 block overflow-hidden rounded-lg"
                  >
                    <img
                      src={article.image_url || article.imageUrl}
                      alt={article.title}
                      className="w-24 h-24 sm:w-28 sm:h-20 object-cover border border-rule dark:border-dark-rule group-hover:scale-105 transition-transform duration-300"
                    />
                  </Link>
                )}
              </article>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
