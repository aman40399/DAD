'use client'

import React from 'react'
import { Article } from '@/types'
import { SlotDef } from './slotTypes'
import {
  IconClose,
  IconSearch,
  IconCheck,
  IconPin,
} from '@/components/admin/AdminIcons'

interface SlotCuratorDrawerProps {
  activeDrawerSlotDef: SlotDef | undefined
  activeDrawerResolved: { isPinned: boolean; article: Article | null } | null | undefined
  drawerSearch: string
  onDrawerSearchChange: (search: string) => void
  drawerCategory: string
  onDrawerCategoryChange: (cat: string) => void
  categories: string[]
  drawerArticlesList: Article[]
  onAssignSlot: (slot: number, articleId: string | null) => void
  onClose: () => void
}

export default function SlotCuratorDrawer({
  activeDrawerSlotDef,
  activeDrawerResolved,
  drawerSearch,
  onDrawerSearchChange,
  drawerCategory,
  onDrawerCategoryChange,
  categories,
  drawerArticlesList,
  onAssignSlot,
  onClose,
}: SlotCuratorDrawerProps) {
  if (!activeDrawerSlotDef) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-md backdrop-blur-2xl bg-white/90 dark:bg-[#1c1c1e]/90 border-l border-black/[0.08] dark:border-white/[0.1] shadow-2xl flex flex-col sm:rounded-l-3xl overflow-hidden">
          {/* Drawer Header */}
          <div className="p-5 sm:p-6 border-b border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.02] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold px-3 py-1 bg-[#0071e3] text-white rounded-full shadow-xs">
                  Slot {String(activeDrawerSlotDef.slot).padStart(2, '0')}
                </span>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-ink-mute dark:text-dark-mute">
                  {activeDrawerSlotDef.zone}
                </span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center text-ink-mute hover:text-ink dark:hover:text-white bg-black/5 dark:bg-white/10 rounded-full transition cursor-pointer active:scale-95"
                aria-label="Close drawer"
              >
                <IconClose className="w-4 h-4" />
              </button>
            </div>

            <h3 className="font-serif font-black text-xl text-ink dark:text-white tracking-tight">
              {activeDrawerSlotDef.name}
            </h3>
            <p className="text-xs text-ink-mute dark:text-dark-mute font-serif italic">
              {activeDrawerSlotDef.description}
            </p>

            <div className="pt-2 flex items-center justify-between text-xs font-mono border-t border-black/[0.04] dark:border-white/[0.06]">
              <span className="text-ink-mute dark:text-dark-mute">Recommended Format:</span>
              <span className="font-bold text-ink dark:text-white">
                {activeDrawerSlotDef.recommendedAspect}
              </span>
            </div>
          </div>

          {/* Current Status & Release Option */}
          <div className="p-4 sm:p-5 border-b border-black/[0.06] dark:border-white/[0.08] bg-black/[0.015] dark:bg-white/[0.01]">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[10.5px] font-mono font-bold uppercase tracking-wider text-ink-mute dark:text-dark-mute">
                Current Assignment
              </span>
              {activeDrawerResolved?.isPinned ? (
                <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-0.5 rounded-full border border-emerald-500/20">
                  LOCKED PIN
                </span>
              ) : (
                <span className="text-[10px] font-mono font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-3 py-0.5 rounded-full border border-amber-500/20">
                  DYNAMIC AUTO-FLOW
                </span>
              )}
            </div>

            {activeDrawerResolved?.article ? (
              <div className="flex items-center gap-3 p-3 bg-white/80 dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/10 rounded-2xl shadow-xs">
                {activeDrawerResolved.article.image_url || (activeDrawerResolved.article as any).imageUrl ? (
                  <img
                    src={activeDrawerResolved.article.image_url || (activeDrawerResolved.article as any).imageUrl}
                    alt=""
                    className="w-14 h-10 object-cover rounded-xl border border-black/[0.06] dark:border-white/10 shrink-0 shadow-xs"
                  />
                ) : null}
                <div className="min-w-0 flex-1">
                  <p className="font-serif font-bold text-xs text-ink dark:text-white truncate">
                    {activeDrawerResolved.article.title}
                  </p>
                  <span className="text-[10px] font-mono text-ink-mute dark:text-dark-mute">
                    {activeDrawerResolved.article.category} · Dhananjay Singh
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-ink-mute dark:text-dark-mute font-mono italic">No article currently resolving</p>
            )}

            {activeDrawerResolved?.isPinned && (
              <button
                type="button"
                onClick={() => onAssignSlot(activeDrawerSlotDef.slot, null)}
                className="w-full mt-3 py-2 text-xs font-semibold text-red-600 dark:text-red-400 border border-red-300/80 dark:border-red-900/60 hover:bg-red-500/10 rounded-full transition cursor-pointer shadow-xs active:scale-[0.97]"
              >
                Release to Dynamic Auto-Flow
              </button>
            )}
          </div>

          {/* Drawer Search & Filter */}
          <div className="p-4 border-b border-black/[0.06] dark:border-white/[0.08] space-y-3 bg-white/40 dark:bg-white/[0.02]">
            <div className="relative">
              <IconSearch className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-mute dark:text-dark-mute pointer-events-none" />
              <input
                type="text"
                value={drawerSearch}
                onChange={(e) => onDrawerSearchChange(e.target.value)}
                placeholder="Search published dispatches to pin..."
                className="w-full text-xs pl-9 pr-8 py-2 bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/10 text-ink dark:text-white placeholder:text-ink-mute dark:placeholder:text-dark-mute focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30 rounded-full transition-colors shadow-xs"
              />
              {drawerSearch && (
                <button
                  type="button"
                  onClick={() => onDrawerSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-mute hover:text-ink dark:hover:text-white cursor-pointer"
                >
                  <IconClose className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category chips */}
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => onDrawerCategoryChange(cat)}
                  className={`px-3 py-1 text-[11px] font-mono rounded-full transition cursor-pointer active:scale-95 ${
                    drawerCategory === cat
                      ? 'bg-[#0071e3] text-white font-bold shadow-xs'
                      : 'bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/10 text-ink-mute dark:text-dark-mute hover:text-ink dark:hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Story List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5 apple-scrollbar">
            {drawerArticlesList.length === 0 ? (
              <div className="py-12 text-center text-xs font-mono text-ink-mute">
                No matching published dispatches found.
              </div>
            ) : (
              drawerArticlesList.map((art) => {
                const currentPos = art.homepage_position ?? (art as any).homepagePosition
                const isAssignedHere = currentPos === activeDrawerSlotDef.slot
                const isAssignedElsewhere = currentPos && currentPos !== activeDrawerSlotDef.slot

                return (
                  <div
                    key={art.id}
                    className={`p-4 border rounded-2xl transition-all duration-200 space-y-3 shadow-xs hover:shadow-md ${
                      isAssignedHere
                        ? 'border-[#0071e3]/80 bg-[#0071e3]/[0.05]'
                        : 'border-black/[0.06] dark:border-white/[0.08] bg-white/70 dark:bg-white/[0.04] hover:border-[#0071e3]/40'
                    }`}
                  >
                    <div className="flex gap-3.5">
                      {art.image_url || (art as any).imageUrl ? (
                        <img
                          src={art.image_url || (art as any).imageUrl}
                          alt=""
                          className="w-16 h-11 object-cover rounded-xl border border-black/[0.06] dark:border-white/10 shrink-0 shadow-xs"
                        />
                      ) : (
                        <div className="w-16 h-11 bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/10 shrink-0 flex items-center justify-center text-[10px] font-mono text-ink-mute rounded-xl">
                          Text
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1.5 mb-1">
                          <span className="text-[10px] font-mono uppercase font-bold text-[#0071e3] truncate">
                            {art.category}
                          </span>
                          {isAssignedElsewhere && (
                            <span className="text-[9.5px] font-mono text-ink-mute dark:text-dark-mute shrink-0">
                              Currently Slot {String(currentPos).padStart(2, '0')}
                            </span>
                          )}
                        </div>
                        <h4 className="font-serif font-bold text-xs text-ink dark:text-white line-clamp-2 leading-snug">
                          {art.title}
                        </h4>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2.5 border-t border-black/[0.05] dark:border-white/[0.08] text-xs">
                      <span className="text-[10px] font-mono text-ink-mute dark:text-dark-mute">
                        By Dhananjay Singh
                      </span>

                      {isAssignedHere ? (
                        <span className="text-[10.5px] font-mono font-bold text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                          <IconCheck className="w-3.5 h-3.5" />
                          <span>Active in this Slot</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onAssignSlot(activeDrawerSlotDef.slot, art.id)}
                          className="px-3.5 py-1.5 bg-[#0071e3] hover:bg-[#0077ed] text-white font-mono text-xs font-semibold rounded-full transition cursor-pointer shadow-xs active:scale-95"
                        >
                          Pin to Slot {String(activeDrawerSlotDef.slot).padStart(2, '0')}
                        </button>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
