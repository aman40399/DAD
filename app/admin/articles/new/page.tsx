'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { generateSlug } from '@/lib/utils'
import ImageUploader from '@/components/ImageUploader'
import ImageEditor from '@/components/ImageEditor'
import AIRichTextEditor from '@/components/AIRichTextEditor'
import AISEOOptimizer from '@/components/AISEOOptimizer'
import { HOMEPAGE_POSITIONS } from '@/lib/homepage-positions'
import AdminLayout from '@/components/AdminLayout'

const CATEGORIES = ['World', 'Technology', 'Business', 'Local', 'Sports', 'Opinion', 'Arts', 'Science', 'Health', 'Politics']

export default function NewArticle() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(false)
  const [availablePositions, setAvailablePositions] = useState<number[]>([])
  const [showImageEditor, setShowImageEditor] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    author: 'Dhananjay Singh',
    category: CATEGORIES[0],
    imageUrl: '',
    videoUrl: '',
    featured: false,
    homepagePosition: 0, // 0 = archived, null would be unassigned
    tags: '',
    language: 'english', // Add language field
  })

  useEffect(() => {
    // Wait for session status to resolve. If unauthenticated, redirect to login.
    if (status === 'loading') return

    if (status === 'unauthenticated') {
      router.push('/admin')
      return
    }

    // Authenticated -> load available positions
    fetchAvailablePositions()
    
    // Check for imported article data from trending news
    checkForImportedArticle()
  }, [status, router])

  const checkForImportedArticle = () => {
    const importedData = localStorage.getItem('importedArticle')
    if (importedData) {
      try {
        const articleData = JSON.parse(importedData)
        setFormData(prev => ({
          ...prev,
          title: articleData.title || '',
          excerpt: articleData.excerpt || '',
          content: articleData.content || '',
          imageUrl: articleData.imageUrl || '',
          author: articleData.author || prev.author,
        }))
        // Clear the imported data
        localStorage.removeItem('importedArticle')
      } catch (error) {
        console.error('Error parsing imported article:', error)
      }
    }
  }

  const fetchAvailablePositions = async () => {
    try {
      const response = await fetch('/api/articles/available-positions')
      const data = await response.json()
      setAvailablePositions(data.positions || [])
    } catch (error) {
      console.error('Error fetching available positions:', error)
    }
  }

  // Removed legacy checkAuth

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.content) {
      alert('Title and content are required')
      return
    }

    setLoading(true)
    try {
      const slug = generateSlug(formData.title)
      const tags = formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : []

      console.log('Submitting article with imageUrl:', formData.imageUrl)

      const response = await fetch('/api/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          title: formData.title,
          slug,
          excerpt: formData.excerpt,
          content: formData.content,
          author: formData.author,
          category: formData.category,
          imageUrl: formData.imageUrl || null,
          videoUrl: formData.videoUrl || null,
          featured: formData.featured,
          tags,
          homepagePosition: formData.homepagePosition ?? 0,
        }),
      })

      console.log('Create article response status:', response.status)

      if (response.ok) {
        router.push('/admin/dashboard')
        router.refresh()
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to create article')
      }
    } catch (error) {
      console.error('Error creating article:', error)
      alert('Error creating article')
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = (url: string) => {
    console.log('Image uploaded, setting URL:', url)
    setFormData(prev => ({ ...prev, imageUrl: url }))
  }

  return (
    <AdminLayout>
      <div className="p-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">Create New Article</h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Fill in the details below to publish a new article
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white dark:bg-neutral-900 shadow-sm rounded-lg border border-neutral-200 dark:border-neutral-800 p-6 space-y-6">
          {/* Title */}
          <div className="mb-6">
            <label htmlFor="title" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 font-sans uppercase tracking-wider">
              Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-neutral-700 dark:text-white font-body text-lg"
              placeholder="Enter article title"
            />
            {formData.title && (
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 font-sans">
                Slug: {generateSlug(formData.title)}
              </p>
            )}
          </div>

          {/* Excerpt */}
          <div className="mb-6">
            <label htmlFor="excerpt" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 font-sans uppercase tracking-wider">
              Excerpt
            </label>
            <textarea
              id="excerpt"
              name="excerpt"
              value={formData.excerpt}
              onChange={handleChange}
              rows={2}
              className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-neutral-700 dark:text-white font-sans"
              placeholder="Brief summary of the article"
            />
          </div>

          {/* Content */}
          <div className="mb-6">
            <label htmlFor="content" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 font-sans uppercase tracking-wider">
              Article Content *
            </label>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-2">
              Use the AI Assistant to generate, enhance, or rewrite content. Rich text formatting with automatic heading sizes.
            </p>
            <AIRichTextEditor
              value={formData.content}
              onChange={(value: string) => setFormData(prev => ({ ...prev, content: value }))}
              placeholder="Write your article content... Use AI Assistant for help!"
              onTagsGenerated={(tags: string[]) => {
                // Update tags field with comma-separated tags
                setFormData(prev => ({ ...prev, tags: tags.join(', ') }))
              }}
            />
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Author - Hidden field, always Dhananjay Singh */}
            <input type="hidden" name="author" value="Dhananjay Singh" />

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 font-sans uppercase tracking-wider">
                Category *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-neutral-700 dark:text-white font-sans"
              >
                {CATEGORIES.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Image URL */}
          <div className="mb-6">
            <label htmlFor="imageUrl" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 font-sans uppercase tracking-wider">
              Article Image
            </label>
            
            {/* File Upload Section */}
            <div className="mb-4 p-4 bg-neutral-100 dark:bg-neutral-800 rounded-sm border border-neutral-300 dark:border-neutral-600">
              <p className="text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-2 uppercase tracking-wider">
                Option 1: Upload Image File
              </p>
              <ImageUploader onUpload={handleImageUpload} initialUrl={formData.imageUrl || null} />
            </div>

            {/* OR Divider */}
            <div className="flex items-center gap-4 my-4">
              <div className="flex-1 border-t border-neutral-300 dark:border-neutral-600"></div>
              <span className="text-sm text-neutral-500 dark:text-neutral-400 font-sans font-bold">OR</span>
              <div className="flex-1 border-t border-neutral-300 dark:border-neutral-600"></div>
            </div>

            {/* URL Input Section */}
            <div className="p-4 bg-neutral-100 dark:bg-neutral-800 rounded-sm border border-neutral-300 dark:border-neutral-600">
              <label htmlFor="imageUrl" className="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-2 uppercase tracking-wider">
                Option 2: Paste Image URL
              </label>
              <input
                type="url"
                id="imageUrl"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-neutral-700 dark:text-white font-sans"
                placeholder="https://example.com/image.jpg or paste Supabase URL"
              />
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 font-sans">
                Paste any image URL (Unsplash, Supabase, your CDN, etc.)
              </p>
            </div>

            {/* Image Preview */}
            {formData.imageUrl && (
              <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-sm border border-green-300 dark:border-green-700">
                <p className="text-xs font-bold text-green-700 dark:text-green-400 mb-2 uppercase tracking-wider">
                  ✓ Image Preview
                </p>
                <img 
                  src={formData.imageUrl} 
                  alt="Article preview" 
                  className="w-full max-h-64 object-cover rounded-sm border border-neutral-300 dark:border-neutral-600" 
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none'
                    alert('Failed to load image. Please check the URL.')
                  }}
                />
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowImageEditor(true)}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-sm hover:bg-blue-700 text-xs font-bold"
                  >
                    🎨 Edit Image
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
                    className="px-4 py-2 bg-red-600 text-white rounded-sm hover:bg-red-700 text-xs font-bold"
                  >
                    🗑️ Remove
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Video URL */}
          <div className="mb-6">
            <label htmlFor="videoUrl" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 font-sans uppercase tracking-wider">
              Video URL (YouTube / Pinterest)
            </label>
            <input
              type="text"
              id="videoUrl"
              name="videoUrl"
              value={formData.videoUrl}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-neutral-700 dark:text-white font-sans"
              placeholder="https://www.youtube.com/watch?v=... or https://www.pinterest.com/pin/..."
            />
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 font-sans">
              Enter YouTube URL, video ID, or Pinterest pin URL
            </p>
          </div>

          {/* Tags */}
          <div className="mb-6">
            <label htmlFor="tags" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 font-sans uppercase tracking-wider">
              Tags
            </label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-neutral-700 dark:text-white font-sans"
              placeholder="breaking news, investigation, analysis"
            />
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 font-sans">
              Separate tags with commas
            </p>
          </div>

          {/* AI SEO Optimizer */}
          {formData.title && formData.content && (
            <div className="mb-6">
              <AISEOOptimizer
                title={formData.title}
                content={formData.content}
                excerpt={formData.excerpt}
                category={formData.category}
                tags={formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : []}
                onOptimize={(optimized) => {
                  setFormData(prev => ({
                    ...prev,
                    title: optimized.title,
                    excerpt: optimized.excerpt,
                    content: optimized.content,
                    tags: optimized.tags.join(', ')
                  }))
                }}
              />
            </div>
          )}

          {/* Featured Checkbox */}
          <div className="mb-8">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="featured"
                checked={formData.featured}
                onChange={handleChange}
                className="w-5 h-5 border-neutral-300 dark:border-neutral-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="ml-3 text-sm font-bold text-gray-700 dark:text-gray-300 font-sans uppercase tracking-wider">
                Feature this article on homepage
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-6 border-t border-neutral-200 dark:border-neutral-700">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-blue-600 text-white font-bold text-sm rounded-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider font-sans"
            >
              {loading ? 'Publishing...' : 'Publish Article'}
            </button>
            <Link
              href="/admin/dashboard"
              className="px-8 py-3 bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-bold text-sm rounded-sm hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors uppercase tracking-wider font-sans"
            >
              Cancel
            </Link>
          </div>
        </form>

        {/* Image Editor Modal */}
        {showImageEditor && formData.imageUrl && (
          <ImageEditor
            imageUrl={formData.imageUrl}
            onSave={(editedImageUrl) => {
              setFormData(prev => ({ ...prev, imageUrl: editedImageUrl }))
              setShowImageEditor(false)
            }}
            onCancel={() => setShowImageEditor(false)}
          />
        )}
      </div>
    </AdminLayout>
  )
}
