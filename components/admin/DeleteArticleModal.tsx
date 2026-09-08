'use client'

import { useEffect } from 'react'

import { IconClose, IconAlert } from '@/components/admin/AdminIcons'

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

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
      onClick={() => !isDeleting && onCancel()}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-paper dark:bg-dark-paper border-2 border-rule dark:border-dark-rule max-w-md w-full p-6 rounded-xs shadow-2xl space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Masthead Eyebrow */}
        <div className="flex items-center justify-between pb-3 border-b border-rule dark:border-dark-rule">
          <div>
            <span className="text-[10px] font-mono text-red-600 dark:text-red-400 uppercase tracking-widest font-bold">
              Broadsheet Retraction Protocol
            </span>
            <h3 className="font-serif font-black text-xl text-ink dark:text-dark-ink mt-0.5">
              Retract &amp; Delete Story
            </h3>
          </div>
          <button
            type="button"
            disabled={isDeleting}
            onClick={onCancel}
            className="text-ink-mute hover:text-ink p-1 transition cursor-pointer disabled:opacity-50"
            aria-label="Close modal"
          >
            <IconClose className="w-4 h-4" />
          </button>
        </div>

        {/* Narrative & Warning */}
        <div className="space-y-3 font-sans text-xs text-ink-mute dark:text-dark-mute leading-relaxed">
          <p>
            You are about to retract the following dispatch from the newsroom archives:
          </p>

          <div className="p-3 bg-paper-subtle dark:bg-dark-subtle border-l-2 border-red-600 dark:border-red-500 font-serif text-sm font-bold text-ink dark:text-dark-ink italic">
            &ldquo;{articleTitle}&rdquo;
          </div>

          <div className="p-2.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xs text-[11px] text-red-800 dark:text-red-300 font-sans flex items-start gap-2">
            <IconAlert className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
            <div>
              <strong>Irreversible Action:</strong> This will purge the story from disk, unpin any broadsheet homepage slot allocations, and revoke reader access immediately.
            </div>
          </div>
        </div>

        {/* Modal Controls */}
        <div className="pt-3 flex items-center justify-end gap-3 border-t border-rule dark:border-dark-rule">
          <button
            type="button"
            disabled={isDeleting}
            onClick={onCancel}
            className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-ink-mute hover:text-ink transition cursor-pointer disabled:opacity-50"
          >
            Keep Story
          </button>
          <button
            type="button"
            disabled={isDeleting}
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider rounded-xs transition shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Retracting…</span>
              </>
            ) : (
              <span>Retract & Delete</span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
