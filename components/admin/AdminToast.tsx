'use client'

import { useEffect } from 'react'
import { IconClose } from './AdminIcons'

export interface ToastMessage {
  id: string
  type: 'success' | 'error' | 'info'
  title: string
  description?: string
}

interface AdminToastProps {
  toasts: ToastMessage[]
  onDismiss: (id: string) => void
}

export default function AdminToast({ toasts, onDismiss }: AdminToastProps) {
  useEffect(() => {
    if (toasts.length === 0) return
    const timers = toasts.map((t) =>
      setTimeout(() => {
        onDismiss(t.id)
      }, 3500)
    )
    return () => {
      timers.forEach((timer) => clearTimeout(timer))
    }
  }, [toasts, onDismiss])

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 max-w-md w-full px-4 pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success'
        const isError = toast.type === 'error'

        return (
          <div
            key={toast.id}
            className="pointer-events-auto backdrop-blur-2xl bg-white/90 dark:bg-[#1c1c1e]/90 border border-black/[0.08] dark:border-white/[0.1] px-4 py-2.5 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.12)] flex items-center justify-between gap-3 min-w-[280px] max-w-full animate-in fade-in slide-in-from-top-3 duration-200"
            role="alert"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  isError
                    ? 'bg-red-500'
                    : isSuccess
                    ? 'bg-emerald-500'
                    : 'bg-[#0071e3] dark:bg-[#2997ff]'
                }`}
              />
              <div className="min-w-0">
                <div className="font-semibold text-xs text-[#1d1d1f] dark:text-white tracking-tight truncate">
                  {toast.title}
                </div>
                {toast.description && (
                  <div className="text-[11px] text-[#1d1d1f]/60 dark:text-white/60 leading-tight truncate">
                    {toast.description}
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              className="w-5 h-5 rounded-full flex items-center justify-center text-[#1d1d1f]/40 hover:text-[#1d1d1f] dark:text-white/40 dark:hover:text-white hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition cursor-pointer shrink-0"
              aria-label="Dismiss toast"
            >
              <IconClose className="w-3 h-3" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
