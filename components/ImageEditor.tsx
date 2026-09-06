'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'

interface ImageEditorProps {
  imageUrl: string
  onSave: (editedImageUrl: string) => void
  onCancel: () => void
}

export default function ImageEditor({ imageUrl, onSave, onCancel }: ImageEditorProps) {
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 90,
    height: 90,
    x: 5,
    y: 5
  })
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null)
  const [scale, setScale] = useState(1)
  const [rotate, setRotate] = useState(0)
  const [brightness, setBrightness] = useState(100)
  const [contrast, setContrast] = useState(100)
  const [saturation, setSaturation] = useState(100)
  const [processing, setProcessing] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  
  const imgRef = useRef<HTMLImageElement>(null)
  const previewCanvasRef = useRef<HTMLCanvasElement>(null)

  const [activeTab, setActiveTab] = useState<'crop' | 'adjust' | 'transform'>('crop')

  // Use proxy for external images to avoid CORS issues
  const getProxiedImageUrl = (url: string) => {
    // If it's a data URL or relative URL, use as is
    if (url.startsWith('data:') || url.startsWith('/')) {
      return url
    }

    // If it's an external URL, use our proxy
    try {
      const urlObj = new URL(url)
      // Check if it's from our own domain
      if (urlObj.hostname === window.location.hostname) {
        return url
      }
      // Use proxy for external images
      return `/api/proxy-image?url=${encodeURIComponent(url)}`
    } catch {
      return url
    }
  }

  const proxiedImageUrl = getProxiedImageUrl(imageUrl)

  // Generate preview
  useEffect(() => {
    if (!completedCrop || !previewCanvasRef.current || !imgRef.current) {
      return
    }

    const image = imgRef.current
    const canvas = previewCanvasRef.current
    const crop = completedCrop

    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height
    const ctx = canvas.getContext('2d')

    if (!ctx) return

    const pixelRatio = window.devicePixelRatio || 1

    canvas.width = crop.width * pixelRatio * scaleX
    canvas.height = crop.height * pixelRatio * scaleY

    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
    ctx.imageSmoothingQuality = 'high'

    // Apply filters
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width * scaleX,
      crop.height * scaleY
    )
  }, [completedCrop, brightness, contrast, saturation])

  const handleSave = async () => {
    if (!imgRef.current) {
      alert('Image not loaded. Please wait for the image to load.')
      return
    }

    if (!completedCrop || completedCrop.width === 0 || completedCrop.height === 0) {
      alert('Please select a crop area first')
      return
    }

    setProcessing(true)

    try {
      const image = imgRef.current
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d', { willReadFrequently: true })

      if (!ctx) {
        throw new Error('Could not get canvas context')
      }

      const scaleX = image.naturalWidth / image.width
      const scaleY = image.naturalHeight / image.height

      // Set canvas size to crop size
      canvas.width = completedCrop.width * scaleX
      canvas.height = completedCrop.height * scaleY

      // Configure canvas for best quality
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'

      // Save context state
      ctx.save()

      // Apply transformations
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2

      // Move to center
      ctx.translate(centerX, centerY)

      // Apply rotation
      if (rotate !== 0) {
        ctx.rotate((rotate * Math.PI) / 180)
      }

      // Apply scale
      ctx.scale(scale, scale)

      // Move back
      ctx.translate(-centerX, -centerY)

      // Apply filters
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`

      // Draw the cropped image
      ctx.drawImage(
        image,
        completedCrop.x * scaleX,
        completedCrop.y * scaleY,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY,
        0,
        0,
        canvas.width,
        canvas.height
      )

      // Restore context state
      ctx.restore()

      // Convert to blob and then to data URL
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            throw new Error('Failed to create image blob')
          }

          const reader = new FileReader()
          reader.onloadend = () => {
            onSave(reader.result as string)
            setProcessing(false)
          }
          reader.onerror = () => {
            throw new Error('Failed to read image data')
          }
          reader.readAsDataURL(blob)
        },
        'image/jpeg',
        0.95
      )
    } catch (error) {
      console.error('Error processing image:', error)
      alert(`Failed to process image: ${error instanceof Error ? error.message : 'Unknown error'}. Make sure the image is fully loaded and try again.`)
      setProcessing(false)
    }
  }

  const resetAll = () => {
    setScale(1)
    setRotate(0)
    setBrightness(100)
    setContrast(100)
    setSaturation(100)
    setCrop({
      unit: '%',
      width: 90,
      height: 90,
      x: 5,
      y: 5
    })
  }

  const presetCrops = [
    { name: '16:9', aspect: 16 / 9 },
    { name: '4:3', aspect: 4 / 3 },
    { name: '1:1', aspect: 1 },
    { name: '9:16', aspect: 9 / 16 },
    { name: 'Free', aspect: undefined }
  ]

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-neutral-900 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            🎨 Image Editor
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-neutral-200 dark:border-neutral-700 px-4">
          <button
            onClick={() => setActiveTab('crop')}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'crop'
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            ✂️ Crop
          </button>
          <button
            onClick={() => setActiveTab('adjust')}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'adjust'
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            🎚️ Adjust
          </button>
          <button
            onClick={() => setActiveTab('transform')}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'transform'
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            🔄 Transform
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Image Preview - Takes 2 columns */}
            <div className="lg:col-span-2">
              <div className="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-4 flex items-center justify-center min-h-[400px]">
                {imageError ? (
                  <div className="text-center p-8">
                    <p className="text-red-600 dark:text-red-400 font-bold mb-2">
                      ⚠️ Failed to load image
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      The image could not be loaded. This might be due to:
                    </p>
                    <ul className="text-xs text-gray-500 dark:text-gray-500 text-left max-w-md mx-auto space-y-1">
                      <li>• CORS restrictions on external images</li>
                      <li>• Invalid or broken image URL</li>
                      <li>• Network connectivity issues</li>
                    </ul>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-4">
                      Try uploading the image to your own server or using a different image.
                    </p>
                  </div>
                ) : !imageLoaded ? (
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading image...</p>
                  </div>
                ) : (
                  <ReactCrop
                    crop={crop}
                    onChange={(c) => setCrop(c)}
                    onComplete={(c) => setCompletedCrop(c)}
                  >
                    <img
                      ref={imgRef}
                      src={proxiedImageUrl}
                      alt="Edit"
                      onLoad={() => {
                        setImageLoaded(true)
                        setImageError(false)
                        // Set initial crop to cover most of the image
                        if (imgRef.current) {
                          setCompletedCrop({
                            unit: 'px',
                            x: imgRef.current.width * 0.05,
                            y: imgRef.current.height * 0.05,
                            width: imgRef.current.width * 0.9,
                            height: imgRef.current.height * 0.9
                          })
                        }
                      }}
                      onError={() => {
                        setImageError(true)
                        setImageLoaded(false)
                      }}
                      style={{
                        transform: `scale(${scale}) rotate(${rotate}deg)`,
                        filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`,
                        maxHeight: '500px',
                        maxWidth: '100%'
                      }}
                      className="max-w-full h-auto"
                    />
                  </ReactCrop>
                )}
              </div>

              {/* Preview Canvas (hidden) */}
              <canvas
                ref={previewCanvasRef}
                style={{ display: 'none' }}
              />
            </div>

            {/* Controls - Takes 1 column */}
            <div className="space-y-4">
              {/* Crop Tab */}
              {activeTab === 'crop' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider">
                      Aspect Ratio Presets
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {presetCrops.map((preset) => (
                        <button
                          key={preset.name}
                          onClick={() => {
                            setCrop({
                              unit: '%',
                              width: 90,
                              height: preset.aspect ? 90 / preset.aspect : 90,
                              x: 5,
                              y: 5
                            })
                          }}
                          className="px-3 py-2 bg-blue-600 text-white rounded-sm hover:bg-blue-700 text-sm font-medium"
                        >
                          {preset.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-sm border border-blue-200 dark:border-blue-800">
                    <p className="text-xs text-blue-800 dark:text-blue-300">
                      💡 <strong>Tip:</strong> Drag the corners to adjust crop area. Use preset ratios for common formats.
                    </p>
                  </div>
                </div>
              )}

              {/* Adjust Tab */}
              {activeTab === 'adjust' && (
                <div className="space-y-4">
                  {/* Brightness */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                      ☀️ Brightness: {brightness}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={brightness}
                      onChange={(e) => setBrightness(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  {/* Contrast */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                      🌓 Contrast: {contrast}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={contrast}
                      onChange={(e) => setContrast(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  {/* Saturation */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                      🎨 Saturation: {saturation}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={saturation}
                      onChange={(e) => setSaturation(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  {/* Quick Presets */}
                  <div>
                    <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                      Quick Filters
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          setBrightness(110)
                          setContrast(110)
                          setSaturation(120)
                        }}
                        className="px-3 py-2 bg-yellow-600 text-white rounded-sm hover:bg-yellow-700 text-sm"
                      >
                        ☀️ Bright
                      </button>
                      <button
                        onClick={() => {
                          setBrightness(90)
                          setContrast(120)
                          setSaturation(80)
                        }}
                        className="px-3 py-2 bg-purple-600 text-white rounded-sm hover:bg-purple-700 text-sm"
                      >
                        🌙 Dark
                      </button>
                      <button
                        onClick={() => {
                          setBrightness(100)
                          setContrast(130)
                          setSaturation(150)
                        }}
                        className="px-3 py-2 bg-pink-600 text-white rounded-sm hover:bg-pink-700 text-sm"
                      >
                        🌸 Vivid
                      </button>
                      <button
                        onClick={() => {
                          setBrightness(100)
                          setContrast(100)
                          setSaturation(0)
                        }}
                        className="px-3 py-2 bg-gray-600 text-white rounded-sm hover:bg-gray-700 text-sm"
                      >
                        ⚫ B&W
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Transform Tab */}
              {activeTab === 'transform' && (
                <div className="space-y-4">
                  {/* Scale */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                      🔍 Scale: {scale.toFixed(2)}x
                    </label>
                    <input
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.1"
                      value={scale}
                      onChange={(e) => setScale(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  {/* Rotate */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                      🔄 Rotate: {rotate}°
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={rotate}
                      onChange={(e) => setRotate(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  {/* Quick Rotation */}
                  <div>
                    <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                      Quick Rotate
                    </h3>
                    <div className="grid grid-cols-4 gap-2">
                      <button
                        onClick={() => setRotate(0)}
                        className="px-3 py-2 bg-blue-600 text-white rounded-sm hover:bg-blue-700 text-sm"
                      >
                        0°
                      </button>
                      <button
                        onClick={() => setRotate(90)}
                        className="px-3 py-2 bg-blue-600 text-white rounded-sm hover:bg-blue-700 text-sm"
                      >
                        90°
                      </button>
                      <button
                        onClick={() => setRotate(180)}
                        className="px-3 py-2 bg-blue-600 text-white rounded-sm hover:bg-blue-700 text-sm"
                      >
                        180°
                      </button>
                      <button
                        onClick={() => setRotate(270)}
                        className="px-3 py-2 bg-blue-600 text-white rounded-sm hover:bg-blue-700 text-sm"
                      >
                        270°
                      </button>
                    </div>
                  </div>

                  {/* Flip */}
                  <div>
                    <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                      Flip
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setScale(-Math.abs(scale))}
                        className="px-3 py-2 bg-green-600 text-white rounded-sm hover:bg-green-700 text-sm"
                      >
                        ↔️ Horizontal
                      </button>
                      <button
                        onClick={() => setScale(Math.abs(scale))}
                        className="px-3 py-2 bg-green-600 text-white rounded-sm hover:bg-green-700 text-sm"
                      >
                        ↕️ Vertical
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Reset Button */}
              <button
                onClick={resetAll}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-sm hover:bg-gray-700 font-medium"
              >
                🔄 Reset All
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800">
          <button
            onClick={onCancel}
            className="px-6 py-2 bg-gray-500 text-white rounded-sm hover:bg-gray-600 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={processing || !imageLoaded || imageError || !completedCrop}
            className="px-6 py-2 bg-blue-600 text-white rounded-sm hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
          >
            {processing ? '⏳ Processing...' : !imageLoaded ? '⏳ Loading...' : imageError ? '❌ Image Error' : '💾 Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
