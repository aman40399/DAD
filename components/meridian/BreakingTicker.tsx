'use client'

import { useState, useEffect } from 'react'

interface TickerItem {
  id: string
  title: string
  url?: string
}

interface BreakingTickerProps {
  items?: TickerItem[]
}

const DEFAULT_ITEMS: TickerItem[] = [
  { id: '1', title: 'Putin Holds "Substantive" Talks With U.S. Envoys as Ukraine Signals Willingness to Pause Strikes on Moscow', url: '/article/putin-talks-us-envoys-ukraine-pause-strikes' },
  { id: '2', title: "Mount Anak Krakatau Erupts, Forcing Closure of Jakarta's Main Airport and Disrupting Dozens of Flights", url: '/article/mount-anak-krakatau-erupts-jakarta-airport-closed' },
  { id: '3', title: 'U.S. Navy Destroys Three Iranian Oil Tankers in Escalating Gulf Confrontation', url: '/article/us-navy-destroys-iranian-oil-tankers-gulf' },
  { id: '4', title: 'South Korea Hits Record $709 Billion in Cumulative Exports, Surpassing Annual Best', url: '/article/south-korea-record-exports-709-billion' },
  { id: '5', title: 'Building Collapse in New Delhi Kills One, Dozens Feared Trapped Under Rubble', url: '/article/building-collapse-new-delhi-dozens-trapped' },
]

type SpeedMode = 'slow' | 'normal' | 'fast'

const SPEED_CONFIG: Record<SpeedMode, { duration: number; label: string; badge: string; next: SpeedMode }> = {
  normal: { duration: 28, label: '1x Normal', badge: '1x', next: 'fast' },
  fast: { duration: 16, label: '1.5x Fast', badge: '1.5x', next: 'slow' },
  slow: { duration: 46, label: '0.7x Slow', badge: '0.7x', next: 'normal' },
}

export default function BreakingTicker({ items = DEFAULT_ITEMS }: BreakingTickerProps) {
  const [isPlaying, setIsPlaying] = useState(true)
  const [isHovered, setIsHovered] = useState(false)
  const [speed, setSpeed] = useState<SpeedMode>('normal')
  const [isPinned, setIsPinned] = useState(false)

  const currentDuration = SPEED_CONFIG[speed].duration
  const effectivePlaying = isPlaying && !isHovered

  const cycleSpeed = () => {
    setSpeed((prev) => SPEED_CONFIG[prev].next)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      setIsPlaying((prev) => !prev)
    }
  }

  return (
    <section
      className={`breaking-ticker w-full bg-[#f5f3ec] dark:bg-[#0c0c0b] text-ink dark:text-white hidden md:flex items-stretch select-none border-b border-rule dark:border-white/10 z-40 transition-colors duration-200 ${
        isPinned ? 'sticky top-0 shadow-md' : 'relative'
      }`}
      aria-label="Breaking news ticker"
    >
      {/* Live Badge & Pulsating Status Indicator */}
      <div
        className="px-3 md:px-3.5 bg-accent text-white flex items-center gap-2 shrink-0 transition-colors duration-200"
        title={effectivePlaying ? 'Live Dispatch Stream Active' : 'Dispatch Stream Paused'}
      >
        <span
          className={`w-2 h-2 rounded-full transition-all duration-300 ${
            effectivePlaying ? 'bg-emerald-300 dark:bg-emerald-400 animate-pulse' : 'bg-amber-300 dark:bg-amber-400'
          }`}
          aria-hidden="true"
        />
        <span className="font-mono uppercase tracking-[0.14em] text-[10px] md:text-[11px] font-bold text-white">
          Breaking
        </span>
      </div>

      {/* Marquee Viewport with Auto-pause on hover */}
      <div
        className="flex-1 overflow-hidden relative h-7 md:h-8 flex items-center"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          className="ticker-track flex items-center text-[11px] md:text-[12.5px] whitespace-nowrap"
          style={{
            animationDuration: `${currentDuration}s`,
            animationPlayState: effectivePlaying ? 'running' : 'paused',
          }}
        >
          {/* Set 1 */}
          <div className="flex items-center shrink-0">
            {items.map((item, idx) => (
              <span key={`a-${item.id}-${idx}`} className="inline-flex items-center">
                <a
                  href={item.url || '#'}
                  className="hover:underline underline-offset-2 text-ink/90 hover:text-ink dark:text-white/90 dark:hover:text-white transition-colors"
                >
                  {item.title}
                </a>
                <span className="mx-6 text-accent dark:text-dark-accent" aria-hidden="true">
                  ●
                </span>
              </span>
            ))}
          </div>
          {/* Set 2 for seamless infinite marquee loop */}
          <div className="flex items-center shrink-0" aria-hidden="true">
            {items.map((item, idx) => (
              <span key={`b-${item.id}-${idx}`} className="inline-flex items-center">
                <a
                  href={item.url || '#'}
                  tabIndex={-1}
                  className="hover:underline underline-offset-2 text-ink/90 hover:text-ink dark:text-white/90 dark:hover:text-white transition-colors"
                >
                  {item.title}
                </a>
                <span className="mx-6 text-accent dark:text-dark-accent" aria-hidden="true">
                  ●
                </span>
              </span>
            ))}
          </div>
        </div>

        {/* Soft edge gradient fades */}
        <div className="absolute inset-y-0 right-0 w-8 md:w-12 bg-gradient-to-l from-[#f5f3ec] dark:from-[#0c0c0b] to-transparent pointer-events-none" />
      </div>

      {/* Micro-Interaction Controls Strip */}
      <div className="flex items-center shrink-0 border-l border-rule dark:border-white/15">
        {/* Dynamic Rotation Speed Selector */}
        <button
          type="button"
          onClick={cycleSpeed}
          className="px-2.5 h-full flex items-center gap-1 text-[10px] font-mono text-ink/70 hover:text-ink hover:bg-black/5 dark:text-white/70 dark:hover:text-white dark:hover:bg-white/5 transition-colors cursor-pointer border-r border-rule dark:border-white/15"
          title={`Cycle ticker speed (current: ${SPEED_CONFIG[speed].label})`}
          aria-label={`Current speed: ${SPEED_CONFIG[speed].label}. Click to cycle`}
        >
          <span className="opacity-60 text-[9px]">⚡</span>
          <span className="font-bold">{SPEED_CONFIG[speed].badge}</span>
        </button>

        {/* Explicit Pause/Play Toggle Button */}
        <button
          type="button"
          onClick={() => setIsPlaying(!isPlaying)}
          onKeyDown={handleKeyDown}
          className="w-8 h-full flex items-center justify-center text-ink/70 hover:text-ink hover:bg-black/5 dark:text-white/70 dark:hover:text-white dark:hover:bg-white/5 transition-colors cursor-pointer"
          title={isPlaying ? 'Pause ticker (Space)' : 'Play ticker (Space)'}
          aria-label={isPlaying ? 'Pause breaking news ticker' : 'Play breaking news ticker'}
        >
          {isPlaying ? (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
              <rect x="2" y="1.5" width="3" height="9" rx="0.5" />
              <rect x="7" y="1.5" width="3" height="9" rx="0.5" />
            </svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
              <path d="M3 1.5v9l7-4.5z" />
            </svg>
          )}
        </button>

        {/* Pin to Top Toggle Button */}
        <button
          type="button"
          onClick={() => setIsPinned(!isPinned)}
          className={`w-8 h-full flex items-center justify-center border-l border-rule dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer ${
            isPinned ? 'text-accent dark:text-dark-accent' : 'text-ink/70 hover:text-ink dark:text-white/70 dark:hover:text-white'
          }`}
          title={isPinned ? 'Unpin ticker' : 'Pin ticker to top of screen'}
          aria-label={isPinned ? 'Unpin ticker' : 'Pin ticker to top'}
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
            <path d="M9.828.722a.5.5 0 0 1 .354.146l4.95 4.95a.5.5 0 0 1 0 .707c-.48.48-1.072.588-1.503.588-.177 0-.335-.018-.46-.039l-3.134 3.134a6 6 0 0 1 .16 1.013c.046.702-.032 1.687-.72 2.375a.5.5 0 0 1-.707 0l-2.829-2.828-3.182 3.182c-.195.195-1.219.902-1.414.707s.512-1.22.707-1.414l3.182-3.182-2.828-2.829a.5.5 0 0 1 0-.707c.688-.688 1.673-.767 2.375-.72a6 6 0 0 1 1.013.16l3.134-3.133a3 3 0 0 1-.04-.461c0-.43.108-1.022.589-1.503a.5.5 0 0 1 .353-.146z" />
          </svg>
        </button>

        {/* Live Stream Status Indicator */}
        <div className="hidden md:flex px-3 items-center gap-1.5 font-mono uppercase tracking-[0.14em] text-ink/80 dark:text-white/80 border-l border-rule dark:border-white/15 text-[10.5px]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400 animate-pulse" />
          <span>LIVE DISPATCH</span>
        </div>
      </div>
    </section>
  )
}
