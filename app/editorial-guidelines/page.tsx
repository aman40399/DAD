import type { Metadata } from 'next'
import Masthead from '@/components/meridian/Masthead'
import Footer from '@/components/meridian/Footer'
import Link from 'next/link'

const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://www.singh.monster').replace(/\/$/, '')

export const metadata: Metadata = {
  title: 'Editorial Guidelines & Standards of Independence — Singh Monster',
  description:
    'The journalistic charter, fact-checking rules, independence pledges, and source protection standards observed by Singh Monster.',
  alternates: {
    canonical: `${baseUrl}/editorial-guidelines`,
  },
  openGraph: {
    title: 'Editorial Guidelines & Standards of Independence — Singh Monster',
    description:
      'The journalistic charter, fact-checking rules, independence pledges, and source protection standards observed by Singh Monster.',
    url: `${baseUrl}/editorial-guidelines`,
    type: 'article',
  },
}

export default function EditorialGuidelinesPage() {
  const jsonLdPrinciples = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    'name': 'Editorial Guidelines and Journalistic Standards of Singh Monster',
    'url': `${baseUrl}/editorial-guidelines`,
    'mainEntity': {
      '@type': 'NewsMediaOrganization',
      'name': 'Singh Monster',
      'url': baseUrl,
      'publishingPrinciples': `${baseUrl}/editorial-guidelines`,
      'ethicsPolicy': `${baseUrl}/editorial-guidelines`,
      'correctionsPolicy': `${baseUrl}/corrections`,
      'verificationFactCheckingPolicy': `${baseUrl}/fact-checking`,
    },
  }

  return (
    <div className="min-h-screen flex flex-col bg-paper dark:bg-dark-paper text-ink dark:text-dark-ink transition-colors font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdPrinciples) }}
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
            <span className="text-ink dark:text-dark-ink font-semibold">Editorial Standards</span>
          </div>
          <span>Code of Ethics • Est. 2026</span>
        </div>

        {/* Hero Header */}
        <header className="mb-10 sm:mb-14">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent dark:text-dark-accent font-semibold mb-2">
            Journalistic Charter & Standards of Practice
          </p>
          <h1 className="font-serif font-black text-3xl sm:text-5xl md:text-6xl tracking-tight leading-tight mb-4">
            Editorial Guidelines & Independence
          </h1>
          <p className="font-serif italic text-base sm:text-lg text-ink-mute dark:text-dark-mute max-w-3xl leading-relaxed">
            Singh Monster operates on a bedrock principle: journalism without fear, favour, or corporate capture.
            Our mandate is to decode geopolitical shifts, economic realities, technology breakthroughs, and national affairs with uncompromising rigour and clarity.
          </p>
          <div className="w-16 h-0.5 bg-accent mt-6 opacity-80" />
        </header>

        {/* Editorial Pillars */}
        <div className="space-y-12">
          {/* Pillar 1: Accuracy & Primary Sources */}
          <section className="border-b border-rule dark:border-dark-rule pb-10">
            <div className="flex items-baseline gap-3 mb-3">
              <span className="font-mono text-sm font-bold text-accent">01.</span>
              <h2 className="font-serif font-black text-2xl text-ink dark:text-dark-ink">
                Commitment to Accuracy and Primary Source Reporting
              </h2>
            </div>
            <div className="space-y-4 text-sm font-serif leading-relaxed text-ink/90 dark:text-dark-ink/90">
              <p>
                Every assertion of fact published by Singh Monster must be substantiated by authoritative, verifiable
                evidence. We prioritize primary source materials: official government white papers, gazette notifications,
                court transcripts, peer-reviewed scientific journals, regulatory disclosures, and first-party interviews.
              </p>
              <p>
                When secondary reporting from international or domestic news agencies (such as Reuters, PTI, or AFP)
                is cited, our editorial desk independently cross-verifies core claims against official registries or on-the-ground records before publication.
              </p>
            </div>
          </section>

          {/* Pillar 2: Editorial Independence */}
          <section className="border-b border-rule dark:border-dark-rule pb-10">
            <div className="flex items-baseline gap-3 mb-3">
              <span className="font-mono text-sm font-bold text-accent">02.</span>
              <h2 className="font-serif font-black text-2xl text-ink dark:text-dark-ink">
                Absolute Editorial Independence
              </h2>
            </div>
            <div className="space-y-4 text-sm font-serif leading-relaxed text-ink/90 dark:text-dark-ink/90">
              <p>
                Singh Monster maintains strict separation between editorial decision-making and any advertising,
                sponsorship, or political interests. Our editorial coverage is never for sale. We do not publish paid native
                advertising masquerading as news, nor do we permit commercial partners to review, approve, or alter stories
                prior to publication.
              </p>
              <p>
                Editorial leadership resides exclusively with Founder and Editor-in-Chief Dhananjay Singh, whose reporting
                is governed solely by public interest and truth.
              </p>
            </div>
          </section>

          {/* Pillar 3: Sources & Attribution */}
          <section className="border-b border-rule dark:border-dark-rule pb-10">
            <div className="flex items-baseline gap-3 mb-3">
              <span className="font-mono text-sm font-bold text-accent">03.</span>
              <h2 className="font-serif font-black text-2xl text-ink dark:text-dark-ink">
                Source Protection & Anonymous Sourcing
              </h2>
            </div>
            <div className="space-y-4 text-sm font-serif leading-relaxed text-ink/90 dark:text-dark-ink/90">
              <p>
                We believe on-the-record statements are the gold standard of transparent reporting. Anonymity is granted
                only when a source faces legitimate danger of physical harm, legal retaliation, or career destruction,
                and when the information provided is vital to the public interest and unobtainable through other means.
              </p>
              <p>
                When anonymous sources are cited, our readers are informed of the source&apos;s general role and rationale for
                anonymity (e.g., &ldquo;a senior telecom ministry official not authorized to speak publicly&rdquo;).
              </p>
            </div>
          </section>

          {/* Pillar 4: Artificial Intelligence & Automation Policy */}
          <section className="border-b border-rule dark:border-dark-rule pb-10">
            <div className="flex items-baseline gap-3 mb-3">
              <span className="font-mono text-sm font-bold text-accent">04.</span>
              <h2 className="font-serif font-black text-2xl text-ink dark:text-dark-ink">
                Artificial Intelligence & Automation Policy
              </h2>
            </div>
            <div className="space-y-4 text-sm font-serif leading-relaxed text-ink/90 dark:text-dark-ink/90">
              <p>
                Artificial intelligence and machine translation tools may be utilized as auxiliary instruments for
                cross-referencing large datasets, structuring tables, or language translation assistance.
              </p>
              <p>
                <strong>Zero AI-Only Reporting:</strong> No story or investigative piece is published solely by an automated
                model without meticulous human verification, editing, and editorial sign-off by Dhananjay Singh. Every factual
                claim remains human-audited and human-responsible.
              </p>
            </div>
          </section>

          {/* Pillar 5: Right of Reply & Fair Dealing */}
          <section className="pb-6">
            <div className="flex items-baseline gap-3 mb-3">
              <span className="font-mono text-sm font-bold text-accent">05.</span>
              <h2 className="font-serif font-black text-2xl text-ink dark:text-dark-ink">
                Right of Reply and Corrections Accountability
              </h2>
            </div>
            <div className="space-y-4 text-sm font-serif leading-relaxed text-ink/90 dark:text-dark-ink/90">
              <p>
                Any individual or institution that is the subject of critical investigative reporting is provided a fair
                and timely opportunity to respond prior to publication, with their comments incorporated contextually.
              </p>
              <p>
                When errors occur, we correct them swiftly, visibly, and without evasion in accordance with our{' '}
                <Link href="/corrections" className="text-accent hover:underline font-semibold">
                  Corrections Policy
                </Link>.
              </p>
            </div>
          </section>
        </div>

        {/* Footer Link Navigation */}
        <div className="border-t border-rule dark:border-dark-rule pt-8 flex flex-col sm:flex-row items-baseline justify-between gap-4 text-xs text-ink-mute dark:text-dark-mute">
          <p className="font-serif">
            For inquiries regarding our standards, email{' '}
            <a href="mailto:editor@singh.monster" className="text-accent hover:underline font-semibold">
              editor@singh.monster
            </a>.
          </p>
          <span className="font-mono shrink-0">Adopted: September 2026</span>
        </div>
      </main>

      <Footer />
    </div>
  )
}
