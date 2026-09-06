'use client'

import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface AIMarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  minHeight?: string
}

const DEFAULT_PLACEHOLDER = `# Article Title

Write your article in **markdown** format...

## Main Section

Use **bold** for emphasis, *italic* for quotes, and lists:

- Point one
- Point two
- Point three

### Subsection

> Add blockquotes for important statements

Use the AI Assistant (click 🤖 button above) to:
- Generate full articles
- Enhance your writing
- Fix grammar
- Create headlines
- And more!`

export default function AIMarkdownEditor({ 
  value, 
  onChange, 
  placeholder = DEFAULT_PLACEHOLDER,
  minHeight = '400px'
}: AIMarkdownEditorProps) {
  const [showPreview, setShowPreview] = useState(false)
  const [showAIPanel, setShowAIPanel] = useState(false)
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiAction, setAiAction] = useState<string>('generate')
  const [isAILoading, setIsAILoading] = useState(false)
  const [aiError, setAiError] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [value])

  // Markdown toolbar actions
  const insertMarkdown = (before: string, after: string = '') => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end)
    
    onChange(newText)
    
    // Set cursor position
    setTimeout(() => {
      textarea.focus()
      const newPos = start + before.length + selectedText.length
      textarea.setSelectionRange(newPos, newPos)
    }, 0)
  }

  const toolbarButtons = [
    { icon: '# H1', action: () => insertMarkdown('# ', '\n'), tooltip: 'Heading 1' },
    { icon: '## H2', action: () => insertMarkdown('## ', '\n'), tooltip: 'Heading 2' },
    { icon: '### H3', action: () => insertMarkdown('### ', '\n'), tooltip: 'Heading 3' },
    { icon: '**B**', action: () => insertMarkdown('**', '**'), tooltip: 'Bold' },
    { icon: '*I*', action: () => insertMarkdown('*', '*'), tooltip: 'Italic' },
    { icon: '~~S~~', action: () => insertMarkdown('~~', '~~'), tooltip: 'Strikethrough' },
    { icon: '> Quote', action: () => insertMarkdown('> ', '\n'), tooltip: 'Quote' },
    { icon: '- List', action: () => insertMarkdown('- ', '\n'), tooltip: 'Bullet List' },
    { icon: '1. List', action: () => insertMarkdown('1. ', '\n'), tooltip: 'Numbered List' },
    { icon: '[ ] Task', action: () => insertMarkdown('- [ ] ', '\n'), tooltip: 'Task List' },
    { icon: '`Code`', action: () => insertMarkdown('`', '`'), tooltip: 'Inline Code' },
    { icon: '```Block', action: () => insertMarkdown('```\n', '\n```\n'), tooltip: 'Code Block' },
    { icon: '[Link]', action: () => insertMarkdown('[', '](url)'), tooltip: 'Link' },
    { icon: '![Image]', action: () => insertMarkdown('![alt](', ')'), tooltip: 'Image' },
    { icon: '---', action: () => insertMarkdown('\n---\n'), tooltip: 'Horizontal Rule' },
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
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: aiPrompt,
          action: aiAction,
          content: value,
          temperature: 0.7,
          maxTokens: 2000,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'AI generation failed')
      }

      if (data.success && data.content) {
        if (aiAction === 'generate' || aiAction === 'rewrite') {
          onChange(data.content)
        } else {
          // For enhance, expand, etc., append or replace
          onChange(data.content)
        }
        setAiPrompt('')
        setShowAIPanel(false)
      }
    } catch (error) {
      setAiError(error instanceof Error ? error.message : 'Failed to generate content')
    } finally {
      setIsAILoading(false)
    }
  }

  const aiActions = [
    { value: 'generate', label: '✨ Generate New', needsPrompt: true },
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
    <div className="border border-neutral-300 dark:border-neutral-700 rounded-lg overflow-hidden bg-white dark:bg-neutral-900">
      {/* Toolbar */}
      <div className="border-b border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 p-2">
        <div className="flex flex-wrap gap-1 items-center">
          {/* Markdown Toolbar */}
          <div className="flex flex-wrap gap-1 border-r border-neutral-300 dark:border-neutral-600 pr-2">
            {toolbarButtons.map((btn, idx) => (
              <button
                key={idx}
                type="button"
                onClick={btn.action}
                title={btn.tooltip}
                className="px-2 py-1 text-xs font-mono bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded hover:bg-neutral-100 dark:hover:bg-neutral-600 transition-colors"
              >
                {btn.icon}
              </button>
            ))}
          </div>

          {/* View Toggle */}
          <div className="flex gap-1 border-r border-neutral-300 dark:border-neutral-600 pr-2">
            <button
              type="button"
              onClick={() => setShowPreview(false)}
              className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${
                !showPreview 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-600'
              }`}
            >
              ✏️ Edit
            </button>
            <button
              type="button"
              onClick={() => setShowPreview(true)}
              className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${
                showPreview 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-600'
              }`}
            >
              👁️ Preview
            </button>
          </div>

          {/* AI Assistant Toggle */}
          <button
            type="button"
            onClick={() => setShowAIPanel(!showAIPanel)}
            className={`px-3 py-1 text-xs font-semibold rounded transition-colors ml-auto ${
              showAIPanel
                ? 'bg-purple-600 text-white'
                : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700'
            }`}
          >
            🤖 AI Assistant
          </button>
        </div>

        {/* AI Panel */}
        {showAIPanel && (
          <div className="mt-3 p-3 bg-white dark:bg-neutral-900 border border-purple-200 dark:border-purple-800 rounded-lg">
            <div className="space-y-3">
              {/* Action Selector */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  AI Action
                </label>
                <select
                  value={aiAction}
                  onChange={(e) => setAiAction(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                >
                  {aiActions.map((action) => (
                    <option key={action.value} value={action.value}>
                      {action.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Prompt Input (for generate action) */}
              {currentAction?.needsPrompt && (
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    What do you want to write about?
                  </label>
                  <textarea
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="e.g., 'Breaking news about AI technology', 'Analysis of climate change', etc."
                    className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 resize-none"
                    rows={3}
                  />
                </div>
              )}

              {/* Error Message */}
              {aiError && (
                <div className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                  {aiError}
                </div>
              )}

              {/* Generate Button */}
              <button
                type="button"
                onClick={handleAIGenerate}
                disabled={isAILoading}
                className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isAILoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Generating...
                  </span>
                ) : (
                  `${currentAction?.label}`
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Editor/Preview Area */}
      <div className="relative" style={{ minHeight }}>
        {!showPreview ? (
          /* Editor Mode */
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full p-4 font-mono text-sm bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 resize-none focus:outline-none"
            style={{ minHeight, lineHeight: '1.6' }}
          />
        ) : (
          /* Preview Mode */
          <div className="p-6 bg-white dark:bg-neutral-900 overflow-auto" style={{ minHeight }}>
            <div className="prose prose-lg dark:prose-invert max-w-none
              prose-headings:font-playfair 
              prose-h1:text-4xl prose-h1:font-black prose-h1:mb-4 prose-h1:mt-6
              prose-h2:text-3xl prose-h2:font-black prose-h2:mb-4 prose-h2:mt-6 prose-h2:border-b prose-h2:border-neutral-200 dark:prose-h2:border-neutral-700 prose-h2:pb-2
              prose-h3:text-2xl prose-h3:font-bold prose-h3:mb-3 prose-h3:mt-5
              prose-h4:text-xl prose-h4:font-bold prose-h4:mb-2 prose-h4:mt-4
              prose-p:text-base prose-p:leading-relaxed prose-p:mb-4 prose-p:text-neutral-800 dark:prose-p:text-neutral-200
              prose-strong:font-bold prose-strong:text-neutral-900 dark:prose-strong:text-white
              prose-em:italic
              prose-ul:my-4 prose-ul:list-disc prose-ul:list-outside prose-ul:ml-6
              prose-ol:my-4 prose-ol:list-decimal prose-ol:list-outside prose-ol:ml-6
              prose-li:mb-2 prose-li:text-neutral-800 dark:prose-li:text-neutral-200
              prose-blockquote:border-l-4 prose-blockquote:border-blue-600 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:my-4 prose-blockquote:bg-neutral-50 dark:prose-blockquote:bg-neutral-800 prose-blockquote:py-2
              prose-code:bg-neutral-100 dark:prose-code:bg-neutral-800 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm prose-code:text-pink-600 dark:prose-code:text-pink-400
              prose-pre:bg-neutral-900 prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto
              prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:underline hover:prose-a:text-blue-800
              prose-img:rounded-lg prose-img:shadow-lg
              prose-hr:my-8 prose-hr:border-neutral-300 dark:prose-hr:border-neutral-700
              prose-table:border-collapse prose-table:w-full
              prose-th:border prose-th:border-neutral-300 dark:prose-th:border-neutral-700 prose-th:bg-neutral-100 dark:prose-th:bg-neutral-800 prose-th:px-4 prose-th:py-2
              prose-td:border prose-td:border-neutral-300 dark:prose-td:border-neutral-700 prose-td:px-4 prose-td:py-2
            ">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {value || '*Nothing to preview yet. Start writing in markdown format...*'}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>

      {/* Character Count */}
      <div className="border-t border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 px-4 py-2 text-xs text-neutral-600 dark:text-neutral-400 flex justify-between items-center">
        <span>
          {value.length} characters · {value.split(/\s+/).filter(Boolean).length} words
        </span>
        <span className="text-neutral-400 dark:text-neutral-600">
          Markdown supported · Ctrl+B for bold · Ctrl+I for italic
        </span>
      </div>
    </div>
  )
}
