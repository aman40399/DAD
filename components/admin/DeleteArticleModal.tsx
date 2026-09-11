'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { IconAlert, IconTrash } from '@/components/admin/AdminIcons'

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
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-md p-4 animate-in fade-in duration-200 select-none"
      onClick={() => !isDeleting && onCancel()}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="backdrop-blur-2xl bg-white/95 dark:bg-[#1c1c1e]/95 border border-black/[0.08] dark:border-white/[0.1] max-w-sm w-full p-6 rounded-3xl shadow-[0_16px_48px_rgba(0,0,0,0.25)] text-center space-y-4 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Warning Icon Badge */}
        <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-600 dark:bg-red-500/15 dark:text-red-400 mx-auto flex items-center justify-center border border-red-500/20">
          <IconAlert className="w-6 h-6 stroke-[2.2]" />
        </div>

        {/* Title & Description */}
        <div className="space-y-1.5">
          <h3 className="text-base font-semibold text-[#1d1d1f] dark:text-white tracking-tight">
            Retract This Story?
          </h3>
          <p className="text-xs text-[#1d1d1f]/60 dark:text-white/60 leading-relaxed">
            Are you sure you want to permanently remove this dispatch from broadsheet circulation?
          </p>
        </div>

        {/* Story Title Quote Box */}
        <div className="p-3 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.06] text-xs font-semibold text-[#1d1d1f] dark:text-white line-clamp-2 tracking-tight">
          &ldquo;{articleTitle}&rdquo;
        </div>

        {/* Apple Pill Action Buttons */}
        <div className="pt-2 flex flex-col gap-2">
          <button
            type="button"
            disabled={isDeleting}
            onClick={onConfirm}
            className="w-full h-10 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-full transition shadow-[0_2px_8px_rgba(220,38,38,0.3)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-[0.98]"
          >
            {isDeleting ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Retracting…</span>
              </>
            ) : (
              <>
                <IconTrash className="w-3.5 h-3.5" />
                <span>Retract &amp; Delete</span>
              </>
            )}
          </button>

          <button
            type="button"
            disabled={isDeleting}
            onClick={onCancel}
            className="w-full h-10 bg-black/[0.04] hover:bg-black/[0.07] dark:bg-white/[0.06] dark:hover:bg-white/10 text-xs font-semibold text-[#1d1d1f] dark:text-white rounded-full transition cursor-pointer disabled:opacity-50 active:scale-[0.98]"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
