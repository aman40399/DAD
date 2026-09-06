'use client'

import React, { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import getCroppedImg from '@/lib/getCroppedImg'
import { useSupabaseClient } from '@/lib/supabase-client-hook'

interface Props {
  onUpload: (url: string) => void
  initialUrl?: string | null
}

export default function ImageUploader({ onUpload, initialUrl = null }: Props) {
  const supabase = useSupabaseClient()
  const [imageSrc, setImageSrc] = useState<string | null>(initialUrl)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(initialUrl)

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.addEventListener('load', () => setImageSrc(reader.result as string))
    reader.readAsDataURL(file)
  }

  const onCropComplete = useCallback((_: any, croppedAreaPixelsLocal: any) => {
    setCroppedAreaPixels(croppedAreaPixelsLocal)
  }, [])

  const uploadCroppedImage = async () => {
    if (!imageSrc || !croppedAreaPixels) return
    setLoading(true)
    try {
      const blob = await getCroppedImg(imageSrc, croppedAreaPixels)
      if (!blob) throw new Error('Failed to create image blob')
      
      const fileName = `${Date.now()}-upload.jpg`
      const { data, error } = await supabase.storage.from('article-images').upload(fileName, blob, { cacheControl: '3600', upsert: false })
      if (error) throw error
      
      const { data: publicUrlData } = supabase.storage.from('article-images').getPublicUrl(fileName)
      const url = publicUrlData.publicUrl
      setUploadedUrl(url)
      onUpload(url)
      setImageSrc(null)
      alert('✅ Image uploaded successfully! URL has been saved.')
    } catch (err) {
      console.error('Upload error', err)
      alert(`Failed to upload image: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <input 
          type="file" 
          accept="image/*" 
          onChange={onFileChange}
          className="text-sm text-neutral-600 dark:text-neutral-400 file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-400"
        />
        {uploadedUrl && (
          <span className="text-xs text-green-600 dark:text-green-400 font-semibold">
            ✓ Uploaded
          </span>
        )}
      </div>

      {uploadedUrl && !imageSrc && (
        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-sm border border-green-300 dark:border-green-700">
          <p className="text-xs font-semibold text-green-700 dark:text-green-400 mb-1">
            ✓ Image Uploaded Successfully
          </p>
          <p className="text-xs text-green-600 dark:text-green-500 break-all font-mono">
            {uploadedUrl}
          </p>
        </div>
      )}

      {imageSrc && (
        <div className="relative w-full h-64 bg-neutral-100 dark:bg-neutral-800 rounded-sm overflow-hidden">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={16 / 9}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>
      )}

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={uploadCroppedImage}
          disabled={loading || !imageSrc}
          className="px-4 py-2 bg-blue-600 text-white rounded-sm disabled:opacity-50 hover:bg-blue-700 transition-colors font-semibold text-sm"
        >
          {loading ? 'Uploading...' : 'Upload Image'}
        </button>
        {imageSrc && (
          <button
            type="button"
            onClick={() => setImageSrc(null)}
            className="px-4 py-2 bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-sm hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors font-semibold text-sm"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  )
}
