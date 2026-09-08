'use client'

import { useEffect, useState } from 'react'

export default function ThemeToggle({ className }: { className?: string }) {
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('theme')
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      const activeDark = savedTheme === 'dark' || (!savedTheme && systemDark)
      setIsDark(activeDark)
      if (activeDark) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    } catch (e) {
      console.error(e)
    }
    setMounted(true)
  }, [])

  const toggle = () => {
    const next = !isDark
    setIsDark(next)
    try {
      if (next) {
        document.documentElement.classList.add('dark')
        localStorage.setItem('theme', 'dark')
      } else {
        document.documentElement.classList.remove('dark')
        localStorage.setItem('theme', 'light')
      }
    } catch (e) {
      console.error(e)
    }
  }

  if (!mounted) {
    return (
      <button
        type="button"
        tabIndex={-1}
        suppressHydrationWarning
        className={
          className ||
          'inline-flex items-center justify-center w-6 h-6 md:w-7 md:h-7 text-ink-mute hover:text-accent dark:hover:text-dark-accent transition-colors cursor-pointer'
        }
        title="Toggle theme"
        aria-label="Toggle theme"
      >
        <svg
          viewBox="0 0 24 24"
          width="15"
          height="15"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={toggle}
      suppressHydrationWarning
      className={
        className ||
        'inline-flex items-center justify-center w-6 h-6 md:w-7 md:h-7 text-ink-mute hover:text-accent dark:hover:text-dark-accent transition-colors cursor-pointer'
      }
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        // Sun icon for dark mode
        <svg
          viewBox="0 0 24 24"
          width="15"
          height="15"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ) : (
        // Moon icon for light mode
        <svg
          viewBox="0 0 24 24"
          width="15"
          height="15"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )}
    </button>
  )
}
