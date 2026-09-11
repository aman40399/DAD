'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Trash2, Loader2 } from 'lucide-react'

interface DeleteArticleModalProps {
  isOpen: boolean
  articleTitle: string
  isDeleting: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function DeleteArticleModal({
  isOpen,
  articleTitle,
  isDeleting,
  onConfirm,
  onCancel,
}: DeleteArticleModalProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isDeleting) {
        onCancel()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, isDeleting, onCancel])

  if (!isOpen || !mounted) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-md p-4 animate-in fade-in duration-150 select-none"
      onClick={() => !isDeleting && onCancel()}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="backdrop-blur-3xl bg-white/95 dark:bg-[#1c1c1e]/95 border border-black/[0.08] dark:border-white/[0.1] max-w-[320px] w-full p-5 rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.22)] text-center space-y-3.5 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sleek Minimalist Icon */}
        <div className="w-10 h-10 rounded-full bg-red-500/10 dark:bg-red-500/15 text-red-600 dark:text-red-400 mx-auto flex items-center justify-center">
          <Trash2 className="w-4.5 h-4.5 stroke-[2]" />
        </div>

        {/* Minimalist Heading & Subtitle */}
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-[#1d1d1f] dark:text-white tracking-tight">
            Retract Story?
          </h3>
          <p className="text-[11px] text-[#1d1d1f]/55 dark:text-white/55 leading-relaxed">
            This story will be removed permanently from broadsheet circulation.
          </p>
        </div>

        {/* Story Title Preview */}
        <div className="px-3 py-1.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.04] dark:border-white/[0.06] text-xs font-medium text-[#1d1d1f] dark:text-white line-clamp-1 italic">
          &ldquo;{articleTitle}&rdquo;
        </div>

        {/* Apple Pill Action Buttons */}
        <div className="pt-1 flex items-center gap-2">
          <button
            type="button"
            disabled={isDeleting}
            onClick={onCancel}
            className="flex-1 h-9 text-xs font-medium text-[#1d1d1f]/70 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition active:scale-95 cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isDeleting}
            onClick={onConfirm}
            className="flex-1 h-9 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-full transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-95"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Retracting…</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5 stroke-[2.2]" />
                <span>Retract</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
