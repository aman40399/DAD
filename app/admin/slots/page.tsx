'use client'

import { useState, useEffect, useMemo, useDeferredValue } from 'react'
import { Article } from '@/types'
import AdminToast, { ToastMessage } from '@/components/admin/AdminToast'
import { SLOTS } from '@/components/admin/slots/slotTypes'
import SlotHeader from '@/components/admin/slots/SlotHeader'
import SlotListView from '@/components/admin/slots/SlotListView'
import SlotBlueprintView from '@/components/admin/slots/SlotBlueprintView'
import SlotCuratorDrawer from '@/components/admin/slots/SlotCuratorDrawer'
import SlotResetModal from '@/components/admin/slots/SlotResetModal'

export default function SlotManagerPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [savingSlot, setSavingSlot] = useState<number | null>(null)
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [activeSectionFilter, setActiveSectionFilter] = useState<string>('all')

  // Slot search
  const [slotSearch, setSlotSearch] = useState<string>('')

  // Interactive Slide-Over Drawer state
  const [drawerSlot, setDrawerSlot] = useState<number | null>(null)
  const [drawerSearch, setDrawerSearch] = useState<string>('')
  const [drawerCategory, setDrawerCategory] = useState<string>('all')

  // Confirmation dialog for resetting all slots
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [isResettingAll, setIsResettingAll] = useState(false)

  const addToast = (type: 'success' | 'error' | 'info', title: string, description?: string) => {
    setToasts((prev) => [...prev, { id: `${Date.now()}-${Math.random()}`, type, title, description }])
  }

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  const loadArticles = async () => {
    try {
      const res = await fetch('/api/articles?status=all')
      if (res.ok) {
        const data = await res.json()
        setArticles(data.articles || [])
      }
    } catch (e) {
      console.error('Error fetching articles for slot manager:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadArticles()
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const slotParam = params.get('slot')
      if (slotParam && !isNaN(parseInt(slotParam, 10))) {
        setDrawerSlot(parseInt(slotParam, 10))
      }
    }
  }, [])

  // Resolve front-page slots: calculate which article is pinned, and which is dynamically auto-flowing
  const resolvedSlots = useMemo(() => {
    const pinnedMap = new Map<number, Article>()
    const pinnedIds = new Set<string>()

    articles.forEach((a) => {
      const pos = a.homepage_position ?? (a as any).homepagePosition
      if (typeof pos === 'number' && pos >= 1 && pos <= 15) {
        pinnedMap.set(pos, a)
        pinnedIds.add(String(a.id))
      }
    })

    // Published unpinned pool sorted by newest
    const unpinnedPool = articles.filter(
      (a) => a.status === 'published' && !pinnedIds.has(String(a.id))
    )

    let unpinnedIdx = 0
    const result = new Map<number, { isPinned: boolean; article: Article | null }>()

    for (let s = 1; s <= 15; s++) {
      if (pinnedMap.has(s)) {
        result.set(s, { isPinned: true, article: pinnedMap.get(s)! })
      } else {
        const nextAuto = unpinnedPool[unpinnedIdx] || null
        if (nextAuto) unpinnedIdx++
        result.set(s, { isPinned: false, article: nextAuto })
      }
    }

    return result
  }, [articles])

  // Assign or unpin a slot
  const handleAssignSlot = async (slotNumber: number, articleId: string | null) => {
    setSavingSlot(slotNumber)

    try {
      const currentHolder = articles.find(
        (a) => (a.homepage_position || a.homepagePosition) === slotNumber
      )

      // If releasing the slot
      if (!articleId) {
        if (currentHolder) {
          await fetch(`/api/articles/${currentHolder.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ homepage_position: null }),
          })
        }

        setArticles((prev) =>
          prev.map((a) =>
            (a.homepage_position || a.homepagePosition) === slotNumber
              ? { ...a, homepage_position: null, homepagePosition: null }
              : a
          )
        )
        addToast('info', 'Slot Released', `Slot ${String(slotNumber).padStart(2, '0')} reverted to dynamic auto-flow.`)
      } else {
        // If article was pinned elsewhere, clear that slot first
        const prevSlotOfTarget = articles.find(
          (a) => a.id === articleId && (a.homepage_position || a.homepagePosition)
        )
        const oldPos = prevSlotOfTarget?.homepage_position ?? (prevSlotOfTarget as any)?.homepagePosition

        // If another article was in this slot, clear it
        if (currentHolder && currentHolder.id !== articleId) {
          await fetch(`/api/articles/${currentHolder.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ homepage_position: null }),
          })
        }

        // Save new assignment
        const res = await fetch(`/api/articles/${articleId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ homepage_position: slotNumber }),
        })

        if (!res.ok) throw new Error('Failed to update slot')

        const targetArt = articles.find((a) => a.id === articleId)

        setArticles((prev) =>
          prev.map((a) => {
            if (a.id === articleId) {
              return { ...a, homepage_position: slotNumber, homepagePosition: slotNumber }
            }
            if ((a.homepage_position || a.homepagePosition) === slotNumber) {
              return { ...a, homepage_position: null, homepagePosition: null }
            }
            return a
          })
        )

        const swapText = oldPos ? ` (moved from Slot ${String(oldPos).padStart(2, '0')})` : ''
        addToast(
          'success',
          'Position Pinned',
          `Slot ${String(slotNumber).padStart(2, '0')} locked to "${targetArt?.title?.slice(0, 32) || 'Story'}"${swapText}`
        )
      }
    } catch (e) {
      addToast('error', 'Update Failed', 'Could not sync slot assignment with server.')
    } finally {
      setSavingSlot(null)
      setDrawerSlot(null)
    }
  }

  // Swap slots: exchange positions of two slots atomically
  const handleSwapSlots = async (slotA: number, slotB: number) => {
    if (slotA === slotB) return
    const resolvedA = resolvedSlots.get(slotA)
    const resolvedB = resolvedSlots.get(slotB)

    const articleA = resolvedA?.article
    const articleB = resolvedB?.article

    if (!articleA && !articleB) {
      addToast('info', 'Empty Slots', 'Neither slot has an article to swap.')
      return
    }

    setSavingSlot(slotA)

    try {
      const promises: Promise<any>[] = []

      if (articleA) {
        promises.push(
          fetch(`/api/articles/${articleA.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ homepage_position: slotB }),
          })
        )
      }

      if (articleB) {
        promises.push(
          fetch(`/api/articles/${articleB.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ homepage_position: slotA }),
          })
        )
      }

      await Promise.all(promises)

      setArticles((prev) =>
        prev.map((art) => {
          if (articleA && art.id === articleA.id) {
            return { ...art, homepage_position: slotB, homepagePosition: slotB }
          }
          if (articleB && art.id === articleB.id) {
            return { ...art, homepage_position: slotA, homepagePosition: slotA }
          }
          return art
        })
      )

      const titleA = articleA ? `"${articleA.title.slice(0, 24)}…"` : `Slot ${slotA}`
      const titleB = articleB ? `"${articleB.title.slice(0, 24)}…"` : `Slot ${slotB}`
      addToast('success', 'Order Updated', `Swapped ${titleA} (Slot ${String(slotB).padStart(2, '0')}) and ${titleB} (Slot ${String(slotA).padStart(2, '0')})`)
    } catch (err) {
      console.error('Swap error:', err)
      addToast('error', 'Swap Failed', 'Could not update slot positions.')
    } finally {
      setSavingSlot(null)
    }
  }

  // Release all pinned slots to auto-flow
  const handleReleaseAll = async () => {
    setIsResettingAll(true)
    try {
      const pinnedArticles = articles.filter((a) => {
        const p = a.homepage_position ?? (a as any).homepagePosition
        return typeof p === 'number' && p >= 1 && p <= 15
      })

      await Promise.all(
        pinnedArticles.map((a) =>
          fetch(`/api/articles/${a.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ homepage_position: null }),
          })
        )
      )

      setArticles((prev) =>
        prev.map((a) => ({ ...a, homepage_position: null, homepagePosition: null }))
      )
      addToast('success', 'Layout Reset', 'All 15 slots now dynamically auto-flow newest published stories.')
    } catch (e) {
      addToast('error', 'Reset Failed', 'Failed to reset all slots.')
    } finally {
      setIsResettingAll(false)
      setShowResetConfirm(false)
    }
  }

  const deferredSlotSearch = useDeferredValue(slotSearch)

  // Filter slots for search
  const filteredSlots = useMemo(() => {
    return SLOTS.filter((slot) => {
      if (!deferredSlotSearch.trim()) return true

      const query = deferredSlotSearch.toLowerCase()
      const slotNumStr = String(slot.slot)
      const slotInfo = `${slot.name} ${slot.location} ${slot.description} slot ${slotNumStr}`.toLowerCase()
      const resolved = resolvedSlots.get(slot.slot)
      const articleTitle = resolved?.article?.title?.toLowerCase() || ''
      const articleCategory = resolved?.article?.category?.toLowerCase() || ''

      return slotInfo.includes(query) || articleTitle.includes(query) || articleCategory.includes(query)
    })
  }, [deferredSlotSearch, resolvedSlots])

  // Pinned count
  const pinnedCount = useMemo(() => {
    return articles.filter((a) => {
      const pos = a.homepage_position ?? (a as any).homepagePosition
      return typeof pos === 'number' && pos >= 1 && pos <= 15
    }).length
  }, [articles])

  // Unique categories for drawer filter
  const categories = useMemo(() => {
    const set = new Set<string>()
    articles.forEach((a) => {
      if (a.category) set.add(a.category)
    })
    return ['all', ...Array.from(set)]
  }, [articles])

  // Drawer articles list
  const drawerArticlesList = useMemo(() => {
    return articles
      .filter((a) => {
        if (drawerCategory !== 'all' && a.category !== drawerCategory) return false
        if (!drawerSearch.trim()) return true
        const q = drawerSearch.toLowerCase()
        return (
          a.title.toLowerCase().includes(q) ||
          (a.excerpt || a.subtitle || '').toLowerCase().includes(q) ||
          (a.author || '').toLowerCase().includes(q)
        )
      })
      .sort((a, b) => {
        const dateA = new Date(a.published_at || a.created_at).getTime()
        const dateB = new Date(b.published_at || b.created_at).getTime()
        return dateB - dateA
      })
  }, [articles, drawerSearch, drawerCategory])

  const activeDrawerSlotDef = SLOTS.find((s) => s.slot === drawerSlot)
  const activeDrawerResolved = drawerSlot ? resolvedSlots.get(drawerSlot) : null

  return (
    <div className="space-y-6 font-apple antialiased text-[#1d1d1f] dark:text-white">
      {/* Sleek Minimal Apple Header with Stats & Filter Controls */}
      <SlotHeader
        pinnedCount={pinnedCount}
        onReleaseAllClick={() => setShowResetConfirm(true)}
        slotSearch={slotSearch}
        onSlotSearchChange={setSlotSearch}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        activeSectionFilter={activeSectionFilter}
        onSectionFilterChange={setActiveSectionFilter}
      />

      {loading ? (
        <div className="py-24 text-center">
          <div className="w-7 h-7 border-2 border-[#0071e3] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-medium text-[#1d1d1f]/60 dark:text-white/60">
            Loading broadsheet slots…
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        /* HOMEPAGE REPLICA BLUEPRINT VIEW */
        <div className="pb-4">
          <SlotBlueprintView
            resolvedSlots={resolvedSlots}
            savingSlot={savingSlot}
            onAssignSlot={handleAssignSlot}
            onOpenDrawer={setDrawerSlot}
          />
        </div>
      ) : (
        /* RESPONSIVE APPLE LIST VIEW (Mobile & Desktop) */
        <SlotListView
          resolvedSlots={resolvedSlots}
          savingSlot={savingSlot}
          onAssignSlot={handleAssignSlot}
          onSwapSlots={handleSwapSlots}
          onOpenDrawer={setDrawerSlot}
          activeSectionFilter={activeSectionFilter}
          slotSearch={deferredSlotSearch}
        />
      )}

      {/* RESPONSIVE CURATOR MODAL (iOS Bottom Sheet on Mobile / Slide-Over Drawer on Desktop) */}
      <SlotCuratorDrawer
        activeDrawerSlotDef={activeDrawerSlotDef}
        activeDrawerResolved={activeDrawerResolved}
        drawerSearch={drawerSearch}
        onDrawerSearchChange={setDrawerSearch}
        drawerCategory={drawerCategory}
        onDrawerCategoryChange={setDrawerCategory}
        categories={categories}
        drawerArticlesList={drawerArticlesList}
        onAssignSlot={handleAssignSlot}
        onClose={() => setDrawerSlot(null)}
      />

      {/* CONFIRMATION MODAL: RESET ALL SLOTS */}
      <SlotResetModal
        isOpen={showResetConfirm}
        pinnedCount={pinnedCount}
        isResettingAll={isResettingAll}
        onConfirm={handleReleaseAll}
        onCancel={() => setShowResetConfirm(false)}
      />

      {/* FLOATING TOASTS */}
      <AdminToast toasts={toasts} onDismiss={removeToast} />
    </div>
  )
}
