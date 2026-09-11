'use client'

import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
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
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!isOpen || !mounted) return null

  return createPortal(
    <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-md backdrop-blur-2xl bg-white/85 dark:bg-[#1c1c1e]/85 border border-black/[0.08] dark:border-white/[0.1] rounded-3xl shadow-[0_16px_50px_rgba(0,0,0,0.15)] p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
            <IconAlert className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="font-serif font-black text-lg text-ink dark:text-dark-ink tracking-tight">
              Release All Pinned Slots?
            </h3>
            <p className="text-[11px] text-ink-mute dark:text-dark-mute font-mono">Irreversible front-page layout action</p>
          </div>
        </div>
        <p className="text-xs text-ink-mute dark:text-dark-mute leading-relaxed font-sans">
          This will unpin all <strong className="text-ink dark:text-white">{pinnedCount}</strong> currently curated stories. All 15 broadsheet homepage positions will revert to dynamic auto-flow based on chronological publication date.
        </p>
        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-black/[0.06] dark:border-white/[0.08]">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-xs font-semibold text-ink-mute dark:text-dark-mute hover:text-ink dark:hover:text-white cursor-pointer rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition active:scale-95"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isResettingAll}
            onClick={onConfirm}
            className="px-5 py-2 bg-red-600 text-white text-xs font-bold rounded-full hover:bg-red-700 transition cursor-pointer disabled:opacity-50 shadow-xs active:scale-95"
          >
            {isResettingAll ? 'Releasing…' : 'Yes, Release All'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
