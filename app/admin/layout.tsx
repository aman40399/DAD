'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import ThemeToggle from '@/components/meridian/ThemeToggle'
import {
  IconMenu,
  IconClose,
  IconDocument,
  IconPin,
  IconPlus,
  IconMedia,
  IconChart,
  IconNavStories,
  IconNavSlots,
  IconNavMedia,
  IconNavVisitor,
} from '@/components/admin/AdminIcons'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const desks = [
    { label: 'Stories', href: '/admin', exact: true },
    { label: 'Slot Manager', href: '/admin/slots', exact: false },
    { label: 'Media Vault', href: '/admin/media', exact: false },
    { label: 'Visitor Intelligence', href: '/admin/analytics', exact: false },
  ]

  const isDeskActive = (href: string, exact: boolean) => {
    if (exact) {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  const getPageTitle = () => {
    if (pathname === '/admin') return 'Stories'
    if (pathname.startsWith('/admin/slots')) return 'Slot Manager'
    if (pathname.startsWith('/admin/media')) return 'Media Vault'
    if (pathname.startsWith('/admin/analytics')) return 'Visitor Intelligence'
    if (pathname.startsWith('/admin/articles/new')) return 'New Story'
    if (pathname.includes('/edit')) return 'Edit Story'
    return 'Newsroom'
  }

  return (
    <div className="h-dvh md:min-h-screen bg-paper dark:bg-dark-paper text-ink dark:text-dark-ink font-sans flex flex-col md:flex-row antialiased overflow-hidden md:overflow-visible">
      {/* MOBILE APP TOP BAR (Clean, compact, native feel) */}
      <header className="md:hidden shrink-0 z-40 bg-paper/95 dark:bg-[#0c0c0e]/95 backdrop-blur-xl border-b border-rule/60 dark:border-white/[0.08] px-3.5 py-2.5 flex items-center justify-between select-none">
        <div className="flex items-center gap-2.5">
          <Link href="/admin" className="flex items-center no-underline" title="Singh Monster CMS">
            <img
              src="/logo.png"
              alt="Singh Monster"
              className="w-7 h-7 object-contain dark:invert shrink-0"
            />
          </Link>
          <span className="font-serif font-black text-base tracking-tight text-ink dark:text-dark-ink">
            {getPageTitle()}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            target="_blank"
            rel="noreferrer"
            className="px-2.5 py-1 text-[11px] font-medium text-ink-mute dark:text-dark-mute hover:text-ink dark:hover:text-white bg-paper-subtle dark:bg-white/[0.05] border border-rule/60 dark:border-white/10 rounded-full transition"
            title="Open Live Site"
          >
            Live Site ↗
          </Link>
          <ThemeToggle className="w-7 h-7 flex items-center justify-center rounded-full border border-rule/60 dark:border-white/10 text-ink-mute hover:text-ink dark:hover:text-white transition" />
          <div className="relative w-7 h-7 rounded-full overflow-hidden border border-rule/60 dark:border-white/10 shrink-0">
            <img
              src="/authr.png"
              alt="Dhananjay Singh"
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.currentTarget
                target.src = '/logo.png'
              }}
            />
            <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-paper dark:ring-black" />
          </div>
        </div>
      </header>

      {/* MOBILE BACKDROP */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-xs transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* LEFT VERTICAL SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-paper-subtle/85 dark:bg-[#0c0c0e] border-r border-rule/60 dark:border-white/[0.08] flex flex-col justify-between p-5 transition-transform duration-200 md:translate-x-0 md:static md:h-screen md:sticky md:top-0 select-none ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Section: Brand & Nav Links */}
        <div className="space-y-6">
          {/* Brand & Crest - 2X Clean Borderless Logo */}
          <div className="flex items-center justify-between">
            <Link
              href="/admin"
              className="flex items-center gap-3.5 group text-ink dark:text-dark-ink no-underline shrink-0"
            >
              <img
                src="/logo.png"
                alt="Singh Monster"
                className="w-12 h-12 object-contain dark:invert shrink-0 transition-transform duration-200 group-hover:scale-105 drop-shadow-xs"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-serif font-black text-lg tracking-tight text-ink dark:text-dark-ink group-hover:text-accent transition">
                    Singh Monster
                  </span>
                </div>
                <p className="font-mono text-[9px] uppercase tracking-widest text-ink-mute dark:text-dark-mute">
                  Newsroom CMS
                </p>
              </div>
            </Link>

            {/* Mobile close button inside sidebar */}
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="md:hidden p-1.5 rounded-full text-ink-mute hover:text-ink dark:hover:text-white"
            >
              <IconClose className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Desks - Pure Clean Text (Zero Icons / Zero Emojis) */}
          <nav className="space-y-1.5">
            {desks.map((desk) => {
              const active = isDeskActive(desk.href, desk.exact)
              return (
                <Link
                  key={desk.href}
                  href={desk.href}
                  onClick={() => setMobileOpen(false)}
                  className={`w-full h-10 px-4 rounded-xl transition-all duration-150 flex items-center text-xs tracking-wide ${
                    active
                      ? 'bg-ink text-paper dark:bg-white dark:text-black font-bold shadow-xs'
                      : 'text-ink-mute dark:text-dark-mute hover:text-ink dark:hover:text-white hover:bg-paper dark:hover:bg-white/[0.05] font-semibold'
                  }`}
                >
                  <span>{desk.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Bottom Section: Author Profile & Utility Controls */}
        <div className="space-y-3.5 pt-4 border-t border-rule/60 dark:border-white/[0.08]">
          {/* Admin Profile Area with authr.png */}
          <div className="p-3 rounded-2xl bg-paper dark:bg-white/[0.03] border border-rule/60 dark:border-white/10 flex items-center gap-3 shadow-xs">
            <img
              src="/authr.png"
              alt="Dhananjay Singh"
              className="w-10 h-10 rounded-full object-cover border border-rule/60 dark:border-white/10 shrink-0"
              onError={(e) => {
                // fallback if missing
                const target = e.currentTarget
                target.src = '/logo.png'
              }}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-xs font-bold text-ink dark:text-white truncate">
                  Dhananjay Singh
                </p>
              </div>
              <p className="text-[10px] font-mono text-ink-mute dark:text-dark-mute truncate">
                Admin · Lead Correspondent
              </p>
            </div>
          </div>

          {/* Utility Actions: Live Site & Theme Toggle */}
          <div className="flex items-center gap-2">
            <Link
              href="/"
              target="_blank"
              rel="noreferrer"
              className="flex-1 h-9 px-3 bg-paper dark:bg-white/[0.04] hover:bg-paper-subtle dark:hover:bg-white/10 border border-rule/60 dark:border-white/10 rounded-2xl text-xs font-semibold text-ink-mute dark:text-dark-mute hover:text-ink dark:hover:text-white transition flex items-center justify-center shadow-xs"
              title="Open live broadsheet in new tab"
            >
              <span>Live Site</span>
            </Link>
            <ThemeToggle className="w-9 h-9 flex items-center justify-center bg-paper dark:bg-white/[0.04] hover:bg-paper-subtle dark:hover:bg-white/10 border border-rule/60 dark:border-white/10 rounded-2xl text-ink-mute dark:text-dark-mute hover:text-ink dark:hover:text-white transition shadow-xs cursor-pointer" />
          </div>
        </div>
      </aside>

      {/* Main Admin Content Pane */}
      <main className="flex-1 min-w-0 p-3 sm:p-7 lg:p-8 overflow-hidden md:overflow-y-auto flex flex-col pb-16 md:pb-8">
        <div className="max-w-[1360px] mx-auto w-full flex-1 flex flex-col min-h-0">
          {children}
        </div>
      </main>

      {/* MOBILE BOTTOM APP NAVIGATION BAR (Native App Feel) */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-paper/95 dark:bg-[#0c0c0e]/95 backdrop-blur-2xl border-t border-rule/60 dark:border-white/[0.08] px-3 py-1.5 flex items-center justify-around select-none shadow-lg">
        {/* Tab 1: Stories */}
        <Link
          href="/admin"
          className={`flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-xl transition ${
            isDeskActive('/admin', true)
              ? 'text-accent dark:text-accent font-bold'
              : 'text-ink-mute dark:text-dark-mute hover:text-ink dark:hover:text-white'
          }`}
        >
          <IconNavStories className="w-[22px] h-[22px]" />
          <span className="text-[10px] tracking-tight">Stories</span>
        </Link>

        {/* Tab 2: Slots */}
        <Link
          href="/admin/slots"
          className={`flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-xl transition ${
            isDeskActive('/admin/slots', false)
              ? 'text-accent dark:text-accent font-bold'
              : 'text-ink-mute dark:text-dark-mute hover:text-ink dark:hover:text-white'
          }`}
        >
          <IconNavSlots className="w-[22px] h-[22px]" />
          <span className="text-[10px] tracking-tight">Slots</span>
        </Link>

        {/* Center Primary Action: Write Story */}
        <Link
          href="/admin/articles/new"
          className="flex items-center justify-center w-11 h-11 -mt-4 bg-accent text-white rounded-full shadow-lg hover:scale-105 active:scale-95 transition"
          title="Write Story"
        >
          <IconPlus className="w-5 h-5 stroke-[2.5]" />
        </Link>

        {/* Tab 3: Media */}
        <Link
          href="/admin/media"
          className={`flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-xl transition ${
            isDeskActive('/admin/media', false)
              ? 'text-accent dark:text-accent font-bold'
              : 'text-ink-mute dark:text-dark-mute hover:text-ink dark:hover:text-white'
          }`}
        >
          <IconNavMedia className="w-[22px] h-[22px]" />
          <span className="text-[10px] tracking-tight">Media</span>
        </Link>

        {/* Tab 4: Analytics */}
        <Link
          href="/admin/analytics"
          className={`flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-xl transition ${
            isDeskActive('/admin/analytics', false)
              ? 'text-accent dark:text-accent font-bold'
              : 'text-ink-mute dark:text-dark-mute hover:text-ink dark:hover:text-white'
          }`}
        >
          <IconNavVisitor className="w-[22px] h-[22px]" />
          <span className="text-[10px] tracking-tight">Visitor</span>
        </Link>
      </nav>
    </div>
  )
}
