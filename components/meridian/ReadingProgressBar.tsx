'use client'

import { useState, useEffect } from 'react'

export default function ReadingProgressBar() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const article = document.querySelector('article')
      if (!article) {
        // Fallback to total document scroll
        const total = document.documentElement.scrollHeight - window.innerHeight
        if (total > 0) {
          const current = (window.scrollY / total) * 100
          setProgress(Math.min(100, Math.max(0, current)))
        } else {
          setProgress(0)
        }
        return
      }

      const rect = article.getBoundingClientRect()
      const articleTop = rect.top + window.scrollY
      const articleHeight = rect.height
      const currentScroll = window.scrollY - articleTop
      const scrollableDistance = articleHeight - window.innerHeight

      if (currentScroll <= 0) {
        setProgress(0)
      } else if (scrollableDistance <= 0 || currentScroll >= scrollableDistance) {
        setProgress(100)
      } else {
        const pct = (currentScroll / scrollableDistance) * 100
        setProgress(Math.min(100, Math.max(0, pct)))
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div
      className="fixed top-0 left-0 right-0 h-[2.5px] sm:h-[3px] bg-transparent z-50 pointer-events-none select-none"
      aria-hidden="true"
    >
      <div
        className="h-full bg-accent shadow-xs"
        style={{
          transform: `scaleX(${progress / 100})`,
          transformOrigin: 'left',
          transition: 'transform 75ms ease-out',
        }}
      />
    </div>
  )
}
