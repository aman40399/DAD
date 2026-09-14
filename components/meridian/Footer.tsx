'use client'

import Link from 'next/link'

interface FooterProps {
  brandName?: string
}

export default function Footer({ brandName = 'Singh Monster' }: FooterProps) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer data-nosnippet className="w-full bg-paper-subtle dark:bg-dark-subtle border-t-2 border-ink dark:border-dark-ink mt-12 pt-12 pb-24 md:pb-12 font-sans transition-colors select-none">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6">
        {/* Top Footer: Brand & Back to Top */}
        <div className="flex flex-col sm:flex-row items-center justify-between pb-8 border-b border-rule dark:border-dark-rule gap-4">
          <div className="flex items-center gap-3.5 text-center sm:text-left">
            <img
              src="/logo.png"
              alt="Singh Monster"
              className="w-16 h-16 sm:w-20 sm:h-20 object-contain shrink-0"
            />
            <div>
              <span className="font-serif font-black text-2xl sm:text-3xl uppercase tracking-wider text-ink dark:text-dark-ink">
                {brandName}
              </span>
              <p className="font-serif italic text-xs text-ink-mute dark:text-dark-mute mt-0.5">
                Sharp reporting. Deep analysis. No agenda but the truth.
              </p>
            </div>
          </div>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ink-mute dark:text-dark-mute hover:text-accent dark:hover:text-dark-accent transition cursor-pointer"
          >
            <span>Back to top</span>
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 19V5M5 12l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Middle Footer: Categorized Links */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-8 py-8 text-xs text-ink-mute dark:text-dark-mute">
          <div>
            <h4 className="font-bold tracking-widest uppercase text-ink dark:text-dark-ink mb-3 text-[11px]">
              News Beats
            </h4>
            <ul className="space-y-2">
              <li><Link href="/section/world" prefetch={true} className="hover:text-accent dark:hover:text-dark-accent transition">World</Link></li>
              <li><Link href="/section/india" prefetch={true} className="hover:text-accent dark:hover:text-dark-accent transition">India</Link></li>
              <li><Link href="/section/economy" prefetch={true} className="hover:text-accent dark:hover:text-dark-accent transition">Economy & Markets</Link></li>
              <li><Link href="/section/technology" prefetch={true} className="hover:text-accent dark:hover:text-dark-accent transition">Technology</Link></li>
              <li><Link href="/section/environment" prefetch={true} className="hover:text-accent dark:hover:text-dark-accent transition">Environment</Link></li>
              <li><Link href="/section/health" prefetch={true} className="hover:text-accent dark:hover:text-dark-accent transition">Health</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold tracking-widest uppercase text-ink dark:text-dark-ink mb-3 text-[11px]">
              Opinion
            </h4>
            <ul className="space-y-2">
              <li><Link href="/section/columnists" prefetch={true} className="hover:text-accent dark:hover:text-dark-accent transition">Columnists</Link></li>
              <li><Link href="/section/editorials" prefetch={true} className="hover:text-accent dark:hover:text-dark-accent transition">Editorials</Link></li>
              <li><Link href="/section/guest-essays" prefetch={true} className="hover:text-accent dark:hover:text-dark-accent transition">Guest Essays</Link></li>
              <li><Link href="/section/letters" prefetch={true} className="hover:text-accent dark:hover:text-dark-accent transition">Letters</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold tracking-widest uppercase text-ink dark:text-dark-ink mb-3 text-[11px]">
              Arts & Life
            </h4>
            <ul className="space-y-2">
              <li><Link href="/section/books" prefetch={true} className="hover:text-accent dark:hover:text-dark-accent transition">Books</Link></li>
              <li><Link href="/section/movies" prefetch={true} className="hover:text-accent dark:hover:text-dark-accent transition">Movies</Link></li>
              <li><Link href="/section/music" prefetch={true} className="hover:text-accent dark:hover:text-dark-accent transition">Music</Link></li>
              <li><Link href="/section/food" prefetch={true} className="hover:text-accent dark:hover:text-dark-accent transition">Food & Drink</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold tracking-widest uppercase text-ink dark:text-dark-ink mb-3 text-[11px]">
              Company & Ethics
            </h4>
            <ul className="space-y-2">
              <li><Link href="/about" prefetch={true} className="hover:text-accent dark:hover:text-dark-accent transition">About Us</Link></li>
              <li><Link href="/editorial-guidelines" prefetch={true} className="hover:text-accent dark:hover:text-dark-accent transition">Editorial Guidelines</Link></li>
              <li><Link href="/fact-checking" prefetch={true} className="hover:text-accent dark:hover:text-dark-accent transition">Fact-Checking Policy</Link></li>
              <li><Link href="/corrections" prefetch={true} className="hover:text-accent dark:hover:text-dark-accent transition">Corrections & Retractions</Link></li>
              <li><Link href="/authors" prefetch={true} className="hover:text-accent dark:hover:text-dark-accent transition">Editorial Board</Link></li>
              <li><Link href="/contact" prefetch={true} className="hover:text-accent dark:hover:text-dark-accent transition">Contact & Grievance</Link></li>
            </ul>
          </div>

          <div className="col-span-2 sm:col-span-4 lg:col-span-1">
            <h4 className="font-bold tracking-widest uppercase text-ink dark:text-dark-ink mb-3 text-[11px]">
              Feeds & Syndicate
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="/feed.xml" target="_blank" rel="noopener noreferrer" className="hover:text-accent dark:hover:text-dark-accent transition flex items-center gap-1.5">
                  <svg className="w-3 h-3 text-orange-500 fill-current shrink-0" viewBox="0 0 24 24">
                    <circle cx="6.18" cy="17.82" r="2.18" />
                    <path d="M4 4.44v2.83c7.03 0 12.73 5.7 12.73 12.73h2.83c0-8.59-6.97-15.56-15.56-15.56zm0 5.66v2.83c3.9 0 7.07 3.17 7.07 7.07h2.83c0-5.47-4.43-9.9-9.9-9.9z" />
                  </svg>
                  <span>RSS 2.0 Feed</span>
                </a>
              </li>
              <li><a href="/sitemap.xml" className="hover:text-accent dark:hover:text-dark-accent transition">XML Sitemap</a></li>
              <li><a href="/sitemap-news.xml" className="hover:text-accent dark:hover:text-dark-accent transition">Google News Feed</a></li>
              <li><Link href="/terms" prefetch={true} className="hover:text-accent dark:hover:text-dark-accent transition">Terms of Service</Link></li>
              <li><Link href="/privacy" prefetch={true} className="hover:text-accent dark:hover:text-dark-accent transition">Privacy & Disclaimers</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 border-t border-rule dark:border-dark-rule flex flex-col sm:flex-row items-center justify-between text-[11px] text-ink-mute dark:text-dark-mute gap-4">
          <p>© {new Date().getFullYear()} {brandName}. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 justify-center sm:justify-end">
            <Link href="/about" prefetch={true} className="hover:underline">About</Link>
            <span>·</span>
            <Link href="/editorial-guidelines" prefetch={true} className="hover:underline">Editorial Standards</Link>
            <span>·</span>
            <Link href="/fact-checking" prefetch={true} className="hover:underline">Fact-Check</Link>
            <span>·</span>
            <Link href="/corrections" prefetch={true} className="hover:underline">Corrections</Link>
            <span>·</span>
            <Link href="/contact" prefetch={true} className="hover:underline">Contact & Grievance</Link>
            <span>·</span>
            <Link href="/privacy" prefetch={true} className="hover:underline">Privacy</Link>
            <span>·</span>
            <Link href="/terms" prefetch={true} className="hover:underline">Terms</Link>
            <span>·</span>
            <a href="/feed.xml" className="hover:underline text-orange-500 font-semibold">RSS</a>
            <span>·</span>
            <a href="/sitemap.xml" className="hover:underline">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>

  )
}
