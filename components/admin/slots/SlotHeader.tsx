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
    { id: 'all', label: 'All Slots', count: 15 },
    { id: 'main', label: 'Lead Hero', count: 4 },
    { id: 'left', label: 'Left Rail', count: 2 },
    { id: 'right', label: 'Sub Stories', count: 5 },
    { id: 'editors', label: "Editor's Picks", count: 4 },
  ]

  return (
    <div className="space-y-4 font-sans text-[#1d1d1f] dark:text-white">
      {/* Top Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#1d1d1f] dark:text-white">
              Broadsheet Slot Curator
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold text-[#0071e3] dark:text-[#2997ff] bg-[#0071e3]/10 dark:bg-[#2997ff]/15 rounded-full">
              {pinnedCount} Pinned
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#1d1d1f]/60 dark:text-white/60 mt-1">
            Pin breaking stories to precise broadsheet positions or let algorithms auto-flow.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          {/* View Mode Segmented Track (Desktop) */}
          {onViewModeChange && (
            <div className="hidden md:flex items-center p-1 bg-black/[0.04] dark:bg-white/[0.06] rounded-full border border-black/[0.03] dark:border-white/[0.05] shrink-0">
              <button
                type="button"
                onClick={() => onViewModeChange('grid')}
                className={`h-7 px-3.5 text-xs font-semibold rounded-full transition active:scale-95 cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-[#2c2c2e] text-[#0071e3] dark:text-[#2997ff] shadow-xs'
                    : 'text-[#1d1d1f]/60 dark:text-white/60 hover:text-[#1d1d1f] dark:hover:text-white'
                }`}
              >
                Blueprint
              </button>
              <button
                type="button"
                onClick={() => onViewModeChange('list')}
                className={`h-7 px-3.5 text-xs font-semibold rounded-full transition active:scale-95 cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-[#2c2c2e] text-[#0071e3] dark:text-[#2997ff] shadow-xs'
                    : 'text-[#1d1d1f]/60 dark:text-white/60 hover:text-[#1d1d1f] dark:hover:text-white'
                }`}
              >
                List Table
              </button>
            </div>
          )}

          {/* Search Pill Input */}
          <div className="relative flex-1 md:w-60">
            <IconSearch className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1d1d1f]/40 dark:text-white/40 pointer-events-none" />
            <input
              type="text"
              value={slotSearch}
              onChange={(e) => onSlotSearchChange(e.target.value)}
              placeholder="Search slots or headlines…"
              className="w-full text-xs pl-10 pr-8 py-2 bg-black/[0.03] dark:bg-white/[0.06] hover:bg-black/[0.05] dark:hover:bg-white/[0.08] focus:bg-white dark:focus:bg-[#2c2c2e] border border-black/[0.06] dark:border-white/[0.08] focus:border-[#0071e3] text-[#1d1d1f] dark:text-white placeholder:text-[#1d1d1f]/40 dark:placeholder:text-white/40 rounded-full outline-none transition"
            />
            {slotSearch && (
              <button
                type="button"
                onClick={() => onSlotSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1d1d1f]/40 hover:text-[#1d1d1f] dark:text-white/40 dark:hover:text-white cursor-pointer"
                aria-label="Clear search"
              >
                <IconClose className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Release All Button */}
          {pinnedCount > 0 && (
            <button
              type="button"
              onClick={onReleaseAllClick}
              className="h-9 px-4 text-xs font-semibold text-red-600 dark:text-red-400 bg-red-500/10 hover:bg-red-500/15 border border-red-500/20 rounded-full transition cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap active:scale-95 shrink-0"
              title="Reset all slots to dynamic auto-flow"
            >
              <IconRefresh className="w-3.5 h-3.5" />
              <span>Release All ({pinnedCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* Section Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {filterTabs.map((tab) => {
          const isActive = activeSectionFilter === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSectionFilterChange(tab.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 active:scale-95 shrink-0 ${
                isActive
                  ? 'bg-white dark:bg-[#2c2c2e] text-[#0071e3] dark:text-[#2997ff] shadow-xs border border-black/[0.06] dark:border-white/[0.08]'
                  : 'bg-black/[0.03] dark:bg-white/[0.04] text-[#1d1d1f]/60 dark:text-white/60 hover:text-[#1d1d1f] dark:hover:text-white hover:bg-black/[0.05]'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isActive
                    ? 'bg-[#0071e3]/10 text-[#0071e3] dark:bg-[#2997ff]/20 dark:text-[#2997ff]'
                    : 'bg-black/[0.04] dark:bg-white/[0.06] text-[#1d1d1f]/50'
                }`}
              >
                {tab.count}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
