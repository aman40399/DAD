'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { Article } from '@/types'
import DeleteArticleModal from '@/components/admin/DeleteArticleModal'
import AdminToast, { ToastMessage } from '@/components/admin/AdminToast'
import {
  IconPin,
  IconSearch,
  IconClose,
  IconEdit,
  IconExternalLink,
  IconTrash,
  IconBolt,
  IconPlus,
} from '@/components/admin/AdminIcons'

const SLOT_NAMES: Record<number, string> = {
  1: 'Breaking Ticker',
  2: 'Lead Hero',
  3: 'Left Rail Top',
  4: 'Left Rail Sub',
  5: 'Sub-Lead 1',
  6: 'Sub-Lead 2',
  7: 'More to Read (07)',
  8: 'More to Read (08)',
  9: 'More to Read (09)',
  10: 'More to Read (10)',
  11: 'More to Read (11)',
  12: "Editor's Pick (12)",
  13: "Editor's Pick (13)",
  14: "Editor's Pick (14)",
  15: "Editor's Pick (15)",
}

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | '7days' | '30days'>('all')
  const [dateSort, setDateSort] = useState<'newest' | 'oldest'>('newest')
  const [search, setSearch] = useState('')

  // Retract / Delete Dialog State
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const addToast = (type: 'success' | 'error' | 'info', title: string, description?: string) => {
    setToasts((prev) => [...prev, { id: `${Date.now()}-${Math.random()}`, type, title, description }])
  }

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  const fetchArticles = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/articles?status=all&limit=100')
      if (res.ok) {
        const data = await res.json()
        setArticles(data.articles || [])
      }
    } catch (e) {
      console.error('Failed to load articles:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchArticles()
  }, [])

  const promptDelete = (id: string, title: string) => {
    setDeleteTarget({ id, title })
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/articles/${deleteTarget.id}`, { method: 'DELETE' })
      if (res.ok) {
        setArticles((prev) => prev.filter((a) => a.id !== deleteTarget.id))
        addToast(
          'success',
          'Story Retracted',
          `"${deleteTarget.title}" was permanently removed from broadsheet archives.`
        )
        setDeleteTarget(null)
      } else {
        addToast('error', 'Retraction Failed', 'Could not delete story from server archives.')
      }
    } catch (e) {
      addToast('error', 'Network Error', 'Failed to communicate with newsroom API.')
    } finally {
      setIsDeleting(false)
    }
  }

  const toggleStatus = async (article: Article) => {
    const currentStatus = article.status || 'published'
    const newStatus = currentStatus === 'published' ? 'draft' : 'published'

    setArticles((prev) =>
      prev.map((a) => (a.id === article.id ? { ...a, status: newStatus } : a))
    )

    try {
      const res = await fetch(`/api/articles/${article.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (res.ok) {
        if (newStatus === 'published') {
          addToast(
            'success',
            'Story Published',
            `"${article.title.slice(0, 35)}…" is now live in circulation.`
          )
        } else {
          addToast(
            'info',
            'Moved to Drafts',
            `"${article.title.slice(0, 35)}…" moved to private drafts.`
          )
        }
      } else {
        setArticles((prev) =>
          prev.map((a) => (a.id === article.id ? { ...a, status: article.status } : a))
        )
        addToast('error', 'Update Failed', 'Failed to update publication status.')
      }
    } catch (e) {
      setArticles((prev) =>
        prev.map((a) => (a.id === article.id ? { ...a, status: article.status } : a))
      )
      addToast('error', 'Network Error', 'Failed to update article status.')
    }
  }

  const categories = useMemo(() => {
    const set = new Set<string>()
    articles.forEach((a) => {
      if (a.category) set.add(a.category)
    })
    return ['all', ...Array.from(set)]
  }, [articles])

  const filteredArticles = useMemo(() => {
    const result = articles.filter((a) => {
      if (filter !== 'all' && a.status !== filter) return false
      if (categoryFilter !== 'all' && a.category !== categoryFilter) return false

      if (dateFilter !== 'all') {
        const rawDate = a.published_at || a.created_at || a.publishedAt || a.createdAt
        if (rawDate) {
          const artDate = new Date(rawDate)
          if (!isNaN(artDate.getTime())) {
            const now = new Date()
            if (dateFilter === 'today') {
              if (artDate.toDateString() !== now.toDateString()) return false
            } else if (dateFilter === '7days') {
              const diffMs = now.getTime() - artDate.getTime()
              const diffDays = diffMs / (1000 * 3600 * 24)
              if (diffDays > 7 || diffDays < 0) return false
            } else if (dateFilter === '30days') {
              const diffMs = now.getTime() - artDate.getTime()
              const diffDays = diffMs / (1000 * 3600 * 24)
              if (diffDays > 30 || diffDays < 0) return false
            }
          }
        }
      }

      if (search.trim()) {
        const q = search.toLowerCase()
        return (
          a.title.toLowerCase().includes(q) ||
          (a.author && a.author.toLowerCase().includes(q)) ||
          (a.category && a.category.toLowerCase().includes(q)) ||
          (a.excerpt && a.excerpt.toLowerCase().includes(q))
        )
      }
      return true
    })

    result.sort((a, b) => {
      const timeA = new Date(a.published_at || a.created_at || a.publishedAt || a.createdAt || 0).getTime()
      const timeB = new Date(b.published_at || b.created_at || b.publishedAt || b.createdAt || 0).getTime()
      return dateSort === 'newest' ? timeB - timeA : timeA - timeB
    })

    return result
  }, [articles, filter, categoryFilter, dateFilter, dateSort, search])

  const publishedCount = articles.filter((a) => a.status === 'published').length
  const draftCount = articles.filter((a) => a.status === 'draft').length
  const pinnedCount = articles.filter((a) => {
    const pos = a.homepage_position ?? (a as any).homepagePosition
    return typeof pos === 'number' && pos >= 1 && pos <= 15
  }).length

  return (
    <div className="space-y-6 font-sans text-[#1d1d1f] dark:text-white">
      {/* Toast notifications (Dynamic Island style) */}
      <AdminToast toasts={toasts} onDismiss={removeToast} />

      {/* ========================================================================= */}
      {/* APPLE HEADER & ACTION BAR                                                 */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#1d1d1f] dark:text-white">
              Stories & Dispatches
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold text-[#0071e3] dark:text-[#2997ff] bg-[#0071e3]/10 dark:bg-[#2997ff]/15 rounded-full">
              {articles.length} Total
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#1d1d1f]/60 dark:text-white/60 mt-1">
            Author, curate, and orchestrate broadsheet journalism across front-page slots.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href="/api/admin/backup"
            download
            className="h-10 px-4 rounded-full backdrop-blur-md bg-white/80 dark:bg-white/[0.08] hover:bg-white dark:hover:bg-white/15 border border-black/[0.08] dark:border-white/[0.1] text-xs font-semibold text-[#1d1d1f] dark:text-white transition shadow-xs flex items-center gap-1.5 active:scale-95"
            title="Download full JSON backup of articles"
          >
            <span>Backup JSON</span>
          </a>

          <Link
            href="/admin/articles/new"
            className="h-10 px-5 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-semibold tracking-tight transition shadow-[0_2px_8px_rgba(0,113,227,0.35)] flex items-center gap-2 active:scale-95"
          >
            <IconPlus className="w-4 h-4 stroke-[2.5]" />
            <span>New Story</span>
          </Link>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* APPLE GLASSMORPHIC STAT CARDS                                             */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* Card 1: Published */}
        <div className="p-4 sm:p-5 rounded-2xl backdrop-blur-xl bg-white/70 dark:bg-[#1c1c1e]/70 border border-black/[0.06] dark:border-white/[0.08] shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-[#1d1d1f]/50 dark:text-white/50 tracking-tight">
              Live in Circulation
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#1d1d1f] dark:text-white">
                {publishedCount}
              </span>
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                Active
              </span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 dark:bg-emerald-400/15 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
          </div>
        </div>

        {/* Card 2: Drafts */}
        <div className="p-4 sm:p-5 rounded-2xl backdrop-blur-xl bg-white/70 dark:bg-[#1c1c1e]/70 border border-black/[0.06] dark:border-white/[0.08] shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-[#1d1d1f]/50 dark:text-white/50 tracking-tight">
              Drafts Queue
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#1d1d1f] dark:text-white">
                {draftCount}
              </span>
              <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                Pending
              </span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 dark:bg-amber-400/15 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <span className="w-3 h-3 rounded-full bg-amber-500" />
          </div>
        </div>

        {/* Card 3: Pinned Slots */}
        <div className="p-4 sm:p-5 rounded-2xl backdrop-blur-xl bg-white/70 dark:bg-[#1c1c1e]/70 border border-black/[0.06] dark:border-white/[0.08] shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-[#1d1d1f]/50 dark:text-white/50 tracking-tight">
              Pinned Broadsheet Slots
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#1d1d1f] dark:text-white">
                {pinnedCount}
              </span>
              <span className="text-[11px] font-medium text-[#1d1d1f]/50 dark:text-white/50">
                / 15 Slots
              </span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-[#0071e3]/10 dark:bg-[#2997ff]/15 flex items-center justify-center text-[#0071e3] dark:text-[#2997ff]">
            <IconPin className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* APPLE CONTROLS BAR: SEGMENTED CONTROLS & SEARCH                           */}
      {/* ========================================================================= */}
      <div className="p-2 sm:p-3 rounded-2xl backdrop-blur-xl bg-white/70 dark:bg-[#1c1c1e]/70 border border-black/[0.06] dark:border-white/[0.08] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Apple Segmented Pill Track */}
        <div className="flex items-center gap-1 p-1 bg-black/[0.04] dark:bg-white/[0.06] rounded-full border border-black/[0.03] dark:border-white/[0.05] self-start">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-tight transition active:scale-95 ${
              filter === 'all'
                ? 'bg-white dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-white shadow-xs'
                : 'text-[#1d1d1f]/60 dark:text-white/60 hover:text-[#1d1d1f] dark:hover:text-white'
            }`}
          >
            All Stories ({articles.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('published')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-tight transition active:scale-95 ${
              filter === 'published'
                ? 'bg-white dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-white shadow-xs'
                : 'text-[#1d1d1f]/60 dark:text-white/60 hover:text-[#1d1d1f] dark:hover:text-white'
            }`}
          >
            Published ({publishedCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter('draft')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-tight transition active:scale-95 ${
              filter === 'draft'
                ? 'bg-white dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-white shadow-xs'
                : 'text-[#1d1d1f]/60 dark:text-white/60 hover:text-[#1d1d1f] dark:hover:text-white'
            }`}
          >
            Drafts ({draftCount})
          </button>
        </div>

        {/* Right: Search Capsule & Category Filter */}
        <div className="flex items-center gap-2">
          {/* Apple Pill Search Input */}
          <div className="relative flex-1 md:w-64">
            <IconSearch className="absolute left-3.5 top-3 w-4 h-4 text-[#1d1d1f]/40 dark:text-white/40 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search stories, topics…"
              className="w-full text-xs pl-10 pr-8 py-2 bg-black/[0.03] dark:bg-white/[0.06] hover:bg-black/[0.05] dark:hover:bg-white/[0.08] focus:bg-white dark:focus:bg-[#2c2c2e] border border-black/[0.06] dark:border-white/[0.08] focus:border-[#0071e3] text-[#1d1d1f] dark:text-white placeholder:text-[#1d1d1f]/40 dark:placeholder:text-white/40 rounded-full outline-none transition"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-2.5 text-[#1d1d1f]/40 hover:text-[#1d1d1f] dark:text-white/40 dark:hover:text-white"
              >
                <IconClose className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Dropdown Pill */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-9 px-3 text-xs font-medium bg-black/[0.03] dark:bg-white/[0.06] hover:bg-black/[0.05] dark:hover:bg-white/[0.08] border border-black/[0.06] dark:border-white/[0.08] text-[#1d1d1f] dark:text-white rounded-full outline-none cursor-pointer"
          >
            {categories.map((c) => (
              <option key={c} value={c} className="bg-white dark:bg-[#1c1c1e] text-[#1d1d1f] dark:text-white">
                {c === 'all' ? 'All Beats' : c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* DESKTOP STORIES LIST TABLE (macOS Frosted Style)                           */}
      {/* ========================================================================= */}
      <div className="hidden md:block rounded-3xl backdrop-blur-2xl bg-white/70 dark:bg-[#1c1c1e]/70 border border-black/[0.06] dark:border-white/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.03)] overflow-hidden">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3">
            <span className="w-6 h-6 border-2 border-[#0071e3]/30 border-t-[#0071e3] rounded-full animate-spin" />
            <p className="text-xs text-[#1d1d1f]/50 dark:text-white/50">Loading dispatches...</p>
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="p-16 text-center">
            <p className="text-sm font-semibold text-[#1d1d1f] dark:text-white">No dispatches found</p>
            <p className="text-xs text-[#1d1d1f]/50 dark:text-white/50 mt-1">Try clearing your filters or search keywords.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-black/[0.06] dark:border-white/[0.08] text-[11px] font-semibold text-[#1d1d1f]/50 dark:text-white/50 tracking-tight">
                  <th className="py-3.5 px-5">Story</th>
                  <th className="py-3.5 px-4">Beat</th>
                  <th className="py-3.5 px-4">Broadsheet Slot</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.05] text-xs">
                {filteredArticles.map((art) => {
                  const pos = art.homepage_position ?? (art as any).homepagePosition
                  const slotLabel = typeof pos === 'number' && pos >= 1 && pos <= 15 ? SLOT_NAMES[pos] : null
                  const isPublished = art.status === 'published'

                  return (
                    <tr
                      key={art.id}
                      className="group hover:bg-black/[0.015] dark:hover:bg-white/[0.02] transition-colors"
                    >
                      {/* Story Column */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3.5 max-w-[420px]">
                          <div className="w-14 h-10 rounded-xl overflow-hidden bg-black/[0.05] dark:bg-white/[0.05] shrink-0 border border-black/[0.06] dark:border-white/[0.08]">
                            <img
                              src={art.image_url || art.imageUrl || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=300'}
                              alt=""
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <div className="min-w-0">
                            <Link
                              href={`/admin/articles/${art.id}/edit`}
                              className="font-semibold text-[#1d1d1f] dark:text-white hover:text-[#0071e3] dark:hover:text-[#2997ff] line-clamp-1 tracking-tight"
                            >
                              {art.title}
                            </Link>
                            <p className="text-[11px] text-[#1d1d1f]/50 dark:text-white/50 line-clamp-1 mt-0.5">
                              {art.excerpt || 'No summary available.'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Beat Column */}
                      <td className="py-4 px-4">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-black/[0.04] dark:bg-white/[0.06] text-[#1d1d1f]/70 dark:text-white/70">
                          {art.category || 'News'}
                        </span>
                      </td>

                      {/* Broadsheet Slot Column */}
                      <td className="py-4 px-4">
                        {slotLabel ? (
                          <div className="flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-full bg-[#0071e3]/10 dark:bg-[#2997ff]/15 text-[#0071e3] dark:text-[#2997ff] font-bold text-[10px] flex items-center justify-center">
                              {pos}
                            </span>
                            <span className="text-[11px] font-semibold text-[#1d1d1f] dark:text-white tracking-tight">
                              {slotLabel}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-[#1d1d1f]/40 dark:text-white/40">Unassigned</span>
                        )}
                      </td>

                      {/* Status Toggle Column */}
                      <td className="py-4 px-4">
                        <button
                          type="button"
                          onClick={() => toggleStatus(art)}
                          className={`px-3 py-1 rounded-full text-[11px] font-semibold transition active:scale-95 flex items-center gap-1.5 ${
                            isPublished
                              ? 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-400'
                              : 'bg-amber-500/10 text-amber-600 dark:bg-amber-400/15 dark:text-amber-400'
                          }`}
                          title="Click to toggle publication status"
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isPublished ? 'bg-emerald-500' : 'bg-amber-500'
                            }`}
                          />
                          <span>{isPublished ? 'Published' : 'Draft'}</span>
                        </button>
                      </td>

                      {/* Date Column */}
                      <td className="py-4 px-4 text-[11px] text-[#1d1d1f]/50 dark:text-white/50">
                        {new Date(art.published_at || art.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>

                      {/* Action Menu Column */}
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Live Preview Button */}
                          <Link
                            href={`/article/${art.slug}`}
                            target="_blank"
                            className="w-8 h-8 rounded-full flex items-center justify-center text-[#1d1d1f]/60 hover:text-black dark:text-white/60 dark:hover:text-white hover:bg-black/[0.05] dark:hover:bg-white/[0.08] active:scale-95 transition"
                            title="Preview live article"
                          >
                            <IconExternalLink className="w-3.5 h-3.5" />
                          </Link>

                          {/* Edit Button */}
                          <Link
                            href={`/admin/articles/${art.id}/edit`}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-[#0071e3] hover:bg-[#0071e3]/10 dark:text-[#2997ff] dark:hover:bg-[#2997ff]/15 active:scale-95 transition"
                            title="Edit article"
                          >
                            <IconEdit className="w-3.5 h-3.5" />
                          </Link>

                          {/* Pin / Slot Button */}
                          <Link
                            href={`/admin/slots?pinId=${art.id}`}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-[#1d1d1f]/60 hover:text-black dark:text-white/60 dark:hover:text-white hover:bg-black/[0.05] dark:hover:bg-white/[0.08] active:scale-95 transition"
                            title="Assign to broadsheet slot"
                          >
                            <IconPin className="w-3.5 h-3.5" />
                          </Link>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => promptDelete(art.id, art.title)}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-red-500/70 hover:text-red-600 hover:bg-red-500/10 active:scale-95 transition"
                            title="Retract / delete article"
                          >
                            <IconTrash className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MOBILE CARD LIST (iOS Style Native Cards)                                 */}
      {/* ========================================================================= */}
      <div className="md:hidden space-y-3 pb-6">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-2">
            <span className="w-5 h-5 border-2 border-[#0071e3]/30 border-t-[#0071e3] rounded-full animate-spin" />
            <p className="text-xs text-[#1d1d1f]/50 dark:text-white/50">Loading...</p>
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-white/60 dark:bg-[#1c1c1e]/60 border border-black/[0.06] dark:border-white/[0.08]">
            <p className="text-xs text-[#1d1d1f]/50 dark:text-white/50">No dispatches match your search.</p>
          </div>
        ) : (
          filteredArticles.map((art) => {
            const pos = art.homepage_position ?? (art as any).homepagePosition
            const slotLabel = typeof pos === 'number' && pos >= 1 && pos <= 15 ? SLOT_NAMES[pos] : null
            const isPublished = art.status === 'published'

            return (
              <div
                key={art.id}
                className="p-3.5 rounded-2xl backdrop-blur-xl bg-white/70 dark:bg-[#1c1c1e]/70 border border-black/[0.06] dark:border-white/[0.08] shadow-xs space-y-2.5"
              >
                <div className="flex items-start gap-3">
                  <div className="w-16 h-12 rounded-xl overflow-hidden bg-black/[0.05] dark:bg-white/[0.05] shrink-0 border border-black/[0.06] dark:border-white/[0.08]">
                    <img
                      src={art.image_url || art.imageUrl || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=300'}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/admin/articles/${art.id}/edit`}
                      className="text-xs font-semibold text-[#1d1d1f] dark:text-white line-clamp-2 tracking-tight"
                    >
                      {art.title}
                    </Link>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-[#1d1d1f]/50 dark:text-white/50">
                        {art.category || 'News'}
                      </span>
                      {slotLabel && (
                        <span className="text-[10px] font-semibold text-[#0071e3] dark:text-[#2997ff]">
                          Slot {pos}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-black/[0.04] dark:border-white/[0.05]">
                  <button
                    type="button"
                    onClick={() => toggleStatus(art)}
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold transition active:scale-95 flex items-center gap-1 ${
                      isPublished
                        ? 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-400'
                        : 'bg-amber-500/10 text-amber-600 dark:bg-amber-400/15 dark:text-amber-400'
                    }`}
                  >
                    <span className={`w-1 h-1 rounded-full ${isPublished ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                    <span>{isPublished ? 'Published' : 'Draft'}</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <Link
                      href={`/article/${art.slug}`}
                      target="_blank"
                      className="p-1.5 rounded-full text-[#1d1d1f]/60 hover:text-black dark:text-white/60 dark:hover:text-white"
                      title="Preview"
                    >
                      <IconExternalLink className="w-3.5 h-3.5" />
                    </Link>
                    <Link
                      href={`/admin/articles/${art.id}/edit`}
                      className="p-1.5 rounded-full text-[#0071e3] dark:text-[#2997ff]"
                      title="Edit"
                    >
                      <IconEdit className="w-3.5 h-3.5" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => promptDelete(art.id, art.title)}
                      className="p-1.5 rounded-full text-red-500/70 hover:text-red-600"
                      title="Delete"
                    >
                      <IconTrash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Delete / Retract Confirmation Modal */}
      <DeleteArticleModal
        isOpen={deleteTarget !== null}
        articleTitle={deleteTarget?.title || ''}
        isDeleting={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
