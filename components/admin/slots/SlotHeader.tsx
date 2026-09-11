'use client'

import React from 'react'
import {
  IconSearch,
  IconClose,
  IconRefresh,
} from '@/components/admin/AdminIcons'

interface SlotHeaderProps {
  pinnedCount: number
  onReleaseAllClick: () => void
  slotSearch: string
  onSlotSearchChange: (search: string) => void
  viewMode?: 'grid' | 'list'
  onViewModeChange?: (mode: 'grid' | 'list') => void
  activeSectionFilter: string
  onSectionFilterChange: (filter: string) => void
}

export default function SlotHeader({
  pinnedCount,
  onReleaseAllClick,
  slotSearch,
  onSlotSearchChange,
  viewMode = 'grid',
  onViewModeChange,
  activeSectionFilter,
  onSectionFilterChange,
}: SlotHeaderProps) {
  const filterTabs = [
    { id: 'all', label: 'All', count: 15 },
    { id: 'main', label: 'Lead Hero', count: 4 },
    { id: 'left', label: 'Left Rail', count: 2 },
    { id: 'right', label: 'Sub Stories', count: 5 },
    { id: 'editors', label: "Editor's Picks", count: 4 },
  ]

  const autoFlowCount = Math.max(0, 15 - pinnedCount)

  return (
    <div className="space-y-4 font-sans text-[#1d1d1f] dark:text-white">
      {/* 1. MINIMALIST TOP ROW: Heading "Slots", Status Pill, and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3.5 flex-wrap">
          <h1 className="hidden md:block text-3xl sm:text-4xl font-semibold tracking-tight text-[#1d1d1f] dark:text-white">
            Slots
          </h1>

          {/* Unified Status Capsule Box (Apple Glass Style) */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full backdrop-blur-xl bg-white/70 dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.08] text-xs font-medium shadow-2xs">
            <span className="text-[#0071e3] dark:text-[#2997ff] font-semibold">
              {pinnedCount} Pinned
            </span>
            <span className="text-black/20 dark:text-white/20">•</span>
            <span className="text-[#1d1d1f]/60 dark:text-white/60">
              {autoFlowCount} Auto-Flow
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* View Mode Switcher (Blueprint / List) */}
          {onViewModeChange && (
            <div className="flex items-center p-1 bg-black/[0.04] dark:bg-white/[0.06] rounded-full border border-black/[0.03] dark:border-white/[0.05] shrink-0">
              <button
                type="button"
                onClick={() => onViewModeChange('grid')}
                className={`h-7 px-3 sm:px-3.5 text-xs font-semibold rounded-full transition-all duration-150 active:scale-95 cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-[#2c2c2e] text-[#0071e3] dark:text-[#2997ff] shadow-2xs'
                    : 'text-[#1d1d1f]/60 dark:text-white/60 hover:text-[#1d1d1f] dark:hover:text-white'
                }`}
              >
                Blueprint
              </button>
              <button
                type="button"
                onClick={() => onViewModeChange('list')}
                className={`h-7 px-3 sm:px-3.5 text-xs font-semibold rounded-full transition-all duration-150 active:scale-95 cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-[#2c2c2e] text-[#0071e3] dark:text-[#2997ff] shadow-2xs'
                    : 'text-[#1d1d1f]/60 dark:text-white/60 hover:text-[#1d1d1f] dark:hover:text-white'
                }`}
              >
                List
              </button>
            </div>
          )}

          {/* Release All Button */}
          {pinnedCount > 0 && (
            <button
              type="button"
              onClick={onReleaseAllClick}
              className="h-9 px-3.5 text-xs font-semibold rounded-full bg-white/70 dark:bg-white/[0.06] hover:bg-red-50 dark:hover:bg-red-950/30 border border-black/[0.06] dark:border-white/[0.08] hover:border-red-200 dark:hover:border-red-900/40 text-[#1d1d1f]/70 dark:text-white/70 hover:text-red-600 dark:hover:text-red-400 backdrop-blur-md transition-all active:scale-95 flex items-center gap-1.5 shadow-2xs cursor-pointer"
              title="Release all pinned slots back to auto-flow"
            >
              <IconRefresh className="w-3.5 h-3.5" />
              <span>Release All</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. SECONDARY BAR: Category Filter Tabs & Capsule Search */}
      <div className="p-2 sm:p-2.5 rounded-2xl backdrop-blur-xl bg-white/70 dark:bg-[#1c1c1e]/70 border border-black/[0.06] dark:border-white/[0.08] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-2.5">
        {/* Horizontal Scrollable Filter Track */}
        <div className="flex items-center gap-1 p-1 bg-black/[0.04] dark:bg-white/[0.06] rounded-full border border-black/[0.03] dark:border-white/[0.05] overflow-x-auto scrollbar-none max-w-full">
          {filterTabs.map((tab) => {
            const active = activeSectionFilter === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSectionFilterChange(tab.id)}
                className={`h-7 px-3 rounded-full text-xs font-semibold tracking-tight whitespace-nowrap transition-all duration-150 active:scale-95 shrink-0 cursor-pointer ${
                  active
                    ? 'bg-white dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-white shadow-2xs'
                    : 'text-[#1d1d1f]/60 dark:text-white/60 hover:text-[#1d1d1f] dark:hover:text-white'
                }`}
              >
                {tab.label}
                <span className="ml-1 text-[10px] opacity-60 font-mono">({tab.count})</span>
              </button>
            )
          })}
        </div>

        {/* Capsule Search Input */}
        <div className="relative flex-1 md:max-w-xs">
          <IconSearch className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1d1d1f]/40 dark:text-white/40 pointer-events-none" />
          <input
            type="text"
            value={slotSearch}
            onChange={(e) => onSlotSearchChange(e.target.value)}
            placeholder="Search slots or stories…"
            className="w-full text-xs pl-9 pr-8 py-2 bg-black/[0.03] dark:bg-white/[0.06] hover:bg-black/[0.05] dark:hover:bg-white/[0.08] focus:bg-white dark:focus:bg-[#2c2c2e] border border-black/[0.06] dark:border-white/[0.08] focus:border-[#0071e3] text-[#1d1d1f] dark:text-white placeholder:text-[#1d1d1f]/40 dark:placeholder:text-white/40 rounded-full outline-none transition"
          />
          {slotSearch && (
            <button
              type="button"
              onClick={() => onSlotSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-black/10 dark:bg-white/20 text-[#1d1d1f] dark:text-white hover:bg-black/20 text-[10px] flex items-center justify-center transition active:scale-90"
              aria-label="Clear search"
            >
              <IconClose className="w-2.5 h-2.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
