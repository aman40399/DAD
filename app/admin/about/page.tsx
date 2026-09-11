'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import Link from 'next/link'
import AdminToast, { ToastMessage } from '@/components/admin/AdminToast'
import {
  IconCheck,
  IconClose,
  IconCopy,
  IconDocument,
  IconExternalLink,
  IconPlus,
  IconRefresh,
  IconTrash,
  IconArrowUp,
  IconArrowDown,
  IconDeviceMobile,
  IconDeviceDesktop,
} from '@/components/admin/AdminIcons'
import { AboutConfig, EditorialTenet, ColophonItem, DEFAULT_ABOUT_CONFIG } from '@/types/about'

type TabKey = 'hero' | 'founder' | 'tenets' | 'colophon' | 'legal' | 'mobile'

export default function AdminAboutPage() {
  const [config, setConfig] = useState<AboutConfig>(DEFAULT_ABOUT_CONFIG)
  const [initialConfig, setInitialConfig] = useState<AboutConfig>(DEFAULT_ABOUT_CONFIG)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<TabKey>('hero')
  const [viewMode, setViewMode] = useState<'editor' | 'preview'>('editor')
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'desktop'>('mobile')
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const [isDirty, setIsDirty] = useState(false)

  const addToast = (type: 'success' | 'error' | 'info', title: string, description?: string) => {
    setToasts((prev) => [...prev, { id: `${Date.now()}-${Math.random()}`, type, title, description }])
  }

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  // Fetch current config from API
  const fetchConfig = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/about?_t=${Date.now()}`, {
        cache: 'no-store',
      })
      if (res.ok) {
        const data = await res.json()
        if (data.config) {
          setConfig(data.config)
          setInitialConfig(data.config)
          setIsDirty(false)
        }
      } else {
        addToast('error', 'Fetch Failed', 'Could not load About page settings.')
      }
    } catch (err: any) {
      console.error('Error fetching about config:', err)
      addToast('error', 'Network Error', err.message || 'Failed to connect to server.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchConfig()
  }, [])

  // Check dirty state
  useEffect(() => {
    const dirty = JSON.stringify(config) !== JSON.stringify(initialConfig)
    setIsDirty(dirty)
  }, [config, initialConfig])

  // Save handler
  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/about', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        setInitialConfig(data.config || config)
        setIsDirty(false)
        addToast('success', 'Changes Saved', 'About Us page has been updated live.')
      } else {
        throw new Error(data.error || 'Failed to save configuration.')
      }
    } catch (err: any) {
      addToast('error', 'Save Error', err.message || 'Could not save changes.')
    } finally {
      setSaving(false)
    }
  }

  // Keyboard shortcut: Cmd/Ctrl + S to save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        if (!saving) {
          handleSave()
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [config, saving])

  // Reset to broadsheet defaults
  const handleReset = async () => {
    if (!confirm('Reset all About Us content to classic broadsheet editorial defaults?')) return
    setSaving(true)
    try {
      const res = await fetch('/api/about/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reset: true }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setConfig(data.config || DEFAULT_ABOUT_CONFIG)
        setInitialConfig(data.config || DEFAULT_ABOUT_CONFIG)
        setIsDirty(false)
        addToast('info', 'Reset Complete', 'Default broadsheet charter restored.')
      } else {
        throw new Error(data.error || 'Failed to reset.')
      }
    } catch (err: any) {
      addToast('error', 'Reset Failed', err.message)
    } finally {
      setSaving(false)
    }
  }

  // Update helper
  const updateField = <K extends keyof AboutConfig>(key: K, value: AboutConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }))
  }

  // Update mobile variant helper
  const updateMobileVariant = <K extends keyof AboutConfig['mobileVariant']>(
    key: K,
    value: AboutConfig['mobileVariant'][K]
  ) => {
    setConfig((prev) => ({
      ...prev,
      mobileVariant: {
        ...prev.mobileVariant,
        [key]: value,
      },
    }))
  }

  // Tenet helpers
  const handleAddTenet = () => {
    const count = (config.tenets || []).length + 1
    const newTenet: EditorialTenet = {
      id: `tenet-${Date.now()}`,
      label: `Tenet 0${count}`,
      title: 'New Editorial Pillar',
      description: 'Describe the journalistic standard, verification principle, or institutional mandate.',
    }
    setConfig((prev) => ({
      ...prev,
      tenets: [...(prev.tenets || []), newTenet],
    }))
    addToast('info', 'Tenet Added', `Tenet 0${count} created.`)
  }

  const handleUpdateTenet = (index: number, field: keyof EditorialTenet, val: string) => {
    setConfig((prev) => {
      const updated = [...prev.tenets]
      updated[index] = { ...updated[index], [field]: val }
      return { ...prev, tenets: updated }
    })
  }

  const handleDeleteTenet = (index: number) => {
    setConfig((prev) => {
      const updated = prev.tenets.filter((_, i) => i !== index)
      return { ...prev, tenets: updated }
    })
    addToast('info', 'Tenet Removed', 'Editorial tenet removed.')
  }

  const handleMoveTenet = (index: number, direction: 'up' | 'down') => {
    setConfig((prev) => {
      const updated = [...prev.tenets]
      const targetIndex = direction === 'up' ? index - 1 : index + 1
      if (targetIndex < 0 || targetIndex >= updated.length) return prev
      const temp = updated[index]
      updated[index] = updated[targetIndex]
      updated[targetIndex] = temp
      return { ...prev, tenets: updated }
    })
  }

  // Colophon helpers
  const handleAddColophon = () => {
    const newCol: ColophonItem = {
      id: `col-${Date.now()}`,
      title: 'New Standard',
      description: 'Detail the editorial, typographic, or technological specifications.',
    }
    setConfig((prev) => ({
      ...prev,
      colophonItems: [...(prev.colophonItems || []), newCol],
    }))
  }

  const handleUpdateColophon = (index: number, field: keyof ColophonItem, val: string) => {
    setConfig((prev) => {
      const updated = [...prev.colophonItems]
      updated[index] = { ...updated[index], [field]: val }
      return { ...prev, colophonItems: updated }
    })
  }

  const handleDeleteColophon = (index: number) => {
    setConfig((prev) => {
      const updated = prev.colophonItems.filter((_, i) => i !== index)
      return { ...prev, colophonItems: updated }
    })
  }

  const tabs: { key: TabKey; label: string; count?: number }[] = [
    { key: 'hero', label: 'Hero & Mission' },
    { key: 'founder', label: 'Founder Profile' },
    { key: 'tenets', label: 'Tenets & Creed', count: config.tenets?.length || 0 },
    { key: 'colophon', label: 'Colophon & Craft', count: config.colophonItems?.length || 0 },
    { key: 'legal', label: 'Legal Callout' },
    { key: 'mobile', label: 'Mobile Variants' },
  ]

  return (
    <div className="space-y-6 font-apple text-[#1d1d1f] dark:text-white pb-16">
      {/* 1. APPLE MINIMALIST TOP ROW */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3.5 flex-wrap">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#1d1d1f] dark:text-white">
            About
          </h1>

          {/* Unified Status Capsule Box */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full backdrop-blur-xl bg-white/70 dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.08] text-xs font-medium shadow-2xs">
            <span className="text-[#0071e3] dark:text-[#2997ff] font-semibold">
              Institutional Charter
            </span>
            <span className="text-black/20 dark:text-white/20">•</span>
            <span className={isDirty ? "text-amber-600 dark:text-amber-400 font-semibold" : "text-[#1d1d1f]/60 dark:text-white/60"}>
              {isDirty ? 'Unsaved Edits' : 'Up to date'}
            </span>
          </div>
        </div>

        {/* Primary Action Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {/* View Mode Toggle: Form vs Live Preview */}
          <div className="flex items-center p-1 bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.03] dark:border-white/[0.05] rounded-full">
            <button
              type="button"
              onClick={() => setViewMode('editor')}
              className={`h-7 px-3.5 text-xs rounded-full transition-all duration-150 active:scale-95 cursor-pointer font-semibold ${
                viewMode === 'editor'
                  ? 'bg-white dark:bg-[#2c2c2e] text-[#0071e3] dark:text-[#2997ff] shadow-2xs'
                  : 'text-[#1d1d1f]/60 dark:text-white/60 hover:text-[#1d1d1f] dark:hover:text-white'
              }`}
            >
              Editor
            </button>
            <button
              type="button"
              onClick={() => setViewMode('preview')}
              className={`h-7 px-3.5 text-xs rounded-full transition-all duration-150 active:scale-95 cursor-pointer flex items-center gap-1 font-semibold ${
                viewMode === 'preview'
                  ? 'bg-white dark:bg-[#2c2c2e] text-[#0071e3] dark:text-[#2997ff] shadow-2xs'
                  : 'text-[#1d1d1f]/60 dark:text-white/60 hover:text-[#1d1d1f] dark:hover:text-white'
              }`}
            >
              <IconDeviceMobile className="w-3 h-3" />
              <span>Preview</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleReset}
            disabled={saving}
            className="h-9 px-3.5 border border-black/[0.08] dark:border-white/10 hover:border-red-400/60 rounded-full text-[#1d1d1f]/70 dark:text-white/70 hover:text-red-600 dark:hover:text-red-400 text-xs font-semibold transition cursor-pointer bg-white/70 dark:bg-white/[0.06] shadow-2xs active:scale-95"
            title="Reset to default broadsheet text"
          >
            Reset
          </button>

          <Link
            href="/about"
            target="_blank"
            rel="noreferrer"
            className="h-9 px-3.5 border border-black/[0.08] dark:border-white/10 hover:border-[#0071e3] rounded-full text-[#1d1d1f]/70 hover:text-[#1d1d1f] dark:text-white/70 dark:hover:text-white text-xs font-semibold transition inline-flex items-center gap-1 bg-white/70 dark:bg-white/[0.06] shadow-2xs active:scale-95"
            title="Open public About Us page"
          >
            <span>Live</span>
            <IconExternalLink className="w-3 h-3" />
          </Link>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !isDirty}
            className={`h-9 px-4 rounded-full text-xs font-semibold transition cursor-pointer shadow-2xs inline-flex items-center gap-1.5 shrink-0 ${
              isDirty
                ? 'bg-[#0071e3] hover:bg-[#0077ed] text-white active:scale-95'
                : 'bg-black/[0.04] dark:bg-white/10 text-[#1d1d1f]/40 dark:text-white/40 border border-black/[0.06] dark:border-white/10 cursor-not-allowed'
            }`}
          >
            {saving ? (
              <>
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving…</span>
              </>
            ) : (
              <>
                <IconCheck className="w-3.5 h-3.5" />
                <span>Save</span>
              </>
            )}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-24 text-center">
          <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-mono uppercase tracking-widest text-ink-mute">
            Loading About Us Configuration…
          </p>
        </div>
      ) : viewMode === 'preview' ? (
        /* 2. DEVICE VARIANT PREVIEW (Mobile & Desktop simulators) */
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-paper-subtle dark:bg-white/[0.03] border border-rule/60 dark:border-white/10 rounded-2xl p-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-ink dark:text-dark-ink">
                Simulated Viewport:
              </span>
              <div className="flex items-center p-0.5 bg-paper dark:bg-white/10 rounded-full border border-rule/60 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setPreviewDevice('mobile')}
                  className={`px-3 py-1 rounded-full text-xs flex items-center gap-1.5 transition ${
                    previewDevice === 'mobile'
                      ? 'bg-accent text-white font-bold'
                      : 'text-ink-mute dark:text-dark-mute hover:text-ink'
                  }`}
                >
                  <IconDeviceMobile className="w-3.5 h-3.5" />
                  <span>Mobile (390px)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice('desktop')}
                  className={`px-3 py-1 rounded-full text-xs flex items-center gap-1.5 transition ${
                    previewDevice === 'desktop'
                      ? 'bg-accent text-white font-bold'
                      : 'text-ink-mute dark:text-dark-mute hover:text-ink'
                  }`}
                >
                  <IconDeviceDesktop className="w-3.5 h-3.5" />
                  <span>Desktop (1080px)</span>
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setViewMode('editor')}
              className="text-xs text-accent hover:underline font-semibold"
            >
              ← Back to Editor
            </button>
          </div>

          {/* Interactive Frame */}
          <div className="flex justify-center p-2 sm:p-6 bg-paper-subtle/40 dark:bg-black/30 border border-rule/60 dark:border-white/10 rounded-3xl overflow-hidden min-h-[600px]">
            <div
              className={`bg-paper dark:bg-dark-paper border border-rule dark:border-dark-rule rounded-3xl shadow-2xl transition-all duration-300 overflow-y-auto max-h-[780px] ${
                previewDevice === 'mobile'
                  ? 'w-[390px] border-[6px] border-neutral-800 dark:border-neutral-700'
                  : 'w-full max-w-[1080px]'
              }`}
            >
              {/* Device Notch on Mobile */}
              {previewDevice === 'mobile' && (
                <div className="sticky top-0 z-30 bg-neutral-900 text-white h-6 flex items-center justify-between px-6 text-[10px] font-mono">
                  <span>9:41</span>
                  <div className="w-20 h-3.5 bg-black rounded-full mx-auto" />
                  <span>5G</span>
                </div>
              )}

              {/* Rendered About Component Simulation */}
              <div
                className={`p-4 sm:p-6 ${
                  config.mobileVariant?.denseSpacing && previewDevice === 'mobile'
                    ? 'py-4'
                    : 'py-8'
                }`}
              >
                {/* Dateline */}
                <div className="flex items-center justify-between border-b border-rule dark:border-dark-rule pb-2 mb-6 font-mono text-[10px] uppercase tracking-wider text-ink-mute dark:text-dark-mute">
                  <span>Home / About Us</span>
                  <span>{config.breadcrumbSubtitle}</span>
                </div>

                {/* Hero */}
                <div className="text-center mb-8">
                  {config.eyebrow && (
                    <p className="font-mono text-[10px] uppercase tracking-widest text-accent font-semibold mb-2">
                      {config.eyebrow}
                    </p>
                  )}
                  <h1
                    className={`font-serif font-black tracking-tight leading-[1.15] mb-4 text-ink dark:text-dark-ink ${
                      previewDevice === 'mobile' ? 'text-2xl' : 'text-4xl'
                    }`}
                  >
                    {config.headline}
                  </h1>
                  {config.missionStatement && (
                    <p className="font-serif italic text-xs sm:text-sm text-ink-mute dark:text-dark-mute leading-relaxed">
                      {config.missionStatement}
                    </p>
                  )}
                  {config.showDivider && <div className="w-16 h-0.5 bg-accent mx-auto mt-4 opacity-80" />}
                </div>

                {/* Founder Profile */}
                <div className="bg-paper-subtle dark:bg-[#141418] border border-rule/70 dark:border-white/10 rounded-2xl p-4 sm:p-6 mb-8">
                  <div
                    className={`flex gap-4 ${
                      previewDevice === 'mobile' && config.mobileVariant?.photoPosition === 'center'
                        ? 'flex-col items-center text-center'
                        : previewDevice === 'mobile' && config.mobileVariant?.photoPosition === 'top'
                        ? 'flex-col items-start text-left'
                        : 'flex-row items-start'
                    }`}
                  >
                    {config.authorPhotoUrl && (
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border border-rule dark:border-white/10 shrink-0 shadow-xs">
                        <img
                          src={config.authorPhotoUrl}
                          alt={config.authorName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-baseline gap-1">
                        <h2 className="font-serif font-black text-lg sm:text-xl text-ink dark:text-dark-ink">
                          {config.authorName}
                        </h2>
                        {config.authorRole && (
                          <span className="font-mono text-[10px] uppercase tracking-wider text-accent font-semibold">
                            {config.authorRole}
                          </span>
                        )}
                      </div>
                      <p className="font-serif text-xs leading-relaxed text-ink/80 dark:text-dark-ink/80">
                        {config.authorBio}
                      </p>
                      <div className="font-mono text-[10px] text-ink-mute dark:text-dark-mute pt-1">
                        <span>{config.locationText}</span> • <span>{config.inquiriesEmail}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tenets */}
                <div
                  className={`grid gap-4 mb-8 ${
                    previewDevice === 'mobile' && config.mobileVariant?.compactTenets
                      ? 'grid-cols-1'
                      : previewDevice === 'mobile'
                      ? 'grid-cols-1'
                      : 'grid-cols-2'
                  }`}
                >
                  {(config.tenets || []).map((t, idx) => (
                    <div
                      key={t.id || idx}
                      className="border border-rule dark:border-dark-rule rounded-xl p-4 bg-paper dark:bg-dark-paper"
                    >
                      <span className="font-mono text-[10px] font-bold text-accent uppercase tracking-wider block mb-1">
                        {t.label}
                      </span>
                      <h3 className="font-serif font-bold text-base mb-1.5 text-ink dark:text-dark-ink">
                        {t.title}
                      </h3>
                      <p className="font-serif text-xs text-ink/75 dark:text-dark-ink/75 leading-relaxed">
                        {t.description}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Colophon */}
                {config.mobileVariant?.showColophon !== false && (config.colophonItems || []).length > 0 && (
                  <div className="border-t border-b border-rule dark:border-dark-rule py-6 my-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {config.colophonItems.map((c, idx) => (
                      <div key={c.id || idx}>
                        <h4 className="font-mono text-[10px] uppercase tracking-wider text-accent font-semibold mb-1">
                          {c.title}
                        </h4>
                        <p className="font-serif text-[11px] text-ink/75 dark:text-dark-ink/75 leading-relaxed">
                          {c.description}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Legal Banner */}
                {config.showLegalBanner && (
                  <div className="bg-paper-subtle dark:bg-dark-subtle rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 border border-rule dark:border-dark-rule">
                    <div>
                      <h4 className="font-serif font-bold text-sm text-ink dark:text-dark-ink">
                        {config.legalHeading}
                      </h4>
                      <p className="font-serif text-[11px] text-ink-mute dark:text-dark-mute">
                        {config.legalDescription}
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full border border-ink/30 dark:border-white/30 text-[10px] font-mono font-bold uppercase shrink-0">
                      {config.legalButtonText}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* 3. FORM EDITOR WITH SECTION TABS */
        <div className="space-y-6">
          {/* Horizontal Scrollable Navigation Tabs (Apple Segmented Bar) */}
          <div className="flex items-center gap-1 overflow-x-auto p-1 bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/10 rounded-full scrollbar-none">
            {tabs.map((tab) => {
              const active = activeTab === tab.key
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`shrink-0 px-4 py-1.5 rounded-full text-xs transition cursor-pointer flex items-center gap-1.5 select-none active:scale-95 ${
                    active
                      ? 'bg-white dark:bg-[#2c2c2e] text-[#0071e3] font-semibold shadow-xs'
                      : 'text-ink-mute dark:text-dark-mute hover:text-ink dark:hover:text-white'
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.count !== undefined && tab.count > 0 && (
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                        active
                          ? 'bg-[#0071e3]/15 text-[#0071e3]'
                          : 'bg-black/5 dark:bg-white/10 text-ink-mute'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* TAB 1: HERO & MISSION */}
          {activeTab === 'hero' && (
            <div className="space-y-5 backdrop-blur-xl bg-white/70 dark:bg-[#1c1c1e]/75 border border-black/[0.06] dark:border-white/[0.08] rounded-3xl p-5 sm:p-7 shadow-[0_4px_24px_rgba(0,0,0,0.03)] animate-in fade-in duration-150">
              <div>
                <h3 className="font-serif font-black text-base sm:text-lg text-ink dark:text-dark-ink tracking-tight">
                  Institutional Charter & Hero Presentation
                </h3>
                <p className="text-xs text-ink-mute dark:text-dark-mute mt-0.5 font-serif italic">
                  Headline, creed label, mission statement, and dateline metadata.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono font-semibold uppercase tracking-wider text-ink-mute dark:text-dark-mute">
                    Eyebrow / Category Label
                  </label>
                  <input
                    type="text"
                    value={config.eyebrow}
                    onChange={(e) => updateField('eyebrow', e.target.value)}
                    placeholder="Institutional Charter & Editorial Creed"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-rule/70 dark:border-white/10 bg-paper dark:bg-white/[0.04] text-ink dark:text-white focus:outline-none focus:border-accent"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono font-semibold uppercase tracking-wider text-ink-mute dark:text-dark-mute">
                    Dateline / Subtitle
                  </label>
                  <input
                    type="text"
                    value={config.breadcrumbSubtitle}
                    onChange={(e) => updateField('breadcrumbSubtitle', e.target.value)}
                    placeholder="Journal of Record • Est. 2026"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-rule/70 dark:border-white/10 bg-paper dark:bg-white/[0.04] text-ink dark:text-white focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono font-semibold uppercase tracking-wider text-ink-mute dark:text-dark-mute">
                  Main Headline / Masthead Creed
                </label>
                <input
                  type="text"
                  value={config.headline}
                  onChange={(e) => updateField('headline', e.target.value)}
                  placeholder="Sharp reporting. Deep analysis. No agenda but the truth."
                  className="w-full text-sm font-serif font-bold px-3.5 py-2.5 rounded-xl border border-rule/70 dark:border-white/10 bg-paper dark:bg-white/[0.04] text-ink dark:text-white focus:outline-none focus:border-accent"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono font-semibold uppercase tracking-wider text-ink-mute dark:text-dark-mute">
                  Mission Statement / Lead Paragraph
                </label>
                <textarea
                  rows={4}
                  value={config.missionStatement}
                  onChange={(e) => updateField('missionStatement', e.target.value)}
                  placeholder="Singh Monster is an independent broadsheet chronicle devoted to fearless investigative journalism..."
                  className="w-full text-xs font-serif leading-relaxed px-3.5 py-2.5 rounded-xl border border-rule/70 dark:border-white/10 bg-paper dark:bg-white/[0.04] text-ink dark:text-white focus:outline-none focus:border-accent"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-rule/60 dark:border-white/10">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono font-semibold uppercase tracking-wider text-ink-mute dark:text-dark-mute">
                    SEO Meta Title
                  </label>
                  <input
                    type="text"
                    value={config.metaTitle}
                    onChange={(e) => updateField('metaTitle', e.target.value)}
                    placeholder="About Us — Editorial Mission & Standards"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-rule/70 dark:border-white/10 bg-paper dark:bg-white/[0.04] text-ink dark:text-white focus:outline-none focus:border-accent"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono font-semibold uppercase tracking-wider text-ink-mute dark:text-dark-mute">
                    SEO Meta Description
                  </label>
                  <input
                    type="text"
                    value={config.metaDescription}
                    onChange={(e) => updateField('metaDescription', e.target.value)}
                    placeholder="The editorial philosophy and independent mission..."
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-rule/70 dark:border-white/10 bg-paper dark:bg-white/[0.04] text-ink dark:text-white focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="showDivider"
                  checked={config.showDivider}
                  onChange={(e) => updateField('showDivider', e.target.checked)}
                  className="w-4 h-4 rounded text-accent focus:ring-accent border-rule"
                />
                <label htmlFor="showDivider" className="text-xs font-medium text-ink dark:text-dark-ink cursor-pointer">
                  Display decorative broadsheet red rule divider below hero headline
                </label>
              </div>
            </div>
          )}

          {/* TAB 2: FOUNDER & EDITORIAL PROFILE */}
          {activeTab === 'founder' && (
            <div className="space-y-5 bg-paper dark:bg-white/[0.02] border border-rule/60 dark:border-white/10 rounded-2xl p-4 sm:p-6 shadow-xs animate-in fade-in duration-150">
              <div>
                <h3 className="font-serif font-bold text-base text-ink dark:text-dark-ink">
                  Founder &amp; Lead Correspondent Profile
                </h3>
                <p className="text-xs text-ink-mute dark:text-dark-mute mt-0.5 font-serif italic">
                  Author credentials, portrait photo, biographical dispatch, and official contact channels.
                </p>
              </div>

              {/* Photo & Identity Row */}
              <div className="flex flex-col sm:flex-row gap-5 items-start">
                <div className="relative w-28 h-28 rounded-2xl overflow-hidden border-2 border-rule dark:border-white/10 bg-paper-subtle dark:bg-black/40 shrink-0 shadow-xs">
                  <img
                    src={config.authorPhotoUrl || '/authr.png'}
                    alt={config.authorName}
                    className="w-full h-full object-cover object-top"
                    onError={(e) => {
                      e.currentTarget.src = '/logo.png'
                    }}
                  />
                </div>

                <div className="flex-1 space-y-3 w-full">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono font-semibold uppercase tracking-wider text-ink-mute dark:text-dark-mute">
                      Author Photo URL
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={config.authorPhotoUrl}
                        onChange={(e) => updateField('authorPhotoUrl', e.target.value)}
                        placeholder="/authr.png or direct CDN link"
                        className="flex-1 text-xs font-mono px-3.5 py-2.5 rounded-xl border border-rule/70 dark:border-white/10 bg-paper dark:bg-white/[0.04] text-ink dark:text-white focus:outline-none focus:border-accent"
                      />
                      <Link
                        href="/admin/media"
                        target="_blank"
                        className="px-3 py-2.5 rounded-xl border border-rule/70 dark:border-white/10 text-xs font-semibold hover:border-accent text-ink-mute hover:text-ink transition shrink-0"
                        title="Pick or upload in Media Vault"
                      >
                        Media Vault ↗
                      </Link>
                    </div>
                    <p className="text-[11px] text-ink-mute dark:text-dark-mute">
                      Defaults to local <code className="font-mono text-accent">/authr.png</code> or any Cloudflare R2 image link.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono font-semibold uppercase tracking-wider text-ink-mute dark:text-dark-mute">
                      Image Accessibility Alt Text
                    </label>
                    <input
                      type="text"
                      value={config.authorPhotoAlt}
                      onChange={(e) => updateField('authorPhotoAlt', e.target.value)}
                      placeholder="Dhananjay Singh — Founder & Editor-in-Chief"
                      className="w-full text-xs px-3.5 py-2 rounded-xl border border-rule/70 dark:border-white/10 bg-paper dark:bg-white/[0.04] text-ink dark:text-white focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>
              </div>

              {/* Name & Credentials */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-rule/60 dark:border-white/10">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono font-semibold uppercase tracking-wider text-ink-mute dark:text-dark-mute">
                    Founder / Editor Name
                  </label>
                  <input
                    type="text"
                    value={config.authorName}
                    onChange={(e) => updateField('authorName', e.target.value)}
                    placeholder="Dhananjay Singh"
                    className="w-full text-sm font-serif font-bold px-3.5 py-2.5 rounded-xl border border-rule/70 dark:border-white/10 bg-paper dark:bg-white/[0.04] text-ink dark:text-white focus:outline-none focus:border-accent"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono font-semibold uppercase tracking-wider text-ink-mute dark:text-dark-mute">
                    Editorial Role &amp; Titles
                  </label>
                  <input
                    type="text"
                    value={config.authorRole}
                    onChange={(e) => updateField('authorRole', e.target.value)}
                    placeholder="Founder • Editor-in-Chief • Lead Correspondent"
                    className="w-full text-xs font-mono font-semibold px-3.5 py-2.5 rounded-xl border border-rule/70 dark:border-white/10 bg-paper dark:bg-white/[0.04] text-ink dark:text-white focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              {/* Biography Paragraph */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono font-semibold uppercase tracking-wider text-ink-mute dark:text-dark-mute">
                  Biographical Dispatch &amp; Editorial Creed
                </label>
                <textarea
                  rows={5}
                  value={config.authorBio}
                  onChange={(e) => updateField('authorBio', e.target.value)}
                  placeholder="Dhananjay Singh directs all investigative research, reporting dispatches, and editorial curation..."
                  className="w-full text-xs font-serif leading-relaxed px-3.5 py-2.5 rounded-xl border border-rule/70 dark:border-white/10 bg-paper dark:bg-white/[0.04] text-ink dark:text-white focus:outline-none focus:border-accent"
                />
              </div>

              {/* Location & Inquiries */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono font-semibold uppercase tracking-wider text-ink-mute dark:text-dark-mute">
                    Location Dateline
                  </label>
                  <input
                    type="text"
                    value={config.locationText}
                    onChange={(e) => updateField('locationText', e.target.value)}
                    placeholder="India & Global Dispatches"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-rule/70 dark:border-white/10 bg-paper dark:bg-white/[0.04] text-ink dark:text-white focus:outline-none focus:border-accent"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono font-semibold uppercase tracking-wider text-ink-mute dark:text-dark-mute">
                    Public Inquiries Email
                  </label>
                  <input
                    type="email"
                    value={config.inquiriesEmail}
                    onChange={(e) => updateField('inquiriesEmail', e.target.value)}
                    placeholder="editorial@singhmonster.com"
                    className="w-full text-xs font-mono px-3.5 py-2.5 rounded-xl border border-rule/70 dark:border-white/10 bg-paper dark:bg-white/[0.04] text-ink dark:text-white focus:outline-none focus:border-accent"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: EDITORIAL TENETS & CREED */}
          {activeTab === 'tenets' && (
            <div className="space-y-5 bg-paper dark:bg-white/[0.02] border border-rule/60 dark:border-white/10 rounded-2xl p-4 sm:p-6 shadow-xs animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-rule/60 dark:border-white/10">
                <div>
                  <h3 className="font-serif font-bold text-base text-ink dark:text-dark-ink">
                    Editorial Tenets &amp; Investigative Pillars
                  </h3>
                  <p className="text-xs text-ink-mute dark:text-dark-mute mt-0.5 font-serif italic">
                    The core journalistic covenants that define reporting integrity.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddTenet}
                  className="px-3.5 py-1.5 bg-accent hover:bg-accent/90 text-white rounded-full text-xs font-bold uppercase tracking-wider transition flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer active:scale-95"
                >
                  <IconPlus className="w-3.5 h-3.5" />
                  <span>Add Tenet</span>
                </button>
              </div>

              {/* Tenet Cards List */}
              <div className="space-y-4">
                {(config.tenets || []).map((tenet, idx) => (
                  <div
                    key={tenet.id || idx}
                    className="p-4 sm:p-5 rounded-2xl bg-paper-subtle/50 dark:bg-white/[0.03] border border-rule/70 dark:border-white/10 space-y-3 transition hover:border-accent/50"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 flex-1">
                        <span className="w-6 h-6 rounded-full bg-accent/10 text-accent font-mono text-xs font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          value={tenet.label}
                          onChange={(e) => handleUpdateTenet(idx, 'label', e.target.value)}
                          placeholder="Tenet 01"
                          className="w-28 text-xs font-mono font-bold text-accent px-2.5 py-1 rounded-lg border border-rule/70 dark:border-white/10 bg-paper dark:bg-white/[0.05] uppercase"
                        />
                        <input
                          type="text"
                          value={tenet.title}
                          onChange={(e) => handleUpdateTenet(idx, 'title', e.target.value)}
                          placeholder="Pillar Headline (e.g. Fearless Independence)"
                          className="flex-1 text-sm font-serif font-bold px-3 py-1 rounded-lg border border-rule/70 dark:border-white/10 bg-paper dark:bg-white/[0.05] text-ink dark:text-white"
                        />
                      </div>

                      {/* Reorder and Delete Controls */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleMoveTenet(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1.5 rounded-lg border border-rule/60 dark:border-white/10 text-ink-mute hover:text-ink disabled:opacity-30 disabled:cursor-not-allowed transition"
                          title="Move Up"
                        >
                          <IconArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveTenet(idx, 'down')}
                          disabled={idx === (config.tenets || []).length - 1}
                          className="p-1.5 rounded-lg border border-rule/60 dark:border-white/10 text-ink-mute hover:text-ink disabled:opacity-30 disabled:cursor-not-allowed transition"
                          title="Move Down"
                        >
                          <IconArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteTenet(idx)}
                          className="p-1.5 rounded-lg border border-rule/60 dark:border-white/10 hover:border-red-400 text-ink-mute hover:text-red-600 dark:hover:text-red-400 transition"
                          title="Delete Tenet"
                        >
                          <IconTrash className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <textarea
                      rows={3}
                      value={tenet.description}
                      onChange={(e) => handleUpdateTenet(idx, 'description', e.target.value)}
                      placeholder="Detailed explanation of the standard..."
                      className="w-full text-xs font-serif leading-relaxed px-3.5 py-2.5 rounded-xl border border-rule/70 dark:border-white/10 bg-paper dark:bg-white/[0.04] text-ink dark:text-white focus:outline-none focus:border-accent"
                    />
                  </div>
                ))}

                {(config.tenets || []).length === 0 && (
                  <div className="py-12 text-center border-2 border-dashed border-rule dark:border-white/10 rounded-2xl">
                    <p className="text-xs text-ink-mute dark:text-dark-mute font-serif italic mb-3">
                      No tenets defined. Click below to add your first editorial tenet.
                    </p>
                    <button
                      type="button"
                      onClick={handleAddTenet}
                      className="px-4 py-2 bg-accent text-white text-xs font-bold uppercase rounded-full shadow-xs"
                    >
                      Add First Tenet
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: COLOPHON & CRAFT */}
          {activeTab === 'colophon' && (
            <div className="space-y-5 bg-paper dark:bg-white/[0.02] border border-rule/60 dark:border-white/10 rounded-2xl p-4 sm:p-6 shadow-xs animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-rule/60 dark:border-white/10">
                <div>
                  <h3 className="font-serif font-bold text-base text-ink dark:text-dark-ink">
                    Colophon, Typography &amp; Digital Infrastructure
                  </h3>
                  <p className="text-xs text-ink-mute dark:text-dark-mute mt-0.5 font-serif italic">
                    Specifications detailing font pairings, architectural stack, and cryptographic archives.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddColophon}
                  className="px-3.5 py-1.5 bg-accent hover:bg-accent/90 text-white rounded-full text-xs font-bold uppercase tracking-wider transition flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer active:scale-95"
                >
                  <IconPlus className="w-3.5 h-3.5" />
                  <span>Add Standard</span>
                </button>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono font-semibold uppercase tracking-wider text-ink-mute dark:text-dark-mute">
                  Section Header
                </label>
                <input
                  type="text"
                  value={config.colophonHeading || 'Colophon & Digital Craft'}
                  onChange={(e) => updateField('colophonHeading', e.target.value)}
                  placeholder="Colophon & Digital Craft"
                  className="w-full text-xs px-3.5 py-2 rounded-xl border border-rule/70 dark:border-white/10 bg-paper dark:bg-white/[0.04] text-ink dark:text-white"
                />
              </div>

              {/* Colophon Cards List */}
              <div className="space-y-3 pt-2">
                {(config.colophonItems || []).map((col, idx) => (
                  <div
                    key={col.id || idx}
                    className="p-4 rounded-xl bg-paper-subtle/50 dark:bg-white/[0.03] border border-rule/70 dark:border-white/10 space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <input
                        type="text"
                        value={col.title}
                        onChange={(e) => handleUpdateColophon(idx, 'title', e.target.value)}
                        placeholder="Specification Title (e.g. Typography)"
                        className="w-48 text-xs font-mono font-bold uppercase tracking-wider text-accent px-3 py-1.5 rounded-lg border border-rule/70 dark:border-white/10 bg-paper dark:bg-white/[0.05]"
                      />
                      <button
                        type="button"
                        onClick={() => handleDeleteColophon(idx)}
                        className="p-1.5 rounded-lg border border-rule/60 dark:border-white/10 hover:border-red-400 text-ink-mute hover:text-red-600 dark:hover:text-red-400 transition"
                        title="Delete standard"
                      >
                        <IconTrash className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <textarea
                      rows={2}
                      value={col.description}
                      onChange={(e) => handleUpdateColophon(idx, 'description', e.target.value)}
                      placeholder="Specification details..."
                      className="w-full text-xs font-serif leading-relaxed px-3 py-2 rounded-lg border border-rule/70 dark:border-white/10 bg-paper dark:bg-white/[0.04] text-ink dark:text-white"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: LEGAL & ETHICS BANNER */}
          {activeTab === 'legal' && (
            <div className="space-y-5 bg-paper dark:bg-white/[0.02] border border-rule/60 dark:border-white/10 rounded-2xl p-4 sm:p-6 shadow-xs animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-rule/60 dark:border-white/10">
                <div>
                  <h3 className="font-serif font-bold text-base text-ink dark:text-dark-ink">
                    Newsroom Ethics &amp; Statutory Disclosures
                  </h3>
                  <p className="text-xs text-ink-mute dark:text-dark-mute mt-0.5 font-serif italic">
                    Section 79 IT Act, Article 19(1)(a) fair dealing prompt at page conclusion.
                  </p>
                </div>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <span className="text-xs font-mono text-ink-mute">Active</span>
                  <input
                    type="checkbox"
                    checked={config.showLegalBanner}
                    onChange={(e) => updateField('showLegalBanner', e.target.checked)}
                    className="w-4 h-4 rounded text-accent focus:ring-accent border-rule"
                  />
                </label>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono font-semibold uppercase tracking-wider text-ink-mute dark:text-dark-mute">
                  Banner Title
                </label>
                <input
                  type="text"
                  value={config.legalHeading}
                  onChange={(e) => updateField('legalHeading', e.target.value)}
                  placeholder="Legal Disclaimers & Fair Dealing"
                  className="w-full text-sm font-serif font-bold px-3.5 py-2.5 rounded-xl border border-rule/70 dark:border-white/10 bg-paper dark:bg-white/[0.04] text-ink dark:text-white focus:outline-none focus:border-accent"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono font-semibold uppercase tracking-wider text-ink-mute dark:text-dark-mute">
                  Banner Description
                </label>
                <textarea
                  rows={3}
                  value={config.legalDescription}
                  onChange={(e) => updateField('legalDescription', e.target.value)}
                  placeholder="Read our full statutory disclosures under Section 79 IT Act..."
                  className="w-full text-xs font-serif leading-relaxed px-3.5 py-2.5 rounded-xl border border-rule/70 dark:border-white/10 bg-paper dark:bg-white/[0.04] text-ink dark:text-white focus:outline-none focus:border-accent"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono font-semibold uppercase tracking-wider text-ink-mute dark:text-dark-mute">
                    Button Label
                  </label>
                  <input
                    type="text"
                    value={config.legalButtonText}
                    onChange={(e) => updateField('legalButtonText', e.target.value)}
                    placeholder="Review Disclaimers →"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-rule/70 dark:border-white/10 bg-paper dark:bg-white/[0.04] text-ink dark:text-white focus:outline-none focus:border-accent"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono font-semibold uppercase tracking-wider text-ink-mute dark:text-dark-mute">
                    Button Destination URL
                  </label>
                  <input
                    type="text"
                    value={config.legalButtonUrl}
                    onChange={(e) => updateField('legalButtonUrl', e.target.value)}
                    placeholder="/privacy"
                    className="w-full text-xs font-mono px-3.5 py-2.5 rounded-xl border border-rule/70 dark:border-white/10 bg-paper dark:bg-white/[0.04] text-ink dark:text-white focus:outline-none focus:border-accent"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: MOBILE VIEW VARIANTS */}
          {activeTab === 'mobile' && (
            <div className="space-y-5 bg-paper dark:bg-white/[0.02] border border-rule/60 dark:border-white/10 rounded-2xl p-4 sm:p-6 shadow-xs animate-in fade-in duration-150">
              <div>
                <h3 className="font-serif font-bold text-base text-ink dark:text-dark-ink">
                  Mobile View Variant Options
                </h3>
                <p className="text-xs text-ink-mute dark:text-dark-mute mt-0.5 font-serif italic">
                  Tune layout, photo alignment, and vertical ergonomics specifically for smartphone screens.
                </p>
              </div>

              {/* Mobile Photo Alignment Variant */}
              <div className="p-4 rounded-xl bg-paper-subtle/60 dark:bg-white/[0.03] border border-rule/70 dark:border-white/10 space-y-3">
                <div>
                  <h4 className="text-xs font-bold text-ink dark:text-dark-ink">
                    Founder Photo Alignment on Mobile
                  </h4>
                  <p className="text-[11px] text-ink-mute dark:text-dark-mute">
                    Choose how the founder portrait appears on narrow smartphone screens.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    {
                      id: 'top',
                      title: 'Stacked Top',
                      desc: 'Above bio, aligned left',
                    },
                    {
                      id: 'center',
                      title: 'Centered',
                      desc: 'Centered portrait & bio',
                    },
                    {
                      id: 'left',
                      title: 'Inline Left',
                      desc: 'Side-by-side compact',
                    },
                  ].map((opt) => {
                    const selected = config.mobileVariant?.photoPosition === opt.id
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() =>
                          updateMobileVariant('photoPosition', opt.id as 'top' | 'center' | 'left')
                        }
                        className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                          selected
                            ? 'border-accent bg-accent/10 dark:bg-accent/15 text-accent shadow-xs'
                            : 'border-rule/70 dark:border-white/10 bg-paper dark:bg-white/[0.02] text-ink dark:text-dark-ink hover:border-ink/40'
                        }`}
                      >
                        <span className="text-xs font-bold block">{opt.title}</span>
                        <span className="text-[10px] text-ink-mute dark:text-dark-mute mt-1">
                          {opt.desc}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Compact Tenets Switch */}
              <div className="p-4 rounded-xl bg-paper-subtle/60 dark:bg-white/[0.03] border border-rule/70 dark:border-white/10 flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold text-ink dark:text-dark-ink">
                    Compact Tenets Cards on Mobile
                  </h4>
                  <p className="text-[11px] text-ink-mute dark:text-dark-mute">
                    Render editorial pillars as single-column compact cards to reduce vertical thumb scrolling on phones.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={config.mobileVariant?.compactTenets}
                  onChange={(e) => updateMobileVariant('compactTenets', e.target.checked)}
                  className="w-5 h-5 rounded text-accent focus:ring-accent border-rule cursor-pointer"
                />
              </div>

              {/* Show Colophon on Mobile Switch */}
              <div className="p-4 rounded-xl bg-paper-subtle/60 dark:bg-white/[0.03] border border-rule/70 dark:border-white/10 flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold text-ink dark:text-dark-ink">
                    Show Colophon on Mobile
                  </h4>
                  <p className="text-[11px] text-ink-mute dark:text-dark-mute">
                    Keep typography &amp; infrastructure specifications visible on mobile viewports.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={config.mobileVariant?.showColophon !== false}
                  onChange={(e) => updateMobileVariant('showColophon', e.target.checked)}
                  className="w-5 h-5 rounded text-accent focus:ring-accent border-rule cursor-pointer"
                />
              </div>

              {/* Dense Spacing Switch */}
              <div className="p-4 rounded-xl bg-paper-subtle/60 dark:bg-white/[0.03] border border-rule/70 dark:border-white/10 flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold text-ink dark:text-dark-ink">
                    Dense Padding on Mobile
                  </h4>
                  <p className="text-[11px] text-ink-mute dark:text-dark-mute">
                    Use tighter vertical margins (py-6 instead of py-10) for high-density smartphone screens.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={config.mobileVariant?.denseSpacing}
                  onChange={(e) => updateMobileVariant('denseSpacing', e.target.checked)}
                  className="w-5 h-5 rounded text-accent focus:ring-accent border-rule cursor-pointer"
                />
              </div>

              <div className="p-3 bg-accent/5 border border-accent/20 rounded-xl">
                <p className="text-xs text-accent dark:text-dark-accent font-serif italic">
                  💡 Tip: Click &ldquo;Mobile Preview&rdquo; in the top bar anytime to preview these variants on a simulated iPhone 14 frame before saving!
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. STICKY MOBILE SAVE BAR (Visible on mobile when edits are made) */}
      {isDirty && (
        <div className="md:hidden fixed bottom-16 inset-x-3 z-30 bg-paper dark:bg-[#121215] border border-accent/40 rounded-2xl p-3 shadow-2xl flex items-center justify-between gap-3 animate-in slide-in-from-bottom duration-200">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-ink dark:text-dark-ink truncate">
              Unsaved Changes
            </p>
            <p className="text-[10px] font-mono text-ink-mute dark:text-dark-mute truncate">
              Tap to push live to About Us
            </p>
          </div>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-accent text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md active:scale-95 transition flex items-center gap-1.5 shrink-0"
          >
            {saving ? (
              <span>Saving…</span>
            ) : (
              <>
                <IconCheck className="w-3.5 h-3.5" />
                <span>Save</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* FLOATING TOAST MESSAGES */}
      <AdminToast toasts={toasts} onDismiss={removeToast} />
    </div>
  )
}
