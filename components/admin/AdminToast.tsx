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
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success'
        const isError = toast.type === 'error'

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto bg-paper dark:bg-dark-paper border-2 ${
              isError
                ? 'border-red-600 dark:border-red-500'
                : isSuccess
                ? 'border-emerald-600 dark:border-emerald-500'
                : 'border-accent'
            } p-3.5 rounded-xs shadow-xl transition-all duration-300 transform translate-y-0 opacity-100 flex items-start justify-between gap-3`}
            role="alert"
          >
            <div className="flex items-start gap-2.5">
              <span
                className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${
                  isError
                    ? 'bg-red-600'
                    : isSuccess
                    ? 'bg-emerald-600'
                    : 'bg-accent'
                }`}
              />
              <div className="space-y-0.5">
                <div className="font-serif font-bold text-xs text-ink dark:text-dark-ink">
                  {toast.title}
                </div>
                {toast.description && (
                  <div className="font-sans text-[11px] text-ink-mute dark:text-dark-mute leading-relaxed">
                    {toast.description}
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              className="text-ink-mute hover:text-ink p-1 transition cursor-pointer shrink-0"
              aria-label="Dismiss toast"
            >
              <IconClose className="w-3.5 h-3.5" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
