'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Article } from '@/types'

interface NavigationDrawerProps {
  isOpen: boolean
  onClose: () => void
  brandName?: string
}

export default function NavigationDrawer({
  isOpen,
  onClose,
  brandName = 'Singh Monster',
}: NavigationDrawerProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<Article[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    } else {
      setSearchTerm('')
      setSearchResults([])
    }
  }, [isOpen])

  // Live searching as user types (debounced 180ms)
  useEffect(() => {
    const term = searchTerm.trim()
    if (!term) {
      setSearchResults([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/articles?search=${encodeURIComponent(term)}&limit=8`)
        if (res.ok) {
          const data = await res.json()
          setSearchResults(data.articles || [])
        } else {
          setSearchResults([])
        }
      } catch (err) {
        setSearchResults([])
      } finally {
        setIsLoading(false)
      }
    }, 180)

    return () => clearTimeout(timeout)
  }, [searchTerm])

  // Keyboard navigation (Escape to close)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`)
      onClose()
    }
  }

  const clearSearch = () => {
    setSearchTerm('')
    setSearchResults([])
    inputRef.current?.focus()
  }

  if (!isOpen) return null

  const isSearching = searchTerm.trim().length > 0

  return (
    <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/65 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-out Drawer Panel (Full Screen on Mobile) */}
      <div className="relative w-full max-w-full sm:w-[85vw] sm:max-w-[360px] bg-paper dark:bg-[#0e0e11] border-r-0 sm:border-r border-rule/70 dark:border-white/10 flex flex-col h-full z-10 shadow-2xl transition-transform duration-300">
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-rule/70 dark:border-white/10 bg-paper-subtle/50 dark:bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <img
              src="/logo.png"
              alt="Singh Monster"
              className="w-7 h-7 object-contain shrink-0"
            />
            <span className="font-serif font-black text-lg tracking-tight uppercase text-ink dark:text-dark-ink">
              {brandName}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-paper-subtle dark:bg-white/[0.06] border border-rule/60 dark:border-white/10 text-ink-mute hover:text-ink dark:hover:text-white transition active:scale-95 cursor-pointer"
            aria-label="Close menu"
          >
            <svg width="13" height="13" viewBox="0 0 14 14" stroke="currentColor" strokeWidth="1.8" fill="none">
              <path d="M1 1l12 12M13 1L1 13" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Live Search Input Bar */}
        <div className="px-5 py-3 border-b border-rule/70 dark:border-white/10 bg-paper dark:bg-[#0e0e11]">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search dispatches, topics, authors…"
              className="w-full pl-9 pr-8 py-2 bg-paper-subtle/80 dark:bg-white/[0.05] border border-rule/70 dark:border-white/10 text-xs font-sans text-ink dark:text-dark-ink placeholder:text-ink-mute rounded-full focus:outline-none focus:border-accent transition-colors shadow-xs"
            />
            {/* Search Icon / Spinner */}
            <div className="absolute left-3 top-2.5 text-ink-mute">
              {isLoading ? (
                <svg className="w-3.5 h-3.5 animate-spin text-accent" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              )}
            </div>
            {/* Clear Button */}
            {searchTerm && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-2.5 text-ink-mute hover:text-ink dark:hover:text-dark-ink p-1 text-xs"
                title="Clear search"
              >
                ✕
              </button>
            )}
          </form>
        </div>

        {/* Content Area: Live Search Results vs Navigation Categories */}
        <div className="flex-1 overflow-y-auto apple-scrollbar">
          {isSearching ? (
            /* Live Instant Search Results Feed */
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between px-2 pb-1 border-b border-rule/50 dark:border-dark-rule/50 text-[10.5px] font-mono text-ink-mute dark:text-dark-mute uppercase tracking-wider">
                <span>
                  {isLoading ? 'Searching dispatches…' : `${searchResults.length} Dispatches Found`}
                </span>
                <span>Live Feed</span>
              </div>

              {searchResults.length === 0 && !isLoading ? (
                <div className="py-12 px-4 text-center">
                  <p className="font-serif italic text-sm text-ink-mute dark:text-dark-mute">
                    No dispatches matching &ldquo;{searchTerm}&rdquo;
                  </p>
                  <p className="text-[11px] font-sans text-ink-mute/70 mt-1">
                    Try searching for world, economy, ukraine, volcano, or tech.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {searchResults.map((article) => {
                    const img = article.image_url || article.imageUrl
                    return (
                      <Link
                        key={article.id}
                        href={`/article/${article.slug}`}
                        onClick={onClose}
                        className="flex items-start gap-3 p-2.5 rounded-xs hover:bg-paper-subtle dark:hover:bg-dark-subtle transition border border-transparent hover:border-rule/60 dark:hover:border-dark-rule/60 group"
                      >
                        {img && (
                          <div className="w-14 h-14 rounded-xs overflow-hidden shrink-0 border border-rule/80 dark:border-dark-rule/80 bg-paper-subtle">
                            <img
                              src={img}
                              alt=""
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-accent">
                              {article.category}
                            </span>
                            {article.is_breaking && (
                              <span className="px-1 py-0.2 bg-rose-600 text-white text-[8px] font-mono font-bold uppercase tracking-wider rounded-xs">
                                Breaking
                              </span>
                            )}
                          </div>
                          <h4 className="font-serif font-bold text-xs leading-snug text-ink dark:text-dark-ink line-clamp-2 group-hover:text-accent transition-colors">
                            {article.title}
                          </h4>
                          <p className="text-[10px] text-ink-mute dark:text-dark-mute mt-1">
                            {article.author}
                          </p>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          ) : (
            /* Standard Desk Navigation */
            <nav className="p-5 font-sans text-xs space-y-6">
              {/* Section: News & World */}
              <div>
                <h4 className="font-mono font-bold tracking-widest uppercase text-accent text-[10.5px] mb-2 px-1">
                  News &amp; World
                </h4>
                <ul className="grid grid-cols-2 gap-1.5 text-ink dark:text-dark-ink font-medium">
                  <li><Link href="/section/world" onClick={onClose} className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 hover:text-accent transition block">World</Link></li>
                  <li><Link href="/section/india" onClick={onClose} className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 hover:text-accent transition block">India</Link></li>
                  <li><Link href="/section/us" onClick={onClose} className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 hover:text-accent transition block">U.S.</Link></li>
                  <li><Link href="/section/politics" onClick={onClose} className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 hover:text-accent transition block">Politics</Link></li>
                  <li><Link href="/section/economy" onClick={onClose} className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 hover:text-accent transition block">Economy</Link></li>
                  <li><Link href="/section/technology" onClick={onClose} className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 hover:text-accent transition block">Technology</Link></li>
                  <li><Link href="/section/environment" onClick={onClose} className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 hover:text-accent transition block">Environment</Link></li>
                  <li><Link href="/section/health" onClick={onClose} className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 hover:text-accent transition block">Health</Link></li>
                </ul>
              </div>

              {/* Section: Business & Markets */}
              <div>
                <h4 className="font-mono font-bold tracking-widest uppercase text-accent text-[10.5px] mb-2 px-1">
                  Markets &amp; Economy
                </h4>
                <ul className="grid grid-cols-2 gap-1.5 text-ink dark:text-dark-ink font-medium">
                  <li><Link href="/section/economy" onClick={onClose} className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 hover:text-accent transition block">Indian Equities</Link></li>
                  <li><Link href="/section/economy" onClick={onClose} className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 hover:text-accent transition block">Global Trade</Link></li>
                  <li><Link href="/section/technology" onClick={onClose} className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 hover:text-accent transition block">AI &amp; Tech</Link></li>
                  <li><Link href="/section/business" onClick={onClose} className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 hover:text-accent transition block">Commodities</Link></li>
                </ul>
              </div>

              {/* Section: Analysis & Culture */}
              <div>
                <h4 className="font-mono font-bold tracking-widest uppercase text-accent text-[10.5px] mb-2 px-1">
                  Opinion &amp; Culture
                </h4>
                <ul className="grid grid-cols-2 gap-1.5 text-ink dark:text-dark-ink font-medium">
                  <li><Link href="/section/opinion" onClick={onClose} className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 hover:text-accent transition block">Editorials</Link></li>
                  <li><Link href="/section/culture" onClick={onClose} className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 hover:text-accent transition block">Culture &amp; Arts</Link></li>
                  <li><Link href="/section/sports" onClick={onClose} className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 hover:text-accent transition block">Sports</Link></li>
                  <li><Link href="/search" onClick={onClose} className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 hover:text-accent transition block">Full Archives</Link></li>
                </ul>
              </div>
            </nav>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 bg-paper-subtle dark:bg-dark-subtle border-t border-rule dark:border-dark-rule font-sans">
          <div className="flex items-center justify-between text-[11px] text-ink-mute dark:text-dark-mute mb-2">
            <div className="flex items-center gap-3">
              <Link href="/about" onClick={onClose} className="hover:text-accent transition font-medium">About Us</Link>
              <span>·</span>
              <Link href="/privacy" onClick={onClose} className="hover:text-accent transition font-medium">Privacy & Legal</Link>
            </div>
            <Link href="/admin" onClick={onClose} className="font-mono text-accent hover:underline">
              Newsroom CMS →
            </Link>
          </div>
          <div className="text-[10px] text-ink-mute/70 dark:text-dark-mute/70">
            © {new Date().getFullYear()} {brandName}. Independent dispatches by Dhananjay Singh.
          </div>
        </div>
      </div>
    </div>
  )
}
