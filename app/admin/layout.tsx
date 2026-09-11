'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import ThemeToggle from '@/components/meridian/ThemeToggle'
import {
  BookOpen,
  LayoutGrid,
  Image as ImageIcon,
  FileText,
  BarChart3,
  Globe,
  Menu,
  X,
  Plus,
  LogOut,
  ArrowUpRight,
} from 'lucide-react'

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
    { label: 'Stories', href: '/admin', exact: true, icon: BookOpen },
    { label: 'Slot Curator', href: '/admin/slots', exact: false, icon: LayoutGrid },
    { label: 'Media Vault', href: '/admin/media', exact: false, icon: ImageIcon },
    { label: 'About Us Editor', href: '/admin/about', exact: false, icon: FileText },
    { label: 'Visitor Analytics', href: '/admin/analytics', exact: false, icon: BarChart3 },
    { label: 'SEO & Indexing', href: '/admin/seo', exact: false, icon: Globe },
  ]

  const isDeskActive = (href: string, exact: boolean) => {
    if (exact) {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  const getPageTitle = () => {
    if (pathname === '/admin') return 'Stories'
    if (pathname.startsWith('/admin/slots')) return 'Slots'
    if (pathname.startsWith('/admin/media')) return 'Media'
    if (pathname.startsWith('/admin/about')) return 'About'
    if (pathname.startsWith('/admin/analytics')) return 'Analytics'
    if (pathname.startsWith('/admin/seo')) return 'SEO'
    if (pathname.startsWith('/admin/articles/new')) return 'New Story'
    if (pathname.includes('/edit')) return 'Edit Story'
    return 'Newsroom'
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] dark:bg-[#000000] flex items-center justify-center select-none">
        <img
          src="/logo.png"
          alt="Singh Monster"
          className="w-24 h-24 sm:w-28 sm:h-28 object-contain animate-pulse"
        />
      </div>
    )
  }

  return (
    <div className="relative h-dvh bg-[#f5f5f7] dark:bg-[#000000] text-[#1d1d1f] dark:text-white font-apple flex flex-col md:flex-row antialiased overflow-hidden">
      {/* MOBILE APP TOP BAR (Apple Frosted Glass) */}
      <header className="md:hidden shrink-0 z-40 backdrop-blur-2xl bg-white/80 dark:bg-[#161617]/80 border-b border-black/[0.05] dark:border-white/[0.06] px-4 py-3 flex items-center justify-between select-none">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#1d1d1f] dark:text-white bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/10 active:scale-95 transition"
            aria-label="Open menu"
          >
            <Menu className="w-4 h-4" />
          </button>
          <Link href="/admin" className="flex items-center gap-2 no-underline" title={getPageTitle()}>
            <img
              src="/logo.png"
              alt="Singh Monster"
              className="w-7 h-7 object-contain shrink-0"
            />
            <span className="font-bold text-base tracking-tight text-[#1d1d1f] dark:text-white">
              {getPageTitle()}
            </span>
          </Link>
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
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* MOBILE BACKDROP */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-md z-40 md:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* DESKTOP SIDEBAR (Translucent Glass + 2x Borderless Logo + Singh Monster Heading) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 apple-glass-sidebar backdrop-blur-3xl bg-white/60 dark:bg-[#121214]/60 border-r border-black/[0.05] dark:border-white/[0.06] flex flex-col justify-between p-6 transition-transform duration-300 md:translate-x-0 md:static md:h-full select-none ${
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Top Section: Brand & Nav Links */}
        <div className="space-y-7">
          {/* Brand & Crest: NO BORDER, 2x SIZE LOGO, JUST SINGH MONSTER HEADING */}
          <div className="flex items-center justify-between">
            <Link
              href="/admin"
              className="flex items-center gap-3.5 group text-[#1d1d1f] dark:text-white no-underline"
            >
              {/* 2x size logo with NO border */}
              <img
                src="/logo.png"
                alt="Singh Monster"
                className="w-14 h-14 object-contain shrink-0 transition-transform duration-300 group-hover:scale-105"
              />
              <span className="font-semibold text-base tracking-tight text-[#1d1d1f] dark:text-white group-hover:text-[#0071e3] dark:group-hover:text-[#2997ff] transition-colors">
                Singh Monster
              </span>
            </Link>

            {/* Mobile close button inside sidebar */}
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="md:hidden w-8 h-8 rounded-full flex items-center justify-center text-[#1d1d1f]/70 hover:text-black dark:text-white/70 dark:hover:text-white bg-black/[0.04] dark:bg-white/[0.06] active:scale-95 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Desks - Apple Glass Nav Items with Premium Lucide Icons */}
          <nav className="space-y-1">
            {desks.map((desk) => {
              const active = isDeskActive(desk.href, desk.exact)
              const Icon = desk.icon
              return (
                <Link
                  key={desk.href}
                  href={desk.href}
                  onClick={() => setMobileOpen(false)}
                  className={`w-full h-10 px-3.5 rounded-2xl transition-all duration-200 flex items-center gap-3 text-xs tracking-tight group ${
                    active
                      ? 'bg-black/[0.06] dark:bg-white/[0.09] text-[#0071e3] dark:text-[#2997ff] font-semibold shadow-2xs backdrop-blur-md'
                      : 'text-[#1d1d1f]/65 dark:text-white/65 hover:text-[#1d1d1f] dark:hover:text-white hover:bg-black/[0.03] dark:hover:bg-white/[0.05] font-medium'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                      active ? 'text-[#0071e3] dark:text-[#2997ff]' : 'opacity-70'
                    }`}
                  />
                  <span className="truncate">{desk.label}</span>
                  {active && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#0071e3] dark:bg-[#2997ff]" />
                  )}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Bottom Section: Ultra-minimalistic, plain simple design */}
        <div className="pt-4 border-t border-black/[0.04] dark:border-white/[0.05] space-y-3">
          {/* Simple minimalist author line */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative w-7 h-7 rounded-full overflow-hidden shrink-0">
                <img
                  src="/authr.png"
                  alt="Dhananjay Singh"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.currentTarget
                    target.src = '/logo.png'
                  }}
                />
                <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-white dark:ring-black" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#1d1d1f] dark:text-white truncate tracking-tight">
                  Dhananjay Singh
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <Link
                href="/"
                target="_blank"
                rel="noreferrer"
                className="w-7 h-7 rounded-full flex items-center justify-center text-[#1d1d1f]/50 hover:text-[#1d1d1f] dark:text-white/50 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition active:scale-95"
                title="Live Site"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
              <ThemeToggle className="w-7 h-7 flex items-center justify-center rounded-full text-[#1d1d1f]/50 hover:text-[#1d1d1f] dark:text-white/50 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition active:scale-95 cursor-pointer" />
              <button
                type="button"
                onClick={handleSignOut}
                className="w-7 h-7 flex items-center justify-center rounded-full text-[#1d1d1f]/50 hover:text-red-500 dark:text-white/50 dark:hover:text-red-400 hover:bg-red-500/10 transition active:scale-95 cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Admin Content Pane */}
      <main className="relative flex-1 min-w-0 p-3 sm:p-7 lg:p-8 overflow-y-auto flex flex-col pb-28 md:pb-12">
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
          <BookOpen className="w-5 h-5" />
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
          <LayoutGrid className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Slots</span>
        </Link>

        {/* Center Primary Action: Write Story (Apple Action Blue Pill) */}
        <Link
          href="/admin/articles/new"
          className="flex items-center justify-center w-12 h-12 -mt-5 bg-[#0071e3] text-white rounded-full shadow-[0_4px_16px_rgba(0,113,227,0.4)] hover:bg-[#0077ed] active:scale-95 transition-all"
          title="Write Story"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
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
          <ImageIcon className="w-5 h-5" />
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
          <BarChart3 className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Analytics</span>
        </Link>
      </nav>
    </div>
  )
}
