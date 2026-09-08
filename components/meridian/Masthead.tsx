'use client'

import { useState, useEffect } from 'react'
import NavigationDrawer from './NavigationDrawer'
import BookmarkPanel from './BookmarkPanel'
import ThemeToggle from './ThemeToggle'

interface MastheadProps {
  brandName?: string
  tagline?: string
}

export default function Masthead({
  brandName = 'Singh Monster',
  tagline = 'Sharp reporting. Deep analysis. No agenda but the truth.',
}: MastheadProps) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [currentDate, setCurrentDate] = useState('Sunday, 6 September 2026')

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const dateOptions: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }
      const timeStr = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      })
      setCurrentDate(`${now.toLocaleDateString('en-US', dateOptions)} • ${timeStr}`)
    }
    updateTime()
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <>
      {/* 1. Mobile Apple-Style App Bar */}
      <header className="md:hidden sticky top-0 z-40 bg-paper/92 dark:bg-[#0c0c0e]/92 backdrop-blur-xl border-b border-rule/60 dark:border-white/10 px-4 h-14 flex items-center justify-between select-none">
        <a href="/" className="flex items-center gap-2.5 no-underline">
          <img
            src="/logo.png"
            alt={brandName}
            className="w-7 h-7 object-contain dark:invert shrink-0"
          />
          <span className="font-serif font-black text-lg tracking-tight uppercase text-ink dark:text-dark-ink leading-none">
            {brandName}
          </span>
        </a>

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
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6">
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

              <span className="tracking-wide" suppressHydrationWarning>
                {currentDate || 'Sunday, 6 September 2026'}
              </span>
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

              <ThemeToggle />

              <button
                type="button"
                disabled
                className="hidden sm:inline-block tracking-wide text-ink-mute/50 dark:text-dark-mute/50 font-medium cursor-not-allowed select-none"
                title="Sign in is currently disabled"
              >
                Sign in
              </button>

              <button
                type="button"
                disabled
                className="bg-accent/40 text-white/70 px-3 sm:px-3.5 py-1.5 font-bold uppercase tracking-wider text-[10px] sm:text-[11px] shadow-xs cursor-not-allowed opacity-60 select-none"
                title="Subscriptions are currently disabled"
              >
                Subscribe
              </button>
            </div>
          </div>

          {/* Central Newspaper Wordmark */}
          <div className="py-6 sm:py-8 text-center">
            <a
              href="/"
              className="group inline-flex flex-col items-center justify-center text-ink dark:text-dark-ink no-underline"
            >
              {/* Centered Lion Crest Logo */}
              <div className="relative mb-2 sm:mb-3.5 flex items-center justify-center">
                <span className="hidden sm:inline-block w-12 md:w-24 h-px bg-ink dark:bg-dark-ink opacity-30 group-hover:opacity-70 transition mr-4" />
                <img
                  src="/logo.png"
                  alt="Singh Monster"
                  className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 object-contain dark:invert transition-transform duration-300 group-hover:scale-105 shrink-0 drop-shadow-xs"
                />
                <span className="hidden sm:inline-block w-12 md:w-24 h-px bg-ink dark:bg-dark-ink opacity-30 group-hover:opacity-70 transition ml-4" />
              </div>

              {/* Title Wordmark with Flourishes */}
              <div className="inline-flex items-center justify-center gap-4 sm:gap-6">
                <span className="hidden lg:inline-block w-10 sm:w-16 h-px bg-ink dark:bg-dark-ink opacity-40 group-hover:opacity-80 transition" />
                <h1 className="font-serif font-black text-3xl sm:text-5xl md:text-6xl lg:text-7xl uppercase tracking-[0.02em] leading-none transition group-hover:text-accent dark:group-hover:text-dark-accent">
                  {brandName}
                </h1>
                <span className="hidden lg:inline-block w-10 sm:w-16 h-px bg-ink dark:bg-dark-ink opacity-40 group-hover:opacity-80 transition" />
              </div>
            </a>

            <p className="font-serif italic text-xs sm:text-[14px] text-ink-mute dark:text-dark-mute mt-2.5 tracking-wide font-normal">
              {tagline}
            </p>
          </div>

          {/* Double Rule & Category Navigation */}
          <div className="border-t-2 border-b border-ink dark:border-dark-ink py-2.5 my-1">
            <nav
              className="flex items-center justify-center gap-5 sm:gap-7 md:gap-8 overflow-x-auto text-[11.5px] sm:text-[12.5px] font-sans font-semibold tracking-wider uppercase whitespace-nowrap scrollbar-none"
              aria-label="Sections"
            >
              <a href="/section/us" className="text-ink dark:text-dark-ink hover:text-accent dark:hover:text-dark-accent transition">
                U.S
              </a>
              <a href="/section/world" className="text-ink dark:text-dark-ink hover:text-accent dark:hover:text-dark-accent transition">
                World
              </a>
              <a href="/section/politics" className="text-ink dark:text-dark-ink hover:text-accent dark:hover:text-dark-accent transition">
                Politics
              </a>
              <a href="/section/business" className="text-ink dark:text-dark-ink hover:text-accent dark:hover:text-dark-accent transition">
                Business
              </a>
              <a href="/section/technology" className="text-ink dark:text-dark-ink hover:text-accent dark:hover:text-dark-accent transition">
                Technology
              </a>
              <a href="/section/sports" className="text-ink dark:text-dark-ink hover:text-accent dark:hover:text-dark-accent transition">
                Sports
              </a>
              <a href="/section/opinion" className="text-ink dark:text-dark-ink hover:text-accent dark:hover:text-dark-accent transition">
                Opinion
              </a>
              <a href="/section/video" className="text-ink dark:text-dark-ink hover:text-accent dark:hover:text-dark-accent transition">
                Video
              </a>
              <a href="/about" className="text-ink dark:text-dark-ink hover:text-accent dark:hover:text-dark-accent transition">
                About Us
              </a>
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
