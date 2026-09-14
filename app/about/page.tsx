import type { Metadata } from 'next'
import Masthead from '@/components/meridian/Masthead'
import Footer from '@/components/meridian/Footer'
import Link from 'next/link'
import { getAboutConfig } from '@/lib/aboutConfig'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://www.singh.monster').replace(/\/$/, '')

export async function generateMetadata(): Promise<Metadata> {
  const config = await getAboutConfig()
  const title = config.metaTitle || 'About Us — Editorial Mission & Standards | Singh Monster'
  const description =
    config.metaDescription ||
    'The editorial philosophy, journalistic standards, and independent mission of Singh Monster, led by Dhananjay Singh.'
  const pageUrl = `${baseUrl}/about`

  return {
    title,
    description,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title,
      description,
      url: pageUrl,
      type: 'website',
      siteName: 'Singh Monster',
      images: [
        {
          url: `${baseUrl}/authr.png`,
          width: 800,
          height: 800,
          alt: 'Dhananjay Singh — Singh Monster',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${baseUrl}/authr.png`],
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
  }
}


export default async function AboutPage() {
  const config = await getAboutConfig()
  const { mobileVariant } = config

  // Spacing class based on mobileVariant dense setting
  const containerPadding = mobileVariant?.denseSpacing ? 'py-6 sm:py-12' : 'py-10 sm:py-14'

  // Photo alignment on mobile
  const photoAlignmentClass =
    mobileVariant?.photoPosition === 'center'
      ? 'items-center text-center'
      : mobileVariant?.photoPosition === 'left'
      ? 'items-start text-left'
      : 'items-center sm:items-start text-center sm:text-left'

  const jsonLdAbout = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    'name': config.headline || 'About Singh Monster',
    'description': config.metaDescription,
    'url': `${baseUrl}/about`,
    'mainEntity': {
      '@type': 'NewsMediaOrganization',
      'name': 'Singh Monster',
      'url': baseUrl,
      'founder': {
        '@type': 'Person',
        'name': 'Dhananjay Singh',
        'jobTitle': 'Founder & Editor-in-Chief',
        'url': `${baseUrl}/author/dhananjay-singh`,
      },
    },
  }

  const breadcrumbsSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'Singh Monster',
        'item': baseUrl,
      },
      {
        '@type': 'ListItem',
        'position': 2,
        'name': 'About Us',
        'item': `${baseUrl}/about`,
      },
    ],
  }

  return (
    <div className="min-h-screen flex flex-col bg-paper dark:bg-dark-paper text-ink dark:text-dark-ink transition-colors">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdAbout) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsSchema) }}
      />
      <Masthead />

      <main className={`flex-1 max-w-[1080px] w-full mx-auto px-4 sm:px-6 ${containerPadding}`}>
        {/* Breadcrumb & Section Dateline */}
        <div className="flex items-center justify-between border-b border-rule dark:border-dark-rule pb-3 mb-8 font-mono text-[11px] uppercase tracking-widest text-ink-mute dark:text-dark-mute">
          <div className="flex items-center gap-2">
            <Link href="/" className="hover:text-accent transition">
              Home
            </Link>
            <span>/</span>
            <span className="text-ink dark:text-dark-ink font-semibold">About Us</span>
          </div>
          <span className="hidden sm:inline">{config.breadcrumbSubtitle || 'Journal of Record • Est. 2026'}</span>
        </div>

        {/* Hero Header */}
        <header className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
          {config.eyebrow && (
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent dark:text-dark-accent font-semibold mb-3">
              {config.eyebrow}
            </p>
          )}
          <h1 className="font-serif font-black text-3xl sm:text-5xl md:text-6xl tracking-tight leading-[1.1] mb-5 sm:mb-6">
            {config.headline}
          </h1>
          {config.missionStatement && (
            <p className="font-serif italic text-base sm:text-lg text-ink-mute dark:text-dark-mute leading-relaxed">
              {config.missionStatement}
            </p>
          )}
          {config.showDivider && <div className="w-24 h-0.5 bg-accent mx-auto mt-7 sm:mt-8 opacity-80" />}
        </header>

        {/* Founder & Lead Correspondent Profile */}
        <div className="bg-paper-subtle dark:bg-[#121215] border border-rule/80 dark:border-white/10 rounded-2xl p-5 sm:p-8 mb-10 sm:mb-14 shadow-xs">
          <div className={`flex flex-col sm:flex-row gap-5 sm:gap-8 ${photoAlignmentClass}`}>
            {config.authorPhotoUrl && (
              <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden border-2 border-rule dark:border-white/15 shadow-md shrink-0 bg-paper-subtle dark:bg-dark-subtle">
                <img
                  src={config.authorPhotoUrl}
                  alt={config.authorPhotoAlt || `${config.authorName} — ${config.authorRole}`}
                  className="w-full h-full object-cover object-top"
                />
              </div>
            )}
            <div className="space-y-3 flex-1">
              <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3">
                <h2 className="font-serif font-black text-2xl sm:text-3xl text-ink dark:text-dark-ink">
                  {config.authorName}
                </h2>
                {config.authorRole && (
                  <span className="font-mono text-xs uppercase tracking-widest text-accent dark:text-dark-accent font-semibold">
                    {config.authorRole}
                  </span>
                )}
              </div>
              <p className="font-serif text-sm sm:text-base leading-relaxed text-ink/85 dark:text-dark-ink/85">
                {config.authorBio}
              </p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 pt-1 font-mono text-xs text-ink-mute dark:text-dark-mute">
                {config.locationText && <span>Location: {config.locationText}</span>}
                {config.locationText && config.inquiriesEmail && <span>•</span>}
                {config.inquiriesEmail && (
                  <span>
                    Inquiries:{' '}
                    <a href={`mailto:${config.inquiriesEmail}`} className="text-accent hover:underline">
                      {config.inquiriesEmail}
                    </a>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Articles / Pillars */}
        {config.tenets && config.tenets.length > 0 && (
          <div
            className={`grid gap-6 sm:gap-10 mb-12 sm:mb-16 ${
              mobileVariant?.compactTenets
                ? 'grid-cols-1 sm:grid-cols-2'
                : 'grid-cols-1 md:grid-cols-2'
            }`}
          >
            {config.tenets.map((tenet, idx) => (
              <section
                key={tenet.id || `tenet-${idx}`}
                className="bg-paper dark:bg-dark-paper border border-rule dark:border-dark-rule rounded-2xl p-5 sm:p-8 transition-shadow hover:shadow-xs"
              >
                {tenet.label && (
                  <div className="font-mono text-[11px] font-bold text-accent uppercase tracking-widest mb-2">
                    {tenet.label}
                  </div>
                )}
                <h3 className="font-serif font-bold text-xl sm:text-2xl mb-2.5 sm:mb-3 text-ink dark:text-dark-ink">
                  {tenet.title}
                </h3>
                <p className="font-serif text-sm sm:text-base text-ink/80 dark:text-dark-ink/80 leading-relaxed">
                  {tenet.description}
                </p>
              </section>
            ))}
          </div>
        )}

        {/* Colophon & Digital Craft */}
        {config.mobileVariant?.showColophon !== false && config.colophonItems && config.colophonItems.length > 0 && (
          <section className="border-t border-b border-rule dark:border-dark-rule py-8 sm:py-10 my-6 sm:my-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {config.colophonItems.map((col, idx) => (
                <div key={col.id || `col-${idx}`}>
                  <h4 className="font-mono text-xs uppercase tracking-widest text-accent font-semibold mb-2">
                    {col.title}
                  </h4>
                  <p className="font-serif text-sm text-ink/75 dark:text-dark-ink/75 leading-relaxed">
                    {col.description}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Newsroom Ethics & Legal Notice Prompt */}
        {config.showLegalBanner && (
          <div className="bg-paper-subtle dark:bg-dark-subtle rounded-2xl p-5 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-5 sm:gap-6 border border-rule dark:border-dark-rule my-6 sm:my-8">
            <div className="text-center sm:text-left">
              <h3 className="font-serif font-bold text-lg sm:text-xl text-ink dark:text-dark-ink mb-1">
                {config.legalHeading}
              </h3>
              <p className="font-serif text-xs sm:text-sm text-ink-mute dark:text-dark-mute">
                {config.legalDescription}
              </p>
            </div>
            {config.legalButtonText && config.legalButtonUrl && (
              <Link
                href={config.legalButtonUrl}
                className="px-6 py-2.5 rounded-full border border-ink/30 dark:border-dark-ink/30 text-xs font-mono font-bold uppercase tracking-wider hover:bg-ink hover:text-white dark:hover:bg-white dark:hover:text-neutral-900 transition shrink-0"
              >
                {config.legalButtonText}
              </Link>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
