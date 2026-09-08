'use client'

import React from 'react'
import { Article } from '@/types'
import { SlotDef } from './slotTypes'
import {
  IconCheck,
  IconBolt,
  IconEdit,
} from '@/components/admin/AdminIcons'

interface SlotMatrixViewProps {
  filteredSlots: SlotDef[]
  resolvedSlots: Map<number, { isPinned: boolean; article: Article | null }>
  savingSlot: number | null
  onAssignSlot: (slot: number, articleId: string | null) => void
  onOpenDrawer: (slot: number) => void
}

export default function SlotMatrixView({
  filteredSlots,
  resolvedSlots,
  savingSlot,
  onAssignSlot,
  onOpenDrawer,
}: SlotMatrixViewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {filteredSlots.map((slot) => {
        const resolved = resolvedSlots.get(slot.slot)
        const isPinned = resolved?.isPinned
        const article = resolved?.article
        const isSaving = savingSlot === slot.slot

        return (
          <div
            key={slot.slot}
            className={`p-5 border rounded-3xl transition-all duration-200 flex flex-col justify-between shadow-xs hover:shadow-md ${
              isPinned
                ? 'border-accent/70 bg-accent/[0.04] dark:bg-accent/[0.07]'
                : 'border-rule/60 dark:border-white/[0.08] bg-paper dark:bg-white/[0.04]'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold px-3 py-0.5 bg-ink text-paper dark:bg-white dark:text-black rounded-full shadow-xs">
                    Slot {String(slot.slot).padStart(2, '0')}
                  </span>
                  {isPinned ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                      <IconCheck className="w-3 h-3" /> PINNED
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                      <IconBolt className="w-3 h-3" /> AUTO-FLOW
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-accent font-bold">
                  {slot.location}
                </span>
              </div>

              <h3 className="font-serif font-bold text-base text-ink dark:text-white leading-snug">
                {slot.name}
              </h3>
              <p className="text-xs text-ink-mute dark:text-dark-mute mt-1 line-clamp-2 font-serif italic">
                {slot.description}
              </p>

              <div className="mt-2.5 text-[10.5px] font-mono text-ink-mute dark:text-dark-mute flex items-center gap-1.5">
                <span>Format:</span>
                <span className="font-semibold text-ink dark:text-dark-ink">{slot.recommendedAspect}</span>
              </div>

              {/* Resolved Article Preview */}
              <div className="mt-3.5 pt-3 border-t border-rule/60 dark:border-white/[0.08]">
                {article ? (
                  <div className="flex items-center gap-3">
                    {article.image_url || (article as any).imageUrl ? (
                      <img
                        src={article.image_url || (article as any).imageUrl}
                        alt=""
                        className="w-14 h-10 object-cover rounded-2xl border border-rule/60 dark:border-white/10 shrink-0 shadow-xs"
                      />
                    ) : (
                      <div className="w-14 h-10 bg-paper-subtle dark:bg-white/[0.06] border border-rule/60 dark:border-white/10 shrink-0 flex items-center justify-center text-[10px] font-mono text-ink-mute rounded-2xl">
                        Text
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-serif font-bold text-xs text-ink dark:text-white truncate">
                        {article.title}
                      </p>
                      <span className="text-[10px] font-mono text-ink-mute dark:text-dark-mute uppercase font-semibold">
                        {article.category} · Dhananjay Singh
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-ink-mute dark:text-dark-mute font-mono italic">
                    No article resolving into this slot
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-rule/50 dark:border-white/[0.08] flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => onOpenDrawer(slot.slot)}
                className="flex-1 py-2 bg-accent hover:bg-accent/90 text-white text-xs font-bold uppercase tracking-wider rounded-full transition cursor-pointer text-center inline-flex items-center justify-center gap-1.5 shadow-xs"
              >
                <IconEdit className="w-3.5 h-3.5" />
                <span>Curate Slot</span>
              </button>

              {isPinned ? (
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => onAssignSlot(slot.slot, null)}
                  className="px-3.5 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-500/10 rounded-full transition cursor-pointer"
                  title="Revert to dynamic auto-flow"
                >
                  Release
                </button>
              ) : article ? (
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => onAssignSlot(slot.slot, article.id)}
                  className="px-3.5 py-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 rounded-full transition cursor-pointer font-medium"
                  title="Lock current auto-flowing story"
                >
                  Lock Story
                </button>
              ) : null}
            </div>
          </div>
        )
      })}
    </div>
  )
}
