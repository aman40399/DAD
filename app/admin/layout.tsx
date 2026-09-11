'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import ThemeToggle from '@/components/meridian/ThemeToggle'
import {
  IconMenu,
  IconClose,
  IconPlus,
  IconNavStories,
  IconNavSlots,
  IconNavMedia,
  IconNavAbout,
  IconNavVisitor,
  IconLogout,
} from '@/components/admin/AdminIcons'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(pathname !== '/admin/login')

  useEffect(() => {
    if (pathname === '/admin/login') {
      setCheckingAuth(false)
      return
    }

    let isMounted = true
    fetch('/api/admin/auth')
      .then((res) => {
        if (!res.ok) {
          if (isMounted) {
            router.replace('/admin/login')
          }
        } else {
          if (isMounted) {
            setCheckingAuth(false)
          }
        }
      })
      .catch(() => {
        if (isMounted) {
          router.replace('/admin/login')
        }
      })

    return () => {
      isMounted = false
    }
  }, [pathname, router])

  const handleSignOut = async () => {
    try {
      await fetch('/api/admin/auth', { method: 'DELETE' })
    } finally {
      router.replace('/admin/login')
    }
  }

  // If on login screen, render standalone without CMS chrome
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  const desks = [
    { label: 'Stories', href: '/admin', exact: true, icon: IconNavStories },
    { label: 'Slot Curator', href: '/admin/slots', exact: false, icon: IconNavSlots },
    { label: 'Media Vault', href: '/admin/media', exact: false, icon: IconNavMedia },
    { label: 'About Us Editor', href: '/admin/about', exact: false, icon: IconNavAbout },
    { label: 'Visitor Analytics', href: '/admin/analytics', exact: false, icon: IconNavVisitor },
    { label: 'SEO & Search Indexing', href: '/admin/seo', exact: false, icon: IconNavStories },
  ]

  const isDeskActive = (href: string, exact: boolean) => {
    if (exact) {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  const getPageTitle = () => {
    if (pathname === '/admin') return 'Stories'
    if (pathname.startsWith('/admin/slots')) return 'Slot Curator'
    if (pathname.startsWith('/admin/media')) return 'Media Vault'
    if (pathname.startsWith('/admin/about')) return 'About Editor'
    if (pathname.startsWith('/admin/analytics')) return 'Analytics'
    if (pathname.startsWith('/admin/seo')) return 'SEO Indexing'
    if (pathname.startsWith('/admin/articles/new')) return 'New Story'
    if (pathname.includes('/edit')) return 'Edit Story'
    return 'Newsroom'
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] dark:bg-[#000000] flex items-center justify-center p-4">
        <div className="backdrop-blur-2xl bg-white/80 dark:bg-[#1c1c1e]/80 border border-black/[0.06] dark:border-white/[0.08] p-8 rounded-3xl shadow-xl flex flex-col items-center gap-4">
          <img
            src="/logo.png"
            alt="Singh Monster"
            className="w-12 h-12 object-contain animate-pulse"
          />
          <div className="text-center">
            <h3 className="text-sm font-semibold tracking-tight text-[#1d1d1f] dark:text-white">
              Singh Monster Newsroom
            </h3>
            <p className="text-xs text-[#1d1d1f]/60 dark:text-white/60 mt-1">
              Verifying Apple Security Session...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-dvh md:min-h-screen bg-[#f5f5f7] dark:bg-[#000000] text-[#1d1d1f] dark:text-white font-sans flex flex-col md:flex-row antialiased overflow-hidden md:overflow-visible">
      {/* MOBILE APP TOP BAR (Apple Frosted Glass) */}
      <header className="md:hidden shrink-0 z-40 backdrop-blur-xl bg-white/80 dark:bg-[#161617]/80 border-b border-black/[0.06] dark:border-white/[0.08] px-4 py-3 flex items-center justify-between select-none">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#1d1d1f] dark:text-white bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/10 active:scale-95 transition"
            aria-label="Open newsroom menu"
          >
            <IconMenu className="w-4 h-4" />
          </button>
          <Link href="/admin" className="flex items-center no-underline" title="Singh Monster CMS">
            <img
              src="/logo.png"
              alt="Singh Monster"
              className="w-7 h-7 object-contain shrink-0"
            />
          </Link>
          <span className="font-semibold text-sm tracking-tight text-[#1d1d1f] dark:text-white">
            {getPageTitle()}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1 text-[11px] font-semibold text-[#0071e3] dark:text-[#2997ff] bg-[#0071e3]/10 dark:bg-[#2997ff]/15 rounded-full active:scale-95 transition"
            title="Open Live Site"
          >
            Live ↗
          </Link>
          <ThemeToggle className="w-8 h-8 flex items-center justify-center rounded-full bg-black/[0.04] dark:bg-white/[0.06] text-[#1d1d1f]/70 hover:text-[#1d1d1f] dark:text-white/70 dark:hover:text-white active:scale-95 transition" />
          <button
            type="button"
            onClick={handleSignOut}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-black/[0.04] dark:bg-white/[0.06] text-[#1d1d1f]/70 hover:text-red-600 dark:text-white/70 dark:hover:text-red-400 active:scale-95 transition"
            title="Sign Out"
          >
            <IconLogout className="w-3.5 h-3.5" />
          </button>
          <div className="relative w-8 h-8 rounded-full overflow-hidden border border-black/[0.08] dark:border-white/[0.1] shrink-0">
            <img
              src="/authr.png"
              alt="Dhananjay Singh"
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.currentTarget
                target.src = '/logo.png'
              }}
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-black" />
          </div>
        </div>
      </header>

      {/* MOBILE BACKDROP */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-md z-40 md:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* DESKTOP SIDEBAR (macOS / iPadOS Frosted Glass) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 backdrop-blur-2xl bg-white/75 dark:bg-[#161617]/75 border-r border-black/[0.06] dark:border-white/[0.08] flex flex-col justify-between p-5 transition-transform duration-300 md:translate-x-0 md:static md:h-screen md:sticky md:top-0 select-none ${
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Top Section: Brand & Nav Links */}
        <div className="space-y-6">
          {/* Brand & Crest */}
          <div className="flex items-center justify-between px-1">
            <Link
              href="/admin"
              className="flex items-center gap-3 group text-[#1d1d1f] dark:text-white no-underline shrink-0"
            >
              <div className="w-10 h-10 rounded-2xl bg-black/[0.03] dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.08] flex items-center justify-center p-1.5 transition-transform duration-200 group-hover:scale-105">
                <img
                  src="/logo.png"
                  alt="Singh Monster"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-sm tracking-tight text-[#1d1d1f] dark:text-white">
                    Singh Monster
                  </span>
                </div>
                <p className="text-[11px] font-medium text-[#1d1d1f]/50 dark:text-white/50 tracking-tight">
                  Newsroom Desk
                </p>
              </div>
            </Link>

            {/* Mobile close button inside sidebar */}
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="md:hidden w-8 h-8 rounded-full flex items-center justify-center text-[#1d1d1f]/70 hover:text-black dark:text-white/70 dark:hover:text-white bg-black/[0.04] dark:bg-white/[0.06]"
            >
              <IconClose className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Desks - Apple Segmented List Items */}
          <nav className="space-y-1">
            {desks.map((desk) => {
              const active = isDeskActive(desk.href, desk.exact)
              const Icon = desk.icon
              return (
                <Link
                  key={desk.href}
                  href={desk.href}
                  onClick={() => setMobileOpen(false)}
                  className={`w-full h-10 px-3.5 rounded-xl transition-all duration-150 flex items-center gap-3 text-xs tracking-tight ${
                    active
                      ? 'bg-white dark:bg-[#2c2c2e] text-[#0071e3] dark:text-[#2997ff] font-semibold shadow-[0_1px_6px_rgba(0,0,0,0.06)]'
                      : 'text-[#1d1d1f]/70 dark:text-white/70 hover:text-[#1d1d1f] dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] font-medium'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-[#0071e3] dark:text-[#2997ff]' : 'opacity-70'}`} />
                  <span className="truncate">{desk.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Bottom Section: Author Profile & Utility Controls */}
        <div className="space-y-3 pt-4 border-t border-black/[0.06] dark:border-white/[0.08]">
          {/* Admin Profile Area */}
          <div className="p-3 rounded-2xl backdrop-blur-md bg-white/60 dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] flex items-center gap-3 shadow-xs">
            <div className="relative w-9 h-9 shrink-0">
              <img
                src="/authr.png"
                alt="Dhananjay Singh"
                className="w-full h-full rounded-full object-cover border border-black/[0.08] dark:border-white/[0.1]"
                onError={(e) => {
                  const target = e.currentTarget
                  target.src = '/logo.png'
                }}
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#161617]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-[#1d1d1f] dark:text-white truncate">
                Dhananjay Singh
              </p>
              <p className="text-[11px] text-[#1d1d1f]/50 dark:text-white/50 truncate">
                Chief Editor · Ballia
              </p>
            </div>
          </div>

          {/* Utility Actions: Live Site, Theme Toggle & Sign Out */}
          <div className="flex items-center gap-2">
            <Link
              href="/"
              target="_blank"
              rel="noreferrer"
              className="flex-1 h-9 px-3 backdrop-blur-md bg-white/60 dark:bg-white/[0.04] hover:bg-white dark:hover:bg-white/10 border border-black/[0.06] dark:border-white/[0.08] rounded-full text-xs font-semibold text-[#1d1d1f]/80 dark:text-white/80 hover:text-[#1d1d1f] dark:hover:text-white transition flex items-center justify-center shadow-2xs active:scale-[0.98]"
              title="Open live broadsheet in new tab"
            >
              <span>Live Site ↗</span>
            </Link>
            <ThemeToggle className="w-9 h-9 flex items-center justify-center backdrop-blur-md bg-white/60 dark:bg-white/[0.04] hover:bg-white dark:hover:bg-white/10 border border-black/[0.06] dark:border-white/[0.08] rounded-full text-[#1d1d1f]/70 dark:text-white/70 hover:text-[#1d1d1f] dark:hover:text-white transition shadow-2xs cursor-pointer active:scale-95" />
            <button
              type="button"
              onClick={handleSignOut}
              className="w-9 h-9 flex items-center justify-center backdrop-blur-md bg-white/60 dark:bg-white/[0.04] hover:bg-red-500/10 border border-black/[0.06] dark:border-white/[0.08] hover:border-red-500/30 rounded-full text-[#1d1d1f]/70 dark:text-white/70 hover:text-red-600 dark:hover:text-red-400 transition shadow-2xs cursor-pointer active:scale-95"
              title="Sign Out of Newsroom"
            >
              <IconLogout className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Admin Content Pane */}
      <main className="flex-1 min-w-0 p-3 sm:p-7 lg:p-8 overflow-y-auto flex flex-col pb-28 md:pb-12">
        <div className="max-w-[1360px] mx-auto w-full flex-1 flex flex-col min-h-0">
          {children}
        </div>
      </main>

      {/* MOBILE BOTTOM APP NAVIGATION BAR (iOS Style Frosted Floating Bar) */}
      <nav className="md:hidden fixed bottom-3 inset-x-3 z-40 backdrop-blur-2xl bg-white/85 dark:bg-[#1c1c1e]/85 border border-black/[0.08] dark:border-white/[0.1] rounded-3xl px-3 py-1.5 flex items-center justify-around select-none shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
        {/* Tab 1: Stories */}
        <Link
          href="/admin"
          className={`flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-2xl transition active:scale-90 ${
            isDeskActive('/admin', true)
              ? 'text-[#0071e3] dark:text-[#2997ff] font-semibold'
              : 'text-[#1d1d1f]/50 dark:text-white/50 hover:text-[#1d1d1f] dark:hover:text-white'
          }`}
        >
          <IconNavStories className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Stories</span>
        </Link>

        {/* Tab 2: Slots */}
        <Link
          href="/admin/slots"
          className={`flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-2xl transition active:scale-90 ${
            isDeskActive('/admin/slots', false)
              ? 'text-[#0071e3] dark:text-[#2997ff] font-semibold'
              : 'text-[#1d1d1f]/50 dark:text-white/50 hover:text-[#1d1d1f] dark:hover:text-white'
          }`}
        >
          <IconNavSlots className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Slots</span>
        </Link>

        {/* Center Primary Action: Write Story (Apple Action Blue Pill) */}
        <Link
          href="/admin/articles/new"
          className="flex items-center justify-center w-12 h-12 -mt-5 bg-[#0071e3] text-white rounded-full shadow-[0_4px_16px_rgba(0,113,227,0.4)] hover:bg-[#0077ed] active:scale-95 transition-all"
          title="Write Story"
        >
          <IconPlus className="w-6 h-6 stroke-[2.5]" />
        </Link>

        {/* Tab 3: Media */}
        <Link
          href="/admin/media"
          className={`flex flex-col items-center justify-center gap-0.5 py-1 px-2.5 rounded-2xl transition active:scale-90 ${
            isDeskActive('/admin/media', false)
              ? 'text-[#0071e3] dark:text-[#2997ff] font-semibold'
              : 'text-[#1d1d1f]/50 dark:text-white/50 hover:text-[#1d1d1f] dark:hover:text-white'
          }`}
        >
          <IconNavMedia className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Media</span>
        </Link>

        {/* Tab 4: Analytics */}
        <Link
          href="/admin/analytics"
          className={`flex flex-col items-center justify-center gap-0.5 py-1 px-2.5 rounded-2xl transition active:scale-90 ${
            isDeskActive('/admin/analytics', false)
              ? 'text-[#0071e3] dark:text-[#2997ff] font-semibold'
              : 'text-[#1d1d1f]/50 dark:text-white/50 hover:text-[#1d1d1f] dark:hover:text-white'
          }`}
        >
          <IconNavVisitor className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Analytics</span>
        </Link>
      </nav>
    </div>
  )
}
