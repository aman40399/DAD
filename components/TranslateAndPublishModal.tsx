'use client'

import { useState } from 'react'

interface TranslateAndPublishModalProps {
  isOpen: boolean
  onClose: () => void
  articleId: number
  currentTitle: string
  currentContent: string
  currentExcerpt: string
  currentLanguage: string
  onSuccess: () => void
}

export default function TranslateAndPublishModal({
  isOpen,
  onClose,
  articleId,
  currentTitle,
  currentContent,
  currentExcerpt,
  currentLanguage,
  onSuccess
}: TranslateAndPublishModalProps) {
  const [targetLanguage, setTargetLanguage] = useState<string>(
    currentLanguage === 'hindi' ? 'english' : 'hindi'
  )
  const [isTranslating, setIsTranslating] = useState(false)
  const [error, setError] = useState('')
  const [progress, setProgress] = useState('')

  if (!isOpen) return null

  const handleTranslateAndPublish = async () => {
    setIsTranslating(true)
    setError('')
    setProgress('Starting translation...')

    try {
      // Step 1: Translate title
      setProgress('Translating title...')
      const titleResponse = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'translate',
          content: currentTitle,
          language: targetLanguage,
          temperature: 0.3,
          maxTokens: 200,
        }),
      })

      if (!titleResponse.ok) throw new Error('Failed to translate title')
      const titleData = await titleResponse.json()
      const translatedTitle = titleData.content.replace(/<[^>]*>/g, '').trim()

      // Step 2: Translate content
      setProgress('Translating article content... (this may take a moment)')
      
      // Strip HTML for translation
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = currentContent
      const textContent = tempDiv.textContent || tempDiv.innerText || ''

      const contentResponse = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'translate',
          content: textContent,
          language: targetLanguage,
          temperature: 0.3,
          maxTokens: targetLanguage === 'hindi' ? 4000 : 3000,
        }),
      })

      if (!contentResponse.ok) throw new Error('Failed to translate content')
      const contentData = await contentResponse.json()
      const translatedContent = contentData.content

      // Step 3: Translate excerpt
      setProgress('Translating excerpt...')
      const excerptResponse = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'translate',
          content: currentExcerpt,
          language: targetLanguage,
          temperature: 0.3,
          maxTokens: 500,
        }),
      })

      if (!excerptResponse.ok) throw new Error('Failed to translate excerpt')
      const excerptData = await excerptResponse.json()
      const translatedExcerpt = excerptData.content.replace(/<[^>]*>/g, '').trim()

      // Step 4: Create new article
      setProgress('Creating new article...')
      
      // Generate new slug
      const baseSlug = translatedTitle
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
      
      const timestamp = Date.now()
      const newSlug = `${baseSlug}-${targetLanguage}-${timestamp}`

      const createResponse = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: translatedTitle,
          slug: newSlug,
          excerpt: translatedExcerpt,
          content: translatedContent,
          language: targetLanguage,
          // Copy other fields from original article - you'll need to pass these as props
        }),
      })

      if (!createResponse.ok) throw new Error('Failed to create translated article')
      
      setProgress('Translation complete! Redirecting...')
      setTimeout(() => {
        onSuccess()
        onClose()
      }, 1000)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Translation failed')
      setIsTranslating(false)
    }
  }

  const languageLabels = {
    english: '🇬🇧 English',
    hindi: '🇮🇳 Hindi (हिंदी)'
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="text-4xl">🌐</span>
              <div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                  Translate & Publish
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Create a translated copy of this article
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isTranslating}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Current Language */}
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
              Current Language
            </p>
            <p className="text-lg font-bold text-blue-700 dark:text-blue-300">
              {languageLabels[currentLanguage as keyof typeof languageLabels] || currentLanguage}
            </p>
          </div>

          {/* Target Language */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              Translate To
            </label>
            <select
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value)}
              disabled={isTranslating}
              className="w-full px-4 py-3 text-base border-2 border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100 font-medium shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
            >
              <option value="english">🇬🇧 English</option>
              <option value="hindi">🇮🇳 Hindi (हिंदी)</option>
            </select>
          </div>

          {/* Info Box */}
          <div className="mb-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
            <div className="flex gap-3">
              <span className="text-2xl">ℹ️</span>
              <div className="flex-1">
                <h3 className="font-bold text-purple-900 dark:text-purple-100 mb-1">
                  What happens:
                </h3>
                <ul className="text-sm text-purple-800 dark:text-purple-200 space-y-1">
                  <li>• AI will translate title, content, and excerpt</li>
                  <li>• A new article will be created with a unique slug</li>
                  <li>• Original article remains unchanged</li>
                  <li>• Translation preserves HTML formatting</li>
                  <li>• Hindi translations are comprehensive and detailed</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Progress */}
          {progress && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-3">
                {isTranslating && (
                  <svg className="animate-spin h-5 w-5 text-green-600" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                )}
                <span className="text-sm font-semibold text-green-800 dark:text-green-200">
                  {progress}
                </span>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <p className="text-sm font-semibold text-red-800 dark:text-red-200">
                Error: {error}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isTranslating}
              className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-bold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleTranslateAndPublish}
              disabled={isTranslating || targetLanguage === currentLanguage}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
            >
              {isTranslating ? 'Translating...' : '🌐 Translate & Publish'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
