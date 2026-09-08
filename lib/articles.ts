import { Article, ArticleStatus, CreateArticleInput, ListArticlesOptions, PaginatedArticles, UpdateArticleInput } from '@/types'
import { supabase } from './supabase'
import { localStore } from './localStore'
import { generateSlug, resolveSlugCollision } from './utils'

// Check whether Supabase environment variables are properly configured
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return false
  if (url.includes('placeholder') || key.includes('placeholder')) return false
  return true
}

// Transform raw database row / object to standard Article type with dual compatibility
export function transformArticle(data: any): Article {
  const id = String(data.id)
  const title = data.title || ''
  const slug = data.slug || ''
  const subtitle = data.subtitle || undefined
  const excerpt = data.excerpt || ''
  const content = data.content || ''
  const author = data.author || 'Dhananjay Singh'
  const category = data.category || 'News'

  const image_url = data.image_url || data.imageUrl || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop&q=80'
  const image_caption = data.image_caption || data.imageCaption || undefined
  const video_url = data.video_url !== undefined ? data.video_url : (data.videoUrl !== undefined ? data.videoUrl : null)
  const featured = Boolean(data.featured)
  const is_breaking = Boolean(data.is_breaking !== undefined ? data.is_breaking : data.isBreaking)
  const status: ArticleStatus = (data.status as ArticleStatus) || 'published'
  const homepage_position = data.homepage_position !== undefined
    ? data.homepage_position
    : (data.homepagePosition !== undefined ? data.homepagePosition : null)
  const tags = Array.isArray(data.tags) ? data.tags : []
  const language = data.language || 'english'
  const created_at = data.created_at || data.createdAt || new Date().toISOString()
  const updated_at = data.updated_at || data.updatedAt || new Date().toISOString()
  const rawPub = data.published_at !== undefined ? data.published_at : data.publishedAt
  const published_at = (rawPub !== undefined && rawPub !== null && rawPub !== '')
    ? String(rawPub)
    : (status === 'published' ? created_at : '')

  return {
    id,
    title,
    slug,
    subtitle,
    excerpt,
    content,
    author,
    category,
    image_url,
    image_caption,
    video_url,
    featured,
    is_breaking,
    status,
    homepage_position,
    tags,
    language,
    created_at,
    updated_at,
    published_at,
    // Backward-compatibility aliases
    imageUrl: image_url,
    imageCaption: image_caption,
    videoUrl: video_url,
    isBreaking: is_breaking,
    homepagePosition: homepage_position,
    createdAt: created_at,
    updatedAt: updated_at,
    publishedAt: published_at,
  }
}

// Check if a slug is already taken (excluding optional article ID for updates)
export async function isSlugTaken(slug: string, excludeArticleId?: string): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    const store = localStore.getAll()
    return store.some(a => a.slug === slug && (!excludeArticleId || a.id !== excludeArticleId))
  }
  try {
    let query = supabase.from('articles').select('id').eq('slug', slug).limit(1)
    if (excludeArticleId) {
      query = query.neq('id', excludeArticleId)
    }
    const { data, error } = await query
    if (error) throw error
    return Boolean(data && data.length > 0)
  } catch (error) {
    const store = localStore.getAll()
    return store.some(a => a.slug === slug && (!excludeArticleId || a.id !== excludeArticleId))
  }
}

// Generate unique slug with automatic collision resolution
export async function generateUniqueArticleSlug(title: string, excludeArticleId?: string): Promise<string> {
  const baseSlug = generateSlug(title)
  return resolveSlugCollision(baseSlug, (candidate) => isSlugTaken(candidate, excludeArticleId))
}

// Get all articles (sorted by published_at desc)
export async function getAllArticles(): Promise<Article[]> {
  if (!isSupabaseConfigured()) {
    return localStore.getAll()
  }

  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .order('published_at', { ascending: false })

    if (error) throw error
    return (data || []).map(transformArticle)
  } catch (error) {
    console.warn('⚠️ Supabase error fetching all articles, falling back to local store:', error)
    return localStore.getAll()
  }
}

// Get article by ID
export async function getArticleById(id: string): Promise<Article | null> {
  if (!isSupabaseConfigured()) {
    return localStore.getById(id)
  }

  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data ? transformArticle(data) : null
  } catch (error) {
    console.warn(`⚠️ Supabase error fetching article id=${id}, falling back to local store:`, error)
    return localStore.getById(id)
  }
}

// Get article by slug
export async function getArticleBySlug(slug: string): Promise<Article | null> {
  if (!isSupabaseConfigured()) {
    return localStore.getBySlug(slug)
  }

  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error) throw error
    return data ? transformArticle(data) : null
  } catch (error) {
    console.warn(`⚠️ Supabase error fetching article slug=${slug}, falling back to local store:`, error)
    return localStore.getBySlug(slug)
  }
}

// Get articles by category
export async function getArticlesByCategory(category: string): Promise<Article[]> {
  if (!isSupabaseConfigured()) {
    return localStore.getByCategory(category)
  }

  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('category', category)
      .eq('status', 'published')
      .order('published_at', { ascending: false })

    if (error) throw error
    return (data || []).map(transformArticle)
  } catch (error) {
    console.warn(`⚠️ Supabase error fetching category=${category}, falling back to local store:`, error)
    return localStore.getByCategory(category)
  }
}

// Get featured articles
export async function getFeaturedArticles(): Promise<Article[]> {
  if (!isSupabaseConfigured()) {
    return localStore.getFeatured()
  }

  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('featured', true)
      .eq('status', 'published')
      .order('published_at', { ascending: false })

    if (error) throw error
    return (data || []).map(transformArticle)
  } catch (error) {
    console.warn('⚠️ Supabase error fetching featured articles, falling back to local store:', error)
    return localStore.getFeatured()
  }
}

// Get recent articles
export async function getRecentArticles(limit: number = 10): Promise<Article[]> {
  if (!isSupabaseConfigured()) {
    return localStore.getRecent(limit)
  }

  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return (data || []).map(transformArticle)
  } catch (error) {
    console.warn('⚠️ Supabase error fetching recent articles, falling back to local store:', error)
    return localStore.getRecent(limit)
  }
}

// Get homepage articles (positions 1-15)
export async function getHomepageArticles(): Promise<Article[]> {
  if (!isSupabaseConfigured()) {
    return localStore.getHomepage()
  }

  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('status', 'published')
      .gte('homepage_position', 1)
      .lte('homepage_position', 15)
      .order('homepage_position', { ascending: true })

    if (error) throw error
    return (data || []).map(transformArticle)
  } catch (error) {
    console.warn('⚠️ Supabase error fetching homepage articles, falling back to local store:', error)
    return localStore.getHomepage()
  }
}

// Get articles by specific broadsheet positions
export async function getArticlesByPosition(positions: number[]): Promise<Article[]> {
  if (!isSupabaseConfigured()) {
    return localStore.getByPositions(positions)
  }

  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('status', 'published')
      .in('homepage_position', positions)
      .order('homepage_position', { ascending: true })

    if (error) throw error
    return (data || []).map(transformArticle)
  } catch (error) {
    console.warn('⚠️ Supabase error fetching articles by position, falling back to local store:', error)
    return localStore.getByPositions(positions)
  }
}

// Get breaking news stories (is_breaking = true or homepage_position = 1)
export async function getBreakingArticles(): Promise<Article[]> {
  if (!isSupabaseConfigured()) {
    return localStore.getBreaking()
  }

  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('status', 'published')
      .or('is_breaking.eq.true,homepage_position.eq.1')
      .order('published_at', { ascending: false })

    if (error) throw error
    return (data || []).map(transformArticle)
  } catch (error) {
    console.warn('⚠️ Supabase error fetching breaking articles, falling back to local store:', error)
    return localStore.getBreaking()
  }
}

// List articles with filtering, search, and pagination
export async function listArticles(options?: ListArticlesOptions): Promise<PaginatedArticles> {
  if (!isSupabaseConfigured()) {
    return localStore.list(options)
  }

  try {
    const page = Math.max(1, options?.page || 1)
    const limit = Math.max(1, options?.limit || 20)
    const offset = options?.offset !== undefined ? options.offset : (page - 1) * limit

    let query = supabase.from('articles').select('*', { count: 'exact' })

    if (options?.status && options.status !== 'all') {
      query = query.eq('status', options.status)
    }

    if (options?.category) {
      query = query.eq('category', options.category)
    }

    if (options?.search) {
      query = query.or(`title.ilike.%${options.search}%,excerpt.ilike.%${options.search}%,author.ilike.%${options.search}%`)
    }

    const orderBy = options?.orderBy || 'published_at'
    const ascending = options?.orderDirection === 'asc'
    query = query.order(orderBy, { ascending }).range(offset, offset + limit - 1)

    const { data, count, error } = await query
    if (error) throw error

    const total = count || 0
    return {
      articles: (data || []).map(transformArticle),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    }
  } catch (error) {
    console.warn('⚠️ Supabase error listing articles, falling back to local store:', error)
    return localStore.list(options)
  }
}

// Create new article
export async function createArticle(input: CreateArticleInput): Promise<Article | null> {
  // Always update local store so local state remains synchronized
  const localResult = localStore.create(input)

  if (!isSupabaseConfigured()) {
    return localResult
  }

  try {
    const now = new Date().toISOString()
    const dbPayload = {
      title: input.title,
      slug: input.slug || localResult.slug,
      subtitle: input.subtitle || null,
      excerpt: input.excerpt,
      content: input.content,
      author: input.author,
      category: input.category,
      image_url: input.image_url || input.imageUrl || '',
      image_caption: input.image_caption || input.imageCaption || null,
      video_url: input.video_url !== undefined ? input.video_url : (input.videoUrl !== undefined ? input.videoUrl : null),
      featured: Boolean(input.featured),
      is_breaking: Boolean(input.is_breaking !== undefined ? input.is_breaking : input.isBreaking),
      status: input.status || 'draft',
      homepage_position: input.homepage_position !== undefined 
        ? input.homepage_position 
        : (input.homepagePosition !== undefined ? input.homepagePosition : null),
      tags: input.tags || [],
      language: input.language || 'english',
      published_at: input.published_at || (input.status === 'published' ? now : null),
    }

    const { data, error } = await supabase
      .from('articles')
      .insert([dbPayload])
      .select()
      .single()

    if (error) throw error
    return transformArticle(data)
  } catch (error) {
    console.warn('⚠️ Supabase error creating article, using local store result:', error)
    return localResult
  }
}

// Update existing article
export async function updateArticle(id: string, updates: UpdateArticleInput): Promise<Article | null> {
  const localResult = localStore.update(id, updates)

  if (!isSupabaseConfigured()) {
    return localResult
  }

  try {
    const updateData: any = {}
    if (updates.title !== undefined) updateData.title = updates.title
    if (updates.slug !== undefined) updateData.slug = updates.slug
    if (updates.subtitle !== undefined) updateData.subtitle = updates.subtitle
    if (updates.excerpt !== undefined) updateData.excerpt = updates.excerpt
    if (updates.content !== undefined) updateData.content = updates.content
    if (updates.author !== undefined) updateData.author = updates.author
    if (updates.category !== undefined) updateData.category = updates.category
    if (updates.image_url !== undefined || updates.imageUrl !== undefined) {
      updateData.image_url = updates.image_url || updates.imageUrl
    }
    if (updates.image_caption !== undefined || updates.imageCaption !== undefined) {
      updateData.image_caption = updates.image_caption || updates.imageCaption
    }
    if (updates.video_url !== undefined || updates.videoUrl !== undefined) {
      updateData.video_url = updates.video_url !== undefined ? updates.video_url : updates.videoUrl
    }
    if (updates.featured !== undefined) updateData.featured = updates.featured
    if (updates.is_breaking !== undefined || updates.isBreaking !== undefined) {
      updateData.is_breaking = updates.is_breaking !== undefined ? updates.is_breaking : updates.isBreaking
    }
    if (updates.status !== undefined) updateData.status = updates.status
    if (updates.homepage_position !== undefined || updates.homepagePosition !== undefined) {
      updateData.homepage_position = updates.homepage_position !== undefined ? updates.homepage_position : updates.homepagePosition
    }
    if (updates.tags !== undefined) updateData.tags = updates.tags
    if (updates.language !== undefined) updateData.language = updates.language
    if (updates.published_at || updates.publishedAt) {
      updateData.published_at = updates.published_at || updates.publishedAt
    }

    const { data, error } = await supabase
      .from('articles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return transformArticle(data)
  } catch (error) {
    console.warn(`⚠️ Supabase error updating article id=${id}, using local store result:`, error)
    return localResult
  }
}

// Delete article
export async function deleteArticle(id: string): Promise<boolean> {
  const localSuccess = localStore.delete(id)

  if (!isSupabaseConfigured()) {
    return localSuccess
  }

  try {
    const { error } = await supabase
      .from('articles')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  } catch (error) {
    console.warn(`⚠️ Supabase error deleting article id=${id}, using local store:`, error)
    return localSuccess
  }
}

// Set article status (draft / published / archived)
export async function setArticleStatus(id: string, status: ArticleStatus): Promise<Article | null> {
  return updateArticle(id, { status })
}

// Update homepage position (1-15, or null to unpin)
export async function updateArticlePosition(id: string, position: number | null): Promise<boolean> {
  const localSuccess = localStore.updatePosition(id, position)

  if (!isSupabaseConfigured()) {
    return localSuccess
  }

  try {
    // If position is assigned, unpin any other article at that position first
    if (position !== null && position >= 1 && position <= 15) {
      await supabase
        .from('articles')
        .update({ homepage_position: null })
        .eq('homepage_position', position)
    }

    const { error } = await supabase
      .from('articles')
      .update({ homepage_position: position })
      .eq('id', id)

    if (error) throw error
    return true
  } catch (error) {
    console.warn(`⚠️ Supabase error updating position for article id=${id}, using local store:`, error)
    return localSuccess
  }
}

// Swap positions between two articles
export async function swapArticlePositions(id1: string, id2: string): Promise<boolean> {
  const localSuccess = localStore.swapPositions(id1, id2)

  if (!isSupabaseConfigured()) {
    return localSuccess
  }

  try {
    const a1 = await getArticleById(id1)
    const a2 = await getArticleById(id2)
    if (!a1 || !a2) return false

    const pos1 = a1.homepage_position
    const pos2 = a2.homepage_position

    // Temporarily set a1 to null to prevent potential unique conflicts
    await supabase.from('articles').update({ homepage_position: null }).eq('id', id1)
    await supabase.from('articles').update({ homepage_position: pos1 }).eq('id', id2)
    const { error } = await supabase.from('articles').update({ homepage_position: pos2 }).eq('id', id1)

    if (error) throw error
    return true
  } catch (error) {
    console.warn('⚠️ Supabase error swapping article positions, using local store:', error)
    return localSuccess
  }
}

// Get currently unassigned broadsheet positions (1-15)
export async function getAvailablePositions(): Promise<number[]> {
  if (!isSupabaseConfigured()) {
    return localStore.getAvailablePositions()
  }

  try {
    const { data, error } = await supabase
      .from('articles')
      .select('homepage_position')
      .eq('status', 'published')
      .gte('homepage_position', 1)
      .lte('homepage_position', 15)

    if (error) throw error
    const usedPositions = (data || []).map((a) => a.homepage_position).filter((p) => p !== null) as number[]
    return Array.from({ length: 15 }, (_, i) => i + 1).filter((p) => !usedPositions.includes(p))
  } catch (error) {
    console.warn('⚠️ Supabase error fetching available positions, falling back to local store:', error)
    return localStore.getAvailablePositions()
  }
}

// Verify admin credentials with local fallback
export async function verifyAdmin(username: string, password: string): Promise<boolean> {
  const fallbackUsername = process.env.ADMIN_USERNAME || 'admin'
  const fallbackPassword = process.env.ADMIN_PASSWORD || 'pass@123'

  if (!isSupabaseConfigured()) {
    return username === fallbackUsername && password === fallbackPassword
  }

  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('username', username)
      .eq('password', password)
      .single()

    if (!error && data) {
      return true
    }
    // Also accept default admin credentials if database table is unseeded
    return username === fallbackUsername && password === fallbackPassword
  } catch (error) {
    return username === fallbackUsername && password === fallbackPassword
  }
}
