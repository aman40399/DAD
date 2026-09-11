'use client'

import { useState } from 'react'
import Link from 'next/link'

interface PingResponse {
  success: boolean
  timestamp: string
  totalUrlsSubmitted: number
  indexNow: Array<{ engine: string; status: number; ok: boolean; message?: string }>
  sitemaps: Array<{ engine: string; status: number; ok: boolean }>
}

export default function AdminSeoPage() {
  const [pinging, setPinging] = useState(false)
  const [pingResult, setPingResult] = useState<PingResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handlePingAll = async () => {
    setPinging(true)
    setError(null)
    setPingResult(null)

    try {
      const res = await fetch('/api/admin/seo/ping', { method: 'POST' })
      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to ping search engines')
      }
      setPingResult(data)
    } catch (err: any) {
      setError(err?.message || 'Network error pinging search engines')
    } finally {
      setPinging(false)
    }
  }

  const sitemaps = [
    {
      title: 'Standard XML Sitemap',
      path: '/sitemap.xml',
      description: 'Contains all static pages, editorial hubs, and published news stories for Google and Bing search indexation.',
      badge: 'Core Sitemaps',
    },
    {
      title: 'Google News XML Sitemap',
      path: '/sitemap-news.xml',
      description: 'Strict Google News schema with dynamic ISO language detection (Hindi & English) for Google News and Google Discover inclusion.',
      badge: 'Google News',
    },
    {
      title: 'RSS 2.0 Syndication Feed',
      path: '/feed.xml',
      description: 'Full-text RSS feed with Media enclosures, RFC-822 dates, and Dublin Core metadata for real-time newsreader ingestion.',
      badge: 'RSS 2.0',
    },
    {
      title: 'Robots Directive',
      path: '/robots.txt',
      description: 'Allows legitimate search bots (Googlebot, Bingbot, Applebot) while protecting administrative and search query endpoints.',
      badge: 'Directives',
    },
    {
      title: 'IndexNow Key Verification',
      path: '/c7f5399d8b314959a9041a996efefd39.txt',
      description: 'Cryptographic authentication key for instant automated indexing by Microsoft Bing, Yandex, and Cloudflare.',
      badge: 'IndexNow Key',
    },
  ]

  const diagnosticTools = [
    {
      name: 'Google Search Console',
      url: 'https://search.google.com/search-console',
      action: 'Submit Sitemaps & Inspect URLs',
      instructions: 'Submit https://www.singh.monster/sitemap.xml and https://www.singh.monster/sitemap-news.xml under Sitemaps.',
    },
    {
      name: 'Bing Webmaster Tools',
      url: 'https://www.bing.com/webmasters',
      action: 'Submit Sitemaps & View IndexNow',
      instructions: 'Enable IndexNow and submit sitemap.xml. Bing crawls within minutes of publication.',
    },
    {
      name: 'Google Rich Results Test',
      url: 'https://search.google.com/test/rich-results?url=https%3A%2F%2Fwww.singh.monster',
      action: 'Validate NewsArticle & Schema',
      instructions: 'Test your live URLs to ensure NewsArticle, BreadcrumbList, and Organization schemas pass with 0 errors.',
    },
    {
      name: 'Schema.org Validator',
      url: 'https://validator.schema.org/#url=https%3A%2F%2Fwww.singh.monster',
      action: 'Audit Structured Data',
      instructions: 'Verify NewsMediaOrganization, ProfilePage, and CollectionPage schema graph integrity.',
    },
    {
      name: 'Google Publisher Center',
      url: 'https://publishercenter.google.com/',
      action: 'Google News Publication Setup',
      instructions: 'Add Singh Monster, submit your publication details, and paste https://www.singh.monster/feed.xml as the content feed.',
    },
  ]

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8 max-w-6xl mx-auto font-sans">
      {/* Page Title */}
      <div className="border-b border-black/[0.06] dark:border-white/[0.08] pb-5 flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-[#0071e3] font-bold">
            Search Engine Optimization & Instant Indexation
          </span>
          <h1 className="font-serif font-black text-2xl sm:text-3xl text-ink dark:text-dark-ink mt-1 tracking-tight">
            SEO & Search Engine Indexing
          </h1>
          <p className="font-serif italic text-xs sm:text-sm text-ink-mute dark:text-dark-mute mt-1">
            Real-time feed monitoring, IndexNow instant syndication, and search crawler management for Singh Monster.
          </p>
        </div>

        <button
          onClick={handlePingAll}
          disabled={pinging}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#0071e3] text-white font-sans text-xs font-semibold hover:bg-[#0077ed] disabled:opacity-50 transition shadow-xs shrink-0 cursor-pointer active:scale-95"
        >
          {pinging ? (
            <>
              <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <span>Broadcasting URLs...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
              <span>Ping All Engines & IndexNow</span>
            </>
          )}
        </button>
      </div>

      {/* Ping Results Notification Box */}
      {pingResult && (
        <div className="backdrop-blur-xl bg-emerald-500/10 border border-emerald-500/25 rounded-3xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-emerald-700 dark:text-emerald-400 text-base flex items-center gap-2">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Instant Indexation Broadcast Dispatched</span>
            </h3>
            <span className="font-mono text-xs text-emerald-700 dark:text-emerald-400 font-bold px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
              {pingResult.totalUrlsSubmitted} URLs Dispatched
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs font-mono">
            {pingResult.indexNow.map((inRes, idx) => (
              <div key={idx} className="p-3 bg-white/70 dark:bg-white/[0.04] rounded-2xl border border-emerald-500/20 shadow-xs">
                <div className="text-ink-mute dark:text-dark-mute text-[10px] uppercase">{inRes.engine}</div>
                <div className="font-bold text-ink dark:text-dark-ink mt-0.5 flex items-center justify-between">
                  <span>{inRes.message || (inRes.ok ? 'Success' : 'Failed')}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] ${inRes.ok ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/20 text-red-600'}`}>
                    HTTP {inRes.status}
                  </span>
                </div>
              </div>
            ))}

            {pingResult.sitemaps.map((smRes, idx) => (
              <div key={idx} className="p-3 bg-white/70 dark:bg-white/[0.04] rounded-2xl border border-emerald-500/20 shadow-xs">
                <div className="text-ink-mute dark:text-dark-mute text-[10px] uppercase">{smRes.engine}</div>
                <div className="font-bold text-ink dark:text-dark-ink mt-0.5 flex items-center justify-between">
                  <span>{smRes.ok ? 'Notified' : 'Unreachable'}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] ${smRes.ok ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/20 text-amber-600'}`}>
                    HTTP {smRes.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="backdrop-blur-xl bg-red-500/10 border border-red-500/25 rounded-3xl p-5 text-xs font-mono text-red-600 dark:text-red-400">
          Error broadcasting to search engines: {error}
        </div>
      )}

      {/* Live Sitemaps & Feeds Cards */}
      <div className="space-y-4">
        <h2 className="font-serif font-black text-xl text-ink dark:text-dark-ink tracking-tight">
          Active Live Sitemaps & Crawl Feeds
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sitemaps.map((item) => (
            <div
              key={item.path}
              className="backdrop-blur-xl bg-white/70 dark:bg-[#1c1c1e]/75 border border-black/[0.06] dark:border-white/[0.08] rounded-3xl p-5 flex flex-col justify-between hover:border-[#0071e3]/40 transition shadow-[0_4px_24px_rgba(0,0,0,0.02)]"
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#0071e3] px-2.5 py-0.5 rounded-full bg-[#0071e3]/10 border border-[#0071e3]/20">
                    {item.badge}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-medium">Live</span>
                  </div>
                </div>
                <h3 className="font-serif font-bold text-base text-ink dark:text-dark-ink mb-1.5 tracking-tight">
                  {item.title}
                </h3>
                <p className="font-serif text-xs text-ink-mute dark:text-dark-mute leading-relaxed mb-4">
                  {item.description}
                </p>
              </div>

              <div className="border-t border-black/[0.05] dark:border-white/[0.08] pt-3 flex items-center justify-between">
                <code className="font-mono text-[11px] text-ink/80 dark:text-dark-ink/80 bg-black/[0.03] dark:bg-white/[0.05] px-2 py-0.5 rounded-md">
                  {item.path}
                </code>
                <a
                  href={item.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-[11px] text-[#0071e3] hover:underline font-semibold"
                >
                  Inspect &rarr;
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Official Search Console & Verification Directory */}
      <div className="space-y-4">
        <h2 className="font-serif font-black text-xl text-ink dark:text-dark-ink tracking-tight">
          Search Console & Schema Diagnostics
        </h2>
        <div className="backdrop-blur-xl bg-white/70 dark:bg-[#1c1c1e]/75 border border-black/[0.06] dark:border-white/[0.08] rounded-3xl divide-y divide-black/[0.05] dark:divide-white/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.02)] overflow-hidden">
          {diagnosticTools.map((tool) => (
            <div key={tool.name} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-serif font-bold text-base text-ink dark:text-dark-ink">
                    {tool.name}
                  </h3>
                  <span className="font-mono text-[10px] uppercase text-ink-mute dark:text-dark-mute px-2 py-0.5 rounded-full bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.06] dark:border-white/10">
                    {tool.action}
                  </span>
                </div>
                <p className="font-serif text-xs text-ink-mute dark:text-dark-mute max-w-2xl leading-relaxed">
                  {tool.instructions}
                </p>
              </div>

              <a
                href={tool.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-black/[0.08] dark:border-white/10 hover:border-[#0071e3] font-mono text-xs text-ink dark:text-dark-ink hover:text-[#0071e3] font-semibold transition shrink-0 self-start sm:self-center bg-white/80 dark:bg-white/[0.04] active:scale-95 shadow-xs"
              >
                <span>Launch Tool</span>
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Actionable Playbook to Rank #1 */}
      <div className="backdrop-blur-xl bg-white/70 dark:bg-[#1c1c1e]/75 border border-black/[0.06] dark:border-white/[0.08] rounded-3xl p-6 sm:p-8 space-y-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
        <div>
          <span className="font-mono text-[11px] uppercase tracking-widest text-[#0071e3] font-bold">
            Editorial Playbook
          </span>
          <h2 className="font-serif font-black text-2xl text-ink dark:text-dark-ink mt-1 tracking-tight">
            How to Rank #1 on Google News & Search
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-serif leading-relaxed text-ink/90 dark:text-dark-ink/90">
          <div className="space-y-2 border-l-2 border-[#0071e3] pl-4">
            <h4 className="font-sans font-bold text-ink dark:text-dark-ink text-sm">
              1. Submit Both Sitemaps to Google Search Console
            </h4>
            <p>
              Log in to Google Search Console for <strong className="text-[#0071e3]">https://www.singh.monster</strong>. In the left menu under <em>Sitemaps</em>, enter both <code className="font-mono bg-black/[0.04] px-1 py-0.5 rounded">sitemap.xml</code> and <code className="font-mono bg-black/[0.04] px-1 py-0.5 rounded">sitemap-news.xml</code>. Googlebot will immediately index your site structure and fresh stories.
            </p>
          </div>

          <div className="space-y-2 border-l-2 border-[#0071e3] pl-4">
            <h4 className="font-sans font-bold text-ink dark:text-dark-ink text-sm">
              2. Add RSS Feed to Google Publisher Center
            </h4>
            <p>
              Open <a href="https://publishercenter.google.com/" target="_blank" rel="noopener noreferrer" className="text-[#0071e3] underline font-semibold">Google Publisher Center</a>, add your publication <em>Singh Monster</em>, and under Content Sections, paste <code className="font-mono bg-black/[0.04] px-1 py-0.5 rounded">https://www.singh.monster/feed.xml</code>. This qualifies you for Google News badges and Google Discover recommendation cards.
            </p>
          </div>

          <div className="space-y-2 border-l-2 border-[#0071e3] pl-4">
            <h4 className="font-sans font-bold text-ink dark:text-dark-ink text-sm">
              3. Automatic Instant Indexing with IndexNow
            </h4>
            <p>
              Every time you publish or update an article via the Admin panel, the system automatically dispatches an instant IndexNow payload to Microsoft Bing, Yandex, and Cloudflare. Bing indexes your stories within minutes.
            </p>
          </div>

          <div className="space-y-2 border-l-2 border-[#0071e3] pl-4">
            <h4 className="font-sans font-bold text-ink dark:text-dark-ink text-sm">
              4. Complete E-E-A-T Author & Policy Trust Signals
            </h4>
            <p>
              Google rewards authentic journalism. Your site now features comprehensive public transparency pages: <Link href="/about" className="text-[#0071e3] underline font-medium">About Us</Link>, <Link href="/editorial-guidelines" className="text-[#0071e3] underline font-medium">Editorial Guidelines</Link>, <Link href="/fact-checking" className="text-[#0071e3] underline font-medium">Fact-Checking Policy</Link>, <Link href="/corrections" className="text-[#0071e3] underline font-medium">Corrections</Link>, <Link href="/contact" className="text-[#0071e3] underline font-medium">Grievance Desk</Link>, and <Link href="/author/dhananjay-singh" className="text-[#0071e3] underline font-medium">Author Profiles</Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
