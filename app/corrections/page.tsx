import type { Metadata } from 'next'
import Masthead from '@/components/meridian/Masthead'
import Footer from '@/components/meridian/Footer'
import Link from 'next/link'

const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://www.singh.monster').replace(/\/$/, '')

export const metadata: Metadata = {
  title: 'Corrections & Retractions Policy — Singh Monster',
  description:
    'Our transparent standards for acknowledging and correcting errors, publishing clarifications, and maintaining public accountability.',
  alternates: {
    canonical: `${baseUrl}/corrections`,
  },
  openGraph: {
    title: 'Corrections & Retractions Policy — Singh Monster',
    description:
      'Our transparent standards for acknowledging and correcting errors, publishing clarifications, and maintaining public accountability.',
    url: `${baseUrl}/corrections`,
    type: 'article',
  },
}

export default function CorrectionsPage() {
  const jsonLdCorrections = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    'name': 'Singh Monster Corrections and Retractions Policy',
    'url': `${baseUrl}/corrections`,
    'mainEntity': {
      '@type': 'NewsMediaOrganization',
      'name': 'Singh Monster',
      'url': baseUrl,
      'correctionsPolicy': `${baseUrl}/corrections`,
    },
  }

  return (
    <div className="min-h-screen flex flex-col bg-paper dark:bg-dark-paper text-ink dark:text-dark-ink transition-colors font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdCorrections) }}
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
            <span className="text-ink dark:text-dark-ink font-semibold">Corrections Policy</span>
          </div>
          <span>Accountability Protocol • Est. 2026</span>
        </div>

        {/* Hero Header */}
        <header className="mb-10 sm:mb-14">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent dark:text-dark-accent font-semibold mb-2">
            Accountability & Editorial Transparency
          </p>
          <h1 className="font-serif font-black text-3xl sm:text-5xl md:text-6xl tracking-tight leading-tight mb-4">
            Corrections & Retractions Policy
          </h1>
          <p className="font-serif italic text-base sm:text-lg text-ink-mute dark:text-dark-mute max-w-3xl leading-relaxed">
            At Singh Monster, intellectual honesty is foundational to our relationship with readers. When we get something
            wrong, we do not quietly alter copy or pretend the mistake never happened. We correct it promptly, visibly, and explain what was changed.
          </p>
          <div className="w-16 h-0.5 bg-accent mt-6 opacity-80" />
        </header>

        {/* Standards of Correction */}
        <div className="space-y-10">
          <section className="border-b border-rule dark:border-dark-rule pb-8">
            <h2 className="font-serif font-black text-2xl text-ink dark:text-dark-ink mb-3">
              1. Factual Corrections
            </h2>
            <div className="space-y-3 text-sm font-serif leading-relaxed text-ink/90 dark:text-dark-ink/90">
              <p>
                If an article contains an error of fact (such as a misspelled name, incorrect date, mistaken statistic, or misattributed quote), the story is updated immediately once the correct information is verified.
              </p>
              <p>
                A prominent <strong>Correction Note</strong> is appended to the bottom or top of the article detailing:
              </p>
              <ul className="list-disc pl-6 space-y-1 font-sans text-xs text-ink/80 dark:text-dark-ink/80">
                <li>The exact date and time the correction was published (IST).</li>
                <li>What the original text incorrectly stated.</li>
                <li>The accurate information and the source verifying the correction.</li>
              </ul>
            </div>
          </section>

          <section className="border-b border-rule dark:border-dark-rule pb-8">
            <h2 className="font-serif font-black text-2xl text-ink dark:text-dark-ink mb-3">
              2. Clarifications & Added Context
            </h2>
            <div className="space-y-3 text-sm font-serif leading-relaxed text-ink/90 dark:text-dark-ink/90">
              <p>
                When a story is factually correct but phrasing was ambiguous or lacked vital context that could lead to misinterpretation, we issue a <strong>Clarification Note</strong>. The text is refined to provide full nuance without altering underlying facts.
              </p>
            </div>
          </section>

          <section className="border-b border-rule dark:border-dark-rule pb-8">
            <h2 className="font-serif font-black text-2xl text-ink dark:text-dark-ink mb-3">
              3. Full Retractions
            </h2>
            <div className="space-y-3 text-sm font-serif leading-relaxed text-ink/90 dark:text-dark-ink/90">
              <p>
                In the rare circumstance where the fundamental premise of an investigative report is proven invalid, or if documents relied upon are revealed to be fraudulent, Singh Monster will formally retract the story.
              </p>
              <p>
                Retracted articles are marked with an unmistakable banner across the headline. The original text is preserved with strikethrough styling along with an extensive explanatory statement from Editor Dhananjay Singh detailing how the failure occurred.
              </p>
            </div>
          </section>

          <section className="bg-paper-subtle dark:bg-dark-subtle border border-rule dark:border-dark-rule rounded-2xl p-6 sm:p-8">
            <h2 className="font-serif font-black text-2xl text-ink dark:text-dark-ink mb-3">
              How to Request a Correction
            </h2>
            <p className="text-sm font-serif leading-relaxed text-ink/90 dark:text-dark-ink/90 mb-4">
              We welcome and actively investigate correction requests from readers, official spokespersons, and subjects of reporting. To submit a correction request, please include:
            </p>
            <ol className="list-decimal pl-6 space-y-2 font-sans text-xs text-ink/85 dark:text-dark-ink/85 mb-6">
              <li><strong>Article URL:</strong> The exact link to the article on singh.monster.</li>
              <li><strong>The Claim:</strong> Quote the specific paragraph or sentence you believe to be inaccurate.</li>
              <li><strong>Supporting Proof:</strong> Attach official documentation, links to primary records, or verifiable evidence disproving the claim.</li>
              <li><strong>Contact Info:</strong> Your name and affiliation (if representing an organization).</li>
            </ol>
            <div className="flex flex-wrap items-center gap-4">
              <a
                href="mailto:corrections@singh.monster"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent text-white font-mono text-xs font-bold uppercase tracking-wider hover:opacity-90 transition"
              >
                corrections@singh.monster &rarr;
              </a>
              <span className="font-mono text-xs text-ink-mute dark:text-dark-mute">
                Turnaround: Reviewed within 24 hours
              </span>
            </div>
          </section>
        </div>

        {/* Footer Navigation */}
        <div className="border-t border-rule dark:border-dark-rule pt-8 mt-10 flex flex-col sm:flex-row items-baseline justify-between gap-4 text-xs text-ink-mute dark:text-dark-mute">
          <p className="font-serif">
            Read our complete{' '}
            <Link href="/editorial-guidelines" className="text-accent hover:underline font-semibold">
              Editorial Guidelines
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-accent hover:underline font-semibold">
              Privacy & Legal Disclaimers
            </Link>.
          </p>
          <span className="font-mono shrink-0">Updated: September 2026</span>
        </div>
      </main>

      <Footer />
    </div>
  )
}
