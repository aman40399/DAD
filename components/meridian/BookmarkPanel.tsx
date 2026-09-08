'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useBookmarks } from '@/lib/bookmarks'

export default function BookmarkPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const { bookmarks, count, toggleBookmark, clearBookmarks } = useBookmarks()
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button with Apple-style Badge */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`relative inline-flex items-center justify-center w-7 h-7 rounded-full transition-all duration-200 cursor-pointer ${
          isOpen
            ? 'bg-ink/10 dark:bg-white/15 text-accent'
            : 'text-ink-mute hover:text-ink dark:hover:text-dark-ink hover:bg-ink/5 dark:hover:bg-white/5'
        }`}
        aria-label="Reading list and saved articles"
        title="Reading List"
      >
        <svg
          viewBox="0 0 16 16"
          width="13"
          height="13"
          fill={count > 0 ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="1.5"
          className="transition-transform duration-200 active:scale-90"
        >
          <path d="M3 2.5a.5.5 0 01.5-.5h9a.5.5 0 01.5.5v11.5a.5.5 0 01-.757.429L8 11.232l-4.243 2.697A.5.5 0 013 13.5V2.5z" />
        </svg>

        {count > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[15px] h-[15px] bg-accent text-white font-sans text-[9px] font-bold rounded-full flex items-center justify-center px-1 shadow-xs ring-2 ring-paper dark:ring-dark-paper">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {/* Apple-Design Floating Frosted Card */}
      {isOpen && (
        <div className="fixed inset-x-3 top-16 sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2.5 sm:w-96 max-w-[420px] mx-auto sm:mx-0 bg-white/90 dark:bg-[#1c1c1e]/92 backdrop-blur-2xl backdrop-saturate-150 border border-black/[0.08] dark:border-white/[0.12] shadow-[0_24px_50px_-12px_rgba(0,0,0,0.35)] rounded-2xl z-50 overflow-hidden font-sans transition-all duration-200 origin-top-right">
          {/* Card Masthead Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-black/[0.06] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.02]">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-accent/15 flex items-center justify-center text-accent">
                <svg viewBox="0 0 16 16" width="10" height="10" fill="currentColor">
                  <path d="M3 2.5a.5.5 0 01.5-.5h9a.5.5 0 01.5.5v11.5a.5.5 0 01-.757.429L8 11.232l-4.243 2.697A.5.5 0 013 13.5V2.5z" />
                </svg>
              </div>
              <span className="text-[12px] font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                Reading List
              </span>
              <span className="px-1.5 py-0.2 rounded-full bg-neutral-200/70 dark:bg-neutral-800 text-[10px] font-mono text-neutral-600 dark:text-neutral-400 font-semibold">
                {count}
              </span>
            </div>

            {count > 0 && (
              <button
                onClick={clearBookmarks}
                className="text-[11px] font-medium text-neutral-500 hover:text-rose-500 dark:text-neutral-400 dark:hover:text-rose-400 transition cursor-pointer px-2 py-0.5 rounded-full hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Bookmarks List or Apple Empty State */}
          {count === 0 ? (
            <div className="p-8 text-center flex flex-col items-center">
              <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-neutral-800/60 flex items-center justify-center text-neutral-400 dark:text-neutral-500 mb-3 shadow-inner">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M5 3v18l7-4 7 4V3a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2z" />
                </svg>
              </div>
              <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                Your Reading List is Empty
              </h4>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 max-w-[220px] leading-relaxed">
                Save stories from Singh Monster to read at your convenience across devices.
              </p>
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto p-2 space-y-1.5 apple-scrollbar">
              {bookmarks.map((item) => (
                <div
                  key={item.id}
                  className="group relative flex items-start gap-3 p-2.5 rounded-xl hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors duration-150"
                >
                  {item.image && (
                    <div className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0 ring-1 ring-black/[0.08] dark:ring-white/[0.12] bg-neutral-100 dark:bg-neutral-800">
                      <img
                        src={item.image}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0 pr-6">
                    <Link
                      href={item.url}
                      onClick={() => setIsOpen(false)}
                      className="block font-serif text-[12.5px] font-bold leading-snug text-neutral-900 dark:text-neutral-100 hover:text-accent dark:hover:text-dark-accent line-clamp-2 transition-colors"
                    >
                      {item.title}
                    </Link>
                    <div className="flex items-center gap-1.5 text-[10px] text-neutral-500 dark:text-neutral-400 mt-1">
                      {item.category && (
                        <span className="font-mono uppercase font-bold text-accent dark:text-dark-accent">
                          {item.category}
                        </span>
                      )}
                      {item.date && (
                        <>
                          <span className="opacity-40">·</span>
                          <span>{item.date}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Apple-style discreet delete button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleBookmark(item)
                    }}
                    className="absolute right-2.5 top-2.5 w-6 h-6 rounded-full flex items-center justify-center text-neutral-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-black/[0.05] dark:hover:bg-white/[0.1] transition-all opacity-70 group-hover:opacity-100 cursor-pointer"
                    title="Remove from Reading List"
                    aria-label="Remove item"
                  >
                    <svg viewBox="0 0 14 14" width="10" height="10" stroke="currentColor" strokeWidth="2" fill="none">
                      <path d="M1 1l12 12M13 1L1 13" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
