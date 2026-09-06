'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [loginMenuOpen, setLoginMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()
  
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false)
      setSearchQuery('')
    }
  }

  const navLinks = [
    { name: 'World', href: '/section/world' },
    { name: 'U.S.', href: '/section/us' },
    { name: 'Politics', href: '/section/politics' },
    { name: 'Business', href: '/section/business' },
    { name: 'Technology', href: '/section/technology' },
    { name: 'Sports', href: '/section/sports' },
    { name: 'Arts', href: '/section/arts' },
    { name: 'Opinion', href: '/section/opinion' },
    { name: 'About', href: '/about' },
  ]

  return (
    <header className="w-full bg-white dark:bg-neutral-900 sticky top-0 z-50 border-b-2 border-neutral-900 dark:border-neutral-100">
      {/* Top Utility Bar */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <span className="text-neutral-600 dark:text-neutral-400 font-serif">{currentDate}</span>
            <span className="hidden md:inline text-neutral-400 dark:text-neutral-600">|</span>
            <span className="hidden md:inline text-neutral-600 dark:text-neutral-400 font-serif">Today's Paper</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 font-semibold tracking-wide transition-colors">
              SUBSCRIBE
            </button>
            <span className="text-neutral-400 dark:text-neutral-600">|</span>
            <button 
              onClick={() => setLoginMenuOpen(!loginMenuOpen)}
              className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 font-semibold tracking-wide transition-colors relative"
            >
              LOG IN
            </button>
            
            {/* Login Dropdown */}
            {loginMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setLoginMenuOpen(false)} />
                <div className="absolute right-4 top-8 mt-2 w-48 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-sm shadow-lg z-50">
                  <div className="py-1">
                    <button className="w-full text-left px-4 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors">
                      User Login
                    </button>
                    <Link href="/admin" onClick={() => setLoginMenuOpen(false)} className="block w-full text-left px-4 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors">
                      Admin Login
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 sm:gap-3">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 sm:p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors lg:hidden"
              aria-label="Menu"
            >
              <span className="material-symbols-outlined text-neutral-900 dark:text-neutral-50 text-xl sm:text-2xl">
                {mobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
            <button 
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-1.5 sm:p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors"
              aria-label="Search"
            >
              <span className="material-symbols-outlined text-neutral-900 dark:text-neutral-50 text-xl sm:text-2xl">
                search
              </span>
            </button>
          </div>

          {/* Center Branding */}
          <Link href="/" className="flex items-center gap-2 sm:gap-4 hover:opacity-90 transition-opacity">
            <Image 
              src="/LOGO.png" 
              alt="Chhkwa Logo" 
              width={80} 
              height={80}
              className="object-contain w-[50px] h-[50px] sm:w-[60px] sm:h-[60px] md:w-[80px] md:h-[80px]"
              priority
              quality={90}
            />
            <div className="text-center">
              <h1 className="text-neutral-900 dark:text-neutral-50 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold tracking-tight">
                Chhkwa
              </h1>
              <p className="text-[10px] sm:text-xs text-neutral-500 dark:text-neutral-400 tracking-widest uppercase mt-0.5 sm:mt-1 hidden sm:block">
                News & Insights
              </p>
            </div>
          </Link>

          {/* Right Side - Spacer for balance */}
          <div className="w-16 sm:w-20 md:w-24"></div>
        </div>
      </div>

      {/* Search Bar */}
      {searchOpen && (
        <div className="border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 py-3 sm:py-4">
          <div className="max-w-7xl mx-auto px-3 sm:px-4">
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-neutral-300 dark:border-neutral-600 rounded-sm bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100 font-serif"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-4 sm:px-6 py-2.5 sm:py-3 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-sm sm:text-base font-semibold rounded-sm hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors tracking-wide whitespace-nowrap"
                >
                  Search
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Desktop Navigation */}
      <nav className="border-t border-neutral-200 dark:border-neutral-800 hidden lg:block bg-white dark:bg-neutral-900">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-center gap-8 py-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-neutral-900 dark:text-neutral-300 text-xs font-bold leading-normal font-sans hover:text-neutral-600 dark:hover:text-neutral-100 uppercase tracking-widest transition-colors relative group"
              >
                {link.name}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-neutral-900 dark:bg-neutral-100 group-hover:w-full transition-all duration-300"></span>
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <nav className="lg:hidden border-b border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 max-h-[70vh] overflow-y-auto">
          <div className="flex flex-col">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-4 text-neutral-900 dark:text-neutral-300 text-base font-semibold font-sans hover:bg-neutral-100 dark:hover:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 transition-colors active:bg-neutral-200 dark:active:bg-neutral-700"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  )
}
