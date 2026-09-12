import { Article } from '@/types'

export interface ValidationError {
  field: string
  message: string
}

export interface ValidationResult<T> {
  isValid: boolean
  errors: ValidationError[]
  data?: T
}

export interface ValidatedArticleCreate {
  title: string
  slug?: string
  subtitle?: string
  excerpt: string
  content: string
  author: string
  category: string
  image_url: string
  imageUrl: string
  image_caption?: string
  imageCaption?: string
  video_url?: string | null
  videoUrl?: string | null
  featured: boolean
  is_breaking: boolean
  isBreaking: boolean
  status: 'draft' | 'published' | 'archived'
  homepage_position: number | null
  homepagePosition: number | null
  tags: string[]
  language: string
  published_at?: string
  publishedAt?: string
}

export interface ValidatedArticleUpdate {
  title?: string
  slug?: string
  subtitle?: string
  excerpt?: string
  content?: string
  author?: string
  category?: string
  image_url?: string
  imageUrl?: string
  image_caption?: string
  imageCaption?: string
  video_url?: string | null
  videoUrl?: string | null
  featured?: boolean
  is_breaking?: boolean
  isBreaking?: boolean
  status?: 'draft' | 'published' | 'archived'
  homepage_position?: number | null
  homepagePosition?: number | null
  tags?: string[]
  language?: string
  published_at?: string
  publishedAt?: string
}

/**
 * Extracts plain text excerpt from HTML or markdown content
 */
export function extractExcerpt(content: string, maxLength: number = 160): string {
  if (!content) return ''
  const plainText = content
    .replace(/<[^>]+>/g, ' ')
    .replace(/[#*`_~]/g, '')
    .replace(/\s+/g, ' ')
    .trim()

  if (plainText.length <= maxLength) return plainText
  return plainText.substring(0, maxLength).trim() + '...'
}

/**
 * Validates payload for creating a new article
 */
export function validateCreateArticle(payload: any): ValidationResult<ValidatedArticleCreate> {
  const errors: ValidationError[] = []

  if (!payload || typeof payload !== 'object') {
    return {
      isValid: false,
      errors: [{ field: 'body', message: 'Request payload must be a JSON object' }]
    }
  }

  // Required: title
  const title = typeof payload.title === 'string' ? payload.title.trim() : ''
  if (!title) {
    errors.push({ field: 'title', message: 'Title is required and cannot be empty' })
  } else if (title.length > 500) {
    errors.push({ field: 'title', message: 'Title must not exceed 500 characters' })
  }

  // Required: content
  const content = typeof payload.content === 'string' ? payload.content.trim() : ''
  if (!content) {
    errors.push({ field: 'content', message: 'Content is required and cannot be empty' })
  }

  // Required: author
  const author = typeof payload.author === 'string' ? payload.author.trim() : ''
  if (!author) {
    errors.push({ field: 'author', message: 'Author is required and cannot be empty' })
  }

  // Required: category
  const category = typeof payload.category === 'string' ? payload.category.trim() : ''
  if (!category) {
    errors.push({ field: 'category', message: 'Category is required and cannot be empty' })
  }

  // Excerpt
  let excerpt = typeof payload.excerpt === 'string' ? payload.excerpt.trim() : ''
  if (!excerpt && content) {
    excerpt = extractExcerpt(content, 160)
  }

  // Status: 'draft' | 'published' | 'archived', defaults to 'draft'
  let status: 'draft' | 'published' | 'archived' = 'draft'
  if (payload.status !== undefined) {
    if (!['draft', 'published', 'archived'].includes(payload.status)) {
      errors.push({ field: 'status', message: "Status must be 'draft', 'published', or 'archived'" })
    } else {
      status = payload.status
    }
  }

  // Image URL
  const imageUrl = payload.image_url || payload.imageUrl || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&fit=crop'
  const imageCaption = payload.image_caption || payload.imageCaption || ''
  const subtitle = payload.subtitle || ''
  const videoUrl = payload.video_url !== undefined ? payload.video_url : (payload.videoUrl !== undefined ? payload.videoUrl : null)
  const featured = Boolean(payload.featured)
  const isBreaking = Boolean(payload.is_breaking !== undefined ? payload.is_breaking : payload.isBreaking)

  // Homepage position
  let homepagePosition: number | null = null
  const rawPos = payload.homepage_position !== undefined ? payload.homepage_position : payload.homepagePosition
  if (rawPos !== undefined && rawPos !== null && rawPos !== '') {
    const num = Number(rawPos)
    if (isNaN(num) || !Number.isInteger(num) || num < 0 || num > 20) {
      errors.push({ field: 'homepage_position', message: 'Homepage position must be an integer between 0 and 20' })
    } else {
      homepagePosition = num
    }
  }

  // Tags
  let tags: string[] = []
  if (Array.isArray(payload.tags)) {
    tags = payload.tags.map((t: any) => String(t).trim()).filter(Boolean)
  } else if (typeof payload.tags === 'string') {
    tags = payload.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
  }

  let language = typeof payload.language === 'string' && payload.language ? payload.language : undefined
  if (!language) {
    language = /[\u0900-\u097F]/.test((title || '') + ' ' + (content || '')) ? 'hindi' : 'english'
  }
  const slug = typeof payload.slug === 'string' ? payload.slug.trim() : undefined

  // Published at
  const rawPubAt = payload.published_at || payload.publishedAt
  let publishedAt = typeof rawPubAt === 'string' && rawPubAt ? rawPubAt : undefined
  if (status === 'published' && !publishedAt) {
    publishedAt = new Date().toISOString()
  } else if (status === 'draft') {
    publishedAt = undefined
  }

  if (errors.length > 0) {
    return { isValid: false, errors }
  }

  return {
    isValid: true,
    errors: [],
    data: {
      title,
      slug,
      subtitle,
      excerpt,
      content,
      author,
      category,
      image_url: imageUrl,
      imageUrl: imageUrl,
      image_caption: imageCaption,
      imageCaption: imageCaption,
      video_url: videoUrl,
      videoUrl: videoUrl,
      featured,
      is_breaking: isBreaking,
      isBreaking: isBreaking,
      status,
      homepage_position: homepagePosition,
      homepagePosition: homepagePosition,
      tags,
      language,
      published_at: publishedAt,
      publishedAt: publishedAt,
    }
  }
}

/**
 * Validates payload for updating an existing article
 */
export function validateUpdateArticle(payload: any): ValidationResult<ValidatedArticleUpdate> {
  const errors: ValidationError[] = []

  if (!payload || typeof payload !== 'object') {
    return {
      isValid: false,
      errors: [{ field: 'body', message: 'Request payload must be a JSON object' }]
    }
  }

  const data: ValidatedArticleUpdate = {}

  if (payload.title !== undefined) {
    const title = typeof payload.title === 'string' ? payload.title.trim() : ''
    if (!title) {
      errors.push({ field: 'title', message: 'Title cannot be empty' })
    } else if (title.length > 500) {
      errors.push({ field: 'title', message: 'Title must not exceed 500 characters' })
    } else {
      data.title = title
    }
  }

  if (payload.content !== undefined) {
    const content = typeof payload.content === 'string' ? payload.content.trim() : ''
    if (!content) {
      errors.push({ field: 'content', message: 'Content cannot be empty' })
    } else {
      data.content = content
    }
  }

  if (payload.author !== undefined) {
    const author = typeof payload.author === 'string' ? payload.author.trim() : ''
    if (!author) {
      errors.push({ field: 'author', message: 'Author cannot be empty' })
    } else {
      data.author = author
    }
  }

  if (payload.category !== undefined) {
    const category = typeof payload.category === 'string' ? payload.category.trim() : ''
    if (!category) {
      errors.push({ field: 'category', message: 'Category cannot be empty' })
    } else {
      data.category = category
    }
  }

  if (payload.excerpt !== undefined) {
    data.excerpt = typeof payload.excerpt === 'string' ? payload.excerpt.trim() : ''
  }

  if (payload.status !== undefined) {
    if (!['draft', 'published', 'archived'].includes(payload.status)) {
      errors.push({ field: 'status', message: "Status must be 'draft', 'published', or 'archived'" })
    } else {
      data.status = payload.status
    }
  }

  const rawImg = payload.image_url !== undefined ? payload.image_url : payload.imageUrl
  if (rawImg !== undefined) {
    data.image_url = String(rawImg)
    data.imageUrl = String(rawImg)
  }

  const rawCaption = payload.image_caption !== undefined ? payload.image_caption : payload.imageCaption
  if (rawCaption !== undefined) {
    data.image_caption = String(rawCaption)
    data.imageCaption = String(rawCaption)
  }

  if (payload.subtitle !== undefined) {
    data.subtitle = String(payload.subtitle)
  }

  const rawVideo = payload.video_url !== undefined ? payload.video_url : payload.videoUrl
  if (rawVideo !== undefined) {
    data.video_url = rawVideo ? String(rawVideo) : null
    data.videoUrl = rawVideo ? String(rawVideo) : null
  }

  if (payload.featured !== undefined) {
    data.featured = Boolean(payload.featured)
  }

  const rawBreaking = payload.is_breaking !== undefined ? payload.is_breaking : payload.isBreaking
  if (rawBreaking !== undefined) {
    data.is_breaking = Boolean(rawBreaking)
    data.isBreaking = Boolean(rawBreaking)
  }

  const rawPos = payload.homepage_position !== undefined ? payload.homepage_position : payload.homepagePosition
  if (rawPos !== undefined) {
    if (rawPos === null || rawPos === '') {
      data.homepage_position = null
      data.homepagePosition = null
    } else {
      const num = Number(rawPos)
      if (isNaN(num) || !Number.isInteger(num) || num < 0 || num > 20) {
        errors.push({ field: 'homepage_position', message: 'Homepage position must be an integer between 0 and 20' })
      } else {
        data.homepage_position = num
        data.homepagePosition = num
      }
    }
  }

  if (payload.tags !== undefined) {
    if (Array.isArray(payload.tags)) {
      data.tags = payload.tags.map((t: any) => String(t).trim()).filter(Boolean)
    } else if (typeof payload.tags === 'string') {
      data.tags = payload.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
    }
  }

  if (payload.language !== undefined) {
    data.language = String(payload.language)
  } else if (payload.title !== undefined || payload.content !== undefined) {
    const textToCheck = `${payload.title || ''} ${payload.content || ''}`
    if (/[\u0900-\u097F]/.test(textToCheck)) {
      data.language = 'hindi'
    }
  }

  if (payload.slug !== undefined) {
    data.slug = String(payload.slug).trim()
  }

  const rawPubAt = payload.published_at !== undefined ? payload.published_at : payload.publishedAt
  if (rawPubAt !== undefined) {
    data.published_at = rawPubAt ? String(rawPubAt) : undefined
    data.publishedAt = rawPubAt ? String(rawPubAt) : undefined
  }

  if (errors.length > 0) {
    return { isValid: false, errors }
  }

  return { isValid: true, errors: [], data }
}

/**
 * Standardize article JSON representation to guarantee both snake_case and camelCase compatibility
 */
export function formatArticleResponse(article: any) {
  if (!article) return null
  const imageUrl = article.image_url || article.imageUrl || ''
  const imageCaption = article.image_caption || article.imageCaption || ''
  const videoUrl = article.video_url !== undefined ? article.video_url : (article.videoUrl !== undefined ? article.videoUrl : null)
  const isBreaking = Boolean(article.is_breaking !== undefined ? article.is_breaking : article.isBreaking)
  const homepagePosition = article.homepage_position !== undefined ? article.homepage_position : (article.homepagePosition ?? null)
  const createdAt = article.created_at || article.createdAt || new Date().toISOString()
  const updatedAt = article.updated_at || article.updatedAt || new Date().toISOString()
  const status = article.status || 'draft'
  const rawPub = article.published_at !== undefined ? article.published_at : article.publishedAt
  const publishedAt = (rawPub !== undefined && rawPub !== null && rawPub !== '')
    ? String(rawPub)
    : (status === 'published' ? createdAt : null)

  return {
    ...article,
    id: String(article.id),
    title: article.title,
    slug: article.slug,
    subtitle: article.subtitle || '',
    excerpt: article.excerpt || '',
    content: article.content || '',
    author: article.author || '',
    category: article.category || '',
    image_url: imageUrl,
    imageUrl: imageUrl,
    image_caption: imageCaption,
    imageCaption: imageCaption,
    video_url: videoUrl,
    videoUrl: videoUrl,
    featured: Boolean(article.featured),
    is_breaking: isBreaking,
    isBreaking: isBreaking,
    status: status,
    homepage_position: homepagePosition,
    homepagePosition: homepagePosition,
    tags: Array.isArray(article.tags) ? article.tags : [],
    language: article.language || 'english',
    created_at: createdAt,
    createdAt: createdAt,
    updated_at: updatedAt,
    updatedAt: updatedAt,
    published_at: publishedAt,
    publishedAt: publishedAt,
  }
}
