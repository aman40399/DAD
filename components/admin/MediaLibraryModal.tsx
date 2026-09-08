'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { IconMedia, IconClose, IconCheck } from '@/components/admin/AdminIcons'

export interface MediaAsset {
  id: string
  url: string
  title: string
  source: 'upload' | 'article'
  aspectRatio: string
  createdAt: string
  size?: number
}

interface MediaLibraryModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectImage?: (url: string) => void
}

export default function MediaLibraryModal({
  isOpen,
  onClose,
  onSelectImage,
}: MediaLibraryModalProps) {
  const [activeTab, setActiveTab] = useState<'browse' | 'upload'>('browse')
  const [mediaItems, setMediaItems] = useState<MediaAsset[]>([])
  const [loading, setLoading] = useState(false)
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  // Upload state
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadPreview, setUploadPreview] = useState<string | null>(null)
  const [uploadAspectRatio, setUploadAspectRatio] = useState<string>('16:10')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
      console.error('Failed to load media vault:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchMedia()
    }
  }, [isOpen])

  // Escape key handler
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (previewImage) {
          setPreviewImage(null)
        } else {
          onClose()
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, previewImage, onClose])

  const handleCopy = (url: string, id: string) => {
    navigator.clipboard.writeText(url)
    setCopyFeedback(id)
    setTimeout(() => setCopyFeedback(null), 2000)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        setUploadError('Selected file must be an image format (JPEG, PNG, WebP).')
        return
      }
      setUploadError(null)
      setUploadFile(file)
      const reader = new FileReader()
      reader.onload = () => setUploadPreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!uploadFile) return

    setIsUploading(true)
    setUploadError(null)

    try {
      const formData = new FormData()
      formData.append('file', uploadFile)
      formData.append('aspectRatio', uploadAspectRatio)

      const res = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Upload failed')
      }

      const data = await res.json()
      if (data && data.url) {
        const rawName = (data.key || uploadFile.name)
          .replace(/^news\//, '')
          .replace(/^[0-9]+-/, '')
          .replace(/\.[^/.]+$/, '')
          .replace(/[-_]+/g, ' ')
          .trim()
        const optimisticItem: MediaAsset = {
          id: `r2-${data.key || data.url}`,
          url: data.url,
          title: rawName || uploadFile.name,
          source: 'upload',
          aspectRatio: uploadAspectRatio,
          createdAt: new Date().toISOString(),
          size: uploadFile.size || data.size,
        }
        setMediaItems((prev) => [optimisticItem, ...prev.filter((m) => m.url !== optimisticItem.url)])
      }
      setUploadFile(null)
      setUploadPreview(null)
      setActiveTab('browse')
      await fetchMedia()

      if (onSelectImage && data.url) {
        onSelectImage(data.url)
      }
    } catch (err: any) {
      setUploadError(err.message || 'Error occurred during media upload')
    } finally {
      setIsUploading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-paper dark:bg-dark-paper border-2 border-rule dark:border-dark-rule max-w-4xl w-full max-h-[90vh] flex flex-col rounded-xs shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Masthead Header */}
        <div className="p-5 border-b border-rule dark:border-dark-rule flex items-center justify-between bg-paper-subtle dark:bg-dark-subtle">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-accent uppercase tracking-widest font-bold">
                Cloudflare R2 & Broadsheet Asset Vault
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <h2 className="font-serif font-black text-2xl text-ink dark:text-dark-ink mt-0.5">
              Media Archive & Image Vault
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-ink-mute hover:text-ink p-1 transition cursor-pointer"
            aria-label="Close modal"
          >
            <IconClose className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center justify-between px-5 py-2.5 border-b border-rule dark:border-dark-rule bg-paper dark:bg-dark-paper">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('browse')}
              className={`px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider rounded-xs transition cursor-pointer ${
                activeTab === 'browse'
                  ? 'bg-ink dark:bg-dark-ink text-paper dark:text-dark-paper shadow-xs'
                  : 'text-ink-mute dark:text-dark-mute hover:text-ink dark:hover:text-dark-ink bg-paper-subtle dark:bg-dark-subtle border border-rule dark:border-dark-rule'
              }`}
            >
              Archive Gallery ({mediaItems.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider rounded-xs transition cursor-pointer ${
                activeTab === 'upload'
                  ? 'bg-ink dark:bg-dark-ink text-paper dark:text-dark-paper shadow-xs'
                  : 'text-ink-mute dark:text-dark-mute hover:text-ink dark:hover:text-dark-ink bg-paper-subtle dark:bg-dark-subtle border border-rule dark:border-dark-rule'
              }`}
            >
              + Ingest Media
            </button>
          </div>
          <span className="text-[11px] font-mono text-ink-mute dark:text-dark-mute hidden sm:inline">
            Direct R2 Ingest · WebP Cropping
          </span>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {activeTab === 'browse' ? (
            loading ? (
              <div className="py-20 text-center text-xs font-mono text-ink-mute animate-pulse">
                Accessing Cloudflare R2 Media Vault…
              </div>
            ) : mediaItems.length === 0 ? (
              <div className="py-16 text-center space-y-2">
                <p className="font-serif italic text-sm text-ink-mute dark:text-dark-mute">
                  No media assets recorded in vault.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('upload')}
                  className="px-3 py-1.5 bg-accent text-white text-xs font-bold uppercase rounded-xs"
                >
                  Upload First Image
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {mediaItems.map((item) => {
                  const isCopied = copyFeedback === item.id
                  return (
                    <div
                      key={item.id}
                      className="group border border-rule dark:border-dark-rule bg-paper-subtle dark:bg-dark-subtle rounded-xs overflow-hidden flex flex-col justify-between hover:border-accent transition shadow-xs"
                    >
                      {/* Image Thumbnail */}
                      <div
                        className="relative aspect-16/10 bg-paper dark:bg-dark-paper cursor-pointer overflow-hidden"
                        onClick={() => setPreviewImage(item.url)}
                      >
                        <Image
                          src={item.url}
                          alt={item.title}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          unoptimized={item.url.startsWith('/')}
                        />
                        <span className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/75 text-white font-mono text-[9px] uppercase font-bold rounded-xs tracking-wider">
                          {item.aspectRatio}
                        </span>
                      </div>

                      {/* Info & Actions */}
                      <div className="p-3 space-y-2">
                        <div className="font-serif font-bold text-xs text-ink dark:text-dark-ink truncate">
                          {item.title}
                        </div>
                        <div className="flex items-center justify-between text-[10px] font-mono text-ink-mute dark:text-dark-mute border-t border-rule/50 dark:border-dark-rule/50 pt-2">
                          <span>{item.source === 'upload' ? 'Direct Upload' : 'Story Asset'}</span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleCopy(item.url, item.id)}
                              className="hover:text-accent font-bold cursor-pointer transition inline-flex items-center gap-1"
                            >
                              {isCopied ? (
                                <>
                                  <IconCheck className="w-3 h-3 text-emerald-500" />
                                  <span>Copied</span>
                                </>
                              ) : (
                                <span>Copy URL</span>
                              )}
                            </button>
                            {onSelectImage && (
                              <button
                                type="button"
                                onClick={() => {
                                  onSelectImage(item.url)
                                  onClose()
                                }}
                                className="text-accent font-bold hover:underline cursor-pointer"
                              >
                                Select
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          ) : (
            /* Direct Upload Form */
            <form onSubmit={handleUploadSubmit} className="max-w-md mx-auto py-4 space-y-4">
              <div className="text-center space-y-1">
                <h4 className="font-serif font-bold text-lg text-ink dark:text-dark-ink">
                  Upload Asset to Broadsheet Vault
                </h4>
                <p className="font-sans text-xs text-ink-mute dark:text-dark-mute">
                  Ingests image directly into Cloudflare R2 bucket with automated WebP compression.
                </p>
              </div>

              {uploadError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 text-xs rounded-xs">
                  {uploadError}
                </div>
              )}

              {/* Aspect Ratio selector */}
              <div>
                <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-ink-mute dark:text-dark-mute mb-1">
                  Target Broadsheet Ratio
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: '16:10 Broadsheet Card', value: '16:10' },
                    { label: '1:1 Square Rail', value: '1:1' },
                  ].map((ratio) => (
                    <button
                      key={ratio.value}
                      type="button"
                      onClick={() => setUploadAspectRatio(ratio.value)}
                      className={`p-2 text-xs font-mono font-bold rounded-xs border transition cursor-pointer ${
                        uploadAspectRatio === ratio.value
                          ? 'border-accent bg-accent/10 text-accent'
                          : 'border-rule dark:border-dark-rule text-ink-mute'
                      }`}
                    >
                      {ratio.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* File Dropzone */}
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/png,image/jpeg,image/webp,image/jpg"
                  className="hidden"
                />
                {uploadPreview ? (
                  <div className="relative aspect-16/10 border-2 border-dashed border-accent rounded-xs overflow-hidden">
                    <Image
                      src={uploadPreview}
                      alt="Upload Preview"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setUploadFile(null)
                        setUploadPreview(null)
                      }}
                      className="absolute top-2 right-2 px-2 py-1 bg-black/80 text-white font-mono text-[10px] uppercase font-bold rounded-xs cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-rule dark:border-dark-rule hover:border-accent p-8 text-center cursor-pointer rounded-xs transition bg-paper-subtle dark:bg-dark-subtle group"
                  >
                    <div className="flex justify-center mb-2">
                      <IconMedia className="w-8 h-8 text-ink-mute dark:text-dark-mute opacity-60 group-hover:text-accent group-hover:opacity-100 transition" />
                    </div>
                    <div className="font-serif font-bold text-sm text-ink dark:text-dark-ink">
                      Click to Select Image File
                    </div>
                    <div className="text-[11px] font-mono text-ink-mute dark:text-dark-mute mt-1">
                      JPEG, PNG, WebP up to 10MB
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setUploadFile(null)
                    setUploadPreview(null)
                    setActiveTab('browse')
                  }}
                  className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-ink-mute hover:text-ink cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!uploadFile || isUploading}
                  className="px-5 py-2 bg-accent hover:bg-accent/90 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider rounded-xs transition shadow-xs cursor-pointer flex items-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Ingesting to R2…</span>
                    </>
                  ) : (
                    <span>Upload to Vault</span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-rule dark:border-dark-rule bg-paper-subtle dark:bg-dark-subtle flex items-center justify-between text-[11px] font-mono text-ink-mute dark:text-dark-mute">
          <span>Engine: Cloudflare R2 Storage</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 font-sans font-bold uppercase text-ink hover:text-accent transition cursor-pointer"
          >
            Close Vault
          </button>
        </div>
      </div>

      {/* Lightbox Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-4xl max-h-[85vh] w-full h-full flex flex-col items-center justify-center">
            <div className="relative w-full h-[75vh]">
              <Image
                src={previewImage}
                alt="Enlarged Broadsheet Preview"
                fill
                className="object-contain"
                unoptimized={previewImage.startsWith('/')}
              />
            </div>
            <div className="mt-3 flex items-center gap-4">
              <span className="text-white/80 font-mono text-xs">{previewImage}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  navigator.clipboard.writeText(previewImage)
                  setCopyFeedback('preview')
                  setTimeout(() => setCopyFeedback(null), 2000)
                }}
                className="px-3 py-1 bg-accent text-white font-mono text-xs uppercase font-bold rounded-xs cursor-pointer"
              >
                {copyFeedback === 'preview' ? (
                  <span className="flex items-center gap-1">
                    <IconCheck className="w-3 h-3" />
                    <span>Copied</span>
                  </span>
                ) : (
                  'Copy URL'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
