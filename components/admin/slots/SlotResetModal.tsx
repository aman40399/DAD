'use client'

import React from 'react'
import { IconAlert } from '@/components/admin/AdminIcons'

interface SlotResetModalProps {
  isOpen: boolean
  pinnedCount: number
  isResettingAll: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function SlotResetModal({
  isOpen,
  pinnedCount,
  isResettingAll,
  onConfirm,
  onCancel,
}: SlotResetModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-paper dark:bg-dark-paper border border-rule dark:border-dark-rule rounded-3xl shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center gap-3 text-red-600">
          <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
            <IconAlert className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-lg text-ink dark:text-dark-ink">
              Release All Pinned Slots?
            </h3>
            <p className="text-[11px] text-ink-mute font-mono">Irreversible front-page layout action</p>
          </div>
        </div>
        <p className="text-xs text-ink-mute dark:text-dark-mute leading-relaxed font-sans">
          This will unpin all <strong>{pinnedCount}</strong> currently curated stories. All 15 broadsheet homepage positions will revert to dynamic auto-flow based on chronological publication date.
        </p>
        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-rule/60 dark:border-white/[0.08]">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-xs font-semibold text-ink-mute dark:text-dark-mute hover:text-ink dark:hover:text-white cursor-pointer rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isResettingAll}
            onClick={onConfirm}
            className="px-5 py-2 bg-red-600 text-white text-xs font-bold uppercase tracking-wider rounded-full hover:bg-red-700 transition cursor-pointer disabled:opacity-50 shadow-xs"
          >
            {isResettingAll ? 'Releasing…' : 'Yes, Release All'}
          </button>
        </div>
      </div>
    </div>
  )
}
