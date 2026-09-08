import type { Metadata } from 'next'
import Masthead from '@/components/meridian/Masthead'
import Footer from '@/components/meridian/Footer'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy & Legal Disclaimers',
  description:
    'Legal disclosures, personal blog disclaimers, safe harbor protections under Section 79 IT Act, fair dealing, and grievance redressal for Singh Monster.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-paper dark:bg-dark-paper text-ink dark:text-dark-ink transition-colors">
      <Masthead />

      <main className="flex-1 max-w-[960px] w-full mx-auto px-4 sm:px-6 py-10 sm:py-14">
        {/* Breadcrumb & Section Dateline */}
        <div className="flex items-center justify-between border-b border-rule dark:border-dark-rule pb-3 mb-8 font-mono text-[11px] uppercase tracking-widest text-ink-mute dark:text-dark-mute">
          <div className="flex items-center gap-2">
            <Link href="/" className="hover:text-accent transition">
              Home
            </Link>
            <span>/</span>
            <span className="text-ink dark:text-dark-ink font-semibold">Privacy & Legal Disclaimers</span>
          </div>
          <span>Effective: September 2026</span>
        </div>

        {/* Header */}
        <header className="mb-10 sm:mb-14">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent dark:text-dark-accent font-semibold mb-2">
            Statutory Protections & Publisher Disclosures
          </p>
          <h1 className="font-serif font-black text-3xl sm:text-5xl tracking-tight leading-tight mb-4">
            Privacy Policy & Legal Disclaimers
          </h1>
          <p className="font-serif italic text-base text-ink-mute dark:text-dark-mute max-w-3xl leading-relaxed">
            Please read these terms and statutory disclosures carefully. By accessing or reading Singh Monster, you
            expressly acknowledge and agree to the disclaimers, limitation of liability, and fair dealing terms set
            forth below.
          </p>
          <div className="w-16 h-0.5 bg-accent mt-6 opacity-80" />
        </header>

        {/* Quick Legal Summary Box */}
        <div className="bg-paper-subtle dark:bg-dark-subtle border border-rule dark:border-dark-rule rounded-2xl p-6 sm:p-7 mb-12">
          <h2 className="font-mono text-xs font-bold uppercase tracking-widest text-accent mb-3">
            Summary of Publisher Status & Legal Shield
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-serif leading-relaxed text-ink/85 dark:text-dark-ink/85">
            <div className="border-l-2 border-accent pl-3">
              <strong className="block font-sans font-semibold text-ink dark:text-dark-ink mb-0.5">
                Personal Hobbyist Publisher
              </strong>
              Singh Monster is a non-commercial, individual research blog and commentary journal authored solely by
              Dhananjay Singh. It is not a commercial media corporation.
            </div>
            <div className="border-l-2 border-accent pl-3">
              <strong className="block font-sans font-semibold text-ink dark:text-dark-ink mb-0.5">
                Freedom of Expression
              </strong>
              All dispatches are protected under Article 19(1)(a) of the Constitution of India and international free
              speech charters as fair comment on public affairs.
            </div>
            <div className="border-l-2 border-accent pl-3">
              <strong className="block font-sans font-semibold text-ink dark:text-dark-ink mb-0.5">
                Fair Dealing Doctrine
              </strong>
              Third-party quotes, document excerpts, and citations are utilized strictly under Section 52 of the Indian
              Copyright Act and 17 U.S.C. § 107 (Fair Use).
            </div>
            <div className="border-l-2 border-accent pl-3">
              <strong className="block font-sans font-semibold text-ink dark:text-dark-ink mb-0.5">
                Grievance & Takedown Protocol
              </strong>
              Direct contact mechanism with a 36-hour review commitment for corrections or takedowns without litigation.
            </div>
          </div>
        </div>

        {/* Legal Clauses */}
        <div className="space-y-10 font-serif text-sm sm:text-base leading-relaxed text-ink/90 dark:text-dark-ink/90">
          {/* Section 1 */}
          <section className="border-b border-rule dark:border-dark-rule pb-8">
            <h3 className="font-serif font-bold text-xl sm:text-2xl text-ink dark:text-dark-ink mb-3">
              1. Preamble & Nature of the Publication
            </h3>
            <p className="mb-3">
              The website <strong className="font-sans">Singh Monster</strong> (accessible at this domain) is an
              independent, non-commercial, personal commentary blog and research folio established, maintained, and
              curated individually by <strong className="font-sans">Dhananjay Singh</strong> (&ldquo;Publisher&rdquo;,
              &ldquo;Author&rdquo;).
            </p>
            <p>
              Singh Monster does not operate as a registered corporate news syndicate, broadcasting enterprise, or
              commercial conglomerate. All written dispatches, investigative narratives, opinion essays, and technical
              analyses are prepared solely by Dhananjay Singh as an exercise of personal inquiry, scholastic exploration,
              and public interest commentary.
            </p>
          </section>

          {/* Section 2 */}
          <section className="border-b border-rule dark:border-dark-rule pb-8">
            <h3 className="font-serif font-bold text-xl sm:text-2xl text-ink dark:text-dark-ink mb-3">
              2. Constitutional Protections & Freedom of Expression
            </h3>
            <p className="mb-3">
              All editorial content, reports, investigative commentaries, and analyses published on Singh Monster are
              exercised in accordance with the fundamental right to freedom of speech and expression guaranteed under{' '}
              <strong className="font-sans">Article 19(1)(a) of the Constitution of India</strong>, subject only to
              reasonable restrictions enumerated under Article 19(2), as well as Article 19 of the Universal Declaration
              of Human Rights (UDHR).
            </p>
            <p>
              Articles reflecting upon governmental policy, corporate actions, regulatory determinations, and public
              figures constitute bona fide fair comment and public interest criticism. They are published without malice,
              extortionate intent, or collusive bias.
            </p>
          </section>

          {/* Section 3 */}
          <section className="border-b border-rule dark:border-dark-rule pb-8">
            <h3 className="font-serif font-bold text-xl sm:text-2xl text-ink dark:text-dark-ink mb-3">
              3. Copyright & Fair Dealing Disclaimers (Section 52, Indian Copyright Act)
            </h3>
            <p className="mb-3">
              In accordance with <strong className="font-sans">Section 52(1)(a)(i)</strong> and{' '}
              <strong className="font-sans">Section 52(1)(b) of the Copyright Act, 1957 (India)</strong>, and Section
              107 of the United States Copyright Act (17 U.S.C. § 107), this publication makes fair dealing use of
              excerpts, excerpts of regulatory filings, judicial dockets, public transcripts, statistical tables, and
              photographic references strictly for the purposes of:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2 text-ink/80 dark:text-dark-ink/80 mb-3 text-sm">
              <li>Private research, scholarship, and educational critique</li>
              <li>Criticism or review of the underlying subject matter</li>
              <li>Reporting of current events and current public affairs</li>
            </ul>
            <p>
              All trademarks, product names, logos, and registered intellectual property cited on this website belong to
              their respective owners. Their identification here is purely nominative and does not imply sponsorship,
              endorsement, or affiliation.
            </p>
          </section>

          {/* Section 4 */}
          <section className="border-b border-rule dark:border-dark-rule pb-8">
            <h3 className="font-serif font-bold text-xl sm:text-2xl text-ink dark:text-dark-ink mb-3">
              4. Safe Harbor Protection (Section 79, Information Technology Act, 2000)
            </h3>
            <p className="mb-3">
              To the extent that Singh Monster hosts interactive user reactions, bookmarks, commentary interfaces,
              syndicated public market indices (e.g., NSE/BSE stock ticker data relays), or links to external third-party
              destinations, the Publisher operates as an intermediary under{' '}
              <strong className="font-sans">Section 79 of the Information Technology Act, 2000</strong> and the
              Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021.
            </p>
            <p>
              The Publisher does not initiate the transmission, select the receiver of third-party transmissions, or
              modify third-party information. External hyperlinks are provided solely for user convenience; the Publisher
              assumes no liability for the content, security, or practices of third-party websites.
            </p>
          </section>

          {/* Section 5 */}
          <section className="border-b border-rule dark:border-dark-rule pb-8">
            <h3 className="font-serif font-bold text-xl sm:text-2xl text-ink dark:text-dark-ink mb-3">
              5. No Professional, Financial, Legal, or Medical Advice
            </h3>
            <p className="mb-3">
              All content published on Singh Monster is provided solely for educational, investigative, and informational
              purposes. Nothing published herein constitutes:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2 text-ink/80 dark:text-dark-ink/80 mb-3 text-sm">
              <li>Financial, investment, equity trading, or wealth management advice</li>
              <li>Legal counsel, judicial advisory, or formal legal representation</li>
              <li>Medical, pharmacological, or healthcare diagnostic guidance</li>
            </ul>
            <p>
              Readers are strictly advised to consult qualified, licensed professionals before executing any financial
              investments, commercial transactions, or legal actions based on content discovered on this platform.
            </p>
          </section>

          {/* Section 6 */}
          <section className="border-b border-rule dark:border-dark-rule pb-8">
            <h3 className="font-serif font-bold text-xl sm:text-2xl text-ink dark:text-dark-ink mb-3">
              6. Grievance Redressal & Takedown Mechanism
            </h3>
            <p className="mb-3">
              In full compliance with Rule 3 of the Information Technology (Intermediary Guidelines and Digital Media
              Ethics Code) Rules, 2021, and international DMCA notice standards, Singh Monster maintains an immediate,
              direct dispute redressal mechanism.
            </p>
            <div className="bg-paper-subtle dark:bg-dark-subtle border border-rule dark:border-dark-rule rounded-xl p-5 mb-4 text-xs font-mono">
              <p className="font-bold text-ink dark:text-dark-ink mb-2">DESIGNATED GRIEVANCE OFFICER:</p>
              <p>Name: Dhananjay Singh</p>
              <p>Title: Publisher & Grievance Officer</p>
              <p>Email: <a href="mailto:legal@singhmonster.com" className="text-accent underline">legal@singhmonster.com</a></p>
              <p>Direct Editorial Inquiries: <a href="mailto:editorial@singhmonster.com" className="text-accent underline">editorial@singhmonster.com</a></p>
              <p className="mt-2 text-ink-mute dark:text-dark-mute">
                Format Subject: [LEGAL GRIEVANCE / NOTICE / CORRECTION REQUEST]
              </p>
            </div>
            <p>
              Any copyright proprietor, corporate entity, or individual with a legitimate objection, allegation of factual
              error, or intellectual property dispute is encouraged to transmit notice to the above address. The Publisher
              commits in good faith to review and respond to valid notices within thirty-six (36) hours, executing remedial
              measures—including corrections, updates, or complete takedowns—without requiring recourse to litigation.
            </p>
          </section>

          {/* Section 7 */}
          <section className="border-b border-rule dark:border-dark-rule pb-8">
            <h3 className="font-serif font-bold text-xl sm:text-2xl text-ink dark:text-dark-ink mb-3">
              7. Absolute Limitation of Liability
            </h3>
            <p>
              To the fullest extent permissible under applicable law, in no event shall Dhananjay Singh, Singh Monster,
              or any contributors be liable to any reader, entity, or third party for any direct, indirect, incidental,
              consequential, special, or punitive damages—including without limitation loss of profits, data corruption,
              business interruption, or reputational claims—arising out of or in connection with the access, reading,
              reliance, or use of any articles, datasets, or media hosted on this website.
            </p>
          </section>

          {/* Section 8 */}
          <section className="pb-4">
            <h3 className="font-serif font-bold text-xl sm:text-2xl text-ink dark:text-dark-ink mb-3">
              8. Privacy, Cookies, LocalStorage & Advertising Disclosures
            </h3>
            <p className="mb-3">
              Singh Monster respects your privacy and operates on minimal data collection principles:
            </p>
            <ul className="list-disc list-inside space-y-2 pl-2 text-ink/80 dark:text-dark-ink/80 text-sm">
              <li>
                <strong className="font-sans text-ink dark:text-dark-ink">Browser LocalStorage:</strong> We store your
                theme selection (<code className="font-mono text-xs">dark</code> / <code className="font-mono text-xs">light</code>)
                and article bookmark IDs locally on your device. This data never leaves your browser and can be cleared
                at any time via your browser settings.
              </li>
              <li>
                <strong className="font-sans text-ink dark:text-dark-ink">Anonymous Telemetry:</strong> We collect
                anonymized, non-personally identifiable telemetry (e.g. page paths, viewport sizes, referrer categories)
                solely to optimize server infrastructure and reading ergonomics. No personal identity or IP addresses are sold
                or shared.
              </li>
              <li>
                <strong className="font-sans text-ink dark:text-dark-ink">Advertising & Google AdSense:</strong> The
                website reserves slots for third-party advertisements (such as Google AdSense). Third-party vendors use
                cookies to serve ads based on prior visits to this or other websites. Users may opt out of personalized
                advertising by visiting Google&apos;s Ads Settings (www.aboutads.info).
              </li>
            </ul>
          </section>
        </div>

        {/* Back Button */}
        <div className="mt-12 pt-6 border-t border-rule dark:border-dark-rule flex items-center justify-between font-mono text-xs">
          <Link href="/" className="text-accent hover:underline flex items-center gap-1.5">
            ← Return to Broadsheet Front Page
          </Link>
          <Link href="/about" className="text-ink-mute dark:text-dark-mute hover:text-accent transition">
            Learn more About Us →
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  )
}
