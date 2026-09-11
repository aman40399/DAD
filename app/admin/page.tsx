'use client'

import { useState, useEffect, useMemo, useDeferredValue } from 'react'
import Link from 'next/link'
import { Article } from '@/types'
import DeleteArticleModal from '@/components/admin/DeleteArticleModal'
import AdminToast, { ToastMessage } from '@/components/admin/AdminToast'
import {
  Plus,
  Search,
  X,
  Pencil,
  ArrowUpRight,
  LayoutGrid,
  Trash2,
  SlidersHorizontal,
  Calendar,
  Download,
} from 'lucide-react'

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
          `"${deleteTarget.title}" was permanently removed.`
        )
        setDeleteTarget(null)
      } else {
        addToast('error', 'Retraction Failed', 'Could not delete story from server.')
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
          addToast('success', 'Story Published', `"${article.title.slice(0, 35)}…" is now live.`)
        } else {
          addToast('info', 'Moved to Drafts', `"${article.title.slice(0, 35)}…" moved to drafts.`)
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

  const deferredSearch = useDeferredValue(search)

  const filteredArticles = useMemo(() => {
    const q = deferredSearch.trim().toLowerCase()
    const result = articles.filter((a) => {
      if (filter !== 'all' && a.status !== filter) return false
      if (categoryFilter !== 'all' && a.category !== categoryFilter) return false

      if (q) {
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
      return timeB - timeA
    })

    return result
  }, [articles, filter, categoryFilter, deferredSearch])

  const publishedCount = articles.filter((a) => a.status === 'published').length
  const draftCount = articles.filter((a) => a.status === 'draft').length

  return (
    <div className="space-y-6 font-apple text-[#1d1d1f] dark:text-white apple-animate-in">
      {/* Dynamic Island Toast Notifications */}
      <AdminToast toasts={toasts} onDismiss={removeToast} />

      {/* ========================================================================= */}
      {/* 1. SIMPLIFIED TOP HEADING + 2. SINGLE LIVE/DRAFT CLEAN TEXT BOX           */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          {/* JUST A CLEAN HEADING: "Stories" */}
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#1d1d1f] dark:text-white">
            Stories
          </h1>

          {/* LIVE / DRAFT INTO ONE CLEAN BOX (NO ICON/LOGO, SIMPLE CLEAN TEXT) */}
          <div className="inline-flex items-center gap-3 px-3.5 py-1.5 rounded-full backdrop-blur-xl bg-white/70 dark:bg-[#1c1c1e]/70 border border-black/[0.06] dark:border-white/[0.08] shadow-2xs text-xs">
            <span className="font-semibold text-[#1d1d1f] dark:text-white">
              {publishedCount} Live
            </span>
            <span className="text-black/20 dark:text-white/20">·</span>
            <span className="text-[#1d1d1f]/60 dark:text-white/60 font-medium">
              {draftCount} Drafts
            </span>
          </div>
        </div>

        {/* TOP ACTIONS: SEAMLESS TRANSITIONS */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <a
            href="/api/admin/backup"
            download
            className="h-10 px-4 rounded-full backdrop-blur-md bg-white/70 dark:bg-white/[0.06] hover:bg-white dark:hover:bg-white/10 border border-black/[0.06] dark:border-white/[0.08] text-xs font-semibold text-[#1d1d1f] dark:text-white transition-all duration-200 shadow-2xs flex items-center gap-1.5 active:scale-95"
            title="Download JSON Backup"
          >
            <Download className="w-3.5 h-3.5 opacity-60" />
            <span>Backup</span>
          </a>

          <Link
            href="/admin/articles/new"
            className="h-10 px-5 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-semibold tracking-tight transition-all duration-200 shadow-[0_2px_10px_rgba(0,113,227,0.35)] hover:shadow-[0_4px_16px_rgba(0,113,227,0.45)] flex items-center gap-2 active:scale-95 group"
          >
            <Plus className="w-4 h-4 stroke-[2.5] transition-transform duration-200 group-hover:rotate-90" />
            <span>New Story</span>
          </Link>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* CONTROLS BAR: SEGMENTED PILL FILTERS & SEARCH                             */}
      {/* ========================================================================= */}
      <div className="p-2 sm:p-2.5 rounded-2xl backdrop-blur-xl bg-white/70 dark:bg-[#1c1c1e]/70 border border-black/[0.06] dark:border-white/[0.08] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Apple Segmented Pill Track */}
        <div className="flex items-center gap-1 p-1 bg-black/[0.04] dark:bg-white/[0.06] rounded-full border border-black/[0.03] dark:border-white/[0.05] self-start">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-tight transition-all duration-150 active:scale-95 ${
              filter === 'all'
                ? 'bg-white dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-white shadow-2xs'
                : 'text-[#1d1d1f]/60 dark:text-white/60 hover:text-[#1d1d1f] dark:hover:text-white'
            }`}
          >
            All ({articles.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('published')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-tight transition-all duration-150 active:scale-95 ${
              filter === 'published'
                ? 'bg-white dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-white shadow-2xs'
                : 'text-[#1d1d1f]/60 dark:text-white/60 hover:text-[#1d1d1f] dark:hover:text-white'
            }`}
          >
            Published ({publishedCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter('draft')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-tight transition-all duration-150 active:scale-95 ${
              filter === 'draft'
                ? 'bg-white dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-white shadow-2xs'
                : 'text-[#1d1d1f]/60 dark:text-white/60 hover:text-[#1d1d1f] dark:hover:text-white'
            }`}
          >
            Drafts ({draftCount})
          </button>
        </div>

        {/* Search Capsule & Category Filter */}
        <div className="flex items-center gap-2">
          {/* Apple Pill Search Input */}
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-[#1d1d1f]/40 dark:text-white/40 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search stories, topics…"
              className="w-full text-xs pl-10 pr-8 py-2 bg-black/[0.03] dark:bg-white/[0.06] hover:bg-black/[0.05] dark:hover:bg-white/[0.08] focus:bg-white dark:focus:bg-[#2c2c2e] border border-black/[0.06] dark:border-white/[0.08] focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 text-[#1d1d1f] dark:text-white placeholder:text-[#1d1d1f]/40 dark:placeholder:text-white/40 rounded-full outline-none transition-all duration-200"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-2.5 text-[#1d1d1f]/40 hover:text-[#1d1d1f] dark:text-white/40 dark:hover:text-white transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Dropdown Pill */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-9 px-3.5 text-xs font-medium bg-black/[0.03] dark:bg-white/[0.06] hover:bg-black/[0.05] dark:hover:bg-white/[0.08] border border-black/[0.06] dark:border-white/[0.08] text-[#1d1d1f] dark:text-white rounded-full outline-none cursor-pointer transition"
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
      {/* 3. PREMIUM REPRESENTATION OF STORIES WITH BIGGER IMAGES                    */}
      {/* ========================================================================= */}
      {loading ? (
        /* Apple-Style Shimmer Skeletons */
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-5 rounded-3xl apple-glass-card animate-pulse flex flex-col md:flex-row gap-5 items-center"
            >
              <div className="w-full md:w-64 h-40 rounded-2xl bg-black/[0.06] dark:bg-white/[0.06] shrink-0" />
              <div className="flex-1 space-y-3 w-full">
                <div className="w-24 h-5 rounded-full bg-black/[0.05] dark:bg-white/[0.05]" />
                <div className="w-3/4 h-6 rounded-lg bg-black/[0.05] dark:bg-white/[0.05]" />
                <div className="w-full h-4 rounded bg-black/[0.04] dark:bg-white/[0.04]" />
                <div className="w-1/2 h-4 rounded bg-black/[0.04] dark:bg-white/[0.04]" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredArticles.length === 0 ? (
        <div className="p-16 text-center rounded-3xl apple-glass-card">
          <p className="text-base font-semibold text-[#1d1d1f] dark:text-white">No stories found</p>
          <p className="text-xs text-[#1d1d1f]/50 dark:text-white/50 mt-1 max-w-sm mx-auto">
            Try adjusting your search terms or filter selection.
          </p>
          <Link
            href="/admin/articles/new"
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#0071e3] text-white text-xs font-semibold hover:bg-[#0077ed] active:scale-95 transition shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Create First Story</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredArticles.map((art, idx) => {
            const pos = art.homepage_position ?? (art as any).homepagePosition
            const slotLabel = typeof pos === 'number' && pos >= 1 && pos <= 15 ? SLOT_NAMES[pos] : null
            const isPublished = art.status === 'published'
            const imageUrl = art.image_url || art.imageUrl || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=600'
            const formattedDate = new Date(
              art.published_at || art.created_at || art.publishedAt || art.createdAt || Date.now()
            ).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })

            return (
              <article
                key={art.id}
                style={{ animationDelay: `${idx * 40}ms` }}
                className="group p-4 sm:p-5 rounded-3xl apple-glass-card hover:border-black/[0.12] dark:hover:border-white/[0.16] hover:shadow-[0_12px_36px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_12px_36px_rgba(0,0,0,0.35)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col md:flex-row gap-5 items-start"
              >
                {/* BIGGER PREMIUM 16:9 IMAGE DISPLAY */}
                <div className="w-full md:w-64 lg:w-72 h-44 sm:h-48 md:h-44 rounded-2xl overflow-hidden relative shrink-0 bg-black/[0.04] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08]">
                  <img
                    src={imageUrl}
                    alt={art.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    loading="lazy"
                  />
                  {/* Category Pill Overlay */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider backdrop-blur-md bg-black/60 text-white shadow-xs">
                      {art.category || 'News'}
                    </span>
                  </div>

                  {/* Broadsheet Slot indicator if assigned */}
                  {slotLabel && (
                    <div className="absolute bottom-2.5 left-2.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold backdrop-blur-md bg-[#0071e3]/90 text-white shadow-xs flex items-center gap-1">
                        <span>Slot {pos}</span>
                      </span>
                    </div>
                  )}
                </div>

                {/* STORY CONTENT & METADATA */}
                <div className="flex-1 min-w-0 flex flex-col justify-between h-full space-y-3">
                  <div>
                    <div className="flex items-center gap-2 text-[11px] text-[#1d1d1f]/50 dark:text-white/50 mb-1.5">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{formattedDate}</span>
                      </span>
                      {art.author && (
                        <>
                          <span>·</span>
                          <span>{art.author}</span>
                        </>
                      )}
                      {slotLabel && (
                        <>
                          <span>·</span>
                          <span className="text-[#0071e3] dark:text-[#2997ff] font-medium">
                            {slotLabel}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Headline */}
                    <Link
                      href={`/admin/articles/${art.id}/edit`}
                      className="text-base sm:text-lg font-semibold tracking-tight text-[#1d1d1f] dark:text-white hover:text-[#0071e3] dark:hover:text-[#2997ff] transition-colors line-clamp-2 leading-snug"
                    >
                      {art.title}
                    </Link>

                    {/* Excerpt */}
                    <p className="text-xs sm:text-sm text-[#1d1d1f]/60 dark:text-white/60 line-clamp-2 leading-relaxed mt-1.5 font-normal">
                      {art.excerpt || 'No summary excerpt provided for this dispatch.'}
                    </p>
                  </div>

                  {/* BOTTOM ACTION & STATUS STRIP */}
                  <div className="flex items-center justify-between pt-3 border-t border-black/[0.04] dark:border-white/[0.06] gap-2 flex-wrap">
                    {/* Status Pill Toggle */}
                    <button
                      type="button"
                      onClick={() => toggleStatus(art)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 active:scale-95 flex items-center gap-1.5 ${
                        isPublished
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/15'
                          : 'bg-black/[0.04] dark:bg-white/[0.06] text-[#1d1d1f]/60 dark:text-white/60 border border-black/[0.06] dark:border-white/[0.08] hover:bg-black/[0.06] dark:hover:bg-white/[0.08]'
                      }`}
                      title="Click to toggle status"
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isPublished ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                        }`}
                      />
                      <span>{isPublished ? 'Published' : 'Draft'}</span>
                    </button>

                    {/* Apple Pill Action Group */}
                    <div className="flex items-center gap-1.5">
                      {/* Live Preview */}
                      <Link
                        href={`/article/${art.slug}`}
                        target="_blank"
                        className="w-8 h-8 rounded-full flex items-center justify-center text-[#1d1d1f]/60 hover:text-black dark:text-white/60 dark:hover:text-white hover:bg-black/[0.05] dark:hover:bg-white/[0.08] active:scale-95 transition-all"
                        title="View Live Article"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </Link>

                      {/* Slot Assignment */}
                      <Link
                        href={`/admin/slots?pinId=${art.id}`}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-[#1d1d1f]/60 hover:text-black dark:text-white/60 dark:hover:text-white hover:bg-black/[0.05] dark:hover:bg-white/[0.08] active:scale-95 transition-all"
                        title="Pin to Broadsheet Slot"
                      >
                        <LayoutGrid className="w-4 h-4" />
                      </Link>

                      {/* Edit Button */}
                      <Link
                        href={`/admin/articles/${art.id}/edit`}
                        className="h-8 px-3.5 rounded-full bg-black/[0.04] dark:bg-white/[0.06] hover:bg-[#0071e3] hover:text-white dark:hover:bg-[#0071e3] dark:hover:text-white text-xs font-semibold text-[#1d1d1f] dark:text-white flex items-center gap-1.5 active:scale-95 transition-all"
                        title="Edit Article"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </Link>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => promptDelete(art.id, art.title)}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-red-500/60 hover:text-red-600 hover:bg-red-500/10 active:scale-95 transition-all"
                        title="Retract / Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}

      {/* Retract Confirmation Modal */}
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

