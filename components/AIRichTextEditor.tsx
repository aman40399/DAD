'use client'

import { useState, useMemo } from 'react'
import dynamic from 'next/dynamic'
import 'react-quill/dist/quill.snow.css'

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })

interface AIRichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  onTagsGenerated?: (tags: string[]) => void
}

export default function AIRichTextEditor({ value, onChange, placeholder, onTagsGenerated }: AIRichTextEditorProps) {
  const [showAIPanel, setShowAIPanel] = useState(false)
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiAction, setAiAction] = useState<string>('generate')
  const [aiLanguage, setAiLanguage] = useState<string>('english')
  const [isAILoading, setIsAILoading] = useState(false)
  const [aiError, setAiError] = useState('')

  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        [{ 'align': [] }],
        ['blockquote', 'code-block'],
        ['link', 'image'],
        ['clean']
      ],
    },
    clipboard: {
      matchVisual: false,
    }
  }), [])

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'list', 'bullet', 'indent',
    'align',
    'blockquote', 'code-block',
    'link', 'image'
  ]

  const handleAIGenerate = async () => {
    if (!aiPrompt && aiAction === 'generate') {
      setAiError('Please enter a prompt')
      return
    }

    if (!value && aiAction !== 'generate') {
      setAiError('No content to process')
      return
    }

    setIsAILoading(true)
    setAiError('')

    try {
      // Strip HTML tags from content for AI processing
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = value
      const textContent = tempDiv.textContent || tempDiv.innerText || ''

      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: aiPrompt,
          action: aiAction,
          content: textContent,
          language: aiLanguage,
          temperature: 0.7,
          maxTokens: aiLanguage === 'hindi' ? 3000 : 2000, // More tokens for Hindi
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'AI generation failed')
      }

      if (data.success && data.content) {
        // Special handling for tags action
        if (aiAction === 'tags' && onTagsGenerated) {
          // Extract tags from the response
          const tagsText = data.content.replace(/<[^>]*>/g, '').trim()
          const tagsArray = tagsText
            .split(/[,\n]/)
            .map((tag: string) => tag.trim())
            .filter((tag: string) => tag.length > 0 && tag.length < 50)
            .slice(0, 10) // Limit to 10 tags
          
          // Call the callback with tags array
          onTagsGenerated(tagsArray)
          setAiPrompt('')
          setShowAIPanel(false)
        } else {
          // Convert AI response (plain text with some formatting) to HTML
          let htmlContent = formatAIResponseToHTML(data.content)
          onChange(htmlContent)
          setAiPrompt('')
          setShowAIPanel(false)
        }
      }
    } catch (error) {
      setAiError(error instanceof Error ? error.message : 'Failed to generate content')
    } finally {
      setIsAILoading(false)
    }
  }

  // Convert AI response to HTML
  const formatAIResponseToHTML = (text: string): string => {
    let html = text

    // Convert markdown-style headings to HTML
    html = html.replace(/^### (.*?)$/gm, '<h3>$1</h3>')
    html = html.replace(/^## (.*?)$/gm, '<h2>$1</h2>')
    html = html.replace(/^# (.*?)$/gm, '<h1>$1</h1>')
    
    // Convert **bold** to <strong>
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    
    // Convert *italic* to <em>
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>')
    
    // Convert line breaks to paragraphs
    const lines = html.split('\n')
    let inList = false
    let result = ''
    
    for (let line of lines) {
      line = line.trim()
      
      if (!line) continue
      
      // Check if it's a heading
      if (line.startsWith('<h')) {
        result += line + '\n'
      }
      // Check if it's a list item
      else if (line.match(/^[-*•]\s/)) {
        if (!inList) {
          result += '<ul>\n'
          inList = true
        }
        result += '<li>' + line.replace(/^[-*•]\s/, '') + '</li>\n'
      }
      // Check if it's a numbered list
      else if (line.match(/^\d+\.\s/)) {
        if (!inList) {
          result += '<ol>\n'
          inList = true
        }
        result += '<li>' + line.replace(/^\d+\.\s/, '') + '</li>\n'
      }
      // Regular paragraph
      else {
        if (inList) {
          result += '</ul>\n'
          inList = false
        }
        result += '<p>' + line + '</p>\n'
      }
    }
    
    if (inList) {
      result += '</ul>\n'
    }
    
    return result
  }

  const aiActions = [
    { value: 'generate', label: '✨ Generate New Article', needsPrompt: true },
    { value: 'enhance', label: '🚀 Enhance Content', needsPrompt: false },
    { value: 'rewrite', label: '🔄 Rewrite', needsPrompt: false },
    { value: 'expand', label: '📝 Expand & Add Details', needsPrompt: false },
    { value: 'summarize', label: '📋 Summarize', needsPrompt: false },
    { value: 'fix-grammar', label: '✅ Fix Grammar', needsPrompt: false },
    { value: 'headline', label: '📰 Generate Headlines', needsPrompt: false },
    { value: 'excerpt', label: '📄 Generate Excerpt', needsPrompt: false },
    { value: 'tags', label: '🏷️ Generate Tags', needsPrompt: false },
  ]

  const currentAction = aiActions.find(a => a.value === aiAction)

  return (
    <div className="relative">
      {/* AI Assistant Button */}
      <div className="mb-3 flex justify-end">
        <button
          type="button"
          onClick={() => setShowAIPanel(!showAIPanel)}
          className={`px-6 py-3 rounded-lg font-semibold text-sm shadow-lg transition-all transform hover:scale-105 ${
            showAIPanel
              ? 'bg-purple-600 text-white'
              : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700'
          }`}
        >
          <span className="flex items-center gap-2">
            <span className="text-xl">🤖</span>
            <span>AI Writing Assistant</span>
            {showAIPanel && <span className="text-xs">▼</span>}
            {!showAIPanel && <span className="text-xs">▶</span>}
          </span>
        </button>
      </div>

      {/* AI Panel */}
      {showAIPanel && (
        <div className="mb-4 p-6 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-2 border-purple-200 dark:border-purple-800 rounded-xl shadow-xl">
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">🤖</span>
              <div>
                <h3 className="text-lg font-bold text-purple-900 dark:text-purple-100">AI Writing Assistant</h3>
                <p className="text-sm text-purple-700 dark:text-purple-300">Generate and enhance your articles with AI</p>
              </div>
            </div>

            {/* Action Selector */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Select Action
              </label>
              <select
                value={aiAction}
                onChange={(e) => setAiAction(e.target.value)}
                className="w-full px-4 py-3 text-base border-2 border-purple-300 dark:border-purple-700 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 font-medium shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {aiActions.map((action) => (
                  <option key={action.value} value={action.value}>
                    {action.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Language Selector */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Select Language
              </label>
              <select
                value={aiLanguage}
                onChange={(e) => setAiLanguage(e.target.value)}
                className="w-full px-4 py-3 text-base border-2 border-purple-300 dark:border-purple-700 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 font-medium shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="english">🇬🇧 English</option>
                <option value="hindi">🇮🇳 Hindi (हिंदी)</option>
              </select>
              <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                {aiLanguage === 'hindi' ? 'AI will generate content in Hindi with longer responses' : 'AI will generate content in English'}
              </p>
            </div>

            {/* Prompt Input */}
            {currentAction?.needsPrompt && (
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  What do you want to write about?
                </label>
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Example: 'Write a breaking news article about renewable energy developments in India'"
                  className="w-full px-4 py-3 text-base border-2 border-purple-300 dark:border-purple-700 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 resize-none shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={4}
                />
              </div>
            )}

            {/* Error Message */}
            {aiError && (
              <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
                <span className="font-semibold">Error:</span> {aiError}
              </div>
            )}

            {/* Generate Button */}
            <button
              type="button"
              onClick={handleAIGenerate}
              disabled={isAILoading}
              className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold text-lg rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {isAILoading ? (
                <span className="flex items-center justify-center gap-3">
                  <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Generating with AI...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <span>✨</span>
                  <span>{currentAction?.label}</span>
                </span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Rich Text Editor */}
      <div className="rich-text-editor shadow-lg rounded-lg overflow-hidden">
        <ReactQuill
          theme="snow"
          value={value}
          onChange={onChange}
          modules={modules}
          formats={formats}
          placeholder={placeholder || 'Start writing your article... or use AI Assistant above to generate content!'}
          className="bg-white dark:bg-neutral-900 text-gray-900 dark:text-white"
        />
      </div>

      <style jsx global>{`
        .rich-text-editor .ql-container {
          min-height: 500px;
          font-size: 16px;
          font-family: inherit;
        }
        .rich-text-editor .ql-editor {
          min-height: 500px;
          line-height: 1.8;
        }
        .rich-text-editor .ql-toolbar {
          background: white;
          border: 1px solid #d4d4d8;
          padding: 12px;
        }
        .dark .rich-text-editor .ql-toolbar {
          background: #262626;
          border-color: #525252;
        }
        .rich-text-editor .ql-container {
          border: 1px solid #d4d4d8;
          font-size: 17px;
        }
        .dark .rich-text-editor .ql-container {
          border-color: #525252;
          background: #171717;
        }
        .dark .rich-text-editor .ql-editor {
          color: white;
        }
        .dark .rich-text-editor .ql-editor.ql-blank::before {
          color: #a3a3a3;
        }
        .rich-text-editor .ql-toolbar .ql-stroke {
          stroke: #525252;
        }
        .dark .rich-text-editor .ql-toolbar .ql-stroke {
          stroke: #a3a3a3;
        }
        .rich-text-editor .ql-toolbar .ql-fill {
          fill: #525252;
        }
        .dark .rich-text-editor .ql-toolbar .ql-fill {
          fill: #a3a3a3;
        }
        .rich-text-editor .ql-toolbar .ql-picker-label {
          color: #525252;
        }
        .dark .rich-text-editor .ql-toolbar .ql-picker-label {
          color: #a3a3a3;
        }
        .rich-text-editor .ql-editor h1 {
          font-size: 2.5em;
          font-weight: 900;
          margin: 0.67em 0;
        }
        .rich-text-editor .ql-editor h2 {
          font-size: 2em;
          font-weight: 800;
          margin: 0.75em 0;
        }
        .rich-text-editor .ql-editor h3 {
          font-size: 1.5em;
          font-weight: 700;
          margin: 0.83em 0;
        }
        .rich-text-editor .ql-editor p {
          margin: 1em 0;
          line-height: 1.8;
        }
        .rich-text-editor .ql-editor strong {
          font-weight: 700;
        }
        .rich-text-editor .ql-toolbar button:hover {
          color: #9333ea !important;
        }
        .rich-text-editor .ql-toolbar button.ql-active {
          color: #9333ea !important;
        }
      `}</style>
    </div>
  )
}
