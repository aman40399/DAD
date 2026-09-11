'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Article } from '@/types'
import { SLOT_SECTIONS, SLOTS, SlotSectionDef, SlotDef } from './slotTypes'
import {
  IconArrowUp,
  IconArrowDown,
  IconChevronDown,
  IconChevronUp,
  IconPin,
  IconMedia,
  IconEdit,
  IconRefresh,
} from '@/components/admin/AdminIcons'

interface SlotListViewProps {
  resolvedSlots: Map<number, { isPinned: boolean; article: Article | null }>
  savingSlot: number | null
  onAssignSlot: (slot: number, articleId: string | null) => void
  onSwapSlots: (slotA: number, slotB: number) => void
  onOpenDrawer: (slot: number) => void
  activeSectionFilter?: string
  slotSearch?: string
}

const SECTION_ORDER_STORAGE_KEY = 'meridian_slot_section_order'

export default function SlotListView({
  resolvedSlots,
  savingSlot,
  onAssignSlot,
  onSwapSlots,
  onOpenDrawer,
  activeSectionFilter = 'all',
  slotSearch = '',
}: SlotListViewProps) {
  // Section order state (default: main, left, right, editors)
  const [sectionOrder, setSectionOrder] = useState<string[]>([
    'main',
    'left',
    'right',
    'editors',
  ])

  // Section collapse state
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({})

  // Load persisted section order
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SECTION_ORDER_STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length === 4) {
          setSectionOrder(parsed)
        }
      }
    } catch {
      // fallback to default
    }
  }, [])

  // Persist section order
  const saveSectionOrder = (newOrder: string[]) => {
    setSectionOrder(newOrder)
    try {
      localStorage.setItem(SECTION_ORDER_STORAGE_KEY, JSON.stringify(newOrder))
    } catch {
      // ignore
    }
  }

  const handleMoveSectionUp = (idx: number) => {
    if (idx <= 0) return
    const newOrder = [...sectionOrder]
    const temp = newOrder[idx - 1]
    newOrder[idx - 1] = newOrder[idx]
    newOrder[idx] = temp
    saveSectionOrder(newOrder)
  }

  const handleMoveSectionDown = (idx: number) => {
    if (idx >= sectionOrder.length - 1) return
    const newOrder = [...sectionOrder]
    const temp = newOrder[idx + 1]
    newOrder[idx + 1] = newOrder[idx]
    newOrder[idx] = temp
    saveSectionOrder(newOrder)
  }

  const toggleSectionCollapse = (id: string) => {
    setCollapsedSections((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  // Map of sections
  const sectionsMap = new Map<string, SlotSectionDef>()
  SLOT_SECTIONS.forEach((s) => sectionsMap.set(s.id, s))

  // Filter sections by active filter tab
  const orderedSections = sectionOrder
    .map((id) => sectionsMap.get(id)!)
    .filter(Boolean)
    .filter((sec) => {
      if (activeSectionFilter === 'all') return true
      return sec.id === activeSectionFilter
    })

  // Helper to check if slot matches search query
  const matchesSearch = (slotNum: number) => {
    if (!slotSearch.trim()) return true
    const q = slotSearch.toLowerCase()
    const def = SLOTS.find((s) => s.slot === slotNum)
    const slotInfo = `${def?.name || ''} ${def?.location || ''} slot ${slotNum}`.toLowerCase()
    const resolved = resolvedSlots.get(slotNum)
    const title = resolved?.article?.title?.toLowerCase() || ''
    const category = resolved?.article?.category?.toLowerCase() || ''
    const author = resolved?.article?.author?.toLowerCase() || ''
    return slotInfo.includes(q) || title.includes(q) || category.includes(q) || author.includes(q)
  }

  return (
    <div className="space-y-6 font-sans">
      {orderedSections.map((section, secIdx) => {
        const isCollapsed = Boolean(collapsedSections[section.id])
        const slotsInSec = section.slots
        const matchingSlots = slotsInSec.filter(matchesSearch)

        // If search is active and no slots match in this section, skip
        if (slotSearch.trim() && matchingSlots.length === 0) {
          return null
        }

        // Count pinned in this section
        const pinnedInSec = slotsInSec.filter((s) => resolvedSlots.get(s)?.isPinned).length

        return (
          <div
            key={section.id}
            className="backdrop-blur-xl bg-white/70 dark:bg-[#1c1c1e]/70 border border-black/[0.06] dark:border-white/[0.08] rounded-3xl overflow-hidden shadow-2xs transition-all duration-200"
          >
            {/* SECTION HEADER */}
            <div className="p-4 sm:p-5 bg-black/[0.02] dark:bg-white/[0.02] border-b border-black/[0.05] dark:border-white/[0.06] flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 text-[#1d1d1f] dark:text-white text-xs font-semibold flex items-center justify-center shrink-0">
                  {secIdx + 1}
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-semibold text-base sm:text-lg text-[#1d1d1f] dark:text-white tracking-tight">
                    {section.title}
                  </h2>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-black/[0.04] dark:bg-white/10 text-[#1d1d1f]/60 dark:text-white/60 font-medium">
                    {slotsInSec.length} Slots
                  </span>
                  {pinnedInSec > 0 ? (
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#0071e3]/10 text-[#0071e3] dark:bg-[#2997ff]/20 dark:text-[#2997ff] font-semibold">
                      {pinnedInSec} Pinned
                    </span>
                  ) : (
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium">
                      Auto-flow
                    </span>
                  )}
                </div>
              </div>

              {/* Section Controls (Move Up / Down / Collapse) */}
              <div className="flex items-center gap-1.5 shrink-0">
                <div className="hidden sm:flex items-center bg-black/[0.04] dark:bg-white/5 border border-black/[0.06] dark:border-white/10 rounded-full p-0.5 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => handleMoveSectionUp(secIdx)}
                    disabled={secIdx === 0}
                    className="p-1.5 rounded-full text-[#1d1d1f]/60 hover:text-[#1d1d1f] dark:text-white/60 dark:hover:text-white disabled:opacity-30 transition cursor-pointer active:scale-95"
                    title="Move Section Up"
                    aria-label="Move Section Up"
                  >
                    <IconArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveSectionDown(secIdx)}
                    disabled={secIdx === orderedSections.length - 1}
                    className="p-1.5 rounded-full text-[#1d1d1f]/60 hover:text-[#1d1d1f] dark:text-white/60 dark:hover:text-white disabled:opacity-30 transition cursor-pointer active:scale-95"
                    title="Move Section Down"
                    aria-label="Move Section Down"
                  >
                    <IconArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => toggleSectionCollapse(section.id)}
                  className="w-8 h-8 flex items-center justify-center bg-black/[0.04] dark:bg-white/5 border border-black/[0.06] dark:border-white/10 rounded-full text-[#1d1d1f]/60 hover:text-[#1d1d1f] dark:text-white/60 dark:hover:text-white transition cursor-pointer active:scale-95"
                  title={isCollapsed ? 'Expand Section' : 'Collapse Section'}
                  aria-label={isCollapsed ? 'Expand Section' : 'Collapse Section'}
                >
                  {isCollapsed ? (
                    <IconChevronDown className="w-4 h-4" />
                  ) : (
                    <IconChevronUp className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* SECTION SLOTS LIST */}
            {!isCollapsed && (
              <div className="divide-y divide-black/[0.05] dark:divide-white/[0.06]">
                {matchingSlots.map((slotNum, slotIdxInSec) => {
                  const def: SlotDef = SLOTS.find((s) => s.slot === slotNum) || {
                    slot: slotNum,
                    name: `Slot ${slotNum}`,
                    location: '',
                    zone: 'Center Hero',
                    recommendedAspect: '16:10 Card',
                    description: '',
                    rank: undefined,
                  }
                  const resolved = resolvedSlots.get(slotNum)
                  const article = resolved?.article
                  const isPinned = Boolean(resolved?.isPinned)
                  const isSaving = savingSlot === slotNum

                  const isFirstInSec = slotIdxInSec === 0
                  const isLastInSec = slotIdxInSec === matchingSlots.length - 1

                  return (
                    <div
                      key={slotNum}
                      className={`p-4 sm:p-5 transition-colors ${
                        isPinned
                          ? 'bg-[#0071e3]/[0.02] hover:bg-[#0071e3]/[0.05]'
                          : 'hover:bg-black/[0.015] dark:hover:bg-white/[0.02]'
                      }`}
                    >
                      {/* Responsive Card: Stacks on mobile, inline on desktop */}
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        {/* LEFT / TOP: Badges & Story Preview */}
                        <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
                          {/* Reorder Buttons (Move Up / Down) */}
                          <div className="flex flex-col items-center gap-1 shrink-0 pt-0.5">
                            <button
                              type="button"
                              disabled={isFirstInSec || isSaving}
                              onClick={() => onSwapSlots(slotNum, matchingSlots[slotIdxInSec - 1])}
                              className="w-7 h-7 rounded-full border border-black/[0.08] dark:border-white/10 bg-white dark:bg-white/5 hover:bg-black/5 dark:hover:bg-white/10 text-[#1d1d1f]/60 hover:text-[#1d1d1f] dark:text-white/60 dark:hover:text-white disabled:opacity-20 transition flex items-center justify-center cursor-pointer active:scale-95 shadow-2xs"
                              title="Swap with previous slot"
                              aria-label="Move story up"
                            >
                              <IconArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={isLastInSec || isSaving}
                              onClick={() => onSwapSlots(slotNum, matchingSlots[slotIdxInSec + 1])}
                              className="w-7 h-7 rounded-full border border-black/[0.08] dark:border-white/10 bg-white dark:bg-white/5 hover:bg-black/5 dark:hover:bg-white/10 text-[#1d1d1f]/60 hover:text-[#1d1d1f] dark:text-white/60 dark:hover:text-white disabled:opacity-20 transition flex items-center justify-center cursor-pointer active:scale-95 shadow-2xs"
                              title="Swap with next slot"
                              aria-label="Move story down"
                            >
                              <IconArrowDown className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Thumbnail or Media Placeholder */}
                          <div className="relative shrink-0">
                            {article?.image_url || article?.imageUrl ? (
                              <img
                                src={article.image_url || article.imageUrl}
                                alt=""
                                className="w-20 h-16 sm:w-28 sm:h-20 object-cover rounded-2xl border border-black/[0.06] dark:border-white/10 shadow-2xs"
                              />
                            ) : (
                              <div className="w-20 h-16 sm:w-28 sm:h-20 rounded-2xl border border-dashed border-black/15 dark:border-white/10 bg-black/[0.02] dark:bg-white/5 flex flex-col items-center justify-center text-[#1d1d1f]/40 dark:text-white/40">
                                <IconMedia className="w-4 h-4 mb-0.5" />
                                <span className="text-[9px]">No Media</span>
                              </div>
                            )}

                            {/* Slot Tag overlay on thumb for mobile clarity */}
                            <span className="absolute -top-1.5 -left-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#1d1d1f] dark:bg-white text-white dark:text-[#1d1d1f] shadow-2xs">
                              {String(slotNum).padStart(2, '0')}
                            </span>
                          </div>

                          {/* Article Content / Details */}
                          <div className="flex-1 min-w-0 space-y-1 pt-0.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-semibold text-[#1d1d1f] dark:text-white">
                                {def.name}
                              </span>
                              <span className="text-black/30 dark:text-white/30 text-xs">•</span>
                              <span className="text-xs text-[#1d1d1f]/60 dark:text-white/60">
                                {def.recommendedAspect}
                              </span>
                              {isPinned ? (
                                <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-[#0071e3] dark:text-[#2997ff] bg-[#0071e3]/10 dark:bg-[#2997ff]/15 px-2 py-0.5 rounded-full">
                                  <IconPin className="w-2.5 h-2.5" />
                                  <span>Pinned</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10.5px] font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                                  <span>Auto-Flow</span>
                                </span>
                              )}
                            </div>

                            {article ? (
                              <>
                                <h3 className="font-semibold text-sm sm:text-base text-[#1d1d1f] dark:text-white hover:text-[#0071e3] transition line-clamp-2 leading-snug">
                                  <Link href={`/admin/articles/${article.id}/edit`}>
                                    {article.title}
                                  </Link>
                                </h3>

                                <div className="flex items-center gap-2 text-xs text-[#1d1d1f]/60 dark:text-white/60 flex-wrap">
                                  {article.category && (
                                    <span className="font-semibold text-[#0071e3] text-xs">
                                      {article.category}
                                    </span>
                                  )}
                                  <span>•</span>
                                  <span className="truncate">
                                    By {article.author || 'Dhananjay Singh'}
                                  </span>
                                  {article.published_at && (
                                    <>
                                      <span>•</span>
                                      <span>
                                        {new Date(article.published_at).toLocaleDateString('en-US', {
                                          month: 'short',
                                          day: 'numeric',
                                        })}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </>
                            ) : (
                              <div className="py-1">
                                <p className="text-xs italic text-[#1d1d1f]/50 dark:text-white/50">
                                  Waiting for next published story to auto-flow into this slot.
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* RIGHT / BOTTOM: Touch-Friendly Action Buttons */}
                        <div className="flex items-center gap-2 shrink-0 self-end md:self-center pt-2 md:pt-0 w-full md:w-auto justify-end border-t md:border-t-0 border-black/[0.05] dark:border-white/[0.06]">
                          {/* Change / Select Story Button */}
                          <button
                            type="button"
                            onClick={() => onOpenDrawer(slotNum)}
                            disabled={isSaving}
                            className="h-9 px-4 text-xs font-semibold bg-white dark:bg-white/[0.06] hover:bg-black/[0.04] dark:hover:bg-white/[0.1] border border-black/[0.08] dark:border-white/[0.1] text-[#1d1d1f] dark:text-white rounded-full transition cursor-pointer shadow-2xs active:scale-95 disabled:opacity-50"
                          >
                            {article ? 'Change Story' : 'Select Story'}
                          </button>

                          {/* Pin / Auto-Flow Toggle Button */}
                          {article && (
                            <button
                              type="button"
                              onClick={() => onAssignSlot(slotNum, isPinned ? null : article.id)}
                              disabled={isSaving}
                              className={`h-9 px-4 text-xs font-semibold rounded-full transition cursor-pointer shadow-2xs active:scale-95 disabled:opacity-50 flex items-center gap-1.5 ${
                                isPinned
                                  ? 'border border-black/[0.08] dark:border-white/10 text-[#1d1d1f]/70 dark:text-white/70 hover:text-red-600 hover:border-red-300 dark:hover:border-red-900 bg-white dark:bg-white/[0.06]'
                                  : 'bg-[#0071e3] text-white hover:bg-[#0077ed]'
                              }`}
                              title={isPinned ? 'Revert to auto-flow' : 'Pin to this position'}
                            >
                              {isSaving ? (
                                <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                              ) : isPinned ? (
                                <>
                                  <IconRefresh className="w-3.5 h-3.5" />
                                  <span>Auto-flow</span>
                                </>
                              ) : (
                                <>
                                  <IconPin className="w-3.5 h-3.5" />
                                  <span>Pin</span>
                                </>
                              )}
                            </button>
                          )}

                          {/* Edit Article Link */}
                          {article && (
                            <Link
                              href={`/admin/articles/${article.id}/edit`}
                              className="h-9 w-9 flex items-center justify-center rounded-full border border-black/[0.08] dark:border-white/10 text-[#1d1d1f]/60 hover:text-[#1d1d1f] dark:text-white/60 dark:hover:text-white bg-white dark:bg-white/[0.06] transition shadow-2xs active:scale-95"
                              title="Edit Article"
                              aria-label="Edit Article"
                            >
                              <IconEdit className="w-3.5 h-3.5" />
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

