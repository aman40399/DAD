import type { Metadata } from 'next'
import Masthead from '@/components/meridian/Masthead'
import Footer from '@/components/meridian/Footer'
import Link from 'next/link'

const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://www.singh.monster').replace(/\/$/, '')

export const metadata: Metadata = {
  title: 'Fact-Checking Policy & Verification Protocols — Singh Monster',
  description:
    'Our four-tier verification protocol, primary document standards, and rigorous evidence requirements for all news reporting.',
  alternates: {
    canonical: `${baseUrl}/fact-checking`,
  },
  openGraph: {
    title: 'Fact-Checking Policy & Verification Protocols — Singh Monster',
    description:
      'Our four-tier verification protocol, primary document standards, and rigorous evidence requirements for all news reporting.',
    url: `${baseUrl}/fact-checking`,
    type: 'article',
  },
}

export default function FactCheckingPage() {
  const jsonLdFactChecking = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    'name': 'Singh Monster Fact-Checking and Verification Standards',
    'url': `${baseUrl}/fact-checking`,
    'mainEntity': {
      '@type': 'NewsMediaOrganization',
      'name': 'Singh Monster',
      'url': baseUrl,
      'verificationFactCheckingPolicy': `${baseUrl}/fact-checking`,
    },
  }

  return (
    <div className="min-h-screen flex flex-col bg-paper dark:bg-dark-paper text-ink dark:text-dark-ink transition-colors font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFactChecking) }}
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
            <span className="text-ink dark:text-dark-ink font-semibold">Fact-Checking</span>
          </div>
          <span>Verification Standard • Est. 2026</span>
        </div>

        {/* Hero Header */}
        <header className="mb-10 sm:mb-14">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent dark:text-dark-accent font-semibold mb-2">
            Rigorous Verification Architecture
          </p>
          <h1 className="font-serif font-black text-3xl sm:text-5xl md:text-6xl tracking-tight leading-tight mb-4">
            Fact-Checking & Verification Policy
          </h1>
          <p className="font-serif italic text-base sm:text-lg text-ink-mute dark:text-dark-mute max-w-3xl leading-relaxed">
            In an era of viral misinformation, synthetic deepfakes, and hyper-partisan spin, Singh Monster maintains
            an uncompromising 4-tier fact-checking process before any story is published.
          </p>
          <div className="w-16 h-0.5 bg-accent mt-6 opacity-80" />
        </header>

        {/* The 4-Tier Verification Framework */}
        <div className="space-y-12">
          {/* Step 1 */}
          <div className="bg-paper-subtle dark:bg-dark-subtle border border-rule dark:border-dark-rule rounded-2xl p-6 sm:p-8">
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-xs uppercase tracking-widest text-accent font-bold">
                Tier 1 Verification
              </span>
              <span className="font-mono text-xs text-ink-mute dark:text-dark-mute">Phase: Intake</span>
            </div>
            <h2 className="font-serif font-black text-2xl text-ink dark:text-dark-ink mb-3">
              Primary Source Authentication
            </h2>
            <p className="text-sm font-serif leading-relaxed text-ink/90 dark:text-dark-ink/90">
              We never report on rumors, social media claims, or unsourced third-party blogs. Every claim must trace directly to a verified primary source: direct quotes recorded on tape or in writing, official government gazettes (PIB, Rajya Sabha, Lok Sabha, US Federal Register, UN dispatches), or authenticated court filings.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-paper-subtle dark:bg-dark-subtle border border-rule dark:border-dark-rule rounded-2xl p-6 sm:p-8">
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-xs uppercase tracking-widest text-accent font-bold">
                Tier 2 Verification
              </span>
              <span className="font-mono text-xs text-ink-mute dark:text-dark-mute">Phase: Corroboration</span>
            </div>
            <h2 className="font-serif font-black text-2xl text-ink dark:text-dark-ink mb-3">
              Dual-Source Cross-Examination
            </h2>
            <p className="text-sm font-serif leading-relaxed text-ink/90 dark:text-dark-ink/90">
              For any investigative claim or breaking development not supported by a public public-record release, we require independent confirmation from at least two distinct, unaffiliated sources with firsthand knowledge of the matter.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-paper-subtle dark:bg-dark-subtle border border-rule dark:border-dark-rule rounded-2xl p-6 sm:p-8">
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-xs uppercase tracking-widest text-accent font-bold">
                Tier 3 Verification
              </span>
              <span className="font-mono text-xs text-ink-mute dark:text-dark-mute">Phase: Data & Math</span>
            </div>
            <h2 className="font-serif font-black text-2xl text-ink dark:text-dark-ink mb-3">
              Statistical and Mathematical Audit
            </h2>
            <p className="text-sm font-serif leading-relaxed text-ink/90 dark:text-dark-ink/90">
              Economic and technical reporting (such as inflation metrics, GDP indices, corporate earnings, or technical bandwidth speeds) is subject to line-by-line recalculation. Percentages, base year adjustments, and currency conversions are audited to prevent statistical distortions.
            </p>
          </div>

          {/* Step 4 */}
          <div className="bg-paper-subtle dark:bg-dark-subtle border border-rule dark:border-dark-rule rounded-2xl p-6 sm:p-8">
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-xs uppercase tracking-widest text-accent font-bold">
                Tier 4 Verification
              </span>
              <span className="font-mono text-xs text-ink-mute dark:text-dark-mute">Phase: Pre-Publish</span>
            </div>
            <h2 className="font-serif font-black text-2xl text-ink dark:text-dark-ink mb-3">
              Editor-in-Chief Review & Attribution Check
            </h2>
            <p className="text-sm font-serif leading-relaxed text-ink/90 dark:text-dark-ink/90">
              Prior to publication, Editor-in-Chief Dhananjay Singh reviews the full copy, assesses legal risks (defamation, sub-judice matters under Indian law), confirms clear attribution for every photograph and diagram, and verifies that headline phrasing accurately reflects article evidence.
            </p>
          </div>
        </div>

        {/* Reader Submission of Fact Inquiries */}
        <section className="mt-12 pt-8 border-t border-rule dark:border-dark-rule">
          <h3 className="font-serif font-bold text-xl text-ink dark:text-dark-ink mb-2">
            Disputing a Fact or Submitting Evidence
          </h3>
          <p className="font-serif text-sm text-ink-mute dark:text-dark-mute leading-relaxed mb-4">
            If you have verified documentation that contradicts any fact reported in our articles, please submit it immediately to our fact-checking desk. We investigate all credible disputes within 24 hours.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="mailto:factcheck@singh.monster"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent text-white font-mono text-xs font-bold uppercase tracking-wider hover:opacity-90 transition"
            >
              Email Fact-Checking Desk &rarr;
            </a>
            <Link
              href="/corrections"
              className="text-xs font-mono text-ink-mute dark:text-dark-mute hover:text-accent underline"
            >
              View Corrections Policy &rarr;
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
