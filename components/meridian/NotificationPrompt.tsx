'use client'

import React, { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { VAPID_PUBLIC_KEY, urlBase64ToUint8Array } from '@/lib/pushConfig'

export default function NotificationPrompt() {
  const pathname = usePathname()
  const [isVisible, setIsVisible] = useState(false)
  const [isSubscribing, setIsSubscribing] = useState(false)
  const [subscribed, setSubscribed] = useState(false)
  const [permissionDenied, setPermissionDenied] = useState(false)
  const [secondsRemaining, setSecondsRemaining] = useState(5)

  const autoDismissTimerRef = useRef<NodeJS.Timeout | null>(null)
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Only execute on browser client
    if (typeof window === 'undefined') return
    if (pathname?.startsWith('/admin')) return
    if (!('Notification' in window) || !('serviceWorker' in navigator)) return

    // If user already granted permission, ensure service worker is active silently
    if (Notification.permission === 'granted') {
      ensureServiceWorkerRegistration()
      return
    }

    // If user permanently denied, don't show popup
    if (Notification.permission === 'denied') {
      return
    }

    // Check localStorage dismissal
    const dismissedUntil = localStorage.getItem('sm_notification_dismissed_until')
    if (dismissedUntil && Date.now() < Number(dismissedUntil)) {
      return
    }

    // Delay initial appearance slightly (2.5s) so page loads cleanly
    const showTimer = setTimeout(() => {
      setIsVisible(true)
    }, 2500)

    return () => clearTimeout(showTimer)
  }, [pathname])

  // Handle 5-second automatic countdown when popup becomes visible
  useEffect(() => {
    if (!isVisible || isSubscribing || subscribed || permissionDenied) return

    setSecondsRemaining(5)

    // Countdown interval for visual timer display
    countdownIntervalRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    // 5-second auto-remove timer
    autoDismissTimerRef.current = setTimeout(() => {
      handleDismiss()
    }, 5000)

    return () => {
      if (autoDismissTimerRef.current) clearTimeout(autoDismissTimerRef.current)
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current)
    }
  }, [isVisible, isSubscribing, subscribed, permissionDenied])

  const clearTimers = () => {
    if (autoDismissTimerRef.current) {
      clearTimeout(autoDismissTimerRef.current)
      autoDismissTimerRef.current = null
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current)
      countdownIntervalRef.current = null
    }
  }

  const ensureServiceWorkerRegistration = async () => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return null
    try {
      let reg = await navigator.serviceWorker.getRegistration()
      if (!reg) {
        reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' })
      }
      await navigator.serviceWorker.ready
      return reg
    } catch (e) {
      console.warn('Service worker registration failed:', e)
      return null
    }
  }

  // Cross-browser safe permission request (supporting both modern Promise and legacy callback)
  const requestPermissionSafe = async (): Promise<NotificationPermission> => {
    if (typeof window === 'undefined' || !('Notification' in window)) return 'denied'
    try {
      const p = Notification.requestPermission()
      if (p && typeof p.then === 'function') {
        return await p
      }
    } catch {}
    return new Promise((resolve) => {
      Notification.requestPermission((res) => resolve(res))
    })
  }

  const handleSubscribe = async () => {
    clearTimers()
    setIsSubscribing(true)

    try {
      // 1. Request browser notification permission immediately inside direct user tap
      const permission = await requestPermissionSafe()
      if (permission !== 'granted') {
        setPermissionDenied(true)
        setIsSubscribing(false)
        setTimeout(() => setIsVisible(false), 2500)
        return
      }

      // 2. Register / activate service worker
      const reg = await ensureServiceWorkerRegistration()
      if (!reg) throw new Error('Could not register service worker')

      // 3. Subscribe to PushManager with VAPID Key
      let subscription = await reg.pushManager.getSubscription()
      if (!subscription) {
        const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
        subscription = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: applicationServerKey as any,
        })
      }

      // 4. Save subscription to server (persisted in Cloudflare D1)
      const subJson = subscription.toJSON()
      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription: subJson,
          userAgent: navigator.userAgent,
          platform: navigator.platform,
        }),
      })

      // 5. Trigger instant welcoming notification
      if (reg.showNotification) {
        reg.showNotification('Singh Monster Alerts Active', {
          body: 'You are now connected to real-time breaking dispatches from Dhananjay Singh.',
          icon: '/authr.png',
          badge: '/authr.png',
          tag: 'welcome-alert',
        })
      }

      setSubscribed(true)
      setIsSubscribing(false)
      localStorage.setItem('sm_notification_subscribed', 'true')

      // Auto dismiss success card after 2 seconds
      setTimeout(() => {
        setIsVisible(false)
      }, 2000)
    } catch (error) {
      console.error('Error subscribing to push notifications:', error)
      setIsSubscribing(false)
      setIsVisible(false)
    }
  }

  const handleDismiss = () => {
    clearTimers()
    setIsVisible(false)
    // Snooze for 2 days
    localStorage.setItem(
      'sm_notification_dismissed_until',
      String(Date.now() + 2 * 24 * 60 * 60 * 1000)
    )
  }

  if (!isVisible) return null

  return (
    <aside
      role="alert"
      aria-live="polite"
      aria-label="Breaking news alerts notification"
      className="fixed top-3 inset-x-3.5 sm:top-auto sm:bottom-6 sm:right-6 sm:left-auto sm:w-[380px] z-[60] max-w-lg mx-auto animate-in fade-in slide-in-from-top-4 sm:slide-in-from-bottom-4 duration-300 pointer-events-auto select-none"
    >
      <style jsx>{`
        @keyframes shrinkProgress {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
        .animate-progress-5s {
          animation: shrinkProgress 5s linear forwards;
        }
      `}</style>

      {/* Solid Opaque Card (No Transparency, No Blur) */}
      <div className="relative rounded-2xl bg-paper dark:bg-[#161614] border border-rule/80 dark:border-white/15 shadow-[0_16px_40px_rgba(0,0,0,0.18)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.45)] text-ink dark:text-dark-ink overflow-hidden p-3.5 sm:p-4">
        
        {/* Top Upper Edge: Thin Decreasing Progress Bar (5s Timer) */}
        {!subscribed && !permissionDenied && !isSubscribing && (
          <div className="absolute top-0 inset-x-0 h-[2.5px] bg-black/5 dark:bg-white/10 overflow-hidden">
            <div className="h-full bg-accent dark:bg-amber-400 origin-left animate-progress-5s" />
          </div>
        )}

        {subscribed ? (
          <div className="flex items-center gap-3 py-1">
            <div className="w-8 h-8 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm shrink-0 border border-emerald-500/30">
              ✓
            </div>
            <div>
              <h4 className="font-sans font-bold text-xs text-ink dark:text-dark-ink tracking-tight">
                Alerts Enabled
              </h4>
              <p className="text-[11px] text-ink-mute dark:text-dark-mute mt-0.5 font-serif italic">
                You will receive breaking dispatches from Dhananjay Singh.
              </p>
            </div>
          </div>
        ) : permissionDenied ? (
          <div className="flex items-center gap-3 py-1">
            <div className="w-8 h-8 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xs shrink-0 border border-amber-500/30">
              !
            </div>
            <div>
              <h4 className="font-sans font-bold text-xs text-ink dark:text-dark-ink">
                Notifications Blocked
              </h4>
              <p className="text-[11px] text-ink-mute dark:text-dark-mute mt-0.5">
                Enable notifications in site permissions to receive alerts.
              </p>
            </div>
          </div>
        ) : (
          <div>
            {/* Header: Logo, Title, and Timer / Close Button */}
            <div className="flex items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src="/logo.png"
                  alt="Singh Monster"
                  className="w-8 h-8 sm:w-9 sm:h-9 object-contain shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-sans font-bold text-[13px] leading-tight text-ink dark:text-dark-ink tracking-tight truncate">
                      Singh Monster Alerts
                    </h4>
                    <span className="w-1.5 h-1.5 rounded-full bg-accent dark:bg-amber-400 shrink-0 animate-pulse" />
                  </div>
                  <p className="text-[10.5px] text-ink-mute dark:text-dark-mute truncate mt-0.5">
                    Real-time breaking news & reports
                  </p>
                </div>
              </div>

              {/* Top Right: Countdown Badge + Close Button */}
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[9.5px] font-mono font-semibold px-1.5 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-ink-mute dark:text-dark-mute border border-rule/50 dark:border-white/10">
                  {secondsRemaining}s
                </span>
                <button
                  type="button"
                  onClick={handleDismiss}
                  aria-label="Dismiss alert prompt"
                  className="w-6 h-6 flex items-center justify-center text-ink-mute hover:text-ink dark:text-dark-mute dark:hover:text-dark-ink rounded-full transition hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <p className="text-[11px] text-ink-mute dark:text-dark-mute mt-2 leading-relaxed">
              Stay informed with instant alerts when Dhananjay Singh publishes breaking stories and investigative exclusives.
            </p>

            {/* Action Buttons: Native mobile thumb layout */}
            <div className="flex items-center gap-2 mt-3">
              <button
                type="button"
                onClick={handleSubscribe}
                disabled={isSubscribing}
                className="flex-1 py-1.5 px-3 bg-ink text-paper dark:bg-dark-ink dark:text-dark-paper hover:bg-accent dark:hover:bg-amber-400 dark:hover:text-black text-xs font-sans font-bold tracking-wide rounded-xl transition duration-150 disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-[0.98]"
              >
                {isSubscribing ? (
                  <>
                    <span className="inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Enabling...
                  </>
                ) : (
                  'Turn On'
                )}
              </button>

              <button
                type="button"
                onClick={handleDismiss}
                className="py-1.5 px-3.5 text-xs font-sans font-medium text-ink-mute hover:text-ink dark:text-dark-mute dark:hover:text-dark-ink bg-paper-subtle dark:bg-white/[0.05] border border-rule/60 dark:border-white/10 rounded-xl transition duration-150 hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer active:scale-[0.98]"
              >
                Not Now
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
