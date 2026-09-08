'use client'

import React, { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { VAPID_PUBLIC_KEY, urlBase64ToUint8Array } from '@/lib/pushConfig'

export default function NotificationPrompt() {
  const pathname = usePathname()
  const [isVisible, setIsVisible] = useState(false)
  const [isSubscribing, setIsSubscribing] = useState(false)
  const [subscribed, setSubscribed] = useState(false)
  const [permissionDenied, setPermissionDenied] = useState(false)

  useEffect(() => {
    // Only execute on browser client
    if (typeof window === 'undefined') return
    if (pathname?.startsWith('/admin')) return
    if (!('Notification' in window) || !('serviceWorker' in navigator)) return

    // If user already granted permission, register service worker silently
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

    // Delay prompt appearance by 3.5 seconds so it feels natural, not jarring
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 3500)

    return () => clearTimeout(timer)
  }, [])

  const ensureServiceWorkerRegistration = async () => {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js')
      return reg
    } catch (e) {
      console.warn('Service worker registration failed:', e)
      return null
    }
  }

  const handleSubscribe = async () => {
    setIsSubscribing(true)
    try {
      // 1. Request browser notification permission
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        setPermissionDenied(true)
        setIsSubscribing(false)
        setTimeout(() => setIsVisible(false), 3000)
        return
      }

      // 2. Register service worker
      const reg = await ensureServiceWorkerRegistration()
      if (!reg) throw new Error('Could not register service worker')

      // Wait until service worker is active
      await navigator.serviceWorker.ready

      // 3. Subscribe to PushManager
      let subscription = await reg.pushManager.getSubscription()
      if (!subscription) {
        subscription = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as any,
        })
      }


      // 4. Save to backend database/store
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

      // 5. Trigger an instant welcoming test notification
      if (reg.showNotification) {
        reg.showNotification('Singh Monster Alerts Active', {
          body: 'You will now receive real-time investigative dispatches and breaking alerts from Dhananjay Singh.',
          icon: '/authr.png',
          badge: '/authr.png',
          tag: 'welcome-alert',
        })
      }

      setSubscribed(true)
      setIsSubscribing(false)
      localStorage.setItem('sm_notification_subscribed', 'true')

      // Auto dismiss success card after 3.5 seconds
      setTimeout(() => {
        setIsVisible(false)
      }, 3500)
    } catch (error) {
      console.error('Error subscribing to push notifications:', error)
      setIsSubscribing(false)
      setIsVisible(false)
    }
  }

  const handleDismiss = () => {
    setIsVisible(false)
    // Dismiss for 3 days
    localStorage.setItem(
      'sm_notification_dismissed_until',
      String(Date.now() + 3 * 24 * 60 * 60 * 1000)
    )
  }

  if (!isVisible) return null

  return (
    <div
      role="region"
      aria-label="Breaking news alerts notification"
      className="fixed bottom-6 right-6 z-50 max-w-[360px] w-[calc(100vw-2rem)] animate-in fade-in slide-in-from-bottom-4 duration-300 pointer-events-auto"
    >
      <div className="p-4 sm:p-4.5 rounded-xl bg-paper/95 dark:bg-[#161614]/95 backdrop-blur-md border border-rule/80 dark:border-dark-rule shadow-[0_12px_36px_rgba(0,0,0,0.14)] text-ink dark:text-dark-ink transition-all">
        {subscribed ? (
          <div className="flex items-center gap-3 py-1">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm shrink-0">
              ✓
            </div>
            <div>
              <h4 className="font-sans font-semibold text-xs text-ink dark:text-dark-ink tracking-tight">
                Alerts Enabled
              </h4>
              <p className="text-[11px] text-ink-mute dark:text-dark-mute mt-0.5">
                You will receive breaking dispatches from Dhananjay Singh.
              </p>
            </div>
          </div>
        ) : permissionDenied ? (
          <div className="flex items-center gap-3 py-1">
            <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold text-xs shrink-0">
              !
            </div>
            <div>
              <h4 className="font-sans font-semibold text-xs text-ink dark:text-dark-ink">
                Notifications Blocked
              </h4>
              <p className="text-[11px] text-ink-mute dark:text-dark-mute mt-0.5">
                To receive dispatches, allow notifications in site permissions.
              </p>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src="/logo.png"
                  alt="Singh Monster"
                  className="w-10 h-10 sm:w-11 sm:h-11 object-contain dark:invert shrink-0"
                />
                <div>
                  <h4 className="font-sans font-semibold text-[13px] leading-tight text-ink dark:text-dark-ink tracking-tight">
                    Singh Monster Dispatches
                  </h4>
                  <p className="text-[11px] text-ink-mute dark:text-dark-mute mt-0.5">
                    Real-time breaking news & reports
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDismiss}
                aria-label="Dismiss alert prompt"
                className="text-ink-mute hover:text-ink dark:text-dark-mute dark:hover:text-dark-ink p-1 -mr-1 -mt-1 rounded-md transition hover:bg-black/5 dark:hover:bg-white/5"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="text-[11.5px] text-ink-mute dark:text-dark-mute mt-2.5 leading-normal">
              Stay informed with instant alerts when Dhananjay Singh publishes breaking stories and investigative exclusives.
            </p>

            <div className="flex items-center gap-2 mt-3.5">
              <button
                type="button"
                onClick={handleSubscribe}
                disabled={isSubscribing}
                className="flex-1 py-1.5 px-3 bg-ink text-paper dark:bg-dark-ink dark:text-dark-paper hover:opacity-90 text-[11.5px] font-sans font-semibold tracking-wide rounded-md transition duration-150 disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isSubscribing ? (
                  <>
                    <span className="inline-block w-2.5 h-2.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Enabling...
                  </>
                ) : (
                  'Turn On'
                )}
              </button>

              <button
                type="button"
                onClick={handleDismiss}
                className="py-1.5 px-3 text-[11.5px] font-sans font-medium text-ink-mute hover:text-ink dark:text-dark-mute dark:hover:text-dark-ink rounded-md transition duration-150 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
              >
                Not Now
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
