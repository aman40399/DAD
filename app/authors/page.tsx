import type { Metadata } from 'next'
import Masthead from '@/components/meridian/Masthead'
import Footer from '@/components/meridian/Footer'
import Link from 'next/link'

const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://www.singh.monster').replace(/\/$/, '')

export const metadata: Metadata = {
  title: 'Editorial Board & Authors Directory — Singh Monster',
  description:
    'Meet the journalists, editors, and correspondents driving investigative reporting and tech analysis at Singh Monster.',
  alternates: {
    canonical: `${baseUrl}/authors`,
  },
  openGraph: {
    title: 'Editorial Board & Authors Directory — Singh Monster',
    description:
      'Meet the journalists, editors, and correspondents driving investigative reporting and tech analysis at Singh Monster.',
    url: `${baseUrl}/authors`,
    type: 'website',
  },
}

export default function AuthorsPage() {
  const jsonLdAuthors = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    'name': 'Singh Monster Editorial Board and Authors Directory',
    'url': `${baseUrl}/authors`,
    'mainEntity': {
      '@type': 'ItemList',
      'itemListElement': [
        {
          '@type': 'ListItem',
          'position': 1,
          'item': {
            '@type': 'Person',
            'name': 'Dhananjay Singh',
            'jobTitle': 'Founder, Editor-in-Chief & Lead Reporter',
            'url': `${baseUrl}/author/dhananjay-singh`,
            'image': `${baseUrl}/authr.png`,
            'sameAs': [
              'https://twitter.com/SinghMonster',
              'https://www.linkedin.com/company/singhmonster',
            ],
          },
        },
      ],
    },
  }

  return (
    <div className="min-h-screen flex flex-col bg-paper dark:bg-dark-paper text-ink dark:text-dark-ink transition-colors font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdAuthors) }}
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
            <span className="text-ink dark:text-dark-ink font-semibold">Editorial Board</span>
          </div>
          <span>Newsroom Masthead • Est. 2026</span>
        </div>

        {/* Hero Header */}
        <header className="mb-10 sm:mb-14">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent dark:text-dark-accent font-semibold mb-2">
            Journalistic Masthead & Leadership
          </p>
          <h1 className="font-serif font-black text-3xl sm:text-5xl md:text-6xl tracking-tight leading-tight mb-4">
            Editorial Board & Writers
          </h1>
          <p className="font-serif italic text-base sm:text-lg text-ink-mute dark:text-dark-mute max-w-3xl leading-relaxed">
            Our newsroom is powered by dedicated investigative reporting, technical rigor, and deep regional context.
            Every dispatch is held to the highest standards of accuracy, attribution, and independence.
          </p>
          <div className="w-16 h-0.5 bg-accent mt-6 opacity-80" />
        </header>

        {/* Author Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Dhananjay Singh Card */}
          <div className="bg-paper-subtle dark:bg-dark-subtle border border-rule dark:border-dark-rule rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-start hover:border-accent transition">
            <img
              src="/authr.png"
              alt="Dhananjay Singh"
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border border-rule dark:border-dark-rule shrink-0 shadow-sm"
            />
            <div className="flex-1">
              <span className="font-mono text-[11px] uppercase tracking-wider text-accent font-bold block mb-1">
                Founder & Editor-in-Chief
              </span>
              <h2 className="font-serif font-black text-2xl text-ink dark:text-dark-ink mb-2">
                Dhananjay Singh
              </h2>
              <p className="text-xs font-serif leading-relaxed text-ink/85 dark:text-dark-ink/85 mb-4">
                Hailing from the historic district of Ballia, Uttar Pradesh, Dhananjay leads Singh Monster&apos;s reporting on telecommunications, 6G infrastructure, geopolitics, and emerging technologies.
              </p>
              <div className="flex items-center gap-3">
                <Link
                  href="/author/dhananjay-singh"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-accent text-white font-mono text-xs font-bold uppercase tracking-wider hover:opacity-90 transition"
                >
                  View Profile & Stories &rarr;
                </Link>
                <Link
                  href="/about"
                  className="font-mono text-xs text-ink-mute dark:text-dark-mute hover:text-accent underline"
                >
                  Read Story
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
