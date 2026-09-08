'use client'

import React, { useEffect, useRef } from 'react'

interface SponsorBoxProps {
  /** Google AdSense Publisher ID (e.g., "ca-pub-1234567890123456") */
  adClient?: string
  /** Google AdSense Ad Slot ID (e.g., "1234567890") */
  adSlot?: string
  /** Ad format (default: "auto") */
  adFormat?: string
  /** Custom class names */
  className?: string
  /** Optional custom ad markup, banner, or embed script */
  children?: React.ReactNode
}

export default function SponsorBox({
  adClient,
  adSlot,
  adFormat = 'auto',
  className = '',
  children,
}: SponsorBoxProps) {
  const adRef = useRef<HTMLModElement>(null)
  const isLoadedRef = useRef(false)

  // Initialize Google AdSense when adClient and adSlot are provided
  useEffect(() => {
    if (!adClient || !adSlot || isLoadedRef.current) return

    try {
      if (typeof window !== 'undefined') {
        const adsbygoogle = (window as any).adsbygoogle || []
        adsbygoogle.push({})
        isLoadedRef.current = true
      }
    } catch (err) {
      console.warn('Google AdSense notice:', err)
    }
  }, [adClient, adSlot])

  if (children) {
    return (
      <div
        className={`w-full rounded-2xl border border-rule dark:border-white/10 bg-paper-subtle/50 dark:bg-white/[0.02] p-4 flex items-center justify-center overflow-hidden ${className}`}
      >
        {children}
      </div>
    )
  }

  if (adClient && adSlot) {
    return (
      <div
        className={`w-full rounded-2xl border border-rule dark:border-white/10 bg-paper-subtle/50 dark:bg-white/[0.02] p-4 flex items-center justify-center overflow-hidden ${className}`}
      >
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={{ display: 'block', minWidth: '250px', minHeight: '250px' }}
          data-ad-client={adClient}
          data-ad-slot={adSlot}
          data-ad-format={adFormat}
          data-full-width-responsive="true"
        />
      </div>
    )
  }

  return (
    <div
      className={`w-full h-64 rounded-2xl border border-rule/70 dark:border-white/10 bg-paper-subtle/40 dark:bg-white/[0.02] flex items-center justify-center select-none ${className}`}
      aria-label="Advertisement Space"
    >
      <span className="font-mono text-xs font-bold tracking-[0.25em] text-ink-mute/50 dark:text-dark-mute/50 uppercase">
        AD
      </span>
      {/* Ready for Google AdSense script integration */}
      <ins
        className="adsbygoogle hidden"
        style={{ display: 'none' }}
        data-ad-client={adClient || ''}
        data-ad-slot={adSlot || ''}
      />
    </div>
  )
}
