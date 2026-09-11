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
  }, [])

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
      className="space-y-6 font-sans text-[#1d1d1f] dark:text-white"
      onDrop={handleDrop}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
      onDragLeave={(e) => { e.preventDefault(); setIsDragging(false) }}
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

      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#1d1d1f] dark:text-white">
              Media Vault
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold text-[#0071e3] dark:text-[#2997ff] bg-[#0071e3]/10 dark:bg-[#2997ff]/15 rounded-full">
              Cloudflare R2
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#1d1d1f]/60 dark:text-white/60 mt-1">
            Browse and manage edge-cached photographic dispatches with instant CDN link copying.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchMedia}
            disabled={loading}
            className="w-10 h-10 rounded-full backdrop-blur-md bg-white/80 dark:bg-white/[0.08] hover:bg-white dark:hover:bg-white/15 border border-black/[0.08] dark:border-white/[0.1] text-[#1d1d1f] dark:text-white flex items-center justify-center transition shadow-xs active:scale-95"
            title="Refresh assets"
          >
            <IconRefresh className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="h-10 px-5 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-semibold tracking-tight transition shadow-[0_2px_8px_rgba(0,113,227,0.35)] flex items-center gap-2 active:scale-95 cursor-pointer"
          >
            <IconPlus className="w-4 h-4 stroke-[2.5]" />
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

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className="group p-2.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] hover:bg-white dark:hover:bg-[#2c2c2e] border border-black/[0.04] dark:border-white/[0.06] hover:border-black/[0.08] dark:hover:border-white/[0.12] shadow-xs hover:shadow-md transition-all flex flex-col justify-between cursor-pointer active:scale-[0.98]"
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
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black text-white rounded-full opacity-0 sm:group-hover:opacity-100 transition-opacity"
                      title="Open in new tab"
                    >
                      <IconExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <div className="space-y-0.5 mb-2">
                    <p className="text-xs font-semibold text-[#1d1d1f] dark:text-white truncate tracking-tight" title={filename}>
                      {filename}
                    </p>
                    <p className="text-[10px] text-[#1d1d1f]/50 dark:text-white/50 font-mono">
                      {formatBytes(item.size)}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleCopy(item.url, item.id)
                    }}
                    className={`w-full py-1.5 text-[11px] font-semibold rounded-full border transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 ${
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

                  return (
                    <tr
                      key={item.id}
                      onClick={() => setSelectedItem(item)}
                      className="hover:bg-black/[0.015] dark:hover:bg-white/[0.02] transition cursor-pointer"
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
                          <span className="font-semibold text-xs text-[#1d1d1f] dark:text-white tracking-tight truncate max-w-xs sm:max-w-md">
                            {filename}
                          </span>
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
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 text-[#1d1d1f]/50 hover:text-[#1d1d1f] dark:text-white/50 dark:hover:text-white rounded-full transition"
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
        )}
      </div>

      {/* APPLE ASSET DETAIL SHEET */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-md transition-opacity"
            onClick={() => setSelectedItem(null)}
          />

          <div className="relative w-full sm:max-w-lg backdrop-blur-2xl bg-white/95 dark:bg-[#1c1c1e]/95 border border-black/[0.08] dark:border-white/[0.1] rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 space-y-4 z-10 animate-in slide-in-from-bottom duration-200">
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

            <div className="pt-2 flex items-center gap-2.5">
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
                    <span>Copied to Clipboard!</span>
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
                className="h-11 px-5 border border-black/[0.08] dark:border-white/[0.1] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] rounded-full text-xs font-semibold flex items-center justify-center text-[#1d1d1f] dark:text-white transition cursor-pointer active:scale-95"
              >
                Open ↗
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
