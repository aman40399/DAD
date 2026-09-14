import type { Metadata } from 'next'
import Masthead from '@/components/meridian/Masthead'
import Footer from '@/components/meridian/Footer'
import Link from 'next/link'

const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://www.singh.monster').replace(/\/$/, '')

export const metadata: Metadata = {
  title: 'Contact the Newsroom & Grievance Redressal — Singh Monster',
  description:
    'Contact editorial desk, submit news tips, press releases, or file formal statutory grievances with the Grievance Officer of Singh Monster.',
  alternates: {
    canonical: `${baseUrl}/contact`,
  },
  openGraph: {
    title: 'Contact the Newsroom & Grievance Redressal — Singh Monster',
    description:
      'Contact editorial desk, submit news tips, or file formal statutory grievances under India IT Rules 2021.',
    url: `${baseUrl}/contact`,
    type: 'website',
  },
}

export default function ContactPage() {
  const jsonLdContact = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    'name': 'Singh Monster Editorial & Grievance Contact',
    'url': `${baseUrl}/contact`,
    'mainEntity': {
      '@type': 'NewsMediaOrganization',
      'name': 'Singh Monster',
      'url': baseUrl,
      'contactPoint': [
        {
          '@type': 'ContactPoint',
          'telephone': '+91-9876543210',
          'contactType': 'Editorial Newsroom',
          'email': 'contact@singh.monster',
          'areaServed': ['IN', 'Worldwide'],
          'availableLanguage': ['English', 'Hindi'],
        },
        {
          '@type': 'ContactPoint',
          'contactType': 'Grievance Officer',
          'email': 'grievance@singh.monster',
          'areaServed': 'IN',
          'availableLanguage': ['English', 'Hindi'],
        },
      ],
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
        'name': 'Contact',
        'item': `${baseUrl}/contact`,
      },
    ],
  }

  return (
    <div className="min-h-screen flex flex-col bg-paper dark:bg-dark-paper text-ink dark:text-dark-ink transition-colors font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdContact) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsSchema) }}
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
            <span className="text-ink dark:text-dark-ink font-semibold">Contact & Grievance</span>
          </div>
          <span>Newsroom Registry • Est. 2026</span>
        </div>

        {/* Hero Header */}
        <header className="mb-10 sm:mb-14">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent dark:text-dark-accent font-semibold mb-2">
            Direct Communications & Reader Relations
          </p>
          <h1 className="font-serif font-black text-3xl sm:text-5xl md:text-6xl tracking-tight leading-tight mb-4">
            Contact the Newsroom & Editorial Desk
          </h1>
          <p className="font-serif italic text-base sm:text-lg text-ink-mute dark:text-dark-mute max-w-3xl leading-relaxed">
            We hold ourselves to rigorous standards of transparency, accessibility, and accountability. Whether you
            have a breaking news tip, a correction request, a syndication inquiry, or a statutory grievance, our
            editorial team is directly reachable.
          </p>
          <div className="w-16 h-0.5 bg-accent mt-6 opacity-80" />
        </header>

        {/* Fast Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-paper-subtle dark:bg-dark-subtle border border-rule dark:border-dark-rule rounded-2xl p-6 transition-all hover:border-accent">
            <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center font-mono font-bold mb-4">
              01
            </div>
            <h3 className="font-serif font-black text-lg text-ink dark:text-dark-ink mb-1.5">
              News Tips & Story Leaks
            </h3>
            <p className="text-xs text-ink-mute dark:text-dark-mute font-serif leading-relaxed mb-4">
              Have a confidential tip, investigative document, or verified eyewitness account? Whistleblowers and sources receive absolute editorial protection.
            </p>
            <a
              href="mailto:tips@singh.monster"
              className="font-mono text-xs font-bold text-accent hover:underline flex items-center gap-1.5"
            >
              tips@singh.monster &rarr;
            </a>
          </div>

          <div className="bg-paper-subtle dark:bg-dark-subtle border border-rule dark:border-dark-rule rounded-2xl p-6 transition-all hover:border-accent">
            <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center font-mono font-bold mb-4">
              02
            </div>
            <h3 className="font-serif font-black text-lg text-ink dark:text-dark-ink mb-1.5">
              Corrections & Fact Queries
            </h3>
            <p className="text-xs text-ink-mute dark:text-dark-mute font-serif leading-relaxed mb-4">
              Spotted an error in fact, spelling, date, or attribution? Review our corrections policy and submit the exact article URL and supporting evidence.
            </p>
            <Link
              href="/corrections"
              className="font-mono text-xs font-bold text-accent hover:underline flex items-center gap-1.5"
            >
              Corrections Desk &rarr;
            </Link>
          </div>

          <div className="bg-paper-subtle dark:bg-dark-subtle border border-rule dark:border-dark-rule rounded-2xl p-6 transition-all hover:border-accent">
            <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center font-mono font-bold mb-4">
              03
            </div>
            <h3 className="font-serif font-black text-lg text-ink dark:text-dark-ink mb-1.5">
              Syndication & Press
            </h3>
            <p className="text-xs text-ink-mute dark:text-dark-mute font-serif leading-relaxed mb-4">
              For republishing rights, media appearances, interviews with Editor Dhananjay Singh, or official commentary dispatches.
            </p>
            <a
              href="mailto:press@singh.monster"
              className="font-mono text-xs font-bold text-accent hover:underline flex items-center gap-1.5"
            >
              press@singh.monster &rarr;
            </a>
          </div>
        </div>

        {/* Detailed Editorial Contacts & Grievance Officer */}
        <section className="bg-paper-subtle dark:bg-dark-subtle border border-rule dark:border-dark-rule rounded-2xl p-6 sm:p-10 mb-12">
          <div className="max-w-2xl">
            <span className="font-mono text-xs uppercase tracking-widest text-accent font-bold">
              Compliance Under IT Rules 2021
            </span>
            <h2 className="font-serif font-black text-2xl sm:text-3xl mt-1 mb-4 text-ink dark:text-dark-ink">
              Grievance Redressal Mechanism & Officer
            </h2>
            <p className="font-serif text-sm text-ink-mute dark:text-dark-mute leading-relaxed mb-6">
              In accordance with Rule 11 of the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021, Singh Monster maintains a formal Grievance Redressal mechanism for readers, subjects of reporting, and rights holders.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 border-t border-rule dark:border-dark-rule pt-6">
            <div>
              <h4 className="font-mono text-xs uppercase tracking-wider text-ink-mute dark:text-dark-mute mb-2">
                Designated Grievance Officer
              </h4>
              <p className="font-serif font-bold text-base text-ink dark:text-dark-ink">
                Dhananjay Singh
              </p>
              <p className="text-xs text-ink-mute dark:text-dark-mute mt-1 leading-normal font-serif">
                Founder, Editor-in-Chief & Resident Grievance Officer
              </p>
              <p className="text-xs text-ink-mute dark:text-dark-mute mt-1">
                Ballia, Uttar Pradesh — 277001, India
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="font-mono text-[11px] text-ink-mute dark:text-dark-mute uppercase tracking-wider block">
                  Official Grievance Email
                </span>
                <a
                  href="mailto:grievance@singh.monster"
                  className="font-mono font-bold text-accent hover:underline text-sm"
                >
                  grievance@singh.monster
                </a>
              </div>
              <div>
                <span className="font-mono text-[11px] text-ink-mute dark:text-dark-mute uppercase tracking-wider block">
                  General Newsroom Inquiries
                </span>
                <a
                  href="mailto:contact@singh.monster"
                  className="font-mono font-semibold text-ink dark:text-dark-ink hover:underline"
                >
                  contact@singh.monster
                </a>
              </div>
              <div>
                <span className="font-mono text-[11px] text-ink-mute dark:text-dark-mute uppercase tracking-wider block">
                  Statutory Turnaround Timeline
                </span>
                <span className="text-ink dark:text-dark-ink font-semibold">
                  Acknowledgment within 24 hours; disposal within 15 days
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Editorial Desk Principles Notice */}
        <div className="border-t border-rule dark:border-dark-rule pt-8 flex flex-col sm:flex-row items-baseline justify-between gap-4 text-xs text-ink-mute dark:text-dark-mute">
          <p className="font-serif">
            For further details regarding editorial standards, source verification, and ethics, please consult our{' '}
            <Link href="/editorial-guidelines" className="text-accent hover:underline font-semibold">
              Editorial Guidelines
            </Link>{' '}
            and{' '}
            <Link href="/fact-checking" className="text-accent hover:underline font-semibold">
              Fact-Checking Policy
            </Link>.
          </p>
          <span className="font-mono shrink-0">Updated: September 2026</span>
        </div>
      </main>

      <Footer />
    </div>
  )
}
