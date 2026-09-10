import type { Metadata } from 'next'
import Masthead from '@/components/meridian/Masthead'
import Footer from '@/components/meridian/Footer'
import Link from 'next/link'

const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://www.singh.monster').replace(/\/$/, '')

export const metadata: Metadata = {
  title: 'Terms of Service & Reader Agreement — Singh Monster',
  description:
    'Terms and conditions governing access, fair dealing, copyright usage, intellectual property, and reader conduct on Singh Monster.',
  alternates: {
    canonical: `${baseUrl}/terms`,
  },
  openGraph: {
    title: 'Terms of Service & Reader Agreement — Singh Monster',
    description:
      'Terms and conditions governing access, fair dealing, copyright usage, intellectual property, and reader conduct on Singh Monster.',
    url: `${baseUrl}/terms`,
    type: 'article',
  },
}

export default function TermsPage() {
  const jsonLdTerms = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    'name': 'Singh Monster Terms of Service and Reader Agreement',
    'url': `${baseUrl}/terms`,
    'publisher': {
      '@type': 'NewsMediaOrganization',
      'name': 'Singh Monster',
      'url': baseUrl,
    },
  }

  return (
    <div className="min-h-screen flex flex-col bg-paper dark:bg-dark-paper text-ink dark:text-dark-ink transition-colors font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdTerms) }}
      />
      <Masthead brandName="Singh Monster" tagline="Sharp reporting. Deep analysis. No agenda but the truth." />

      <main className="flex-1 max-w-[960px] w-full mx-auto px-4 sm:px-6 py-10 sm:py-14">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center justify-between border-b border-rule dark:border-dark-rule pb-3 mb-8 font-mono text-[11px] uppercase tracking-widest text-ink-mute dark:text-dark-mute">
          <div className="flex items-center gap-2">
            <Link href="/" className="hover:text-accent transition">
              Home
            </Link>
            <span>/</span>
            <span className="text-ink dark:text-dark-ink font-semibold">Terms of Service</span>
          </div>
          <span>Effective: September 2026</span>
        </div>

        {/* Hero Header */}
        <header className="mb-10 sm:mb-14">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent dark:text-dark-accent font-semibold mb-2">
            Terms of Use & Legal Framework
          </p>
          <h1 className="font-serif font-black text-3xl sm:text-5xl md:text-6xl tracking-tight leading-tight mb-4">
            Terms of Service & Reader Agreement
          </h1>
          <p className="font-serif italic text-base sm:text-lg text-ink-mute dark:text-dark-mute max-w-3xl leading-relaxed">
            Welcome to Singh Monster. By visiting, reading, or referencing our publications, you agree to comply with
            and be bound by the following terms, conditions, and copyright provisions.
          </p>
          <div className="w-16 h-0.5 bg-accent mt-6 opacity-80" />
        </header>

        {/* Clauses */}
        <div className="space-y-10">
          <section className="border-b border-rule dark:border-dark-rule pb-8">
            <h2 className="font-serif font-black text-2xl text-ink dark:text-dark-ink mb-3">
              1. Ownership of Content & Copyright
            </h2>
            <div className="space-y-3 text-sm font-serif leading-relaxed text-ink/90 dark:text-dark-ink/90">
              <p>
                All editorial articles, investigative analyses, graphics, headlines, audio transcripts, and proprietary
                layouts published on singh.monster are the intellectual property of Singh Monster and Founder Dhananjay Singh,
                protected under the Indian Copyright Act, 1957, and international copyright treaties.
              </p>
              <p>
                Reproduction of entire articles without prior written permission is strictly prohibited.
              </p>
            </div>
          </section>

          <section className="border-b border-rule dark:border-dark-rule pb-8">
            <h2 className="font-serif font-black text-2xl text-ink dark:text-dark-ink mb-3">
              2. Permitted Fair Dealing & Syndication Quoting
            </h2>
            <div className="space-y-3 text-sm font-serif leading-relaxed text-ink/90 dark:text-dark-ink/90">
              <p>
                Academic researchers, fellow journalists, and commentators may quote brief excerpts (up to 150 words) under
                the doctrine of Fair Dealing (Section 52 of the Indian Copyright Act, 1957), provided that:
              </p>
              <ul className="list-disc pl-6 space-y-1 font-sans text-xs text-ink/80 dark:text-dark-ink/80">
                <li>Clear verbal and written attribution is given to <strong>&ldquo;Singh Monster / Dhananjay Singh&rdquo;</strong>.</li>
                <li>A direct, clickable dofollow hyperlink is provided to the canonical article URL on singh.monster.</li>
                <li>The quote is not edited out of context to distort the original journalistic meaning.</li>
              </ul>
            </div>
          </section>

          <section className="border-b border-rule dark:border-dark-rule pb-8">
            <h2 className="font-serif font-black text-2xl text-ink dark:text-dark-ink mb-3">
              3. Crawling, Scraping & Automated Indexing
            </h2>
            <div className="space-y-3 text-sm font-serif leading-relaxed text-ink/90 dark:text-dark-ink/90">
              <p>
                Standard search engine crawlers (Google, Bing, Applebot, DuckDuckGo) are expressly authorized to crawl
                and index public dispatches in accordance with our <a href="/robots.txt" className="text-accent underline font-mono">robots.txt</a> directives.
              </p>
              <p>
                Mass harvesting, scraping of database endpoints, denial-of-service stress testing, or unauthorized LLM training
                scrapers attempting to mirror entire newsroom databases without attribution are forbidden.
              </p>
            </div>
          </section>

          <section className="border-b border-rule dark:border-dark-rule pb-8">
            <h2 className="font-serif font-black text-2xl text-ink dark:text-dark-ink mb-3">
              4. Disclaimer of Warranties & Limitation of Liability
            </h2>
            <div className="space-y-3 text-sm font-serif leading-relaxed text-ink/90 dark:text-dark-ink/90">
              <p>
                Singh Monster publishes news reporting and analysis in good faith for public enlightenment. While every
                effort is made to ensure rigorous accuracy, information is provided on an &ldquo;as is&rdquo; basis.
              </p>
              <p>
                Singh Monster and Dhananjay Singh shall not be liable for any direct, indirect, or consequential losses
                arising from decisions made based upon reporting, market indices, or technical explanations published herein.
              </p>
            </div>
          </section>

          <section className="pb-6">
            <h2 className="font-serif font-black text-2xl text-ink dark:text-dark-ink mb-3">
              5. Governing Law & Jurisdiction
            </h2>
            <div className="space-y-3 text-sm font-serif leading-relaxed text-ink/90 dark:text-dark-ink/90">
              <p>
                These terms and any legal disputes arising out of the content of Singh Monster shall be governed by
                the laws of the Republic of India. The courts of competent jurisdiction located in Ballia, Uttar Pradesh,
                or the High Court of Judicature at Allahabad shall have exclusive jurisdiction over any proceedings.
              </p>
            </div>
          </section>
        </div>

        {/* Footer Navigation */}
        <div className="border-t border-rule dark:border-dark-rule pt-8 mt-10 flex flex-col sm:flex-row items-baseline justify-between gap-4 text-xs text-ink-mute dark:text-dark-mute">
          <p className="font-serif">
            For legal inquiries or syndication rights, email{' '}
            <a href="mailto:contact@singh.monster" className="text-accent hover:underline font-semibold">
              contact@singh.monster
            </a>.
          </p>
          <span className="font-mono shrink-0">Updated: September 2026</span>
        </div>
      </main>

      <Footer />
    </div>
  )
}
