'use client'

import { useState } from 'react'
import Link from 'next/link'
import NavigationDrawer from './NavigationDrawer'
import BookmarkPanel from './BookmarkPanel'
import ThemeToggle from './ThemeToggle'
import LiveClock from './LiveClock'

interface MastheadProps {
  brandName?: string
  tagline?: string
}

export default function Masthead({
  brandName = 'Singh Monster',
  tagline = 'Sharp reporting. Deep analysis. No agenda but the truth.',
}: MastheadProps) {
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <>
      {/* 1. Mobile Apple-Style App Bar */}
      <header data-nosnippet className="md:hidden sticky top-0 z-40 bg-paper dark:bg-[#0c0c0e] border-b border-rule/70 dark:border-white/10 px-3.5 h-[60px] flex items-center justify-between select-none shadow-xs">
        <Link href="/" prefetch={true} className="flex items-center gap-2.5 no-underline">
          <img
            src="/logo.png"
            alt={brandName}
            width={44}
            height={44}
            className="h-10 sm:h-11 w-auto max-w-[56px] object-contain shrink-0"
          />
          <h1 className="font-serif font-black text-lg tracking-tight uppercase text-ink dark:text-dark-ink leading-none">
            {brandName}
          </h1>
        </Link>


        <div className="flex items-center gap-1.5">
          <button
            type="button"
            className="w-8 h-8 rounded-full flex items-center justify-center text-ink-mute dark:text-dark-mute hover:text-accent dark:hover:text-dark-accent transition cursor-pointer"
            aria-label="Search"
            title="Search"
            onClick={() => setDrawerOpen(true)}
          >
            <svg viewBox="0 0 14 14" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.6">
              <circle cx="6" cy="6" r="4.5" />
              <path d="M9.5 9.5L13 13" strokeLinecap="round" />
            </svg>
          </button>

          <BookmarkPanel />

          <ThemeToggle />

          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="w-9 h-9 rounded-full flex items-center justify-center bg-paper-subtle/80 dark:bg-white/[0.05] border border-rule/60 dark:border-white/10 text-ink dark:text-dark-ink hover:text-accent dark:hover:text-dark-accent transition active:scale-95 cursor-pointer"
            aria-label="Open menu"
            title="Open menu"
          >
            <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <line x1="3" y1="5.5" x2="17" y2="5.5" />
              <line x1="3" y1="10" x2="17" y2="10" />
              <line x1="3" y1="14.5" x2="17" y2="14.5" />
            </svg>
          </button>
        </div>
      </header>

      {/* 2. Desktop Broadsheet Masthead */}
      <header className="hidden md:block w-full bg-paper dark:bg-dark-paper transition-colors select-none" role="banner">
        {/* Top Utility Bar */}
        <div data-nosnippet className="max-w-[1360px] mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between py-2.5 font-sans text-[11px] text-ink-mute dark:text-dark-mute border-b border-rule dark:border-dark-rule">
            {/* Left: Hamburger + Date */}
            <div className="flex items-center gap-2.5 sm:gap-4">
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                className="inline-flex items-center justify-center w-7 h-7 text-ink dark:text-dark-ink hover:text-accent dark:hover:text-dark-accent transition cursor-pointer"
                aria-label="Open menu"
                title="Open menu"
              >
                <svg viewBox="0 0 14 14" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M1 3.5h12M1 7h12M1 10.5h12" strokeLinecap="round" />
                </svg>
              </button>

              <LiveClock />
            </div>

            {/* Right: Search, Bookmarks, Theme Toggle, Auth, Subscribe */}
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                type="button"
                className="inline-flex items-center justify-center w-6 h-6 text-ink-mute dark:text-dark-mute hover:text-accent dark:hover:text-dark-accent transition cursor-pointer"
                aria-label="Search"
                title="Search"
                onClick={() => setDrawerOpen(true)}
              >
                <svg viewBox="0 0 14 14" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="6" cy="6" r="4.5" />
                  <path d="M9.5 9.5L13 13" strokeLinecap="round" />
                </svg>
              </button>

              <BookmarkPanel />

              <a
                href="/feed.xml"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-6 h-6 text-ink-mute dark:text-dark-mute hover:text-orange-500 transition"
                aria-label="RSS Feed"
                title="RSS 2.0 Feed"
              >
                <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor">
                  <circle cx="6.18" cy="17.82" r="2.18" />
                  <path d="M4 4.44v2.83c7.03 0 12.73 5.7 12.73 12.73h2.83c0-8.59-6.97-15.56-15.56-15.56zm0 5.66v2.83c3.9 0 7.07 3.17 7.07 7.07h2.83c0-5.47-4.43-9.9-9.9-9.9z" />
                </svg>
              </a>

              <ThemeToggle />
            </div>
          </div>

          {/* Central Newspaper Wordmark & Brand - Single Inline Row */}
          <div className="py-3.5 sm:py-5 flex flex-col items-center justify-center">
            <Link
              href="/"
              prefetch={true}
              className="group inline-flex items-center justify-center gap-2 sm:gap-2.5 md:gap-3 text-ink dark:text-dark-ink no-underline"
            >
              <img
                src="/logo.png"
                alt="Singh Monster"
                width={112}
                height={112}
                className="h-16 sm:h-20 md:h-24 lg:h-28 w-auto object-contain transition-transform duration-200 group-hover:scale-105 shrink-0 drop-shadow-xs"
              />
              <h1 className="font-serif font-black text-3xl sm:text-4xl md:text-5xl lg:text-[58px] uppercase tracking-[0.03em] leading-none transition group-hover:text-accent dark:group-hover:text-dark-accent">
                {brandName}
              </h1>
            </Link>

            <p className="font-serif italic text-xs sm:text-[13px] text-ink-mute dark:text-dark-mute mt-1.5 tracking-wide font-normal">
              {tagline}
            </p>
          </div>

          {/* Double Rule & Category Navigation */}
          <div data-nosnippet className="border-t-2 border-b border-ink dark:border-dark-ink py-2.5 my-1">
            <nav
              data-nosnippet
              className="flex items-center justify-center gap-5 sm:gap-7 md:gap-8 overflow-x-auto text-[11.5px] sm:text-[12.5px] font-sans font-semibold tracking-wider uppercase whitespace-nowrap scrollbar-none"
              aria-label="Sections"
            >
              <Link href="/section/world" prefetch={true} className="text-ink dark:text-dark-ink hover:text-accent dark:hover:text-dark-accent transition">
                World
              </Link>
              <Link href="/section/india" prefetch={true} className="text-ink dark:text-dark-ink hover:text-accent dark:hover:text-dark-accent transition">
                India
              </Link>
              <Link href="/section/economy" prefetch={true} className="text-ink dark:text-dark-ink hover:text-accent dark:hover:text-dark-accent transition">
                Economy
              </Link>
              <Link href="/section/technology" prefetch={true} className="text-ink dark:text-dark-ink hover:text-accent dark:hover:text-dark-accent transition">
                Technology
              </Link>
              <Link href="/section/politics" prefetch={true} className="text-ink dark:text-dark-ink hover:text-accent dark:hover:text-dark-accent transition">
                Politics
              </Link>
              <Link href="/section/environment" prefetch={true} className="text-ink dark:text-dark-ink hover:text-accent dark:hover:text-dark-accent transition">
                Environment
              </Link>
              <Link href="/section/health" prefetch={true} className="text-ink dark:text-dark-ink hover:text-accent dark:hover:text-dark-accent transition">
                Health
              </Link>
              <Link href="/section/opinion" prefetch={true} className="text-ink dark:text-dark-ink hover:text-accent dark:hover:text-dark-accent transition">
                Opinion
              </Link>
              <Link href="/about" prefetch={true} className="text-ink dark:text-dark-ink hover:text-accent dark:hover:text-dark-accent transition">
                About Us
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Slide-out Menu Drawer */}
      <NavigationDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        brandName={brandName}
      />
    </>
  )
}
