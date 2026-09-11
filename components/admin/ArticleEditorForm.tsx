'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import WordEditor from './WordEditor'
import { IconChevronLeft, IconChevronDown, IconSettings, IconMedia } from './AdminIcons'
import { Article } from '@/types'

interface ArticleEditorFormProps {
  initialArticle?: Partial<Article>
  isEditing?: boolean
}

const CATEGORIES = [
  'Politics',
  'World',
  'Business',
  'Technology',
  'Sports',
  'Opinion',
  'Arts',
  'Weather',
  'Education',
  'Lifestyle',
]

const HOMEPAGE_SLOTS = [
  { value: '', label: 'Auto-flow (Default: Latest)' },
  { value: '1', label: 'Slot 1: Breaking Ticker Bar' },
  { value: '2', label: 'Slot 2: Main Lead Hero Story' },
  { value: '3', label: 'Slot 3: Left Rail - Story 1' },
  { value: '4', label: 'Slot 4: Left Rail - Story 2' },
  { value: '5', label: 'Slot 5: Center - Sub-Lead 1' },
  { value: '6', label: 'Slot 6: Center - Sub-Lead 2' },
  { value: '7', label: 'Slot 7: Right Rail - 06' },
  { value: '8', label: 'Slot 8: Right Rail - 07' },
  { value: '9', label: 'Slot 9: Right Rail - 08' },
  { value: '10', label: 'Slot 10: Right Rail - 09' },
  { value: '11', label: 'Slot 11: Right Rail - 10' },
  { value: '12', label: 'Slot 12: Editor\'s Pick 1' },
  { value: '13', label: 'Slot 13: Editor\'s Pick 2' },
  { value: '14', label: 'Slot 14: Editor\'s Pick 3' },
  { value: '15', label: 'Slot 15: Editor\'s Pick 4' },
]

export default function ArticleEditorForm({
  initialArticle,
  isEditing = false,
}: ArticleEditorFormProps) {
  const router = useRouter()

  const [title, setTitle] = useState(initialArticle?.title || '')
  const [slug, setSlug] = useState(initialArticle?.slug || '')
  const [subtitle, setSubtitle] = useState(initialArticle?.subtitle || initialArticle?.excerpt || '')
  const [content, setContent] = useState(initialArticle?.content || '')
  const [category, setCategory] = useState(initialArticle?.category || 'World')
  const [author, setAuthor] = useState(initialArticle?.author || 'Dhananjay Singh')
  const [tags, setTags] = useState((initialArticle?.tags || []).join(', '))
  const [isBreaking, setIsBreaking] = useState(Boolean(initialArticle?.is_breaking || initialArticle?.isBreaking))
  const [slotPosition, setSlotPosition] = useState(
    initialArticle?.homepage_position || initialArticle?.homepagePosition ? String(initialArticle?.homepage_position || initialArticle?.homepagePosition) : ''
  )

  // Media gallery state
  const initialMainImage = initialArticle?.image_url || initialArticle?.imageUrl || ''
  const [images, setImages] = useState<{ url: string; caption?: string; aspect?: string }[]>(
    initialMainImage ? [{ url: initialMainImage, caption: initialArticle?.image_caption || initialArticle?.imageCaption, aspect: '16:10' }] : []
  )
  const [selectedMainImageUrl, setSelectedMainImageUrl] = useState<string>(initialMainImage)

  // Direct media upload state
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadingMedia, setUploadingMedia] = useState(false)
  const [uploadError, setUploadError] = useState('')

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [pushAlert, setPushAlert] = useState(true)

  // Imperative insert ref to place media at active cursor in WordEditor
  const insertHtmlRef = useRef<((html: string) => void) | null>(null)

  // Auto-generate slug when title changes (if not editing)
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle)
    if (!isEditing || !slug) {
      const generated = newTitle
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .slice(0, 60)
      setSlug(generated)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file.')
      return
    }

    setUploadingMedia(true)
    setUploadError('')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || 'Failed to upload image')
      }

      const data = await res.json()
      const newEntry = {
        url: data.url,
        caption: '',
        aspect: data.aspectRatio || '16:10',
      }

      setImages((prev) => [...prev, newEntry])
      if (!selectedMainImageUrl) {
        setSelectedMainImageUrl(data.url)
      }
    } catch (err: any) {
      console.error('Upload error:', err)
      setUploadError(err.message || 'Error uploading image')
    } finally {
      setUploadingMedia(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemoveImage = (urlToRemove: string) => {
    setImages((prev) => prev.filter((img) => img.url !== urlToRemove))
    if (selectedMainImageUrl === urlToRemove) {
      const remaining = images.filter((img) => img.url !== urlToRemove)
      setSelectedMainImageUrl(remaining.length > 0 ? remaining[0].url : '')
    }
  }

  const insertImageIntoContent = (url: string, caption?: string) => {
    const captionHtml = caption
      ? `<figcaption class="text-xs font-sans text-ink-mute dark:text-dark-mute mt-2 italic text-center">${caption}</figcaption>`
      : ''
    const htmlImg = `<figure class="my-6 flex flex-col items-center cursor-pointer transition-all" contenteditable="false"><img src="${url}" alt="${caption || 'Article image'}" class="rounded-xl border border-rule dark:border-white/10 shadow-sm max-h-[550px] object-cover" />${captionHtml}</figure><p><br></p>`
    
    if (insertHtmlRef.current) {
      insertHtmlRef.current(htmlImg)
    } else {
      setContent((prev) => prev + htmlImg)
    }
  }

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200))

  const handleSubmit = async (statusToSave: 'draft' | 'published') => {
    if (!title.trim()) {
      setError('Title is required')
      return
    }

    setSaving(true)
    setError('')

    const selectedImgObj = images.find((i) => i.url === selectedMainImageUrl)

    const payload = {
      title: title.trim(),
      slug: slug.trim() || undefined,
      subtitle: subtitle.trim(),
      excerpt: subtitle.trim(),
      content: content.trim(),
      category,
      author: author.trim(),
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      status: statusToSave,
      image_url: selectedMainImageUrl || (images[0]?.url ?? ''),
      image_caption: selectedImgObj?.caption || '',
      is_breaking: isBreaking,
      homepage_position: slotPosition ? parseInt(slotPosition, 10) : null,
    }

    try {
      const endpoint = isEditing && initialArticle?.id ? `/api/articles/${initialArticle.id}` : '/api/articles'
      const method = isEditing ? 'PUT' : 'POST'

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save article')
      }

      const savedData = await res.json().catch(() => null)
      const finalSlug = savedData?.article?.slug || slug || initialArticle?.slug

      // Broadcast push notification to subscribed devices if published
      if (statusToSave === 'published' && pushAlert) {
        try {
          await fetch('/api/notifications/broadcast', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: isBreaking ? `BREAKING: ${title.trim()}` : title.trim(),
              message: subtitle.trim() || `New dispatch from ${author.trim() || 'Dhananjay Singh'}: ${title.trim()}`,
              url: finalSlug ? `/article/${finalSlug}` : '/',
              imageUrl: selectedMainImageUrl || undefined,
              isBreaking,
            }),
          })
        } catch (pushErr) {
          console.warn('Push broadcast error:', pushErr)
        }
      }

      router.push('/admin')
      router.refresh()
    } catch (err: any) {
      setError(err?.message || 'Error saving article')
    } finally {
      setSaving(false)
    }
  }


  const [mobileTab, setMobileTab] = useState<'write' | 'settings'>('write')

  const handleTabSwitch = (tab: 'write' | 'settings') => {
    setMobileTab(tab)
    if (typeof window !== 'undefined') {
      const mainEl = document.querySelector('main')
      if (mainEl) mainEl.scrollTo({ top: 0, behavior: 'smooth' })
      else window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col space-y-3 sm:space-y-4 md:space-y-6 font-sans">
      {/* DESKTOP TOP ACTION BAR (hidden on mobile) */}
      <div className="hidden md:flex items-center justify-between gap-4 pb-1 shrink-0">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push('/admin')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-ink/70 dark:text-white/70 hover:text-ink dark:hover:text-white bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 rounded-full transition cursor-pointer active:scale-95"
            title="Return to stories"
          >
            ← Stories
          </button>
          <div className="h-4 w-px bg-black/[0.08] dark:bg-white/[0.1]" />
          <h1 className="text-2xl font-bold tracking-tight text-ink dark:text-dark-ink">
            {isEditing ? 'Edit Story' : 'New Story'}
          </h1>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full backdrop-blur-md bg-white/60 dark:bg-white/[0.06] border border-black/[0.08] dark:border-white/[0.08] text-xs font-medium text-ink-mute dark:text-dark-mute shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#0071e3]" />
            <span className="capitalize">{category || 'News'}</span>
            <span className="opacity-40">•</span>
            <span>{slotPosition ? `Slot #${slotPosition}` : 'Unslotted'}</span>
            <span className="opacity-40">•</span>
            <span className="capitalize">{status}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleSubmit('draft')}
            disabled={saving}
            className="px-4 py-2 text-xs font-medium text-ink/80 dark:text-white/80 hover:text-ink dark:hover:text-white rounded-full border border-black/[0.08] dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition disabled:opacity-50 cursor-pointer active:scale-95 shadow-2xs"
          >
            Save Draft
          </button>
          <button
            type="button"
            onClick={() => handleSubmit('published')}
            disabled={saving}
            className="px-5 py-2 text-xs font-medium text-white rounded-full bg-[#0071e3] hover:bg-[#0077ed] active:bg-[#0062c4] transition disabled:opacity-50 shadow-xs cursor-pointer active:scale-95"
          >
            {saving ? 'Publishing…' : isEditing ? 'Update Story' : 'Publish Story'}
          </button>
        </div>
      </div>

      {/* MOBILE TOP ACTION STRIP (Apple Notes native feel) */}
      <div className="md:hidden flex items-center justify-between gap-2 p-2.5 backdrop-blur-2xl bg-white/85 dark:bg-[#1c1c1e]/85 border border-black/[0.08] dark:border-white/10 rounded-full shadow-xs shrink-0">
        <button
          type="button"
          onClick={() => router.push('/admin')}
          className="h-8 w-8 flex items-center justify-center text-ink-mute dark:text-dark-mute hover:text-ink dark:hover:text-white bg-black/5 dark:bg-white/10 rounded-full transition cursor-pointer active:scale-95 shrink-0"
          title="Back to stories"
        >
          <IconChevronLeft className="w-4 h-4 stroke-[2.2]" />
        </button>

        {/* Segmented Pill: [ Write ] · [ Settings Icon ] */}
        <div className="flex items-center bg-black/5 dark:bg-white/10 p-0.5 rounded-full">
          <button
            type="button"
            id="tab-write-btn"
            onClick={() => handleTabSwitch('write')}
            className={`px-3 py-1 text-[11px] font-semibold rounded-full transition cursor-pointer active:scale-95 ${
              mobileTab === 'write'
                ? 'bg-white dark:bg-[#2c2c2e] text-[#0071e3] shadow-xs'
                : 'text-ink-mute dark:text-dark-mute hover:text-ink dark:hover:text-white'
            }`}
            title="Write Story"
          >
            Write
          </button>
          <button
            type="button"
            id="tab-settings-btn"
            onClick={() => handleTabSwitch('settings')}
            className={`px-2.5 py-1 text-[11px] font-semibold rounded-full transition cursor-pointer flex items-center justify-center gap-1 relative active:scale-95 ${
              mobileTab === 'settings'
                ? 'bg-white dark:bg-[#2c2c2e] text-[#0071e3] shadow-xs'
                : 'text-ink-mute dark:text-dark-mute hover:text-ink dark:hover:text-white'
            }`}
            title="Settings & Placement"
          >
            <IconSettings className="w-3.5 h-3.5" />
            {images.length > 0 && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#0071e3] absolute top-1 right-1" />
            )}
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => handleSubmit('draft')}
            disabled={saving}
            className="h-8 px-3 border border-black/[0.08] dark:border-white/10 text-ink dark:text-dark-ink text-[11px] font-semibold rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition disabled:opacity-50 cursor-pointer active:scale-95"
          >
            Draft
          </button>
          <button
            type="button"
            onClick={() => handleSubmit('published')}
            disabled={saving}
            className="h-8 px-3.5 bg-[#0071e3] hover:bg-[#0077ed] text-white text-[11px] font-semibold rounded-full transition disabled:opacity-50 shadow-xs cursor-pointer active:scale-95"
          >
            {saving ? 'Saving…' : 'Publish'}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 backdrop-blur-xl bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-300 text-xs font-semibold rounded-2xl shadow-xs shrink-0">
          {error}
        </div>
      )}

      {/* VIEWPORT CONTAINER */}
      <div className="flex-1 min-h-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start pb-16 md:pb-0">
          {/* COLUMN 1: WRITING CANVAS (Visible on mobile when mobileTab === 'write', always on desktop) */}
          <div
            className={`${
              mobileTab === 'write' ? 'block' : 'hidden'
            } md:block lg:col-span-8 backdrop-blur-xl bg-white/70 dark:bg-[#1c1c1e]/75 border border-black/[0.06] dark:border-white/[0.08] rounded-3xl p-5 sm:p-7 lg:p-8 space-y-4 sm:space-y-6 shadow-[0_4px_24px_rgba(0,0,0,0.03)]`}
          >
            {/* Headline (Article Title) */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-ink-mute dark:text-dark-mute mb-2">
                Headline *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Story headline"
                className="w-full text-xl sm:text-2xl lg:text-3xl font-serif font-black px-4 py-3 bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/10 text-ink dark:text-dark-ink focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20 focus:border-[#0071e3] rounded-2xl placeholder:text-ink-mute/40 transition tracking-tight"
              />
            </div>

            {/* Subtitle / Deck */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-ink-mute dark:text-dark-mute mb-1.5">
                Subtitle / Deck
              </label>
              <textarea
                rows={2}
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="Story summary or deck (italic subtitle shown on cards & article header)"
                className="w-full text-xs sm:text-sm md:text-base font-serif italic px-4 py-3 bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/10 text-ink dark:text-dark-ink focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20 focus:border-[#0071e3] rounded-2xl placeholder:text-ink-mute/40 transition leading-relaxed resize-none"
              />
            </div>

            {/* Story Content & Word Editor */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-ink-mute dark:text-dark-mute">
                  Story Content *
                </label>
                <div className="flex items-center gap-2 text-[10px] sm:text-[11px] font-mono text-ink-mute dark:text-dark-mute bg-black/5 dark:bg-white/5 px-2.5 py-0.5 rounded-full">
                  <span>{wordCount} words</span>
                  <span>•</span>
                  <span className="text-[#0071e3] font-semibold">{readingTimeMinutes} min read</span>
                </div>
              </div>

              <WordEditor
                value={content}
                onChange={setContent}
                placeholder="Start typing the story dispatch here…"
                insertHtmlRef={insertHtmlRef}
              />
            </div>
          </div>

          {/* COLUMN 2: SETTINGS, MEDIA, METADATA (Visible on mobile when mobileTab === 'settings', always on desktop) */}
          <div
            className={`${
              mobileTab === 'settings' ? 'block' : 'hidden'
            } md:block lg:col-span-4 min-w-0 w-full space-y-4 sm:space-y-5`}
          >
            {/* FEATURED MEDIA CARD */}
            <div className="p-5 sm:p-6 backdrop-blur-xl bg-white/70 dark:bg-[#1c1c1e]/75 border border-black/[0.06] dark:border-white/[0.08] rounded-3xl space-y-4 shadow-[0_4px_24px_rgba(0,0,0,0.03)] min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-xs tracking-wide text-ink dark:text-dark-ink">
                  Featured Media
                </h3>
                {images.length > 0 && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-ink-mute dark:text-dark-mute">
                    {images.length} asset{images.length > 1 ? 's' : ''}
                  </span>
                )}
              </div>

              {/* Direct Media Upload Button */}
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="featured-media-file-input"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingMedia}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-dashed border-black/20 dark:border-white/15 bg-white/80 hover:bg-black/5 dark:bg-white/[0.04] dark:hover:bg-white/10 text-ink dark:text-dark-ink text-xs font-semibold rounded-2xl transition cursor-pointer active:scale-[0.98] disabled:opacity-50 shadow-xs"
                >
                  {uploadingMedia ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-[#0071e3] border-t-transparent rounded-full animate-spin" />
                      <span>Uploading media...</span>
                    </>
                  ) : (
                    <>
                      <IconMedia className="w-4 h-4 text-[#0071e3]" />
                      <span>Upload Media</span>
                    </>
                  )}
                </button>
                {uploadError && (
                  <p className="text-[11px] text-red-500 font-medium mt-1.5">{uploadError}</p>
                )}
              </div>

              {/* Uploaded Images List */}
              {images.length > 0 && (
                <div className="space-y-2.5 pt-3 border-t border-black/[0.06] dark:border-white/10">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-ink-mute">
                    Media Library
                  </p>

                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1 apple-scrollbar">
                    {images.map((img, idx) => {
                      const isMain = selectedMainImageUrl === img.url

                      return (
                        <div
                          key={idx}
                          className={`p-3 border rounded-2xl transition space-y-2 shadow-xs ${
                            isMain
                              ? 'border-[#0071e3] bg-[#0071e3]/[0.05]'
                              : 'border-black/[0.06] dark:border-white/10 bg-white/80 dark:bg-white/[0.04]'
                          }`}
                        >
                          <div className="flex gap-2.5 items-start">
                            <img
                              src={img.url}
                              alt=""
                              className="w-14 h-11 object-cover border border-black/[0.06] dark:border-white/10 shrink-0 rounded-xl"
                            />
                            <div className="flex-1 min-w-0">
                              <label className="flex items-center gap-1.5 cursor-pointer">
                                <input
                                  type="radio"
                                  name="mainImageRadio"
                                  checked={isMain}
                                  onChange={() => setSelectedMainImageUrl(img.url)}
                                  className="accent-[#0071e3]"
                                />
                                <span className="text-xs font-semibold text-ink dark:text-dark-ink truncate">
                                  {isMain ? 'Primary Hero Image' : 'Set as Primary'}
                                </span>
                              </label>
                              {img.caption && (
                                <p className="text-[10px] text-ink-mute truncate mt-0.5">
                                  {img.caption}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-1.5 border-t border-black/[0.05] dark:border-white/10 text-[11px]">
                            <button
                              type="button"
                              onClick={() => insertImageIntoContent(img.url, img.caption)}
                              className="text-[#0071e3] hover:underline font-medium cursor-pointer"
                            >
                              Insert in story
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(img.url)}
                              className="text-red-600 hover:underline cursor-pointer font-medium"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* HOMEPAGE SLOT PLACEMENT */}
            <div className="p-5 sm:p-6 backdrop-blur-xl bg-white/70 dark:bg-[#1c1c1e]/75 border border-black/[0.06] dark:border-white/[0.08] rounded-3xl space-y-3.5 shadow-[0_4px_24px_rgba(0,0,0,0.03)] min-w-0">
              <h3 className="font-semibold text-xs tracking-wide text-ink dark:text-dark-ink">
                Homepage Placement
              </h3>

              <div className="w-full min-w-0">
                <label className="block text-[10px] font-semibold text-ink-mute dark:text-dark-mute mb-1">
                  Broadsheet Slot Position
                </label>
                <div className="relative w-full min-w-0">
                  <select
                    value={slotPosition}
                    onChange={(e) => setSlotPosition(e.target.value)}
                    className="w-full max-w-full min-w-0 h-11 appearance-none pl-4 pr-10 bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/10 text-ink dark:text-dark-ink text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20 focus:border-[#0071e3] rounded-full cursor-pointer shadow-xs truncate"
                  >
                    {HOMEPAGE_SLOTS.map((slot) => (
                      <option
                        key={slot.value}
                        value={slot.value}
                        className="bg-white dark:bg-[#1c1c1e] text-ink dark:text-white py-1"
                      >
                        {slot.label}
                      </option>
                    ))}
                  </select>
                  <IconChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-mute/70 dark:text-white/40" />
                </div>
              </div>

              <label className="flex items-center gap-2 pt-1 cursor-pointer text-xs select-none">
                <input
                  type="checkbox"
                  checked={isBreaking}
                  onChange={(e) => setIsBreaking(e.target.checked)}
                  className="w-4 h-4 accent-[#0071e3] rounded cursor-pointer"
                />
                <span className="font-semibold text-ink dark:text-dark-ink">
                  Breaking News Dispatch
                </span>
              </label>
            </div>

            {/* TAXONOMY & BYLINES */}
            <div className="p-5 sm:p-6 backdrop-blur-xl bg-white/70 dark:bg-[#1c1c1e]/75 border border-black/[0.06] dark:border-white/[0.08] rounded-3xl space-y-4 shadow-[0_4px_24px_rgba(0,0,0,0.03)] min-w-0">
              <h3 className="font-semibold text-xs tracking-wide text-ink dark:text-dark-ink">
                Taxonomy &amp; Metadata
              </h3>

              {/* URL Slug */}
              <div className="w-full min-w-0">
                <label className="block text-[10px] font-semibold text-ink-mute dark:text-dark-mute mb-1">
                  URL Slug
                </label>
                <div className="flex items-center px-3.5 py-2.5 bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/10 rounded-full text-xs font-mono">
                  <span className="text-ink-mute select-none mr-1">/article/</span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="story-url-slug"
                    className="w-full bg-transparent text-ink dark:text-dark-ink focus:outline-none placeholder:text-ink-mute/40 font-mono text-xs"
                  />
                </div>
              </div>

              <div className="w-full min-w-0">
                <label className="block text-[10px] font-semibold text-ink-mute dark:text-dark-mute mb-1">
                  Category
                </label>
                <div className="relative w-full min-w-0">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full max-w-full min-w-0 h-11 appearance-none pl-4 pr-10 bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/10 text-ink dark:text-dark-ink text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20 focus:border-[#0071e3] rounded-full cursor-pointer shadow-xs truncate"
                  >
                    {CATEGORIES.map((cat) => (
                      <option
                        key={cat}
                        value={cat}
                        className="bg-white dark:bg-[#1c1c1e] text-ink dark:text-white py-1"
                      >
                        {cat}
                      </option>
                    ))}
                  </select>
                  <IconChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-mute/70 dark:text-white/40" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-ink-mute dark:text-dark-mute mb-1">
                  Author
                </label>
                <div className="flex items-center justify-between px-4 py-2.5 bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/10 text-ink dark:text-dark-ink text-xs font-medium rounded-full">
                  <span className="font-semibold">Dhananjay Singh</span>
                  <span className="text-[10px] font-mono text-ink-mute dark:text-dark-mute">Lead Correspondent</span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-ink-mute dark:text-dark-mute mb-1">
                  Tags
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="Comma-separated tags"
                  className="w-full text-xs px-4 py-2.5 bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/10 text-ink dark:text-dark-ink focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20 focus:border-[#0071e3] rounded-full"
                />
              </div>

              {/* Push Notification Toggle */}
              <div className="pt-2 border-t border-black/[0.06] dark:border-white/10">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={pushAlert}
                    onChange={(e) => setPushAlert(e.target.checked)}
                    className="w-4 h-4 accent-[#0071e3] rounded cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-ink dark:text-dark-ink">
                    Send push notification to subscribers
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
