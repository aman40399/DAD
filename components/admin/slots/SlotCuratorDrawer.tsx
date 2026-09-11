'use client'

import React, { useEffect } from 'react'
import { Article } from '@/types'
import { SlotDef } from './slotTypes'
import {
  IconClose,
  IconSearch,
  IconCheck,
  IconPin,
  IconRefresh,
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
  // Prevent background scroll when modal/drawer is open
  useEffect(() => {
    if (activeDrawerSlotDef) {
      const originalOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = originalOverflow
      }
    }
  }, [activeDrawerSlotDef])

  if (!activeDrawerSlotDef) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      {/* Frosted Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-md transition-opacity duration-200"
        onClick={onClose}
      />

      {/* MOBILE: iOS BOTTOM SHEET (sm:hidden) */}
      <div className="sm:hidden fixed inset-x-0 bottom-0 max-h-[85vh] z-50 flex flex-col backdrop-blur-2xl bg-white/95 dark:bg-[#1c1c1e]/95 border-t border-black/[0.08] dark:border-white/[0.1] rounded-t-3xl shadow-[0_-12px_40px_rgba(0,0,0,0.2)] animate-in slide-in-from-bottom duration-250">
        {/* iOS Drag Handle */}
        <div className="pt-2.5 pb-1 flex justify-center shrink-0">
          <div className="w-10 h-1.2 rounded-full bg-black/20 dark:bg-white/20" />
        </div>

        {/* Mobile Header */}
        <div className="px-5 py-3 border-b border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 bg-[#0071e3] text-white rounded-full">
              Slot {String(activeDrawerSlotDef.slot).padStart(2, '0')}
            </span>
            <span className="font-semibold text-sm text-[#1d1d1f] dark:text-white truncate max-w-[200px]">
              {activeDrawerSlotDef.name}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-black/5 dark:bg-white/10 text-[#1d1d1f] dark:text-white active:scale-90"
            aria-label="Close"
          >
            <IconClose className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Current Slot Info & Release button */}
        {activeDrawerResolved?.isPinned && (
          <div className="px-5 py-2.5 bg-[#0071e3]/[0.06] border-b border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between shrink-0">
            <span className="text-xs font-medium text-[#0071e3] dark:text-[#2997ff]">
              Currently pinned
            </span>
            <button
              type="button"
              onClick={() => onAssignSlot(activeDrawerSlotDef.slot, null)}
              className="text-xs font-semibold text-red-600 dark:text-red-400 hover:underline active:scale-95 cursor-pointer"
            >
              Revert to Auto-Flow
            </button>
          </div>
        )}

        {/* Search & Categories */}
        <div className="p-3.5 border-b border-black/[0.06] dark:border-white/[0.08] space-y-2.5 shrink-0">
          <div className="relative">
            <IconSearch className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#1d1d1f]/40 dark:text-white/40 pointer-events-none" />
            <input
              type="text"
              value={drawerSearch}
              onChange={(e) => onDrawerSearchChange(e.target.value)}
              placeholder="Search published stories to pin..."
              className="w-full text-xs pl-8 pr-8 py-2 bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/10 text-[#1d1d1f] dark:text-white placeholder:text-[#1d1d1f]/40 dark:placeholder:text-white/40 focus:outline-none rounded-full"
            />
            {drawerSearch && (
              <button
                type="button"
                onClick={() => onDrawerSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-black/10 dark:bg-white/20 text-[10px] flex items-center justify-center"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => onDrawerCategoryChange(cat)}
                className={`px-3 py-1 text-xs rounded-full whitespace-nowrap transition active:scale-95 ${
                  drawerCategory === cat
                    ? 'bg-[#0071e3] text-white font-semibold'
                    : 'bg-black/[0.04] dark:bg-white/[0.06] text-[#1d1d1f]/70 dark:text-white/70'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Story List (Touch-Friendly) */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-2.5 pb-8">
          {drawerArticlesList.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#1d1d1f]/50 dark:text-white/50">
              No matching published stories found.
            </div>
          ) : (
            drawerArticlesList.map((art) => {
              const currentPos = art.homepage_position ?? (art as any).homepagePosition
              const isAssignedHere = currentPos === activeDrawerSlotDef.slot

              return (
                <div
                  key={art.id}
                  onClick={() => onAssignSlot(activeDrawerSlotDef.slot, art.id)}
                  className={`p-3 rounded-2xl border transition active:scale-[0.98] cursor-pointer flex items-center gap-3 ${
                    isAssignedHere
                      ? 'border-[#0071e3] bg-[#0071e3]/10'
                      : 'border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#252528]'
                  }`}
                >
                  {(art.image_url || (art as any).imageUrl) ? (
                    <img
                      src={art.image_url || (art as any).imageUrl}
                      alt=""
                      className="w-14 h-14 object-cover rounded-xl shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 bg-black/[0.04] dark:bg-white/[0.06] rounded-xl shrink-0 flex items-center justify-center text-[10px] text-[#1d1d1f]/40 dark:text-white/40">
                      Text
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-semibold text-[#0071e3] uppercase">
                      {art.category}
                    </span>
                    <h4 className="font-semibold text-xs text-[#1d1d1f] dark:text-white line-clamp-2 leading-tight">
                      {art.title}
                    </h4>
                  </div>

                  {isAssignedHere ? (
                    <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                      <IconCheck className="w-3.5 h-3.5" />
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 text-[11px] font-semibold bg-[#0071e3] text-white rounded-full shrink-0">
                      Pin
                    </span>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* DESKTOP: SLEEK RIGHT SLIDE-OVER DRAWER (hidden sm:flex) */}
      <div className="hidden sm:flex fixed inset-y-0 right-0 max-w-full pl-10">
        <div className="w-screen max-w-md backdrop-blur-2xl bg-white/90 dark:bg-[#1c1c1e]/90 border-l border-black/[0.08] dark:border-white/[0.1] shadow-2xl flex flex-col rounded-l-3xl overflow-hidden animate-in slide-in-from-right duration-250">
          {/* Drawer Header */}
          <div className="p-5 sm:p-6 border-b border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.02] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-3 py-1 bg-[#0071e3] text-white rounded-full shadow-2xs">
                  Slot {String(activeDrawerSlotDef.slot).padStart(2, '0')}
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#1d1d1f]/60 dark:text-white/60">
                  {activeDrawerSlotDef.zone}
                </span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center text-[#1d1d1f]/60 hover:text-[#1d1d1f] dark:text-white/60 dark:hover:text-white bg-black/5 dark:bg-white/10 rounded-full transition cursor-pointer active:scale-95"
                aria-label="Close drawer"
              >
                <IconClose className="w-4 h-4" />
              </button>
            </div>

            <h3 className="font-semibold text-xl text-[#1d1d1f] dark:text-white tracking-tight">
              {activeDrawerSlotDef.name}
            </h3>
            <p className="text-xs text-[#1d1d1f]/60 dark:text-white/60">
              {activeDrawerSlotDef.description}
            </p>

            <div className="pt-2 flex items-center justify-between text-xs border-t border-black/[0.04] dark:border-white/[0.06]">
              <span className="text-[#1d1d1f]/60 dark:text-white/60">Recommended Format:</span>
              <span className="font-semibold text-[#1d1d1f] dark:text-white">
                {activeDrawerSlotDef.recommendedAspect}
              </span>
            </div>
          </div>

          {/* Current Status & Release Option */}
          <div className="p-4 sm:p-5 border-b border-black/[0.06] dark:border-white/[0.08] bg-black/[0.015] dark:bg-white/[0.01]">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#1d1d1f]/60 dark:text-white/60">
                Current Assignment
              </span>
              {activeDrawerResolved?.isPinned ? (
                <span className="text-[10.5px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-0.5 rounded-full border border-emerald-500/20">
                  LOCKED PIN
                </span>
              ) : (
                <span className="text-[10.5px] font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 px-3 py-0.5 rounded-full border border-amber-500/20">
                  DYNAMIC AUTO-FLOW
                </span>
              )}
            </div>

            {activeDrawerResolved?.article ? (
              <div className="flex items-center gap-3 p-3 bg-white/80 dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/10 rounded-2xl shadow-2xs">
                {(activeDrawerResolved.article.image_url || (activeDrawerResolved.article as any).imageUrl) ? (
                  <img
                    src={activeDrawerResolved.article.image_url || (activeDrawerResolved.article as any).imageUrl}
                    alt=""
                    className="w-14 h-10 object-cover rounded-xl shrink-0"
                  />
                ) : null}
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-xs text-[#1d1d1f] dark:text-white truncate">
                    {activeDrawerResolved.article.title}
                  </p>
                  <span className="text-[10px] text-[#1d1d1f]/60 dark:text-white/60">
                    {activeDrawerResolved.article.category} · Dhananjay Singh
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-[#1d1d1f]/50 dark:text-white/50 italic">
                No article currently resolving
              </p>
            )}

            {activeDrawerResolved?.isPinned && (
              <button
                type="button"
                onClick={() => onAssignSlot(activeDrawerSlotDef.slot, null)}
                className="w-full mt-3 py-2 text-xs font-semibold text-red-600 dark:text-red-400 border border-red-300/80 dark:border-red-900/60 hover:bg-red-500/10 rounded-full transition cursor-pointer active:scale-95"
              >
                Release to Dynamic Auto-Flow
              </button>
            )}
          </div>

          {/* Drawer Search & Filter */}
          <div className="p-4 border-b border-black/[0.06] dark:border-white/[0.08] space-y-3 bg-white/40 dark:bg-white/[0.02]">
            <div className="relative">
              <IconSearch className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1d1d1f]/40 dark:text-white/40 pointer-events-none" />
              <input
                type="text"
                value={drawerSearch}
                onChange={(e) => onDrawerSearchChange(e.target.value)}
                placeholder="Search published stories to pin..."
                className="w-full text-xs pl-9 pr-8 py-2 bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/10 text-[#1d1d1f] dark:text-white placeholder:text-[#1d1d1f]/40 dark:placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30 rounded-full transition"
              />
              {drawerSearch && (
                <button
                  type="button"
                  onClick={() => onDrawerSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1d1d1f]/50 hover:text-[#1d1d1f] dark:text-white/50 dark:hover:text-white cursor-pointer"
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
                  className={`px-3 py-1 text-xs rounded-full transition cursor-pointer active:scale-95 ${
                    drawerCategory === cat
                      ? 'bg-[#0071e3] text-white font-semibold shadow-2xs'
                      : 'bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/10 text-[#1d1d1f]/70 dark:text-white/70 hover:text-[#1d1d1f] dark:hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Story List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
            {drawerArticlesList.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#1d1d1f]/50 dark:text-white/50">
                No matching published stories found.
              </div>
            ) : (
              drawerArticlesList.map((art) => {
                const currentPos = art.homepage_position ?? (art as any).homepagePosition
                const isAssignedHere = currentPos === activeDrawerSlotDef.slot
                const isAssignedElsewhere = currentPos && currentPos !== activeDrawerSlotDef.slot

                return (
                  <div
                    key={art.id}
                    className={`p-3.5 border rounded-2xl transition-all duration-200 space-y-2.5 shadow-2xs ${
                      isAssignedHere
                        ? 'border-[#0071e3] bg-[#0071e3]/[0.05]'
                        : 'border-black/[0.06] dark:border-white/[0.08] bg-white/70 dark:bg-white/[0.04] hover:border-[#0071e3]/40'
                    }`}
                  >
                    <div className="flex gap-3">
                      {(art.image_url || (art as any).imageUrl) ? (
                        <img
                          src={art.image_url || (art as any).imageUrl}
                          alt=""
                          className="w-14 h-14 object-cover rounded-xl shrink-0"
                        />
                      ) : (
                        <div className="w-14 h-14 bg-black/[0.04] dark:bg-white/[0.06] shrink-0 flex items-center justify-center text-[10px] text-[#1d1d1f]/40 dark:text-white/40 rounded-xl">
                          Text
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1.5 mb-1">
                          <span className="text-[10px] uppercase font-bold text-[#0071e3] truncate">
                            {art.category}
                          </span>
                          {isAssignedElsewhere && (
                            <span className="text-[9.5px] text-[#1d1d1f]/50 dark:text-white/50 shrink-0">
                              Currently Slot {String(currentPos).padStart(2, '0')}
                            </span>
                          )}
                        </div>
                        <h4 className="font-semibold text-xs text-[#1d1d1f] dark:text-white line-clamp-2 leading-tight">
                          {art.title}
                        </h4>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-black/[0.05] dark:border-white/[0.08] text-xs">
                      <span className="text-[10px] text-[#1d1d1f]/50 dark:text-white/50">
                        By Dhananjay Singh
                      </span>

                      {isAssignedHere ? (
                        <span className="text-[10.5px] font-semibold text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                          <IconCheck className="w-3.5 h-3.5" />
                          <span>Active in this Slot</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onAssignSlot(activeDrawerSlotDef.slot, art.id)}
                          className="px-3.5 py-1.5 bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-semibold rounded-full transition cursor-pointer shadow-2xs active:scale-95"
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
