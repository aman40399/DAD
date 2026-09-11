'use client'

import { useState, useEffect, useMemo, useRef, useDeferredValue } from 'react'
import { createPortal } from 'react-dom'
import AdminToast, { ToastMessage } from '@/components/admin/AdminToast'
import {
  IconMedia,
  IconSearch,
  IconClose,
  IconCheck,
  IconCopy,
  IconPlus,
  IconExternalLink,
  IconRefresh,
  IconLayoutGrid,
  IconListBullet,
  IconTrash,
  IconAlert,
} from '@/components/admin/AdminIcons'
import { Trash2, AlertTriangle, ExternalLink, Loader2 } from 'lucide-react'

export interface MediaItem {
  id: string
  url: string
  title: string
  source: 'upload' | 'article'
  aspectRatio: string
  createdAt: string
  size?: number
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop&q=80'

function formatBytes(bytes?: number): string {
  if (!bytes || bytes === 0) return '—'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

function getFilename(url: string, title?: string): string {
  try {
    const parts = url.split('/')
    const last = parts[parts.length - 1]
    if (last && last.includes('.')) return last.split('?')[0]
  } catch {
    // fallback
  }
  return title || 'asset'
}

function getAbsoluteUrl(url: string): string {
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  if (typeof window !== 'undefined') return `${window.location.origin}${url}`
  return url
}

export default function AdminMediaVaultPage() {
  const [mounted, setMounted] = useState(false)
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [isUploading, setIsUploading] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null)
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Story reference tracking & deletion modal state
  const [articles, setArticles] = useState<any[]>([])
  const [deleteTarget, setDeleteTarget] = useState<{
    item: MediaItem
    usedIn: any[]
  } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Keyboard shortcut listener to close modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (deleteTarget && !isDeleting) {
          setDeleteTarget(null)
        } else if (selectedItem) {
          setSelectedItem(null)
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [deleteTarget, isDeleting, selectedItem])

  const addToast = (type: 'success' | 'error' | 'info', title: string, description?: string) => {
    setToasts((prev) => [...prev, { id: `${Date.now()}-${Math.random()}`, type, title, description }])
  }

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  const fetchArticles = async () => {
    try {
      const res = await fetch('/api/articles?status=all&limit=500')
      if (res.ok) {
        const data = await res.json()
        setArticles(data.articles || [])
      }
    } catch {
      // ignore
    }
  }

  const fetchMedia = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/media?_t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      })
      if (res.ok) {
        const data = await res.json()
        setMediaItems(data.media || [])
      }
    } catch (e) {
      addToast('error', 'Storage Access Error', 'Could not retrieve media assets from Cloudflare.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMedia()
    fetchArticles()
  }, [])

  // Optimized lookup map to check story usage across all media assets
  const mediaUsageMap = useMemo(() => {
    const map = new Map<string, any[]>()
    if (!articles.length || !mediaItems.length) return map

    mediaItems.forEach((item) => {
      const rawUrl = (item.url || '').split('?')[0].trim()
      const filename = getFilename(item.url, item.title).split('?')[0].trim()
      let decodedFilename = filename
      try {
        decodedFilename = decodeURIComponent(filename)
      } catch {}

      const usedIn = articles.filter((art) => {
        const heroUrl = ((art.image_url || art.imageUrl || '') as string).split('?')[0].trim()
        if (heroUrl) {
          if (
            heroUrl === rawUrl ||
            (filename && heroUrl.includes(filename)) ||
            (decodedFilename && heroUrl.includes(decodedFilename))
          ) {
            return true
          }
        }
        const content = (art.content || '') as string
        if (content) {
          if (
            (rawUrl && content.includes(rawUrl)) ||
            (filename && content.includes(filename)) ||
            (decodedFilename && content.includes(decodedFilename))
          ) {
            return true
          }
        }
        const excerpt = (art.excerpt || '') as string
        if (excerpt && rawUrl && excerpt.includes(rawUrl)) {
          return true
        }
        return false
      })

      map.set(item.id, usedIn)
    })

    return map
  }, [articles, mediaItems])

  const getArticlesUsingMedia = (item: MediaItem) => {
    return mediaUsageMap.get(item.id) || []
  }

  const promptDelete = (item: MediaItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    const usedIn = getArticlesUsingMedia(item)
    setDeleteTarget({ item, usedIn })
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    const targetItem = deleteTarget.item
    const targetId = targetItem.id
    setIsDeleting(true)
    try {
      const res = await fetch('/api/media', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetItem.url, id: targetId }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || 'Delete failed')
      }

      setDeletingId(targetId)
      setDeleteTarget(null)
      if (selectedItem?.id === targetId || selectedItem?.url === targetItem.url) {
        setSelectedItem(null)
      }

      setTimeout(() => {
        setMediaItems((prev) => prev.filter((m) => m.id !== targetId && m.url !== targetItem.url))
        setDeletingId(null)
      }, 400)

      addToast('success', 'Asset Deleted', `"${getFilename(targetItem.url, targetItem.title)}" removed permanently from Cloudflare R2.`)
    } catch (err: any) {
      addToast('error', 'Deletion Error', err.message || 'Could not delete asset from storage.')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCopy = (url: string, id: string) => {
    const absoluteUrl = url.startsWith('http://') || url.startsWith('https://')
      ? url
      : `${window.location.origin}${url}`
    navigator.clipboard.writeText(absoluteUrl)
    setCopiedId(id)
    addToast('info', 'Link Copied', 'Direct CDN URL copied to clipboard.')
    setTimeout(() => setCopiedId(null), 2000)
  }

  const uploadFileToServer = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      addToast('error', 'Invalid File', 'Only image files (JPEG, PNG, WebP, AVIF) are supported.')
      return
    }

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('aspectRatio', '16:10')

      const res = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Upload failed')
      }

      const uploadData = await res.json()

      if (uploadData && uploadData.url) {
        const rawName = (uploadData.key || file.name)
          .replace(/^news\//, '')
          .replace(/^[0-9]+-/, '')
          .replace(/\.[^/.]+$/, '')
          .replace(/[-_]+/g, ' ')
          .trim()
        const optimisticItem: MediaItem = {
          id: `r2-${uploadData.key || uploadData.url}`,
          url: uploadData.url,
          title: rawName || file.name,
          source: 'upload',
          aspectRatio: uploadData.aspectRatio || '16:10',
          createdAt: new Date().toISOString(),
          size: file.size || uploadData.size,
        }
        setMediaItems((prev) => [optimisticItem, ...prev.filter((m) => m.url !== optimisticItem.url)])
      }

      addToast('success', 'File Uploaded', `${file.name} saved permanently to Cloudflare R2.`)
      await fetchMedia()
    } catch (err: any) {
      addToast('error', 'Upload Error', err.message || 'Could not upload file to Cloudflare.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      Array.from(files).forEach((file) => uploadFileToServer(file))
    }
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      Array.from(files).forEach((file) => uploadFileToServer(file))
    }
  }

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (selectedItem) {
      const original = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = original
      }
    }
  }, [selectedItem])

  const deferredSearch = useDeferredValue(search)

  const filteredItems = useMemo(() => {
    if (!deferredSearch.trim()) return mediaItems
    const q = deferredSearch.toLowerCase()
    return mediaItems.filter((item) => {
      const filename = getFilename(item.url, item.title).toLowerCase()
      return filename.includes(q) || item.url.toLowerCase().includes(q)
    })
  }, [mediaItems, deferredSearch])

  return (
    <div
      className="space-y-6 font-apple text-[#1d1d1f] dark:text-white"
      onDrop={handleDrop}
      onDragOver={(e) => {
        e.preventDefault()
        setIsDragging(true)
      }}
      onDragLeave={() => setIsDragging(false)}
    >
      <AdminToast toasts={toasts} onDismiss={removeToast} />

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* APPLE MINIMALIST HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3.5 flex-wrap">
          <h1 className="hidden md:block text-3xl sm:text-4xl font-semibold tracking-tight text-[#1d1d1f] dark:text-white">
            Media
          </h1>

          {/* Unified Status Capsule Box */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full backdrop-blur-xl bg-white/70 dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.08] text-xs font-medium shadow-2xs">
            <span className="text-[#0071e3] dark:text-[#2997ff] font-semibold">
              {mediaItems.length} Assets
            </span>
            <span className="text-black/20 dark:text-white/20">•</span>
            <span className="text-[#1d1d1f]/60 dark:text-white/60">Cloudflare R2</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={fetchMedia}
            disabled={loading}
            className="w-9 h-9 rounded-full backdrop-blur-md bg-white/70 dark:bg-white/[0.06] hover:bg-black/5 dark:hover:bg-white/10 border border-black/[0.06] dark:border-white/[0.08] text-[#1d1d1f] dark:text-white flex items-center justify-center transition shadow-2xs active:scale-95 cursor-pointer"
            title="Refresh assets"
          >
            <IconRefresh className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="h-9 px-4 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-semibold tracking-tight transition shadow-[0_2px_8px_rgba(0,113,227,0.35)] flex items-center gap-2 active:scale-95 cursor-pointer"
          >
            <IconPlus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>{isUploading ? 'Uploading…' : 'Upload Asset'}</span>
          </button>
        </div>
      </div>

      {/* CONTROLS BAR: SEARCH & VIEW TOGGLE */}
      <div className="p-2 sm:p-3 rounded-2xl backdrop-blur-xl bg-white/70 dark:bg-[#1c1c1e]/70 border border-black/[0.06] dark:border-white/[0.08] shadow-xs flex items-center justify-between gap-3">
        {/* Apple Pill Search Input */}
        <div className="relative flex-1 sm:max-w-xs">
          <IconSearch className="absolute left-3.5 top-3 w-4 h-4 text-[#1d1d1f]/40 dark:text-white/40 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search media files…"
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

        <div className="flex items-center gap-3">
          <span className="text-xs text-[#1d1d1f]/50 dark:text-white/50 hidden sm:inline">
            {filteredItems.length} assets
          </span>

          {/* Segmented View Mode Toggle */}
          <div className="flex items-center p-1 bg-black/[0.04] dark:bg-white/[0.06] rounded-full border border-black/[0.03] dark:border-white/[0.05]">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`w-8 h-7 rounded-full flex items-center justify-center transition active:scale-95 ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-[#2c2c2e] text-[#0071e3] dark:text-[#2997ff] shadow-xs'
                  : 'text-[#1d1d1f]/50 dark:text-white/50 hover:text-[#1d1d1f] dark:hover:text-white'
              }`}
              title="Grid View"
            >
              <IconLayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`w-8 h-7 rounded-full flex items-center justify-center transition active:scale-95 ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-[#2c2c2e] text-[#0071e3] dark:text-[#2997ff] shadow-xs'
                  : 'text-[#1d1d1f]/50 dark:text-white/50 hover:text-[#1d1d1f] dark:hover:text-white'
              }`}
              title="List View"
            >
              <IconListBullet className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* DROPZONE BANNER */}
      {isDragging && (
        <div className="p-10 border-2 border-dashed border-[#0071e3] bg-[#0071e3]/5 rounded-3xl text-center space-y-2 animate-in fade-in duration-150 backdrop-blur-md">
          <IconMedia className="w-8 h-8 text-[#0071e3] mx-auto" />
          <p className="text-xs font-semibold text-[#0071e3]">
            Release to upload image files to Cloudflare R2
          </p>
        </div>
      )}

      {/* ASSETS CONTAINER */}
      <div className="rounded-3xl backdrop-blur-2xl bg-white/70 dark:bg-[#1c1c1e]/70 border border-black/[0.06] dark:border-white/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.03)] p-4 sm:p-6 min-h-[400px]">
        {loading ? (
          <div className="py-24 text-center flex flex-col items-center justify-center gap-3">
            <span className="w-6 h-6 border-2 border-[#0071e3]/30 border-t-[#0071e3] rounded-full animate-spin" />
            <p className="text-xs text-[#1d1d1f]/50 dark:text-white/50">Loading cloud assets…</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <IconMedia className="w-10 h-10 text-[#1d1d1f]/30 dark:text-white/30 mx-auto" />
            <h3 className="font-semibold text-sm text-[#1d1d1f] dark:text-white">
              No media files found
            </h3>
            <p className="text-xs text-[#1d1d1f]/50 dark:text-white/50 max-w-sm mx-auto">
              Drag and drop image files here or click Upload Asset to store files on Cloudflare.
            </p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-5 py-2.5 bg-[#0071e3] text-white text-xs font-semibold rounded-full hover:bg-[#0077ed] transition shadow-xs cursor-pointer active:scale-95"
            >
              Upload First Asset
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          /* GRID VIEW: Apple Photos Cards */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {filteredItems.map((item) => {
              const filename = getFilename(item.url, item.title)
              const isCopied = copiedId === item.id
              const usedIn = mediaUsageMap.get(item.id) || []
              const isDisintegrating = deletingId === item.id

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`group p-2.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] hover:bg-white dark:hover:bg-[#2c2c2e] border border-black/[0.04] dark:border-white/[0.06] hover:border-black/[0.08] dark:hover:border-white/[0.12] shadow-xs hover:shadow-md transition-all flex flex-col justify-between cursor-pointer active:scale-[0.98] ${
                    isDisintegrating ? 'article-disintegrate-swipe' : ''
                  }`}
                >
                  <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-black/[0.05] dark:bg-white/[0.05] mb-2">
                    <img
                      src={item.url}
                      alt={filename}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        const target = e.currentTarget
                        target.onerror = null
                        target.src = FALLBACK_IMAGE
                      }}
                    />

                    {/* Story Usage Badge if in active articles */}
                    {usedIn.length > 0 && (
                      <div className="absolute top-2 left-2 z-10">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/90 text-white backdrop-blur-md shadow-2xs flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                          <span>{usedIn.length} in use</span>
                        </span>
                      </div>
                    )}

                    {/* Top Right Floating Action Pills */}
                    <div className="absolute top-2 right-2 flex items-center gap-1 z-10 opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 bg-black/60 hover:bg-black text-white rounded-full transition-all shadow-xs"
                        title="Open in new tab"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <button
                        type="button"
                        onClick={(e) => promptDelete(item, e)}
                        className="p-1.5 bg-black/60 hover:bg-red-600 text-white rounded-full transition-all shadow-xs cursor-pointer active:scale-95"
                        title={usedIn.length > 0 ? `In use (${usedIn.length} stories) - Delete asset` : 'Delete asset'}
                        aria-label="Delete asset"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-0.5 mb-2">
                    <p className="text-xs font-semibold text-[#1d1d1f] dark:text-white truncate tracking-tight" title={filename}>
                      {filename}
                    </p>
                    <p className="text-[10px] text-[#1d1d1f]/50 dark:text-white/50 font-mono">
                      {formatBytes(item.size)}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 w-full">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleCopy(item.url, item.id)
                      }}
                      className={`flex-1 py-1.5 text-[11px] font-semibold rounded-full border transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 ${
                        isCopied
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                          : 'border-black/[0.08] dark:border-white/[0.1] hover:border-[#0071e3] text-[#1d1d1f] dark:text-white bg-white/80 dark:bg-white/[0.05]'
                      }`}
                    >
                      {isCopied ? (
                        <>
                          <IconCheck className="w-3 h-3 text-emerald-500" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <span>Copy Link</span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={(e) => promptDelete(item, e)}
                      className={`p-1.5 rounded-full border transition cursor-pointer active:scale-95 shrink-0 ${
                        usedIn.length > 0
                          ? 'border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/50'
                          : 'border-black/[0.08] dark:border-white/[0.1] hover:border-red-500/30 hover:bg-red-500/10 text-[#1d1d1f]/50 hover:text-red-600 dark:text-white/50 dark:hover:text-red-400'
                      }`}
                      title={usedIn.length > 0 ? `Used in ${usedIn.length} story(ies) - click to delete` : 'Delete asset'}
                      aria-label="Delete asset"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          /* LIST VIEW: Apple macOS Table */
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-sans border-collapse text-left">
              <thead>
                <tr className="border-b border-black/[0.06] dark:border-white/[0.08] text-[11px] font-semibold text-[#1d1d1f]/50 dark:text-white/50">
                  <th className="py-3 px-4">Asset</th>
                  <th className="py-3 px-4">Size</th>
                  <th className="py-3 px-4">Direct Link</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.05]">
                {filteredItems.map((item) => {
                  const filename = getFilename(item.url, item.title)
                  const isCopied = copiedId === item.id
                  const usedIn = mediaUsageMap.get(item.id) || []
                  const isDisintegrating = deletingId === item.id

                  return (
                    <tr
                      key={item.id}
                      onClick={() => setSelectedItem(item)}
                      className={`hover:bg-black/[0.015] dark:hover:bg-white/[0.02] transition cursor-pointer ${
                        isDisintegrating ? 'article-disintegrate-swipe' : ''
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl overflow-hidden bg-black/[0.05] dark:bg-white/[0.05] shrink-0 border border-black/[0.06] dark:border-white/[0.08]">
                            <img
                              src={item.url}
                              alt=""
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.currentTarget
                                target.onerror = null
                                target.src = FALLBACK_IMAGE
                              }}
                            />
                          </div>
                          <div className="min-w-0">
                            <span className="font-semibold text-xs text-[#1d1d1f] dark:text-white tracking-tight truncate block max-w-xs sm:max-w-md">
                              {filename}
                            </span>
                            {usedIn.length > 0 && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-600 dark:text-amber-400 mt-0.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                <span>Used in {usedIn.length} {usedIn.length === 1 ? 'story' : 'stories'}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-[11px] font-mono text-[#1d1d1f]/50 dark:text-white/50 whitespace-nowrap">
                        {formatBytes(item.size)}
                      </td>
                      <td className="py-3 px-4 text-[11px] font-mono text-[#1d1d1f]/50 dark:text-white/50 truncate max-w-xs">
                        {item.url}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleCopy(item.url, item.id)}
                            className={`px-3 py-1 text-[11px] font-semibold rounded-full border transition cursor-pointer inline-flex items-center gap-1 active:scale-95 ${
                              isCopied
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                                : 'border-black/[0.08] dark:border-white/[0.1] hover:border-[#0071e3] text-[#1d1d1f] dark:text-white'
                            }`}
                          >
                            {isCopied ? (
                              <>
                                <IconCheck className="w-3 h-3 text-emerald-500" />
                                <span>Copied</span>
                              </>
                            ) : (
                              <span>Copy Link</span>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={(e) => promptDelete(item, e)}
                            className={`p-1.5 rounded-full transition cursor-pointer active:scale-95 ${
                              usedIn.length > 0
                                ? 'text-amber-600 hover:text-red-600 hover:bg-red-500/10'
                                : 'text-[#1d1d1f]/50 hover:text-red-600 dark:text-white/50 dark:hover:text-red-400 hover:bg-red-500/10'
                            }`}
                            title={usedIn.length > 0 ? `Used in ${usedIn.length} stories - click to delete` : 'Delete asset'}
                            aria-label="Delete asset"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

      {/* APPLE ASSET DETAIL SHEET (PORTALED TO DOCUMENT.BODY) */}
      {selectedItem && mounted && createPortal(
        <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-md transition-opacity"
            onClick={() => setSelectedItem(null)}
          />

          <div className="relative w-full sm:max-w-lg backdrop-blur-3xl bg-white/95 dark:bg-[#1c1c1e]/95 border border-black/[0.08] dark:border-white/[0.1] rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 sm:p-6 space-y-4 z-10 animate-in slide-in-from-bottom duration-200">
            {/* iOS Drag Handle on Mobile */}
            <div className="sm:hidden pt-0.5 pb-2 flex justify-center">
              <div className="w-10 h-1 rounded-full bg-black/20 dark:bg-white/20" />
            </div>

            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-base text-[#1d1d1f] dark:text-white tracking-tight truncate">
                  {getFilename(selectedItem.url, selectedItem.title)}
                </h3>
                <p className="text-[11px] text-[#1d1d1f]/50 dark:text-white/50 font-mono mt-0.5">
                  {formatBytes(selectedItem.size)} • {selectedItem.aspectRatio || '16:10'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="p-1.5 rounded-full hover:bg-black/[0.05] dark:hover:bg-white/[0.08] text-[#1d1d1f]/50 hover:text-[#1d1d1f] dark:text-white/50 dark:hover:text-white transition cursor-pointer"
              >
                <IconClose className="w-4 h-4" />
              </button>
            </div>

            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black/[0.05] dark:bg-black/40 border border-black/[0.06] dark:border-white/[0.08] flex items-center justify-center">
              <img
                src={selectedItem.url}
                alt={selectedItem.title || ''}
                className="w-full h-full object-contain"
                onError={(e) => {
                  const target = e.currentTarget
                  target.onerror = null
                  target.src = FALLBACK_IMAGE
                }}
              />
            </div>

            {/* In-Use Warning Banner in Detail Sheet */}
            {(() => {
              const usedIn = mediaUsageMap.get(selectedItem.id) || []
              if (usedIn.length === 0) return null
              return (
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 space-y-1">
                  <div className="font-semibold flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span>Attached to {usedIn.length} Active Story{usedIn.length === 1 ? '' : 'ies'}</span>
                  </div>
                  <p className="text-[11px] opacity-80 leading-relaxed">
                    This image is currently placed in active news dispatches. Deleting it will permanently break their hero image or embedded visuals.
                  </p>
                </div>
              )
            })()}

            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-[#1d1d1f]/60 dark:text-white/60 pl-1">
                Direct Cloudflare CDN URL
              </label>
              <div className="flex items-center px-4 py-2.5 bg-black/[0.03] dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.08] rounded-full">
                <input
                  type="text"
                  readOnly
                  value={getAbsoluteUrl(selectedItem.url)}
                  className="w-full bg-transparent text-xs font-mono text-[#1d1d1f] dark:text-white focus:outline-none truncate"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => promptDelete(selectedItem)}
                className="h-11 px-4 rounded-full border border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500/10 transition active:scale-95 flex items-center justify-center gap-1.5 text-xs font-semibold cursor-pointer shrink-0"
                title="Delete asset"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Delete Asset</span>
              </button>

              <button
                type="button"
                onClick={() => handleCopy(selectedItem.url, selectedItem.id)}
                className={`flex-1 h-11 text-xs font-semibold rounded-full transition cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98] shadow-xs ${
                  copiedId === selectedItem.id
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#0071e3] hover:bg-[#0077ed] text-white'
                }`}
              >
                {copiedId === selectedItem.id ? (
                  <>
                    <IconCheck className="w-4 h-4" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <IconCopy className="w-4 h-4" />
                    <span>Copy CDN Link</span>
                  </>
                )}
              </button>

              <a
                href={selectedItem.url}
                target="_blank"
                rel="noreferrer"
                className="h-11 px-4 border border-black/[0.08] dark:border-white/[0.1] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] rounded-full text-xs font-semibold flex items-center justify-center text-[#1d1d1f] dark:text-white transition cursor-pointer active:scale-95 shrink-0"
              >
                Open ↗
              </a>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* CENTERED DELETE WARNING / CONFIRMATION MODAL (PORTALED TO DOCUMENT.BODY) */}
      {deleteTarget && mounted && createPortal(
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-in fade-in duration-150 select-none"
          onClick={() => !isDeleting && setDeleteTarget(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative w-full max-w-md backdrop-blur-3xl bg-white/95 dark:bg-[#1c1c1e]/95 border border-black/[0.08] dark:border-white/[0.1] rounded-[28px] shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-150 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Minimalist Icon Badge */}
            <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center ${
              deleteTarget.usedIn.length > 0
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                : 'bg-red-500/10 text-red-600 dark:text-red-400'
            }`}>
              {deleteTarget.usedIn.length > 0 ? (
                <AlertTriangle className="w-5 h-5 stroke-[2.2]" />
              ) : (
                <Trash2 className="w-5 h-5 stroke-[2.2]" />
              )}
            </div>

            {/* Title & Warning Message */}
            <div className="space-y-1.5">
              <h3 className="text-base font-semibold tracking-tight text-[#1d1d1f] dark:text-white">
                {deleteTarget.usedIn.length > 0 ? 'Asset In Active Circulation' : 'Delete Media Asset?'}
              </h3>
              <p className="text-xs text-[#1d1d1f]/60 dark:text-white/60 max-w-xs mx-auto leading-relaxed">
                {deleteTarget.usedIn.length > 0
                  ? `Warning: This image is actively used in ${deleteTarget.usedIn.length} broadsheet ${deleteTarget.usedIn.length === 1 ? 'story' : 'stories'}. Deleting it will permanently purge it from Cloudflare R2 and break visual layouts.`
                  : `"${getFilename(deleteTarget.item.url, deleteTarget.item.title)}" will be permanently removed from Cloudflare R2 storage.`}
              </p>
            </div>

            {/* Thumbnail Preview */}
            <div className="w-24 h-16 mx-auto rounded-xl overflow-hidden border border-black/[0.06] dark:border-white/[0.1] bg-black/5 shadow-2xs">
              <img
                src={deleteTarget.item.url}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>

            {/* List of Affected Stories if in use */}
            {deleteTarget.usedIn.length > 0 && (
              <div className="text-left bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] rounded-2xl p-3.5 max-h-40 overflow-y-auto space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  Currently Used In:
                </p>
                {deleteTarget.usedIn.map((art) => (
                  <div key={art.id} className="flex items-center justify-between gap-2 text-xs py-1 border-b border-black/[0.04] dark:border-white/[0.05] last:border-0">
                    <span className="truncate font-medium text-[#1d1d1f] dark:text-white flex-1" title={art.title}>
                      {art.title}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0 ${
                      art.status === 'published'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                    }`}>
                      {art.status === 'published' ? 'Live' : 'Draft'}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Centered Actions */}
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="flex-1 h-9 text-xs font-semibold rounded-full text-[#1d1d1f]/70 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/10 transition active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 h-9 text-xs font-semibold rounded-full bg-red-600 hover:bg-red-700 text-white transition active:scale-95 shadow-xs disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting…</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5 stroke-[2.2]" />
                    <span>{deleteTarget.usedIn.length > 0 ? 'Delete Anyway' : 'Delete Asset'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
