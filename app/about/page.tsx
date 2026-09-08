import type { Metadata } from 'next'
import Masthead from '@/components/meridian/Masthead'
import Footer from '@/components/meridian/Footer'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About Us — Editorial Mission & Standards',
  description:
    'The editorial philosophy, journalistic standards, and independent mission of Singh Monster, led by Dhananjay Singh.',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-paper dark:bg-dark-paper text-ink dark:text-dark-ink transition-colors">
      <Masthead />

      <main className="flex-1 max-w-[1080px] w-full mx-auto px-4 sm:px-6 py-10 sm:py-14">
        {/* Breadcrumb & Section Dateline */}
        <div className="flex items-center justify-between border-b border-rule dark:border-dark-rule pb-3 mb-8 font-mono text-[11px] uppercase tracking-widest text-ink-mute dark:text-dark-mute">
          <div className="flex items-center gap-2">
            <Link href="/" className="hover:text-accent transition">
              Home
            </Link>
            <span>/</span>
            <span className="text-ink dark:text-dark-ink font-semibold">About Us</span>
          </div>
          <span className="hidden sm:inline">Journal of Record • Est. 2026</span>
        </div>

        {/* Hero Header */}
        <header className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent dark:text-dark-accent font-semibold mb-3">
            Institutional Charter & Editorial Creed
          </p>
          <h1 className="font-serif font-black text-3xl sm:text-5xl md:text-6xl tracking-tight leading-[1.1] mb-6">
            Sharp reporting. Deep analysis. No agenda but the truth.
          </h1>
          <p className="font-serif italic text-base sm:text-lg text-ink-mute dark:text-dark-mute leading-relaxed">
            Singh Monster is an independent broadsheet chronicle devoted to fearless investigative journalism,
            dispassionate market analysis, and unvarnished public affairs reporting.
          </p>
          <div className="w-24 h-0.5 bg-accent mx-auto mt-8 opacity-80" />
        </header>

        {/* Founder & Lead Correspondent Profile */}
        <div className="bg-paper-subtle dark:bg-[#121215] border border-rule/80 dark:border-white/10 rounded-2xl p-6 sm:p-8 mb-14 shadow-xs">
          <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 items-center sm:items-start text-center sm:text-left">
            <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden border-2 border-rule dark:border-white/15 shadow-md shrink-0 bg-paper-subtle dark:bg-dark-subtle">
              <img
                src="/authr.png"
                alt="Dhananjay Singh — Founder & Editor-in-Chief"
                className="w-full h-full object-cover object-top"
              />
            </div>
            <div className="space-y-3 flex-1">
              <div className="flex flex-col sm:flex-row sm:items-baseline gap-1.5 sm:gap-3">
                <h2 className="font-serif font-black text-2xl sm:text-3xl text-ink dark:text-dark-ink">
                  Dhananjay Singh
                </h2>
                <span className="font-mono text-xs uppercase tracking-widest text-accent dark:text-dark-accent font-semibold">
                  Founder • Editor-in-Chief • Lead Correspondent
                </span>
              </div>
              <p className="font-serif text-sm sm:text-base leading-relaxed text-ink/85 dark:text-dark-ink/85">
                Dhananjay Singh directs all investigative research, reporting dispatches, and editorial curation for
                Singh Monster. Operating without corporate patronage, party allegiance, or advertising conglomerate
                entanglements, the publication was created to deliver an unsparing mirror to power, finance, and global
                developments.
              </p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 pt-1 font-mono text-xs text-ink-mute dark:text-dark-mute">
                <span>Location: India &amp; Global Dispatches</span>
                <span>•</span>
                <span>Inquiries: <a href="mailto:editorial@singhmonster.com" className="text-accent hover:underline">editorial@singhmonster.com</a></span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Articles / Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 mb-16">
          {/* Pillar 1 */}
          <section className="bg-paper dark:bg-dark-paper border border-rule dark:border-dark-rule rounded-2xl p-6 sm:p-8 transition-shadow hover:shadow-xs">
            <div className="font-mono text-[11px] font-bold text-accent uppercase tracking-widest mb-2">
              Tenet 01
            </div>
            <h3 className="font-serif font-bold text-xl sm:text-2xl mb-3 text-ink dark:text-dark-ink">
              Fearless Independence
            </h3>
            <p className="font-serif text-sm sm:text-base text-ink/80 dark:text-dark-ink/80 leading-relaxed">
              We accept no venture backing, no government grants, and no partisan contributions that could compromise
              editorial autonomy. Our dispatches are produced under a strict commitment to report events exactly as facts
              dictate, without softening conclusions for political or financial convenience.
            </p>
          </section>

          {/* Pillar 2 */}
          <section className="bg-paper dark:bg-dark-paper border border-rule dark:border-dark-rule rounded-2xl p-6 sm:p-8 transition-shadow hover:shadow-xs">
            <div className="font-mono text-[11px] font-bold text-accent uppercase tracking-widest mb-2">
              Tenet 02
            </div>
            <h3 className="font-serif font-bold text-xl sm:text-2xl mb-3 text-ink dark:text-dark-ink">
              Primary Source Verification
            </h3>
            <p className="font-serif text-sm sm:text-base text-ink/80 dark:text-dark-ink/80 leading-relaxed">
              Every investigative report published under the Singh Monster masthead is rooted in primary source documents:
              regulatory filings, judicial dockets, verified field records, and corroborative technical datasets. We do not
              recycle press releases or speculate without documented evidence.
            </p>
          </section>

          {/* Pillar 3 */}
          <section className="bg-paper dark:bg-dark-paper border border-rule dark:border-dark-rule rounded-2xl p-6 sm:p-8 transition-shadow hover:shadow-xs">
            <div className="font-mono text-[11px] font-bold text-accent uppercase tracking-widest mb-2">
              Tenet 03
            </div>
            <h3 className="font-serif font-bold text-xl sm:text-2xl mb-3 text-ink dark:text-dark-ink">
              Deep Structural Analysis
            </h3>
            <p className="font-serif text-sm sm:text-base text-ink/80 dark:text-dark-ink/80 leading-relaxed">
              While digital news cycles accelerate towards ephemeral sensationalism, our mission is structural clarity. We
              trace macroeconomic flows, algorithmic disruptions, geopolitical treaties, and constitutional precedents to
              explain why events happen and what lies ahead.
            </p>
          </section>

          {/* Pillar 4 */}
          <section className="bg-paper dark:bg-dark-paper border border-rule dark:border-dark-rule rounded-2xl p-6 sm:p-8 transition-shadow hover:shadow-xs">
            <div className="font-mono text-[11px] font-bold text-accent uppercase tracking-widest mb-2">
              Tenet 04
            </div>
            <h3 className="font-serif font-bold text-xl sm:text-2xl mb-3 text-ink dark:text-dark-ink">
              Transparent Corrections
            </h3>
            <p className="font-serif text-sm sm:text-base text-ink/80 dark:text-dark-ink/80 leading-relaxed">
              Integrity is measured by how an editor addresses errors. When factual inaccuracies occur, we correct them
              swiftly and visibly. An errata note is appended to the dispatch detailing the date, nature of correction,
              and original text, ensuring complete archival transparency.
            </p>
          </section>
        </div>

        {/* Colophon & Digital Craft */}
        <section className="border-t border-b border-rule dark:border-dark-rule py-10 my-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h4 className="font-mono text-xs uppercase tracking-widest text-accent font-semibold mb-2">
                Typography
              </h4>
              <p className="font-serif text-sm text-ink/75 dark:text-dark-ink/75 leading-relaxed">
                Typeset in Source Serif 4 for broadsheet elegance, paired with Inter for clean reading ergonomics and
                JetBrains Mono for precise financial ticker figures and datelines.
              </p>
            </div>
            <div>
              <h4 className="font-mono text-xs uppercase tracking-widest text-accent font-semibold mb-2">
                Infrastructure
              </h4>
              <p className="font-serif text-sm text-ink/75 dark:text-dark-ink/75 leading-relaxed">
                Engineered with Next.js 14 App Router, React Server Components, Tailwind CSS, and Cloudflare distributed
                media storage for sub-second global dispatch delivery.
              </p>
            </div>
            <div>
              <h4 className="font-mono text-xs uppercase tracking-widest text-accent font-semibold mb-2">
                Archival Record
              </h4>
              <p className="font-serif text-sm text-ink/75 dark:text-dark-ink/75 leading-relaxed">
                Every published dispatch receives an immutable cryptographic timestamp and slug-indexed identifier to
                guarantee historical permanence across our public archive.
              </p>
            </div>
          </div>
        </section>

        {/* Newsroom Ethics & Legal Notice Prompt */}
        <div className="bg-paper-subtle dark:bg-dark-subtle rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 border border-rule dark:border-dark-rule">
          <div>
            <h3 className="font-serif font-bold text-lg sm:text-xl text-ink dark:text-dark-ink mb-1">
              Legal Disclaimers & Fair Dealing
            </h3>
            <p className="font-serif text-xs sm:text-sm text-ink-mute dark:text-dark-mute">
              Read our full statutory disclosures under Section 79 IT Act, Article 19(1)(a), and fair dealing terms.
            </p>
          </div>
          <Link
            href="/privacy"
            className="px-6 py-2.5 rounded-full border border-ink/30 dark:border-dark-ink/30 text-xs font-mono font-bold uppercase tracking-wider hover:bg-ink hover:text-white dark:hover:bg-white dark:hover:text-neutral-900 transition shrink-0"
          >
            Review Disclaimers →
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  )
}
