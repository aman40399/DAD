'use client'

import { useState, useRef, useCallback } from 'react'
import Cropper from 'react-easy-crop'

export interface CroppedImageResult {
  url: string
  aspectRatio: '16:10' | '1:1' | 'free'
  isMainFeatured: boolean
  caption?: string
}

interface ImageCropperModalProps {
  isOpen: boolean
  onClose: () => void
  onCropComplete: (result: CroppedImageResult) => void
  initialAspect?: '16:10' | '1:1'
  title?: string
}

export default function ImageCropperModal({
  isOpen,
  onClose,
  onCropComplete,
  initialAspect = '16:10',
  title = 'Crop & Upload Image',
}: ImageCropperModalProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [aspect, setAspect] = useState<'16:10' | '1:1' | 'free'>(initialAspect)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null)
  const [isMainFeatured, setIsMainFeatured] = useState(true)
  const [caption, setCaption] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const fileInputRef = useRef<HTMLInputElement>(null)

  const onCropChange = (newCrop: any) => setCrop(newCrop)
  const onZoomChange = (newZoom: number) => setZoom(newZoom)

  const onCropCompleteCallback = useCallback((croppedArea: any, croppedPixels: any) => {
    setCroppedAreaPixels(croppedPixels)
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      const reader = new FileReader()
      reader.addEventListener('load', () => {
        setImageSrc(reader.result?.toString() || null)
        setError('')
      })
      reader.readAsDataURL(file)
    }
  }

  // Create cropped canvas
  const getCroppedImgCanvas = async (imageSrc: string, pixelCrop: any): Promise<string> => {
    const image = new Image()
    image.src = imageSrc
    await new Promise((resolve) => {
      image.onload = resolve
    })

    const canvas = document.createElement('canvas')
    canvas.width = pixelCrop.width
    canvas.height = pixelCrop.height
    const ctx = canvas.getContext('2d')

    if (!ctx) throw new Error('No 2d context')

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    )

    return canvas.toDataURL('image/webp', 0.92)
  }

  const handleSaveAndUpload = async () => {
    if (!imageSrc || !croppedAreaPixels) return

    setUploading(true)
    setError('')

    try {
      const croppedDataUrl = await getCroppedImgCanvas(imageSrc, croppedAreaPixels)

      const res = await fetch('/api/media/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dataUrl: croppedDataUrl,
          filename: `news-hero-${aspect.replace(':', '-')}.webp`,
        }),
      })

      if (!res.ok) {
        throw new Error('Upload failed')
      }

      const data = await res.json()

      onCropComplete({
        url: data.url,
        aspectRatio: aspect,
        isMainFeatured,
        caption: caption.trim() || undefined,
      })

      onClose()
    } catch (err: any) {
      setError(err?.message || 'Error processing and uploading image')
    } finally {
      setUploading(false)
    }
  }

  if (!isOpen) return null

  const aspectValue = aspect === '16:10' ? 16 / 10 : aspect === '1:1' ? 1 : undefined

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs font-sans">
      <div className="bg-paper dark:bg-dark-paper border border-rule dark:border-dark-rule rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-rule dark:border-dark-rule">
          <h3 className="font-serif font-black text-lg text-ink dark:text-dark-ink uppercase tracking-wide">
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-ink-mute hover:text-ink dark:hover:text-dark-ink text-xl p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {!imageSrc ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-rule dark:border-dark-rule p-12 text-center rounded-2xl cursor-pointer hover:border-accent dark:hover:border-dark-accent transition"
            >
              <svg className="w-12 h-12 mx-auto text-ink-mute mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              <p className="font-semibold text-sm text-ink dark:text-dark-ink">Click or drag image to upload</p>
              <p className="text-xs text-ink-mute mt-1">PNG, JPG, WebP supported</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Aspect Ratio Buttons */}
              <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                <div className="flex items-center gap-1">
                  <span className="font-bold text-ink-mute mr-2 uppercase text-[11px]">Crop Ratio:</span>
                  <button
                    type="button"
                    onClick={() => setAspect('16:10')}
                    className={`px-3 py-1 font-semibold rounded-xl border transition cursor-pointer ${
                      aspect === '16:10'
                        ? 'bg-accent text-white border-accent shadow-xs'
                        : 'border-rule dark:border-dark-rule text-ink dark:text-dark-ink hover:bg-paper-subtle'
                    }`}
                  >
                    16:10 (Broadsheet Hero)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAspect('1:1')}
                    className={`px-3 py-1 font-semibold rounded-xl border transition cursor-pointer ${
                      aspect === '1:1'
                        ? 'bg-accent text-white border-accent shadow-xs'
                        : 'border-rule dark:border-dark-rule text-ink dark:text-dark-ink hover:bg-paper-subtle'
                    }`}
                  >
                    1:1 (Square Thumbnail)
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setImageSrc(null)}
                  className="text-xs text-red-600 hover:underline cursor-pointer"
                >
                  Choose another image
                </button>
              </div>

              {/* Crop Canvas Area */}
              <div className="relative h-64 sm:h-72 w-full bg-black/90 rounded-xl overflow-hidden">
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={aspectValue}
                  onCropChange={onCropChange}
                  onCropComplete={onCropCompleteCallback}
                  onZoomChange={onZoomChange}
                />
              </div>

              {/* Zoom slider */}
              <div className="flex items-center gap-3 text-xs">
                <span className="font-bold text-ink-mute uppercase text-[11px]">Zoom:</span>
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full accent-accent"
                />
              </div>

              {/* Caption input */}
              <div className="space-y-3 pt-2 border-t border-rule dark:border-dark-rule">
                <div>
                  <label className="block text-xs font-bold uppercase text-ink dark:text-dark-ink mb-1">
                    Caption / Attribution
                  </label>
                  <input
                    type="text"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Caption or image credits"
                    className="w-full px-3 py-2 text-xs bg-paper-subtle dark:bg-dark-subtle border border-rule dark:border-dark-rule text-ink dark:text-dark-ink focus:outline-none focus:border-accent rounded-xl"
                  />
                </div>

                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={isMainFeatured}
                    onChange={(e) => setIsMainFeatured(e.target.checked)}
                    className="accent-accent"
                  />
                  <span className="font-bold text-ink dark:text-dark-ink">
                    Set as Primary / Main Featured Hero Image (used for homepage cards)
                  </span>
                </label>
              </div>
            </div>
          )}

          {error && <p className="text-xs text-red-600 font-bold">{error}</p>}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-paper-subtle dark:bg-dark-subtle border-t border-rule dark:border-dark-rule">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-rule dark:border-dark-rule font-bold text-xs uppercase text-ink-mute hover:text-ink transition rounded-xl cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!imageSrc || uploading}
            onClick={handleSaveAndUpload}
            className="px-5 py-2 bg-accent hover:bg-accent/90 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer rounded-xl shadow-xs"
          >
            {uploading ? 'Cropping & Uploading to R2…' : 'Crop & Save Image'}
          </button>
        </div>
      </div>
    </div>
  )
}
