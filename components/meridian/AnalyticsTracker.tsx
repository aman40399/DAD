'use client'

import { useEffect, useRef, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import type { CollectTelemetryInput } from '@/types'

export interface TelemetryPayload extends CollectTelemetryInput {
  language?: string
}

function sendBeaconEvent(payload: Record<string, any>): void {
  try {
    if (typeof window === 'undefined') return

    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' })
      const ok = navigator.sendBeacon('/api/analytics/collect', blob)
      if (ok) return
    }

    fetch('/api/analytics/collect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {})
  } catch {
    // Non-fatal telemetry catch
  }
}

export function useAnalytics() {
  const track = useCallback((extra: Partial<TelemetryPayload> = {}) => {
    if (typeof window === 'undefined') return
    const path = window.location.pathname
    if (path.startsWith('/admin')) return

    let sessionId: string | undefined
    try {
      sessionId = sessionStorage.getItem('__m_sess_id') || undefined
    } catch {}

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const language = navigator.language

    sendBeaconEvent({
      path,
      sessionId,
      timezone,
      language,
      locale: language,
      referrer: document.referrer || '',
      ...extra,
    })
  }, [])

  return { track }
}

export default function AnalyticsTracker() {
  const pathname = usePathname()
  const lastTrackedPath = useRef<string>('')
  const articleStartTime = useRef<number>(0)
  const durationSentRef = useRef<boolean>(false)

  // 1. Route Change & Pageview Telemetry
  useEffect(() => {
    if (!pathname || pathname.startsWith('/admin')) return

    // Suppress React 18 Strict Mode double-firing
    if (lastTrackedPath.current === pathname) return
    lastTrackedPath.current = pathname

    let sessionId = ''
    try {
      const stored = sessionStorage.getItem('__m_sess_id')
      if (stored) {
        sessionId = stored
      } else {
        sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
        sessionStorage.setItem('__m_sess_id', sessionId)
      }
    } catch {
      sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    }

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const language = navigator.language
    const isArticle = pathname.startsWith('/article/')
    const slug = isArticle ? pathname.replace(/^\/article\//, '').split(/[?#]/)[0] : undefined
    const title = typeof document !== 'undefined' ? document.title.replace(/ — (Singh Monster|The Meridiān).*$/, '') : undefined

    sendBeaconEvent({
      path: pathname,
      slug,
      title,
      sessionId,
      timezone,
      language,
      locale: language,
      referrer: typeof document !== 'undefined' ? document.referrer : '',
    })
  }, [pathname])

  // 2. Active Reading Attention Telemetry on /article/[slug]
  useEffect(() => {
    if (!pathname || !pathname.startsWith('/article/')) {
      return
    }

    articleStartTime.current = Date.now()
    durationSentRef.current = false

    const slug = pathname.replace(/^\/article\//, '').split(/[?#]/)[0]
    const title = typeof document !== 'undefined' ? document.title.replace(/ — (Singh Monster|The Meridiān).*$/, '') : undefined

    const flushDuration = () => {
      if (durationSentRef.current || articleStartTime.current === 0) return

      const durationSeconds = Math.round((Date.now() - articleStartTime.current) / 1000)
      // Discard bounces under 3s or inactive tabs over 30 mins (1800s)
      if (durationSeconds >= 3 && durationSeconds <= 1800) {
        durationSentRef.current = true

        let sessionId: string | undefined
        try {
          sessionId = sessionStorage.getItem('__m_sess_id') || undefined
        } catch {}

        sendBeaconEvent({
          path: pathname,
          slug,
          title,
          sessionId,
          durationSeconds,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          language: navigator.language,
          locale: navigator.language,
        })
      }
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        flushDuration()
      } else if (document.visibilityState === 'visible') {
        // Reset timer if reader returns to article
        articleStartTime.current = Date.now()
        durationSentRef.current = false
      }
    }

    const handlePageHide = () => {
      flushDuration()
    }

    window.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('pagehide', handlePageHide)
    window.addEventListener('beforeunload', handlePageHide)

    return () => {
      flushDuration()
      window.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('pagehide', handlePageHide)
      window.removeEventListener('beforeunload', handlePageHide)
    }
  }, [pathname])

  return null
}

