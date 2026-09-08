'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
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
} from '@/components/admin/AdminIcons'

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
    if (last && last.includes('.')) return last
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

  const addToast = (type: 'success' | 'error' | 'info', title: string, description?: string) => {
    setToasts((prev) => [...prev, { id: `${Date.now()}-${Math.random()}`, type, title, description }])
  }

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  const fetchMedia = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/media?_t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        },
      })
      if (res.ok) {
        const data = await res.json()
        setMediaItems(data.media || [])
      }
    } catch (e) {
      console.error('Failed to load media assets:', e)
      addToast('error', 'Storage Access Error', 'Could not retrieve media assets from Cloudflare.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMedia()
  }, [])

  const handleCopy = (url: string, id: string) => {
    const absoluteUrl = url.startsWith('http://') || url.startsWith('https://')
      ? url
      : `${window.location.origin}${url}`
    navigator.clipboard.writeText(absoluteUrl)
    setCopiedId(id)
    addToast('info', 'Link Copied', 'Direct media URL copied to clipboard.')
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

      // Optimistically insert newly uploaded asset immediately into view
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

      addToast('success', 'File Uploaded', `${file.name} saved to Cloudflare R2.`)
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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const filteredItems = useMemo(() => {
    if (!search.trim()) return mediaItems
    const q = search.toLowerCase()
    return mediaItems.filter((item) => {
      const filename = getFilename(item.url, item.title).toLowerCase()
      return filename.includes(q) || item.url.toLowerCase().includes(q)
    })
  }, [mediaItems, search])

  return (
    <div
      className="space-y-5 font-sans text-ink dark:text-dark-ink"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-rule/60 dark:border-white/[0.08]">
        {/* Desktop-only Page Title (Zero Duplicate Heading on Mobile) */}
        <div className="hidden md:block">
          <div className="flex items-center gap-2">
            <h1 className="font-serif font-bold text-xl sm:text-2xl text-ink dark:text-dark-ink">
              Media Vault
            </h1>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-paper-subtle dark:bg-white/10 border border-rule/60 dark:border-white/10 text-ink-mute dark:text-dark-mute">
              Cloudflare R2
            </span>
          </div>
          <p className="text-xs text-ink-mute dark:text-dark-mute mt-0.5 font-serif italic">
            Manage media assets and copy direct CDN links
          </p>
        </div>

        {/* Controls: Search, View Mode, Refresh, Upload */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* Search Input */}
          <div className="relative flex-1 md:w-56">
            <IconSearch className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-ink-mute pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search files…"
              className="w-full text-xs pl-8 pr-7 py-2 bg-paper dark:bg-white/[0.06] border border-rule/60 dark:border-white/10 text-ink dark:text-white placeholder:text-ink-mute dark:placeholder:text-dark-mute focus:outline-none focus:border-accent rounded-full transition-colors shadow-xs"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-mute hover:text-ink cursor-pointer"
              >
                <IconClose className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center p-0.5 bg-paper-subtle/80 dark:bg-white/[0.05] border border-rule/60 dark:border-white/10 rounded-full shadow-xs shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`h-7 w-7 flex items-center justify-center rounded-full transition cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-paper dark:bg-white/20 text-ink dark:text-white shadow-xs font-bold'
                  : 'text-ink-mute dark:text-dark-mute hover:text-ink'
              }`}
              title="Grid View"
            >
              <IconLayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`h-7 w-7 flex items-center justify-center rounded-full transition cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-paper dark:bg-white/20 text-ink dark:text-white shadow-xs font-bold'
                  : 'text-ink-mute dark:text-dark-mute hover:text-ink'
              }`}
              title="List View"
            >
              <IconListBullet className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={fetchMedia}
            disabled={loading}
            className="h-8 w-8 flex items-center justify-center border border-rule/60 dark:border-white/10 hover:border-accent rounded-full text-ink-mute hover:text-ink dark:hover:text-white transition cursor-pointer bg-paper dark:bg-white/[0.04] shadow-xs shrink-0"
            title="Refresh Files"
          >
            <IconRefresh className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {/* Upload Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="h-8 px-3.5 bg-accent hover:bg-accent/90 border border-accent text-white text-xs font-bold uppercase tracking-wider rounded-full transition cursor-pointer shadow-xs inline-flex items-center gap-1.5 shrink-0 active:scale-95"
          >
            <IconPlus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isUploading ? 'Uploading…' : 'Upload Media'}</span>
            <span className="sm:hidden">{isUploading ? '…' : 'Upload'}</span>
          </button>
        </div>
      </div>

      {/* DROPZONE BANNER (ACTIVE ON DRAG) */}
      {isDragging && (
        <div className="p-8 border-2 border-dashed border-accent bg-accent/5 rounded-3xl text-center space-y-2 animate-in fade-in duration-150">
          <IconMedia className="w-8 h-8 text-accent mx-auto" />
          <p className="text-xs font-bold text-ink dark:text-dark-ink">
            Drop image files here to upload to Cloudflare R2
          </p>
        </div>
      )}

      {/* FILE COUNT & STORAGE STATS BAR */}
      <div className="flex items-center justify-between text-xs text-ink-mute dark:text-dark-mute font-mono px-1">
        <span>{filteredItems.length} {filteredItems.length === 1 ? 'file' : 'files'}</span>
        <span className="text-[11px]">Direct Cloudflare CDN Storage</span>
      </div>

      {/* SCROLLABLE FILES CONTAINER (Files scroll internally instead of whole page) */}
      <div className="overflow-y-auto max-h-[calc(100vh-220px)] min-h-[450px] p-2.5 sm:p-4 pb-28 sm:pb-6 border border-rule/60 dark:border-white/10 rounded-3xl bg-paper-subtle/20 dark:bg-white/[0.01] shadow-inner overscroll-contain">
        {loading ? (
          <div className="py-24 text-center">
            <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-mono uppercase tracking-widest text-ink-mute">
              Loading Media Assets…
            </p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-20 text-center space-y-3 bg-paper-subtle/50 dark:bg-white/[0.02] border border-rule/60 dark:border-white/10 rounded-3xl p-8">
            <IconMedia className="w-8 h-8 text-ink-mute mx-auto opacity-40" />
            <h3 className="font-semibold text-sm text-ink dark:text-dark-ink">
              No media files found
            </h3>
            <p className="text-xs text-ink-mute dark:text-dark-mute max-w-sm mx-auto">
              Drop image files here or click Upload Media to store assets on Cloudflare.
            </p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-accent text-white text-xs font-bold uppercase rounded-full hover:opacity-90 transition cursor-pointer shadow-xs"
            >
              Upload First Image
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          /* GRID VIEW: CLEAN MOBILE PHOTO TILES + DESKTOP CARDS */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-4 p-1">
            {filteredItems.map((item) => {
              const filename = getFilename(item.url, item.title)
              const isCopied = copiedId === item.id

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className="group p-2 sm:p-2.5 bg-paper dark:bg-white/[0.03] border border-rule/60 dark:border-white/10 rounded-2xl shadow-xs hover:border-accent/70 hover:shadow-md transition-all flex flex-col justify-between cursor-pointer active:scale-[0.98]"
                >
                  {/* Small Thumbnail */}
                  <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-paper-subtle dark:bg-white/[0.04] border border-rule/40 dark:border-white/5 mb-1.5 sm:mb-2">
                    <img
                      src={item.url}
                      alt={filename}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      onError={(e) => {
                        const target = e.currentTarget
                        target.onerror = null
                        target.src = FALLBACK_IMAGE
                      }}
                    />
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="absolute top-1.5 right-1.5 p-1 bg-black/60 hover:bg-black text-white rounded-full opacity-0 sm:group-hover:opacity-100 transition-opacity"
                      title="Open in new tab"
                    >
                      <IconExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  {/* File Details */}
                  <div className="space-y-0.5 sm:space-y-1 mb-1 sm:mb-2">
                    <p className="text-[11px] sm:text-xs font-medium text-ink dark:text-dark-ink truncate" title={filename}>
                      {filename}
                    </p>
                    <p className="text-[10px] sm:text-[10.5px] font-mono text-ink-mute dark:text-dark-mute">
                      {formatBytes(item.size)}
                    </p>
                  </div>

                  {/* Desktop-only Copy Link Button (Hidden on mobile where clicking opens bottom sheet) */}
                  <div className="hidden sm:block">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleCopy(item.url, item.id)
                      }}
                      className={`w-full py-1.5 text-xs font-semibold rounded-full border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        isCopied
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 shadow-xs'
                          : 'border-rule/60 dark:border-white/10 hover:border-accent text-ink dark:text-dark-ink hover:bg-paper-subtle dark:hover:bg-white/5 shadow-xs'
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
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          /* LIST VIEW: COMPACT FILE MANAGER TABLE */
          <div className="bg-paper dark:bg-white/[0.03] border border-rule/60 dark:border-white/10 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-sans border-collapse text-left">
                <thead>
                  <tr className="bg-paper-subtle/60 dark:bg-white/[0.03] border-b border-rule/60 dark:border-white/10 text-ink-mute dark:text-dark-mute font-mono text-[10.5px] uppercase">
                    <th className="py-2.5 px-4 font-semibold">File</th>
                    <th className="py-2.5 px-4 font-semibold">Size</th>
                    <th className="py-2.5 px-4 font-semibold">Direct Link</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rule/40 dark:divide-white/5">
                  {filteredItems.map((item) => {
                    const filename = getFilename(item.url, item.title)
                    const isCopied = copiedId === item.id

                    return (
                      <tr
                        key={item.id}
                        onClick={() => setSelectedItem(item)}
                        className="hover:bg-paper-subtle/40 dark:hover:bg-white/[0.02] transition cursor-pointer"
                      >
                        <td className="py-2.5 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={item.url}
                              alt=""
                              className="w-10 h-10 rounded-lg object-cover border border-rule/60 dark:border-white/10 shrink-0"
                              onError={(e) => {
                                const target = e.currentTarget
                                target.onerror = null
                                target.src = FALLBACK_IMAGE
                              }}
                            />
                            <span className="font-medium text-ink dark:text-dark-ink truncate max-w-xs sm:max-w-md">
                              {filename}
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5 px-4 font-mono text-ink-mute dark:text-dark-mute whitespace-nowrap">
                          {formatBytes(item.size)}
                        </td>
                        <td className="py-2.5 px-4 font-mono text-[11px] text-ink-mute dark:text-dark-mute truncate max-w-xs">
                          {item.url}
                        </td>
                        <td className="py-2.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleCopy(item.url, item.id)}
                              className={`px-3 py-1 text-[11px] font-semibold rounded-full border transition cursor-pointer inline-flex items-center gap-1 ${
                                isCopied
                                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                                  : 'border-rule/60 dark:border-white/10 hover:border-accent text-ink dark:text-dark-ink'
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
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 text-ink-mute hover:text-ink dark:hover:text-white rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition"
                              title="Open file"
                            >
                              <IconExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* MOBILE BOTTOM SHEET FOR PHOTO DETAILS & DIRECT URL COPY */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setSelectedItem(null)}
          />

          {/* Bottom Sheet Card */}
          <div className="relative w-full sm:max-w-lg bg-paper dark:bg-[#18181b] border-t sm:border border-rule/80 dark:border-white/10 rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 sm:p-6 space-y-4 z-10 max-h-[88vh] overflow-y-auto overscroll-contain animate-in slide-in-from-bottom duration-200">
            {/* Mobile Drag Handle */}
            <div
              className="w-10 h-1 bg-ink-mute/30 dark:bg-white/20 rounded-full mx-auto sm:hidden cursor-pointer"
              onClick={() => setSelectedItem(null)}
            />

            {/* Header: Filename & Dismiss */}
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h3 className="font-serif font-bold text-base sm:text-lg text-ink dark:text-dark-ink truncate">
                  {getFilename(selectedItem.url, selectedItem.title)}
                </h3>
                <p className="text-[11px] font-mono text-ink-mute dark:text-dark-mute mt-0.5">
                  {formatBytes(selectedItem.size)} • {selectedItem.aspectRatio || '16:10'} • {selectedItem.source === 'upload' ? 'Upload' : 'Story Asset'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-ink-mute hover:text-ink dark:hover:text-white transition cursor-pointer"
                aria-label="Close"
              >
                <IconClose className="w-4 h-4" />
              </button>
            </div>

            {/* Large Preview Image */}
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-paper-subtle dark:bg-black/40 border border-rule/60 dark:border-white/10 flex items-center justify-center">
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
              <a
                href={selectedItem.url}
                target="_blank"
                rel="noreferrer"
                className="absolute top-2.5 right-2.5 p-2 bg-black/60 hover:bg-black text-white rounded-xl shadow-xs transition cursor-pointer"
                title="Open original file in new tab"
              >
                <IconExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Direct CDN URL Box */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-ink-mute dark:text-dark-mute">
                Direct CDN URL
              </label>
              <div className="flex items-center px-3 py-2.5 bg-paper-subtle dark:bg-white/[0.04] border border-rule/70 dark:border-white/10 rounded-xl">
                <input
                  type="text"
                  readOnly
                  value={getAbsoluteUrl(selectedItem.url)}
                  className="w-full bg-transparent text-xs font-mono text-ink dark:text-white focus:outline-none truncate selection:bg-accent/30"
                />
              </div>
            </div>

            {/* Bottom Action Buttons: Big Copy URL Primary Button */}
            <div className="pt-1 flex items-center gap-2.5">
              <button
                type="button"
                id="media-bottom-sheet-copy-btn"
                onClick={() => handleCopy(selectedItem.url, selectedItem.id)}
                className={`flex-1 h-12 text-xs sm:text-sm font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow-xs active:scale-[0.98] ${
                  copiedId === selectedItem.id
                    ? 'bg-emerald-600 text-white'
                    : 'bg-accent hover:bg-accent/90 text-white'
                }`}
              >
                {copiedId === selectedItem.id ? (
                  <>
                    <IconCheck className="w-4 h-4" />
                    <span>URL Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <IconCopy className="w-4 h-4" />
                    <span>Copy URL</span>
                  </>
                )}
              </button>

              <a
                href={selectedItem.url}
                target="_blank"
                rel="noreferrer"
                className="h-12 px-4 border border-rule/80 dark:border-white/15 hover:bg-paper-subtle dark:hover:bg-white/5 rounded-xl text-xs font-semibold flex items-center justify-center text-ink dark:text-dark-ink transition cursor-pointer"
              >
                Open
              </a>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING TOAST MESSAGES */}
      <AdminToast toasts={toasts} onDismiss={removeToast} />
    </div>
  )
}
