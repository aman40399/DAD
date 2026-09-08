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
    <div className="space-y-6">
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
            className="bg-paper dark:bg-dark-paper border border-rule/80 dark:border-white/10 rounded-2xl md:rounded-3xl overflow-hidden shadow-xs transition-shadow"
          >
            {/* SECTION HEADER */}
            <div className="p-4 sm:p-6 bg-paper-subtle/70 dark:bg-white/[0.03] border-b border-rule/60 dark:border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start sm:items-center gap-3">
                <span className="shrink-0 w-7 h-7 rounded-xl bg-ink/5 dark:bg-white/10 text-ink dark:text-dark-ink text-xs font-mono font-bold flex items-center justify-center">
                  0{secIdx + 1}
                </span>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-serif font-black text-base sm:text-lg text-ink dark:text-dark-ink">
                      {section.title}
                    </h2>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-paper dark:bg-white/10 border border-rule/60 dark:border-white/10 text-ink-mute dark:text-dark-mute font-medium">
                      {slotsInSec.length} Slots
                    </span>
                    {pinnedInSec > 0 ? (
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-accent/10 border border-accent/20 text-accent font-semibold">
                        {pinnedInSec} Pinned
                      </span>
                    ) : (
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-medium">
                        All Auto-flow
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-ink-mute dark:text-dark-mute mt-0.5 font-serif italic line-clamp-1">
                    {section.subtitle}
                  </p>
                </div>
              </div>

              {/* Section Controls (Move Up / Down / Collapse) */}
              <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                <div className="flex items-center bg-paper dark:bg-white/5 border border-rule/60 dark:border-white/10 rounded-xl p-0.5 shadow-xs">
                  <button
                    type="button"
                    onClick={() => handleMoveSectionUp(secIdx)}
                    disabled={secIdx === 0}
                    className="p-1.5 rounded-lg text-ink-mute hover:text-ink dark:hover:text-white disabled:opacity-30 disabled:hover:text-ink-mute transition cursor-pointer"
                    title="Move Section Up"
                    aria-label="Move Section Up"
                  >
                    <IconArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveSectionDown(secIdx)}
                    disabled={secIdx === orderedSections.length - 1}
                    className="p-1.5 rounded-lg text-ink-mute hover:text-ink dark:hover:text-white disabled:opacity-30 disabled:hover:text-ink-mute transition cursor-pointer"
                    title="Move Section Down"
                    aria-label="Move Section Down"
                  >
                    <IconArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => toggleSectionCollapse(section.id)}
                  className="p-2 bg-paper dark:bg-white/5 border border-rule/60 dark:border-white/10 rounded-xl text-ink-mute hover:text-ink dark:hover:text-white transition cursor-pointer shadow-xs"
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
              <div className="divide-y divide-rule/60 dark:divide-white/[0.06]">
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
                          ? 'bg-accent/[0.02] hover:bg-accent/[0.04]'
                          : 'hover:bg-paper-subtle/50 dark:hover:bg-white/[0.02]'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        {/* LEFT: Reorder Controls + Slot Number + Info */}
                        <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
                          {/* Reorder Buttons (Move Up / Down) */}
                          <div className="flex flex-col items-center gap-1 shrink-0 pt-0.5">
                            <button
                              type="button"
                              disabled={isFirstInSec || isSaving}
                              onClick={() => onSwapSlots(slotNum, matchingSlots[slotIdxInSec - 1])}
                              className="w-7 h-7 rounded-lg border border-rule/70 dark:border-white/10 bg-paper dark:bg-white/5 hover:bg-paper-subtle dark:hover:bg-white/10 text-ink-mute hover:text-ink dark:hover:text-white disabled:opacity-25 disabled:cursor-not-allowed transition flex items-center justify-center cursor-pointer active:scale-95 shadow-xs"
                              title="Move story up (swap with previous slot)"
                              aria-label="Move story up"
                            >
                              <IconArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={isLastInSec || isSaving}
                              onClick={() => onSwapSlots(slotNum, matchingSlots[slotIdxInSec + 1])}
                              className="w-7 h-7 rounded-lg border border-rule/70 dark:border-white/10 bg-paper dark:bg-white/5 hover:bg-paper-subtle dark:hover:bg-white/10 text-ink-mute hover:text-ink dark:hover:text-white disabled:opacity-25 disabled:cursor-not-allowed transition flex items-center justify-center cursor-pointer active:scale-95 shadow-xs"
                              title="Move story down (swap with next slot)"
                              aria-label="Move story down"
                            >
                              <IconArrowDown className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Slot Tag & Thumbnail */}
                          <div className="flex flex-col items-start gap-2 shrink-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-md bg-ink dark:bg-white text-white dark:text-black shadow-xs">
                                Slot {String(slotNum).padStart(2, '0')}
                              </span>
                              {def.rank && (
                                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 text-ink-mute font-bold">
                                  #{def.rank}
                                </span>
                              )}
                            </div>

                            {/* Thumbnail */}
                            {article?.image_url || article?.imageUrl ? (
                              <img
                                src={article.image_url || article.imageUrl}
                                alt=""
                                className="w-20 h-14 sm:w-24 sm:h-16 object-cover rounded-xl border border-rule/70 dark:border-white/10 shadow-xs shrink-0"
                              />
                            ) : (
                              <div className="w-20 h-14 sm:w-24 sm:h-16 rounded-xl border border-dashed border-rule dark:border-white/10 bg-paper-subtle/50 dark:bg-white/5 flex flex-col items-center justify-center text-ink-mute/50 shrink-0">
                                <IconMedia className="w-4 h-4 mb-0.5" />
                                <span className="text-[9px] font-mono">No Image</span>
                              </div>
                            )}
                          </div>

                          {/* Article Content / Details */}
                          <div className="flex-1 min-w-0 space-y-1.5 pt-0.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-ink-mute dark:text-dark-mute">
                                {def.name}
                              </span>
                              <span className="text-ink-mute/40 text-[10px]">•</span>
                              <span className="text-[10px] font-mono text-ink-mute/80">
                                {def.recommendedAspect}
                              </span>
                            </div>

                            {article ? (
                              <>
                                <h3 className="font-serif font-bold text-sm sm:text-base text-ink dark:text-dark-ink hover:text-accent transition line-clamp-2 leading-snug">
                                  <Link href={`/admin/articles/${article.id}`}>
                                    {article.title}
                                  </Link>
                                </h3>

                                <div className="flex items-center gap-2 text-xs text-ink-mute dark:text-dark-mute flex-wrap">
                                  {article.category && (
                                    <span className="font-semibold text-accent text-[11px]">
                                      {article.category}
                                    </span>
                                  )}
                                  <span>•</span>
                                  <span className="text-[11px] truncate">
                                    By {article.author || 'Staff Reporter'}
                                  </span>
                                  {article.published_at && (
                                    <>
                                      <span>•</span>
                                      <span className="text-[11px] font-mono">
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
                              <div className="py-2">
                                <p className="text-xs font-serif italic text-ink-mute dark:text-dark-mute">
                                  No article currently occupying this slot. Dynamically waiting for the next published dispatch.
                                </p>
                              </div>
                            )}

                            {/* Status Badge */}
                            <div className="pt-0.5">
                              {isPinned ? (
                                <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold text-accent bg-accent/10 border border-accent/30 px-2.5 py-0.5 rounded-full">
                                  <IconPin className="w-3 h-3" />
                                  <span>PINNED POSITION</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
                                  <span>AUTO-FLOW FEED</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* RIGHT: Action Buttons */}
                        <div className="flex items-center gap-2 shrink-0 self-end md:self-center pt-2 md:pt-0 w-full md:w-auto justify-end border-t md:border-t-0 border-rule/50">
                          {/* Change / Select Story Button */}
                          <button
                            type="button"
                            onClick={() => onOpenDrawer(slotNum)}
                            disabled={isSaving}
                            className="h-9 px-3 text-xs font-semibold bg-paper dark:bg-white/5 border border-rule/80 dark:border-white/15 text-ink dark:text-dark-ink hover:bg-paper-subtle dark:hover:bg-white/10 rounded-xl transition cursor-pointer shadow-xs active:scale-95 disabled:opacity-50"
                          >
                            {article ? 'Change' : 'Select'}
                          </button>

                          {/* Pin / Unpin Button */}
                          {article && (
                            <button
                              type="button"
                              onClick={() => onAssignSlot(slotNum, isPinned ? null : article.id)}
                              disabled={isSaving}
                              className={`h-9 px-3 text-xs font-semibold rounded-xl transition cursor-pointer shadow-xs active:scale-95 disabled:opacity-50 flex items-center gap-1.5 ${
                                isPinned
                                  ? 'border border-rule dark:border-white/10 text-ink-mute hover:text-red-600 hover:border-red-300 dark:hover:border-red-900 bg-paper dark:bg-white/5'
                                  : 'bg-accent text-white hover:bg-accent/90'
                              }`}
                              title={isPinned ? 'Revert slot to dynamic auto-flow' : 'Lock this story to this slot'}
                            >
                              {isSaving ? (
                                <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                              ) : isPinned ? (
                                <>
                                  <IconRefresh className="w-3 h-3" />
                                  <span>Auto-flow</span>
                                </>
                              ) : (
                                <>
                                  <IconPin className="w-3 h-3" />
                                  <span>Pin</span>
                                </>
                              )}
                            </button>
                          )}

                          {/* Edit Article Link */}
                          {article && (
                            <Link
                              href={`/admin/articles/${article.id}`}
                              className="h-9 w-9 flex items-center justify-center rounded-xl border border-rule/60 dark:border-white/10 text-ink-mute hover:text-ink dark:hover:text-white bg-paper dark:bg-white/5 transition shadow-xs"
                              title="Edit Article in Editor"
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
