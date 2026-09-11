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
      const res = await fetch('/api/articles?status=all')
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
          `"${deleteTarget.title}" was permanently removed from broadsheet circulation.`
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

    // Optimistic local update
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
            `"${article.title.slice(0, 35)}…" unpinned from front page.`
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
      
      // Date filter
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

    // Sort by date
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
    <div className="h-full flex-1 flex flex-col min-h-0 md:block md:space-y-5 font-sans text-ink dark:text-dark-ink">
      {/* Toast notifications */}
      <AdminToast toasts={toasts} onDismiss={removeToast} />

      {/* ========================================================================= */}
      {/* MOBILE-ONLY INTERFACE (md:hidden) — Native App Flow, Zero Box Nesting     */}
      {/* ========================================================================= */}
      <div className="md:hidden flex-1 min-h-0 flex flex-col overflow-hidden">
        {/* Pinned Top Controls (Stationary, Zero Page Scroll) */}
        <div className="shrink-0 space-y-2.5 pb-2.5">
          {/* Mobile Search Capsule */}
          <div className="relative">
            <IconSearch className="absolute left-3.5 top-3 w-4 h-4 text-ink-mute pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search stories, topics, authors…"
              className="w-full text-xs pl-10 pr-9 py-2.5 bg-paper dark:bg-white/[0.04] border border-rule/70 dark:border-white/10 text-ink dark:text-dark-ink placeholder:text-ink-mute focus:outline-none focus:border-accent rounded-full transition shadow-2xs"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-2.5 text-ink-mute hover:text-ink p-0.5"
                title="Clear search"
              >
                <IconClose className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Mobile Segmented Filter: All | Live | Drafts */}
          <div className="flex items-center bg-paper-subtle dark:bg-white/[0.04] p-1 rounded-xl border border-rule/60 dark:border-white/10 shadow-2xs">
            {(['all', 'published', 'draft'] as const).map((status) => {
              const count =
                status === 'all'
                  ? articles.length
                  : status === 'published'
                  ? publishedCount
                  : draftCount
              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => setFilter(status)}
                  className={`flex-1 py-1.5 text-xs font-bold capitalize rounded-lg transition cursor-pointer text-center ${
                    filter === status
                      ? 'bg-ink dark:bg-dark-ink text-paper dark:text-dark-paper shadow-xs'
                      : 'text-ink-mute hover:text-ink'
                  }`}
                >
                  {status === 'all' ? 'All' : status === 'published' ? 'Live' : 'Drafts'} ({count})
                </button>
              )
            })}
          </div>

          {/* Mobile Horizontal Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 -mx-1 px-1">
            {categories.map((c) => {
              const isActive = categoryFilter === c
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategoryFilter(c)}
                  className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition cursor-pointer shrink-0 ${
                    isActive
                      ? 'bg-accent text-white font-bold shadow-2xs'
                      : 'bg-paper dark:bg-white/[0.04] text-ink-mute dark:text-dark-mute hover:text-ink border border-rule/60 dark:border-white/10'
                  }`}
                >
                  {c === 'all' ? 'All Topics' : c}
                </button>
              )
            })}
          </div>
        </div>

        {/* Dedicated Scrollable Stories Cards Feed */}
        <div
          id="mobile-stories-stream"
          className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain space-y-2.5 pr-0.5 pb-20 apple-scrollbar"
          style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}
        >
          {loading ? (
            /* Loading Skeletons */
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-paper dark:bg-dark-paper border border-rule/60 dark:border-white/10 rounded-2xl p-4 space-y-3 animate-pulse shadow-xs"
                >
                  <div className="flex justify-between items-center">
                    <div className="h-4 w-16 bg-rule/50 dark:bg-white/10 rounded" />
                    <div className="h-5 w-14 bg-rule/50 dark:bg-white/10 rounded-full" />
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-rule/50 dark:bg-white/10 rounded w-full" />
                      <div className="h-4 bg-rule/50 dark:bg-white/10 rounded w-4/5" />
                      <div className="h-3 bg-rule/40 dark:bg-white/5 rounded w-1/2 pt-1" />
                    </div>
                    <div className="w-16 h-16 bg-rule/50 dark:bg-white/10 rounded-xl shrink-0" />
                  </div>
                  <div className="pt-2 border-t border-rule/30 dark:border-white/5 flex justify-between items-center">
                    <div className="h-3 w-24 bg-rule/40 dark:bg-white/5 rounded" />
                    <div className="h-6 w-16 bg-rule/40 dark:bg-white/5 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredArticles.length === 0 ? (
            /* Empty State */
            <div className="py-14 px-4 text-center bg-paper dark:bg-dark-paper border border-rule/60 dark:border-white/10 rounded-2xl space-y-3 shadow-xs">
              <p className="font-serif italic text-sm text-ink dark:text-dark-ink">
                {search || filter !== 'all' || categoryFilter !== 'all'
                  ? 'No dispatches match the active filters.'
                  : 'No editorial dispatches in archives yet.'}
              </p>
              {search || filter !== 'all' || categoryFilter !== 'all' ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearch('')
                    setFilter('all')
                    setCategoryFilter('all')
                    setDateFilter('all')
                  }}
                  className="px-4 py-2 bg-accent text-white text-xs font-bold uppercase tracking-wider rounded-full hover:bg-accent/90 transition shadow-xs cursor-pointer"
                >
                  Clear Filters
                </button>
              ) : (
                <Link
                  href="/admin/articles/new"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-accent text-white text-xs font-bold uppercase tracking-wider rounded-full hover:bg-accent/90 transition shadow-xs"
                >
                  <IconPlus className="w-3.5 h-3.5" />
                  <span>Write First Story</span>
                </Link>
              )}
            </div>
          ) : (
            /* Story Cards */
            filteredArticles.map((article) => {
              const img = article.image_url || article.imageUrl
              const rawDate =
                article.published_at || article.created_at || article.publishedAt || article.createdAt
              const dateDisplay = rawDate
                ? new Date(rawDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })
                : '—'

              return (
                <div
                  key={article.id}
                  className="bg-paper dark:bg-[#121214] border border-rule/50 dark:border-white/[0.06] rounded-2xl p-4 shadow-xs space-y-2.5 transition hover:border-accent/40"
                >
                  {/* Top Row: Category + Status Pill (Zero Slots) */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-accent px-2 py-0.5 bg-accent/8 dark:bg-accent/15 rounded-md">
                      {article.category}
                    </span>

                    {/* Status Toggle Pill */}
                    <button
                      type="button"
                      onClick={() => toggleStatus(article)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold tracking-wider uppercase transition cursor-pointer shrink-0 ${
                        article.status === 'published'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                      }`}
                      title="Tap to toggle Live / Draft status"
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          article.status === 'published' ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}
                      />
                      <span>{article.status === 'published' ? 'Live' : 'Draft'}</span>
                    </button>
                  </div>

                  {/* Middle Row: Headline, Excerpt & Thumbnail */}
                  <div className="flex gap-3 items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/admin/articles/${article.id}/edit`}
                        className="font-serif font-bold text-[15px] leading-snug text-ink dark:text-dark-ink hover:text-accent line-clamp-2 block"
                      >
                        {article.title}
                      </Link>
                      {(article.excerpt || article.subtitle) && (
                        <p className="text-[12px] text-ink-mute dark:text-dark-mute mt-1 line-clamp-1 font-serif italic">
                          {article.excerpt || article.subtitle}
                        </p>
                      )}
                    </div>

                    {img && (
                      <Link href={`/admin/articles/${article.id}/edit`} className="shrink-0">
                        <img
                          src={img}
                          alt=""
                          className="w-16 h-16 rounded-xl object-cover border border-rule/50 dark:border-white/[0.08]"
                          onError={(e) => (e.currentTarget.style.display = 'none')}
                        />
                      </Link>
                    )}
                  </div>

                  {/* Bottom Row: Date & Quick Touch Actions (No repeated author name) */}
                  <div className="flex items-center justify-between pt-2 border-t border-rule/40 dark:border-white/5 text-[11px]">
                    <span className="text-[11px] font-mono text-ink-mute dark:text-dark-mute">
                      {dateDisplay}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <Link
                        href={`/article/${article.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 text-ink-mute hover:text-ink hover:bg-paper-subtle dark:hover:bg-white/5 rounded-lg transition"
                        title="View live publication"
                      >
                        <IconExternalLink className="w-3.5 h-3.5" />
                      </Link>
                      <Link
                        href={`/admin/articles/${article.id}/edit`}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-paper-subtle dark:bg-white/[0.05] hover:bg-accent hover:text-white rounded-full font-semibold text-xs transition border border-rule/40 dark:border-white/10"
                      >
                        <IconEdit className="w-3 h-3" />
                        <span>Edit</span>
                      </Link>
                      <button
                        type="button"
                        onClick={() => promptDelete(article.id, article.title)}
                        className="p-1.5 text-ink-mute hover:text-red-600 hover:bg-red-500/10 rounded-lg transition cursor-pointer"
                        title="Retract dispatch"
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
      </div>

      {/* ========================================================================= */}
      {/* DESKTOP-ONLY INTERFACE (hidden md:block) — Broadsheet Ledger Architecture */}
      {/* ========================================================================= */}
      <div className="hidden md:block space-y-5">
        {/* PAGE HEADER & WRITE STORY CTA */}
        <div className="flex items-center justify-between gap-4 pb-1">
          <div>
            <h1 className="font-serif font-bold text-2xl text-ink dark:text-dark-ink">
              Stories Desk
            </h1>
            <p className="text-xs text-ink-mute dark:text-dark-mute mt-0.5 font-serif italic">
              Manage, curate, and author broadsheet dispatches
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <a
              href="/api/admin/backup"
              download
              className="inline-flex items-center gap-1.5 h-9 px-3.5 bg-paper dark:bg-white/[0.04] hover:bg-black/5 dark:hover:bg-white/10 border border-rule dark:border-white/10 rounded-full text-xs font-semibold text-ink dark:text-dark-ink transition shadow-2xs"
              title="Download full JSON backup of all published articles and drafts"
            >
              <svg className="w-3.5 h-3.5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Backup JSON</span>
            </a>
            <Link
              href="/admin/articles/new"
              className="inline-flex items-center gap-2 h-9 px-4 bg-accent hover:bg-accent/90 border border-accent rounded-full text-xs font-bold uppercase tracking-wider text-white transition-all shadow-xs hover:shadow hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <IconPlus className="w-3.5 h-3.5" />
              <span>Write Story</span>
            </Link>
          </div>
        </div>

        {/* DESKTOP EXECUTIVE OVERVIEW METRIC TILES */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="p-4 bg-paper-subtle dark:bg-dark-subtle border border-rule dark:border-dark-rule rounded-2xl shadow-xs transition hover:border-ink-mute">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-ink-mute dark:text-dark-mute block">
              Total Stories
            </span>
            <p className="font-serif font-black text-2xl sm:text-3xl text-ink dark:text-dark-ink mt-1">
              {loading ? '…' : articles.length}
            </p>
            <p className="text-[11px] text-ink-mute dark:text-dark-mute mt-0.5">Authored broadsheet stories</p>
          </div>

          <div className="p-4 bg-paper-subtle dark:bg-dark-subtle border border-rule dark:border-dark-rule rounded-2xl shadow-xs transition hover:border-emerald-500/50">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-emerald-600 dark:text-emerald-400 block">
              Published
            </span>
            <p className="font-serif font-black text-2xl sm:text-3xl text-ink dark:text-dark-ink mt-1">
              {loading ? '…' : publishedCount}
            </p>
            <p className="text-[11px] text-ink-mute dark:text-dark-mute mt-0.5">Live on front page feed</p>
          </div>

          <div className="p-4 bg-paper-subtle dark:bg-dark-subtle border border-rule dark:border-dark-rule rounded-2xl shadow-xs transition hover:border-amber-500/50">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-amber-600 dark:text-amber-400 block">
              Drafts
            </span>
            <p className="font-serif font-black text-2xl sm:text-3xl text-ink dark:text-dark-ink mt-1">
              {loading ? '…' : draftCount}
            </p>
            <p className="text-[11px] text-ink-mute dark:text-dark-mute mt-0.5">Under authoring or review</p>
          </div>

          <div className="p-4 bg-paper-subtle dark:bg-dark-subtle border border-rule dark:border-dark-rule rounded-2xl shadow-xs transition hover:border-accent">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-accent">
                Curated Slots
              </span>
              <Link
                href="/admin/slots"
                className="text-[10px] font-mono text-accent hover:underline font-bold"
              >
                Curate →
              </Link>
            </div>
            <p className="font-serif font-black text-2xl sm:text-3xl text-ink dark:text-dark-ink mt-1">
              {loading ? '…' : `${pinnedCount} / 15`}
            </p>
            <p className="text-[11px] text-ink-mute dark:text-dark-mute mt-0.5">Pinned broadsheet positions</p>
          </div>
        </div>

        {/* FILTER & SEARCH TOOLBAR */}
        <div className="p-2.5 sm:p-3.5 bg-paper-subtle dark:bg-dark-subtle border border-rule dark:border-dark-rule rounded-2xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 shadow-xs">
          {/* Status Filter Segmented Control */}
          <div className="flex items-center bg-paper dark:bg-dark-paper p-0.5 rounded-xl border border-rule/60 dark:border-white/10 shrink-0">
            {(['all', 'published', 'draft'] as const).map((status) => {
              const count =
                status === 'all'
                  ? articles.length
                  : status === 'published'
                  ? publishedCount
                  : draftCount
              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => setFilter(status)}
                  className={`px-3 py-1.5 text-xs font-bold capitalize rounded-lg transition cursor-pointer text-center ${
                    filter === status
                      ? 'bg-ink dark:bg-dark-ink text-paper dark:text-dark-paper shadow-xs'
                      : 'text-ink-mute hover:text-ink'
                  }`}
                >
                  {status} ({count})
                </button>
              )
            })}
          </div>

          {/* Secondary Filters & Search Bar */}
          <div className="flex items-center gap-2">
            {/* Category Dropdown */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs px-2.5 py-1.5 bg-paper dark:bg-dark-paper border border-rule dark:border-dark-rule text-ink dark:text-dark-ink rounded-xl focus:outline-none focus:border-accent font-medium cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c === 'all' ? 'All Categories' : c}
                </option>
              ))}
            </select>

            {/* Date Sort Toggle */}
            <button
              type="button"
              onClick={() => setDateSort((prev) => (prev === 'newest' ? 'oldest' : 'newest'))}
              className="text-xs px-2.5 py-1.5 bg-paper dark:bg-dark-paper border border-rule dark:border-dark-rule text-ink dark:text-dark-ink rounded-xl hover:border-accent font-mono text-[11px] cursor-pointer transition"
              title="Sort direction"
            >
              {dateSort === 'newest' ? 'Newest ↓' : 'Oldest ↑'}
            </button>

            {/* Live Search Input */}
            <div className="relative w-56">
              <IconSearch className="absolute left-3 top-2.5 w-3.5 h-3.5 text-ink-mute pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search dispatches…"
                className="w-full text-xs pl-8 pr-7 py-1.5 bg-paper dark:bg-dark-paper border border-rule dark:border-dark-rule text-ink dark:text-dark-ink placeholder:text-ink-mute focus:outline-none focus:border-accent rounded-xl"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-2 text-ink-mute hover:text-ink"
                  title="Clear search"
                >
                  <IconClose className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {(search || filter !== 'all' || categoryFilter !== 'all' || dateFilter !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearch('')
                  setFilter('all')
                  setCategoryFilter('all')
                  setDateFilter('all')
                  setDateSort('newest')
                }}
                className="px-2.5 py-1.5 text-xs font-sans font-bold uppercase tracking-wider text-ink-mute hover:text-accent border border-rule dark:border-dark-rule rounded-xl whitespace-nowrap cursor-pointer transition bg-paper dark:bg-dark-paper"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* DISPATCHES TABLE - DESKTOP BROADSHEET LEDGER */}
        <div className="border border-rule dark:border-dark-rule rounded-2xl bg-paper dark:bg-dark-paper shadow-xs overflow-hidden flex flex-col">
          {/* Ledger Header Bar */}
          <div className="px-4 py-2.5 bg-paper-subtle/80 dark:bg-dark-subtle/80 border-b border-rule/60 dark:border-dark-rule/60 flex items-center justify-between text-[11px] font-sans text-ink-mute dark:text-dark-mute">
            <span>Showing <strong className="text-ink dark:text-dark-ink font-semibold">{filteredArticles.length}</strong> of {articles.length} dispatches</span>
            <span className="text-[10.5px] font-mono opacity-80">Scrollable Archive View</span>
          </div>

          {loading ? (
            <div className="py-20 text-center text-ink-mute font-mono text-xs">
              Fetching dispatch records…
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="py-20 text-center px-4 space-y-3">
              {search || filter !== 'all' || categoryFilter !== 'all' || dateFilter !== 'all' ? (
                <>
                  <p className="font-serif italic text-sm text-ink dark:text-dark-ink">
                    No dispatches match the active search and filter criteria.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearch('')
                      setFilter('all')
                      setCategoryFilter('all')
                      setDateFilter('all')
                    }}
                    className="inline-block px-4 py-2 bg-accent text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-accent/90 transition cursor-pointer shadow-xs"
                  >
                    Clear Filters
                  </button>
                </>
              ) : (
                <>
                  <p className="font-serif italic text-sm text-ink dark:text-dark-ink">
                    No editorial dispatches recorded in archives.
                  </p>
                  <Link
                    href="/admin/articles/new"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-accent text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-accent/90 transition shadow-xs"
                  >
                    <IconPlus className="w-3.5 h-3.5" />
                    <span>Write your first story</span>
                  </Link>
                </>
              )}
            </div>
          ) : (
            <div className="max-h-[580px] overflow-y-auto overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 z-10 bg-paper-subtle/95 dark:bg-dark-subtle/95 backdrop-blur-xs border-b border-rule dark:border-dark-rule shadow-xs">
                  <tr className="text-[10.5px] font-sans font-bold uppercase tracking-wider text-ink-mute dark:text-dark-mute">
                    <th className="px-4 py-3 w-16 text-center">Media</th>
                    <th className="px-4 py-3">Headline &amp; Deck</th>
                    <th className="px-4 py-3 w-28">Category</th>
                    <th className="px-4 py-3 w-28">Date</th>
                    <th className="px-4 py-3 w-40">Broadsheet Slot</th>
                    <th className="px-4 py-3 w-24">Status</th>
                    <th className="px-4 py-3 w-28 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rule/60 dark:divide-dark-rule/60">
                  {filteredArticles.map((article) => {
                    const img = article.image_url || article.imageUrl
                    const rawDate = article.published_at || article.created_at || article.publishedAt || article.createdAt
                    const dateDisplay = rawDate
                      ? new Date(rawDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })
                      : '—'
                    const pos =
                      typeof article.homepage_position === 'number'
                        ? article.homepage_position
                        : typeof (article as any).homepagePosition === 'number'
                        ? (article as any).homepagePosition
                        : null
                    const slotDesc = pos ? SLOT_NAMES[pos] || `Slot ${pos}` : null

                    return (
                      <tr
                        key={article.id}
                        className="hover:bg-paper-subtle/70 dark:hover:bg-dark-subtle/50 transition duration-150"
                      >
                        {/* Thumbnail with rounded corners */}
                        <td className="px-4 py-3">
                          <div className="w-12 h-8 bg-paper-subtle dark:bg-dark-subtle rounded-lg border border-rule dark:border-dark-rule overflow-hidden relative flex items-center justify-center">
                            {img ? (
                              <img
                                src={img}
                                alt=""
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none'
                                }}
                              />
                            ) : (
                              <span className="font-serif italic text-[11px] text-ink-mute font-bold">
                                {article.title.charAt(0)}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Headline & Byline */}
                        <td className="px-4 py-3 max-w-md">
                          <Link
                            href={`/admin/articles/${article.id}/edit`}
                            className="font-serif font-bold text-sm leading-snug text-ink dark:text-dark-ink hover:text-accent transition line-clamp-1"
                          >
                            {article.title}
                          </Link>
                          <p className="text-[11px] text-ink-mute dark:text-dark-mute mt-0.5 line-clamp-1 font-serif italic">
                            By Dhananjay Singh · {article.excerpt || article.subtitle || 'Broadsheet dispatch'}
                          </p>
                        </td>

                        {/* Category pill */}
                        <td className="px-4 py-3">
                          <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-accent px-2.5 py-0.5 bg-accent/10 border border-accent/25 rounded-full inline-block">
                            {article.category}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="px-4 py-3 whitespace-nowrap text-ink-mute dark:text-dark-mute font-mono text-[11px]">
                          {dateDisplay}
                        </td>

                      {/* Broadsheet Slot pill */}
                      <td className="px-4 py-3">
                        {pos ? (
                          <Link
                            href={`/admin/slots?slot=${pos}`}
                            className="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold px-2 py-0.5 bg-accent/15 text-accent border border-accent/35 rounded-md hover:bg-accent/25 transition"
                            title={`Pinned to broadsheet slot ${pos} (Click to curate)`}
                          >
                            <IconPin className="w-2.5 h-2.5" />
                            <span>Slot {String(pos).padStart(2, '0')}</span>
                            <span className="opacity-40">/</span>
                            <span className="truncate max-w-[90px]">{slotDesc}</span>
                          </Link>
                        ) : (
                          <span className="font-mono text-[10.5px] text-ink-mute dark:text-dark-mute flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-ink-mute/50" />
                            <span>Auto-flow</span>
                          </span>
                        )}
                      </td>

                      {/* Publication Status toggle button */}
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => toggleStatus(article)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase transition cursor-pointer ${
                            article.status === 'published'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500/20'
                          }`}
                          title="Click to toggle status"
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              article.status === 'published' ? 'bg-emerald-500' : 'bg-amber-500'
                            }`}
                          />
                          <span>{article.status === 'published' ? 'Published' : 'Draft'}</span>
                        </button>
                      </td>

                      {/* Micro-Actions */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/admin/articles/${article.id}/edit`}
                            className="p-1.5 hover:text-accent hover:bg-accent/10 rounded-lg transition text-ink-mute"
                            title="Edit dispatch"
                          >
                            <IconEdit className="w-3.5 h-3.5" />
                          </Link>
                          {article.slug && (
                            <Link
                              href={`/article/${article.slug}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 hover:text-accent hover:bg-accent/10 rounded-lg transition text-ink-mute"
                              title="View live publication"
                            >
                              <IconExternalLink className="w-3.5 h-3.5" />
                            </Link>
                          )}
                          <button
                            type="button"
                            onClick={() => promptDelete(article.id, article.title)}
                            className="p-1.5 text-ink-mute hover:text-red-600 hover:bg-red-500/10 rounded-lg transition cursor-pointer"
                            title="Retract dispatch"
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
    </div>

      {/* MODALS */}
      <DeleteArticleModal
        isOpen={Boolean(deleteTarget)}
        isDeleting={isDeleting}
        articleTitle={deleteTarget?.title || ''}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
      <AdminToast toasts={toasts} onDismiss={removeToast} />
    </div>
  )
}
