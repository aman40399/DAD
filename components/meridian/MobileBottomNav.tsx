'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavItem {
  label: string
  href: string
  icon: (active: boolean) => React.ReactNode
}

export default function MobileBottomNav() {
  const pathname = usePathname()

  // Do not render bottom nav on admin routes
  if (!pathname || pathname.startsWith('/admin')) {
    return null
  }

  const items: NavItem[] = [
    {
      label: 'Home',
      href: '/',
      icon: (active) => (
        <svg
          className="w-5 h-5 transition-transform group-hover:scale-110"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={active ? '2.3' : '1.8'}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
          <path d="M18 14h-8" />
          <path d="M15 18h-5" />
          <path d="M10 6h8v4h-8V6Z" />
        </svg>
      ),
    },
    {
      label: 'World',
      href: '/section/world',
      icon: (active) => (
        <svg
          className="w-5 h-5 transition-transform group-hover:scale-110"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={active ? '2.3' : '1.8'}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      ),
    },
    {
      label: 'Politics',
      href: '/section/politics',
      icon: (active) => (
        <svg
          className="w-5 h-5 transition-transform group-hover:scale-110"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={active ? '2.3' : '1.8'}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M2 20h20" />
          <path d="M4 20v-7" />
          <path d="M10 20v-7" />
          <path d="M14 20v-7" />
          <path d="M20 20v-7" />
          <path d="m2 10 10-6 10 6" />
          <path d="M12 4v-2" />
        </svg>
      ),
    },
    {
      label: 'Tech',
      href: '/section/technology',
      icon: (active) => (
        <svg
          className="w-5 h-5 transition-transform group-hover:scale-110"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={active ? '2.3' : '1.8'}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <rect x="9" y="9" width="6" height="6" />
          <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3" />
        </svg>
      ),
    },
    {
      label: 'Sports',
      href: '/section/sports',
      icon: (active) => (
        <svg
          className="w-5 h-5 transition-transform group-hover:scale-110"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={active ? '2.3' : '1.8'}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
          <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
          <path d="M4 22h16" />
          <path d="M10 14.66V17c0 .55-.45 1-1 1H8c-.55 0-1 .45-1 1v1c0 .55.45 1 1 1h8c.55 0 1-.45 1-1v-1c0-.55-.45-1-1-1h-1c-.55 0-1-.45-1-1v-2.34" />
          <path d="M18 4H6v5a6 6 0 0 0 12 0V4Z" />
        </svg>
      ),
    },
  ]

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-paper dark:bg-[#0c0c0e] border-t border-rule/70 dark:border-white/10 pb-[max(0.4rem,env(safe-area-inset-bottom))] shadow-[0_-4px_20px_rgba(0,0,0,0.08)] select-none"
    >
      <div className="grid grid-cols-5 h-14 items-center">
        {items.map((item) => {
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname === item.href || pathname.startsWith(`${item.href}/`)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex flex-col items-center justify-center h-full py-1 text-center transition-colors relative ${
                isActive
                  ? 'text-accent dark:text-amber-400 font-semibold'
                  : 'text-ink-mute dark:text-zinc-400 hover:text-ink dark:hover:text-zinc-200 font-medium'
              }`}
            >
              {/* Active top glow indicator */}
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-accent dark:bg-amber-400 rounded-full" />
              )}
              <div className="flex items-center justify-center">
                {item.icon(isActive)}
              </div>
              <span className="text-[10px] tracking-tight mt-0.5 leading-none font-sans">
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
