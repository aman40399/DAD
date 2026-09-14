'use client'

import { useState, useEffect } from 'react'

export interface StockQuote {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  currency: string
  isIndex?: boolean
}

const DEFAULT_STOCKS: StockQuote[] = [
  { symbol: 'NIFTY 50', name: 'NIFTY 50', price: 24852.15, change: 142.30, changePercent: 0.58, currency: '', isIndex: true },
  { symbol: 'SENSEX', name: 'BSE SENSEX', price: 81332.72, change: 480.20, changePercent: 0.59, currency: '', isIndex: true },
  { symbol: 'BANK NIFTY', name: 'NIFTY BANK', price: 51210.40, change: 215.10, changePercent: 0.42, currency: '', isIndex: true },
  { symbol: 'RELIANCE', name: 'Reliance Industries', price: 2984.50, change: 18.20, changePercent: 0.61, currency: '₹' },
  { symbol: 'TCS', name: 'Tata Consultancy Services', price: 4420.00, change: -12.40, changePercent: -0.28, currency: '₹' },
  { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', price: 1648.75, change: 8.90, changePercent: 0.54, currency: '₹' },
  { symbol: 'INFY', name: 'Infosys Ltd', price: 1872.30, change: 22.10, changePercent: 1.19, currency: '₹' },
  { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd', price: 1218.40, change: 6.80, changePercent: 0.56, currency: '₹' },
  { symbol: 'BHARTIARTL', name: 'Bharti Airtel Ltd', price: 1560.10, change: 14.50, changePercent: 0.94, currency: '₹' },
  { symbol: 'SBIN', name: 'State Bank of India', price: 824.60, change: -3.20, changePercent: -0.39, currency: '₹' },
  { symbol: 'ITC', name: 'ITC Limited', price: 504.25, change: 2.10, changePercent: 0.42, currency: '₹' },
  { symbol: 'LT', name: 'Larsen & Toubro Ltd', price: 3680.00, change: 35.40, changePercent: 0.97, currency: '₹' },
  { symbol: 'TATAMOTORS', name: 'Tata Motors Ltd', price: 1042.80, change: 11.30, changePercent: 1.10, currency: '₹' },
  { symbol: 'HINDUNILVR', name: 'Hindustan Unilever Ltd', price: 2790.00, change: -8.50, changePercent: -0.30, currency: '₹' },
  { symbol: 'MARUTI', name: 'Maruti Suzuki India', price: 12450.00, change: 120.00, changePercent: 0.97, currency: '₹' },
]

type SpeedMode = 'slow' | 'normal' | 'fast'

const SPEED_CONFIG: Record<SpeedMode, { duration: number; label: string; badge: string; next: SpeedMode }> = {
  normal: { duration: 32, label: '1x Normal', badge: '1x', next: 'fast' },
  fast: { duration: 18, label: '1.5x Fast', badge: '1.5x', next: 'slow' },
  slow: { duration: 52, label: '0.7x Slow', badge: '0.7x', next: 'normal' },
}

export default function StockTicker() {
  const [stocks, setStocks] = useState<StockQuote[]>(DEFAULT_STOCKS)
  const [isPlaying, setIsPlaying] = useState(true)
  const [isHovered, setIsHovered] = useState(false)
  const [speed, setSpeed] = useState<SpeedMode>('normal')
  const [lastUpdated, setLastUpdated] = useState<string>('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const fetchStocks = async () => {
      try {
        const res = await fetch('/api/stocks/live')
        if (res.ok) {
          const data = await res.json()
          if (data.stocks && Array.isArray(data.stocks)) {
            setStocks(data.stocks)
            setLastUpdated(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false }))
          }
        }
      } catch {
        // graceful fallback to current state
      }
    }

    fetchStocks()
    const interval = setInterval(fetchStocks, 25000)
    return () => clearInterval(interval)
  }, [])

  const currentDuration = SPEED_CONFIG[speed].duration
  const effectivePlaying = isPlaying && !isHovered

  const cycleSpeed = () => {
    setSpeed((prev) => SPEED_CONFIG[prev].next)
  }

  const formatPrice = (val: number, isIndex?: boolean, currency?: string) => {
    const formatted = val.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
    return isIndex ? formatted : `${currency || '₹'}${formatted}`
  }

  return (
    <section
      data-nosnippet
      className="w-full bg-[#ebe7de] dark:bg-[#0a0a09] text-ink/90 dark:text-white/90 border-b border-rule dark:border-white/10 hidden md:flex items-stretch select-none text-[11px] font-sans z-30 transition-colors duration-200"
      aria-label="Live Indian Stock Market Watch"
    >
      {/* Exchange Badge */}
      <div
        className="px-3 md:px-3.5 bg-[#ded9cc] dark:bg-[#1f1d19] border-r border-rule dark:border-white/10 flex items-center gap-2 shrink-0 transition-colors"
        title="Live Indian Financial Markets (NSE & BSE)"
      >
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            effectivePlaying ? 'bg-emerald-600 dark:bg-emerald-400 animate-pulse' : 'bg-amber-600 dark:bg-amber-400'
          }`}
          aria-hidden="true"
        />
        <span className="font-mono uppercase tracking-[0.14em] text-[9.5px] md:text-[10px] font-bold text-accent dark:text-dark-accent">
          Markets
        </span>
        <span className="hidden sm:inline text-[9px] font-mono text-ink/50 dark:text-white/50 tracking-wider">
          NSE·BSE
        </span>
      </div>

      {/* Marquee Track with Auto-pause on hover */}
      <div
        className="flex-1 overflow-hidden relative h-7 md:h-7.5 flex items-center"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          className="ticker-track flex items-center text-[10.5px] md:text-[11.5px] whitespace-nowrap"
          style={{
            animationDuration: `${currentDuration}s`,
            animationPlayState: effectivePlaying ? 'running' : 'paused',
          }}
        >
          {/* Set 1 */}
          <div className="flex items-center shrink-0">
            {stocks.map((stock, idx) => {
              const isPositive = stock.change >= 0
              return (
                <div key={`s1-${stock.symbol}-${idx}`} className="inline-flex items-center mx-3 sm:mx-4">
                  <span className="font-semibold text-ink dark:text-white/95 mr-1.5 tracking-tight">
                    {stock.symbol}
                  </span>
                  <span className="font-mono text-ink/80 dark:text-white/80 mr-1.5 text-[10.5px]">
                    {formatPrice(stock.price, stock.isIndex, stock.currency)}
                  </span>
                  <span
                    className={`inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-xs font-mono text-[9.5px] font-bold ${
                      isPositive
                        ? 'text-emerald-700 bg-emerald-100/90 border border-emerald-300 dark:text-emerald-400 dark:bg-emerald-950/60 dark:border-emerald-800/40'
                        : 'text-rose-700 bg-rose-100/90 border border-rose-300 dark:text-rose-400 dark:bg-rose-950/60 dark:border-rose-800/40'
                    }`}
                  >
                    <span>{isPositive ? '▲' : '▼'}</span>
                    <span>
                      {isPositive ? '+' : ''}
                      {stock.changePercent.toFixed(2)}%
                    </span>
                  </span>
                  <span className="mx-3 text-ink/20 dark:text-white/20" aria-hidden="true">
                    |
                  </span>
                </div>
              )
            })}
          </div>

          {/* Set 2 for seamless infinite marquee loop */}
          <div className="flex items-center shrink-0" aria-hidden="true">
            {stocks.map((stock, idx) => {
              const isPositive = stock.change >= 0
              return (
                <div key={`s2-${stock.symbol}-${idx}`} className="inline-flex items-center mx-3 sm:mx-4">
                  <span className="font-semibold text-ink dark:text-white/95 mr-1.5 tracking-tight">
                    {stock.symbol}
                  </span>
                  <span className="font-mono text-ink/80 dark:text-white/80 mr-1.5 text-[10.5px]">
                    {formatPrice(stock.price, stock.isIndex, stock.currency)}
                  </span>
                  <span
                    className={`inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-xs font-mono text-[9.5px] font-bold ${
                      isPositive
                        ? 'text-emerald-700 bg-emerald-100/90 border border-emerald-300 dark:text-emerald-400 dark:bg-emerald-950/60 dark:border-emerald-800/40'
                        : 'text-rose-700 bg-rose-100/90 border border-rose-300 dark:text-rose-400 dark:bg-rose-950/60 dark:border-rose-800/40'
                    }`}
                  >
                    <span>{isPositive ? '▲' : '▼'}</span>
                    <span>
                      {isPositive ? '+' : ''}
                      {stock.changePercent.toFixed(2)}%
                    </span>
                  </span>
                  <span className="mx-3 text-ink/20 dark:text-white/20" aria-hidden="true">
                    |
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Soft edge gradient fades */}
        <div className="absolute inset-y-0 right-0 w-8 md:w-12 bg-gradient-to-l from-[#ebe7de] dark:from-[#0a0a09] to-transparent pointer-events-none" />
      </div>

      {/* Control Actions */}
      <div className="flex items-center shrink-0 border-l border-rule dark:border-white/10">
        {/* Speed toggle */}
        <button
          type="button"
          onClick={cycleSpeed}
          className="px-2 h-full flex items-center gap-1 text-[9.5px] font-mono text-ink/60 hover:text-ink hover:bg-black/5 dark:text-white/60 dark:hover:text-white dark:hover:bg-white/5 transition-colors cursor-pointer border-r border-rule dark:border-white/10"
          title={`Cycle stock ticker speed (${SPEED_CONFIG[speed].label})`}
          aria-label={`Current stock speed: ${SPEED_CONFIG[speed].label}`}
        >
          <span className="opacity-60 text-[9px]">⚡</span>
          <span className="font-bold">{SPEED_CONFIG[speed].badge}</span>
        </button>

        {/* Pause/Play toggle */}
        <button
          type="button"
          onClick={() => setIsPlaying(!isPlaying)}
          className="w-7 h-full flex items-center justify-center text-ink/60 hover:text-ink hover:bg-black/5 dark:text-white/60 dark:hover:text-white dark:hover:bg-white/5 transition-colors cursor-pointer"
          title={isPlaying ? 'Pause market ticker' : 'Play market ticker'}
          aria-label={isPlaying ? 'Pause market ticker' : 'Play market ticker'}
        >
          {isPlaying ? (
            <svg width="10" height="10" viewBox="0 0 12 12" fill="currentColor">
              <rect x="2" y="1.5" width="3" height="9" rx="0.5" />
              <rect x="7" y="1.5" width="3" height="9" rx="0.5" />
            </svg>
          ) : (
            <svg width="10" height="10" viewBox="0 0 12 12" fill="currentColor">
              <path d="M3 1.5v9l7-4.5z" />
            </svg>
          )}
        </button>

        {/* Market Status */}
        <div className="hidden lg:flex px-2.5 items-center gap-1.5 text-[9.5px] font-mono text-ink/60 dark:text-white/50 border-l border-rule dark:border-white/10">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>NSE·BSE LIVE</span>
        </div>
      </div>
    </section>
  )
}
