'use client'

import React, { useState, useEffect } from 'react'
import { Article } from '@/types'
import { mapArticleToPostCard } from '@/lib/meridianData'
import PostCard, { ArticleData } from '@/components/meridian/PostCard'
import EditorsNote from '@/components/meridian/EditorsNote'
import RecommendedRail from '@/components/meridian/RecommendedRail'
import NewsletterBox from '@/components/meridian/NewsletterBox'
import SponsorBox from '@/components/meridian/SponsorBox'

interface SlotBlueprintViewProps {
  resolvedSlots: Map<number, { isPinned: boolean; article: Article | null }>
  savingSlot: number | null
  onAssignSlot: (slot: number, articleId: string | null) => void
  onOpenDrawer: (slot: number) => void
}

interface EditorialConfig {
  editorsNote: {
    quote: string
    author: string
  }
  recommendedItems: Array<{
    name: string
    url: string
    description: string
    badgeText: string
    badgeBg: string
  }>
}

const DEFAULT_CONFIG: EditorialConfig = {
  editorsNote: {
    quote: 'Our reporters in Frankfurt, Lagos and Seoul filed three stories this morning that, read together, describe the same machine from three angles.',
    author: 'Marta Reyes',
  },
  recommendedItems: [
    {
      name: 'The Atlantic',
      url: 'https://theatlantic.com',
      description: 'The Atlantic covers news, politics, culture, technology, health, and more.',
      badgeText: 'A',
      badgeBg: 'bg-[#d9222a] text-white',
    },
    {
      name: 'The New York Times',
      url: 'https://nytimes.com',
      description: 'Live news, investigations, opinion, photos and video from around the world.',
      badgeText: 'T',
      badgeBg: 'bg-black text-white dark:bg-white dark:text-black font-serif',
    },
  ],
}

function SlotToolbar({
  slotNum,
  label,
  isPinned,
  hasArticle,
  articleId,
  isSaving,
  onOpenDrawer,
  onAssignSlot,
}: {
  slotNum: number
  label?: string
  isPinned?: boolean
  hasArticle?: boolean
  articleId?: string | null
  isSaving?: boolean
  onOpenDrawer: (slot: number) => void
  onAssignSlot: (slot: number, articleId: string | null) => void
}) {
  return (
    <div className="flex items-center justify-between gap-2 mb-2.5 p-1.5 px-3 rounded-full bg-paper-subtle/90 dark:bg-white/[0.06] border border-rule/60 dark:border-white/10 shadow-xs select-none">
      <div className="flex items-center gap-2 min-w-0">
        <span className="font-mono text-[10.5px] font-black px-2 py-0.5 rounded-full bg-ink text-paper dark:bg-white dark:text-black shrink-0">
          SLOT {String(slotNum).padStart(2, '0')}
        </span>
        <span
          className={`w-2 h-2 rounded-full shrink-0 ${
            isPinned ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
          }`}
        />
        <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-ink-mute dark:text-dark-mute truncate">
          {label ? `${label} · ` : ''}{isPinned ? 'PINNED' : 'AUTO-FLOW'}
        </span>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {!isPinned && hasArticle && articleId && (
          <button
            type="button"
            disabled={isSaving}
            onClick={(e) => {
              e.preventDefault()
              onAssignSlot(slotNum, articleId)
            }}
            className="px-2.5 py-0.5 text-[10.5px] font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 rounded-full transition cursor-pointer border border-emerald-500/20"
            title="Lock current story to slot"
          >
            Lock
          </button>
        )}
        {isPinned && (
          <button
            type="button"
            disabled={isSaving}
            onClick={(e) => {
              e.preventDefault()
              onAssignSlot(slotNum, null)
            }}
            className="px-2.5 py-0.5 text-[10.5px] font-semibold text-red-600 dark:text-red-400 hover:bg-red-500/10 rounded-full transition cursor-pointer border border-red-500/20"
            title="Release to dynamic auto-flow"
          >
            Release
          </button>
        )}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            onOpenDrawer(slotNum)
          }}
          className="px-3 py-0.5 text-[10.5px] font-bold uppercase tracking-wider bg-accent hover:bg-accent/90 text-white rounded-full transition cursor-pointer shadow-xs"
        >
          Curate
        </button>
      </div>
    </div>
  )
}

export default function SlotBlueprintView({
  resolvedSlots,
  savingSlot,
  onAssignSlot,
  onOpenDrawer,
}: SlotBlueprintViewProps) {
  // Editorial config for Editor's Note and Recommended Rail
  const [config, setConfig] = useState<EditorialConfig>(DEFAULT_CONFIG)
  const [isEditingNote, setIsEditingNote] = useState(false)
  const [isEditingRec, setIsEditingRec] = useState(false)

  // Note form state
  const [noteQuote, setNoteQuote] = useState('')
  const [noteAuthor, setNoteAuthor] = useState('')

  // Recommended form state
  const [recList, setRecList] = useState(DEFAULT_CONFIG.recommendedItems)

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/editorial-config')
      if (res.ok) {
        const data = await res.json()
        setConfig(data)
        setNoteQuote(data.editorsNote?.quote || '')
        setNoteAuthor(data.editorsNote?.author || '')
        setRecList(data.recommendedItems || [])
      }
    } catch (e) {
      console.error('Failed to load editorial config:', e)
    }
  }

  useEffect(() => {
    fetchConfig()
  }, [])

  const saveNote = async () => {
    try {
      const res = await fetch('/api/editorial-config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          editorsNote: {
            quote: noteQuote,
            author: noteAuthor,
          },
        }),
      })
      if (res.ok) {
        const updated = await res.json()
        setConfig(updated)
        setIsEditingNote(false)
      }
    } catch (e) {
      console.error('Failed to save editor note:', e)
    }
  }

  const saveRecommendations = async () => {
    try {
      const res = await fetch('/api/editorial-config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recommendedItems: recList,
        }),
      })
      if (res.ok) {
        const updated = await res.json()
        setConfig(updated)
        setIsEditingRec(false)
      }
    } catch (e) {
      console.error('Failed to save recommendations:', e)
    }
  }

  // Helper to convert resolved slot to ArticleData for PostCard
  const getCardData = (slotNum: number, fallbackTitle: string): ArticleData => {
    const res = resolvedSlots.get(slotNum)
    if (res?.article) {
      return {
        ...mapArticleToPostCard(res.article),
        rank: slotNum >= 7 && slotNum <= 10 ? String(slotNum).padStart(2, '0') : undefined,
      }
    }
    return {
      id: `slot-empty-${slotNum}`,
      title: fallbackTitle,
      category: 'Unassigned',
      excerpt: 'No article currently assigned. Click Curate to select an article from your catalog.',
      author: 'Editorial Pool',
      date: 'Auto-flow active',
      readTime: '1 min read',
      rank: slotNum >= 7 && slotNum <= 10 ? String(slotNum).padStart(2, '0') : undefined,
    }
  }

  const slot1 = resolvedSlots.get(1)

  return (
    <div className="space-y-8 select-none">
      {/* ------------------------------------------------------------ */}
      {/* 1. SLOT 01: BREAKING NEWS TICKER BAR (EXACT BROADSHEET FORMAT) */}
      {/* ------------------------------------------------------------ */}
      <section className="border border-rule/70 dark:border-white/10 rounded-2xl bg-[#f5f3ec] dark:bg-[#0c0c0b] p-3.5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="px-2.5 py-1 bg-accent text-white font-mono uppercase tracking-[0.14em] text-[10px] font-bold rounded-md shrink-0">
              Breaking
            </span>
            <span className="font-mono text-[10.5px] font-black px-2 py-0.5 rounded-full bg-ink text-paper dark:bg-white dark:text-black shrink-0">
              SLOT 01
            </span>
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                slot1?.isPinned ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
              }`}
            />
            <p className="font-serif font-bold text-xs sm:text-sm text-ink dark:text-white truncate">
              {slot1?.article ? slot1.article.title : 'No dispatch currently assigned to breaking ticker'}
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
            {!slot1?.isPinned && slot1?.article && (
              <button
                type="button"
                disabled={savingSlot === 1}
                onClick={() => onAssignSlot(1, slot1.article!.id)}
                className="px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 rounded-full transition cursor-pointer border border-emerald-500/20"
              >
                Lock Current
              </button>
            )}
            {slot1?.isPinned && (
              <button
                type="button"
                disabled={savingSlot === 1}
                onClick={() => onAssignSlot(1, null)}
                className="px-2.5 py-1 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-500/10 rounded-full transition cursor-pointer border border-red-500/20"
              >
                Release
              </button>
            )}
            <button
              type="button"
              onClick={() => onOpenDrawer(1)}
              className="px-3.5 py-1 text-xs font-bold uppercase tracking-wider bg-accent hover:bg-accent/90 text-white rounded-full transition cursor-pointer shadow-xs"
            >
              Curate Slot 01
            </button>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* 2. THREE-COLUMN BROADSHEET HERO GRID (DITTO HOMEPAGE FORMAT) */}
      {/* ------------------------------------------------------------ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 xl:gap-8 pt-2 pb-8 border-b border-rule dark:border-dark-rule">
        {/* ---------------- LEFT COLUMN (Slots 03, 04, Editor's Note, Recommended) ---------------- */}
        <aside className="order-2 lg:order-1 lg:col-span-3 space-y-6 lg:border-r border-rule dark:border-dark-rule lg:pr-6 xl:pr-8">
          {/* Slot 03 */}
          <div>
            <SlotToolbar
              slotNum={3}
              label="Left Wire 1"
              isPinned={resolvedSlots.get(3)?.isPinned}
              hasArticle={Boolean(resolvedSlots.get(3)?.article)}
              articleId={resolvedSlots.get(3)?.article?.id}
              isSaving={savingSlot === 3}
              onOpenDrawer={onOpenDrawer}
              onAssignSlot={onAssignSlot}
            />
            <PostCard article={getCardData(3, 'Left Rail Story 03')} variant="dense-thumb" />
          </div>

          {/* Slot 04 */}
          <div>
            <SlotToolbar
              slotNum={4}
              label="Left Wire 2"
              isPinned={resolvedSlots.get(4)?.isPinned}
              hasArticle={Boolean(resolvedSlots.get(4)?.article)}
              articleId={resolvedSlots.get(4)?.article?.id}
              isSaving={savingSlot === 4}
              onOpenDrawer={onOpenDrawer}
              onAssignSlot={onAssignSlot}
            />
            <PostCard article={getCardData(4, 'Left Rail Story 04')} variant="dense-thumb" />
          </div>

          {/* Editor's Note (with Interactive Edit Button) */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-ink-mute dark:text-dark-mute">
                Homepage Feature
              </span>
              <button
                type="button"
                onClick={() => {
                  setNoteQuote(config.editorsNote.quote)
                  setNoteAuthor(config.editorsNote.author)
                  setIsEditingNote(true)
                }}
                className="px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-wider bg-accent hover:bg-accent/90 text-white rounded-full transition cursor-pointer shadow-xs"
              >
                Edit Note
              </button>
            </div>
            <EditorsNote quote={config.editorsNote.quote} author={config.editorsNote.author} />
          </div>

          {/* Recommended Rail (with Interactive Edit Button) */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-ink-mute dark:text-dark-mute">
                Homepage Feature
              </span>
              <button
                type="button"
                onClick={() => {
                  setRecList(config.recommendedItems)
                  setIsEditingRec(true)
                }}
                className="px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-wider bg-accent hover:bg-accent/90 text-white rounded-full transition cursor-pointer shadow-xs"
              >
                Edit Recommendations
              </button>
            </div>
            <RecommendedRail items={config.recommendedItems} />
          </div>
        </aside>

        {/* ---------------- CENTER COLUMN (Slot 02 Hero & Slots 05, 06 Sub-Leads) ---------------- */}
        <section className="order-1 lg:order-2 lg:col-span-6 lg:border-r border-rule dark:border-dark-rule lg:pr-6 xl:pr-8">
          {/* Slot 02: Lead Hero */}
          <div>
            <SlotToolbar
              slotNum={2}
              label="Main Lead Hero"
              isPinned={resolvedSlots.get(2)?.isPinned}
              hasArticle={Boolean(resolvedSlots.get(2)?.article)}
              articleId={resolvedSlots.get(2)?.article?.id}
              isSaving={savingSlot === 2}
              onOpenDrawer={onOpenDrawer}
              onAssignSlot={onAssignSlot}
            />
            <PostCard article={getCardData(2, 'Main Broadsheet Lead Hero')} variant="hero" />
          </div>

          {/* Center Broadsheet Divider */}
          <hr className="border-0 h-[3px] bg-ink dark:bg-dark-ink my-7" />

          {/* Sub-leads (Slots 05 & 06 in 2 Columns) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <SlotToolbar
                slotNum={5}
                label="Sub-Lead 1"
                isPinned={resolvedSlots.get(5)?.isPinned}
                hasArticle={Boolean(resolvedSlots.get(5)?.article)}
                articleId={resolvedSlots.get(5)?.article?.id}
                isSaving={savingSlot === 5}
                onOpenDrawer={onOpenDrawer}
                onAssignSlot={onAssignSlot}
              />
              <PostCard article={getCardData(5, 'Sub-Lead Dispatch 05')} variant="feed" />
            </div>

            <div>
              <SlotToolbar
                slotNum={6}
                label="Sub-Lead 2"
                isPinned={resolvedSlots.get(6)?.isPinned}
                hasArticle={Boolean(resolvedSlots.get(6)?.article)}
                articleId={resolvedSlots.get(6)?.article?.id}
                isSaving={savingSlot === 6}
                onOpenDrawer={onOpenDrawer}
                onAssignSlot={onAssignSlot}
              />
              <PostCard article={getCardData(6, 'Sub-Lead Dispatch 06')} variant="feed" />
            </div>
          </div>
        </section>

        {/* ---------------- RIGHT COLUMN (Slots 07-10 Ranked, Newsletter, Sponsor) ---------------- */}
        <aside className="order-3 lg:col-span-3 space-y-6">
          <div>
            <header className="flex justify-between items-baseline pb-2.5 border-b-2 border-ink dark:border-dark-ink mb-4">
              <h3 className="font-sans font-bold text-[12.5px] tracking-[0.16em] uppercase text-ink dark:text-dark-ink">
                More To Read
              </h3>
              <span className="text-[10px] font-mono text-ink-mute">Slots 07–10</span>
            </header>

            <div className="space-y-4">
              {[7, 8, 9, 10].map((sNum) => (
                <div key={sNum}>
                  <SlotToolbar
                    slotNum={sNum}
                    isPinned={resolvedSlots.get(sNum)?.isPinned}
                    hasArticle={Boolean(resolvedSlots.get(sNum)?.article)}
                    articleId={resolvedSlots.get(sNum)?.article?.id}
                    isSaving={savingSlot === sNum}
                    onOpenDrawer={onOpenDrawer}
                    onAssignSlot={onAssignSlot}
                  />
                  <PostCard article={getCardData(sNum, `Ranked Story ${sNum}`)} variant="ranked" />
                </div>
              ))}
            </div>
          </div>

          {/* Sticky Container for Newsletter & Sponsor */}
          <div className="space-y-6">
            <NewsletterBox />
            <SponsorBox />
          </div>
        </aside>
      </div>

      {/* ------------------------------------------------------------ */}
      {/* 3. EDITOR'S PICKS 4-CARD CAROUSEL (SLOTS 11, 12, 13, 14)     */}
      {/* ------------------------------------------------------------ */}
      <section className="py-8 border-b border-rule dark:border-dark-rule">
        <header className="flex justify-between items-center pb-2.5 border-b-2 border-ink dark:border-dark-ink mb-6">
          <div className="flex items-center gap-3">
            <h3 className="font-sans font-bold text-[13px] tracking-[0.18em] uppercase text-ink dark:text-dark-ink">
              Editor's Picks
            </h3>
            <span className="text-[10px] font-mono text-ink-mute">Slots 11–14</span>
          </div>
          <span className="text-[10px] font-mono text-ink-mute uppercase tracking-wider">
            Curated 4-Story Row
          </span>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[11, 12, 13, 14].map((sNum) => (
            <div key={sNum}>
              <SlotToolbar
                slotNum={sNum}
                isPinned={resolvedSlots.get(sNum)?.isPinned}
                hasArticle={Boolean(resolvedSlots.get(sNum)?.article)}
                articleId={resolvedSlots.get(sNum)?.article?.id}
                isSaving={savingSlot === sNum}
                onOpenDrawer={onOpenDrawer}
                onAssignSlot={onAssignSlot}
              />
              <PostCard article={getCardData(sNum, `Editor's Pick Story ${sNum}`)} variant="feed" />
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* 4. WORLD CATEGORY SECTION (SLOT 15)                          */}
      {/* ------------------------------------------------------------ */}
      <section className="py-8">
        <header className="flex justify-between items-center pb-2.5 border-b-2 border-ink dark:border-dark-ink mb-6">
          <div className="flex items-center gap-3">
            <h3 className="font-sans font-bold text-[13px] tracking-[0.18em] uppercase text-ink dark:text-dark-ink">
              World // Dispatch
            </h3>
            <span className="text-[10px] font-mono text-ink-mute">Slot 15 Featured Story</span>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8">
            <SlotToolbar
              slotNum={15}
              label="World Featured"
              isPinned={resolvedSlots.get(15)?.isPinned}
              hasArticle={Boolean(resolvedSlots.get(15)?.article)}
              articleId={resolvedSlots.get(15)?.article?.id}
              isSaving={savingSlot === 15}
              onOpenDrawer={onOpenDrawer}
              onAssignSlot={onAssignSlot}
            />
            <PostCard article={getCardData(15, 'World Section Featured Dispatch')} variant="hero" />
          </div>

          <div className="lg:col-span-4 space-y-4">
            <div className="p-4 rounded-2xl bg-paper-subtle/50 dark:bg-white/[0.02] border border-rule/60 dark:border-white/10 text-xs font-mono text-ink-mute space-y-2">
              <p className="font-bold uppercase tracking-wider text-ink dark:text-white">World Wire Sub-Stories</p>
              <p className="leading-relaxed">
                Secondary world section stories automatically populate from the newest published dispatches tagged under "World".
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* MODAL: EDIT EDITOR'S NOTE                                    */}
      {/* ------------------------------------------------------------ */}
      {isEditingNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-paper dark:bg-[#141416] border border-rule/70 dark:border-white/15 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-rule/60 dark:border-white/10">
              <h3 className="font-serif font-bold text-lg text-ink dark:text-white">
                Edit Broadsheet Editor's Note
              </h3>
              <button
                type="button"
                onClick={() => setIsEditingNote(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-ink-mute hover:text-ink dark:hover:text-white transition"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 font-sans text-xs">
              <div>
                <label className="block font-bold uppercase tracking-wider text-ink dark:text-white mb-1.5">
                  Quote Text
                </label>
                <textarea
                  rows={4}
                  value={noteQuote}
                  onChange={(e) => setNoteQuote(e.target.value)}
                  className="w-full p-3 rounded-xl border border-rule/70 dark:border-white/10 bg-paper-subtle dark:bg-white/[0.04] text-ink dark:text-white focus:outline-none focus:border-accent text-sm font-serif italic"
                  placeholder="Enter editor note quote…"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-ink dark:text-white mb-1.5">
                  Author Signoff
                </label>
                <input
                  type="text"
                  value={noteAuthor}
                  onChange={(e) => setNoteAuthor(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-rule/70 dark:border-white/10 bg-paper-subtle dark:bg-white/[0.04] text-ink dark:text-white focus:outline-none focus:border-accent text-xs font-semibold"
                  placeholder="e.g. Dhananjay Singh or Marta Reyes"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-rule/60 dark:border-white/10">
              <button
                type="button"
                onClick={() => setIsEditingNote(false)}
                className="px-4 py-2 text-xs font-semibold text-ink-mute hover:text-ink dark:hover:text-white rounded-full transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveNote}
                className="px-5 py-2 text-xs font-bold uppercase tracking-wider bg-accent text-white rounded-full hover:bg-accent/90 transition shadow-xs"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------ */}
      {/* MODAL: EDIT RECOMMENDED RAIL                                 */}
      {/* ------------------------------------------------------------ */}
      {isEditingRec && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto bg-paper dark:bg-[#141416] border border-rule/70 dark:border-white/15 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-rule/60 dark:border-white/10">
              <h3 className="font-serif font-bold text-lg text-ink dark:text-white">
                Edit Homepage Recommendations
              </h3>
              <button
                type="button"
                onClick={() => setIsEditingRec(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-ink-mute hover:text-ink dark:hover:text-white transition"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {recList.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl border border-rule/70 dark:border-white/10 bg-paper-subtle dark:bg-white/[0.03] space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-accent">Item #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => setRecList(recList.filter((_, i) => i !== idx))}
                      className="text-xs text-red-500 hover:text-red-600 transition font-semibold"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block font-medium mb-1">Publication Name</label>
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => {
                          const updated = [...recList]
                          updated[idx].name = e.target.value
                          setRecList(updated)
                        }}
                        className="w-full p-2 rounded-lg border border-rule dark:border-white/10 bg-paper dark:bg-white/[0.05]"
                      />
                    </div>
                    <div>
                      <label className="block font-medium mb-1">URL</label>
                      <input
                        type="text"
                        value={item.url}
                        onChange={(e) => {
                          const updated = [...recList]
                          updated[idx].url = e.target.value
                          setRecList(updated)
                        }}
                        className="w-full p-2 rounded-lg border border-rule dark:border-white/10 bg-paper dark:bg-white/[0.05]"
                      />
                    </div>
                  </div>

                  <div className="text-xs">
                    <label className="block font-medium mb-1">Description</label>
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => {
                        const updated = [...recList]
                        updated[idx].description = e.target.value
                        setRecList(updated)
                      }}
                      className="w-full p-2 rounded-lg border border-rule dark:border-white/10 bg-paper dark:bg-white/[0.05]"
                    />
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={() =>
                  setRecList([
                    ...recList,
                    {
                      name: 'New Publication',
                      url: 'https://example.com',
                      description: 'Editorial description of the publication.',
                      badgeText: 'N',
                      badgeBg: 'bg-accent text-white',
                    },
                  ])
                }
                className="w-full py-2 border-2 border-dashed border-rule dark:border-white/20 hover:border-accent text-xs font-bold rounded-2xl transition cursor-pointer text-center text-ink-mute hover:text-ink dark:hover:text-white"
              >
                + Add Recommendation
              </button>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-rule/60 dark:border-white/10">
              <button
                type="button"
                onClick={() => setIsEditingRec(false)}
                className="px-4 py-2 text-xs font-semibold text-ink-mute hover:text-ink dark:hover:text-white rounded-full transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveRecommendations}
                className="px-5 py-2 text-xs font-bold uppercase tracking-wider bg-accent text-white rounded-full hover:bg-accent/90 transition shadow-xs"
              >
                Save Recommendations
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
