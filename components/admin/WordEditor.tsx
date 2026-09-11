'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import {
  IconMedia,
  IconVideo,
  IconLink,
  IconClose,
  IconEye,
  IconAlignLeft,
  IconAlignCenter,
  IconAlignRight,
  IconAlignJustify,
  IconListBullet,
  IconListNumber,
  IconHighlighter,
  IconUndo,
  IconRedo,
  IconIndent,
  IconOutdent,
  IconQuote,
  IconCode,
  IconTable,
  IconClear,
  IconMaximize,
  IconMinimize,
  IconSubscript,
  IconSuperscript,
} from '@/components/admin/AdminIcons'

interface WordEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  insertHtmlRef?: React.MutableRefObject<((html: string) => void) | null>
}

const TEXT_COLORS = [
  { label: 'Default', value: 'inherit', color: '#1a1a1a' },
  { label: 'Crimson', value: '#dc2626', color: '#dc2626' },
  { label: 'Amber', value: '#d97706', color: '#d97706' },
  { label: 'Forest', value: '#059669', color: '#059669' },
  { label: 'Sapphire', value: '#2563eb', color: '#2563eb' },
  { label: 'Violet', value: '#7c3aed', color: '#7c3aed' },
  { label: 'Charcoal', value: '#4b5563', color: '#4b5563' },
]

const HIGHLIGHT_COLORS = [
  { label: 'None', value: 'transparent', color: '#ffffff' },
  { label: 'Canary', value: '#fef08a', color: '#fef08a' },
  { label: 'Mint', value: '#bbf7d0', color: '#bbf7d0' },
  { label: 'Peach', value: '#fed7aa', color: '#fed7aa' },
  { label: 'Sky', value: '#bae6fd', color: '#bae6fd' },
  { label: 'Lavender', value: '#e9d5ff', color: '#e9d5ff' },
]

export default function WordEditor({
  value,
  onChange,
  placeholder,
  insertHtmlRef,
}: WordEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const savedRangeRef = useRef<Range | null>(null)

  const [isCodeView, setIsCodeView] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [htmlContent, setHtmlContent] = useState(value || '')
  const [currentFont, setCurrentFont] = useState('serif')
  const [currentBlock, setCurrentBlock] = useState('p')

  const [activeFormats, setActiveFormats] = useState<{
    bold?: boolean
    italic?: boolean
    underline?: boolean
    strike?: boolean
    subscript?: boolean
    superscript?: boolean
    justifyLeft?: boolean
    justifyCenter?: boolean
    justifyRight?: boolean
    justifyFull?: boolean
    unorderedList?: boolean
    orderedList?: boolean
  }>({})

  // Dropdown / Popover toggles
  const [showColorMenu, setShowColorMenu] = useState(false)
  const [showHighlightMenu, setShowHighlightMenu] = useState(false)

  // Modal dialog states
  const [showImageModal, setShowImageModal] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [imageCaption, setImageCaption] = useState('')
  const [imageAlign, setImageAlign] = useState<'center' | 'full' | 'left' | 'right'>('center')

  const [showVideoModal, setShowVideoModal] = useState(false)
  const [videoUrl, setVideoUrl] = useState('')
  const [videoCaption, setVideoCaption] = useState('')

  const [showLinkModal, setShowLinkModal] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [linkText, setLinkText] = useState('')

  // Floating media toolbar state
  const [activeFigure, setActiveFigure] = useState<HTMLElement | null>(null)
  const [figurePosition, setFigurePosition] = useState<{ top: number; left: number } | null>(null)

  // Selection range preservation helpers
  const saveSelection = useCallback(() => {
    if (typeof window === 'undefined') return
    const sel = window.getSelection()
    if (sel && sel.rangeCount > 0 && editorRef.current) {
      const range = sel.getRangeAt(0)
      if (editorRef.current.contains(range.commonAncestorContainer)) {
        savedRangeRef.current = range.cloneRange()
      }
    }
  }, [])

  const restoreSelection = useCallback(() => {
    if (typeof window === 'undefined' || !savedRangeRef.current) return false
    const sel = window.getSelection()
    if (sel) {
      sel.removeAllRanges()
      sel.addRange(savedRangeRef.current)
      return true
    }
    return false
  }, [])

  const lastHtmlRef = useRef(value || '')
  const isFirstRender = useRef(true)

  // Synchronize internal state with external value prop
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      if (editorRef.current && value) {
        editorRef.current.innerHTML = value
        lastHtmlRef.current = value
      }
      return
    }
    if (editorRef.current && !isCodeView) {
      if (value !== lastHtmlRef.current) {
        editorRef.current.innerHTML = value || ''
        lastHtmlRef.current = value || ''
      }
    }
    setHtmlContent(value || '')
  }, [value, isCodeView])

  // Keybindings (Esc to exit fullscreen)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isFullscreen) setIsFullscreen(false)
        setActiveFigure(null)
      }
    }
    window.addEventListener('keydown', handleGlobalKeyDown)
    return () => window.removeEventListener('keydown', handleGlobalKeyDown)
  }, [isFullscreen])

  // Click outside to dismiss floating popovers & figure toolbar
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('.word-editor-popover')) {
        setShowColorMenu(false)
        setShowHighlightMenu(false)
      }
      if (activeFigure && !target.closest('.figure-floating-toolbar') && !target.closest('figure')) {
        setActiveFigure(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [activeFigure])

  // Update active formats & detect active block (h1, h2, h3, h4, blockquote, pre, p)
  const updateActiveFormats = useCallback(() => {
    if (typeof document === 'undefined') return
    try {
      saveSelection()
      setActiveFormats({
        bold: document.queryCommandState('bold'),
        italic: document.queryCommandState('italic'),
        underline: document.queryCommandState('underline'),
        strike: document.queryCommandState('strikeThrough'),
        subscript: document.queryCommandState('subscript'),
        superscript: document.queryCommandState('superscript'),
        justifyLeft: document.queryCommandState('justifyLeft'),
        justifyCenter: document.queryCommandState('justifyCenter'),
        justifyRight: document.queryCommandState('justifyRight'),
        justifyFull: document.queryCommandState('justifyFull'),
        unorderedList: document.queryCommandState('insertUnorderedList'),
        orderedList: document.queryCommandState('insertOrderedList'),
      })

      // Detect current block type
      const sel = window.getSelection()
      if (sel && sel.rangeCount > 0 && editorRef.current) {
        let node: Node | null = sel.getRangeAt(0).commonAncestorContainer
        if (node.nodeType === Node.TEXT_NODE) {
          node = node.parentNode
        }
        let detected = 'p'
        while (node && node !== editorRef.current) {
          const tag = (node as HTMLElement).tagName?.toLowerCase()
          if (['h1', 'h2', 'h3', 'h4', 'blockquote', 'pre'].includes(tag)) {
            detected = tag
            break
          }
          node = node.parentNode
        }
        setCurrentBlock(detected)
      }
    } catch {
      // ignore
    }
  }, [saveSelection])

  const handleEditorInput = useCallback(() => {
    if (editorRef.current) {
      const newHtml = editorRef.current.innerHTML
      lastHtmlRef.current = newHtml
      setHtmlContent(newHtml)
      onChange(newHtml)
      updateActiveFormats()
    }
  }, [onChange, updateActiveFormats])

  const executeCmd = (command: string, valueArg: string | undefined = undefined) => {
    if (isCodeView) return
    editorRef.current?.focus()
    document.execCommand(command, false, valueArg)
    handleEditorInput()
    updateActiveFormats()
  }

  // Insert custom HTML block at cursor position with range restoration
  const insertHtmlAtCursor = useCallback(
    (html: string) => {
      if (isCodeView) {
        const newContent = htmlContent + '\n' + html
        setHtmlContent(newContent)
        onChange(newContent)
        return
      }

      editorRef.current?.focus()
      restoreSelection()

      const sel = window.getSelection()
      if (sel && sel.rangeCount > 0 && editorRef.current?.contains(sel.getRangeAt(0).commonAncestorContainer)) {
        const range = sel.getRangeAt(0)
        range.deleteContents()
        const el = document.createElement('div')
        el.innerHTML = html
        const frag = document.createDocumentFragment()
        let node: ChildNode | null
        let lastNode: ChildNode | null = null
        while ((node = el.firstChild)) {
          lastNode = frag.appendChild(node)
        }
        range.insertNode(frag)
        if (lastNode) {
          range.setStartAfter(lastNode)
          range.collapse(true)
          sel.removeAllRanges()
          sel.addRange(range)
        }
      } else {
        if (editorRef.current) {
          editorRef.current.innerHTML += html
        }
      }
      savedRangeRef.current = null
      handleEditorInput()
    },
    [isCodeView, htmlContent, onChange, restoreSelection, handleEditorInput]
  )

  // Expose imperative insert to parent (e.g. ArticleEditorForm right-rail media cropper)
  useEffect(() => {
    if (insertHtmlRef) {
      insertHtmlRef.current = insertHtmlAtCursor
    }
    return () => {
      if (insertHtmlRef) {
        insertHtmlRef.current = null
      }
    }
  }, [insertHtmlRef, insertHtmlAtCursor])

  // Open Link Modal with prefilled selected text
  const openLinkModal = () => {
    saveSelection()
    const sel = window.getSelection()
    let selectedText = ''
    if (sel && sel.rangeCount > 0 && editorRef.current?.contains(sel.getRangeAt(0).commonAncestorContainer)) {
      selectedText = sel.toString().trim()
    }
    setLinkText(selectedText)
    setLinkUrl('')
    setShowLinkModal(true)
  }

  // Open Image Modal
  const openImageModal = () => {
    saveSelection()
    setImageUrl('')
    setImageCaption('')
    setImageAlign('center')
    setShowImageModal(true)
  }

  // Open Video Modal
  const openVideoModal = () => {
    saveSelection()
    setVideoUrl('')
    setVideoCaption('')
    setShowVideoModal(true)
  }

  // Handle Image Insertion
  const handleInsertImage = () => {
    const trimmedUrl = imageUrl.trim()
    if (!trimmedUrl) return

    let figureClass = 'my-6 flex flex-col items-center cursor-pointer transition-all'
    let imgClass = 'rounded-xl border border-rule dark:border-white/10 shadow-sm max-h-[550px] object-cover'
    if (imageAlign === 'full') {
      imgClass += ' w-full'
    } else if (imageAlign === 'left') {
      figureClass = 'my-4 float-left mr-6 max-w-[48%] cursor-pointer transition-all'
      imgClass += ' w-full'
    } else if (imageAlign === 'right') {
      figureClass = 'my-4 float-right ml-6 max-w-[48%] cursor-pointer transition-all'
      imgClass += ' w-full'
    } else {
      imgClass += ' w-auto max-w-full'
    }

    const captionHtml = imageCaption.trim()
      ? `<figcaption class="text-xs font-sans text-ink-mute dark:text-dark-mute mt-2 italic text-center">${imageCaption.trim()}</figcaption>`
      : ''

    const imageHtml = `<figure class="${figureClass}" contenteditable="false"><img src="${trimmedUrl}" alt="${imageCaption || 'Article Illustration'}" class="${imgClass}" />${captionHtml}</figure><p><br></p>`

    insertHtmlAtCursor(imageHtml)
    setImageUrl('')
    setImageCaption('')
    setShowImageModal(false)
  }

  // Handle Video Insertion
  const handleInsertVideo = () => {
    const raw = videoUrl.trim()
    if (!raw) return

    let embedSrc = raw
    const ytMatch = raw.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/)
    if (ytMatch && ytMatch[1]) {
      embedSrc = `https://www.youtube-nocookie.com/embed/${ytMatch[1]}`
    } else if (raw.includes('vimeo.com/')) {
      const vimeoMatch = raw.match(/vimeo\.com\/(\d+)/)
      if (vimeoMatch && vimeoMatch[1]) {
        embedSrc = `https://player.vimeo.com/video/${vimeoMatch[1]}`
      }
    }

    const captionHtml = videoCaption.trim()
      ? `<figcaption class="text-xs font-sans text-ink-mute dark:text-dark-mute mt-2 italic text-center">${videoCaption.trim()}</figcaption>`
      : ''

    const videoHtml = `<figure class="my-6 w-full" contenteditable="false"><div class="relative w-full aspect-video rounded-xl overflow-hidden border border-rule dark:border-white/10 shadow-md bg-black"><iframe src="${embedSrc}" title="Embedded Video" class="absolute inset-0 w-full h-full border-0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>${captionHtml}</figure><p><br></p>`

    insertHtmlAtCursor(videoHtml)
    setVideoUrl('')
    setVideoCaption('')
    setShowVideoModal(false)
  }

  // Handle Hyperlink Insertion
  const handleInsertLink = () => {
    const raw = linkUrl.trim()
    if (!raw) return
    const href = raw.startsWith('http://') || raw.startsWith('https://') || raw.startsWith('/') ? raw : `https://${raw}`
    const label = linkText.trim() || href
    insertHtmlAtCursor(`<a href="${href}" target="_blank" rel="noopener noreferrer" class="text-accent hover:underline font-medium">${label}</a>`)
    setLinkUrl('')
    setLinkText('')
    setShowLinkModal(false)
  }

  // Block format (H1, H2, H3, H4, P, Blockquote, Pre)
  const handleFormatBlock = (tag: string) => {
    setCurrentBlock(tag)
    const blockVal = tag === 'p' ? '<p>' : `<${tag.toUpperCase()}>`
    executeCmd('formatBlock', blockVal)
  }

  // Font family format
  const handleFontChange = (font: string) => {
    setCurrentFont(font)
    if (font === 'serif') {
      executeCmd('fontName', 'Source Serif 4, Georgia, serif')
    } else if (font === 'sans') {
      executeCmd('fontName', 'Inter, system-ui, sans-serif')
    } else if (font === 'mono') {
      executeCmd('fontName', 'JetBrains Mono, Menlo, monospace')
    }
  }

  // Clear Formatting (clears inline styles and resets block to paragraph)
  const handleClearFormat = () => {
    executeCmd('removeFormat')
    handleFormatBlock('p')
  }

  // Broadsheet Components
  const insertPullQuote = () => {
    insertHtmlAtCursor(
      `<blockquote class="border-l-4 border-accent pl-4 my-6 italic font-serif text-lg sm:text-xl text-ink dark:text-dark-ink bg-paper-subtle/50 dark:bg-white/[0.02] py-2 rounded-r-xl"><p>“Quote text goes here.”</p><cite class="block text-xs font-sans not-italic text-ink-mute dark:text-dark-mute mt-2">— Attribution, Title</cite></blockquote><p><br></p>`
    )
  }

  const insertCalloutBox = () => {
    insertHtmlAtCursor(
      `<div class="my-6 p-4 rounded-2xl border border-accent/40 bg-accent/5 dark:bg-accent/10"><h5 class="text-xs font-bold uppercase tracking-wider text-accent mb-1 font-sans">Editorial Bulletin</h5><p class="text-sm font-sans leading-relaxed text-ink dark:text-dark-ink">Special reporting dispatch or background context on developing events.</p></div><p><br></p>`
    )
  }

  const insertDataTable = () => {
    insertHtmlAtCursor(
      `<div class="my-6 overflow-x-auto"><table class="w-full text-xs font-sans border-collapse border border-rule dark:border-white/10 rounded-xl overflow-hidden"><thead><tr class="bg-paper-subtle dark:bg-white/5 border-b border-rule dark:border-white/10 text-left"><th class="p-2.5 font-bold">Category</th><th class="p-2.5 font-bold">Current Metric</th><th class="p-2.5 font-bold">Prior Metric</th></tr></thead><tbody><tr class="border-b border-rule/50 dark:border-white/5"><td class="p-2.5 font-medium">Indicator A</td><td class="p-2.5 font-mono">1,420</td><td class="p-2.5 font-mono">1,210</td></tr><tr class="border-b border-rule/50 dark:border-white/5"><td class="p-2.5 font-medium">Indicator B</td><td class="p-2.5 font-mono">+8.4%</td><td class="p-2.5 font-mono">+2.1%</td></tr></tbody></table></div><p><br></p>`
    )
  }

  const insertHorizontalDivider = () => {
    insertHtmlAtCursor('<hr class="my-8 border-t border-rule/80 dark:border-white/15" /><p><br></p>')
  }

  // Keyboard navigation inside contentEditable (Tab, Ctrl+K)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      if (e.shiftKey) {
        executeCmd('outdent')
      } else {
        if (activeFormats.unorderedList || activeFormats.orderedList) {
          executeCmd('indent')
        } else {
          executeCmd('insertHTML', '&emsp;')
        }
      }
      return
    }

    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault()
      openLinkModal()
      return
    }
  }

  // Paste handling: clean Word/Docs garbage while preserving formatting
  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const html = e.clipboardData.getData('text/html')
    if (html) {
      e.preventDefault()
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = html

      // Remove dangerous or unwanted elements
      const badElements = tempDiv.querySelectorAll('script, style, meta, link, noscript')
      badElements.forEach((el) => el.remove())

      // Clean unwanted classes and office inline styles
      const styledElements = tempDiv.querySelectorAll('*')
      styledElements.forEach((el) => {
        el.removeAttribute('class')
        const style = el.getAttribute('style') || ''
        // Only keep fundamental text alignment or weight if present
        let cleanStyle = ''
        if (style.includes('text-align: center')) cleanStyle += 'text-align: center;'
        else if (style.includes('text-align: right')) cleanStyle += 'text-align: right;'
        if (style.includes('font-weight: bold') || style.includes('font-weight: 700')) cleanStyle += 'font-weight: bold;'
        if (cleanStyle) {
          el.setAttribute('style', cleanStyle)
        } else {
          el.removeAttribute('style')
        }
      })

      const cleaned = tempDiv.innerHTML.trim()
      if (cleaned) {
        insertHtmlAtCursor(cleaned)
        return
      }
    }
  }

  // Floating media toolbar for clicked figure/image
  const handleEditorClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement
    const figure = target.closest('figure')
    if (figure && editorRef.current?.contains(figure)) {
      const rect = figure.getBoundingClientRect()
      const containerRect = containerRef.current?.getBoundingClientRect() || { top: 0, left: 0 }
      setActiveFigure(figure as HTMLElement)
      setFigurePosition({
        top: rect.top - containerRect.top - 42,
        left: Math.max(16, rect.left - containerRect.left + (rect.width / 2) - 130),
      })
    } else {
      setActiveFigure(null)
    }
  }

  // Re-align active figure
  const updateFigureAlign = (align: 'center' | 'full' | 'left' | 'right') => {
    if (!activeFigure) return
    const img = activeFigure.querySelector('img')
    if (align === 'full') {
      activeFigure.className = 'my-6 flex flex-col items-center cursor-pointer transition-all'
      if (img) img.className = 'rounded-xl border border-rule dark:border-white/10 shadow-sm max-h-[550px] object-cover w-full'
    } else if (align === 'left') {
      activeFigure.className = 'my-4 float-left mr-6 max-w-[48%] cursor-pointer transition-all'
      if (img) img.className = 'rounded-xl border border-rule dark:border-white/10 shadow-sm max-h-[550px] object-cover w-full'
    } else if (align === 'right') {
      activeFigure.className = 'my-4 float-right ml-6 max-w-[48%] cursor-pointer transition-all'
      if (img) img.className = 'rounded-xl border border-rule dark:border-white/10 shadow-sm max-h-[550px] object-cover w-full'
    } else {
      activeFigure.className = 'my-6 flex flex-col items-center cursor-pointer transition-all'
      if (img) img.className = 'rounded-xl border border-rule dark:border-white/10 shadow-sm max-h-[550px] object-cover w-auto max-w-full'
    }
    handleEditorInput()
  }

  // Remove active figure
  const removeActiveFigure = () => {
    if (!activeFigure) return
    activeFigure.remove()
    setActiveFigure(null)
    handleEditorInput()
  }

  // Document telemetry metrics
  const textOnly = htmlContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  const wordCount = textOnly ? textOnly.split(' ').length : 0
  const charCount = textOnly.length
  const paragraphCount = htmlContent ? (htmlContent.match(/<p>|<h[1-6]>|<blockquote>/g) || []).length : 0
  const readTimeMin = Math.max(1, Math.ceil(wordCount / 200))

  return (
    <div
      ref={containerRef}
      className={`word-editor border border-black/[0.06] dark:border-white/10 rounded-3xl bg-white/70 dark:bg-[#1c1c1e]/75 backdrop-blur-xl shadow-xs overflow-hidden transition-all ${
        isFullscreen
          ? 'fixed inset-0 z-50 rounded-none border-0 p-4 sm:p-6 bg-black/80 backdrop-blur-md flex flex-col justify-center items-center'
          : 'relative'
      }`}
    >
      {/* WRITING CONTAINER */}
      <div
        className={`w-full flex flex-col bg-transparent overflow-hidden ${
          isFullscreen
            ? 'max-w-6xl h-full rounded-3xl shadow-2xl border border-white/20 bg-white/90 dark:bg-[#1c1c1e]/90'
            : 'rounded-3xl'
        }`}
      >
        {/* COMPREHENSIVE WORD/DOCS RIBBON TOOLBAR (2 Lines on Mobile) */}
        <div className="bg-black/[0.02] dark:bg-white/[0.02] border-b border-black/[0.06] dark:border-white/10 p-1.5 sm:p-2 flex flex-col gap-1.5 text-xs select-none backdrop-blur-xs">
          {/* TOOLBAR ROW 1: History, Typography, Style & Emphasis */}
          <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar sm:flex-wrap">
            {/* Group 1: History (Undo / Redo) */}
          <div className="flex items-center gap-0.5 bg-black/[0.03] dark:bg-white/[0.04] p-0.5 rounded-full border border-black/[0.04] dark:border-white/5 shrink-0">
            <button
              type="button"
              onClick={() => executeCmd('undo')}
              className="h-7 w-7 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-ink dark:text-dark-ink transition cursor-pointer active:scale-95"
              title="Undo (Ctrl+Z)"
            >
              <IconUndo className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => executeCmd('redo')}
              className="h-7 w-7 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-ink dark:text-dark-ink transition cursor-pointer active:scale-95"
              title="Redo (Ctrl+Y)"
            >
              <IconRedo className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Group 2: Typography & Style */}
          <div className="flex items-center gap-1 bg-black/[0.03] dark:bg-white/[0.04] p-0.5 rounded-full border border-black/[0.04] dark:border-white/5 shrink-0">
            {/* Paragraph / Heading Style */}
            <select
              value={currentBlock}
              onChange={(e) => handleFormatBlock(e.target.value)}
              className="h-7 px-2.5 bg-white dark:bg-[#2c2c2e] border border-black/[0.06] dark:border-white/10 rounded-full text-xs font-semibold text-ink dark:text-dark-ink focus:outline-none focus:ring-1 focus:ring-[#0071e3] cursor-pointer"
              title="Paragraph Style & Heading"
            >
              <option value="p">Normal Text</option>
              <option value="h1">Heading 1 (Main Title)</option>
              <option value="h2">Heading 2 (Major Section)</option>
              <option value="h3">Heading 3 (Subsection)</option>
              <option value="h4">Heading 4 (Minor Header)</option>
              <option value="blockquote">Quote Block</option>
              <option value="pre">Code / Monospace</option>
            </select>

            {/* Font Family Selector */}
            <select
              value={currentFont}
              onChange={(e) => handleFontChange(e.target.value)}
              className="h-7 px-2 bg-white dark:bg-[#2c2c2e] border border-black/[0.06] dark:border-white/10 rounded-full text-xs font-medium text-ink dark:text-dark-ink focus:outline-none focus:ring-1 focus:ring-[#0071e3] cursor-pointer"
              title="Font Family"
            >
              <option value="serif">Broadsheet Serif</option>
              <option value="sans">Modern Sans</option>
              <option value="mono">Technical Mono</option>
            </select>

            {/* Font Size Selector */}
            <select
              onChange={(e) => executeCmd('fontSize', e.target.value)}
              defaultValue="3"
              className="h-7 px-2 bg-white dark:bg-[#2c2c2e] border border-black/[0.06] dark:border-white/10 rounded-full text-xs font-medium text-ink dark:text-dark-ink focus:outline-none focus:ring-1 focus:ring-[#0071e3] cursor-pointer"
              title="Font Size"
            >
              <option value="1">10px - Micro</option>
              <option value="2">13px - Small</option>
              <option value="3">16px - Body</option>
              <option value="4">18px - Lead</option>
              <option value="5">24px - Section</option>
              <option value="6">32px - Headline</option>
              <option value="7">40px - Display</option>
            </select>
          </div>

          {/* Group 3: Character Emphasis */}
          <div className="flex items-center gap-0.5 bg-black/[0.03] dark:bg-white/[0.04] p-0.5 rounded-full border border-black/[0.04] dark:border-white/5 shrink-0">
            <button
              type="button"
              onClick={() => executeCmd('bold')}
              className={`h-7 w-7 flex items-center justify-center font-bold text-xs rounded-full transition cursor-pointer active:scale-95 ${
                activeFormats.bold
                  ? 'bg-[#0071e3] text-white shadow-xs font-black'
                  : 'hover:bg-black/5 dark:hover:bg-white/10 text-ink dark:text-dark-ink'
              }`}
              title="Bold (Ctrl+B)"
            >
              B
            </button>

            <button
              type="button"
              onClick={() => executeCmd('italic')}
              className={`h-7 w-7 flex items-center justify-center font-serif italic text-xs rounded-full transition cursor-pointer active:scale-95 ${
                activeFormats.italic
                  ? 'bg-[#0071e3] text-white shadow-xs'
                  : 'hover:bg-black/5 dark:hover:bg-white/10 text-ink dark:text-dark-ink'
              }`}
              title="Italic (Ctrl+I)"
            >
              I
            </button>

            <button
              type="button"
              onClick={() => executeCmd('underline')}
              className={`h-7 w-7 flex items-center justify-center underline text-xs rounded-full transition cursor-pointer active:scale-95 ${
                activeFormats.underline
                  ? 'bg-[#0071e3] text-white shadow-xs'
                  : 'hover:bg-black/5 dark:hover:bg-white/10 text-ink dark:text-dark-ink'
              }`}
              title="Underline (Ctrl+U)"
            >
              U
            </button>

            <button
              type="button"
              onClick={() => executeCmd('strikeThrough')}
              className={`h-7 w-7 flex items-center justify-center line-through text-xs rounded-full transition cursor-pointer active:scale-95 ${
                activeFormats.strike
                  ? 'bg-[#0071e3] text-white shadow-xs'
                  : 'hover:bg-black/5 dark:hover:bg-white/10 text-ink dark:text-dark-ink'
              }`}
              title="Strikethrough"
            >
              S
            </button>

            <button
              type="button"
              onClick={() => executeCmd('subscript')}
              className={`h-7 w-7 flex items-center justify-center rounded-full transition cursor-pointer active:scale-95 ${
                activeFormats.subscript
                  ? 'bg-[#0071e3] text-white shadow-xs'
                  : 'hover:bg-black/5 dark:hover:bg-white/10 text-ink dark:text-dark-ink'
              }`}
              title="Subscript"
            >
              <IconSubscript className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => executeCmd('superscript')}
              className={`h-7 w-7 flex items-center justify-center rounded-full transition cursor-pointer active:scale-95 ${
                activeFormats.superscript
                  ? 'bg-[#0071e3] text-white shadow-xs'
                  : 'hover:bg-black/5 dark:hover:bg-white/10 text-ink dark:text-dark-ink'
              }`}
              title="Superscript"
            >
              <IconSuperscript className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={handleClearFormat}
              className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-black/5 dark:hover:bg-white/10 text-ink-mute dark:text-dark-mute hover:text-ink transition cursor-pointer"
              title="Clear Formatting (Reset style & block)"
            >
              <IconClear className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Group 4: Text & Highlight Colors */}
          <div className="flex items-center gap-1 bg-paper/60 dark:bg-white/[0.04] p-0.5 rounded-lg border border-rule/40 dark:border-white/5 relative shrink-0">
            {/* Text Color Popover */}
            <div className="relative word-editor-popover">
              <button
                type="button"
                onClick={() => {
                  setShowColorMenu(!showColorMenu)
                  setShowHighlightMenu(false)
                }}
                className="h-8 px-2 flex items-center gap-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10 text-ink dark:text-dark-ink transition cursor-pointer"
                title="Font Text Color"
              >
                <span className="font-black text-xs">A</span>
                <span className="w-2.5 h-2.5 rounded-full border border-rule dark:border-white/20 bg-accent" />
              </button>

              {showColorMenu && (
                <div className="absolute top-full left-0 mt-1 z-30 p-2.5 bg-paper dark:bg-dark-paper border border-rule dark:border-white/10 rounded-xl shadow-xl flex flex-col gap-2 min-w-[150px]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-ink-mute">Text Color</span>
                  <div className="grid grid-cols-4 gap-1.5">
                    {TEXT_COLORS.map((item) => (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => {
                          executeCmd('foreColor', item.value)
                          setShowColorMenu(false)
                        }}
                        className="w-6 h-6 rounded-md border border-rule/50 flex items-center justify-center cursor-pointer hover:scale-110 transition"
                        style={{ backgroundColor: item.color }}
                        title={item.label}
                      />
                    ))}
                  </div>
                  <label className="text-[11px] text-accent flex items-center justify-between cursor-pointer pt-1 border-t border-rule/50">
                    <span>Custom</span>
                    <input
                      type="color"
                      onChange={(e) => {
                        executeCmd('foreColor', e.target.value)
                        setShowColorMenu(false)
                      }}
                      className="w-5 h-5 rounded cursor-pointer"
                    />
                  </label>
                </div>
              )}
            </div>

            {/* Highlight Color Popover */}
            <div className="relative word-editor-popover">
              <button
                type="button"
                onClick={() => {
                  setShowHighlightMenu(!showHighlightMenu)
                  setShowColorMenu(false)
                }}
                className="h-8 px-2 flex items-center gap-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10 text-ink dark:text-dark-ink transition cursor-pointer"
                title="Highlight Marker Color"
              >
                <IconHighlighter className="w-3.5 h-3.5" />
                <span className="w-2.5 h-2.5 rounded-full border border-rule dark:border-white/20 bg-[#fef08a]" />
              </button>

              {showHighlightMenu && (
                <div className="absolute top-full left-0 mt-1 z-30 p-2.5 bg-paper dark:bg-dark-paper border border-rule dark:border-white/10 rounded-xl shadow-xl flex flex-col gap-2 min-w-[150px]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-ink-mute">Marker Highlight</span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {HIGHLIGHT_COLORS.map((item) => (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => {
                          executeCmd('hiliteColor', item.value)
                          setShowHighlightMenu(false)
                        }}
                        className="w-7 h-6 rounded-md border border-rule/50 flex items-center justify-center cursor-pointer hover:scale-105 transition"
                        style={{ backgroundColor: item.color }}
                        title={item.label}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* TOOLBAR ROW 2: Structure, Alignment, Media, Callouts & Views */}
        <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar sm:flex-wrap pt-1 border-t border-rule/40 dark:border-white/5">
          {/* Group 5: Alignment */}
          <div className="flex items-center gap-0.5 bg-paper/60 dark:bg-white/[0.04] p-0.5 rounded-lg border border-rule/40 dark:border-white/5 shrink-0">
            <button
              type="button"
              onClick={() => executeCmd('justifyLeft')}
              className={`h-8 w-8 flex items-center justify-center rounded-md transition cursor-pointer ${
                activeFormats.justifyLeft
                  ? 'bg-accent text-white shadow-xs'
                  : 'hover:bg-black/5 dark:hover:bg-white/10 text-ink dark:text-dark-ink'
              }`}
              title="Align Left"
            >
              <IconAlignLeft className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => executeCmd('justifyCenter')}
              className={`h-8 w-8 flex items-center justify-center rounded-md transition cursor-pointer ${
                activeFormats.justifyCenter
                  ? 'bg-accent text-white shadow-xs'
                  : 'hover:bg-black/5 dark:hover:bg-white/10 text-ink dark:text-dark-ink'
              }`}
              title="Align Center"
            >
              <IconAlignCenter className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => executeCmd('justifyRight')}
              className={`h-8 w-8 flex items-center justify-center rounded-md transition cursor-pointer ${
                activeFormats.justifyRight
                  ? 'bg-accent text-white shadow-xs'
                  : 'hover:bg-black/5 dark:hover:bg-white/10 text-ink dark:text-dark-ink'
              }`}
              title="Align Right"
            >
              <IconAlignRight className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => executeCmd('justifyFull')}
              className={`h-8 w-8 flex items-center justify-center rounded-md transition cursor-pointer ${
                activeFormats.justifyFull
                  ? 'bg-accent text-white shadow-xs'
                  : 'hover:bg-black/5 dark:hover:bg-white/10 text-ink dark:text-dark-ink'
              }`}
              title="Justify Text"
            >
              <IconAlignJustify className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Group 6: Lists & Indents */}
          <div className="flex items-center gap-0.5 bg-paper/60 dark:bg-white/[0.04] p-0.5 rounded-lg border border-rule/40 dark:border-white/5 shrink-0">
            <button
              type="button"
              onClick={() => executeCmd('insertUnorderedList')}
              className={`h-8 w-8 flex items-center justify-center rounded-md transition cursor-pointer ${
                activeFormats.unorderedList
                  ? 'bg-accent text-white shadow-xs'
                  : 'hover:bg-black/5 dark:hover:bg-white/10 text-ink dark:text-dark-ink'
              }`}
              title="Bullet List"
            >
              <IconListBullet className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => executeCmd('insertOrderedList')}
              className={`h-8 w-8 flex items-center justify-center rounded-md transition cursor-pointer ${
                activeFormats.orderedList
                  ? 'bg-accent text-white shadow-xs'
                  : 'hover:bg-black/5 dark:hover:bg-white/10 text-ink dark:text-dark-ink'
              }`}
              title="Numbered List"
            >
              <IconListNumber className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => executeCmd('outdent')}
              className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-black/5 dark:hover:bg-white/10 text-ink dark:text-dark-ink transition cursor-pointer"
              title="Decrease Indent (Shift+Tab)"
            >
              <IconOutdent className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => executeCmd('indent')}
              className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-black/5 dark:hover:bg-white/10 text-ink dark:text-dark-ink transition cursor-pointer"
              title="Increase Indent (Tab)"
            >
              <IconIndent className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Group 7: Broadsheet Inserts */}
          <div className="flex items-center gap-1 bg-paper/60 dark:bg-white/[0.04] p-0.5 rounded-lg border border-rule/40 dark:border-white/5 shrink-0">
            <button
              type="button"
              onClick={openLinkModal}
              className="h-8 px-2.5 flex items-center gap-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/10 text-ink dark:text-dark-ink font-medium text-xs transition cursor-pointer"
              title="Insert Link (Ctrl+K)"
            >
              <IconLink className="w-3.5 h-3.5" />
              <span>Link</span>
            </button>

            <button
              type="button"
              onClick={openImageModal}
              className="h-8 px-2.5 flex items-center gap-1.5 rounded-md bg-accent/10 hover:bg-accent text-accent hover:text-white font-bold text-xs transition cursor-pointer"
              title="Embed Image with Alignment & Caption"
            >
              <IconMedia className="w-3.5 h-3.5" />
              <span>Image</span>
            </button>

            <button
              type="button"
              onClick={openVideoModal}
              className="h-8 px-2.5 flex items-center gap-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/10 text-ink dark:text-dark-ink font-medium text-xs transition cursor-pointer"
              title="Embed Video (YouTube / Vimeo / MP4)"
            >
              <IconVideo className="w-3.5 h-3.5" />
              <span>Video</span>
            </button>

            <button
              type="button"
              onClick={insertPullQuote}
              className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-black/5 dark:hover:bg-white/10 text-ink dark:text-dark-ink transition cursor-pointer"
              title="Insert Editorial Pull-Quote Callout"
            >
              <IconQuote className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={insertCalloutBox}
              className="h-8 px-2 flex items-center gap-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10 text-ink dark:text-dark-ink transition cursor-pointer text-[11px] font-semibold"
              title="Insert Editorial Bulletin Callout Box"
            >
              <span>Callout</span>
            </button>

            <button
              type="button"
              onClick={insertDataTable}
              className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-black/5 dark:hover:bg-white/10 text-ink dark:text-dark-ink transition cursor-pointer"
              title="Insert Broadsheet Data Table"
            >
              <IconTable className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={insertHorizontalDivider}
              className="h-8 px-2 flex items-center justify-center rounded-md hover:bg-black/5 dark:hover:bg-white/10 text-ink dark:text-dark-ink transition cursor-pointer text-xs font-semibold"
              title="Insert Divider Rule"
            >
              Divider
            </button>
          </div>

          {/* Group 8: View & Fullscreen Controls */}
          <div className="ml-auto flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => {
                if (isCodeView) {
                  setIsCodeView(false)
                } else {
                  if (editorRef.current) {
                    setHtmlContent(editorRef.current.innerHTML)
                  }
                  setIsCodeView(true)
                }
              }}
              className={`h-8 px-2.5 text-[11px] font-mono rounded-lg transition cursor-pointer border flex items-center gap-1.5 ${
                isCodeView
                  ? 'bg-accent text-white border-accent shadow-xs'
                  : 'bg-paper dark:bg-dark-paper border-rule/60 dark:border-white/10 text-ink-mute hover:text-ink'
              }`}
              title="Toggle WYSIWYG / HTML Source Mode"
            >
              {isCodeView ? (
                <>
                  <IconEye className="w-3.5 h-3.5" />
                  <span>Visual Mode</span>
                </>
              ) : (
                <>
                  <IconCode className="w-3.5 h-3.5" />
                  <span>HTML Source</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="h-8 w-8 flex items-center justify-center rounded-lg border border-rule/60 dark:border-white/10 bg-paper dark:bg-dark-paper hover:bg-paper-subtle text-ink dark:text-dark-ink transition cursor-pointer"
              title={isFullscreen ? 'Exit Fullscreen (Esc)' : 'Enter Fullscreen Focus Mode'}
            >
              {isFullscreen ? <IconMinimize className="w-3.5 h-3.5" /> : <IconMaximize className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

        {/* FLOATING MEDIA TOOLBAR (When an image/figure is selected) */}
        {activeFigure && figurePosition && (
          <div
            className="figure-floating-toolbar absolute z-40 bg-ink dark:bg-dark-paper text-paper dark:text-dark-ink px-2 py-1 rounded-xl shadow-xl flex items-center gap-1 text-xs border border-white/20 animate-in fade-in zoom-in-95 duration-150"
            style={{ top: `${Math.max(45, figurePosition.top)}px`, left: `${figurePosition.left}px` }}
          >
            <button
              type="button"
              onClick={() => updateFigureAlign('left')}
              className="px-2 py-1 hover:bg-white/20 rounded-md transition cursor-pointer font-medium text-[11px]"
              title="Align Left"
            >
              Left
            </button>
            <button
              type="button"
              onClick={() => updateFigureAlign('center')}
              className="px-2 py-1 hover:bg-white/20 rounded-md transition cursor-pointer font-medium text-[11px]"
              title="Center"
            >
              Center
            </button>
            <button
              type="button"
              onClick={() => updateFigureAlign('right')}
              className="px-2 py-1 hover:bg-white/20 rounded-md transition cursor-pointer font-medium text-[11px]"
              title="Align Right"
            >
              Right
            </button>
            <button
              type="button"
              onClick={() => updateFigureAlign('full')}
              className="px-2 py-1 hover:bg-white/20 rounded-md transition cursor-pointer font-medium text-[11px]"
              title="Full Width"
            >
              Full
            </button>
            <div className="w-px h-3.5 bg-white/20 mx-0.5" />
            <button
              type="button"
              onClick={removeActiveFigure}
              className="px-2 py-1 hover:bg-red-600 text-red-300 hover:text-white rounded-md transition cursor-pointer font-bold text-[11px]"
              title="Remove Image"
            >
              Remove
            </button>
          </div>
        )}

        {/* EDITOR MAIN CANVAS VIEWPORT */}
        <div
          className={`relative bg-paper dark:bg-dark-paper overflow-y-auto ${
            isFullscreen ? 'flex-1 p-6 sm:p-12 max-w-4xl mx-auto w-full' : 'min-h-[480px]'
          }`}
        >
          {isCodeView ? (
            <textarea
              value={htmlContent}
              onChange={(e) => {
                setHtmlContent(e.target.value)
                onChange(e.target.value)
              }}
              rows={22}
              className="w-full h-full min-h-[480px] p-6 font-mono text-xs bg-[#121214] text-gray-100 border-0 focus:outline-none resize-y leading-relaxed"
              placeholder="Edit raw HTML document markup…"
            />
          ) : (
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              onInput={handleEditorInput}
              onKeyUp={updateActiveFormats}
              onMouseUp={updateActiveFormats}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              onClick={handleEditorClick}
              data-placeholder={placeholder || 'Start typing the story dispatch here…'}
              className="word-editor-content w-full min-h-[350px] sm:min-h-[480px] p-4 sm:p-8 font-serif text-[16px] sm:text-[18px] leading-[1.8] text-ink dark:text-dark-ink focus:outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-ink-mute/40 dark:empty:before:text-dark-mute/40 empty:before:pointer-events-none"
            />
          )}
        </div>

        {/* STATUS BAR & DOCUMENT TELEMETRY (hidden on mobile phone view) */}
        <div className="hidden sm:flex px-4 py-2 bg-paper-subtle/80 dark:bg-dark-subtle/80 border-t border-rule/80 dark:border-white/10 flex-wrap items-center justify-between text-[11px] font-mono text-ink-mute dark:text-dark-mute select-none">
          <div className="flex items-center gap-4 sm:gap-6">
            <span>Words: <strong className="text-ink dark:text-dark-ink font-bold">{wordCount}</strong></span>
            <span>Characters: <strong className="text-ink dark:text-dark-ink font-bold">{charCount}</strong></span>
            <span>Paragraphs: <strong className="text-ink dark:text-dark-ink font-bold">{paragraphCount}</strong></span>
            <span>Reading: <strong className="text-accent font-bold">{readTimeMin} min</strong></span>
          </div>
          <div className="flex items-center gap-3 text-[10px]">
            {isFullscreen && (
              <span className="hidden sm:inline px-2 py-0.5 bg-ink/5 dark:bg-white/10 rounded-full">
                Press ESC to exit Fullscreen
              </span>
            )}
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">Word Editor Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: EMBED IMAGE */}
      {showImageModal && (
        <div className="fixed inset-0 z-60 bg-black/40 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md backdrop-blur-2xl bg-white/85 dark:bg-[#1c1c1e]/85 border border-black/[0.08] dark:border-white/[0.1] rounded-3xl shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/10 pb-3">
              <h4 className="font-bold text-sm uppercase tracking-wider text-ink dark:text-dark-ink flex items-center gap-2">
                <IconMedia className="w-4 h-4 text-[#0071e3]" />
                <span>Embed Article Illustration</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowImageModal(false)}
                className="text-ink-mute hover:text-ink cursor-pointer p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 active:scale-95"
                aria-label="Close"
              >
                <IconClose className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase text-ink dark:text-dark-ink mb-1">
                  Image Source URL *
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/... or /uploads/..."
                  className="w-full text-xs px-4 py-2.5 bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/10 text-ink dark:text-dark-ink focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20 focus:border-[#0071e3] rounded-full"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-ink dark:text-dark-ink mb-1">
                  Caption / Attribution
                </label>
                <input
                  type="text"
                  value={imageCaption}
                  onChange={(e) => setImageCaption(e.target.value)}
                  placeholder="e.g. Photo courtesy of Reuters / Editorial Archives"
                  className="w-full text-xs px-4 py-2.5 bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/10 text-ink dark:text-dark-ink focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20 focus:border-[#0071e3] rounded-full"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-ink dark:text-dark-ink mb-1">
                  Alignment &amp; Placement
                </label>
                <div className="grid grid-cols-4 gap-2 text-xs">
                  {(['center', 'full', 'left', 'right'] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setImageAlign(mode)}
                      className={`py-1.5 capitalize rounded-full border text-xs font-semibold cursor-pointer transition active:scale-95 ${
                        imageAlign === mode
                          ? 'bg-[#0071e3] text-white border-[#0071e3] shadow-xs'
                          : 'border-black/[0.08] dark:border-white/10 text-ink dark:text-dark-ink hover:bg-black/5 dark:hover:bg-white/5'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {imageUrl && (
                <div className="p-2 border border-black/[0.06] dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.04] rounded-2xl">
                  <span className="text-[10px] font-mono text-ink-mute uppercase block mb-1">Live Image Preview</span>
                  <img
                    src={imageUrl}
                    alt="preview"
                    className="max-h-36 mx-auto object-cover rounded-xl"
                    onError={(e) => ((e.target as HTMLElement).style.display = 'none')}
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-black/[0.06] dark:border-white/10">
              <button
                type="button"
                onClick={() => setShowImageModal(false)}
                className="px-4 py-2 text-xs font-semibold text-ink-mute hover:text-ink cursor-pointer rounded-full hover:bg-black/5 active:scale-95"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleInsertImage}
                disabled={!imageUrl.trim()}
                className="px-5 py-2 bg-[#0071e3] text-white text-xs font-semibold rounded-full hover:bg-[#0077ed] disabled:opacity-50 cursor-pointer shadow-xs active:scale-95"
              >
                Embed Image
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EMBED VIDEO */}
      {showVideoModal && (
        <div className="fixed inset-0 z-60 bg-black/40 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md backdrop-blur-2xl bg-white/85 dark:bg-[#1c1c1e]/85 border border-black/[0.08] dark:border-white/[0.1] rounded-3xl shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/10 pb-3">
              <h4 className="font-bold text-sm uppercase tracking-wider text-ink dark:text-dark-ink flex items-center gap-2">
                <IconVideo className="w-4 h-4 text-[#0071e3]" />
                <span>Embed Video Dispatch</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowVideoModal(false)}
                className="text-ink-mute hover:text-ink cursor-pointer p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 active:scale-95"
                aria-label="Close"
              >
                <IconClose className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase text-ink dark:text-dark-ink mb-1">
                  Video URL (YouTube / Vimeo / MP4) *
                </label>
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=... or https://vimeo.com/..."
                  className="w-full text-xs px-4 py-2.5 bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/10 text-ink dark:text-dark-ink focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20 focus:border-[#0071e3] rounded-full"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-ink dark:text-dark-ink mb-1">
                  Caption / Context
                </label>
                <input
                  type="text"
                  value={videoCaption}
                  onChange={(e) => setVideoCaption(e.target.value)}
                  placeholder="e.g. Press briefing live footage, Capitol grounds"
                  className="w-full text-xs px-4 py-2.5 bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/10 text-ink dark:text-dark-ink focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20 focus:border-[#0071e3] rounded-full"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-black/[0.06] dark:border-white/10">
              <button
                type="button"
                onClick={() => setShowVideoModal(false)}
                className="px-4 py-2 text-xs font-semibold text-ink-mute hover:text-ink cursor-pointer rounded-full hover:bg-black/5 active:scale-95"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleInsertVideo}
                disabled={!videoUrl.trim()}
                className="px-5 py-2 bg-[#0071e3] text-white text-xs font-semibold rounded-full hover:bg-[#0077ed] disabled:opacity-50 cursor-pointer shadow-xs active:scale-95"
              >
                Embed Video
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: INSERT HYPERLINK */}
      {showLinkModal && (
        <div className="fixed inset-0 z-60 bg-black/40 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm backdrop-blur-2xl bg-white/85 dark:bg-[#1c1c1e]/85 border border-black/[0.08] dark:border-white/[0.1] rounded-3xl shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/10 pb-3">
              <h4 className="font-bold text-sm uppercase tracking-wider text-ink dark:text-dark-ink flex items-center gap-2">
                <IconLink className="w-4 h-4 text-[#0071e3]" />
                <span>Insert Hyperlink</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowLinkModal(false)}
                className="text-ink-mute hover:text-ink cursor-pointer p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 active:scale-95"
                aria-label="Close"
              >
                <IconClose className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase text-ink dark:text-dark-ink mb-1">
                  Destination URL *
                </label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com/dispatch"
                  className="w-full text-xs px-4 py-2.5 bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/10 text-ink dark:text-dark-ink focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20 focus:border-[#0071e3] rounded-full"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-ink dark:text-dark-ink mb-1">
                  Link Anchor Text
                </label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="e.g. Read full investigative dossier"
                  className="w-full text-xs px-4 py-2.5 bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/10 text-ink dark:text-dark-ink focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20 focus:border-[#0071e3] rounded-full"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-black/[0.06] dark:border-white/10">
              <button
                type="button"
                onClick={() => setShowLinkModal(false)}
                className="px-4 py-2 text-xs font-semibold text-ink-mute hover:text-ink cursor-pointer rounded-full hover:bg-black/5 active:scale-95"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleInsertLink}
                disabled={!linkUrl.trim()}
                className="px-5 py-2 bg-[#0071e3] text-white text-xs font-semibold rounded-full hover:bg-[#0077ed] disabled:opacity-50 cursor-pointer shadow-xs active:scale-95"
              >
                Insert Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
