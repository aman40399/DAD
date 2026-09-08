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
    { id: 'main', label: 'Main', count: 4 },
    { id: 'left', label: 'Left Side', count: 2 },
    { id: 'right', label: 'Right Side', count: 5 },
    { id: 'editors', label: "Editor's Choice", count: 4 },
  ]

  return (
    <div className="space-y-3">
      {/* Top Header Row — Heading is hidden on mobile because top app nav bar already displays it */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Desktop-only Page Title (zero duplicate heading on mobile) */}
        <div className="hidden md:block">
          <h1 className="font-serif font-bold text-xl sm:text-2xl text-ink dark:text-dark-ink">
            Homepage Slot Manager
          </h1>
          <p className="text-xs text-ink-mute dark:text-dark-mute mt-0.5 font-serif italic">
            Curation of broadsheet slots across 4 editorial sections
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* View Mode Toggle: Desktop only (Mobile only shows list view) */}
          {onViewModeChange && (
            <div className="hidden md:flex items-center bg-paper-subtle dark:bg-white/[0.06] p-1 rounded-xl border border-rule/60 dark:border-white/10 shadow-xs shrink-0">
              <button
                type="button"
                onClick={() => onViewModeChange('grid')}
                className={`h-7 px-3 text-xs font-semibold rounded-lg transition cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-ink text-white dark:bg-white dark:text-black shadow-xs'
                    : 'text-ink-mute dark:text-dark-mute hover:text-ink dark:hover:text-white'
                }`}
              >
                Grid View
              </button>
              <button
                type="button"
                onClick={() => onViewModeChange('list')}
                className={`h-7 px-3 text-xs font-semibold rounded-lg transition cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-ink text-white dark:bg-white dark:text-black shadow-xs'
                    : 'text-ink-mute dark:text-dark-mute hover:text-ink dark:hover:text-white'
                }`}
              >
                List View
              </button>
            </div>
          )}

          {/* Search Input (flexible on mobile, fixed width on desktop) */}
          <div className="relative flex-1 md:w-60">
            <IconSearch className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-mute dark:text-dark-mute pointer-events-none" />
            <input
              type="text"
              value={slotSearch}
              onChange={(e) => onSlotSearchChange(e.target.value)}
              placeholder="Search slots or headlines…"
              className="w-full text-xs pl-9 pr-7 py-2 bg-paper dark:bg-white/[0.06] border border-rule/60 dark:border-white/10 text-ink dark:text-white placeholder:text-ink-mute dark:placeholder:text-dark-mute focus:outline-none focus:border-accent rounded-xl transition-colors shadow-xs"
            />
            {slotSearch && (
              <button
                type="button"
                onClick={() => onSlotSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-mute hover:text-ink dark:hover:text-white cursor-pointer"
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
              className="h-9 px-3 text-xs font-semibold text-red-600 dark:text-red-400 border border-red-300/80 dark:border-red-900/60 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition cursor-pointer inline-flex items-center gap-1.5 shadow-xs whitespace-nowrap active:scale-95 shrink-0"
              title="Reset all slots to dynamic auto-flow"
            >
              <IconRefresh className="w-3 h-3" />
              <span className="hidden sm:inline">Release All</span> ({pinnedCount})
            </button>
          )}
        </div>
      </div>

      {/* Section Filter Pills (Visible on mobile always, and on desktop list view) */}
      <div className={`flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 ${viewMode === 'grid' ? 'md:hidden' : ''}`}>
        {filterTabs.map((tab) => {
          const isActive = activeSectionFilter === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSectionFilterChange(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 shadow-xs shrink-0 ${
                isActive
                  ? 'bg-ink text-white dark:bg-white dark:text-black font-semibold'
                  : 'bg-paper dark:bg-white/[0.04] border border-rule/60 dark:border-white/10 text-ink-mute hover:text-ink dark:hover:text-white hover:bg-paper-subtle'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
                  isActive
                    ? 'bg-white/20 dark:bg-black/20 text-white dark:text-black'
                    : 'bg-black/5 dark:bg-white/10 text-ink-mute'
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
